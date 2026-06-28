import React, { useState, useEffect } from 'react';
import { X, User, Palette, AlertTriangle, LogOut, Upload, Key } from 'lucide-react';

function SettingsModal({ onClose, onLogout, currentUser }) {
    const [activeTab, setActiveTab] = useState('account');

    // Local Storage States for Appearance
    const [textSize, setTextSize] = useState(localStorage.getItem('chat-text-size') || '14px');
    const [chatBg, setChatBg] = useState(localStorage.getItem('chat-bg-color') || '#f8fafc');

    // Password Update States
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // --- NEW: Custom Status State & Handler ---
    const [userStatus, setUserStatus] = useState(currentUser?.custom_status || 'Available');

    const handleStatusUpdate = async (newStatus) => {
        setUserStatus(newStatus); // Update UI instantly

        const formData = new FormData();
        formData.append('user_id', currentUser.id);
        formData.append('status', newStatus);

        try {
            const res = await fetch('http://localhost/offline-chat/api/updateStatus.php', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.status !== 'success') {
                alert("Failed to update status.");
            }
        } catch (err) {
            console.error("Status update error:", err);
        }
    };
    // ------------------------------------------

    // Apply Appearance Settings instantly
    useEffect(() => {
        localStorage.setItem('chat-text-size', textSize);
        document.documentElement.style.setProperty('--chat-font-size', textSize);
    }, [textSize]);

    useEffect(() => {
        localStorage.setItem('chat-bg-color', chatBg);
        document.documentElement.style.setProperty('--chat-bg-override', chatBg);
    }, [chatBg]);

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        alert("Password update endpoint will be connected here!");
    };

    const handleProfilePic = (e) => {
        const file = e.target.files[0];
        if (file) {
            alert(`Selected ${file.name} to upload. PHP endpoint needed next!`);
        }
    };

    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>

                {/* Left Side: Navigation */}
                <div className="settings-sidebar">
                    <h2 className="settings-title">Settings</h2>
                    <ul className="settings-nav">
                        <li className={activeTab === 'account' ? 'active' : ''} onClick={() => setActiveTab('account')}>
                            <User size={18} /> Account Profile
                        </li>
                        <li className={activeTab === 'appearance' ? 'active' : ''} onClick={() => setActiveTab('appearance')}>
                            <Palette size={18} /> Appearance
                        </li>
                        <div className="settings-divider"></div>
                        <li className={activeTab === 'danger' ? 'active danger-tab' : 'danger-tab'} onClick={() => setActiveTab('danger')}>
                            <AlertTriangle size={18} /> Log Out
                        </li>
                    </ul>
                </div>

                {/* Right Side: Content Area */}
                <div className="settings-content">
                    <button className="settings-close" onClick={onClose}><X size={24} /></button>

                    {/* --- ACCOUNT TAB --- */}
                    {activeTab === 'account' && (
                        <div className="settings-pane">
                            <h3>Account Profile</h3>
                            <p className="settings-desc">Update your identity and security credentials.</p>

                            {/* --- NEW: Custom Status Dropdown --- */}
                            <div className="settings-card">
                                <h4>Availability Status</h4>
                                <select
                                    className="settings-select"
                                    value={userStatus}
                                    onChange={(e) => handleStatusUpdate(e.target.value)}
                                    style={{
                                        borderLeft: `4px solid ${userStatus === 'Available' ? '#10b981' :
                                                userStatus === 'In a Meeting' ? '#f59e0b' :
                                                    userStatus === 'Do Not Disturb' ? '#ef4444' : '#64748b'
                                            }`
                                    }}
                                >
                                    <option value="Available">🟢 Available</option>
                                    <option value="In a Meeting">🟠 In a Meeting</option>
                                    <option value="Do Not Disturb">🔴 Do Not Disturb</option>
                                    <option value="Out of Office">⚪ Out of Office</option>
                                </select>
                            </div>
                            {/* ----------------------------------- */}

                            <div className="settings-card">
                                <h4>Profile Picture</h4>
                                <div className="profile-upload-area">
                                    <div className="avatar-circle" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                                        {currentUser?.username?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <div className="upload-actions">
                                        <label className="upload-btn">
                                            <Upload size={16} /> Upload New Avatar
                                            <input type="file" accept="image/*" hidden onChange={handleProfilePic} />
                                        </label>
                                        <p>JPG, GIF or PNG. Max size of 2MB.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-card">
                                <h4>Update Password</h4>
                                <form onSubmit={handlePasswordUpdate} className="password-form">
                                    <input type="password" placeholder="Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                                    <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                    <button type="submit" className="save-btn"><Key size={16} /> Save Password</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* --- APPEARANCE TAB --- */}
                    {activeTab === 'appearance' && (
                        <div className="settings-pane">
                            <h3>Appearance</h3>
                            <p className="settings-desc">Customize how Workspace looks on this device. Saved locally.</p>

                            <div className="settings-card">
                                <h4>Chat Text Size</h4>
                                <select className="settings-select" value={textSize} onChange={(e) => setTextSize(e.target.value)}>
                                    <option value="12px">Small (12px)</option>
                                    <option value="14px">Normal (14px)</option>
                                    <option value="16px">Large (16px)</option>
                                    <option value="18px">Extra Large (18px)</option>
                                </select>
                            </div>

                            <div className="settings-card">
                                <h4>Chat Background Color</h4>
                                <select className="settings-select" value={chatBg} onChange={(e) => setChatBg(e.target.value)}>
                                    <option value="#f8fafc">Light Slate (Default)</option>
                                    <option value="#f1f5f9">Soft Gray</option>
                                    <option value="#eff6ff">Pale Blue</option>
                                    <option value="#fdf4ff">Pale Pink</option>
                                    <option value="#0f172a">Dark Navy (Dark Mode Match)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* --- DANGER ZONE TAB --- */}
                    {activeTab === 'danger' && (
                        <div className="settings-pane">
                            <div className="settings-card danger-card">
                                <div className="danger-card-info">
                                    <h4>Log Out of Workspace</h4>
                                    <p>Securely disconnect your active session from this device. You will need your credentials to log back in.</p>
                                </div>
                                <button className="modal-logout-btn" onClick={onLogout}>
                                    <LogOut size={16} /> Log Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;