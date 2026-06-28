import React, { useState, useEffect } from 'react';
import { Check, X, ShieldCheck, UserCheck, KeyRound, Users } from 'lucide-react';

function AdminDashboard({ API_BASE, onClose, currentUser }) {
    // Tab State: 'pending' or 'approved'
    const [activeTab, setActiveTab] = useState('pending');

    // Data States
    const [pendingUsers, setPendingUsers] = useState([]);
    const [approvedUsers, setApprovedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            // Fetch Pending
            const pendingRes = await fetch(`${API_BASE}/fetchPendingUsers.php`);
            const pendingData = await pendingRes.json();
            if (pendingData.status === 'success') setPendingUsers(pendingData.data || []);

            // Fetch Approved
            const approvedRes = await fetch(`${API_BASE}/fetchApprovedUsers.php`);
            const approvedData = await approvedRes.json();

            if (approvedData.status === 'success') {
                // PROFESSIONAL FIX: Filter out the logged-in admin
                const otherStaff = approvedData.data.filter(
                    user => String(user.id) !== String(currentUser?.id)
                );
                setApprovedUsers(otherStaff || []);
            }

        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        const formData = new FormData();
        formData.append('user_id', id);
        try {
            const res = await fetch(`${API_BASE}/approveUser.php`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.status === 'success') {
                fetchAllUsers(); // Refresh both lists
            }
        } catch (err) {
            console.error("Approval error:", err);
        }
    };

    const handleResetPassword = async (id, name) => {
        if (!window.confirm(`Are you sure you want to reset the password for ${name}?`)) return;

        const formData = new FormData();
        formData.append('user_id', id);
        try {
            const res = await fetch(`${API_BASE}/adminResetPassword.php`, { method: 'POST', body: formData });
            const data = await res.json();

            if (data.status === 'success') {
                window.alert(`✅ SUCCESS\n\nPassword for ${name} has been reset.\n\nTemporary Password: ${data.temp_password}\n\nPlease copy this and securely send it to the employee.`);
            } else {
                window.alert(`❌ Failed to reset password: ${data.message}`);
            }
        } catch (err) {
            console.error("Password reset error:", err);
        }
    };

    // NEW: Handle Global Role Change safely merged into your dashboard
    const handleRoleChange = async (targetId, newRole) => {
        const formData = new FormData();
        formData.append('admin_id', currentUser.id);
        formData.append('target_user_id', targetId);
        formData.append('new_role', newRole);

        try {
            const res = await fetch(`${API_BASE}/updateGlobalRole.php`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.status === 'success') {
                setApprovedUsers(approvedUsers.map(u => u.id === targetId ? { ...u, role: newRole } : u));
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="admin-overlay lightbox-overlay" style={overlayStyle} onClick={onClose}>
            <div className="admin-card" style={cardStyle} onClick={(e) => e.stopPropagation()}>

                {/* HEADER */}
                <div className="admin-header" style={headerStyle}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                        <ShieldCheck color="var(--primary)" /> Staff Management Portal
                    </h3>
                    <X style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>

                {/* TABS */}
                <div style={tabContainerStyle}>
                    <button
                        style={activeTab === 'pending' ? activeTabStyle : tabStyle}
                        onClick={() => setActiveTab('pending')}
                    >
                        <UserCheck size={16} /> Pending Approvals ({pendingUsers.length})
                    </button>
                    <button
                        style={activeTab === 'approved' ? activeTabStyle : tabStyle}
                        onClick={() => setActiveTab('approved')}
                    >
                        <Users size={16} /> Manage Staff ({approvedUsers.length})
                    </button>
                </div>

                {/* CONTENT */}
                <div className="admin-content" style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                    {loading ? (
                        <p>Loading records...</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                                    <th style={thStyle}>Employee</th>
                                    <th style={thStyle}>Biometric ID</th>
                                    <th style={thStyle}>Role / Designation</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* PENDING TAB RENDER */}
                                {activeTab === 'pending' && pendingUsers.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={tdStyle}><div style={{ fontWeight: '600' }}>{user.name}</div></td>
                                        <td style={tdStyle}>{user.biometric_id}</td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: '500' }}>{user.role}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{user.designation}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <button onClick={() => handleApprove(user.id)} style={approveBtnStyle}>
                                                <Check size={14} /> Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* PENDING EMPTY STATE */}
                                {activeTab === 'pending' && pendingUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                            No pending requests at this time.
                                        </td>
                                    </tr>
                                )}

                                {/* APPROVED TAB RENDER */}
                                {activeTab === 'approved' && approvedUsers.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={tdStyle}><div style={{ fontWeight: '600' }}>{user.name}</div></td>
                                        <td style={tdStyle}>{user.biometric_id}</td>

                                        <td style={tdStyle}>
                                            {/* Merged Global Admin Dropdown */}
                                            <select
                                                value={user.role?.toLowerCase() || 'user'}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '4px', outline: 'none', cursor: 'pointer', background: '#f8fafc' }}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Global Admin</option>
                                            </select>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{user.designation}</div>
                                        </td>

                                        <td style={tdStyle}>
                                            <button onClick={() => handleResetPassword(user.id, user.name)} style={resetBtnStyle}>
                                                <KeyRound size={14} /> Reset Password
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* APPROVED EMPTY STATE */}
                                {activeTab === 'approved' && approvedUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                            No other staff members found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

// Styles
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cardStyle = { background: 'white', width: '90%', maxWidth: '850px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden', color: '#0f172a' };
const headerStyle = { padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

const tabContainerStyle = { display: 'flex', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0 20px' };
const tabStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 20px', background: 'none', border: 'none', borderBottom: '2px solid transparent', color: '#64748b', cursor: 'pointer', fontWeight: '500', fontSize: '14px' };
const activeTabStyle = { ...tabStyle, color: '#3b82f6', borderBottom: '2px solid #3b82f6' };

const thStyle = { padding: '12px', fontSize: '13px', color: '#64748b', fontWeight: '500' };
const tdStyle = { padding: '12px', fontSize: '14px' };

const approveBtnStyle = { display: 'flex', alignItems: 'center', gap: '5px', background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' };
const resetBtnStyle = { display: 'flex', alignItems: 'center', gap: '5px', background: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' };

export default AdminDashboard;