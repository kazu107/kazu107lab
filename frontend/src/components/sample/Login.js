import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsLoggedIn, setUser }) => {
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

            // JWTトークンを localStorage に保存
            localStorage.setItem('token', response.data.token);

            // ユーザー情報を localStorage に保存
            const userInfo = {
                id: response.data.user.id,
                username: response.data.user.username,
                email: response.data.user.email
            };
            localStorage.setItem('user', JSON.stringify(userInfo));

            // グローバルな状態にユーザー情報を設定
            setUser = userInfo;
            setIsLoggedIn = true;

            // ログイン成功後にリダイレクト
            navigate('/');
        } catch (err) {
            console.error('Error during login request:', err);
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
