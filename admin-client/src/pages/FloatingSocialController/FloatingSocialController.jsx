// src/pages/FloatingSocialController/FloatingSocialController.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import { FaPlus, FaTrash, FaSave, FaEdit } from "react-icons/fa";

const fetchFloatingSocial = async () => {
  const { data } = await api.get("/api/floating-social");
  return data;
};

const saveFloatingSocial = async (formData) => {
  const { data } = await api.put("/api/floating-social", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const emptyItem = () => ({
  iconUrl: "",
  url: "",
  isActive: true,
  order: 0,
  file: null,
  preview: "",
});

const FloatingSocialController = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-floating-social"],
    queryFn: fetchFloatingSocial,
    staleTime: 0,
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!data?.items) return;

    const list = data.items.map((x) => ({
      iconUrl: x.iconUrl || "",
      url: x.url || "",
      isActive: x.isActive !== false,
      order: x.order ?? 0,
      file: null,
      preview: x.iconUrl ? `${api.defaults.baseURL}${x.iconUrl}` : "",
    }));

    list.sort((a, b) => a.order - b.order);

    setItems(list);
  }, [data]);

  const addItem = () => {
    setItems((prev) => {
      const next = [...prev, emptyItem()];
      next[next.length - 1].order = next.length;
      return next;
    });
  };

  const removeItem = (idx) => {
    if (window.confirm("Are you sure you want to delete this social item?")) {
      setItems((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const updateItem = (idx, patch) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    );
  };

  const onPickFile = (idx, file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);

    const prev = items[idx]?.preview;
    if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);

    updateItem(idx, { file, preview: url });
  };

  const mutation = useMutation({
    mutationFn: saveFloatingSocial,
    onSuccess: (res) => {
      toast.success(res?.message || "Floating Social Links Saved!");
      qc.invalidateQueries({ queryKey: ["admin-floating-social"] });
      qc.invalidateQueries({ queryKey: ["floating-social"] });
    },
    onError: (err) => toast.error(err?.response?.data?.error || "Save failed"),
  });

  const handleSave = () => {
    const fd = new FormData();

    const payload = items.map((it, idx) => ({
      iconUrl: it.iconUrl || "",
      url: it.url.trim() || "",
      isActive: it.isActive !== false,
      order: Number(it.order) || idx + 1,
    }));

    fd.append("items", JSON.stringify(payload));

    items.forEach((it, idx) => {
      if (it.file) {
        fd.append(`icon_${idx}`, it.file);
      }
    });

    mutation.mutate(fd);
  };

  const canSave = useMemo(() => {
    return items.every((item) => item.url.trim() !== "");
  }, [items]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-black via-yellow-950/10 to-black">
      <div className="w-full max-w-5xl mx-auto bg-gradient-to-b from-black via-yellow-950/30 to-black border border-yellow-700/40 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-yellow-900/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Floating Social Controller
            </h2>
            <p className="text-yellow-200/80 text-sm mt-1">
              Manage social icons shown on the right side of the screen
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-medium rounded-xl shadow-lg transition-all cursor-pointer border border-yellow-500/40"
          >
            <FaPlus /> Add New Social
          </button>
        </div>

        {isLoading ? (
          <div className="text-yellow-300 text-center py-12 text-lg font-medium">
            Loading floating social items...
          </div>
        ) : (
          <div className="space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-12 bg-black/50 rounded-2xl border border-yellow-700/30 text-yellow-300/80">
                No social items yet. Click "Add New Social" to start.
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-black/60 border border-yellow-700/40 rounded-2xl p-5 sm:p-6 hover:border-yellow-500/60 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                      <span className="inline-block text-center w-8 h-8 bg-yellow-700/50 text-black rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      Social Item
                    </h3>

                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-900/60 hover:bg-red-800/70 text-red-200 rounded-lg transition-all cursor-pointer"
                    >
                      <FaTrash size={14} /> Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left column */}
                    <div className="space-y-5">
                      <div>
                        <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
                          Social URL
                        </label>
                        <input
                          className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all placeholder-yellow-500/60"
                          placeholder="https://wa.me/88017xxxxxxxx  or  https://facebook.com/..."
                          value={item.url}
                          onChange={(e) =>
                            updateItem(idx, { url: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
                          Display Order
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="w-full bg-black/70 text-white border border-yellow-700/50 rounded-xl p-4 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all"
                          value={item.order}
                          onChange={(e) =>
                            updateItem(idx, { order: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-yellow-500 rounded cursor-pointer"
                          checked={item.isActive}
                          onChange={(e) =>
                            updateItem(idx, { isActive: e.target.checked })
                          }
                        />
                        <label className="text-yellow-100 font-semibold cursor-pointer">
                          Active
                        </label>
                      </div>
                    </div>

                    {/* Right column - Icon */}
                    <div className="space-y-5">
                      <div>
                        <label className="block text-yellow-100/90 text-sm font-bold mb-2 cursor-pointer">
                          Social Icon (PNG, SVG, ICO, GIF)
                        </label>
                        <input
                          type="file"
                          accept="image/*,.ico,.svg,.gif"
                          className="block w-full text-sm text-yellow-200 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-700/30 file:text-black hover:file:bg-yellow-600/50 file:cursor-pointer cursor-pointer bg-black/70 border border-yellow-700/50 rounded-xl p-4"
                          onChange={(e) => onPickFile(idx, e.target.files?.[0])}
                        />
                      </div>

                      <div className="flex flex-col items-center">
                        {item.preview ? (
                          <div className="bg-black/50 border border-yellow-700/40 rounded-xl p-4 shadow-inner">
                            <img
                              src={item.preview}
                              alt="Social icon preview"
                              className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                              draggable={false}
                            />
                          </div>
                        ) : (
                          <div className="text-yellow-300/60 text-sm text-center py-6">
                            No icon selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Save Button */}
            <div className="pt-6">
              <button
                type="button"
                disabled={mutation.isPending || !canSave || items.length === 0}
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-3 py-4 px-10 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-xl text-black font-bold text-lg shadow-lg shadow-yellow-600/50 hover:shadow-yellow-500/70 transition-all duration-300 disabled:opacity-60 cursor-pointer border border-yellow-500/30"
              >
                <FaSave />
                {mutation.isPending
                  ? "Saving..."
                  : "Save Floating Social Links"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingSocialController;
