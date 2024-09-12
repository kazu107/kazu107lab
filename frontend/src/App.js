import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Markov from './components/markov/markov';
import Test from './components/test/test';
import Microwave from './components/microwave/microwave';
import Roulette from './components/roulette/roulette';
import Sample from "./components/sample/sample";
import Login from "./components/sample/Login";
import Signup from "./components/sample/Signup";
import Probability from "./components/probability/probability";
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/markov" element={<Markov />} />
                    <Route path="/test" element={<Test />} />
                    <Route path="/microwave" element={<Microwave />} />
                    <Route path="/roulette" element={<Roulette />} />
                    <Route path="/" element={<Sample />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/probability" element={<Probability />} />
                    {/* 他のルートを追加 */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
