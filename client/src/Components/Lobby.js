import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Lobby = () => {
    const [codeBlocks, setCodeBlocks] = useState([]);

    useEffect(() => {
        const fetchCodeBlocks = async () => {
            const response = await axios.get('http://localhost:4000/api/codeblocks');
            setCodeBlocks(response.data);
        };

        fetchCodeBlocks();
    }, []);

    return (
        <div>
            <h1>Choose Code Block</h1>
            <ul>
                {codeBlocks.map(block => (
                    <li key={block.id}>
                        <Link to={`/codeblock/${block.id}`}>{block.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Lobby;
