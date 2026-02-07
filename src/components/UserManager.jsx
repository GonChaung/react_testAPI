import { useState, useEffect } from "react";
import "./UserManager.css";

const API_BASE = "http://localhost:3000/api/user";

function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    status: "ACTIVE",
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState("");

  const USERS_PER_PAGE = 5;

  // Fetch users with pagination
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}?page=${page}&limit=${USERS_PER_PAGE}`,
      );
      const data = await response.json();
      setUsers(data.users || []);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalUsers(data.totalUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Open modal for creating new user
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      firstname: "",
      lastname: "",
      status: "ACTIVE",
    });
    setError("");
    setIsModalOpen(true);
  };

  // Open modal for editing existing user
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      password: "",
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      status: user.status || "ACTIVE",
    });
    setError("");
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      firstname: "",
      lastname: "",
      status: "ACTIVE",
    });
    setError("");
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingUser) {
        // Update existing user
        const updatePayload = {
          username: formData.username,
          email: formData.email,
          firstname: formData.firstname,
          lastname: formData.lastname,
          status: formData.status,
        };
        // Only include password if provided
        if (formData.password) {
          updatePayload.password = formData.password;
        }

        const response = await fetch(`${API_BASE}/${editingUser._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });

        const result = await response.json();
        if (!response.ok) {
          setError(result.message || "Failed to update user");
          return;
        }
      } else {
        // Create new user
        const response = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            firstname: formData.firstname,
            lastname: formData.lastname,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          setError(result.message || "Failed to create user");
          return;
        }
      }
      closeModal();
      fetchUsers(currentPage);
    } catch (error) {
      console.error("Error saving user:", error);
      setError("Network error. Please try again.");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      // If we're on the last page and delete the only user, go to previous page
      if (users.length === 1 && currentPage > 1) {
        fetchUsers(currentPage - 1);
      } else {
        fetchUsers(currentPage);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Handle pagination
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchUsers(page);
    }
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "status-active";
      case "SUSPENDED":
        return "status-suspended";
      case "DELETED":
        return "status-deleted";
      default:
        return "status-default";
    }
  };

  return (
    <div className="user-manager">
      <div className="header">
        <div className="header-content">
          <h1>👤 User Manager</h1>
          <p className="subtitle">Manage your users with ease</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <span className="btn-icon">+</span>
          Add New User
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">{totalUsers}</span>
          <span className="stat-label">Total Users</span>
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
          <p>Loading users...</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      <div className="empty-content">
                        <span className="empty-icon">👥</span>
                        <p>No users found</p>
                        <button className="btn-link" onClick={openCreateModal}>
                          Add your first user
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <span className="username-badge">{user.username}</span>
                      </td>
                      <td className="user-name">
                        {user.firstname} {user.lastname}
                      </td>
                      <td className="user-email">{user.email}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(user.status)}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="btn-edit"
                          onClick={() => openEditModal(user)}
                          title="Edit user"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => setDeleteConfirm(user._id)}
                          title="Delete user"
                        >
                          🗑️
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
                ← Prev
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
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? "✏️ Edit User" : "➕ New User"}</h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  required
                />
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
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={
                    editingUser
                      ? "Leave blank to keep current"
                      : "Enter password"
                  }
                  required={!editingUser}
                />
                {editingUser && (
                  <small>Leave blank to keep current password</small>
                )}
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
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="DELETED">Deleted</option>
                </select>
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
                  {editingUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div
            className="modal modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>⚠️ Confirm Delete</h2>
              <button
                className="modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete this user? This action cannot be
                undone.
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

export default UserManager;
