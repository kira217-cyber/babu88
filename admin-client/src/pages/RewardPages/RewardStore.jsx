// src/pages/Reward/RewardStore.jsx

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const initialForm = {
  titleBn: "",
  titleEn: "",
  descriptionBn: "",
  descriptionEn: "",
  conditionType: "deposit",
  calculationPeriod: "campaign",
  requiredAmount: "",
  rewardAmount: "",
  turnoverMultiplier: "",
  startAt: "",
  endAt: "",
  order: "0",
  status: "active",
};

const RewardStore = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentImage, setCurrentImage] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const conditionTypes = [
    {
      value: "deposit",
      label: "Deposit Amount",
    },
    {
      value: "turnover",
      label: "Completed Turnover",
    },
    {
      value: "game_loss",
      label: "Game Loss",
    },
  ];

  const calculationPeriods = [
    {
      value: "campaign",
      label: "Campaign",
    },
    {
      value: "lifetime",
      label: "Lifetime",
    },
  ];

  const resolveImage = (image = "") => {
    if (!image) return "";

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    const baseUrl = import.meta.env.VITE_API_URL || "";

    return `${baseUrl}${image.startsWith("/") ? image : `/${image}`}`;
  };

  const formatDateForInput = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    const offset = parsed.getTimezoneOffset();
    const localDate = new Date(parsed.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatMoney = (amount) => {
    return `৳${Number(amount || 0).toLocaleString()}`;
  };

  const getConditionLabel = (type) => {
    return conditionTypes.find((item) => item.value === type)?.label || type;
  };

  const loadRewards = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/admin/rewards");

      setRewards(data?.rewards || []);
    } catch (error) {
      setRewards([]);

      toast.error(error?.response?.data?.message || "Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);

    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  const filteredRewards = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return rewards.filter((reward) => {
      const matchesSearch =
        !normalizedSearch ||
        reward.title?.bn?.toLowerCase().includes(normalizedSearch) ||
        reward.title?.en?.toLowerCase().includes(normalizedSearch) ||
        reward.description?.bn?.toLowerCase().includes(normalizedSearch) ||
        reward.description?.en?.toLowerCase().includes(normalizedSearch);

      const matchesType =
        typeFilter === "all" || reward.conditionType === typeFilter;

      const matchesStatus =
        statusFilter === "all" || reward.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rewards, search, typeFilter, statusFilter]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size cannot be greater than 10MB");
      return;
    }

    setImageFile(file);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setImageFile(null);
    setPreviewUrl("");
    setCurrentImage("");
  };

  const startEdit = (reward) => {
    setEditingId(reward._id);

    setForm({
      titleBn: reward.title?.bn || "",
      titleEn: reward.title?.en || "",

      descriptionBn: reward.description?.bn || "",

      descriptionEn: reward.description?.en || "",

      conditionType: reward.conditionType || "deposit",

      calculationPeriod: reward.calculationPeriod || "campaign",

      requiredAmount: String(reward.requiredAmount ?? ""),

      rewardAmount: String(reward.rewardAmount ?? ""),

      turnoverMultiplier: String(reward.turnoverMultiplier ?? ""),

      startAt: formatDateForInput(reward.startAt),

      endAt: formatDateForInput(reward.endAt),

      order: String(reward.order ?? 0),
      status: reward.status || "active",
    });

    setImageFile(null);
    setPreviewUrl("");
    setCurrentImage(reward.bannerImage || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const validateForm = () => {
    if (!form.titleBn.trim()) {
      toast.error("Bangla title is required");
      return false;
    }

    if (!form.titleEn.trim()) {
      toast.error("English title is required");
      return false;
    }

    if (!editingId && !imageFile) {
      toast.error("Reward banner is required");
      return false;
    }

    if (Number(form.requiredAmount) < 0 || form.requiredAmount === "") {
      toast.error("Enter a valid required amount");
      return false;
    }

    if (Number(form.rewardAmount) < 0 || form.rewardAmount === "") {
      toast.error("Enter a valid reward amount");
      return false;
    }

    if (Number(form.turnoverMultiplier) < 0 || form.turnoverMultiplier === "") {
      toast.error("Enter a valid turnover multiplier");
      return false;
    }

    if (form.calculationPeriod === "campaign") {
      if (!form.startAt || !form.endAt) {
        toast.error("Campaign start and end date are required");
        return false;
      }

      if (new Date(form.endAt) <= new Date(form.startAt)) {
        toast.error("Campaign end date must be later than start date");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("titleBn", form.titleBn.trim());

      formData.append("titleEn", form.titleEn.trim());

      formData.append("descriptionBn", form.descriptionBn.trim());

      formData.append("descriptionEn", form.descriptionEn.trim());

      formData.append("conditionType", form.conditionType);

      formData.append("calculationPeriod", form.calculationPeriod);

      formData.append("requiredAmount", form.requiredAmount);

      formData.append("rewardAmount", form.rewardAmount);

      formData.append("turnoverMultiplier", form.turnoverMultiplier);

      formData.append("claimType", "once");
      formData.append("order", form.order || "0");
      formData.append("status", form.status);

      if (form.calculationPeriod === "campaign") {
        formData.append("startAt", form.startAt);
        formData.append("endAt", form.endAt);
      }

      if (imageFile) {
        formData.append("bannerImage", imageFile);
      }

      if (editingId && currentImage) {
        formData.append("imageUrl", currentImage);
      }

      if (editingId) {
        await api.put(`/api/admin/rewards/${editingId}`, formData);

        toast.success("Reward updated successfully");
      } else {
        await api.post("/api/admin/rewards", formData);

        toast.success("Reward created successfully");
      }

      resetForm();
      await loadRewards();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to save reward",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (reward) => {
    const nextStatus = reward.status === "active" ? "inactive" : "active";

    try {
      setStatusUpdatingId(reward._id);

      const { data } = await api.patch(
        `/api/admin/rewards/${reward._id}/status`,
        {
          status: nextStatus,
        },
      );

      setRewards((previous) =>
        previous.map((item) => (item._id === reward._id ? data.reward : item)),
      );

      toast.success(`Reward ${nextStatus} successfully`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      setDeleting(true);

      await api.delete(`/api/admin/rewards/${deleteConfirmId}`);

      setRewards((previous) =>
        previous.filter((item) => item._id !== deleteConfirmId),
      );

      if (editingId === deleteConfirmId) {
        resetForm();
      }

      toast.success("Reward deleted successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete reward");
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const displayedImage =
    previewUrl || (currentImage ? resolveImage(currentImage) : "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black p-4 text-white lg:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent lg:text-3xl">
            {editingId ? "Update Reward" : "Create New Reward"}
          </h1>

          <p className="mt-2 text-sm text-yellow-100/60">
            Create deposit, turnover or game-loss rewards for your users.
          </p>
        </div>

        {/* Reward form */}
        <form
          onSubmit={handleSubmit}
          className="mb-10 rounded-2xl border border-yellow-700/40 bg-black/60 p-5 shadow-2xl shadow-yellow-900/30 backdrop-blur-md lg:p-8"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Banner */}
            <div>
              <label className="mb-2 block text-sm font-medium text-yellow-300/90">
                Reward Banner Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full cursor-pointer rounded-xl border border-yellow-700/40 bg-black/50 px-4 py-3 text-white file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-yellow-600/80 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-yellow-500"
              />

              <p className="mt-2 text-xs text-yellow-400/60">
                PNG, JPG, WEBP, AVIF, SVG or GIF. Maximum size 10MB.
              </p>

              {displayedImage && (
                <div className="mt-4 overflow-hidden rounded-xl border border-yellow-700/50 bg-black/50">
                  <img
                    src={displayedImage}
                    alt="Reward preview"
                    className="h-52 w-full object-cover"
                    draggable={false}
                  />
                </div>
              )}
            </div>

            {/* Basic settings */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-yellow-300/90">
                  Requirement Type
                </label>

                <select
                  name="conditionType"
                  value={form.conditionType}
                  onChange={handleInputChange}
                  className="w-full cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-3 text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
                >
                  {conditionTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-yellow-300/90">
                  Calculation Period
                </label>

                <select
                  name="calculationPeriod"
                  value={form.calculationPeriod}
                  onChange={handleInputChange}
                  className="w-full cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-3 text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
                >
                  {calculationPeriods.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-yellow-300/90">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="w-full cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-3 text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
                >
                  <option value="active">Active</option>

                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-yellow-300/90">
                  Display Order
                </label>

                <input
                  type="number"
                  name="order"
                  min="0"
                  value={form.order}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-3 text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
                />
              </div>
            </div>
          </div>

          {/* Titles */}
          <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-yellow-300/90">
                Reward Title (Bangla)
              </label>

              <input
                type="text"
                name="titleBn"
                value={form.titleBn}
                onChange={handleInputChange}
                placeholder="রিওয়ার্ডের শিরোনাম"
                className="w-full rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-3 text-white placeholder-yellow-400/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-yellow-300/90">
                Reward Title (English)
              </label>

              <input
                type="text"
                name="titleEn"
                value={form.titleEn}
                onChange={handleInputChange}
                placeholder="Reward title"
                className="w-full rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-3 text-white placeholder-yellow-400/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-yellow-300/90">
                Description (Bangla)
              </label>

              <textarea
                name="descriptionBn"
                value={form.descriptionBn}
                onChange={handleInputChange}
                rows={4}
                placeholder="রিওয়ার্ডের বিস্তারিত লিখুন"
                className="w-full resize-none rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-3 text-white placeholder-yellow-400/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-yellow-300/90">
                Description (English)
              </label>

              <textarea
                name="descriptionEn"
                value={form.descriptionEn}
                onChange={handleInputChange}
                rows={4}
                placeholder="Enter reward details"
                className="w-full resize-none rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-3 text-white placeholder-yellow-400/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>
          </div>

          {/* Amount settings */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-yellow-300/90">
                Required {getConditionLabel(form.conditionType)}
              </label>

              <input
                type="number"
                name="requiredAmount"
                min="0"
                step="0.01"
                value={form.requiredAmount}
                onChange={handleInputChange}
                placeholder="10000"
                className="w-full rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-3 text-white placeholder-yellow-400/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-yellow-300/90">
                Reward Amount
              </label>

              <input
                type="number"
                name="rewardAmount"
                min="0"
                step="0.01"
                value={form.rewardAmount}
                onChange={handleInputChange}
                placeholder="500"
                className="w-full rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-3 text-white placeholder-yellow-400/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-yellow-300/90">
                Turnover Multiplier
              </label>

              <input
                type="number"
                name="turnoverMultiplier"
                min="0"
                step="0.01"
                value={form.turnoverMultiplier}
                onChange={handleInputChange}
                placeholder="10"
                className="w-full rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-3 text-white placeholder-yellow-400/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />

              {form.rewardAmount && form.turnoverMultiplier && (
                <p className="mt-2 text-xs text-yellow-300/70">
                  Required turnover:{" "}
                  {formatMoney(
                    Number(form.rewardAmount) * Number(form.turnoverMultiplier),
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Campaign dates */}
          {form.calculationPeriod === "campaign" && (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-yellow-300/90">
                  Campaign Start
                </label>

                <input
                  type="datetime-local"
                  name="startAt"
                  value={form.startAt}
                  onChange={handleInputChange}
                  className="w-full cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-3 text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-yellow-300/90">
                  Campaign End
                </label>

                <input
                  type="datetime-local"
                  name="endAt"
                  value={form.endAt}
                  onChange={handleInputChange}
                  className="w-full cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-3 text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 [color-scheme:dark]"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-9 flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={saving}
              className={`rounded-xl px-8 py-3.5 text-lg font-semibold transition-all duration-300 ${
                saving
                  ? "cursor-not-allowed bg-gray-700 text-gray-400"
                  : "cursor-pointer border border-yellow-400/40 bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-600/40 hover:from-yellow-400 hover:to-amber-400"
              }`}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Reward"
                  : "Create Reward"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-8 py-3.5 text-lg font-semibold text-yellow-200 transition-all hover:border-yellow-500 hover:bg-yellow-900/40 hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* List header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-yellow-300">All Rewards</h2>

            <p className="mt-1 text-sm text-yellow-100/50">
              {filteredRewards.length} reward(s) found
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search rewards..."
              className="rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-2.5 text-sm text-white placeholder-yellow-400/40 focus:border-yellow-400 focus:outline-none"
            />

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-2.5 text-sm text-white focus:border-yellow-400 focus:outline-none"
            >
              <option value="all">All Types</option>
              {conditionTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-2.5 text-sm text-white focus:border-yellow-400 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Reward cards */}
        {loading ? (
          <div className="rounded-2xl border border-yellow-700/40 bg-black/50 p-10 text-center text-yellow-300/70">
            Loading rewards...
          </div>
        ) : filteredRewards.length === 0 ? (
          <div className="rounded-2xl border border-yellow-700/40 bg-black/50 p-10 text-center text-yellow-300/70">
            No rewards found
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredRewards.map((reward) => (
              <div
                key={reward._id}
                className="group overflow-hidden rounded-2xl border border-yellow-700/40 bg-black/60 shadow-xl shadow-yellow-900/20 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/60 hover:shadow-yellow-800/30"
              >
                <div className="relative">
                  <img
                    src={resolveImage(reward.bannerImage)}
                    alt={reward.title?.en || "Reward"}
                    className="h-48 w-full object-cover"
                    draggable={false}
                  />

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                      reward.status === "active"
                        ? "bg-emerald-500 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {reward.status}
                  </span>

                  <span className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-yellow-300 backdrop-blur-sm">
                    {reward.calculationPeriod}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-yellow-100 transition-colors group-hover:text-yellow-300">
                    {reward.title?.en || reward.title?.bn || "Untitled Reward"}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-yellow-100/60">
                    {reward.description?.en ||
                      reward.description?.bn ||
                      "No description"}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <InfoBox
                      label="Requirement"
                      value={getConditionLabel(reward.conditionType)}
                    />

                    <InfoBox
                      label="Required"
                      value={formatMoney(reward.requiredAmount)}
                    />

                    <InfoBox
                      label="Reward"
                      value={formatMoney(reward.rewardAmount)}
                    />

                    <InfoBox
                      label="Turnover"
                      value={`${reward.turnoverMultiplier}x`}
                    />
                  </div>

                  {reward.calculationPeriod === "campaign" && (
                    <div className="mt-4 rounded-xl border border-yellow-700/30 bg-yellow-950/20 p-3 text-xs text-yellow-100/60">
                      <p>Start: {formatDate(reward.startAt)}</p>

                      <p className="mt-1">End: {formatDate(reward.endAt)}</p>
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(reward)}
                      className="cursor-pointer rounded-lg bg-blue-700/80 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={statusUpdatingId === reward._id}
                      onClick={() => handleStatusChange(reward)}
                      className={`rounded-lg py-2.5 text-sm font-medium text-white transition-colors ${
                        statusUpdatingId === reward._id
                          ? "cursor-not-allowed bg-gray-700"
                          : reward.status === "active"
                            ? "cursor-pointer bg-orange-700/80 hover:bg-orange-600"
                            : "cursor-pointer bg-emerald-700/80 hover:bg-emerald-600"
                      }`}
                    >
                      {statusUpdatingId === reward._id
                        ? "..."
                        : reward.status === "active"
                          ? "Disable"
                          : "Enable"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(reward._id)}
                      className="cursor-pointer rounded-lg bg-red-700/80 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-yellow-700/60 bg-black/95 p-6 shadow-2xl shadow-yellow-900/50">
              <h3 className="text-xl font-bold text-yellow-300">
                Confirm Delete
              </h3>

              <p className="mt-3 text-sm leading-6 text-yellow-100/80">
                Are you sure you want to delete this reward? A reward with claim
                history cannot be deleted.
              </p>

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 py-3 text-yellow-200 transition-all hover:bg-yellow-900/40 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className={`flex-1 rounded-xl py-3 font-semibold text-white transition-all ${
                    deleting
                      ? "cursor-not-allowed bg-gray-700"
                      : "cursor-pointer bg-red-700 hover:bg-red-600"
                  }`}
                >
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoBox = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-yellow-700/30 bg-yellow-950/20 p-3">
      <p className="text-[11px] uppercase tracking-wide text-yellow-300/50">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-yellow-100">
        {value}
      </p>
    </div>
  );
};

export default RewardStore;
