import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AffFloatingSocialController = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);

  // Modals states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editLinkValue, setEditLinkValue] = useState("");
  const [addImageFile, setAddImageFile] = useState(null);
  const [addLinkValue, setAddLinkValue] = useState("");

  const addModalRef = useRef(null);
  const editModalRef = useRef(null);
  const deleteModalRef = useRef(null);

  // ── Consistent styles (sidebar match) ─────────────────────────────────────
  const container =
    "min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white p-4 md:p-6 lg:p-8";
  const card =
    "bg-gradient-to-b from-black/80 via-yellow-950/30 to-black border border-yellow-700/40 rounded-xl shadow-2xl shadow-yellow-900/20 overflow-hidden";
  const sectionTitle =
    "text-xl md:text-2xl font-bold text-yellow-400 mb-6 px-5 pt-5";
  const label =
    "text-xs md:text-sm text-yellow-300/80 mb-1.5 font-medium block";
  const inputBase =
    "w-full bg-black/60 border border-yellow-700/50 rounded-lg px-4 py-2.5 text-white placeholder-yellow-400/50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 transition-all duration-200 cursor-pointer";
  const btnBase =
    "px-5 py-2.5 rounded-lg font-medium text-sm md:text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn = `${btnBase} bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-600/40`;
  const secondaryBtn = `${btnBase} bg-white/10 hover:bg-white/20 text-white border border-yellow-600/40`;
  const dangerBtn = `${btnBase} bg-red-900/60 hover:bg-red-800/70 text-white border border-red-600/40`;

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/aff-floating-social");
      setItems(data || []);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Failed to load floating social icons",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Close modals on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addModalRef.current && !addModalRef.current.contains(event.target)) {
        setIsAddModalOpen(false);
        setAddImageFile(null);
        setAddLinkValue("");
      }
      if (
        editModalRef.current &&
        !editModalRef.current.contains(event.target)
      ) {
        setIsEditModalOpen(false);
      }
      if (
        deleteModalRef.current &&
        !deleteModalRef.current.contains(event.target)
      ) {
        setIsDeleteModalOpen(false);
      }
    };

    if (isAddModalOpen || isEditModalOpen || isDeleteModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddModalOpen, isEditModalOpen, isDeleteModalOpen]);

  const pickFile = () =>
    new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => resolve(e.target.files?.[0] || null);
      input.click();
    });

  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      toast.info("Uploading image...");
      const fd = new FormData();
      fd.append("image", file);

      const { data } = await api.post("/api/aff-floating-social/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!data?.url) {
        toast.error("Upload failed - no URL returned");
        return null;
      }

      toast.success("Image uploaded");
      return data.url;
    } catch (e) {
      toast.error(e?.response?.data?.message || "Image upload failed");
      return null;
    }
  };

  const handleAddSubmit = async () => {
    if (!addImageFile) {
      toast.warn("Please select an image first");
      return;
    }

    if (!addLinkValue.trim()) {
      toast.warn("Link URL cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const uploadedUrl = await uploadImage(addImageFile);
      if (!uploadedUrl) return;

      const res = await api.post("/api/aff-floating-social", {
        imageUrl: uploadedUrl,
        linkUrl: addLinkValue.trim(),
      });

      toast.success("New floating icon added");
      setItems((prev) => [res.data, ...prev]);
      setIsAddModalOpen(false);
      setAddImageFile(null);
      setAddLinkValue("");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add new icon");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setEditLinkValue(item.linkUrl || "");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedItem || !editLinkValue.trim()) {
      toast.warn("Link cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const res = await api.put(
        `/api/aff-floating-social/${selectedItem._id}`,
        {
          linkUrl: editLinkValue.trim(),
        },
      );

      toast.success("Link updated successfully");
      setItems((prev) =>
        prev.map((i) => (i._id === selectedItem._id ? res.data : i)),
      );
      setIsEditModalOpen(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      await api.delete(`/api/aff-floating-social/${selectedItem._id}`);
      toast.success("Icon deleted successfully");
      setItems((prev) => prev.filter((i) => i._id !== selectedItem._id));
      setIsDeleteModalOpen(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  const handleChangeImage = async (id) => {
    const newUrl = await uploadImage(await pickFile());
    if (newUrl) {
      try {
        setSaving(true);
        const res = await api.put(`/api/aff-floating-social/${id}`, {
          imageUrl: newUrl,
        });
        toast.success("Image updated successfully");
        setItems((prev) => prev.map((i) => (i._id === id ? res.data : i)));
      } catch (e) {
        toast.error("Image update failed");
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className={container}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-yellow-400 text-lg animate-pulse">
            Loading floating social icons...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={container}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-yellow-400 tracking-tight">
              Floating Social Icons Controller
            </h1>
            <p className="text-sm text-yellow-200/70 mt-1">
              Add, edit or remove multiple floating social icons (image + click
              link)
            </p>
          </div>

          <button
            className={primaryBtn}
            onClick={() => setIsAddModalOpen(true)}
            disabled={saving}
          >
            + Add New Floating Icon
          </button>
        </div>

        {/* List of icons */}
        <div className={card}>
          <h3 className={sectionTitle}>
            Floating Social Icons ({items.length})
          </h3>

          {items.length === 0 ? (
            <div className="px-5 pb-10 text-center text-yellow-400/70 py-16">
              No floating icons added yet.
              <br />
              Click "+ Add New Floating Icon" to create one.
            </div>
          ) : (
            <div className="px-5 pb-8 divide-y divide-yellow-800/30">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 sm:items-center"
                >
                  {/* Image preview */}
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt="floating social icon"
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-yellow-600/30 shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-500 border-2 border-dashed border-gray-600">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Info & Actions */}
                  <div className="flex-1">
                    <div className="mb-3">
                      <p className="text-sm font-medium text-yellow-300">
                        Click URL:
                      </p>
                      <p className="text-sm text-white break-all mt-1">
                        {item.linkUrl || (
                          <span className="text-red-400">Not set</span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        className={secondaryBtn}
                        onClick={() => handleChangeImage(item._id)}
                        disabled={saving}
                      >
                        Change Image
                      </button>

                      <button
                        className={secondaryBtn}
                        onClick={() => openEditModal(item)}
                        disabled={saving}
                      >
                        Edit Link
                      </button>

                      <button
                        className={dangerBtn}
                        onClick={() => openDeleteModal(item)}
                        disabled={saving}
                      >
                        Delete Icon
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div
              ref={addModalRef}
              className="bg-gradient-to-b from-black/90 to-yellow-950/40 border border-yellow-700/50 rounded-xl shadow-2xl shadow-yellow-900/40 w-full max-w-lg overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-5">
                  Add New Floating Social Icon
                </h3>

                <div className="mb-6">
                  <label className={label}>Select Image</label>
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="add-image-upload"
                      className={`${secondaryBtn} cursor-pointer px-4 py-2.5`}
                    >
                      Choose Image
                    </label>
                    <input
                      id="add-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setAddImageFile(e.target.files?.[0] || null)
                      }
                    />
                    {addImageFile && (
                      <span className="text-sm text-yellow-300 truncate max-w-[200px]">
                        {addImageFile.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className={label}>Click URL</label>
                  <input
                    type="text"
                    className={inputBase}
                    value={addLinkValue}
                    onChange={(e) => setAddLinkValue(e.target.value)}
                    placeholder="https://t.me/yourchannel or https://wa.me/..."
                  />
                </div>

                <p className="text-xs text-yellow-400/70">
                  Image should be square (e.g. 512×512) for best result
                </p>
              </div>

              <div className="flex gap-3 p-5 border-t border-yellow-700/40 bg-black/40">
                <button
                  className={secondaryBtn}
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setAddImageFile(null);
                    setAddLinkValue("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className={primaryBtn}
                  onClick={handleAddSubmit}
                  disabled={saving || !addImageFile || !addLinkValue.trim()}
                >
                  {saving ? "Adding..." : "Add Icon"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div
              ref={editModalRef}
              className="bg-gradient-to-b from-black/90 to-yellow-950/40 border border-yellow-700/50 rounded-xl shadow-2xl shadow-yellow-900/40 w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">
                  Edit Floating Icon Link
                </h3>

                <label className={label}>Click URL</label>
                <input
                  type="text"
                  className={inputBase}
                  value={editLinkValue}
                  onChange={(e) => setEditLinkValue(e.target.value)}
                  placeholder="https://t.me/yourchannel or https://wa.me/..."
                />

                <p className="mt-2 text-xs text-yellow-400/70">
                  Leave empty to remove link (not recommended)
                </p>
              </div>

              <div className="flex gap-3 p-5 border-t border-yellow-700/40 bg-black/40">
                <button
                  className={secondaryBtn}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={primaryBtn}
                  onClick={handleEditSubmit}
                  disabled={saving || !editLinkValue.trim()}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div
              ref={deleteModalRef}
              className="bg-gradient-to-b from-black/90 to-yellow-950/40 border border-yellow-700/50 rounded-xl shadow-2xl shadow-yellow-900/40 w-full max-w-sm overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-red-400 mb-3">
                  Confirm Delete
                </h3>
                <p className="text-white/90">
                  Are you sure you want to delete this floating social icon?
                </p>
                <p className="text-yellow-300/80 mt-2 text-sm">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 p-5 border-t border-yellow-700/40 bg-black/40">
                <button
                  className={secondaryBtn}
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={dangerBtn}
                  onClick={confirmDelete}
                  disabled={saving}
                >
                  {saving ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="h-20 md:h-28" />
      </div>
    </div>
  );
};

export default AffFloatingSocialController;
