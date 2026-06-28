import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, ShieldAlert, Bell, Moon, Sun, Settings, BadgeCheck, IdCard, Briefcase, User } from 'lucide-react';

function NavRail({ toggleDarkMode, isDarkMode, currentUser, onOpenSettings, onOpenAdmin }) {
    const [showProfileCard, setShowProfileCard] = useState(false);
    const cardRef = useRef(null);

    // State for Status
    const [userStatus, setUserStatus] = useState(currentUser?.custom_status || 'Available');

    const handleQuickStatusChange = async (newStatus) => {
        setUserStatus(newStatus);

        const formData = new FormData();
        formData.append('user_id', currentUser.id);
        formData.append('status', newStatus);

        try {
            await fetch('http://localhost/offline-chat/api/updateStatus.php', {
                method: 'POST',
                body: formData
            });
        } catch (err) {
            console.error("Status update error:", err);
        }
    };

    // Close profile card on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cardRef.current && !cardRef.current.contains(event.target)) {
                setShowProfileCard(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="nav-rail" style={{ position: 'relative' }}>

            {/* TOP SECTION */}
            <div className="nav-top">
                <div className="nav-icon active-nav" title="Chats">
                    <MessageSquare size={24} />
                </div>
                {/* FIX: Case insensitive check so the button appears! */}
                {currentUser?.role?.toLowerCase() === 'admin' && (
                    <div className="nav-icon" title="Admin Panel" onClick={onOpenAdmin}>
                        <ShieldAlert size={24} />
                    </div>
                )}
                <div className="nav-icon" title="Notifications">
                    <Bell size={24} />
                </div>
            </div>

            {/* BOTTOM SECTION */}
            <div className="nav-bottom">
                <div className="nav-icon" title="Toggle Theme" onClick={toggleDarkMode}>
                    {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                </div>
                <div className="nav-icon" title="Settings" onClick={onOpenSettings}>
                    <Settings size={24} />
                </div>

                {/* Profile Avatar with dynamic border */}
                <div className="nav-icon" title="Profile" onClick={() => setShowProfileCard(!showProfileCard)}>
                    <div
                        className="avatar-circle"
                        style={{
                            width: '36px',
                            height: '36px',
                            fontSize: '16px',
                            border: `2px solid ${userStatus === 'Available' ? '#10b981' :
                                userStatus === 'In a Meeting' ? '#f59e0b' :
                                    userStatus === 'Do Not Disturb' ? '#ef4444' : '#64748b'
                                }`
                        }}
                    >
                        {currentUser?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                </div>
            </div>

            {/* PROFILE CARD POPOVER */}
            {showProfileCard && (
                <div className="profile-card" ref={cardRef}>
                    <div className="profile-card-header">
                        <div className="avatar-circle large">
                            {currentUser?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="profile-status" style={{
                            background: userStatus === 'Available' ? '#10b981' :
                                userStatus === 'In a Meeting' ? '#f59e0b' :
                                    userStatus === 'Do Not Disturb' ? '#ef4444' : '#64748b'
                        }}></div>
                    </div>

                    <div className="profile-card-body" style={{ paddingBottom: '30px' }}>
                        <h3>{currentUser?.name}</h3>
                        {/* FIX: Case insensitive check for the badge */}
                        <span className={`role-badge ${currentUser?.role?.toLowerCase() === 'admin' ? 'admin' : 'member'}`}>
                            {currentUser?.role || 'Member'}
                        </span>

                        {/* Status Dropdown */}
                        <div style={{ marginTop: '15px', marginBottom: '15px', padding: '0 15px' }}>
                            <select
                                className="settings-select"
                                value={userStatus}
                                onChange={(e) => handleQuickStatusChange(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px', borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--hover-bg)', color: 'var(--text-color)',
                                    fontSize: '13px', cursor: 'pointer', outline: 'none'
                                }}
                            >
                                <option value="Available">🟢 Available</option>
                                <option value="In a Meeting">🟠 In a Meeting</option>
                                <option value="Do Not Disturb">🔴 Do Not Disturb</option>
                                <option value="Out of Office">⚪ Out of Office</option>
                            </select>
                        </div>

                        <div className="profile-details" style={{ marginBottom: '0' }}>
                            <div className="detail-row">
                                <Briefcase size={14} />
                                <span>{currentUser?.designation || 'No designation'}</span>
                            </div>
                            <div className="detail-row">
                                <User size={14} />
                                <span>Gender: {currentUser?.gender || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <BadgeCheck size={14} />
                                <span>System ID: #{currentUser?.id || '0000'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NavRail;