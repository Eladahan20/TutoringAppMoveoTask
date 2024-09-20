import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Lobby = () => {
    const [codeBlocks, setCodeBlocks] = useState([]);
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchCodeBlocks = async () => {
            const response = await axios.get(`${API_URL}/api/codeblocks`);
            setCodeBlocks(response.data);
        };

        fetchCodeBlocks();
    }, []);
console.log(API_URL);
    return (
        <div>
            <h1>Choose Code Block</h1>
            <ul>
                {codeBlocks.map(block => (
                    <li key={block._id}>
                        <Link to={`/codeblock/${block._id}`}>{block.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Lobby;
