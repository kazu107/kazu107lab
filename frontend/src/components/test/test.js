import React, { useState } from 'react';
import { TextField, Container, Typography, Paper } from '@mui/material';
import './test.css';

function App() {
    const [inputText, setInputText] = useState('');

    const generateVerticalText = (text) => {
        const lines = text.split('\n');
        const maxLineLength = Math.max(...lines.map(line => line.length));

        // 各行を右揃えにするために、短い行にスペースを追加
        const paddedLines = lines.map(line => line.padStart(maxLineLength, ' '));

        let verticalLines = [];
        for (let i = 0; i < maxLineLength; i++) {
            let verticalLine = '';
            for (let j = paddedLines.length - 1; j >= 0; j--) {
                verticalLine += paddedLines[j][i] + ' ';
            }
            verticalLines.push(verticalLine);
        }

        return verticalLines;
    };

    const verticalText = generateVerticalText(inputText);

    return (
        <Container maxWidth="md" style={{ marginTop: '50px' }}>
            <Typography variant="h4" gutterBottom align="center">
                縦書きテキスト変換ツール
            </Typography>
            <TextField
                label="テキストを入力してください"
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{ marginBottom: '30px' }}
            />
            <Paper elevation={3} className="vertical-text-container">
        <pre className="vertical-text">
          {verticalText.map((line, index) => (
              <div key={index}>{line}</div>
          ))}
        </pre>
            </Paper>
        </Container>
    );
}

export default App;
