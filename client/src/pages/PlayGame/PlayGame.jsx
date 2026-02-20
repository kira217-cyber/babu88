import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaTimes, FaSpinner } from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectIsActiveUser,
  selectIsAuthenticated,
  selectToken,
} from "../../features/auth/authSelectors";

// ✅ balance fetch (direct API) — same as your Balance component
const fetchMyBalance = async (token) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/users/me/balance`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data; // { balance, currency }
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

  // ✅ Balance query (direct API)
  const {
    data: balData,
    isFetching: balFetching,
    isError: balError,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ["my-balance", token],
    queryFn: () => fetchMyBalance(token),
    enabled: !!token && isAuth,
    staleTime: 0, // ✅ always latest
    cacheTime: 1000 * 60 * 5,
    retry: 1,
  });

  const balance = useMemo(() => {
    return Number(balData?.balance || 0);
  }, [balData?.balance]);

  // ✅ Play API call
  const playMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/play-game/playgame`,
        { gameID: gameId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.gameUrl) setGameUrl(data.gameUrl);
      else toast.error(t("গেম URL পাওয়া যায়নি", "No game URL received"));
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          t("গেম চালু হয়নি", "Failed to start game"),
      );
      navigate("/");
    },
  });

  // ✅ Guard + balance check (API based)
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

    // balance API error
    if (balError) {
      toast.error(t("ব্যালেন্স পাওয়া যায়নি", "Failed to fetch balance"));
      // চাইলে login/home এ পাঠাতে পারো
      // navigate("/login");
      return;
    }

    // balance fetching থাকলে কিছু করবো না
    if (balFetching) return;

    // balance <= 0 -> deposit
    if (balance <= 0) {
      toast.error(
        t("ব্যালেন্স নেই, ডিপোজিট করুন", "No balance, please deposit"),
      );
      navigate("/profile/deposit");
      return;
    }

    // ✅ all ok -> launch game
    if (!gameUrl && !playMutation.isPending) {
      playMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, token, isActive, gameId, balFetching, balError, balance]);

  const closeGame = () => {
    setGameUrl("");
    navigate("/");
  };

  return (
    <div className="fixed inset-0 bg-black z-[9999]">
      {/* Close */}
      <button
        onClick={closeGame}
        className="fixed top-4 right-4 z-[10000] text-white bg-red-600 hover:bg-red-700 p-3 rounded-full cursor-pointer shadow-lg"
        title={t("বন্ধ করুন", "Close")}
      >
        <FaTimes size={22} />
      </button>

      {/* Loader */}
      {balFetching || playMutation.isPending || !gameUrl ? (
        <div className="flex items-center justify-center w-full h-full">
          <div className="flex flex-col items-center gap-3">
            <FaSpinner className="animate-spin text-5xl text-white" />
            <div className="text-white/80 text-sm">
              {balFetching
                ? t("ব্যালেন্স যাচাই হচ্ছে...", "Checking balance...")
                : t("গেম লোড হচ্ছে...", "Loading game...")}
            </div>

            {/* Optional refresh */}
            <button
              type="button"
              onClick={() => refetchBalance()}
              disabled={!token || balFetching}
              className="mt-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/15 hover:bg-white/15 disabled:opacity-60"
            >
              {t("রিফ্রেশ", "Refresh")}
            </button>
          </div>
        </div>
      ) : (
        <iframe
          src={gameUrl}
          title="Game"
          className="w-full h-full border-0"
          allow="fullscreen"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default PlayGame;
