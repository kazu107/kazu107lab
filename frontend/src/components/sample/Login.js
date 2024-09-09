import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsLoggedIn }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/login', formData);
            localStorage.setItem('token', response.data.token);
            setIsLoggedIn(true);  // ログイン状態をtrueに
            alert('Login successful!');
            navigate('/dashboard');  // ダッシュボードへリダイレクト
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password');
        }
    };

    return (
        <div className="auth-container-unique123">
            <div className="auth-box-unique123">
                <h2>Login</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleSubmit} className="auth-form-unique123">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />

                    <label>Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />

                    <button type="submit">Login</button>
                </form>
                <p>Don't have an account? <a href="/signup">Signup here</a></p>
            </div>
        </div>
    );
};

export default Login;
