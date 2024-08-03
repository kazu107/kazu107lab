import { useState } from 'react';
import './test.css';

function Square({ value, handleClick }) {
    return (
        <button className="square" onClick={handleClick}>
            {value}
        </button>
    );
}

function Test() {
    const [value, setValue] = useState(Array(9).fill(null));
    const [next, setNext] = useState(true);
    function handleClick(i) {
        if (value[i] || calculateWinner(value)) return;
        const newValue = value.slice();
        if (next) {
            newValue[i] = 'X';
        }
        else {
            newValue[i] = 'O';
        }
        setValue(newValue);
        setNext(!next);
    }
    const winner = calculateWinner(value);
    let status;
    if (winner) {
        status = 'Winner: ' + winner;
    }
    else {
        status = 'Next player: ' + (next ? 'X' : 'O');
    }
    return (
        <>
            <div className="status">{status}</div>
            <div className="board-row">
                <Square value={value[0]} handleClick={() => handleClick(0)} />
                <Square value={value[1]} handleClick={() => handleClick(1)} />
                <Square value={value[2]} handleClick={() => handleClick(2)} />
            </div>
            <div className="board-row">
                <Square value={value[3]} handleClick={() => handleClick(3)} />
                <Square value={value[4]} handleClick={() => handleClick(4)} />
                <Square value={value[5]} handleClick={() => handleClick(5)} />
            </div>
            <div className="board-row">
                <Square value={value[6]} handleClick={() => handleClick(6)} />
                <Square value={value[7]} handleClick={() => handleClick(7)} />
                <Square value={value[8]} handleClick={() => handleClick(8)} />
            </div>
        </>
    );
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

export default Test;