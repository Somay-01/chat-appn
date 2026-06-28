import React, { useState } from 'react';

function AuthScreen({ onLogin }) {
    // view can now only be 'login' or 'register'
    const [view, setView] = useState('login');
    const [name, setName] = useState('');
    const [biometricId, setBiometricId] = useState('');
    const [password, setPassword] = useState('');

    const [designation, setDesignation] = useState('');
    const [gender, setGender] = useState('');

    // Login page should be done using name/ biometric id and password
    const [loginIdentifier, setLoginIdentifier] = useState('');

    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const API_BASE = "http://localhost/offline-chat/api";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        // ==========================================
        // LOGIN LOGIC
        // ==========================================
        if (view === 'login') {
            if (!loginIdentifier || !password) return setError("Please fill all fields");
            const formData = new FormData();
            formData.append('identifier', loginIdentifier);
            formData.append('password', password);

            try {
                const res = await fetch(`${API_BASE}/login.php`, { method: 'POST', body: formData });
                const data = await res.json();

                if (data.status === 'success') {
                    onLogin(data.user);
                    if (rememberMe) {
                        localStorage.setItem('workspace_user', JSON.stringify(data.user));
                    } else {
                        localStorage.removeItem('workspace_user');
                    }
                } else {
                    setError(data.message || "Invalid credentials");
                }
            } catch (err) { setError("Failed to connect to server"); }
        }

        // ==========================================
        // REGISTER LOGIC
        // ==========================================
        else if (view === 'register') {
            if (!name || !biometricId || !designation || !password || !gender) {
                return setError("Please fill all fields");
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('biometric_id', biometricId);
            formData.append('designation', designation);
            formData.append('password', password);

            formData.append('gender', gender);

            try {
                const res = await fetch(`${API_BASE}/register.php`, { method: 'POST', body: formData });
                const data = await res.json();
                if (data.status === 'success') {
                    setSuccessMsg(data.message || "Registration successful! Please wait for approval.");
                    setView('login');
                    setPassword('');
                } else setError(data.message || "Registration failed");
            } catch (err) { setError("Failed to connect to server"); }
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-left">
                    <h2>Welcome to Workspace</h2>
                    <p>Connect instantly with your colleagues and start chatting in real time. Secure, fast, and simple messaging experience.</p>
                </div>
                <div className="auth-right">
                    <h3>
                        {view === 'login' ? "Login" : "Create Account"}
                    </h3>

                    {error && <div className="error-banner">{error}</div>}
                    {successMsg && <div className="error-banner" style={{ background: '#dcfce7', color: '#16a34a' }}>{successMsg}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>

                        {/* ================= REGISTER VIEW ================= */}
                        {view === 'register' && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Biometric ID (e.g., BIO-1024)"
                                    value={biometricId}
                                    onChange={e => setBiometricId(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />

                                <input
                                    type="text"
                                    placeholder="Designation (e.g., Team Lead)"
                                    value={designation}
                                    onChange={e => setDesignation(e.target.value)}
                                />

                                <div style={{ display: 'flex', gap: '15px', padding: '10px 5px', color: '#334155', fontSize: '14px' }}>
                                    <span>Gender:</span>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Male"
                                            checked={gender === 'Male'}
                                            onChange={e => setGender(e.target.value)}
                                        /> Male
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Female"
                                            checked={gender === 'Female'}
                                            onChange={e => setGender(e.target.value)}
                                        /> Female
                                    </label>
                                </div>
                            </>
                        )}

                        {/* ================= LOGIN VIEW ================= */}
                        {view === 'login' && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Name or Biometric ID"
                                    value={loginIdentifier}
                                    onChange={e => setLoginIdentifier(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />

                                <div className="auth-options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        /> Remember me
                                    </label>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                                        Forgot Password? Contact Admin.
                                    </span>
                                </div>
                            </>
                        )}

                        <button type="submit" className="auth-submit-btn">
                            {view === 'login' ? "Sign In" : "Sign Up"}
                        </button>
                    </form>

                    <div className="auth-toggle-text">
                        {view === 'login' ? (
                            <>Don't have an account? <span className="toggle-link" onClick={() => { setView('register'); setError(''); setSuccessMsg(''); }}>Sign Up</span></>
                        ) : (
                            <>Already have an account? <span className="toggle-link" onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}>Sign In</span></>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthScreen;