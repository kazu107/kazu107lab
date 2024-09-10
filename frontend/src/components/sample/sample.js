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

const ProfileContent = ({ isLoggedIn, user }) => {
    const [location, setLocation] = useState(null);
    const [browserInfo, setBrowserInfo] = useState({});

    // Geolocation APIを使用して位置情報を取得
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setLocation({ error: 'Unable to retrieve location' });
                }
            );
        } else {
            setLocation({ error: 'Geolocation is not supported by this browser' });
        }

        // ブラウザ情報を取得
        const browserInfo = {
            appName: navigator.appName,
            appVersion: navigator.appVersion,
            userAgent: navigator.userAgent,
            platform: navigator.platform
        };
        setBrowserInfo(browserInfo);
    }, []);

    if (isLoggedIn && user) {
        return (
            <div>
                <h2>Profile</h2>
                <p>Welcome, {user.username}!</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>

                <h3>Location Information</h3>
                {location ? (
                    location.error ? (
                        <p>{location.error}</p>
                    ) : (
                        <p>
                            <strong>Latitude:</strong> {location.latitude} <br />
                            <strong>Longitude:</strong> {location.longitude}
                        </p>
                    )
                ) : (
                    <p>Fetching location...</p>
                )}

                <h3>Browser Information</h3>
                <p><strong>App Name:</strong> {browserInfo.appName}</p>
                <p><strong>App Version:</strong> {browserInfo.appVersion}</p>
                <p><strong>User Agent:</strong> {browserInfo.userAgent}</p>
                <p><strong>Platform:</strong> {browserInfo.platform}</p>
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
    const [user, setUser] = useState(null);

    useEffect(() => {
        // ログイン状態を確認するために、localStorageに保存されたトークンを確認
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setIsLoggedIn(true);
            setUser(JSON.parse(storedUser));  // localStorageからユーザー情報を取得
        }
    }, []);

    const handleLogout = () => {
        // ログアウト処理: トークンを削除し、ログイン状態をfalseに設定
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        alert('Logged out successfully!');
    };

    return (
        <div className="app-unique123">
            <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
            <div className="main-unique123">
                <Sidebar selectedSection={selectedSection} user={user} onSelect={setSelectedSection} />
                <div className="content-unique123">
                    {selectedSection === 'Profile' ? (
                        <ProfileContent isLoggedIn={isLoggedIn} user={user} />
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
