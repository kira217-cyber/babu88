// src/pages/admin/AddWithdraw.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { toast } from "react-toastify";

const emptyBi = { bn: "", en: "" };

const defaultField = () => ({
  key: "",
  label: { ...emptyBi },
  placeholder: { ...emptyBi },
  type: "text", // text | number | tel | email
  required: true,
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
            {methodName || "this withdraw method"}
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
// Main Component – AddWithdraw
// ────────────────────────────────────────────────
const AddWithdraw = () => {
  const qc = useQueryClient();

  const {
    data: list = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["withdraw-methods"],
    queryFn: async () => {
      const res = await api.get("/api/withdraw-methods");
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

  const [fields, setFields] = useState([
    {
      key: "amount",
      label: { bn: "উত্তোলনের পরিমাণ (৳)", en: "Withdraw Amount (৳)" },
      placeholder: { bn: "500", en: "500" },
      type: "number",
      required: true,
    },
    {
      key: "accountNumber",
      label: { bn: "একাউন্ট নম্বর", en: "Account Number" },
      placeholder: { bn: "01XXXXXXXXX", en: "01XXXXXXXXX" },
      type: "tel",
      required: true,
    },
    {
      key: "accountType",
      label: { bn: "একাউন্ট টাইপ", en: "Account Type" },
      placeholder: {
        bn: "Personal / Agent / Merchant",
        en: "Personal / Agent / Merchant",
      },
      type: "text",
      required: true,
    },
  ]);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [saving, setSaving] = useState(false);

  const { register, reset, watch, handleSubmit } = useForm({
    defaultValues: {
      methodId: "",
      name_bn: "",
      name_en: "",
      isActive: true,

      // ✅ NEW
      minimumWithdrawAmount: 0,
      maximumWithdrawAmount: 0,
    },
  });

  // Reset preview + fields when switching methods or create mode
  useEffect(() => {
    setLogoFile(null);
    setLogoPreview(null);

    if (!selected) {
      if (isCreateMode) {
        setFields([
          {
            key: "",
            label: { bn: " ", en: "" },
            placeholder: { bn: "", en: "" },
            type: "number",
            required: true,
          },
        ]);

        // ✅ NEW
        reset((prev) => ({
          ...prev,
          minimumWithdrawAmount: 0,
          maximumWithdrawAmount: 0,
        }));
      }
      return;
    }

    // Edit mode
    reset({
      methodId: selected.methodId || "",
      name_bn: selected.name?.bn || "",
      name_en: selected.name?.en || "",
      isActive: selected.isActive ?? true,

      // ✅ NEW
      minimumWithdrawAmount: selected.minimumWithdrawAmount ?? 0,
      maximumWithdrawAmount: selected.maximumWithdrawAmount ?? 0,
    });

    setFields(
      Array.isArray(selected.fields) && selected.fields.length
        ? selected.fields
        : [defaultField()],
    );

    // Show current logo as preview
    if (selected.logoUrl) {
      setLogoPreview(`${import.meta.env.VITE_API_URL}${selected.logoUrl}`);
    }
  }, [selected, reset, isCreateMode]);

  const clearToCreate = () => {
    setSelectedId("");
    reset({
      methodId: "",
      name_bn: "",
      name_en: "",
      isActive: true,

      // ✅ NEW
      minimumWithdrawAmount: 0,
      maximumWithdrawAmount: 0,
    });
    setFields([
      {
        key: "",
        label: { bn: "", en: "" },
        placeholder: { bn: "", en: "" },
        type: "number",
        required: true,
      },
    ]);
    setLogoFile(null);
    setLogoPreview(null);
  };

  // ─── File preview handler ───
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ─── Withdraw Field Handlers ───
  const addField = () => setFields((p) => [...p, defaultField()]);
  const removeField = (idx) => setFields((p) => p.filter((_, i) => i !== idx));

  const patchField = (idx, key, val) =>
    setFields((p) => p.map((x, i) => (i === idx ? { ...x, [key]: val } : x)));

  const patchFieldBi = (idx, key, lang, val) =>
    setFields((p) =>
      p.map((x, i) =>
        i === idx
          ? { ...x, [key]: { ...(x[key] || emptyBi), [lang]: val } }
          : x,
      ),
    );

  const validateBeforeSave = (values) => {
    const mid = String(values.methodId || "")
      .trim()
      .toUpperCase();
    if (!mid) return "Method ID is required (e.g. NAGAD, BKASH)";
    if (!values.name_bn?.trim() || !values.name_en?.trim())
      return "Both BN & EN method names are required";

    // ✅ NEW (safe sanity)
    const minW = Number(values.minimumWithdrawAmount ?? 0);
    const maxW = Number(values.maximumWithdrawAmount ?? 0);
    if (Number.isNaN(minW) || minW < 0) return "Minimum withdraw must be >= 0";
    if (Number.isNaN(maxW) || maxW < 0) return "Maximum withdraw must be >= 0";
    if (maxW > 0 && minW > maxW)
      return "Minimum withdraw cannot be greater than Maximum withdraw";

    for (const f of fields) {
      if (!String(f.key || "").trim()) return "Field key cannot be empty";
      if (!f.label?.bn?.trim() || !f.label?.en?.trim())
        return "Field label (BN/EN) both required";
      if (!["text", "number", "tel", "email"].includes(f.type || "text"))
        return "Invalid field type";
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
          .toUpperCase(),
      );

      payload.append(
        "name",
        JSON.stringify({
          bn: values.name_bn || "",
          en: values.name_en || "",
        }),
      );

      payload.append("isActive", String(!!values.isActive));

      // ✅ NEW
      payload.append(
        "minimumWithdrawAmount",
        String(values.minimumWithdrawAmount ?? 0),
      );
      payload.append(
        "maximumWithdrawAmount",
        String(values.maximumWithdrawAmount ?? 0),
      );

      payload.append("fields", JSON.stringify(fields));

      if (logoFile) payload.append("logo", logoFile);

      if (selected?._id) {
        await api.put(`/api/withdraw-methods/${selected._id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Method updated successfully");
      } else {
        await api.post(`/api/withdraw-methods`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Method created successfully");
      }

      qc.invalidateQueries({ queryKey: ["withdraw-methods"] });
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
      await api.delete(`/api/withdraw-methods/${deleteId}`);
      toast.success("Method deleted successfully");
      qc.invalidateQueries({ queryKey: ["withdraw-methods"] });
      refetch();
      if (selectedId === deleteId) clearToCreate();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const currentLogoUrl = selected?.logoUrl
    ? `${import.meta.env.VITE_API_URL}${selected.logoUrl}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white p-4 md:p-6">
      <div className="flex flex-col gap-8 max-w-7xl mx-auto">
        {/* ==================== FORM SECTION ==================== */}
        <div className={`${cardBase} p-6 md:p-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className={headCls}>
                {isCreateMode
                  ? "Create New Withdraw Method"
                  : "Update Withdraw Method"}
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
                      watch("name_en") || watch("methodId") || "this method",
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
              <label className={labelCls}>Method ID (unique, uppercase)</label>
              <input
                className={inputBase}
                placeholder="NAGAD / BKASH / ROCKET"
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
                  ...register("name_bn"),
                  placeholder: "যেমন: নগদ",
                }}
                enProps={{
                  ...register("name_en"),
                  placeholder: "e.g. Nagad",
                }}
              />
            </div>

            {/* ✅ NEW: Min/Max Withdraw Amount */}
            <div>
              <label className={labelCls}>Minimum Withdraw Amount (৳)</label>
              <input
                type="number"
                step="0.01"
                className={inputBase}
                {...register("minimumWithdrawAmount", { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className={labelCls}>Maximum Withdraw Amount (৳)</label>
              <input
                type="number"
                step="0.01"
                className={inputBase}
                {...register("maximumWithdrawAmount", { valueAsNumber: true })}
              />
            </div>

            {/* Logo Upload + Preview */}
            <div className="lg:col-span-2">
              <label className={labelCls}>
                Logo {logoPreview ? "(new preview)" : "(current if exists)"}
              </label>

              <div className="mt-3 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                {/* Preview Area */}
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-yellow-600/60 bg-black/40 flex items-center justify-center overflow-hidden relative group cursor-pointer">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : currentLogoUrl ? (
                    <img
                      src={currentLogoUrl}
                      alt="Current logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-yellow-500/50 text-sm font-medium text-center px-4">
                      No logo yet
                      <br />
                      Click to choose
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-60 transition-opacity flex items-center justify-center">
                    <span className="text-yellow-300 text-sm font-medium">
                      Change logo
                    </span>
                  </div>
                </div>

                {/* File Input */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-yellow-900/30 hover:bg-yellow-800/40 border border-yellow-600/50 rounded-lg text-yellow-300 text-sm transition-colors"
                  >
                    Choose Image
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  {logoFile && (
                    <span className="text-xs text-yellow-400/80">
                      Selected: {logoFile.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Withdraw Fields Section */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className={subheadCls}>Withdraw Modal Input Fields</h3>
              <button type="button" onClick={addField} className={btnGhost}>
                + Add Field
              </button>
            </div>

            <div className="space-y-5">
              {fields.map((f, idx) => (
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
                      onClick={() => removeField(idx)}
                      disabled={fields.length === 1}
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
                        onChange={(e) => patchField(idx, "key", e.target.value)}
                        placeholder="amount / accountNumber / email"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Type</label>
                      <select
                        className={inputBase}
                        value={f.type || "text"}
                        onChange={(e) =>
                          patchField(idx, "type", e.target.value)
                        }
                      >
                        <option value="text">text</option>
                        <option value="number">number</option>
                        <option value="tel">tel</option>
                        <option value="email">email</option>
                      </select>
                    </div>
                  </div>

                  <BiInput
                    title="Label"
                    bnProps={{
                      value: f.label?.bn || "",
                      onChange: (e) =>
                        patchFieldBi(idx, "label", "bn", e.target.value),
                      placeholder: "বাংলা লেবেল",
                    }}
                    enProps={{
                      value: f.label?.en || "",
                      onChange: (e) =>
                        patchFieldBi(idx, "label", "en", e.target.value),
                      placeholder: "English label",
                    }}
                  />

                  <BiInput
                    title="Placeholder"
                    bnProps={{
                      value: f.placeholder?.bn || "",
                      onChange: (e) =>
                        patchFieldBi(idx, "placeholder", "bn", e.target.value),
                      placeholder: "বাংলা placeholder",
                    }}
                    enProps={{
                      value: f.placeholder?.en || "",
                      onChange: (e) =>
                        patchFieldBi(idx, "placeholder", "en", e.target.value),
                      placeholder: "English placeholder",
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-end pt-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-yellow-500"
                          checked={f.required !== false}
                          onChange={(e) =>
                            patchField(idx, "required", e.target.checked)
                          }
                        />
                        <span className="text-yellow-100 font-medium">
                          Required
                        </span>
                      </label>
                    </div>

                    <div className="text-xs text-yellow-400/70 flex items-end">
                      Tip: key must be unique (like amount, phone, accountNo)
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
            <h2 className={headCls}>All Withdraw Methods</h2>
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
              Loading withdraw methods...
            </div>
          ) : list.length === 0 ? (
            <div className="text-yellow-400/50 text-center py-16">
              No withdraw methods found. Create your first one above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((m) => {
                const displayName = m.name?.en || m.methodId || "Unnamed";

                return (
                  <div
                    key={m._id}
                    className="p-5 bg-black/40 rounded-xl border border-yellow-800/30 hover:border-yellow-600/50 transition-all duration-200"
                  >
                    <div className="flex items-start gap-5 mb-4">
                      <div className="w-20 h-20 rounded-xl border border-yellow-700/50 overflow-hidden bg-black/50 flex-shrink-0 shadow-sm">
                        {m.logoUrl ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}${m.logoUrl}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-yellow-500/40 text-xs font-bold">
                            NO LOGO
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

                        {/* (Optional) show min/max count, does not affect functionality */}
                        <div className="text-[11px] text-yellow-400/70 mt-1">
                          Min: {Number(m.minimumWithdrawAmount ?? 0)} • Max:{" "}
                          {Number(m.maximumWithdrawAmount ?? 0)}
                        </div>

                        <div className="text-[11px] text-yellow-400/70 mt-1">
                          Fields:{" "}
                          {Array.isArray(m.fields) ? m.fields.length : 0}
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

export default AddWithdraw;
