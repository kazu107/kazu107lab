const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET;

// サインアップ処理
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // 入力値のバリデーション
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // パスワードのハッシュ化
        const hashedPassword = await bcrypt.hash(password, 10);

        // データベースにユーザーを追加
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [username, email, hashedPassword]
        );

        const user = result.rows[0];

        // JWTトークンの生成
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// ログイン処理
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    // Emailとパスワードの入力チェック
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // データベースからユーザーを検索
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        // デバッグ: データベースから取得したユーザーデータを出力
        console.log('User data from database:', user);

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // パスワードの検証
        if (!user.password_hash) {
            return res.status(500).json({ error: 'Password hash not found for the user' });
        }

        // デバッグ: ハッシュされたパスワードと入力されたパスワードを比較
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // JWTトークンの生成
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});



// フロントエンドのビルド済みファイルを提供する
app.use(express.static(path.join(__dirname, '../frontend/build')));

// すべてのリクエストをフロントエンドのindex.htmlに渡す
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
