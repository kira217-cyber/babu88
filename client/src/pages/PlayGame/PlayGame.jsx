import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectIsActiveUser,
  selectIsAuthenticated,
  selectToken,
} from "../../features/auth/authSelectors";
import Loading from "../../components/Loading/Loading";

const API_URL = import.meta.env.VITE_API_URL;

const fetchMyBalance = async (token) => {
  const { data } = await axios.get(`${API_URL}/api/users/me/balance`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

const PlayGame = () => {
  const { isBangla } = useLanguage();

  const t = (bn, en) => (isBangla ? bn : en);

  const navigate = useNavigate();
  const { gameId } = useParams();

  const isAuth = useSelector(selectIsAuthenticated);
  const isActive = useSelector(selectIsActiveUser);
  const token = useSelector(selectToken);

  const [gameUrl, setGameUrl] = useState("");
  const [isNewTabGame, setIsNewTabGame] = useState(false);
  const [isDirectRedirecting, setIsDirectRedirecting] = useState(false);

  /* =====================================================
     USER BALANCE
  ===================================================== */

  const {
    data: balData,
    isFetching: balFetching,
    isError: balError,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ["my-balance", token],
    queryFn: () => fetchMyBalance(token),
    enabled: Boolean(token && isAuth),
    staleTime: 0,
    cacheTime: 1000 * 60 * 5,
    retry: 1,
  });

  const balance = useMemo(() => {
    const amount = Number(balData?.balance || 0);

    return Number.isFinite(amount) && amount > 0 ? amount : 0;
  }, [balData?.balance]);

  /* =====================================================
     PLAY GAME REQUEST
  ===================================================== */

  const playMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${API_URL}/api/play-game/playgame`,
        {
          game_uid: gameId,
          gameID: gameId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    },

    onSuccess: (data) => {
      const launchUrl =
        data?.directOpenUrl ||
        data?.gameUrl ||
        data?.launch_url ||
        data?.game_url ||
        "";

      const provider = String(data?.provider || "")
        .trim()
        .toLowerCase();

      const openType = String(data?.openType || "")
        .trim()
        .toLowerCase();

      if (!launchUrl) {
        toast.error(t("গেম URL পাওয়া যায়নি", "No game URL received"));

        navigate("/");
        return;
      }

      /* =================================================
         NINE WICKET

         iframe নয়
         new tab নয়
         current tab সরাসরি provider URL-এ যাবে
      ================================================= */

      if (provider === "ninewicket") {
        setGameUrl("");
        setIsNewTabGame(false);
        setIsDirectRedirecting(true);

        window.location.assign(launchUrl);

        return;
      }

      /* =================================================
         OTHER NEW-TAB GAMES
      ================================================= */

      if (openType === "new_tab") {
        setGameUrl("");
        setIsNewTabGame(true);
        setIsDirectRedirecting(false);

        window.open(launchUrl, "_blank", "noopener,noreferrer");

        toast.success(
          t("গেম নতুন ট্যাবে ওপেন হয়েছে", "Game opened in a new tab"),
        );

        navigate("/");
        return;
      }

      /* =================================================
         OTHER IFRAME GAMES
      ================================================= */

      setIsNewTabGame(false);
      setIsDirectRedirecting(false);
      setGameUrl(launchUrl);
    },

    onError: (error) => {
      setGameUrl("");
      setIsNewTabGame(false);
      setIsDirectRedirecting(false);

      toast.error(
        error?.response?.data?.message ||
          t("গেম চালু হয়নি", "Failed to start game"),
      );

      navigate("/");
    },
  });

  /* =====================================================
     VALIDATE AND START GAME
  ===================================================== */

  useEffect(() => {
    if (!isAuth || !token) {
      toast.error(t("খেলতে লগইন করুন", "Please login to play"));

      navigate("/login");
      return;
    }

    if (!isActive) {
      toast.error(
        t("আপনার একাউন্ট অ্যাক্টিভ নয়", "Your account is not active"),
      );

      navigate("/");
      return;
    }

    if (!gameId) {
      toast.error(t("গেম আইডি পাওয়া যায়নি", "Game id not found"));

      navigate("/");
      return;
    }

    if (balError) {
      toast.error(t("ব্যালেন্স পাওয়া যায়নি", "Failed to fetch balance"));

      return;
    }

    if (balFetching) return;

    if (balance <= 0) {
      toast.error(
        t("ব্যালেন্স নেই, ডিপোজিট করুন", "No balance, please deposit"),
      );

      navigate("/profile/deposit");
      return;
    }

    if (
      !gameUrl &&
      !playMutation.isPending &&
      !isNewTabGame &&
      !isDirectRedirecting
    ) {
      playMutation.mutate();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuth,
    token,
    isActive,
    gameId,
    balFetching,
    balError,
    balance,
    isNewTabGame,
    isDirectRedirecting,
  ]);

  /* =====================================================
     CLOSE IFRAME GAME
  ===================================================== */

  const closeGame = () => {
    setGameUrl("");
    setIsNewTabGame(false);
    setIsDirectRedirecting(false);

    navigate("/");
  };

  /* =====================================================
     LOADING STATE
  ===================================================== */

  const isLoading =
    balFetching ||
    playMutation.isPending ||
    isDirectRedirecting ||
    (!gameUrl && !isNewTabGame);

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Close button only for iframe games */}
      {!isNewTabGame && !isDirectRedirecting && gameUrl && (
        <button
          type="button"
          onClick={closeGame}
          className="fixed right-4 top-4 z-[10000] cursor-pointer rounded-full bg-black/30 p-2 text-white shadow-lg md:top-8"
          title={t("বন্ধ করুন", "Close")}
          aria-label={t("বন্ধ করুন", "Close")}
        >
          <FaTimes size={22} />
        </button>
      )}

      <Loading
        open={isLoading}
        text={
          isDirectRedirecting
            ? t("নাইন উইকেট ওপেন হচ্ছে...", "Opening NineWicket...")
            : balFetching
              ? t("ব্যালেন্স যাচাই হচ্ছে...", "Checking balance...")
              : t("গেম লোড হচ্ছে...", "Loading game...")
        }
      />

      {isLoading ? (
        <div className="pointer-events-none fixed inset-0 z-[1000000] flex items-end justify-center pb-10">
          {!isDirectRedirecting && (
            <button
              type="button"
              onClick={() => refetchBalance()}
              disabled={!token || balFetching || playMutation.isPending}
              className="pointer-events-auto rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-60"
            >
              {t("রিফ্রেশ", "Refresh")}
            </button>
          )}
        </div>
      ) : (
        gameUrl &&
        !isNewTabGame &&
        !isDirectRedirecting && (
          <iframe
            src={gameUrl}
            title="Game"
            className="h-full w-full border-0"
            allow="fullscreen"
            allowFullScreen
          />
        )
      )}
    </div>
  );
};

export default PlayGame;
