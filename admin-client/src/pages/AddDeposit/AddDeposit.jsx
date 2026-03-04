// src/pages/admin/AddDeposit.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { toast } from "react-toastify";

const emptyBi = { bn: "", en: "" };

const defaultChannel = () => ({
  id: "",
  name: { ...emptyBi },
  tagText: "+0%",
  bonusTitle: { ...emptyBi },
  bonusPercent: 0,
  isActive: true,
});

const defaultPromotion = () => ({
  id: "",
  name: { ...emptyBi },
  bonusType: "fixed",
  bonusValue: 0,
  sort: 0,
  isActive: true,
});

const defaultInput = () => ({
  key: "",
  label: { ...emptyBi },
  placeholder: { ...emptyBi },
  type: "text",
  required: true,
  minLength: 0,
  maxLength: 0,
});

// ✅ NEW: Label (BN/EN) + Number (multiple)
const defaultContact = () => ({
  id: "",
  label: { ...emptyBi },
  number: "",
  isActive: true,
  sort: 0,
});

// ────────────────────────────────────────────────
// Shared styling classes
// ────────────────────────────────────────────────
const cardBase =
  "bg-gradient-to-br from-black via-yellow-950/30 to-black rounded-xl border border-yellow-700/40 shadow-lg shadow-yellow-900/20 overflow-hidden";

const headCls = "text-lg font-bold text-yellow-300 tracking-tight";
const subheadCls = "text-base font-semibold text-yellow-200/90 mb-3";
const labelCls = "text-sm font-medium text-yellow-100/90 block mb-1.5";
const inputBase =
  "w-full h-11 bg-black/60 border border-yellow-700/50 rounded-lg px-4 text-white placeholder-yellow-400/50 focus:outline-none focus:border-yellow-400/70 focus:ring-2 focus:ring-yellow-400/30 transition-all";

const btnBase =
  "h-10 px-5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm";
const btnPrimary = `${btnBase} bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white border border-yellow-500/40 hover:shadow-yellow-600/30`;
const btnGhost = `${btnBase} bg-transparent border border-yellow-700/60 text-yellow-300 hover:bg-yellow-900/40 hover:border-yellow-500/60`;
const btnDanger = `${btnBase} bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white border border-red-600/50 hover:shadow-red-700/30`;
const btnSmall = "h-8 px-3 text-xs";

// ────────────────────────────────────────────────
// Bilingual input component
// ────────────────────────────────────────────────
const BiInput = ({ title, bnProps, enProps }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className={labelCls}>{title} (BN)</label>
      <input className={inputBase} {...bnProps} />
    </div>
    <div>
      <label className={labelCls}>{title} (EN)</label>
      <input className={inputBase} {...enProps} />
    </div>
  </div>
);

// ────────────────────────────────────────────────
// Delete confirmation modal
// ────────────────────────────────────────────────
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, methodName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`${cardBase} w-full max-w-md p-6`}>
        <h3 className="text-xl font-bold text-yellow-200 mb-4">
          Confirm Delete
        </h3>
        <p className="text-yellow-100/90 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-yellow-300">
            {methodName || "this deposit method"}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-4">
          <button onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button onClick={onConfirm} className={btnDanger}>
            Delete Method
          </button>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────
