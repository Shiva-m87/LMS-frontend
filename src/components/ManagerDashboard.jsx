import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import axiosInstance from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const ManagerDashboard = () => {
    const [leaves, setLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // UI tab state

    // User Request form state
    const [newUserReq, setNewUserReq] = useState({ name: '', email: '', password: '' });
    const [removeUserReq, setRemoveUserReq] = useState({ targetUser: '' });

    // My leave form
    const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [leavesRes, empRes] = await Promise.all([
                axiosInstance.get('/leaves'),
                axiosInstance.get('/users?role=Employee')
            ]);
            setLeaves(leavesRes.data);
            setEmployees(empRes.data);
        } catch (err) {
            setError('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateLeaveStatus = async (id, status) => {
        try {
            await axiosInstance.put(`/leaves/${id}/status`, { status });
            fetchData();
        } catch (err) {
            setError('Error updating leave status');
        }
    };

    const submitAddUserRequest = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/user-requests', {
                action: 'Add',
                role: 'Employee',
                ...newUserReq
            });
            setSuccessMessage('Add user request submitted to admin successfully.');
            setNewUserReq({ name: '', email: '', password: '' });
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting add request');
            setTimeout(() => setError(null), 3000);
        }
    };

    const submitRemoveUserRequest = async (e) => {
        e.preventDefault();
        if (!removeUserReq.targetUser) return;
        try {
            await axiosInstance.post('/user-requests', {
                action: 'Remove',
                targetUser: removeUserReq.targetUser
            });
            setSuccessMessage('Remove user request submitted to admin successfully.');
            setRemoveUserReq({ targetUser: '' });
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting remove request');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/leaves', leaveForm);
            setLeaveForm({ startDate: '', endDate: '', reason: '' });
            setSuccessMessage('Leave applied successfully.');
            setTimeout(() => setSuccessMessage(null), 3000);
            setActiveTab('myLeaves');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error applying for leave');
            setTimeout(() => setError(null), 3000);
        }
    };

    if (loading) return <div className="spinner"></div>;

    // derived stats
    const totalEmployees = employees.length;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const approvedThisMonth = leaves.filter(l => {
        if (l.status !== 'Approved') return false;
        const d = new Date(l.updatedAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const myLeaves = leaves.filter(l => l.employee?._id === user._id);

    // Charts Data
    const leaveStatusCount = leaves.reduce((acc, l) => {
        acc[l.status] = (acc[l.status] || 0) + 1;
        return acc;
    }, {});
    const leavePieData = Object.keys(leaveStatusCount).map(status => ({ name: status, value: leaveStatusCount[status] }));

    const COLORS = ['#f59e0b', '#10b981', '#ef4444'];

    // Simplistic line chart for leave trend (group by month)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const leaveTrendMap = leaves.reduce((acc, l) => {
        const m = new Date(l.createdAt).getMonth();
        acc[m] = (acc[m] || 0) + 1;
        return acc;
    }, {});
    const leaveTrendData = monthNames.map((m, idx) => ({ month: m, count: leaveTrendMap[idx] || 0 }));

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <h3 className="mb-4">Manager Menu</h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <li onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'overview' ? '600' : 'normal' }}>Dashboard Overview</li>
                    <li onClick={() => setActiveTab('team')} style={{ cursor: 'pointer', color: activeTab === 'team' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'team' ? '600' : 'normal' }}>My Team</li>
                    <li onClick={() => setActiveTab('myLeaves')} style={{ cursor: 'pointer', color: activeTab === 'myLeaves' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'myLeaves' ? '600' : 'normal' }}>My Leaves</li>
                </ul>
            </aside>

            {/* Main Content */}
            <div className="dashboard-content">
                <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Manager Interface</h2>
                    <button onClick={() => setActiveTab('applyLeave')} className="btn btn-primary" style={{ boxShadow: '0 0 15px rgba(59,130,246,0.3)' }}>+ Apply for Leave</button>
                </div>

                {error && <div className="mb-4" style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
                {successMessage && <div className="mb-4" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>{successMessage}</div>}

                {activeTab === 'overview' && (
                    <>
                        {/* Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {[
                                { title: 'Total Employees', value: totalEmployees, color: 'var(--primary)' },
                                { title: 'Pending Leaves', value: pendingLeaves, color: 'var(--warning)' },
                                { title: 'Approved This Month', value: approvedThisMonth, color: 'var(--success)' }
                            ].map((stat, idx) => (
                                <div key={idx} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{stat.title}</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Section */}
                        <div className="chart-grid">
                            <div className="card">
                                <h4 className="mb-4 text-center text-sm">Leave Status</h4>
                                <div style={{ height: 200 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={leavePieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" label>
                                                {leavePieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="card">
                                <h4 className="mb-4 text-center text-sm">Leave Trend</h4>
                                <div style={{ height: 200 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={leaveTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
                                            <YAxis stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} />
                                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: 'none' }} />
                                            <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Tables Section */}
                        <div className="tables-grid">
                            <div className="card" style={{ padding: '0' }}>
                                <h3 style={{ padding: '1.5rem 1.5rem 0' }}>Pending Leave Requests</h3>
                                <div className="table-container" style={{ border: 'none', borderRadius: '0', background: 'transparent' }}>
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
                                            {leaves.filter(l => l.status === 'Pending').map((leave) => (
                                                <tr key={leave._id}>
                                                    <td>
                                                        <div><strong>{leave.employee?.name}</strong></div>
                                                    </td>
                                                    <td>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</td>
                                                    <td>{leave.reason}</td>
                                                    <td>
                                                        <span className={`badge badge-${leave.status.toLowerCase()}`}>{leave.status}</span>
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => updateLeaveStatus(leave._id, 'Approved')} className="btn btn-success" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Approve</button>
                                                            <button onClick={() => updateLeaveStatus(leave._id, 'Rejected')} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Reject</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {leaves.filter(l => l.status === 'Pending').length === 0 && <tr><td colSpan="5" className="text-center">No pending leaves.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </>
                )}

                {activeTab === 'team' && (
                    <div className="grid grid-cols-2">

                        {/* Team Section */}
                        <div className="card" style={{ gridColumn: '1 / -1', padding: '0' }}>
                            <h3 style={{ padding: '1.5rem 1.5rem 0' }}>Team Members List</h3>
                            <div className="table-container" style={{ border: 'none', borderRadius: '0', background: 'transparent' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.map(emp => (
                                            <tr key={emp._id}>
                                                <td>{emp.name}</td>
                                                <td>{emp.email}</td>
                                                <td>{emp.role}</td>
                                            </tr>
                                        ))}
                                        {employees.length === 0 && <tr><td colSpan="3" className="text-center">No employees found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Request Addition Form */}
                        <div className="card">
                            <h3 className="mb-4">Request User Addition</h3>
                            <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>Submit a request to Admin to onboard a new employee to your team.</p>
                            <form onSubmit={submitAddUserRequest}>
                                <div className="form-group mb-2">
                                    <label>Name</label>
                                    <input required value={newUserReq.name} onChange={e => setNewUserReq({ ...newUserReq, name: e.target.value })} />
                                </div>
                                <div className="form-group mb-2">
                                    <label>Email</label>
                                    <input type="email" required value={newUserReq.email} onChange={e => setNewUserReq({ ...newUserReq, email: e.target.value })} />
                                </div>
                                <div className="form-group mb-4">
                                    <label>Temporary Password</label>
                                    <input type="password" required value={newUserReq.password} onChange={e => setNewUserReq({ ...newUserReq, password: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary w-full">Submit Add Request</button>
                            </form>
                        </div>

                        {/* Request Removal Form */}
                        <div className="card">
                            <h3 className="mb-4">Request User Removal</h3>
                            <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>Submit a request to Admin to remove an employee from your team.</p>
                            <form onSubmit={submitRemoveUserRequest}>
                                <div className="form-group mb-4">
                                    <label>Select Employee</label>
                                    <select required value={removeUserReq.targetUser} onChange={e => setRemoveUserReq({ targetUser: e.target.value })}>
                                        <option value="">-- Choose Employee --</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>{emp.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-danger w-full">Submit Remove Request</button>
                            </form>
                        </div>

                    </div>
                )}

                {activeTab === 'myLeaves' && (
                    <div className="card" style={{ padding: '0' }}>
                        <h3 style={{ padding: '1.5rem 1.5rem 0' }}>My Leave History</h3>
                        <div className="table-container" style={{ border: 'none', borderRadius: '0', background: 'transparent' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date Range</th>
                                        <th>Days</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myLeaves.map((leave) => {
                                        const days = Math.ceil(Math.abs(new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                                        return (
                                            <tr key={leave._id}>
                                                <td>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</td>
                                                <td>{days}</td>
                                                <td>
                                                    <span className={`badge badge-${leave.status.toLowerCase()}`}>{leave.status}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {myLeaves.length === 0 && <tr><td colSpan="3" className="text-center">No leave requests found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'applyLeave' && (
                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                        <h3 className="mb-4">Apply for Leave</h3>
                        <form onSubmit={handleLeaveSubmit}>
                            <div className="form-group mb-2">
                                <label>Start Date</label>
                                <input type="date" required value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} />
                            </div>
                            <div className="form-group mb-2">
                                <label>End Date</label>
                                <input type="date" required value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} />
                            </div>
                            <div className="form-group mb-4">
                                <label>Reason</label>
                                <textarea required value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} rows="3"></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary w-full">Submit Request</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;
