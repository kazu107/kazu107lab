import React, { useState, useEffect } from 'react';
import './sample.css';

const Navbar = ({ isLoggedIn, onLogout }) => (
    <nav className="navbar-unique123">
        <h1>My Website</h1>
        <ul>
            <li><a href="/">Home</a></li>
            {!isLoggedIn && <li><a href="/signup">Signup</a></li>}
            {!isLoggedIn && <li><a href="/login">Login</a></li>}
            {isLoggedIn && <li><button onClick={onLogout} className="logout-button">Logout</button></li>}
        </ul>
    </nav>
);

const Sidebar = ({ selectedSection, onSelect }) => (
    <div className="sidebar-unique123">
        <ul>
            <li className={selectedSection === 'Profile' ? 'active-unique123' : ''}>
                <a href="#profile" onClick={() => onSelect('Profile')}>Profile</a>
            </li>
            <li className={selectedSection === 'Settings' ? 'active-unique123' : ''}>
                <a href="#settings" onClick={() => onSelect('Settings')}>Settings</a>
            </li>
            <li className={selectedSection === 'Dashboard' ? 'active-unique123' : ''}>
                <a href="#dashboard" onClick={() => onSelect('Dashboard')}>Dashboard</a>
            </li>
            <li className={selectedSection === 'Help' ? 'active-unique123' : ''}>
                <a href="#help" onClick={() => onSelect('Help')}>Help</a>
            </li>
            <li className={selectedSection === 'Logout' ? 'active-unique123' : ''}>
                <a href="#logout" onClick={() => onSelect('Logout')}>Logout</a>
            </li>
        </ul>
    </div>
);

const ProfileContent = ({ isLoggedIn }) => {
    if (isLoggedIn) {
        return (
            <div>
                <h2>Profile</h2>
                <p>Welcome, User! You are logged in.</p>
                <p>Here are your profile details:</p>
                <ul>
                    <li>Username: johndoe</li>
                    <li>Email: johndoe@example.com</li>
                    <li>Location: New York, USA</li>
                </ul>
            </div>
        );
    } else {
        return (
            <div>
                <h2>Profile</h2>
                <p>You are not logged in.</p>
                <p>Please <a href="/login">login</a> or <a href="/signup">sign up</a> to view your profile.</p>
            </div>
        );
    }
};

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedSection, setSelectedSection] = useState('Home');

    useEffect(() => {
        // ログイン状態を確認するために、localStorageに保存されたトークンを確認
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        // ログアウト処理: トークンを削除し、ログイン状態をfalseに設定
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        alert('Logged out successfully!');
    };

    return (
        <div className="app-unique123">
            <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
            <div className="main-unique123">
                <Sidebar selectedSection={selectedSection} onSelect={setSelectedSection} />
                <div className="content-unique123">
                    {selectedSection === 'Profile' ? (
                        <ProfileContent isLoggedIn={isLoggedIn} />
                    ) : (
                        <div>
                            <h2>{selectedSection}</h2>
                            <p>Welcome to the {selectedSection} section.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
