import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import EmojiPicker from 'emoji-picker-react';
import {
    Video, ChevronDown, Search, X,
    CornerUpLeft, Copy, Smile, Trash2, Paperclip, SendHorizonal, Image as ImageIcon, Pencil,
    Check, CheckCheck, MessageSquareDashed, Pin, Users, UserPlus, UserMinus
} from 'lucide-react';

// ==========================================
// DATE HELPERS
// ==========================================
const formatDateLabel = (timestamp) => {
    if (!timestamp) return "";
    const msgDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) return "Today";
    else if (msgDate.toDateString() === yesterday.toDateString()) return "Yesterday";
    else return msgDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const isDifferentDay = (currentMsgDate, previousMsgDate) => {
    if (!previousMsgDate) return true;
    const current = new Date(currentMsgDate);
    const previous = new Date(previousMsgDate);
    return current.toDateString() !== previous.toDateString();
};

// ==========================================
// MAIN COMPONENT
// ==========================================
function ChatArea({ currentUser, logout, activeUser, messages, setMessages, onSendMessage, users, onOpenAdmin }) {

    // GUARD CLAUSE
    if (!activeUser) {
        return (
            <div className="chat-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--subtext-color)', background: 'var(--bg-color)' }}>
                <div style={{ textAlign: 'center' }}>
                    <MessageSquareDashed size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>Select a user or group from the sidebar to start chatting</p>
                </div>
            </div>
        );
    }

    const [inputText, setInputText] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const [groupMembers, setGroupMembers] = useState([]);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [hideUnreadDivider, setHideUnreadDivider] = useState(false);

    const [lightboxImage, setLightboxImage] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [editingMsg, setEditingMsg] = useState(null);
    const [showManageModal, setShowManageModal] = useState(false);
    const [isScrolledUp, setIsScrolledUp] = useState(false);

    // Edit Group States
    const [editGroupName, setEditGroupName] = useState("");
    const [isBroadcast, setIsBroadcast] = useState(false);

    const API_BASE = "http://localhost/offline-chat/api";
    const UPLOADS_BASE = "http://localhost/offline-chat/uploads";

    const messagesEndRef = useRef(null);

    // ROLE CHECKS
    const isGroupAdmin = activeUser?.isGroup && groupMembers.find(m => m.id == currentUser.id)?.role === 'admin';

    const markMessagesAsRead = async () => {
        if (!currentUser?.id || !activeUser?.id) return;
        try {
            const formData = new FormData();
            formData.append('reader_id', currentUser.id);
            if (activeUser.isGroup) {
                formData.append('group_id', activeUser.id);
            } else {
                formData.append('chat_partner_id', activeUser.id);
            }

            await fetch(`${API_BASE}/readMessages.php`, { method: 'POST', body: formData });
            setHideUnreadDivider(true);
            setMessages(prevMessages => prevMessages.map(msg => {
                if (msg.sender_id === activeUser.id && msg.is_read == 0) return { ...msg, is_read: 1 };
                return msg;
            }));
        } catch (error) { console.error("Error marking read:", error); }
    };

    const handlePinToggle = async (msg) => {
        const action = msg.is_pinned == 1 ? 'unpin' : 'pin';
        const formData = new FormData();
        formData.append('message_id', msg.id);
        formData.append('action', action);

        try {
            const res = await fetch(`${API_BASE}/pinMessage.php`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.status === 'success') {
                setActiveMenuId(null);
                setMessages(prev => prev.map(m => {
                    if (action === 'pin' && m.is_pinned == 1) return { ...m, is_pinned: 0 };
                    if (m.id === msg.id) return { ...m, is_pinned: data.is_pinned };
                    return m;
                }));
            }
        } catch (err) { console.error("Pin failed:", err); }
    };

    const scrollToMessage = (msgId) => {
        const el = document.getElementById(`msg-${msgId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.transition = 'background-color 0.5s ease';
            el.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
            setTimeout(() => el.style.backgroundColor = '', 1500);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setIsScrolledUp(!isNearBottom);
    };

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); };

    useEffect(() => { if (!isScrolledUp) { scrollToBottom(); } }, [messages, isScrolledUp]);

    const fetchCurrentGroupMembers = () => {
        if (!activeUser?.isGroup) return;
        fetch(`${API_BASE}/fetchGroupMembers.php?group_id=${activeUser.id}`)
            .then(res => res.json())
            .then(data => { if (data.status === 'success') setGroupMembers(data.members); });
    };

    useEffect(() => {
        setIsScrolledUp(false);
        setTimeout(scrollToBottom, 100);
        setHideUnreadDivider(false);
        setShowEmojiPicker(false);
        setShowManageModal(false);
        setEditingMsg(null);
        setReplyTo(null);
        setInputText("");

        if (activeUser?.id) setTimeout(markMessagesAsRead, 500);
        if (activeUser?.isGroup) {
            fetchCurrentGroupMembers();
        } else { setGroupMembers([]); }
    }, [activeUser?.id]);

    useEffect(() => {
        if (showManageModal && activeUser) {
            setEditGroupName(activeUser.username || activeUser.name || "");
            setIsBroadcast(activeUser.is_broadcast == 1);
        }
    }, [showManageModal, activeUser]);

    useEffect(() => {
        if (!activeUser?.id || !currentUser?.id || activeUser?.isGroup) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/checkTyping.php?my_id=${currentUser.id}&active_user_id=${activeUser.id}`);
                const data = await res.json();
                setIsPartnerTyping(data.is_typing);
            } catch (err) { console.error("Typing check error:", err); }
        }, 1500);
        return () => clearInterval(interval);
    }, [activeUser?.id, currentUser?.id, activeUser?.isGroup]);

    useEffect(() => {
        const handleClickOutside = (e) => { if (!e.target.closest('.message-bubble')) setActiveMenuId(null); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleManageMember = async (targetUserId, roleOrAction, type = 'manage') => {
        const formData = new FormData();
        formData.append('group_id', activeUser.id);
        formData.append('admin_id', currentUser.id);

        if (type === 'promote') {
            formData.append('target_id', targetUserId);
            formData.append('role', roleOrAction);
            try {
                const res = await fetch(`${API_BASE}/promoteMember.php`, { method: 'POST', body: formData });
                const data = await res.json();
                if (data.status === 'success') fetchCurrentGroupMembers();
                else alert(data.message);
            } catch (err) { console.error("Promote failed:", err); }
        } else {
            formData.append('target_user_id', targetUserId);
            formData.append('action', roleOrAction);
            try {
                const res = await fetch(`${API_BASE}/manageGroupMember.php`, { method: 'POST', body: formData });
                const data = await res.json();
                if (data.status === 'success') fetchCurrentGroupMembers();
                else alert(data.message);
            } catch (err) { console.error("Manage member failed:", err); }
        }
    };

    const handleUpdateGroup = async () => {
        if (!editGroupName.trim()) return;
        const formData = new FormData();
        formData.append('group_id', activeUser.id);
        formData.append('admin_id', currentUser.id);
        formData.append('name', editGroupName);
        formData.append('is_broadcast', isBroadcast ? 1 : 0);

        try {
            const res = await fetch(`${API_BASE}/updateGroup.php`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.status === 'success') {
                alert("Group updated successfully! Please refresh to see the changes.");
            } else {
                alert("Failed to update: " + data.message);
            }
        } catch (err) { console.error(err); }
    };

    const handleCopy = (text) => { navigator.clipboard.writeText(text); setActiveMenuId(null); };
    const handleReply = (msg) => { setReplyTo(msg); setEditingMsg(null); setActiveMenuId(null); };

    const handleDelete = async (msgId) => {
        const formData = new FormData();
        formData.append('message_id', msgId);
        formData.append('user_id', currentUser.id);
        try {
            const res = await fetch(`${API_BASE}/deleteMessage.php`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.status === 'success') {
                setActiveMenuId(null);
                setMessages(prev => prev.filter(m => m.id !== msgId));
            }
        } catch (err) { console.error("Delete failed:", err); }
    };

    const handleSendClick = async () => {
        if (!inputText.trim() && !selectedFile) return;
        setIsScrolledUp(false);

        if (editingMsg) {
            let textToSave = inputText.trim();
            if (editingMsg.extractedImage) textToSave = textToSave + " [ATTACHMENT]:" + editingMsg.extractedImage;

            const formData = new FormData();
            formData.append('message_id', editingMsg.id);
            formData.append('user_id', currentUser.id);
            formData.append('new_message', textToSave);

            try {
                const res = await fetch(`${API_BASE}/editMessage.php`, { method: 'POST', body: formData });
                const data = await res.json();
                if (data.status === 'success') {
                    setMessages(prev => prev.map(m => m.id === editingMsg.id ? { ...m, message: textToSave, is_edited: 1 } : m));
                    setEditingMsg(null);
                    setInputText("");
                    setShowEmojiPicker(false);
                }
            } catch (err) { console.error("Edit failed:", err); }
            return;
        }

        onSendMessage(inputText, selectedFile, replyTo?.id || 0);
        setInputText("");
        setSelectedFile(null);
        setReplyTo(null);
        setShowEmojiPicker(false);
        markMessagesAsRead();
        const fileInput = document.getElementById('fileUpload');
        if (fileInput) fileInput.value = '';
    };

    const getPartnerStatus = () => {
        if (activeUser?.isGroup) return groupMembers.map(m => m.name).join(', ');
        if (isPartnerTyping) return "Typing...";
        const activeUserDetails = users?.find(u => u.id === activeUser?.id);
        if (!activeUserDetails || !activeUserDetails.last_seen) return "Offline";
        const t = activeUserDetails.last_seen.split(/[- :]/);
        if (t.length < 6) return "Offline";
        const lastSeenDate = new Date(t[0], t[1] - 1, t[2], t[3], t[4], t[5]);
        const now = new Date();
        const diffSeconds = Math.floor((now - lastSeenDate) / 1000);
        if (diffSeconds < 25 && diffSeconds > -60) return "Online";
        const optionsTime = { hour: 'numeric', minute: '2-digit' };
        const timeString = lastSeenDate.toLocaleTimeString([], optionsTime);
        const isToday = lastSeenDate.getDate() === now.getDate() && lastSeenDate.getMonth() === now.getMonth() && lastSeenDate.getFullYear() === now.getFullYear();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = lastSeenDate.getDate() === yesterday.getDate() && lastSeenDate.getMonth() === yesterday.getMonth() && lastSeenDate.getFullYear() === yesterday.getFullYear();
        if (isToday) return `last seen today at ${timeString}`;
        if (isYesterday) return `last seen yesterday at ${timeString}`;
        return `last seen on ${lastSeenDate.toLocaleDateString()} at ${timeString}`;
    };

    const filteredMessages = (messages || []).filter(msg =>
        msg.is_deleted != 1 && (searchTerm === "" || (msg.message && msg.message.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    let firstUnreadMsgId = null;
    if (!hideUnreadDivider && filteredMessages.length > 0) {
        for (let i = 0; i < filteredMessages.length; i++) {
            if (filteredMessages[i].is_read == 0 && filteredMessages[i].sender_id != currentUser?.id) {
                firstUnreadMsgId = filteredMessages[i].id;
                break;
            }
        }
    }

    const availableUsersToAdd = users.filter(user =>
        !groupMembers.some(member => String(member.id) === String(user.id))
    );

    return (
        <div className="chat-area">
            <div className="chat-header" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 20px', width: '100%', boxSizing: 'border-box'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1' }}>
                    <div className="avatar-circle" style={{ background: activeUser ? 'linear-gradient(135deg, var(--primary), var(--accent))' : '#e2e8f0', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                        {activeUser?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                        <h3 id="chatWith" style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>
                            {activeUser?.username || "Select a user"}
                        </h3>
                        {activeUser && (
                            <div className="header-subtext" style={{ fontSize: '11px', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                {getPartnerStatus()}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', flex: '1', maxWidth: '400px' }}>
                    <div className="header-search" style={{ position: 'relative', width: '100%', padding: 0, background: 'transparent' }}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search messages..."
                            style={{
                                width: '100%', padding: '8px 16px', paddingLeft: '36px', fontSize: '13px', border: '1px solid var(--border-color)',
                                borderRadius: '8px', background: 'var(--hover-bg)', outline: 'none', color: 'var(--text-color)', transition: 'border-color 0.2s', boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                        />
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--subtext-color)', display: 'flex' }}>
                            <Search size={16} />
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', flex: '1' }}>
                    {activeUser?.isGroup && (
                        <button className="call-btn" onClick={() => setShowManageModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <Users size={16} /> {isGroupAdmin ? "Manage" : "Members"}
                        </button>
                    )}

                    <button className="call-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                        <Video size={16} /> Call
                    </button>
                </div>
            </div>

            {/* --- PINNED MESSAGE BANNER --- */}
            {(() => {
                const pinnedMsg = (messages || []).find(m => m.is_pinned == 1);
                if (!pinnedMsg) return null;

                return (
                    <div className="pinned-message-banner" onClick={() => scrollToMessage(pinnedMsg.id)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 20px', background: 'var(--hover-bg)', borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer', transition: 'background 0.2s', zIndex: 10
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                            <Pin size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>Pinned Message</span>
                                <span style={{ fontSize: '13px', color: 'var(--text-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {pinnedMsg.message ? pinnedMsg.message.replace(/\[ATTACHMENT\]:[^\s]+/g, '📎 Attachment') : "📎 Attachment"}
                                </span>
                            </div>
                        </div>
                        <div
                            onClick={(e) => { e.stopPropagation(); handlePinToggle(pinnedMsg); }}
                            style={{ padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <X size={16} color="var(--subtext-color)" title="Unpin" />
                        </div>
                    </div>
                );
            })()}

            <div className="messages" id="messages" onScroll={handleScroll} onClick={() => { markMessagesAsRead(); setShowEmojiPicker(false); }}>
                {filteredMessages.map((msg, index) => {
                    const isMe = msg.sender_id == currentUser.id;

                    let rawMsg = String(msg.message || "").replace(/&#91;/g, '[').replace(/&#93;/g, ']');
                    let cleanMessage = rawMsg;
                    let extractedImage = null;

                    if (rawMsg.includes("[ATTACHMENT]:")) {
                        const parts = rawMsg.split("[ATTACHMENT]:");
                        cleanMessage = parts[0].trim();
                        extractedImage = parts[1].trim();
                    }

                    const previousMsg = index > 0 ? filteredMessages[index - 1] : null;
                    const showDateSeparator = isDifferentDay(msg.created_at, previousMsg?.created_at);

                    return (
                        <React.Fragment key={msg.id}>
                            {showDateSeparator && (
                                <div className="date-separator-container">
                                    <span className="date-badge">
                                        {formatDateLabel(msg.created_at)}
                                    </span>
                                </div>
                            )}

                            {msg.id === firstUnreadMsgId && <div className="unread-divider"><span>Unread messages</span></div>}

                            <div id={`msg-${msg.id}`} className={`message-bubble ${isMe ? 'me' : 'them'}`} style={{ position: 'relative' }}>

                                {msg.is_pinned == 1 && (
                                    <Pin size={12} color="var(--primary)" style={{ position: 'absolute', top: '8px', right: isMe ? 'auto' : '8px', left: isMe ? '8px' : 'auto', opacity: 0.8 }} />
                                )}

                                {activeUser.isGroup && !isMe && <span className="sender-name">{msg.sender_name}</span>}

                                {msg.reply_to > 0 && (
                                    <div className="reply-preview-bubble">
                                        <small>Replying to message #{msg.reply_to}</small>
                                    </div>
                                )}

                                {extractedImage && (
                                    <div className="message-attachment" style={{ marginBottom: cleanMessage ? '8px' : '0' }}>
                                        {extractedImage.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                            <img
                                                src={`${UPLOADS_BASE}/${extractedImage}`} alt="Chat attachment"
                                                style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '8px', cursor: 'pointer', display: 'block', objectFit: 'cover' }}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                onClick={() => setLightboxImage(`${UPLOADS_BASE}/${extractedImage}`)}
                                            />
                                        ) : (
                                            <a href={`${UPLOADS_BASE}/${extractedImage}`} target="_blank" rel="noreferrer" download style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--hover-bg)', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}>
                                                <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '6px', display: 'flex' }}><Paperclip size={20} /></div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{extractedImage.split('_').pop()}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--subtext-color)' }}>Click to download</span>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                )}
                                {cleanMessage && cleanMessage !== "" && (<div style={{ paddingRight: '20px' }}>{cleanMessage}</div>)}

                                <span className="msg-time" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                    {msg.is_edited == 1 && <span style={{ fontStyle: 'italic', opacity: 0.7 }}>(edited)</span>}
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && (msg.is_read == 1 ? <CheckCheck size={16} color="#3b82f6" /> : <Check size={16} color="#8696a0" />)}
                                </span>

                                <div className="msg-dropdown-trigger" onClick={(e) => { e.stopPropagation(); setActiveMenuId(msg.id === activeMenuId ? null : msg.id); }}><ChevronDown size={18} /></div>

                                {activeMenuId === msg.id && (
                                    <div className="msg-dropdown-menu">
                                        <ul>
                                            <li onClick={() => handleReply(msg)}><CornerUpLeft size={16} /> Reply</li>
                                            <li onClick={() => handlePinToggle(msg)}><Pin size={16} /> {msg.is_pinned == 1 ? 'Unpin' : 'Pin'}</li>
                                            {isMe && cleanMessage !== "" && (<li onClick={() => { setEditingMsg({ ...msg, extractedImage }); setInputText(cleanMessage); setReplyTo(null); setActiveMenuId(null); }}><Pencil size={16} /> Edit</li>)}
                                            {cleanMessage && <li onClick={() => handleCopy(cleanMessage)}><Copy size={16} /> Copy</li>}
                                            {(isMe || isGroupAdmin) && (<li onClick={() => handleDelete(msg.id)} style={{ color: '#ef4444' }}><Trash2 size={16} /> Delete</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    );
                })}
                <div ref={messagesEndRef} style={{ height: "1px" }} />
            </div>

            <div className="input-panel-container">

                {activeUser?.isGroup && activeUser?.is_broadcast == 1 && !isGroupAdmin ? (
                    <div style={{ textAlign: 'center', padding: '15px', color: 'var(--subtext-color)', background: 'var(--hover-bg)', width: '100%', borderTop: '1px solid var(--border-color)' }}>
                        Only admins can send messages in this announcement channel.
                    </div>
                ) : (
                    <>
                        {editingMsg && (
                            <div className="reply-bar" style={{ borderLeft: '5px solid var(--accent)', background: 'var(--input-bg)' }}>
                                <div className="reply-info" style={{ background: 'var(--reply-bg)' }}>
                                    <strong className="reply-user" style={{ color: 'var(--accent)' }}>Editing Message</strong>
                                    <p className="reply-message">{editingMsg.message.replace(/\[ATTACHMENT\]:[^\s]+/g, '').trim()}</p>
                                </div>
                                <X size={18} className="reply-close" onClick={() => { setEditingMsg(null); setInputText(""); }} />
                            </div>
                        )}

                        {selectedFile && (
                            <div className="reply-bar" style={{ borderLeft: '5px solid #3b82f6', background: 'var(--input-bg)' }}>
                                <div className="reply-info" style={{ background: 'var(--reply-bg)', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                    <ImageIcon size={20} color="#3b82f6" />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <strong className="reply-user" style={{ color: '#3b82f6' }}>Selected File</strong>
                                        <p className="reply-message">{selectedFile.name}</p>
                                    </div>
                                </div>
                                <X size={18} className="reply-close" onClick={() => { setSelectedFile(null); document.getElementById('fileUpload').value = ''; }} />
                            </div>
                        )}

                        {replyTo && !selectedFile && !editingMsg && (
                            <div className="reply-bar">
                                <div className="reply-info">
                                    <strong className="reply-user">{replyTo.sender_name}</strong>
                                    <p className="reply-message">{replyTo.message || "Photo"}</p>
                                </div>
                                <X size={18} className="reply-close" onClick={() => setReplyTo(null)} />
                            </div>
                        )}

                        <div style={{ position: 'relative', width: '100%' }}>
                            {showEmojiPicker && (
                                <div style={{ position: 'absolute', bottom: '100%', left: '0', zIndex: 1000, marginBottom: '10px' }}>
                                    <EmojiPicker onEmojiClick={(emojiObject) => { setInputText(prevText => prevText + emojiObject.emoji); }} theme="auto" />
                                </div>
                            )}

                            <div className="chat-input">
                                <button className="input-action-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}><Smile size={22} color={showEmojiPicker ? "#00a884" : undefined} /></button>
                                <label htmlFor="fileUpload" className="input-action-btn" style={{ cursor: 'pointer', opacity: editingMsg ? 0.5 : 1, pointerEvents: editingMsg ? 'none' : 'auto' }}><Paperclip size={22} /></label>
                                <input type="file" id="fileUpload" accept="image/*,.pdf,.doc,.docx,.txt,.zip,.xlsx" hidden onChange={(e) => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); }} />
                                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onClick={() => { markMessagesAsRead(); setShowEmojiPicker(false); }} onFocus={markMessagesAsRead} onKeyDown={(e) => { if (e.key === 'Enter' && inputText.trim() !== '') { e.preventDefault(); handleSendClick(); } }} placeholder={editingMsg ? "Edit your message..." : "Type a message"} />
                                <button className="send-btn" onClick={handleSendClick}><SendHorizonal size={22} color={editingMsg ? "var(--accent)" : undefined} /></button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {lightboxImage && (
                <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setLightboxImage(null)}><X size={32} /></button>
                        <img src={lightboxImage} alt="Expanded view" />
                    </div>
                </div>
            )}

            {showManageModal && createPortal(
                <div className="modal-overlay" onClick={() => setShowManageModal(false)} style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
                        background: 'var(--bg-color)', width: '450px', borderRadius: '12px', padding: '24px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', maxHeight: '80vh'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-color)' }}>
                                {isGroupAdmin ? 'Manage Group' : 'Group Members'}
                            </h2>
                            <button onClick={() => setShowManageModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--subtext-color)' }}><X size={24} /></button>
                        </div>

                        <div style={{ overflowY: 'auto', paddingRight: '5px' }}>

                            {isGroupAdmin && (
                                <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
                                    <h4 style={{ fontSize: '13px', color: 'var(--subtext-color)', marginBottom: '10px', marginTop: 0 }}>GROUP SETTINGS</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <input
                                            type="text"
                                            value={editGroupName}
                                            onChange={(e) => setEditGroupName(e.target.value)}
                                            placeholder="Group Name"
                                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                        />
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-color)', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={isBroadcast}
                                                onChange={(e) => setIsBroadcast(e.target.checked)}
                                            />
                                            Broadcast Mode (Only Admins can post)
                                        </label>
                                        <button onClick={handleUpdateGroup} style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                                            Save Settings
                                        </button>
                                    </div>
                                </div>
                            )}

                            <h3 style={{ fontSize: '13px', color: 'var(--subtext-color)', marginBottom: '10px' }}>MEMBERS ({groupMembers.length})</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                {groupMembers.map(member => (
                                    <div key={`gm-${member.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {member.name[0]?.toUpperCase()}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '500' }}>{member.name}</span>
                                                <span style={{ fontSize: '11px', color: member.role === 'admin' ? 'var(--primary)' : 'var(--subtext-color)' }}>
                                                    {member.role === 'admin' ? 'Admin' : 'Member'}
                                                </span>
                                            </div>
                                        </div>

                                        {isGroupAdmin && member.id != currentUser.id && (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                {/* UPGRADED: Professional Promote/Demote Button */}
                                                <button onClick={() => handleManageMember(member.id, member.role === 'admin' ? 'member' : 'admin', 'promote')}
                                                    style={{
                                                        background: member.role === 'admin' ? '#f8fafc' : '#eff6ff',
                                                        color: member.role === 'admin' ? '#64748b' : '#3b82f6',
                                                        border: '1px solid',
                                                        borderColor: member.role === 'admin' ? '#e2e8f0' : '#bfdbfe',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.95)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                                                >
                                                    {member.role === 'admin' ? 'Demote' : 'Make Admin'}
                                                </button>

                                                {/* UPGRADED: Professional Remove Button */}
                                                <button onClick={() => handleManageMember(member.id, 'kick', 'manage')}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        background: '#fef2f2',
                                                        color: '#ef4444',
                                                        border: '1px solid #fecaca',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
                                                >
                                                    <UserMinus size={14} /> Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {isGroupAdmin && availableUsersToAdd.length > 0 && (
                                <>
                                    <h3 style={{ fontSize: '13px', color: 'var(--subtext-color)', marginBottom: '10px', marginTop: '20px' }}>ADD TO GROUP</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {availableUsersToAdd.map(user => (
                                            <div key={`av-${user.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                                <span style={{ fontSize: '14px', color: 'var(--text-color)' }}>{user.name}</span>
                                                <button onClick={() => handleManageMember(user.id, 'add')} style={{
                                                    background: 'var(--primary)', color: 'white', border: 'none',
                                                    padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px'
                                                }}>
                                                    <UserPlus size={14} /> Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </div >
    );
}

export default ChatArea;