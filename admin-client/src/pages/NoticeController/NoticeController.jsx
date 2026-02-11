// src/pages/NoticeController/NoticeController.jsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const fetchNotice = async () => {
  const { data } = await api.get("/api/notice");
  return data;
};

const updateNotice = async (payload) => {
  const { data } = await api.put("/api/notice", payload);
  return data;
};

const NoticeController = () => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      noticeBn: "",
      noticeEn: "",
      isActive: true,
    },
  });

  const {
    data: notice,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notice"],
    queryFn: fetchNotice,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (notice) {
      reset({
        noticeBn: notice.noticeBn || "",
        noticeEn: notice.noticeEn || "",
        isActive: notice.isActive ?? true,
      });
    }
  }, [notice, reset]);

  const mutation = useMutation({
    mutationFn: updateNotice,
    onSuccess: (res) => {
      toast.success(res?.message || "Notice updated!");
      queryClient.invalidateQueries({ queryKey: ["notice"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || "Update failed");
    },
  });

  const onSubmit = (values) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-black via-yellow-950/10 to-black">
        <div className="text-yellow-100 font-bold">Loading notice...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-black via-yellow-950/10 to-black">
        <div className="text-red-400 font-bold">Failed to load notice</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-gradient-to-br from-black via-yellow-950/10 to-black">
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-b from-black via-yellow-950/30 to-black border border-yellow-700/40 rounded-xl p-4 lg:p-8 shadow-lg shadow-yellow-900/30">
        <h2 className="text-white font-extrabold text-lg sm:text-xl lg:text-2xl mb-4 sm:mb-6 tracking-tight">
          Notice Controller
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-6"
        >
          {/* Bangla */}
          <div>
            <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
              Notice Text (Bangla)
            </label>
            <textarea
              rows={4}
              className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-3 sm:p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all placeholder-yellow-500/60 resize-y"
              placeholder="বাংলা নোটিশ লিখো..."
              {...register("noticeBn", { required: true })}
            />
          </div>

          {/* English */}
          <div>
            <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
              Notice Text (English)
            </label>
            <textarea
              rows={4}
              className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-3 sm:p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all placeholder-yellow-500/60 resize-y"
              placeholder="Write English notice..."
              {...register("noticeEn", { required: true })}
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              className="w-5 h-5 accent-yellow-500 rounded focus:ring-yellow-400/40 cursor-pointer"
              {...register("isActive")}
            />
            <label
              htmlFor="isActive"
              className="text-yellow-100 font-bold cursor-pointer"
            >
              Active (Client এ দেখাবে)
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="w-full flex items-center justify-center gap-3 py-3 sm:py-3.5 px-5 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-xl text-black font-medium transition-all duration-300 shadow-lg shadow-yellow-600/50 hover:shadow-yellow-500/70 border border-yellow-500/30 disabled:opacity-60 cursor-pointer"
          >
            {mutation.isPending ? "Saving..." : "Save Notice"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NoticeController;
