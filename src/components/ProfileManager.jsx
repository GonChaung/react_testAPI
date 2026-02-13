import { useState, useEffect } from "react";
import "./ProfileManager.css";

const API_BASE = "http://localhost:3000/api/profile";
const BACKEND_URL = "http://localhost:3000";

function ProfileManager() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState("");

  const PROFILES_PER_PAGE = 5;

  const fetchProfiles = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}?page=${page}&limit=${PROFILES_PER_PAGE}`,
      );
      const data = await response.json();
      setProfiles(data.profiles || []);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalProfiles(data.totalProfiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles(currentPage);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError("");

    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed (JPEG, PNG, GIF, WebP)");
        e.target.value = "";
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = () => {
    setEditingProfile(null);
    setFormData({ firstname: "", lastname: "", email: "" });
    setImageFile(null);
    setImagePreview(null);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (profile) => {
    setEditingProfile(profile);
    setFormData({
      firstname: profile.firstname || "",
      lastname: profile.lastname || "",
      email: profile.email || "",
    });
    setImageFile(null);
    setImagePreview(
      profile.profileImage ? `${BACKEND_URL}${profile.profileImage}` : null,
    );
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProfile(null);
    setFormData({ firstname: "", lastname: "", email: "" });
    setImageFile(null);
    setImagePreview(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const body = new FormData();
    body.append("firstname", formData.firstname);
    body.append("lastname", formData.lastname);
    body.append("email", formData.email);
    if (imageFile) {
      body.append("profileImage", imageFile);
    }

    try {
      if (editingProfile) {
        const response = await fetch(`${API_BASE}/${editingProfile._id}`, {
          method: "PUT",
          body,
        });
        const result = await response.json();
        if (!response.ok) {
          setError(result.message || "Failed to update profile");
          return;
        }
      } else {
        const response = await fetch(API_BASE, {
          method: "POST",
          body,
        });
        const result = await response.json();
        if (!response.ok) {
          setError(result.message || "Failed to create profile");
          return;
        }
      }
      closeModal();
      fetchProfiles(currentPage);
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Network error. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      if (profiles.length === 1 && currentPage > 1) {
        fetchProfiles(currentPage - 1);
      } else {
        fetchProfiles(currentPage);
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchProfiles(page);
    }
  };

  return (
    <div className="profile-manager">
      <div className="header">
        <div className="header-content">
          <h1>Profile Manager</h1>
          <p className="subtitle">Manage user profiles and images</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <span className="btn-icon">+</span>
          Add New Profile
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">{totalProfiles}</span>
          <span className="stat-label">Total Profiles</span>
        </div>
        <div className="stat">
          <span className="stat-value">{currentPage}</span>
          <span className="stat-label">Current Page</span>
        </div>
        <div className="stat">
          <span className="stat-value">{totalPages}</span>
          <span className="stat-label">Total Pages</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading profiles...</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="profiles-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <div className="empty-content">
                        <p>No profiles found</p>
                        <button className="btn-link" onClick={openCreateModal}>
                          Add your first profile
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  profiles.map((profile) => (
                    <tr key={profile._id}>
                      <td>
                        <div className="profile-thumb">
                          {profile.profileImage ? (
                            <img
                              src={`${BACKEND_URL}${profile.profileImage}`}
                              alt={`${profile.firstname} ${profile.lastname}`}
                            />
                          ) : (
                            <span className="no-image">—</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="id-badge">
                          {profile._id.slice(-6)}
                        </span>
                      </td>
                      <td className="profile-name">{profile.firstname}</td>
                      <td className="profile-name">{profile.lastname}</td>
                      <td className="profile-email">{profile.email}</td>
                      <td className="actions">
                        <button
                          className="btn-edit"
                          onClick={() => openEditModal(profile)}
                          title="Edit profile"
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => setDeleteConfirm(profile._id)}
                          title="Delete profile"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`page-num ${page === currentPage ? "active" : ""}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
              <button
                className="page-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProfile ? "Edit Profile" : "New Profile"}</h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              <div className="image-upload-section">
                <div className="image-preview-container">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="image-preview"
                    />
                  ) : (
                    <div className="image-placeholder">No image</div>
                  )}
                </div>
                <div className="file-input-wrapper">
                  <label
                    htmlFor="profileImage"
                    className="btn-secondary file-label"
                  >
                    {imageFile ? "Change Image" : "Choose Image"}
                  </label>
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <small>Accepted: JPEG, PNG, GIF, WebP</small>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstname">First Name</label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastname">Last Name</label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProfile ? "Update Profile" : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div
            className="modal modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button
                className="modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete this profile? This action cannot
                be undone.
              </p>
            </div>
            <div className="form-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileManager;
