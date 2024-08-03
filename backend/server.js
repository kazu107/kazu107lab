const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// フロントエンドのビルド済みファイルを提供する
app.use(express.static(path.join(__dirname, '../frontend/build')));

// すべてのリクエストをフロントエンドのindex.htmlに渡す
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} `);
});
