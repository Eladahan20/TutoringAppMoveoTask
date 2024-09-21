import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import styles from './CodeBlock.module.css'; // Importing the CSS module

const CodeBlock = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [code, setCode] = useState('');
    const [role, setRole] = useState('student');
    const [studentsCount, setStudentsCount] = useState(0);
    const [showSmiley, setShowSmiley] = useState(false);

    // Use environment variables for the API and socket URLs
    const API_URL = process.env.REACT_APP_API_URL;
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

    const fetchCodeBlock = async () => {
        try {
            const response = await axios.get(`https://turoring-app-502bde048aa3.herokuapp.com/api/codeblocks/${id}`);
            console.log(response.data);
            setCode(response.data);
            console.log(response.data.template);
        } catch (error) {
            console.error('Error fetching code block:', error);
            navigate('/');
        }
    };

    useEffect(() => {
        fetchCodeBlock();

        const newSocket = io('https://turoring-app-502bde048aa3.herokuapp.com');
        setSocket(newSocket);

        newSocket.emit('join_block', id);

        newSocket.on('role', (assignedRole) => {
            setRole(assignedRole);
        });

        newSocket.on('update_students', (count) => {
            setStudentsCount(count);
        });

        newSocket.on('update_code', (newCode) => {
            setCode(newCode);
        });

    
        newSocket.on('code_success', () => {
            setShowSmiley(true);
            setTimeout(() => {
                setShowSmiley(false);
            }, 2000); 
        });

        newSocket.on('mentor_left', () => {
            alert('Mentor has left, returning to the lobby.');
            navigate('/');
        });

        return () => {
            newSocket.emit('leave_block', id);
            newSocket.disconnect();
        };
    }, [id, navigate, SOCKET_URL, showSmiley]);

    const handleCodeChange = (e) => {
        const newCode = e.target.value;
        setCode(newCode);

        if (role === 'student' && socket) {
            socket.emit('code_change', newCode);
        }
    };

    return (
        <div className={styles.codeBlockContainer}>
            <h1 className={styles.codeBlockTitle}>Code Block "{code.title}"</h1>
            <h2 className={styles.codeBlockRole}>Role: {role}</h2>
            <h3 className={styles.codeBlockStudentsCount}>Students in the room: {studentsCount}</h3>
            
            <textarea
                value={code.template}
                onChange={handleCodeChange}
                readOnly={role === 'mentor'}
                className={styles.codeEditor}
                spellCheck="false"
            />

            <p>Solution: {code.solution}</p>

            {/* Smiley overlay */}
            {showSmiley && (
                <div className={styles.smileyOverlay}>
                    <span className={styles.smiley}>😊</span>
                </div>
            )}
        </div>
    );
};

export default CodeBlock;
