import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Power,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { FaUserShield } from "react-icons/fa";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { api } from "../../api/axios";

const initialForm = {
  apiKey: "",
  isActive: true,
};

const AddGameApiKey = () => {
  const [form, setForm] = useState(initialForm);
  const [setting, setSetting] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showKey, setShowKey] = useState(false);

  const canSubmit = useMemo(() => {
    return String(form.apiKey || "").trim().length >= 16;
  }, [form.apiKey]);

  const loadSetting = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/game-api-key");
      const data = res.data?.data?.setting || null;

      setSetting(data);

      if (data) {
        setForm({
          apiKey: data.apiKey || "",
          isActive: Boolean(data.isActive),
        });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load API key setting",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  const copyText = async (text, label = "Text") => {
    try {
      await navigator.clipboard.writeText(text || "");
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) {
      return toast.error("API key must be at least 16 characters");
    }

    try {
      setSaving(true);

      const res = await api.post("/api/admin/game-api-key", {
        apiKey: String(form.apiKey).trim(),
        isActive: form.isActive,
      });

      const data = res.data?.data?.setting || null;
      setSetting(data);

      if (data?.isVerified) {
        toast.success("API key saved and verified successfully");
      } else {
        toast.warning(
          data?.lastVerifyError || "API key saved but not verified",
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save API key");
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    if (!setting?._id) {
      return toast.error("Please save API key first");
    }

    try {
      setVerifying(true);

      const res = await api.post("/api/admin/game-api-key/verify");
      const data = res.data?.data?.setting || null;

      setSetting(data);

      if (data?.isVerified) {
        toast.success("API key verified successfully");
      } else {
        toast.error(data?.lastVerifyError || "Invalid API key");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "API key verification failed",
      );

      if (error?.response?.data?.data?.setting) {
        setSetting(error.response.data.data.setting);
      } else {
        await loadSetting();
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!setting?._id) {
      return toast.error("Please save API key first");
    }

    try {
      setStatusLoading(true);

      const nextStatus = !Boolean(setting.isActive);

      const res = await api.patch("/api/admin/game-api-key/status", {
        isActive: nextStatus,
      });

      const data = res.data?.data?.setting || null;

      setSetting(data);
      setForm((prev) => ({
        ...prev,
        isActive: Boolean(data?.isActive),
      }));

      toast.success(nextStatus ? "API key activated" : "API key deactivated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!setting?._id) {
      return toast.error("No API key found");
    }

    const ok = window.confirm("Are you sure you want to delete this API key?");
    if (!ok) return;

    try {
      setDeleting(true);

      await api.delete("/api/admin/game-api-key");

      setSetting(null);
      setForm(initialForm);
      setShowKey(false);

      toast.success("API key deleted successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete API key");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-gradient-to-br from-black via-yellow-950/20 to-black p-4 text-white md:p-6">
      <motion.section
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-yellow-700/40 bg-gradient-to-b from-black via-yellow-950/30 to-black p-6 shadow-2xl shadow-yellow-900/30"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.15),transparent_35%)]" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/50">
              <FaUserShield className="text-3xl" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Game{" "}
              <span className="bg-gradient-to-r from-yellow-200 to-amber-400 bg-clip-text text-transparent">
                API Key
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-yellow-200/80">
              Add master white-label API key, verify it, and control active or
              inactive status from admin panel.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryCard
              label="Status"
              value={
                setting ? (setting.isActive ? "Active" : "Inactive") : "Not Set"
              }
              active={setting?.isActive}
            />

            <SummaryCard
              label="Verify"
              value={
                setting
                  ? setting.isVerified
                    ? "Verified"
                    : "Not Verified"
                  : "Not Set"
              }
              active={setting?.isVerified}
              warning={!setting?.isVerified}
            />
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <motion.form
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          onSubmit={handleSubmit}
          className="rounded-2xl border border-yellow-700/40 bg-gradient-to-b from-black via-yellow-950/30 to-black p-5 shadow-2xl shadow-yellow-900/30 md:p-6"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-300 shadow-lg shadow-yellow-900/20">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-bold">API Key Setting</h2>
                <p className="text-sm text-yellow-200/70">
                  Save or update your master API key
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadSetting}
              disabled={loading}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-yellow-700/50 bg-black/60 px-4 py-2.5 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400 hover:bg-yellow-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-yellow-100">
              API Key *
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-yellow-700/50 bg-black/70 px-4 py-3 transition focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/40">
              <KeyRound className="h-5 w-5 text-yellow-300" />

              <input
                type={showKey ? "text" : "password"}
                value={form.apiKey}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    apiKey: e.target.value,
                  }))
                }
                placeholder="Paste your master white-label API key"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-yellow-400/50"
              />

              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="cursor-pointer text-yellow-300 transition hover:text-yellow-100"
              >
                {showKey ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => copyText(form.apiKey, "API Key")}
                className="cursor-pointer text-yellow-300 transition hover:text-yellow-100"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-xs text-yellow-200/60">
              API key must be at least 16 characters.
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-yellow-700/40 bg-black/60 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white">
                  {form.isActive ? "Active" : "Inactive"}
                </p>
                <p className="mt-1 text-xs text-yellow-200/60">
                  Inactive korle client site master game API use korbe na.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: !prev.isActive,
                  }))
                }
                className={`relative h-8 w-16 cursor-pointer rounded-full transition ${
                  form.isActive
                    ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                    : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                    form.isActive ? "left-9" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="submit"
              disabled={saving || !canSubmit}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-5 py-3.5 text-sm font-semibold text-black shadow-lg shadow-yellow-600/50 transition hover:scale-[1.01] hover:from-yellow-400 hover:to-amber-400 hover:shadow-yellow-500/70 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {setting ? "Update API Key" : "Save API Key"}
            </button>

            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying || !setting}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-yellow-700/50 bg-yellow-500/10 px-5 py-3.5 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400 hover:bg-yellow-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verifying ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
              Verify Saved Key
            </button>
          </div>

          {setting && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleStatusToggle}
                disabled={statusLoading}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  setting.isActive
                    ? "border border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                    : "border border-yellow-400/30 bg-yellow-500/10 text-yellow-100 hover:bg-yellow-500/20"
                }`}
              >
                {statusLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
                {setting.isActive
                  ? "Deactivate Saved Key"
                  : "Activate Saved Key"}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete API Key
              </button>
            </div>
          )}
        </motion.form>

        <motion.aside
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          className="rounded-2xl border border-yellow-700/40 bg-gradient-to-b from-black via-yellow-950/30 to-black p-5 shadow-2xl shadow-yellow-900/30 md:p-6"
        >
          <h2 className="text-xl font-bold">Current Connection</h2>
          <p className="mt-1 text-sm text-yellow-200/70">
            Saved API key status and verification details.
          </p>

          {loading ? (
            <div className="mt-8 flex min-h-[260px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-300" />
            </div>
          ) : !setting ? (
            <div className="mt-6 rounded-2xl border border-yellow-700/40 bg-black/60 p-8 text-center">
              <KeyRound className="mx-auto mb-3 h-12 w-12 text-yellow-300/70" />
              <h3 className="text-lg font-bold">No API Key Saved</h3>
              <p className="mt-1 text-sm text-yellow-200/60">
                Add your master white-label API key first.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <StatusBox
                icon={setting.isVerified ? CheckCircle2 : XCircle}
                label="Verification"
                value={setting.isVerified ? "Verified" : "Not Verified"}
                success={setting.isVerified}
              />

              <StatusBox
                icon={Power}
                label="API Key Status"
                value={setting.isActive ? "Active" : "Inactive"}
                success={setting.isActive}
              />

              <div className="rounded-xl border border-yellow-700/40 bg-black/60 p-4">
                <p className="mb-2 text-xs font-bold text-yellow-200/60">
                  Saved API Key
                </p>

                <div className="flex items-center gap-3">
                  <KeyRound className="h-5 w-5 shrink-0 text-yellow-300" />

                  <p className="min-w-0 flex-1 break-all font-mono text-sm text-yellow-50">
                    {showKey ? setting.apiKey : maskKey(setting.apiKey)}
                  </p>

                  <button
                    type="button"
                    onClick={() => copyText(setting.apiKey, "Saved API Key")}
                    className="cursor-pointer rounded-xl bg-yellow-500/10 p-2 text-yellow-300 transition hover:bg-yellow-500/20"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <InfoLine
                label="Last Verified"
                value={
                  setting.lastVerifiedAt
                    ? new Date(setting.lastVerifiedAt).toLocaleString()
                    : "Never"
                }
              />

              <InfoLine
                label="Last Error"
                value={setting.lastVerifyError || "No error"}
                error={Boolean(setting.lastVerifyError)}
              />
            </div>
          )}
        </motion.aside>
      </section>
    </div>
  );
};

const maskKey = (key = "") => {
  if (!key) return "N/A";
  if (key.length <= 8) return "********";
  return `${key.slice(0, 4)}********${key.slice(-4)}`;
};

const SummaryCard = ({ label, value, active, warning }) => {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        active
          ? "border-yellow-400/30 bg-yellow-500/10 text-yellow-100"
          : warning
            ? "border-amber-400/30 bg-amber-500/10 text-amber-100"
            : "border-white/10 bg-black/50 text-white"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
};

const StatusBox = ({ icon: Icon, label, value, success }) => {
  return (
    <div
      className={`rounded-xl border p-4 ${
        success
          ? "border-yellow-400/30 bg-yellow-500/10 text-yellow-100"
          : "border-red-400/30 bg-red-500/10 text-red-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6" />
        <div>
          <p className="text-xs font-bold opacity-80">{label}</p>
          <p className="text-sm font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

const InfoLine = ({ label, value, error = false }) => {
  return (
    <div className="rounded-xl border border-yellow-700/40 bg-black/60 p-4">
      <p className="mb-1 text-xs font-bold text-yellow-200/60">{label}</p>
      <p
        className={`break-all text-sm ${
          error ? "text-red-200" : "text-yellow-50"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default AddGameApiKey;
