import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

function CreateGroupModal({ currentUser, users, onClose, onGroupCreated }) {
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);

    const API_BASE = "http://localhost/offline-chat/api";

    const toggleUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSubmit = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;

        const formData = new FormData();
        formData.append("name", groupName);
        formData.append("created_by", currentUser.id);
        formData.append("members", selectedUsers.join(","));

        try {
            const res = await fetch(`${API_BASE}/createGroup.php`, { method: 'POST', body: formData });
            const data = await res.json();

            if (data.status === "success") {
                onGroupCreated();
                onClose();
            }
        } catch (err) {
            console.error("Failed to create group:", err);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Create New Group</h3>
                    <span className="close" onClick={onClose} style={{ cursor: 'pointer', margin: 0 }}><X size={20} /></span>
                </div>

                <input
                    type="text"
                    placeholder="Group Name..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />

                <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '20px', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>Select Members:</h4>

                    {/* UPDATED: Added safety check (users &&) and switched to user.name */}
                    {users && users.filter(u => u.id !== currentUser.id).map(user => (
                        <div
                            key={user.id}
                            onClick={() => toggleUser(user.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px',
                                cursor: 'pointer',
                                background: selectedUsers.includes(user.id) ? '#f0f9ff' : 'transparent',
                                border: selectedUsers.includes(user.id) ? '1px solid #bae6fd' : '1px solid transparent',
                                borderRadius: '8px',
                                marginBottom: '5px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                                    {/* Using optional chaining ?. to prevent crash if name is missing */}
                                    {user.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <span style={{ fontWeight: selectedUsers.includes(user.id) ? '600' : '400' }}>{user.name}</span>
                            </div>
                            {selectedUsers.includes(user.id) && <Check size={18} color="#0284c7" />}
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!groupName.trim() || selectedUsers.length === 0}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: (!groupName.trim() || selectedUsers.length === 0) ? 'not-allowed' : 'pointer',
                        opacity: (!groupName.trim() || selectedUsers.length === 0) ? 0.5 : 1
                    }}
                >
                    Create Group
                </button>
            </div>
        </div>
    );
}

export default CreateGroupModal;