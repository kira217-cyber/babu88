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
  const [previewImage, setPreviewImage] = useState(null); // Create preview
  const [editPreviews, setEditPreviews] = useState({}); // Edit previews
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { order: 0, active: true, image: null },
  });

  // Watch image field for create preview
  const watchedImage = watch("image");

  useEffect(() => {
    if (watchedImage && watchedImage[0]) {
      const file = watchedImage[0];
      const url = URL.createObjectURL(file);
      setPreviewImage(url);

      // Cleanup function
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewImage(null);
    }
  }, [watchedImage]);

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
      setPreviewImage(null);
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
    const file = values.image?.[0];
    if (!file) return toast.error("Image is required");

    const fd = new FormData();
    fd.append("image", file);
    fd.append("order", values.order ?? 0);
    fd.append("active", values.active ?? true);

    createMut.mutate(fd);
  };

  const handleEditImageChange = (e, sliderId) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setEditPreviews((prev) => ({ ...prev, [sliderId]: url }));
    }
  };

  const onUpdate = (slider, e) => {
    e.preventDefault();
    const form = e.target;

    const fd = new FormData();
    fd.append("order", form.order.value ?? 0);
    fd.append("active", form.active.checked);
    if (form.image.files?.[0]) {
      fd.append("image", form.image.files[0]);
    }

    updateMut.mutate({ id: slider._id, formData: fd });
  };

  const confirmDelete = () => {
    if (deleteId) deleteMut.mutate(deleteId);
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 text-center lg:text-left">
        Slider Controller
      </h2>

      {/* Create Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit(onCreate)}
        className="bg-gradient-to-b from-indigo-950/70 to-purple-950/60 border border-purple-700/40 rounded-2xl p-6 space-y-5 mb-10 shadow-xl shadow-purple-900/30 backdrop-blur-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-cyan-100 mb-1.5 font-medium">
              Order
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-xl bg-slate-900/60 border border-purple-700/50 px-4 py-3 text-cyan-100 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 cursor-text"
              {...register("order", { valueAsNumber: true })}
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3 text-cyan-100 font-medium cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
                defaultChecked
                {...register("active")}
              />
              Active
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm text-cyan-100 mb-1.5 font-medium">
            Image (required)
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-sm text-cyan-200 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-700/30 file:text-cyan-100 hover:file:bg-purple-600/40 file:transition-all cursor-pointer"
            {...register("image", { required: "Image is required" })}
          />
          {errors.image && (
            <p className="text-xs text-red-400 mt-1.5">
              {errors.image.message}
            </p>
          )}
        </div>

        {/* Preview for new slider */}
        {previewImage && (
          <div className="mt-4">
            <p className="text-sm text-cyan-100 mb-2 font-medium">Preview:</p>
            <div className="rounded-xl overflow-hidden border border-purple-700/50 shadow-md">
              <img
                src={previewImage}
                alt="New slider preview"
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        )}

        <motion.button
          whileHover={{ scale: createMut.isPending ? 1 : 1.03 }}
          whileTap={{ scale: createMut.isPending ? 1 : 0.97 }}
          disabled={createMut.isPending}
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-cyan-600 via-purple-600 to-indigo-600 hover:from-cyan-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/40 hover:shadow-purple-500/60 transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {createMut.isPending ? "Uploading..." : "Create New Slider"}
        </motion.button>
      </motion.form>

      {/* Slider List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliders.map((s) => (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-b from-indigo-950/70 to-purple-950/60 border border-purple-700/40 rounded-2xl p-6 shadow-lg shadow-purple-900/30 backdrop-blur-sm"
            >
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <img
                  src={`${import.meta.env.VITE_API_URL}${s.imageUrl}`}
                  alt="slider"
                  className="w-full md:w-40 h-32 object-cover rounded-xl border border-purple-700/50"
                />

                <div className="flex-1 w-full">
                  <div className="text-cyan-100 font-semibold mb-3">
                    Order: {s.order} | Active: {String(s.active)}
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <button
                      onClick={() =>
                        setEditingId(editingId === s._id ? null : s._id)
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/20 text-cyan-100 hover:bg-cyan-600/30 transition-colors cursor-pointer"
                    >
                      <FaEdit /> {editingId === s._id ? "Close" : "Edit"}
                    </button>

                    <button
                      onClick={() => {
                        setDeleteId(s._id);
                        setShowDeleteModal(true);
                      }}
                      disabled={deleteMut.isPending}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600/30 transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>

                  {editingId === s._id && (
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={(e) => onUpdate(s, e)}
                      className="mt-4 space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-cyan-100 mb-1 font-medium">
                            Order
                          </label>
                          <input
                            name="order"
                            type="number"
                            defaultValue={s.order ?? 0}
                            className="w-full rounded-xl bg-slate-900/60 border border-purple-700/50 px-4 py-3 text-cyan-100 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 cursor-text"
                          />
                        </div>

                        <div className="flex items-center gap-3 mt-6 md:mt-0">
                          <label className="text-sm text-cyan-100 font-medium flex items-center gap-2 cursor-pointer">
                            <input
                              name="active"
                              type="checkbox"
                              defaultChecked={!!s.active}
                              className="w-5 h-5 accent-cyan-500 cursor-pointer"
                            />
                            Active
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-cyan-100 mb-1 font-medium">
                          Replace Image (Optional)
                        </label>
                        <input
                          name="image"
                          type="file"
                          accept="image/*"
                          className="w-full text-cyan-200 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-600/20 file:text-cyan-100 hover:file:bg-cyan-600/30 transition-colors cursor-pointer"
                          onChange={(e) => handleEditImageChange(e, s._id)}
                        />
                      </div>

                      {(editPreviews[s._id] ||
                        `${import.meta.env.VITE_API_URL}${s.imageUrl}`) && (
                        <div className="mt-4">
                          <p className="text-sm text-cyan-100 mb-2">Preview:</p>
                          <img
                            src={
                              editPreviews[s._id] ||
                              `${import.meta.env.VITE_API_URL}${s.imageUrl}`
                            }
                            alt="Edit Preview"
                            className="w-full max-h-48 object-contain rounded-xl border border-purple-700/50"
                          />
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: updateMut.isPending ? 1 : 1.03 }}
                        whileTap={{ scale: updateMut.isPending ? 1 : 0.97 }}
                        disabled={updateMut.isPending}
                        type="submit"
                        className="w-full bg-gradient-to-r from-cyan-600 via-purple-600 to-indigo-600 hover:from-cyan-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-600/40 hover:shadow-purple-500/60 transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                      >
                        {updateMut.isPending ? "Updating..." : "Update Slider"}
                      </motion.button>
                    </motion.form>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {!sliders.length && (
            <div className="col-span-full text-center py-10 text-cyan-200/80 text-lg">
              No sliders found. Create your first slider above.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-b from-indigo-950/90 to-purple-950/80 border border-purple-700/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-purple-900/50"
          >
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Confirm Deletion
            </h3>
            <p className="text-cyan-200/80 mb-6 text-center">
              Are you sure you want to delete this slider image? This action
              cannot be undone.
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
                className="flex items-center gap-2 px-6 py-3 bg-cyan-600/20 text-cyan-100 rounded-xl hover:bg-cyan-600/30 transition-colors cursor-pointer"
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
