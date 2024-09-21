import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './Lobby.module.css'; // Import the CSS module

const Lobby = () => {
    const [codeBlocks, setCodeBlocks] = useState([]);
    const [error, setError] = useState(null); // To handle errors

    useEffect(() => {
        const fetchCodeBlocks = async () => {
            try {
                const API_URL = process.env.REACT_APP_API_URL || 'https://turoring-app-502bde048aa3.herokuapp.com' 
                const response = await axios.get(`${API_URL}/api/codeblocks`);
                console.log('Response from API:', response.data); // Log the response data
                if (Array.isArray(response.data)) {
                    setCodeBlocks(response.data); // Only set it if it's an array
                } else {
                    setError('Unexpected response format');
                }
            } catch (err) {
                setError('Failed to fetch code blocks');
                console.error('Error fetching code blocks:', err.message);
            }
        };
    
        fetchCodeBlocks();
    }, []);
    return (
        <div className={styles.lobbyContainer}>
        <h1 className={styles.lobbyTitle}>Choose Code Block</h1>
        <ul className={styles.codeBlockList}>
            {codeBlocks.map((block) => (
                <li key={block._id} className={styles.codeBlockItem}>
                    <Link to={`/codeblock/${block._id}`} className={styles.codeBlockLink}>
                        {block.title}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
    );
};

export default Lobby;
