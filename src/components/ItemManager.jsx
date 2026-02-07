import { useState, useEffect } from "react";
import "./ItemManager.css";

const API_BASE = "http://localhost:3000/api/item";

function ItemManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    status: "ACTIVE",
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const ITEMS_PER_PAGE = 5;

  const fetchItems = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}?page=${page}&limit=${ITEMS_PER_PAGE}`,
      );
      const data = await response.json();
      setItems(data.items || []);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(currentPage);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ name: "", category: "", price: "", status: "ACTIVE" });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.itemName || "",
      category: item.itemCategory || "",
      price: item.itemPrice || "",
      status: item.status || "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ name: "", category: "", price: "", status: "ACTIVE" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      status: formData.status,
    };

    try {
      if (editingItem) {
        await fetch(`${API_BASE}/${editingItem._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemName: formData.name,
            itemCategory: formData.category,
            itemPrice: parseFloat(formData.price),
            status: formData.status,
          }),
        });
      } else {
        await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      closeModal();
      fetchItems(currentPage);
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      if (items.length === 1 && currentPage > 1) {
        fetchItems(currentPage - 1);
      } else {
        fetchItems(currentPage);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchItems(page);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price || 0);
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "status-active";
      case "INACTIVE":
        return "status-inactive";
      case "PENDING":
        return "status-pending";
      default:
        return "status-default";
    }
  };

  return (
    <div className="item-manager">
      <div className="header">
        <div className="header-content">
          <h1> Item Manager</h1>
          <p className="subtitle">Manage your inventory with ease</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <span className="btn-icon">+</span>
          Add New Item
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">{totalItems}</span>
          <span className="stat-label">Total Items</span>
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
          <p>Loading items...</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      <div className="empty-content">
                        <span className="empty-icon">📭</span>
                        <p>No items found</p>
                        <button className="btn-link" onClick={openCreateModal}>
                          Add your first item
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id}>
                      <td className="item-name">{item.itemName}</td>
                      <td>
                        <span className="category-badge">
                          {item.itemCategory}
                        </span>
                      </td>
                      <td className="item-price">
                        {formatPrice(item.itemPrice)}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="btn-edit"
                          onClick={() => openEditModal(item)}
                          title="Edit item"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => setDeleteConfirm(item._id)}
                          title="Delete item"
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

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? "Edit Item" : "➕ New Item"}</h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Item Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Enter category"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
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
                  <option value="INACTIVE">Inactive</option>
                  <option value="PENDING">Pending</option>
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
                  {editingItem ? "Update Item" : "Create Item"}
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
                Are you sure you want to delete this item? This action cannot be
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

export default ItemManager;
