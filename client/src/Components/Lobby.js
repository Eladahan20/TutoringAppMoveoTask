import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './Lobby.module.css'; 

const Lobby = () => {
    const [codeBlocks, setCodeBlocks] = useState([]);
    const API_URL = process.env.REACT_APP_API_URL; 

    useEffect(() => {

        const fetchCodeBlocks = async () => {
            try {
                const response = await axios.get(`https://turoring-app-502bde048aa3.herokuapp.com/api/codeblocks`);
                console.log(response.data);
                setCodeBlocks(response.data);
            } catch (err) {
                console.log('Error fetching code blocks:', err.message);
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
