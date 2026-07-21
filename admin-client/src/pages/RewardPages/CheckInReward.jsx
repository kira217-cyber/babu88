// src/pages/Reward/CheckInReward.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaCoins,
  FaPlus,
  FaSave,
  FaTimes,
  FaTrash,
  FaWallet,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const createDay = (dayNumber) => ({
  dayNumber,

  dayName: {
    bn: `দিন ${dayNumber}`,
    en: `Day ${dayNumber}`,
  },

  rewardType: "balance",
  amount: "",
});

const initialForm = {
  title: {
    bn: "দৈনিক চেক ইন",
    en: "Daily Check In",
  },

  description: {
    bn: "প্রতিদিন চেক ইন করুন এবং আপনার দৈনিক পুরস্কার সংগ্রহ করুন।",
    en: "Check in daily and collect your daily reward.",
  },

  days: [createDay(1)],
  isActive: true,
};

const CheckInReward = () => {
  const [settingId, setSettingId] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [statusUpdating, setStatusUpdating] = useState(false);

  const [version, setVersion] = useState(1);

  const loadSetting = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/admin/check-in-reward");

      const setting = data?.setting;

      if (!setting) {
        setSettingId(null);
        setForm(initialForm);
        setVersion(1);
        return;
      }

      setSettingId(setting._id);
      setVersion(setting.version || 1);

      setForm({
        title: {
          bn: setting.title?.bn || "দৈনিক চেক ইন",

          en: setting.title?.en || "Daily Check In",
        },

        description: {
          bn: setting.description?.bn || "",

          en: setting.description?.en || "",
        },

        days:
          Array.isArray(setting.days) && setting.days.length > 0
            ? [...setting.days]
                .sort((a, b) => a.dayNumber - b.dayNumber)
                .map((day, index) => ({
                  dayNumber: index + 1,

                  dayName: {
                    bn: day.dayName?.bn || `দিন ${index + 1}`,

                    en: day.dayName?.en || `Day ${index + 1}`,
                  },

                  rewardType: day.rewardType || "balance",

                  amount: day.amount ?? "",
                }))
            : [createDay(1)],

        isActive: setting.isActive !== false,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load Check-In setting",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  const summary = useMemo(() => {
    return form.days.reduce(
      (result, day) => {
        const amount = Number(day.amount || 0);

        if (day.rewardType === "balance") {
          result.balance += amount;
        }

        if (day.rewardType === "reward_coin") {
          result.rewardCoin += amount;
        }

        return result;
      },
      {
        balance: 0,
        rewardCoin: 0,
      },
    );
  }, [form.days]);

  const handleTextChange = (section, language, value) => {
    setForm((previous) => ({
      ...previous,

      [section]: {
        ...previous[section],
        [language]: value,
      },
    }));
  };

  const handleDayChange = (index, field, value) => {
    setForm((previous) => {
      const updatedDays = [...previous.days];

      if (field === "dayNameBn" || field === "dayNameEn") {
        const language = field === "dayNameBn" ? "bn" : "en";

        updatedDays[index] = {
          ...updatedDays[index],

          dayName: {
            ...updatedDays[index].dayName,

            [language]: value,
          },
        };
      } else {
        updatedDays[index] = {
          ...updatedDays[index],
          [field]: value,
        };
      }

      return {
        ...previous,
        days: updatedDays,
      };
    });
  };

  const addDay = () => {
    if (form.days.length >= 7) {
      toast.info("Maximum 7 Check-In days are allowed");
      return;
    }

    const nextDayNumber = form.days.length + 1;

    setForm((previous) => ({
      ...previous,

      days: [...previous.days, createDay(nextDayNumber)],
    }));
  };

  const removeDay = (index) => {
    if (form.days.length <= 1) {
      toast.error("At least one Check-In day is required");
      return;
    }

    setForm((previous) => {
      const updatedDays = previous.days
        .filter((_, dayIndex) => dayIndex !== index)
        .map((day, dayIndex) => ({
          ...day,
          dayNumber: dayIndex + 1,
        }));

      return {
        ...previous,
        days: updatedDays,
      };
    });
  };

  const validateForm = () => {
    if (!form.title.bn.trim()) {
      toast.error("Bangla title is required");
      return false;
    }

    if (!form.title.en.trim()) {
      toast.error("English title is required");
      return false;
    }

    if (form.days.length < 1 || form.days.length > 7) {
      toast.error("You must create between 1 and 7 days");
      return false;
    }

    for (let index = 0; index < form.days.length; index += 1) {
      const day = form.days[index];

      if (!day.dayName?.bn?.trim()) {
        toast.error(`Bangla name is required for Day ${index + 1}`);
        return false;
      }

      if (!day.dayName?.en?.trim()) {
        toast.error(`English name is required for Day ${index + 1}`);
        return false;
      }

      if (!["balance", "reward_coin"].includes(day.rewardType)) {
        toast.error(`Invalid reward type for Day ${index + 1}`);
        return false;
      }

      const amount = Number(day.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error(`Enter a valid amount for Day ${index + 1}`);
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

      const payload = {
        title: {
          bn: form.title.bn.trim(),
          en: form.title.en.trim(),
        },

        description: {
          bn: form.description.bn.trim(),
          en: form.description.en.trim(),
        },

        days: form.days.map((day, index) => ({
          dayNumber: index + 1,

          dayName: {
            bn: day.dayName.bn.trim(),
            en: day.dayName.en.trim(),
          },

          rewardType: day.rewardType,

          amount: Number(day.amount),
        })),

        isActive: form.isActive,
      };

      let response;

      if (settingId) {
        response = await api.put(
          `/api/admin/check-in-reward/${settingId}`,
          payload,
        );

        toast.success("Check-In reward updated successfully");
      } else {
        response = await api.post("/api/admin/check-in-reward", payload);

        toast.success("Check-In reward created successfully");
      }

      const updatedSetting = response?.data?.setting;

      if (updatedSetting) {
        setSettingId(updatedSetting._id);

        setVersion(updatedSetting.version || 1);
      }

      await loadSetting();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save Check-In reward",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async () => {
    if (!settingId) {
      setForm((previous) => ({
        ...previous,
        isActive: !previous.isActive,
      }));

      return;
    }

    const nextStatus = !form.isActive;

    try {
      setStatusUpdating(true);

      const { data } = await api.patch(
        `/api/admin/check-in-reward/${settingId}/status`,
        {
          isActive: nextStatus,
        },
      );

      setForm((previous) => ({
        ...previous,

        isActive: data?.setting?.isActive ?? nextStatus,
      }));

      toast.success(
        nextStatus
          ? "Check-In reward activated"
          : "Check-In reward deactivated",
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl border border-yellow-700/30 bg-black/50"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black p-4 text-white lg:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-2xl font-bold text-transparent lg:text-3xl">
              {settingId ? "Update Check-In Reward" : "Create Check-In Reward"}
            </h1>

            <p className="mt-2 text-sm text-yellow-100/60">
              Create a maximum of seven daily Check-In rewards.
            </p>

            {settingId && (
              <p className="mt-1 text-xs text-yellow-400/60">
                Configuration version: {version}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={statusUpdating}
            onClick={handleStatusChange}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
              form.isActive
                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                : "bg-red-700 text-white hover:bg-red-600"
            } ${statusUpdating ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <FaCheckCircle />

            {statusUpdating
              ? "Updating..."
              : form.isActive
                ? "Active"
                : "Inactive"}
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<FaCheckCircle />}
            label="Configured Days"
            value={`${form.days.length} / 7`}
          />

          <SummaryCard
            icon={<FaWallet />}
            label="Total Balance Reward"
            value={`৳${summary.balance.toLocaleString()}`}
          />

          <SummaryCard
            icon={<FaCoins />}
            label="Total Reward Coin"
            value={summary.rewardCoin.toLocaleString()}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* General setting */}
          <div className="mb-6 rounded-2xl border border-yellow-700/40 bg-black/60 p-5 shadow-xl shadow-yellow-900/20 backdrop-blur-md lg:p-7">
            <h2 className="mb-5 text-lg font-bold text-yellow-300">
              General Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <TextInput
                label="Title (Bangla)"
                value={form.title.bn}
                onChange={(value) => handleTextChange("title", "bn", value)}
                placeholder="দৈনিক চেক ইন"
              />

              <TextInput
                label="Title (English)"
                value={form.title.en}
                onChange={(value) => handleTextChange("title", "en", value)}
                placeholder="Daily Check In"
              />

              <TextArea
                label="Description (Bangla)"
                value={form.description.bn}
                onChange={(value) =>
                  handleTextChange("description", "bn", value)
                }
                placeholder="বাংলা বিবরণ"
              />

              <TextArea
                label="Description (English)"
                value={form.description.en}
                onChange={(value) =>
                  handleTextChange("description", "en", value)
                }
                placeholder="English description"
              />
            </div>
          </div>

          {/* Days */}
          <div className="rounded-2xl border border-yellow-700/40 bg-black/60 p-5 shadow-xl shadow-yellow-900/20 backdrop-blur-md lg:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-yellow-300">
                  Check-In Days
                </h2>

                <p className="mt-1 text-xs text-yellow-100/50">
                  Users will claim one reward every 24 hours.
                </p>
              </div>

              <button
                type="button"
                onClick={addDay}
                disabled={form.days.length >= 7}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  form.days.length >= 7
                    ? "cursor-not-allowed bg-gray-800 text-gray-500"
                    : "cursor-pointer bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-400 hover:to-amber-400"
                }`}
              >
                <FaPlus />
                Add Day
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {form.days.map((day, index) => (
                <div
                  key={index}
                  className="relative rounded-2xl border border-yellow-700/40 bg-yellow-950/15 p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 font-black text-black">
                        {index + 1}
                      </div>

                      <div>
                        <h3 className="font-bold text-yellow-200">
                          Day {index + 1}
                        </h3>

                        <p className="text-[10px] text-yellow-100/40">
                          Check-In position
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={form.days.length <= 1}
                      onClick={() => removeDay(index)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                        form.days.length <= 1
                          ? "cursor-not-allowed bg-gray-800 text-gray-600"
                          : "cursor-pointer bg-red-800/60 text-red-300 hover:bg-red-700 hover:text-white"
                      }`}
                    >
                      <FaTrash size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextInput
                      label="Day Name (Bangla)"
                      value={day.dayName?.bn || ""}
                      onChange={(value) =>
                        handleDayChange(index, "dayNameBn", value)
                      }
                      placeholder={`দিন ${index + 1}`}
                    />

                    <TextInput
                      label="Day Name (English)"
                      value={day.dayName?.en || ""}
                      onChange={(value) =>
                        handleDayChange(index, "dayNameEn", value)
                      }
                      placeholder={`Day ${index + 1}`}
                    />

                    <div>
                      <label className="mb-2 block text-xs font-medium text-yellow-300/80">
                        Reward Type
                      </label>

                      <select
                        value={day.rewardType}
                        onChange={(event) =>
                          handleDayChange(
                            index,
                            "rewardType",
                            event.target.value,
                          )
                        }
                        className="h-11 w-full cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-3 text-sm text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                      >
                        <option value="balance">Main Balance</option>

                        <option value="reward_coin">Reward Coin</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-yellow-300/80">
                        Reward Amount
                      </label>

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={day.amount}
                        onChange={(event) =>
                          handleDayChange(index, "amount", event.target.value)
                        }
                        placeholder="10"
                        className="h-11 w-full rounded-xl border border-yellow-700/50 bg-black/70 px-3 text-sm text-white placeholder-yellow-400/30 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 rounded-2xl border border-yellow-700/40 bg-black/60 p-5 shadow-xl lg:p-7">
            <h2 className="mb-5 text-lg font-bold text-yellow-300">
              Client Preview
            </h2>

            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max items-center gap-4">
                {form.days.map((day, index) => (
                  <div
                    key={index}
                    className="w-[110px] rounded-xl border border-yellow-700/40 bg-[#292929] p-3 text-center"
                  >
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#ffd400] text-black">
                      {day.rewardType === "balance" ? (
                        <FaWallet />
                      ) : (
                        <FaCoins />
                      )}
                    </div>

                    <p className="mt-3 truncate text-xs font-bold text-white">
                      {day.dayName?.en || `Day ${index + 1}`}
                    </p>

                    <p className="mt-1 text-[11px] font-extrabold text-yellow-300">
                      {day.rewardType === "balance"
                        ? `৳${Number(day.amount || 0)}`
                        : `${Number(day.amount || 0)} Coin`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="mt-7 flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-bold transition ${
                saving
                  ? "cursor-not-allowed bg-gray-700 text-gray-400"
                  : "cursor-pointer bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-600/30 hover:from-yellow-400 hover:to-amber-400"
              }`}
            >
              <FaSave />

              {saving
                ? "Saving..."
                : settingId
                  ? "Update Check-In Reward"
                  : "Create Check-In Reward"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value }) => (
  <div className="rounded-xl border border-yellow-700/40 bg-black/60 p-4 shadow-lg">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-500/15 text-xl text-yellow-400">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase text-yellow-100/45">
          {label}
        </p>

        <p className="mt-1 text-lg font-extrabold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const TextInput = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="mb-2 block text-xs font-medium text-yellow-300/80">
      {label}
    </label>

    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-xl border border-yellow-700/50 bg-black/70 px-3 text-sm text-white placeholder-yellow-400/30 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="mb-2 block text-xs font-medium text-yellow-300/80">
      {label}
    </label>

    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={4}
      className="w-full resize-none rounded-xl border border-yellow-700/50 bg-black/70 px-3 py-3 text-sm text-white placeholder-yellow-400/30 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
    />
  </div>
);

export default CheckInReward;
