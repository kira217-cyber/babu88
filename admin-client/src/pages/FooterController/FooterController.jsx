import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaCheck } from "react-icons/fa";
import { api } from "../../api/axios";

// Image upload helper
const uploadImage = async (file) => {
  if (!file) return null;
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await api.post("/api/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
};

// Modal Component
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-b from-black via-yellow-950/40 to-black border border-yellow-700/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl shadow-yellow-900/50 max-h-[90vh] overflow-y-auto"
      >
        {title && (
          <h3 className="text-xl font-bold text-white mb-5 text-center">
            {title}
          </h3>
        )}
        {children}
        <button
          onClick={onClose}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-red-600/80 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-60"
        >
          <FaTimes /> Close
        </button>
      </motion.div>
    </div>
  );
};

const BASE_URL = import.meta.env.VITE_API_URL;

const FooterController = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [section, setSection] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    id: null,
    sec: null,
  });

  const {
    data: footer,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["footer"],
    queryFn: async () => {
      const { data } = await api.get("/api/footer");
      return data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: async (newData) => {
      const { data } = await api.put("/api/footer", newData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["footer"]);
      toast.success("Footer updated successfully!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || "Failed to update footer");
    },
  });

  // Texts + Social + Logo form
  const textsForm = useForm();

  useEffect(() => {
    if (footer) {
      const defaults = {};
      Object.entries(footer.texts?.en || {}).forEach(([key, value]) => {
        defaults[`${key}_en`] = value;
      });
      Object.entries(footer.texts?.bn || {}).forEach(([key, value]) => {
        defaults[`${key}_bn`] = value;
      });
      Object.entries(footer.social || {}).forEach(([key, value]) => {
        defaults[key] = value;
      });
      defaults.logoPreview = footer.logo ? `${BASE_URL}${footer.logo}` : "";
      textsForm.reset(defaults);
    }
  }, [footer, textsForm]);

  const onTextsSubmit = async (formData) => {
    if (!footer) return;

    let newLogoUrl = footer.logo;

    if (formData.logoFile?.[0]) {
      try {
        newLogoUrl = await uploadImage(formData.logoFile[0]);
        toast.success("Logo uploaded successfully");
      } catch (err) {
        toast.error("Logo upload failed");
        return;
      }
    }

    const newFooter = { ...footer };

    newFooter.texts = {
      en: {
        brandAmbassadors: formData.brandAmbassadors_en || "",
        sponsorship: formData.sponsorship_en || "",
        paymentMethods: formData.paymentMethods_en || "",
        responsibleGaming: formData.responsibleGaming_en || "",
        followUs: formData.followUs_en || "",
        tagline: formData.tagline_en || "",
        copyright: formData.copyright_en || "",
        trustedCasino: formData.trustedCasino_en || "",
        description: formData.description_en || "",
        official: formData.official_en || "",
      },
      bn: {
        brandAmbassadors: formData.brandAmbassadors_bn || "",
        sponsorship: formData.sponsorship_bn || "",
        paymentMethods: formData.paymentMethods_bn || "",
        responsibleGaming: formData.responsibleGaming_bn || "",
        followUs: formData.followUs_bn || "",
        tagline: formData.tagline_bn || "",
        copyright: formData.copyright_bn || "",
        trustedCasino: formData.trustedCasino_bn || "",
        description: formData.description_bn || "",
        official: formData.official_bn || "",
      },
    };

    newFooter.social = {
      facebook: formData.facebook || "#",
      youtube: formData.youtube || "#",
      instagram: formData.instagram || "#",
      twitter: formData.twitter || "#",
      telegram: formData.telegram || "#",
    };

    newFooter.logo = newLogoUrl;

    updateMutation.mutate(newFooter);
  };

  // Item form
  const itemForm = useForm();

  const onItemSubmit = async (formData) => {
    if (!footer) return;

    let imgUrl = editItem?.img || "";

    if (formData.imageFile?.[0]) {
      try {
        imgUrl = await uploadImage(formData.imageFile[0]);
      } catch (err) {
        toast.error("Image upload failed");
        return;
      }
    }

    const newItem = {
      name: formData.name?.trim() || "",
      ...(formData.season && { season: formData.season.trim() }),
      img: imgUrl,
    };

    const newFooter = { ...footer };
    const arr = newFooter[section] || [];

    if (editItem) {
      const index = arr.findIndex((i) => i._id === editItem._id);
      if (index !== -1) arr[index] = { ...arr[index], ...newItem };
    } else {
      arr.push(newItem);
    }

    newFooter[section] = arr;
    updateMutation.mutate(newFooter);

    setModalOpen(false);
    itemForm.reset();
  };

  const handleDelete = (id, sec) => {
    setDeleteConfirm({ open: true, id, sec });
  };

  const confirmDelete = () => {
    if (!footer || !deleteConfirm.id) return;
    const newFooter = { ...footer };
    newFooter[deleteConfirm.sec] = (newFooter[deleteConfirm.sec] || []).filter(
      (i) => i._id !== deleteConfirm.id,
    );
    updateMutation.mutate(newFooter);
    setDeleteConfirm({ open: false, id: null, sec: null });
  };

  const openModal = (type, sec, item = null) => {
    setModalType(type);
    setSection(sec);
    setEditItem(item);
    if (item) {
      itemForm.reset({
        name: item.name || "",
        season: item.season || "",
        img: item.img || "",
      });
    } else {
      itemForm.reset();
    }
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Skeleton height={50} className="mb-8 rounded-xl bg-yellow-950/50" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              height={400}
              className="rounded-2xl bg-yellow-950/50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-b from-black via-yellow-950/30 to-black border border-yellow-700/40 rounded-2xl p-8 max-w-2xl mx-auto shadow-xl shadow-yellow-900/30"
        >
          <p className="text-red-400 text-xl font-medium mb-4">
            Failed to load footer data
          </p>
          <p className="text-yellow-200/80 mb-6">
            {error?.message || "Unknown error"}
          </p>
          <button
            onClick={() => queryClient.invalidateQueries(["footer"])}
            className="bg-yellow-600 hover:bg-yellow-500 text-black px-8 py-3 rounded-xl font-medium transition-all cursor-pointer shadow-lg shadow-yellow-600/40"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!footer) {
    return (
      <div className="p-8 text-center text-yellow-300 text-xl">
        No footer data found. Please check server configuration.
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-black via-yellow-950/10 to-black">
      <h1 className="text-3xl lg:text-4xl font-bold text-white mb-8 text-center lg:text-left tracking-tight">
        Footer Controller
      </h1>

      {/* Texts + Social + Logo Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 bg-gradient-to-b from-black via-yellow-950/30 to-black border border-yellow-700/40 rounded-2xl p-6 lg:p-8 shadow-xl shadow-yellow-900/30 backdrop-blur-sm"
      >
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6">
          Texts, Social Links & Logo
        </h2>

        <form
          onSubmit={textsForm.handleSubmit(onTextsSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6"
        >
          {Object.keys(footer.texts?.en || {}).map((key) => (
            <div key={key} className="space-y-4">
              <div>
                <label className="block text-sm text-yellow-100 mb-1.5 font-medium capitalize">
                  {key} (English)
                </label>
                <input
                  {...textsForm.register(`${key}_en`)}
                  className="w-full rounded-xl bg-black/70 border border-yellow-700/50 px-4 py-3 text-white placeholder-yellow-400/60 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all cursor-text"
                />
              </div>
              <div>
                <label className="block text-sm text-yellow-100 mb-1.5 font-medium capitalize">
                  {key} (বাংলা)
                </label>
                <input
                  {...textsForm.register(`${key}_bn`)}
                  className="w-full rounded-xl bg-black/70 border border-yellow-700/50 px-4 py-3 text-white placeholder-yellow-400/60 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all cursor-text"
                />
              </div>
            </div>
          ))}

          {/* Social Links */}
          <div className="md:col-span-2 mt-6">
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-5">
              Social Media Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.keys(footer.social || {}).map((key) => (
                <div key={key}>
                  <label className="block text-sm text-yellow-100 mb-1.5 font-medium capitalize">
                    {key}
                  </label>
                  <input
                    {...textsForm.register(key)}
                    className="w-full rounded-xl bg-black/70 border border-yellow-700/50 px-4 py-3 text-white placeholder-yellow-400/60 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all cursor-text"
                    placeholder="https://..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="md:col-span-2 mt-6">
            <label className="block text-sm text-yellow-100 mb-1.5 font-medium">
              Upload Logo
            </label>
            <input
              type="file"
              accept="image/*"
              {...textsForm.register("logoFile")}
              className="w-full text-sm text-yellow-200 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-700/30 file:text-black hover:file:bg-yellow-600/50 file:transition-all cursor-pointer"
            />
            {textsForm.watch("logoPreview") && (
              <div className="mt-4">
                <p className="text-sm text-yellow-200 mb-2">Current Logo:</p>
                <img
                  src={textsForm.watch("logoPreview")}
                  alt="Current Logo"
                  className="max-h-24 w-auto object-contain rounded-xl border border-yellow-700/50 shadow-md"
                />
              </div>
            )}
          </div>

          <div className="md:col-span-2 mt-8">
            <motion.button
              whileHover={{ scale: updateMutation.isLoading ? 1 : 1.03 }}
              whileTap={{ scale: updateMutation.isLoading ? 1 : 0.97 }}
              disabled={updateMutation.isLoading}
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-semibold rounded-xl shadow-lg shadow-yellow-600/50 hover:shadow-yellow-500/70 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {updateMutation.isLoading ? "Saving..." : "Save All Changes"}
            </motion.button>
          </div>
        </form>
      </motion.section>

      {/* Sections */}
      {["ambassadors", "sponsors", "payments", "responsible"].map((sec) => (
        <motion.section
          key={sec}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 bg-gradient-to-b from-black via-yellow-950/30 to-black border border-yellow-700/40 rounded-2xl p-6 lg:p-8 shadow-xl shadow-yellow-900/30 backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-white capitalize">
              {sec === "ambassadors"
                ? "Brand Ambassadors"
                : sec === "sponsors"
                  ? "Sponsorship"
                  : sec === "payments"
                    ? "Payment Methods"
                    : "Responsible Gaming"}
            </h2>
            <button
              onClick={() => openModal("add", sec)}
              className="flex items-center gap-2 px-5 py-3 bg-yellow-600 hover:bg-yellow-500 text-black rounded-xl font-medium transition-all cursor-pointer shadow-lg shadow-yellow-600/40"
            >
              <FaPlus /> Add New
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-yellow-100">
              <thead>
                <tr className="bg-yellow-900/20">
                  <th className="p-4 text-left font-medium">Name</th>
                  {(sec === "ambassadors" || sec === "sponsors") && (
                    <th className="p-4 text-left font-medium">Season</th>
                  )}
                  <th className="p-4 text-left font-medium">Image</th>
                  <th className="p-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(footer[sec] || []).map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-yellow-800/30 hover:bg-yellow-900/20 transition-colors"
                  >
                    <td className="p-4">{item.name}</td>
                    {(sec === "ambassadors" || sec === "sponsors") && (
                      <td className="p-4">{item.season || "—"}</td>
                    )}
                    <td className="p-4">
                      {item.img ? (
                        <img
                          src={`${BASE_URL}${item.img}`}
                          alt={item.name}
                          className="h-16 w-auto object-contain rounded-lg border border-yellow-700/50"
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4 text-center flex justify-center gap-6">
                      <button
                        onClick={() => openModal("edit", sec, item)}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <FaEdit size={22} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, sec)}
                        className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <FaTrash size={22} />
                      </button>
                    </td>
                  </tr>
                ))}
                {(footer[sec] || []).length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-yellow-200/70"
                    >
                      No items found in this section
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.section>
      ))}

      {/* Add/Edit Item Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editItem
            ? `Edit ${section.charAt(0).toUpperCase() + section.slice(1)}`
            : `Add New ${section.charAt(0).toUpperCase() + section.slice(1)}`
        }
      >
        <form
          onSubmit={itemForm.handleSubmit(onItemSubmit)}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm text-yellow-100 mb-1.5 font-medium">
              Name *
            </label>
            <input
              {...itemForm.register("name", { required: "Name is required" })}
              className="w-full rounded-xl bg-black/70 border border-yellow-700/50 px-4 py-3 text-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all cursor-text"
            />
            {itemForm.formState.errors.name && (
              <p className="text-red-400 text-xs mt-1.5">
                {itemForm.formState.errors.name.message}
              </p>
            )}
          </div>

          {(section === "ambassadors" || section === "sponsors") && (
            <div>
              <label className="block text-sm text-yellow-100 mb-1.5 font-medium">
                Season
              </label>
              <input
                {...itemForm.register("season")}
                className="w-full rounded-xl bg-black/70 border border-yellow-700/50 px-4 py-3 text-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all cursor-text"
                placeholder="e.g. 2024/2025"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-yellow-100 mb-1.5 font-medium">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              {...itemForm.register("imageFile")}
              className="w-full text-yellow-200 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-700/30 file:text-black hover:file:bg-yellow-600/50 cursor-pointer"
            />
            {editItem?.img && (
              <div className="mt-4">
                <p className="text-sm text-yellow-200 mb-2">Current Image:</p>
                <img
                  src={`${BASE_URL}${editItem.img}`}
                  alt="Current"
                  className="max-h-32 w-auto object-contain rounded-xl border border-yellow-700/50 shadow-md"
                />
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: updateMutation.isLoading ? 1 : 1.03 }}
            whileTap={{ scale: updateMutation.isLoading ? 1 : 0.97 }}
            disabled={updateMutation.isLoading}
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-semibold rounded-xl shadow-lg shadow-yellow-600/50 hover:shadow-yellow-500/70 transition-all cursor-pointer disabled:opacity-60"
          >
            {updateMutation.isLoading
              ? "Saving..."
              : editItem
                ? "Update Item"
                : "Add Item"}
          </motion.button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, sec: null })}
      >
        <h3 className="text-xl font-bold text-white mb-5 text-center">
          Confirm Deletion
        </h3>
        <p className="text-yellow-200/90 mb-6 text-center">
          Are you sure you want to delete this item? This action cannot be
          undone.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={confirmDelete}
            disabled={updateMutation.isLoading}
            className="flex-1 py-3 bg-red-600/80 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <FaCheck /> Yes, Delete
          </button>
          <button
            onClick={() =>
              setDeleteConfirm({ open: false, id: null, sec: null })
            }
            className="flex-1 py-3 bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <FaTimes /> Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FooterController;
