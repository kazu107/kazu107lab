import React, { useState, useEffect } from 'react';
import './sample.css';

const Navbar = ({ isLoggedIn, onLogout }) => (
    <nav className="navbar-unique123">
        <h1>kazu107 Lab</h1>
        <ul>
            <li><a href="/">Home</a></li>
            {!isLoggedIn && <li><a href="/signup">Signup</a></li>}
            {!isLoggedIn && <li><a href="/login">Login</a></li>}
            {isLoggedIn && <li><button onClick={onLogout} className="logout-button">Logout</button></li>}
        </ul>
    </nav>
);

const Sidebar = ({ selectedSection, onSelect }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(true);
    const [isDashboardOpen, setIsDashboardOpen] = useState(true);

    return (
        <div className="sidebar-unique123">
            <ul>
                {/* Profile Section */}
                <li>
                    <button className="toggle-button" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                        {isProfileOpen ? '▼' : '▶'} Profile
                    </button>
                    {isProfileOpen && (
                        <ul>
                            <li className={selectedSection === 'Profile' ? 'active-unique123' : ''}>
                                <a href="#profile" onClick={() => onSelect('Profile')}>Profile Overview</a>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Settings Section */}
                <li>
                    <button className="toggle-button" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
                        {isSettingsOpen ? '▼' : '▶'} Settings
                    </button>
                    {isSettingsOpen && (
                        <ul>
                            <li className={selectedSection === 'Settings' ? 'active-unique123' : ''}>
                                <a href="#settings" onClick={() => onSelect('Settings')}>General Settings</a>
                            </li>
                            <li className={selectedSection === 'Security' ? 'active-unique123' : ''}>
                                <a href="#security" onClick={() => onSelect('Security')}>Security Settings</a>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Dashboard Section */}
                <li>
                    <button className="toggle-button" onClick={() => setIsDashboardOpen(!isDashboardOpen)}>
                        {isDashboardOpen ? '▼' : '▶'} Dashboard
                    </button>
                    {isDashboardOpen && (
                        <ul>
                            <li className={selectedSection === 'Overview' ? 'active-unique123' : ''}>
                                <a href="#overview" onClick={() => onSelect('Overview')}>Overview</a>
                            </li>
                            <li className={selectedSection === 'Reports' ? 'active-unique123' : ''}>
                                <a href="#reports" onClick={() => onSelect('Reports')}>Reports</a>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Help Section */}
                <li className={selectedSection === 'Help' ? 'active-unique123' : ''}>
                    <a href="#help" onClick={() => onSelect('Help')}>Help</a>
                </li>

                {/* Logout */}
                <li className={selectedSection === 'Logout' ? 'active-unique123' : ''}>
                    <a href="#logout" onClick={() => onSelect('Logout')}>Logout</a>
                </li>
            </ul>
        </div>
    );
};

const ProfileContent = ({ isLoggedIn, user }) => {
    const [location, setLocation] = useState(null);
    const [browserInfo, setBrowserInfo] = useState({});

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
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setIsLoggedIn(true);
            setUser(JSON.parse(storedUser));  // localStorageからユーザー情報を取得
        }
    }, []);

    const handleLogout = () => {
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
