import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './Components/Lobby';
import CodeBlock from './Components/CodeBlock';
import './App.css'; // Import global styles

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Lobby />} />
                <Route path="/codeblock/:id" element={<CodeBlock />} />
            </Routes>
        </Router>
    );
}

export default App;
