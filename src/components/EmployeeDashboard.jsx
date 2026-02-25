import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const EmployeeDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'applyLeave', 'applyReimbursement'
    const [leaves, setLeaves] = useState([]);
    const [reimbursements, setReimbursements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Forms mapping
    const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });
    const [reimbursementForm, setReimbursementForm] = useState({ amount: '', category: 'Travel', description: '', receiptUrl: '' });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [leavesRes, reimbRes] = await Promise.all([
                axiosInstance.get('/leaves'),
                axiosInstance.get('/reimbursements')
            ]);
            setLeaves(leavesRes.data);
            setReimbursements(reimbRes.data);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/leaves', leaveForm);
            setLeaveForm({ startDate: '', endDate: '', reason: '' });
            setActiveTab('overview');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error applying for leave');
        }
    };

    const handleReimbursementSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/reimbursements', reimbursementForm);
            setReimbursementForm({ amount: '', category: 'Travel', description: '', receiptUrl: '' });
            setActiveTab('overview');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting claim');
        }
    };

    if (loading) return <div className="spinner"></div>;

    // Compute Stats
    const calculateDays = (start, end) => {
        const s = new Date(start);
        const e = new Date(end);
        const diffTime = Math.abs(e - s);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
    };

    const leavesTaken = leaves.filter(l => l.status === 'Approved').reduce((acc, l) => acc + calculateDays(l.startDate, l.endDate), 0);
    const annualLeaveAllowance = 21;
    const remainingLeaves = annualLeaveAllowance - leavesTaken;
    const pendingLeavesCount = leaves.filter(l => l.status === 'Pending').length;

    const totalClaimed = reimbursements.reduce((acc, r) => acc + r.amount, 0);
    const totalReimbursed = reimbursements.filter(r => r.status === 'Approved').reduce((acc, r) => acc + r.amount, 0);

    return (
        <div>
            <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div className="flex gap-4">
                    <button
                        className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        My Overview
                    </button>
                </div>
                <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveTab('applyLeave')} className="btn btn-primary" style={{ boxShadow: '0 0 15px rgba(59,130,246,0.3)' }}>+ Apply for Leave</button>
                    <button onClick={() => setActiveTab('applyReimbursement')} className="btn btn-success" style={{ boxShadow: '0 0 15px rgba(16,185,129,0.3)' }}>+ Claim Expense</button>
                </div>
            </div>

            {error && <div className="mb-4" style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>{error}</div>}

            {activeTab === 'overview' && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="card text-center" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
                            <h4 style={{ color: 'var(--text-secondary)' }}>Leave Balance</h4>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', margin: '0.5rem 0' }}>{remainingLeaves}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>of {annualLeaveAllowance} days remaining</div>
                        </div>
                        <div className="card text-center" style={{ padding: '1.5rem' }}>
                            <h4 style={{ color: 'var(--text-secondary)' }}>Leaves Taken/Pending</h4>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                                <span style={{ color: 'var(--success)' }}>{leavesTaken}</span> / <span style={{ color: 'var(--warning)' }}>{pendingLeavesCount}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Approved / Pending days</div>
                        </div>
                        <div className="card text-center" style={{ padding: '1.5rem' }}>
                            <h4 style={{ color: 'var(--text-secondary)' }}>Reimbursements</h4>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)', margin: '0.5rem 0' }}>${totalReimbursed.toFixed(2)}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>of ${totalClaimed.toFixed(2)} claimed</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2">
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
                                        {leaves.map((leave) => (
                                            <tr key={leave._id}>
                                                <td>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</td>
                                                <td>{calculateDays(leave.startDate, leave.endDate)}</td>
                                                <td>
                                                    <span className={`badge badge-${leave.status.toLowerCase()}`}>{leave.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {leaves.length === 0 && <tr><td colSpan="3" className="text-center">No leave requests found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '0' }}>
                            <h3 style={{ padding: '1.5rem 1.5rem 0' }}>My Claims History</h3>
                            <div className="table-container" style={{ border: 'none', borderRadius: '0', background: 'transparent' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reimbursements.map((r) => (
                                            <tr key={r._id}>
                                                <td>{r.category}</td>
                                                <td>${r.amount}</td>
                                                <td>
                                                    <span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {reimbursements.length === 0 && <tr><td colSpan="3" className="text-center">No claims found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'applyLeave' && (
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <button onClick={() => setActiveTab('overview')} className="btn btn-outline mb-4" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>&larr; Back</button>
                    <h3 className="mb-4">Apply for Leave</h3>
                    <form onSubmit={handleLeaveSubmit}>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input type="date" required value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <input type="date" required value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Reason</label>
                            <textarea required value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} rows="3"></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary w-full">Submit Request</button>
                    </form>
                </div>
            )}

            {activeTab === 'applyReimbursement' && (
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <button onClick={() => setActiveTab('overview')} className="btn btn-outline mb-4" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>&larr; Back</button>
                    <h3 className="mb-4">Submit Reimbursement</h3>
                    <form onSubmit={handleReimbursementSubmit}>
                        <div className="form-group">
                            <label>Amount ($)</label>
                            <input type="number" required min="1" step="0.01" value={reimbursementForm.amount} onChange={(e) => setReimbursementForm({ ...reimbursementForm, amount: parseFloat(e.target.value) })} />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select value={reimbursementForm.category} onChange={(e) => setReimbursementForm({ ...reimbursementForm, category: e.target.value })}>
                                <option value="Travel">Travel</option>
                                <option value="Food">Food</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea required value={reimbursementForm.description} onChange={(e) => setReimbursementForm({ ...reimbursementForm, description: e.target.value })} rows="2"></textarea>
                        </div>
                        <div className="form-group mb-4">
                            <label>Receipt URL (Optional)</label>
                            <input type="url" value={reimbursementForm.receiptUrl || ''} onChange={(e) => setReimbursementForm({ ...reimbursementForm, receiptUrl: e.target.value })} placeholder="https://example.com/receipt.pdf" />
                        </div>
                        <button type="submit" className="btn btn-primary w-full">Submit Claim</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;
