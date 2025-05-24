import React, { useState, useEffect } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import './sample.css';

// Navbar component
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

// Sidebar component
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
                        {isDashboardOpen ? '▼' : '▶'} Lab
                    </button>
                    {isDashboardOpen && (
                        <ul>
                            {/* This should now set a general 'Lab' section for the main page */}
                            <li className={selectedSection === 'Lab' ? 'active-unique123' : ''}>
                                <a href="#lab" onClick={() => onSelect('Lab')}>Lab Dashboard</a>
                            </li>
                            {/* Individual tool links in sidebar still go directly to their pages */}
                            <li><a href="/microwave">Microwave Simulator</a></li>
                            <li><a href="/roulette">Accurate Roulette</a></li>
                            <li><a href="/markov">Markov Chain</a></li>
                            <li><a href="/probability">Gacha Simulator</a></li>
                            <li><a href="/aster">Aster Visualizer</a></li>
                            <li><a href="/rpn-calculator">RPN Calculator</a></li>
                            <li><a href="/speaker">Speaker Tool</a></li>
                            <li><a href="/test">Test Page</a></li>
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

// ProfileContent component
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

const LabContent = () => {
    return (
        <div>
            <h2>Lab Dashboard</h2>
            <p>Welcome to the kazu107 Lab. Explore various tools and simulations:</p>
            <ul className="lab-tool-list">
                <li>
                    <strong>Microwave Simulator:</strong> Simulates microwave behavior.
                    <a href="/microwave" className="external-link-lab" title="Open Microwave Simulator" target="_blank" rel="noopener noreferrer"><FaExternalLinkAlt /></a>
                    <a href="/microwave" className="goto-tool-link"> Go to tool</a>
                </li>
                <li>
                    <strong>Accurate Roulette:</strong> Experience an accurate roulette simulation.
                    <a href="/roulette" className="external-link-lab" title="Open Accurate Roulette" target="_blank" rel="noopener noreferrer"><FaExternalLinkAlt /></a>
                    <a href="/roulette" className="goto-tool-link"> Go to tool</a>
                </li>
                <li>
                    <strong>Markov Chain:</strong> Explore Markov chains.
                    <a href="/markov" className="external-link-lab" title="Open Markov Chain tool" target="_blank" rel="noopener noreferrer"><FaExternalLinkAlt /></a>
                    <a href="/markov" className="goto-tool-link"> Go to tool</a>
                </li>
                <li>
                    <strong>Gacha Simulator:</strong> Simulate gacha mechanics.
                    <a href="/probability" className="external-link-lab" title="Open Gacha Simulator" target="_blank" rel="noopener noreferrer"><FaExternalLinkAlt /></a>
                    <a href="/probability" className="goto-tool-link"> Go to tool</a>
                </li>
                <li>
                    <strong>Aster Visualizer:</strong> Visualize asterisk patterns.
                    <a href="/aster" className="external-link-lab" title="Open Aster Visualizer" target="_blank" rel="noopener noreferrer"><FaExternalLinkAlt /></a>
                    <a href="/aster" className="goto-tool-link"> Go to tool</a>
                </li>
                <li>
                    <strong>RPN Calculator:</strong> Convert expressions to RPN and view trees.
                    <a href="/rpn-calculator" className="external-link-lab" title="Open RPN Calculator" target="_blank" rel="noopener noreferrer"><FaExternalLinkAlt /></a>
                    <a href="/rpn-calculator" className="goto-tool-link"> Go to tool</a>
                </li>
                <li>
                    <strong>Speaker Tool:</strong> Speaker-related functions.
                    <a href="/speaker" className="external-link-lab" title="Open Speaker Tool" target="_blank" rel="noopener noreferrer"><FaExternalLinkAlt /></a>
                    <a href="/speaker" className="goto-tool-link"> Go to tool</a>
                </li>
                <li>
                    <strong>Test Page:</strong> A page for testing.
                    <a href="/test" className="external-link-lab" title="Open Test Page" target="_blank" rel="noopener noreferrer"><FaExternalLinkAlt /></a>
                    <a href="/test" className="goto-tool-link"> Go to tool</a>
                </li>
            </ul>
        </div>
    );
};


function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedSection, setSelectedSection] = useState('Profile'); // Default to Profile
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
                    <div className="content-unique123">
                        {selectedSection === 'Profile' && <ProfileContent isLoggedIn={isLoggedIn} user={user} />}
                        {selectedSection === 'Settings' && <h2>Settings</h2>}
                        {selectedSection === 'Security' && <h2>Security Settings</h2>}
                        {selectedSection === 'Lab' && <LabContent />} {/*  <-- Render LabContent */}
                        {/* Remove other individual content like MicrowaveContent, RouletteContent etc. from here */}
                        {selectedSection === 'Help' && <h2>Help</h2>}
                        {selectedSection === 'Logout' && <h2>Logout</h2>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
