import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Markov from './components/markov/markov';
import Test from './components/test/test';
import Microwave from './components/microwave/microwave';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/markov" element={<Markov />} />
                    <Route path="/test" element={<Test />} />
                    <Route path="/microwave" element={<Microwave />} />
                    {/* 他のルートを追加 */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
