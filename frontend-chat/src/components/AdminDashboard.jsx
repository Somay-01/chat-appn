import React, { useState, useEffect } from 'react';
import { Check, X, ShieldCheck, UserCheck, KeyRound, Users, UserCog, Pencil, Save, Trash2 } from 'lucide-react';

function AdminDashboard({ API_BASE, onClose, currentUser }) {
    // Tab State: 'pending', 'approved', or 'directory'
    const [activeTab, setActiveTab] = useState('pending');

    // Data States
    const [pendingUsers, setPendingUsers] = useState([]);
    const [approvedUsers, setApprovedUsers] = useState([]);
    const [allWorkspaceUsers, setAllWorkspaceUsers] = useState([]); // NEW: For the directory tab
    const [loading, setLoading] = useState(true);

    // Editing States for Designation
    const [editingUserId, setEditingUserId] = useState(null);
    const [editDesignationText, setEditDesignationText] = useState("");

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            // 1. Fetch Pending
            const pendingRes = await fetch(`${API_BASE}/fetchPendingUsers.php`);
            const pendingData = await pendingRes.json();
            if (pendingData.status === 'success') setPendingUsers(pendingData.data || []);

            // 2. Fetch Approved
            const approvedRes = await fetch(`${API_BASE}/fetchApprovedUsers.php`);
            const approvedData = await approvedRes.json();

            if (approvedData.status === 'success') {
                // PROFESSIONAL FIX: Filter out the logged-in admin
                const otherStaff = approvedData.data.filter(
                    user => String(user.id) !== String(currentUser?.id)
                );
                setApprovedUsers(otherStaff || []);
            }

            // 3. Fetch All Users for Directory (Designations & Deletions)
            const directoryRes = await fetch(`${API_BASE}/adminFetchAllUsers.php`);
            const directoryData = await directoryRes.json();
            if (Array.isArray(directoryData)) {
                // Prevent admin from deleting themselves
                const safeDirectory = directoryData.filter(user => String(user.id) !== String(currentUser?.id));
                setAllWorkspaceUsers(safeDirectory);
            }

        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- PENDING APPROVALS TAB ---
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

    // --- MANAGE STAFF TAB ---
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

    // --- NEW: USER DIRECTORY TAB (Designation & Deletion) ---
    const handleSaveDesignation = async (id) => {
        const formData = new FormData();
        formData.append('user_id', id);
        formData.append('designation', editDesignationText);

        try {
            const res = await fetch(`${API_BASE}/adminUpdateDesignation.php`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.status === 'success') {
                setEditingUserId(null); // Close the input field
                fetchAllUsers(); // Refresh the list to show new designation
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`⚠️ WARNING: Are you sure you want to COMPLETELY REMOVE ${name} from the system? This action cannot be undone.`)) return;

        const formData = new FormData();
        formData.append('user_id', id);
        try {
            const res = await fetch(`${API_BASE}/adminDeleteUser.php`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.status === 'success') {
                fetchAllUsers();
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) { console.error(err); }
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
                    {/* NEW TAB BUTTON */}
                    <button
                        style={activeTab === 'directory' ? activeTabStyle : tabStyle}
                        onClick={() => setActiveTab('directory')}
                    >
                        <UserCog size={16} /> User Directory
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
                                    <th style={thStyle}>{activeTab === 'directory' ? 'Designation' : 'Biometric ID'}</th>
                                    <th style={thStyle}>{activeTab === 'directory' ? 'Status' : 'Role / Designation'}</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* --- PENDING TAB RENDER --- */}
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

                                {/* --- APPROVED TAB RENDER --- */}
                                {activeTab === 'approved' && approvedUsers.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={tdStyle}><div style={{ fontWeight: '600' }}>{user.name}</div></td>
                                        <td style={tdStyle}>{user.biometric_id}</td>
                                        <td style={tdStyle}>
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

                                {/* --- NEW: DIRECTORY TAB RENDER --- */}
                                {activeTab === 'directory' && allWorkspaceUsers.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: '600' }}>{user.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {user.biometric_id}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            {/* Inline Designation Editing */}
                                            {editingUserId === user.id ? (
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <input
                                                        type="text"
                                                        value={editDesignationText}
                                                        onChange={(e) => setEditDesignationText(e.target.value)}
                                                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', width: '120px' }}
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handleSaveDesignation(user.id)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Save"><Save size={14} /></button>
                                                    <button onClick={() => setEditingUserId(null)} style={{ background: '#cbd5e1', color: '#334155', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Cancel"><X size={14} /></button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>{user.designation || 'None'}</span>
                                                    <Pencil size={12} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => { setEditingUserId(user.id); setEditDesignationText(user.designation || ""); }} title="Edit Designation" />
                                                </div>
                                            )}
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px', background: user.status === 'approved' ? '#dcfce7' : '#fef9c3', color: user.status === 'approved' ? '#166534' : '#854d0e' }}>
                                                {user.status === 'approved' ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <button onClick={() => handleDeleteUser(user.id, user.name)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Delete User">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* EMPTY STATES */}
                                {activeTab === 'pending' && pendingUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                            No pending requests at this time.
                                        </td>
                                    </tr>
                                )}
                                {activeTab === 'approved' && approvedUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                            No other staff members found.
                                        </td>
                                    </tr>
                                )}
                                {activeTab === 'directory' && allWorkspaceUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                            No users in the directory.
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