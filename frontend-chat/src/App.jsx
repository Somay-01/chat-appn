import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import NavRail from './components/NavRail';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import AuthScreen from './components/AuthScreen';
import AdminDashboard from './components/AdminDashboard';
import CreateGroupModal from './components/CreateGroupModal';
import SettingsModal from './components/SettingsModal';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('workspace_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isDarkMode, setDarkMode] = useState(false);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const API_BASE = "http://localhost/offline-chat/api";

  // Fetch Users List & Live Badge Updates
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchUsers = () => {
      fetch(`${API_BASE}/users.php?my_id=${currentUser.id}`)
        .then(res => res.json())
        .then(data => setUsers(Array.isArray(data) ? data : []))
        .catch(err => console.error("XAMPP Connection Error:", err));
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 2000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // PING SERVER TO STAY "ONLINE"
  useEffect(() => {
    if (!currentUser?.id) return;

    const pingOnline = () => {
      const formData = new FormData();
      formData.append('user_id', currentUser.id);
      fetch(`${API_BASE}/updateLastSeen.php`, { method: 'POST', body: formData }).catch(() => { });
    };

    pingOnline();
    const interval = setInterval(pingOnline, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const fetchGroupsData = () => {
    if (!currentUser?.id) return;
    fetch(`${API_BASE}/fetchGroups.php?user_id=${currentUser.id}`)
      .then(res => res.json())
      .then(data => setGroups(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching groups:", err));
  };

  useEffect(() => { fetchGroupsData(); }, [currentUser]);

  // ==========================================
  // UPDATED: MESSAGE FETCHING & READ RECEIPTS
  // ==========================================
  useEffect(() => {
    if (!activeUser?.id || !currentUser?.id) return;

    const markAsReadAndFetch = () => {
      // 1. Tell the server we are actively reading this chat
      const formData = new FormData();
      formData.append('reader_id', currentUser.id);
      if (activeUser.isGroup) {
        formData.append('group_id', activeUser.id);
      } else {
        formData.append('chat_partner_id', activeUser.id);
      }
      fetch(`${API_BASE}/readMessages.php`, { method: 'POST', body: formData }).catch(() => { });

      // 2. Fetch the latest messages
      const fetchUrl = activeUser.isGroup
        ? `${API_BASE}/fetchMessage.php?sender_id=${currentUser.id}&group_id=${activeUser.id}`
        : `${API_BASE}/fetchMessage.php?sender_id=${currentUser.id}&receiver_id=${activeUser.id}`;

      fetch(fetchUrl)
        .then(res => res.json())
        .then(data => setMessages(Array.isArray(data) ? data : []))
        .catch(err => console.error("Fetch message error:", err));
    };

    markAsReadAndFetch(); // Call immediately on chat open
    const interval = setInterval(markAsReadAndFetch, 2000); // Call every 2 seconds while open
    return () => clearInterval(interval);
  }, [activeUser, currentUser]);
  // ==========================================

  const handleSendMessage = async (text, file = null, replyId = 0) => {
    if (!activeUser?.id || !currentUser?.id || (!text.trim() && !file)) return;
    const formData = new FormData();
    formData.append('sender_id', currentUser.id);
    formData.append('reply_to', replyId);
    if (activeUser.isGroup) { formData.append('group_id', activeUser.id); }
    else { formData.append('receiver_id', activeUser.id); }
    formData.append('message', text);
    if (file) formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/sendMessage.php`, { method: 'POST', body: formData });
      const result = await response.json();
      if (result.status === 'success') {
        const fetchUrl = activeUser.isGroup
          ? `${API_BASE}/fetchMessage.php?sender_id=${currentUser.id}&group_id=${activeUser.id}`
          : `${API_BASE}/fetchMessage.php?sender_id=${currentUser.id}&receiver_id=${activeUser.id}`;
        const res = await fetch(fetchUrl);
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) { console.error("Send failed:", err); }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveUser(null);
    localStorage.removeItem('workspace_user');
  };

  if (!currentUser) return <AuthScreen onLogin={(userData) => setCurrentUser(userData)} />;

  return (
    <div className={`chat-page ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="app-layout">
        <NavRail
          toggleDarkMode={() => setDarkMode(!isDarkMode)}
          isDarkMode={isDarkMode}
          currentUser={currentUser}
          onOpenSettings={() => setShowSettings(true)}
          onOpenAdmin={() => setShowAdminPanel(true)}
        />
        <Sidebar
          users={users}
          currentUser={currentUser}
          groups={groups}
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          onOpenGroupModal={() => setGroupModalOpen(true)}
        />
        <ChatArea
          currentUser={currentUser}
          activeUser={activeUser}
          messages={messages}
          setMessages={setMessages}
          onSendMessage={handleSendMessage}
          users={users}
        />
      </div>

      {isGroupModalOpen && (
        <CreateGroupModal
          currentUser={currentUser}
          users={users}
          onClose={() => setGroupModalOpen(false)}
          onGroupCreated={() => {
            fetchGroupsData();
            setGroupModalOpen(false);
          }}
        />
      )}
      {showAdminPanel && (
        <AdminDashboard API_BASE={API_BASE} onClose={() => setShowAdminPanel(false)} currentUser={currentUser} />
      )}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} onLogout={logout} currentUser={currentUser} />
      )}
    </div>
  );
}

export default App;