import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import axiosInstance from "../utils/axiosConfig";

const AdminDashboard = () => {
  const [userRequests, setUserRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [allReimbursements, setAllReimbursements] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'userRequests', 'users', 'leaves', 'reimbursements'
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
  });
  const [successMessage, setSuccessMessage] = useState(null);

  const [stats, setStats] = useState({
    totalLeaves: 0,
    totalReimbursements: 0,
    totalUsers: 0,
    activeRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, requestsRes, leavesRes, reimbRes] = await Promise.all([
        axiosInstance.get("/users"),
        axiosInstance.get("/user-requests"),
        axiosInstance.get("/leaves"),
        axiosInstance.get("/reimbursements"),
      ]);

      setUserRequests(requestsRes.data);
      setAllUsers(usersRes.data);
      setAllLeaves(leavesRes.data);
      setAllReimbursements(reimbRes.data);

      setStats({
        totalUsers: usersRes.data.length,
        activeRequests: requestsRes.data.filter((r) => r.status === "Pending")
          .length,
        totalLeaves: leavesRes.data.length,
        totalReimbursements: reimbRes.data.length,
      });
    } catch (err) {
      setError("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestAction = async (id, status) => {
    try {
      await axiosInstance.put(`/user-requests/${id}/status`, { status });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Error updating user request");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/users", newUserForm);
      setSuccessMessage("User added successfully.");
      setNewUserForm({ name: "", email: "", password: "", role: "Employee" });
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Error adding user");
      setTimeout(() => setError(null), 3000);
    }
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/leaves/${id}/status`, { status });
      fetchData();
    } catch (err) {
      setError("Error updating leave status");
    }
  };

  const updateReimbursementStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/reimbursements/${id}/status`, { status });
      fetchData();
    } catch (err) {
      setError("Error updating claim status");
    }
  };

  if (loading) return <div className="spinner"></div>;

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  // Process data for charts
  const overviewData = [
    { name: "Users", value: stats.totalUsers },
    { name: "Leaves", value: stats.totalLeaves },
    { name: "Claims", value: stats.totalReimbursements },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <h3 className="mb-4">Admin Menu</h3>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <li
            onClick={() => setActiveTab("overview")}
            style={{
              cursor: "pointer",
              color:
                activeTab === "overview"
                  ? "var(--primary)"
                  : "var(--text-secondary)",
              fontWeight: activeTab === "overview" ? "600" : "normal",
            }}
          >
            Overview
          </li>
          <li
            onClick={() => setActiveTab("users")}
            style={{
              cursor: "pointer",
              color:
                activeTab === "users"
                  ? "var(--primary)"
                  : "var(--text-secondary)",
              fontWeight: activeTab === "users" ? "600" : "normal",
            }}
          >
            Manage Users
          </li>
          <li
            onClick={() => setActiveTab("userRequests")}
            style={{
              cursor: "pointer",
              color:
                activeTab === "userRequests"
                  ? "var(--primary)"
                  : "var(--text-secondary)",
              fontWeight: activeTab === "userRequests" ? "600" : "normal",
            }}
          >
            User Requests
          </li>
          <li
            onClick={() => setActiveTab("leaves")}
            style={{
              cursor: "pointer",
              color:
                activeTab === "leaves"
                  ? "var(--primary)"
                  : "var(--text-secondary)",
              fontWeight: activeTab === "leaves" ? "600" : "normal",
            }}
          >
            Leaves Management
          </li>
          <li
            onClick={() => setActiveTab("reimbursements")}
            style={{
              cursor: "pointer",
              color:
                activeTab === "reimbursements"
                  ? "var(--primary)"
                  : "var(--text-secondary)",
              fontWeight: activeTab === "reimbursements" ? "600" : "normal",
            }}
          >
            Reimbursements Management
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="dashboard-content">
        {error && (
          <div
            className="mb-4"
            style={{
              color: "var(--danger)",
              background: "rgba(239, 68, 68, 0.1)",
              padding: "0.75rem",
              borderRadius: "var(--radius-sm)",
            }}
          >
            {error}
          </div>
        )}
        {successMessage && (
          <div
            className="mb-4"
            style={{
              color: "var(--success)",
              background: "rgba(16, 185, 129, 0.1)",
              padding: "0.75rem",
              borderRadius: "var(--radius-sm)",
            }}
          >
            {successMessage}
          </div>
        )}

        {activeTab === "overview" && (
          <>
            {/* Summary Cards */}
            <div>
              <h3 className="mb-3">System Overview</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                {[
                  {
                    title: "Total Users",
                    value: stats.totalUsers,
                    color: "var(--primary)",
                  },
                  {
                    title: "Total Leaves",
                    value: stats.totalLeaves,
                    color: "var(--success)",
                  },
                  {
                    title: "Total Reimbursements",
                    value: stats.totalReimbursements,
                    color: "var(--warning)",
                  },
                  {
                    title: "Pending User Requests",
                    value: stats.activeRequests,
                    color: "var(--danger)",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="card"
                    style={{ padding: "1.5rem", textAlign: "center" }}
                  >
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {stat.title}
                    </div>
                    <div
                      style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        color: stat.color,
                      }}
                    >
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="chart-grid">
              <div className="card">
                <h4 className="mb-4">System Entities Ratio</h4>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overviewData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label
                      >
                        {overviewData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "userRequests" && (
          /* Tables Section */
          <div>
            <h3 className="mb-3">Pending User Requests</h3>
            <div className="card" style={{ padding: "0" }}>
              <div
                className="table-container"
                style={{
                  border: "none",
                  borderRadius: "0",
                  background: "transparent",
                }}
              >
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Manager</th>
                      <th>Action</th>
                      <th>Details</th>
                      <th>Status</th>
                      <th>Approve / Reject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRequests
                      .filter((r) => r.status === "Pending")
                      .map((req) => (
                        <tr key={req._id}>
                          <td style={{ fontSize: "0.9rem" }}>
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div>
                              <strong>{req.manager?.name}</strong>
                            </div>
                            <div
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {req.manager?.email}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${req.action === "Add" ? "badge-approved" : "badge-rejected"}`}
                            >
                              {req.action}
                            </span>
                          </td>
                          <td>
                            {req.action === "Add" ? (
                              <div style={{ fontSize: "0.9rem" }}>
                                <div>Name: {req.name}</div>
                                <div>Email: {req.email}</div>
                                <div>Role: {req.role}</div>
                              </div>
                            ) : (
                              <div style={{ fontSize: "0.9rem" }}>
                                <div>Name: {req.targetUser?.name}</div>
                                <div>Email: {req.targetUser?.email}</div>
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-pending">
                              {req.status}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleRequestAction(req._id, "Approved")
                                }
                                className="btn btn-success"
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  fontSize: "0.8rem",
                                }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleRequestAction(req._id, "Rejected")
                                }
                                className="btn btn-danger"
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  fontSize: "0.8rem",
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {userRequests.filter((r) => r.status === "Pending")
                      .length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No pending requests.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="grid grid-cols-2">
            <div
              className="card"
              style={{ padding: "0", height: "fit-content" }}
            >
              <h3 style={{ padding: "1.5rem 1.5rem 0" }}>All Users</h3>
              <div
                className="table-container"
                style={{
                  border: "none",
                  borderRadius: "0",
                  background: "transparent",
                }}
              >
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className="badge badge-approved">
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ height: "fit-content" }}>
              <h3 className="mb-4">Add User</h3>
              <form onSubmit={handleAddUser}>
                <div className="form-group mb-2">
                  <label>Name</label>
                  <input
                    required
                    value={newUserForm.name}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group mb-2">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="form-group mb-2">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    value={newUserForm.password}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group mb-4">
                  <label>Role</label>
                  <select
                    required
                    value={newUserForm.role}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, role: e.target.value })
                    }
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  Add User
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "leaves" && (
          <div>
            <h3 className="mb-3">All Leave Requests</h3>
            <div className="card" style={{ padding: "0" }}>
              <div
                className="table-container"
                style={{
                  border: "none",
                  borderRadius: "0",
                  background: "transparent",
                }}
              >
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date Range</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLeaves.map((leave) => (
                      <tr key={leave._id}>
                        <td>
                          <div>
                            <strong>{leave.employee?.name}</strong>
                          </div>
                        </td>
                        <td>
                          {new Date(leave.startDate).toLocaleDateString()} -{" "}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td>{leave.reason}</td>
                        <td>
                          <span
                            className={`badge badge-${leave.status.toLowerCase()}`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td>
                          {leave.status === "Pending" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  updateLeaveStatus(leave._id, "Approved")
                                }
                                className="btn btn-success"
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  fontSize: "0.8rem",
                                }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  updateLeaveStatus(leave._id, "Rejected")
                                }
                                className="btn btn-danger"
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  fontSize: "0.8rem",
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span
                              style={{
                                fontSize: "0.85rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {allLeaves.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No leave requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reimbursements" && (
          <div>
            <h3 className="mb-3">All Reimbursement Claims</h3>
            <div className="card" style={{ padding: "0" }}>
              <div
                className="table-container"
                style={{
                  border: "none",
                  borderRadius: "0",
                  background: "transparent",
                }}
              >
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Receipt</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allReimbursements.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <div>
                            <strong>{r.employee?.name}</strong>
                          </div>
                        </td>
                        <td>{r.category}</td>
                        <td>${r.amount}</td>
                        <td>{r.description}</td>
                        <td>
                          {r.receiptUrl ? (
                            <a
                              href={r.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "var(--primary)" }}
                            >
                              View
                            </a>
                          ) : (
                            "None"
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge badge-${r.status.toLowerCase()}`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td>
                          {r.status === "Pending" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  updateReimbursementStatus(r._id, "Approved")
                                }
                                className="btn btn-success"
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  fontSize: "0.8rem",
                                }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  updateReimbursementStatus(r._id, "Rejected")
                                }
                                className="btn btn-danger"
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  fontSize: "0.8rem",
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span
                              style={{
                                fontSize: "0.85rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {allReimbursements.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No claims found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