// Main Component – AddDeposit
// ────────────────────────────────────────────────
const AddDeposit = () => {
  const qc = useQueryClient();

  const {
    data: list = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["deposit-methods"],
    queryFn: async () => {
      const res = await api.get("/api/deposit-methods");
      return res.data || [];
    },
    staleTime: 10_000,
  });

  const [selectedId, setSelectedId] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const isCreateMode = selectedId === "";

  const selected = useMemo(
    () => list.find((x) => x._id === selectedId) || null,
    [list, selectedId],
  );

  const [channels, setChannels] = useState([defaultChannel()]);
  const [promotions, setPromotions] = useState([defaultPromotion()]);

  // ✅ NEW: contacts list
  const [contacts, setContacts] = useState([defaultContact()]);

  const [inputs, setInputs] = useState([
    {
      key: "amount",
      label: { bn: "পরিমাণ (৳)", en: "Amount (৳)" },
      placeholder: { bn: "1000", en: "1000" },
      type: "number",
      required: true,
      minLength: 0,
      maxLength: 0,
    },
    {
      key: "senderNumber",
      label: { bn: "প্রেরকের নম্বর", en: "Sender Number" },
      placeholder: { bn: "01XXXXXXXXX", en: "01XXXXXXXXX" },
      type: "tel",
      required: true,
      minLength: 8,
      maxLength: 14,
    },
    {
      key: "trxName",
      label: { bn: "ট্রান্সাকশন নাম্বার", en: "Transaction Name/Type" },
      placeholder: {
        bn: "Agent / Merchant / Personal",
        en: "Agent / Merchant / Personal",
      },
      type: "text",
      required: true,
      minLength: 2,
      maxLength: 40,
    },
    {
      key: "trxId",
      label: { bn: "ট্রান্সাকশন আইডি", en: "Transaction ID" },
      placeholder: { bn: "e.g. 9A7B6C5D", en: "e.g. 9A7B6C5D" },
      type: "text",
      required: true,
      minLength: 6,
      maxLength: 40,
    },
  ]);

  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, reset, watch, handleSubmit } = useForm({
    defaultValues: {
      methodId: "",
      methodName_bn: "",
      methodName_en: "",
      isActive: true,

      // ✅ Min/Max
      minDepositAmount: 0,
      maxDepositAmount: 0,

      turnoverMultiplier: 1,
      baseBonusTitle_bn: "",
      baseBonusTitle_en: "",
      baseBonusPercent: 0,

      instructions_bn: "",
      instructions_en: "",
    },
  });

  // Fill form when selected method changes or create mode
  useEffect(() => {
    if (!selected) {
      if (isCreateMode) {
        setChannels([defaultChannel()]);
        setPromotions([defaultPromotion()]);
        setContacts([defaultContact()]);
        setInputs([
          {
            key: "amount",
            label: { bn: "পরিমাণ (৳)", en: "Amount (৳)" },
            placeholder: { bn: "1000", en: "1000" },
            type: "number",
            required: true,
            minLength: 0,
            maxLength: 0,
          },
        ]);
        setLogoFile(null);
      }
      return;
    }

    // Edit mode
    reset({
      methodId: selected.methodId || "",
      methodName_bn: selected.methodName?.bn || "",
      methodName_en: selected.methodName?.en || "",
      isActive: selected.isActive ?? true,

      minDepositAmount: selected.minDepositAmount ?? 0,
      maxDepositAmount: selected.maxDepositAmount ?? 0,

      turnoverMultiplier: selected.turnoverMultiplier ?? 1,
      baseBonusTitle_bn: selected.baseBonusTitle?.bn || "",
      baseBonusTitle_en: selected.baseBonusTitle?.en || "",
      baseBonusPercent: selected.baseBonusPercent ?? 0,

      instructions_bn: selected.details?.instructions?.bn || "",
      instructions_en: selected.details?.instructions?.en || "",
    });

    setChannels(
      Array.isArray(selected.channels) && selected.channels.length
        ? selected.channels
        : [defaultChannel()],
    );

    setPromotions(
      Array.isArray(selected.promotions) && selected.promotions.length
        ? selected.promotions
        : [defaultPromotion()],
    );

    // ✅ contacts: prefer new details.contacts; fallback legacy agent/personal -> convert
    const incomingContacts =
      Array.isArray(selected.details?.contacts) &&
      selected.details.contacts.length
        ? selected.details.contacts
        : [];

    if (incomingContacts.length) {
      setContacts(incomingContacts);
    } else {
      const legacyAgent = String(selected.details?.agentNumber || "").trim();
      const legacyPersonal = String(
        selected.details?.personalNumber || "",
      ).trim();
      const legacyList = [];

      if (legacyAgent) {
        legacyList.push({
          id: "agent",
          label: { bn: "এজেন্ট নাম্বার", en: "Agent Number" },
          number: legacyAgent,
          isActive: true,
          sort: 0,
        });
      }
      if (legacyPersonal) {
        legacyList.push({
          id: "personal",
          label: {
            bn: "পার্সোনাল/মার্চেন্ট নাম্বার",
            en: "Personal/Merchant Number",
          },
          number: legacyPersonal,
          isActive: true,
          sort: 1,
        });
      }

      setContacts(legacyList.length ? legacyList : [defaultContact()]);
    }

    setInputs(
      Array.isArray(selected.details?.inputs) && selected.details.inputs.length
        ? selected.details.inputs
        : [
            {
              key: "amount",
              label: { bn: "পরিমাণ (৳)", en: "Amount (৳)" },
              placeholder: { bn: "1000", en: "1000" },
              type: "number",
              required: true,
              minLength: 0,
              maxLength: 0,
            },
          ],
    );

    setLogoFile(null);
  }, [selected, reset, isCreateMode]);

  const clearToCreate = () => {
    setSelectedId("");
    reset({
      methodId: "",
      methodName_bn: "",
      methodName_en: "",
      isActive: true,

      minDepositAmount: 0,
      maxDepositAmount: 0,

      turnoverMultiplier: 13,
      baseBonusTitle_bn: "",
      baseBonusTitle_en: "",
      baseBonusPercent: 0,

      instructions_bn: "",
      instructions_en: "",
    });
    setChannels([defaultChannel()]);
    setPromotions([defaultPromotion()]);
    setContacts([defaultContact()]);
    setInputs([
      {
        key: "amount",
        label: { bn: "পরিমাণ (৳)", en: "Amount (৳)" },
        placeholder: { bn: "1000", en: "1000" },
        type: "number",
        required: true,
        minLength: 0,
        maxLength: 0,
      },
    ]);
    setLogoFile(null);
  };

  // ─── Channel Handlers ───
  const addChannel = () => setChannels((p) => [...p, defaultChannel()]);
  const removeChannel = (idx) =>
    setChannels((p) => p.filter((_, i) => i !== idx));
  const patchChannel = (idx, key, val) =>
    setChannels((p) => p.map((c, i) => (i === idx ? { ...c, [key]: val } : c)));
  const patchChannelBi = (idx, key, lang, val) =>
    setChannels((p) =>
      p.map((c, i) =>
        i === idx
          ? { ...c, [key]: { ...(c[key] || emptyBi), [lang]: val } }
          : c,
      ),
    );

  // ─── Promotion Handlers ───
  const addPromotion = () => setPromotions((p) => [...p, defaultPromotion()]);
  const removePromotion = (idx) =>
    setPromotions((p) => p.filter((_, i) => i !== idx));
  const patchPromotion = (idx, key, val) =>
    setPromotions((p) =>
      p.map((x, i) => (i === idx ? { ...x, [key]: val } : x)),
    );
  const patchPromotionBi = (idx, key, lang, val) =>
    setPromotions((p) =>
      p.map((x, i) =>
        i === idx
          ? { ...x, [key]: { ...(x[key] || emptyBi), [lang]: val } }
          : x,
      ),
    );

  // ─── Contact Handlers (NEW) ───
  const addContact = () => setContacts((p) => [...p, defaultContact()]);
  const removeContact = (idx) =>
    setContacts((p) => p.filter((_, i) => i !== idx));
  const patchContact = (idx, key, val) =>
    setContacts((p) => p.map((x, i) => (i === idx ? { ...x, [key]: val } : x)));
  const patchContactBi = (idx, key, lang, val) =>
    setContacts((p) =>
      p.map((x, i) =>
        i === idx
          ? { ...x, [key]: { ...(x[key] || emptyBi), [lang]: val } }
          : x,
      ),
    );

  // ─── Input Field Handlers ───
  const addInput = () => setInputs((p) => [...p, defaultInput()]);
  const removeInput = (idx) => setInputs((p) => p.filter((_, i) => i !== idx));
  const patchInput = (idx, key, val) =>
    setInputs((p) => p.map((x, i) => (i === idx ? { ...x, [key]: val } : x)));
  const patchInputBi = (idx, key, lang, val) =>
    setInputs((p) =>
      p.map((x, i) =>
        i === idx
          ? { ...x, [key]: { ...(x[key] || emptyBi), [lang]: val } }
          : x,
      ),
    );

  const validateBeforeSave = (values) => {
    const mid = String(values.methodId || "")
      .trim()
      .toLowerCase();
    if (!mid) return "Method ID is required (e.g. bkash, nagad)";
    if (!values.methodName_bn?.trim() || !values.methodName_en?.trim())
      return "Both BN & EN method names are required";

    const minA = Number(values.minDepositAmount ?? 0);
    const maxA = Number(values.maxDepositAmount ?? 0);
    if (Number.isNaN(minA) || minA < 0) return "Min deposit must be >= 0";
    if (Number.isNaN(maxA) || maxA < 0) return "Max deposit must be >= 0";
    if (maxA > 0 && minA > maxA)
      return "Min deposit cannot be greater than Max deposit";

    for (const c of channels) {
      if (!String(c.id || "").trim()) return "Channel ID cannot be empty";
      if (!c.name?.bn?.trim() || !c.name?.en?.trim())
        return "Channel name (BN/EN) both required";
    }

    for (const p of promotions) {
      if (!String(p.id || "").trim()) return "Promotion ID cannot be empty";
      if (!p.name?.bn?.trim() || !p.name?.en?.trim())
        return "Promotion name (BN/EN) both required";
      const v = Number(p.bonusValue ?? 0);
      if (Number.isNaN(v) || v < 0) return "Promotion bonusValue must be >= 0";
      if (p.bonusType === "percent" && v > 100)
        return "Promotion percent cannot be more than 100";
    }

    // ✅ NEW: validate contacts
    for (const n of contacts) {
      const num = String(n.number || "").trim();
      const bn = String(n.label?.bn || "").trim();
      const en = String(n.label?.en || "").trim();

      if (!num) return "Number cannot be empty in Numbers section";
      if (!bn || !en) return "Number label (BN/EN) both required";
    }

    for (const f of inputs) {
      if (!String(f.key || "").trim()) return "Input key cannot be empty";
      if (!f.label?.bn?.trim() || !f.label?.en?.trim())
        return "Input label (BN/EN) both required";
    }

    return null;
  };

  const onSave = async (values) => {
    const err = validateBeforeSave(values);
    if (err) return toast.error(err);

    try {
      setSaving(true);
      const payload = new FormData();

      payload.append(
        "methodId",
        String(values.methodId || "")
          .trim()
          .toLowerCase(),
      );
      payload.append(
        "methodName",
        JSON.stringify({
          bn: values.methodName_bn || "",
          en: values.methodName_en || "",
        }),
      );
      payload.append("isActive", String(!!values.isActive));

      payload.append("minDepositAmount", String(values.minDepositAmount ?? 0));
      payload.append("maxDepositAmount", String(values.maxDepositAmount ?? 0));

      payload.append(
        "turnoverMultiplier",
        String(values.turnoverMultiplier ?? 13),
      );
      payload.append(
        "baseBonusTitle",
        JSON.stringify({
          bn: values.baseBonusTitle_bn || "",
          en: values.baseBonusTitle_en || "",
        }),
      );
      payload.append("baseBonusPercent", String(values.baseBonusPercent ?? 0));
      payload.append("channels", JSON.stringify(channels));
      payload.append("promotions", JSON.stringify(promotions));

      payload.append(
        "details",
        JSON.stringify({
          // ✅ NEW
          contacts: contacts.map((c, idx) => ({
            ...c,
            sort: Number(c.sort ?? idx),
          })),

          instructions: {
            bn: values.instructions_bn || "",
            en: values.instructions_en || "",
          },
          inputs,
        }),
      );

      if (logoFile) payload.append("logo", logoFile);

      if (selected?._id) {
        await api.put(`/api/deposit-methods/${selected._id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Method updated successfully");
      } else {
        await api.post(`/api/deposit-methods`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Method created successfully");
      }

      qc.invalidateQueries({ queryKey: ["deposit-methods"] });
      refetch();
      if (isCreateMode) clearToCreate();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteId(null);
    setDeleteName("");

    try {
      setSaving(true);
      await api.delete(`/api/deposit-methods/${deleteId}`);
      toast.success("Method deleted successfully");
      qc.invalidateQueries({ queryKey: ["deposit-methods"] });
      refetch();
      if (selectedId === deleteId) clearToCreate();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white p-4 md:p-6">
      <div className="flex flex-col gap-8 max-w-7xl mx-auto">
        {/* ==================== FORM SECTION ==================== */}
        <div className={`${cardBase} p-6 md:p-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className={headCls}>
                {isCreateMode
                  ? "Create New Deposit Method"
                  : "Update Deposit Method"}
              </h2>
              <p className="text-sm text-yellow-400/70 mt-1">
                Fill BN + EN fields for both languages
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {!isCreateMode && selected?._id && (
                <button
                  type="button"
                  onClick={() =>
                    requestDelete(
                      selected._id,
                      watch("methodName_en") ||
                        watch("methodId") ||
                        "this method",
                    )
                  }
                  disabled={saving}
                  className={btnDanger}
                >
                  Delete Method
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit(onSave)}
                disabled={saving}
                className={btnPrimary}
              >
                {saving
                  ? "Saving..."
                  : isCreateMode
                    ? "Create Method"
                    : "Update Method"}
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            <div>
              <label className={labelCls}>Method ID (unique, lowercase)</label>
              <input
                className={inputBase}
                placeholder="bkash / nagad / rocket / upay"
                {...register("methodId")}
              />
            </div>

            <div className="flex items-end pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-yellow-500 bg-black border-yellow-600"
                  {...register("isActive")}
                />
                <span className="text-yellow-100 font-medium">Active</span>
              </label>
            </div>

            <div className="lg:col-span-2">
              <BiInput
                title="Method Name"
                bnProps={{
                  ...register("methodName_bn"),
                  placeholder: "যেমন: বিকাশ",
                }}
                enProps={{
                  ...register("methodName_en"),
                  placeholder: "e.g. bKash",
                }}
              />
            </div>

            <div className="lg:col-span-2">
              <label className={labelCls}>
                Logo (will replace current if uploaded)
              </label>
              <div className="mt-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="text-yellow-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500/20 file:text-yellow-300 hover:file:bg-yellow-500/30 cursor-pointer"
                />
                {!isCreateMode && selected?.logoUrl && (
                  <div className="flex items-center gap-3">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${selected.logoUrl}`}
                      alt="current logo"
                      className="w-16 h-16 rounded-lg object-cover border border-yellow-700/50 shadow-sm"
                    />
                    <span className="text-xs text-yellow-400/70">
                      Current logo
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Min/Max Deposit Amount */}
            <div>
              <label className={labelCls}>Minimum Deposit Amount (৳)</label>
              <input
                type="number"
                step="0.01"
                className={inputBase}
                {...register("minDepositAmount", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className={labelCls}>Maximum Deposit Amount (৳)</label>
              <input
                type="number"
                step="0.01"
                className={inputBase}
                {...register("maxDepositAmount", { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className={labelCls}>Turnover Multiplier (×)</label>
              <input
                type="number"
                step="1"
                className={inputBase}
                {...register("turnoverMultiplier", { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className={labelCls}>Base Bonus Percent</label>
              <input
                type="number"
                step="0.01"
                className={inputBase}
                {...register("baseBonusPercent", { valueAsNumber: true })}
              />
            </div>

            <div className="lg:col-span-2">
              <BiInput
                title="Base Bonus Title (optional)"
                bnProps={{
                  ...register("baseBonusTitle_bn"),
                  placeholder: "যেমন: বেস বোনাস",
                }}
                enProps={{
                  ...register("baseBonusTitle_en"),
                  placeholder: "e.g. Base Bonus",
                }}
              />
            </div>
          </div>

          {/* Deposit Details */}
          <div className="mb-8">
            <h3 className={subheadCls}>Deposit Details (per method)</h3>

            {/* ✅ NEW: Multiple Label+Number */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={subheadCls}>Numbers (Label + Number)</h3>
                <button type="button" onClick={addContact} className={btnGhost}>
                  + Add Number
                </button>
              </div>

              <div className="space-y-5">
                {contacts.map((n, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-black/40 rounded-xl border border-yellow-800/30"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-yellow-200 font-medium">
                        Number #{idx + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeContact(idx)}
                        disabled={contacts.length === 1}
                        className={`${btnDanger} ${btnSmall}`}
                      >
                        Remove
                      </button>
                    </div>

                    <BiInput
                      title="Label"
                      bnProps={{
                        value: n.label?.bn || "",
                        onChange: (e) =>
                          patchContactBi(idx, "label", "bn", e.target.value),
                        placeholder: "যেমন: এজেন্ট নাম্বার",
                      }}
                      enProps={{
                        value: n.label?.en || "",
                        onChange: (e) =>
                          patchContactBi(idx, "label", "en", e.target.value),
                        placeholder: "e.g. Agent Number",
                      }}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className={labelCls}>Number</label>
                        <input
                          className={inputBase}
                          value={n.number || ""}
                          onChange={(e) =>
                            patchContact(idx, "number", e.target.value)
                          }
                          placeholder="01XXXXXXXXX / 013XXXXXXXX"
                        />
                      </div>

                      <div className="flex items-end pt-6 justify-between gap-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-5 h-5 accent-yellow-500"
                            checked={n.isActive ?? true}
                            onChange={(e) =>
                              patchContact(idx, "isActive", e.target.checked)
                            }
                          />
                          <span className="text-yellow-100 font-medium">
                            Active
                          </span>
                        </label>

                        <div className="w-[140px]">
                          <label className={labelCls}>Sort</label>
                          <input
                            type="number"
                            step="1"
                            className={inputBase}
                            value={Number(n.sort ?? 0)}
                            onChange={(e) =>
                              patchContact(
                                idx,
                                "sort",
                                Number(e.target.value || 0),
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <BiInput
              title="Instructions"
              bnProps={{
                ...register("instructions_bn"),
                placeholder: "বাংলা নির্দেশনা...",
              }}
              enProps={{
                ...register("instructions_en"),
                placeholder: "English instructions...",
              }}
            />
          </div>

          {/* Channels Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className={subheadCls}>Deposit Channels</h3>
              <button type="button" onClick={addChannel} className={btnGhost}>
                + Add Channel
              </button>
            </div>

            <div className="space-y-5">
              {channels.map((c, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-black/40 rounded-xl border border-yellow-800/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-yellow-200 font-medium">
                      Channel #{idx + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeChannel(idx)}
                      disabled={channels.length === 1}
                      className={`${btnDanger} ${btnSmall}`}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelCls}>Channel ID</label>
                      <input
                        className={inputBase}
                        value={c.id || ""}
                        onChange={(e) =>
                          patchChannel(idx, "id", e.target.value)
                        }
                        placeholder="zappay / dpay / paytaka"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Tag Text (e.g. +3%)</label>
                      <input
                        className={inputBase}
                        value={c.tagText || ""}
                        onChange={(e) =>
                          patchChannel(idx, "tagText", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <BiInput
                    title="Channel Name"
                    bnProps={{
                      value: c.name?.bn || "",
                      onChange: (e) =>
                        patchChannelBi(idx, "name", "bn", e.target.value),
                      placeholder: "যেমন: জ্যাপপে",
                    }}
                    enProps={{
                      value: c.name?.en || "",
                      onChange: (e) =>
                        patchChannelBi(idx, "name", "en", e.target.value),
                      placeholder: "e.g. Zappay",
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={labelCls}>Bonus Percent</label>
                      <input
                        type="number"
                        step="0.01"
                        className={inputBase}
                        value={Number(c.bonusPercent ?? 0)}
                        onChange={(e) =>
                          patchChannel(
                            idx,
                            "bonusPercent",
                            Number(e.target.value || 0),
                          )
                        }
                      />
                    </div>
                    <div className="flex items-end pt-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-yellow-500"
                          checked={c.isActive ?? true}
                          onChange={(e) =>
                            patchChannel(idx, "isActive", e.target.checked)
                          }
                        />
                        <span className="text-yellow-100 font-medium">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4">
                    <BiInput
                      title="Bonus Title"
                      bnProps={{
                        value: c.bonusTitle?.bn || "",
                        onChange: (e) =>
                          patchChannelBi(
                            idx,
                            "bonusTitle",
                            "bn",
                            e.target.value,
                          ),
                        placeholder: "যেমন: চ্যানেল বোনাস",
                      }}
                      enProps={{
                        value: c.bonusTitle?.en || "",
                        onChange: (e) =>
                          patchChannelBi(
                            idx,
                            "bonusTitle",
                            "en",
                            e.target.value,
                          ),
                        placeholder: "e.g. Channel Bonus",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promotions Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className={subheadCls}>Promotions (Client Bonus Options)</h3>
              <button type="button" onClick={addPromotion} className={btnGhost}>
                + Add Promotion
              </button>
            </div>

            <div className="space-y-5">
              {promotions.map((p, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-black/40 rounded-xl border border-yellow-800/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-yellow-200 font-medium">
                      Promotion #{idx + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removePromotion(idx)}
                      disabled={promotions.length === 1}
                      className={`${btnDanger} ${btnSmall}`}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelCls}>Promotion ID</label>
                      <input
                        className={inputBase}
                        value={p.id || ""}
                        onChange={(e) =>
                          patchPromotion(
                            idx,
                            "id",
                            String(e.target.value || "").toLowerCase(),
                          )
                        }
                        placeholder="welcome / reload / special"
                      />
                    </div>

                    <div className="flex items-end pt-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-yellow-500"
                          checked={p.isActive ?? true}
                          onChange={(e) =>
                            patchPromotion(idx, "isActive", e.target.checked)
                          }
                        />
                        <span className="text-yellow-100 font-medium">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>

                  <BiInput
                    title="Promotion Name"
                    bnProps={{
                      value: p.name?.bn || "",
                      onChange: (e) =>
                        patchPromotionBi(idx, "name", "bn", e.target.value),
                      placeholder: "যেমন: ওয়েলকাম বোনাস",
                    }}
                    enProps={{
                      value: p.name?.en || "",
                      onChange: (e) =>
                        patchPromotionBi(idx, "name", "en", e.target.value),
                      placeholder: "e.g. Welcome Bonus",
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className={labelCls}>Bonus Type</label>
                      <select
                        className={inputBase}
                        value={p.bonusType || "fixed"}
                        onChange={(e) =>
                          patchPromotion(idx, "bonusType", e.target.value)
                        }
                      >
                        <option value="fixed">fixed (৳)</option>
                        <option value="percent">percent (%)</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>
                        Bonus Value {p.bonusType === "percent" ? "(%)" : "(৳)"}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className={inputBase}
                        value={Number(p.bonusValue ?? 0)}
                        onChange={(e) =>
                          patchPromotion(
                            idx,
                            "bonusValue",
                            Number(e.target.value || 0),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Sort</label>
                      <input
                        type="number"
                        step="1"
                        className={inputBase}
                        value={Number(p.sort ?? 0)}
                        onChange={(e) =>
                          patchPromotion(
                            idx,
                            "sort",
                            Number(e.target.value || 0),
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-yellow-400/70">
                    Tip: Client dropdown এ এই promotion show হবে। percent হলে
                    amount-এর উপর % হিসাব হবে, fixed হলে নির্দিষ্ট টাকা যোগ হবে।
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input Fields Section */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className={subheadCls}>Deposit Modal Input Fields</h3>
              <button type="button" onClick={addInput} className={btnGhost}>
                + Add Field
              </button>
            </div>

            <div className="space-y-5">
              {inputs.map((f, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-black/40 rounded-xl border border-yellow-800/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-yellow-200 font-medium">
                      Field #{idx + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInput(idx)}
                      disabled={inputs.length === 1}
                      className={`${btnDanger} ${btnSmall}`}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelCls}>Key</label>
                      <input
                        className={inputBase}
                        value={f.key || ""}
                        onChange={(e) => patchInput(idx, "key", e.target.value)}
                        placeholder="amount / trxId / senderNumber"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Type</label>
                      <select
                        className={inputBase}
                        value={f.type || "text"}
                        onChange={(e) =>
                          patchInput(idx, "type", e.target.value)
                        }
                      >
                        <option value="text">text</option>
                        <option value="number">number</option>
                        <option value="tel">tel</option>
                      </select>
                    </div>
                  </div>

                  <BiInput
                    title="Label"
                    bnProps={{
                      value: f.label?.bn || "",
                      onChange: (e) =>
                        patchInputBi(idx, "label", "bn", e.target.value),
                      placeholder: "বাংলা লেবেল",
                    }}
                    enProps={{
                      value: f.label?.en || "",
                      onChange: (e) =>
                        patchInputBi(idx, "label", "en", e.target.value),
                      placeholder: "English label",
                    }}
                  />

                  <BiInput
                    title="Placeholder"
                    bnProps={{
                      value: f.placeholder?.bn || "",
                      onChange: (e) =>
                        patchInputBi(idx, "placeholder", "bn", e.target.value),
                      placeholder: "বাংলা placeholder",
                    }}
                    enProps={{
                      value: f.placeholder?.en || "",
                      onChange: (e) =>
                        patchInputBi(idx, "placeholder", "en", e.target.value),
                      placeholder: "English placeholder",
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-end pt-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-yellow-500"
                          checked={!!f.required}
                          onChange={(e) =>
                            patchInput(idx, "required", e.target.checked)
                          }
                        />
                        <span className="text-yellow-100 font-medium">
                          Required
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className={labelCls}>Min Length</label>
                      <input
                        type="number"
                        className={inputBase}
                        value={Number(f.minLength ?? 0)}
                        onChange={(e) =>
                          patchInput(
                            idx,
                            "minLength",
                            Number(e.target.value || 0),
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Max Length</label>
                      <input
                        type="number"
                        className={inputBase}
                        value={Number(f.maxLength ?? 0)}
                        onChange={(e) =>
                          patchInput(
                            idx,
                            "maxLength",
                            Number(e.target.value || 0),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== ALL METHODS LIST ==================== */}
        <div className={`${cardBase} p-6 md:p-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className={headCls}>All Deposit Methods</h2>
            <div className="flex items-center gap-3">
              <button onClick={refetch} className={btnGhost}>
                Refresh List
              </button>
              <button onClick={clearToCreate} className={btnPrimary}>
                + New Method
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-yellow-400/60 text-center py-16">
              Loading deposit methods...
            </div>
          ) : list.length === 0 ? (
            <div className="text-yellow-400/50 text-center py-16">
              No deposit methods found. Create your first one above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((m) => {
                const displayName = m.methodName?.en || m.methodId || "Unnamed";

                return (
                  <div
                    key={m._id}
                    className="p-5 bg-black/40 rounded-xl border border-yellow-800/30 hover:border-yellow-600/50 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-lg border border-yellow-700/50 overflow-hidden bg-black/50 flex-shrink-0">
                        {m.logoUrl ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}${m.logoUrl}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-yellow-500/40 text-xs font-bold">
                            LOGO
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-yellow-100 text-lg truncate">
                          {displayName}
                        </div>
                        <div className="text-xs text-yellow-400/80 mt-1">
                          ID: {m.methodId} •{" "}
                          {m.isActive ? "Active" : "Inactive"}
                        </div>
                        <div className="text-[11px] text-yellow-400/70 mt-1">
                          Promotions:{" "}
                          {Array.isArray(m.promotions)
                            ? m.promotions.length
                            : 0}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setSelectedId(m._id)}
                        className={`${btnPrimary} ${btnSmall} flex-1`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => requestDelete(m._id, displayName)}
                        className={`${btnDanger} ${btnSmall}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => {
          setDeleteId(null);
          setDeleteName("");
        }}
        onConfirm={confirmDelete}
        methodName={deleteName}
      />
    </div>
  );
};

export default AddDeposit;
