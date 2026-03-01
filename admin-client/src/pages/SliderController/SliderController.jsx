import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { api } from "../../api/axios";
import { FaTrash, FaEdit, FaTimes, FaCheck } from "react-icons/fa";

const fetchAll = async () => {
  const { data } = await api.get("/api/sliders/all");
  return data.sliders || [];
};

const createOne = async (formData) => {
  const { data } = await api.post("/api/sliders", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const updateOne = async ({ id, formData }) => {
  const { data } = await api.put(`/api/sliders/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const deleteOne = async (id) => {
  const { data } = await api.delete(`/api/sliders/${id}`);
  return data;
};

const SliderController = () => {
  const qc = useQueryClient();

  const [editingId, setEditingId] = useState(null);

  // create previews
  const [previewDesktop, setPreviewDesktop] = useState(null);
  const [previewMobile, setPreviewMobile] = useState(null);

  // edit previews
  const [editPreviews, setEditPreviews] = useState({}); // { [id]: { desktop, mobile } }

  // delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      order: 0,
      active: true,
      imageDesktop: null,
      imageMobile: null,
    },
  });

  const watchedDesktop = watch("imageDesktop");
  const watchedMobile = watch("imageMobile");

  useEffect(() => {
    if (watchedDesktop && watchedDesktop[0]) {
      const url = URL.createObjectURL(watchedDesktop[0]);
      setPreviewDesktop(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewDesktop(null);
    }
  }, [watchedDesktop]);

  useEffect(() => {
    if (watchedMobile && watchedMobile[0]) {
      const url = URL.createObjectURL(watchedMobile[0]);
      setPreviewMobile(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewMobile(null);
    }
  }, [watchedMobile]);

  const { data: sliders = [], isLoading } = useQuery({
    queryKey: ["sliders-admin"],
    queryFn: fetchAll,
  });

  const createMut = useMutation({
    mutationFn: createOne,
    onSuccess: (res) => {
      toast.success(res?.message || "Slider created successfully");
      qc.invalidateQueries({ queryKey: ["sliders-admin"] });
      qc.invalidateQueries({ queryKey: ["sliders-public"] });
      reset();
      setPreviewDesktop(null);
      setPreviewMobile(null);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to create slider"),
  });

  const updateMut = useMutation({
    mutationFn: updateOne,
    onSuccess: () => {
      toast.success("Slider updated successfully");
      qc.invalidateQueries({ queryKey: ["sliders-admin"] });
      qc.invalidateQueries({ queryKey: ["sliders-public"] });
      setEditingId(null);
      setEditPreviews({});
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to update slider"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteOne,
    onSuccess: () => {
      toast.success("Slider deleted successfully");
      qc.invalidateQueries({ queryKey: ["sliders-admin"] });
      qc.invalidateQueries({ queryKey: ["sliders-public"] });
      setShowDeleteModal(false);
      setDeleteId(null);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to delete slider"),
  });

  const onCreate = (values) => {
    const desktopFile = values.imageDesktop?.[0];
    const mobileFile = values.imageMobile?.[0];

    if (!desktopFile) return toast.error("Desktop image is required");
    if (!mobileFile) return toast.error("Mobile image is required");

    const fd = new FormData();
    fd.append("imageDesktop", desktopFile);
    fd.append("imageMobile", mobileFile);
    fd.append("order", values.order ?? 0);
    fd.append("active", values.active ?? true);

    createMut.mutate(fd);
  };

  const setEditPreview = (sliderId, type, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setEditPreviews((prev) => ({
      ...prev,
      [sliderId]: { ...(prev[sliderId] || {}), [type]: url },
    }));
  };

  const onUpdate = (slider, e) => {
    e.preventDefault();
    const form = e.target;

    const fd = new FormData();
    fd.append("order", form.order.value ?? 0);
    fd.append("active", form.active.checked);

    if (form.imageDesktop?.files?.[0]) {
      fd.append("imageDesktop", form.imageDesktop.files[0]);
    }
    if (form.imageMobile?.files?.[0]) {
      fd.append("imageMobile", form.imageMobile.files[0]);
    }

    updateMut.mutate({ id: slider._id, formData: fd });
  };

  const confirmDelete = () => {
    if (deleteId) deleteMut.mutate(deleteId);
  };

  const apiBase = import.meta.env.VITE_API_URL;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto bg-gradient-to-br from-black via-yellow-950/10 to-black min-h-screen">
      <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 text-center lg:text-left">
        Slider Controller
      </h2>

      {/* Create Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit(onCreate)}
        className="bg-gradient-to-b from-black via-yellow-950/30 to-black border border-yellow-700/40 rounded-2xl p-6 space-y-5 mb-10 shadow-xl shadow-yellow-900/30 backdrop-blur-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-yellow-100 mb-1.5 font-medium">
              Order
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-xl bg-black/70 border border-yellow-700/50 px-4 py-3 text-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all duration-300 cursor-text"
              {...register("order", { valueAsNumber: true })}
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3 text-yellow-100 font-medium cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 accent-yellow-500 cursor-pointer"
                defaultChecked
                {...register("active")}
              />
              Active
            </label>
          </div>
        </div>

        {/* Desktop upload */}
        <div>
          <label className="block text-sm text-yellow-100 mb-1.5 font-medium">
            Desktop Image (required)
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-sm text-yellow-200 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-700/30 file:text-black hover:file:bg-yellow-600/50 file:transition-all cursor-pointer"
            {...register("imageDesktop", {
              required: "Desktop image is required",
            })}
          />
          {errors.imageDesktop && (
            <p className="text-xs text-red-400 mt-1.5">
              {errors.imageDesktop.message}
            </p>
          )}
        </div>

        {/* Mobile upload */}
        <div>
          <label className="block text-sm text-yellow-100 mb-1.5 font-medium">
            Mobile Image (required)
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-sm text-yellow-200 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-700/30 file:text-black hover:file:bg-yellow-600/50 file:transition-all cursor-pointer"
            {...register("imageMobile", {
              required: "Mobile image is required",
            })}
          />
          {errors.imageMobile && (
            <p className="text-xs text-red-400 mt-1.5">
              {errors.imageMobile.message}
            </p>
          )}
        </div>

        {/* Previews */}
        {(previewDesktop || previewMobile) && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {previewDesktop && (
              <div>
                <p className="text-sm text-yellow-100 mb-2 font-medium">
                  Desktop Preview:
                </p>
                <div className="rounded-xl overflow-hidden border border-yellow-700/50 shadow-md">
                  <img
                    src={previewDesktop}
                    alt="Desktop preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            )}
            {previewMobile && (
              <div>
                <p className="text-sm text-yellow-100 mb-2 font-medium">
                  Mobile Preview:
                </p>
                <div className="rounded-xl overflow-hidden border border-yellow-700/50 shadow-md">
                  <img
                    src={previewMobile}
                    alt="Mobile preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <motion.button
          whileHover={{ scale: createMut.isPending ? 1 : 1.03 }}
          whileTap={{ scale: createMut.isPending ? 1 : 0.97 }}
          disabled={createMut.isPending}
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-semibold rounded-xl shadow-lg shadow-yellow-600/50 hover:shadow-yellow-500/70 transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {createMut.isPending ? "Uploading..." : "Create New Slider"}
        </motion.button>
      </motion.form>

      {/* Slider List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliders.map((s) => {
            const desktopUrl = `${apiBase}${s.imageUrlDesktop}`;
            const mobileUrl = `${apiBase}${s.imageUrlMobile}`;

            const editDesktop = editPreviews?.[s._id]?.desktop;
            const editMobile = editPreviews?.[s._id]?.mobile;

            return (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-b from-black via-yellow-950/30 to-black border border-yellow-700/40 rounded-2xl p-6 shadow-lg shadow-yellow-900/30 backdrop-blur-sm"
              >
                <div className="text-yellow-100 font-semibold mb-3">
                  Order: {s.order} | Active: {String(s.active)}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-xl overflow-hidden border border-yellow-700/50">
                    <div className="text-xs text-yellow-200 px-3 py-2 bg-black/50 border-b border-yellow-700/30">
                      Desktop
                    </div>
                    <img
                      src={editDesktop || desktopUrl}
                      alt="desktop slider"
                      className="w-full h-40 object-cover"
                      draggable={false}
                    />
                  </div>

                  <div className="rounded-xl overflow-hidden border border-yellow-700/50">
                    <div className="text-xs text-yellow-200 px-3 py-2 bg-black/50 border-b border-yellow-700/30">
                      Mobile
                    </div>
                    <img
                      src={editMobile || mobileUrl}
                      alt="mobile slider"
                      className="w-full h-40 object-cover"
                      draggable={false}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={() =>
                      setEditingId(editingId === s._id ? null : s._id)
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-600/20 text-yellow-100 hover:bg-yellow-600/40 transition-colors cursor-pointer"
                  >
                    <FaEdit /> {editingId === s._id ? "Close" : "Edit"}
                  </button>

                  <button
                    onClick={() => {
                      setDeleteId(s._id);
                      setShowDeleteModal(true);
                    }}
                    disabled={deleteMut.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/30 text-red-200 hover:bg-red-700/50 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>

                {editingId === s._id && (
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={(e) => onUpdate(s, e)}
                    className="mt-5 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-yellow-100 mb-1 font-medium">
                          Order
                        </label>
                        <input
                          name="order"
                          type="number"
                          defaultValue={s.order ?? 0}
                          className="w-full rounded-xl bg-black/70 border border-yellow-700/50 px-4 py-3 text-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all duration-300 cursor-text"
                        />
                      </div>

                      <div className="flex items-center gap-3 mt-6 md:mt-0">
                        <label className="text-sm text-yellow-100 font-medium flex items-center gap-2 cursor-pointer">
                          <input
                            name="active"
                            type="checkbox"
                            defaultChecked={!!s.active}
                            className="w-5 h-5 accent-yellow-500 cursor-pointer"
                          />
                          Active
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-yellow-100 mb-1 font-medium">
                          Replace Desktop Image (Optional)
                        </label>
                        <input
                          name="imageDesktop"
                          type="file"
                          accept="image/*"
                          className="w-full text-yellow-200 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-700/30 file:text-black hover:file:bg-yellow-600/50 transition-colors cursor-pointer"
                          onChange={(e) =>
                            setEditPreview(
                              s._id,
                              "desktop",
                              e.target.files?.[0],
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-yellow-100 mb-1 font-medium">
                          Replace Mobile Image (Optional)
                        </label>
                        <input
                          name="imageMobile"
                          type="file"
                          accept="image/*"
                          className="w-full text-yellow-200 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-700/30 file:text-black hover:file:bg-yellow-600/50 transition-colors cursor-pointer"
                          onChange={(e) =>
                            setEditPreview(s._id, "mobile", e.target.files?.[0])
                          }
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: updateMut.isPending ? 1 : 1.03 }}
                      whileTap={{ scale: updateMut.isPending ? 1 : 0.97 }}
                      disabled={updateMut.isPending}
                      type="submit"
                      className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-semibold py-3 rounded-xl shadow-lg shadow-yellow-600/50 hover:shadow-yellow-500/70 transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {updateMut.isPending ? "Updating..." : "Update Slider"}
                    </motion.button>
                  </motion.form>
                )}
              </motion.div>
            );
          })}

          {!sliders.length && (
            <div className="col-span-full text-center py-10 text-yellow-200/80 text-lg">
              No sliders found. Create your first slider above.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-b from-black via-yellow-950/40 to-black border border-yellow-700/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-yellow-900/50"
          >
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Confirm Deletion
            </h3>
            <p className="text-yellow-200/80 mb-6 text-center">
              Are you sure you want to delete this slider? This action cannot be
              undone.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={confirmDelete}
                disabled={deleteMut.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-red-600/80 text-white rounded-xl hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60"
              >
                <FaCheck /> Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-600/30 text-yellow-100 rounded-xl hover:bg-yellow-600/50 transition-colors cursor-pointer"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SliderController;
