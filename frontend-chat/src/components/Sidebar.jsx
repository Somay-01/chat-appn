import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, ShieldAlert } from 'lucide-react'; // Added ShieldAlert for the popup

function Sidebar({ currentUser, users, groups, activeUser, setActiveUser, onOpenGroupModal }) {
    const [searchTerm, setSearchTerm] = useState('');

    // NEW: State to control the "Contact Admin" popup
    const [showAdminAlert, setShowAdminAlert] = useState(false);

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = user.name?.toLowerCase().includes(searchLower);
        const designationMatch = user.designation?.toLowerCase().includes(searchLower);
        return nameMatch || designationMatch;
    });

    // NEW: The Logic Gate for creating a group (Fixed Case Sensitivity)
    const handleCreateGroupClick = () => {
        if (currentUser?.role?.toLowerCase() === 'admin') {
            onOpenGroupModal(); // Let them through
        } else {
            setShowAdminAlert(true); // Stop them and show the popup
        }
    };

    return (
        <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid var(--border-color)', background: 'var(--sidebar-bg)' }}>

            {/* 👥 GROUPS SECTION */}
            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '12px', color: 'var(--subtext-color)', fontWeight: 'bold', letterSpacing: '1px', margin: 0 }}>GROUPS</h3>

                    {/* The button is now ALWAYS visible to everyone */}
                    <button
                        className="create-group-btn"
                        onClick={handleCreateGroupClick}
                        title="Create New Group"
                        style={{
                            background: 'transparent', border: 'none', color: 'var(--primary)',
                            cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center'
                        }}
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {(!groups || groups.length === 0) ? (
                    <p style={{ fontSize: '13px', color: 'var(--subtext-color)', textAlign: 'center', margin: '10px 0' }}>No groups yet.</p>
                ) : (
                    groups.map((group) => {
                        const isActive = activeUser?.isGroup && activeUser?.id === group.id;

                        return (
                            <div
                                key={`group-${group.id}`}
                                className="group-item"
                                // FIX: Now successfully passes is_broadcast and username to the ChatArea
                                onClick={() => setActiveUser({ 
                                    id: group.id, 
                                    name: group.group_name, 
                                    username: group.group_name, 
                                    isGroup: true,
                                    is_broadcast: group.is_broadcast 
                                })}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 14px', cursor: 'pointer',
                                    background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                    borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                                    borderRadius: isActive ? '0 8px 8px 0' : '8px',
                                    marginBottom: '5px', transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ width: '35px', height: '35px', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    #
                                </div>
                                <span style={{ fontWeight: isActive ? '600' : '500', fontSize: '14px', color: isActive ? 'var(--primary)' : 'var(--text-color)' }}>
                                    {group.group_name}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 👤 USERS SECTION */}
            <div style={{ padding: '0 20px 20px 20px', flex: 1, overflowY: 'auto' }}>
                <h3 style={{ fontSize: '12px', color: 'var(--subtext-color)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '15px' }}>USERS</h3>

                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '14px', background: 'var(--hover-bg)', color: 'var(--text-color)', boxSizing: 'border-box' }}
                    />
                </div>

                {filteredUsers.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--subtext-color)', textAlign: 'center', marginTop: '20px' }}>No users found.</p>
                ) : (
                    filteredUsers.map((user) => {
                        const isActive = !activeUser?.isGroup && activeUser?.id === user.id;

                        return (
                            <div
                                key={`user-${user.id}`}
                                className="user-item"
                                // FIX: Ensures username is correctly set for the ChatArea Header
                                onClick={() => setActiveUser({ ...user, username: user.name, isGroup: false })}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 14px', cursor: 'pointer',
                                    background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                    borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                                    borderRadius: isActive ? '0 8px 8px 0' : '8px',
                                    marginBottom: '5px', transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ minWidth: '35px', height: '35px', borderRadius: '50%', background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {user.name && user.name.length > 0 ? user.name[0].toUpperCase() : '?'}
                                </div>

                                <div style={{ overflow: 'hidden', flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: isActive ? '600' : '500', color: isActive ? 'var(--primary)' : 'var(--text-color)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                        {user.name}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--subtext-color)' }}>{user.designation}</p>
                                </div>

                                {user.unread_count > 0 && (
                                    <span className="unread-badge" style={{ background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                                        {user.unread_count}
                                    </span>
                                )}

                            </div>
                        );
                    })
                )}
            </div>

            {/* ========================================== */}
            {/* NEW: ACCESS DENIED MODAL (PORTALED)        */}
            {/* ========================================== */}
            {showAdminAlert && createPortal(
                <div className="modal-overlay" onClick={() => setShowAdminAlert(false)} style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
                        background: 'var(--bg-color)', width: '350px', borderRadius: '12px', padding: '30px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '50%', marginBottom: '15px' }}>
                            <ShieldAlert size={40} color="#ef4444" />
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-color)', fontSize: '20px' }}>Access Denied</h3>
                        <p style={{ color: 'var(--subtext-color)', fontSize: '14px', lineHeight: '1.5', marginBottom: '25px' }}>
                            Only administrators have permission to create and manage groups. Please contact your system admin to request a new group.
                        </p>
                        <button onClick={() => setShowAdminAlert(false)} style={{
                            background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 24px',
                            borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', width: '100%'
                        }}>
                            Understood
                        </button>
                    </div>
                </div>,
                document.body // <--- THIS TELLS REACT TO TELEPORT IT
            )}
        </div>
    );
}

export default Sidebar;