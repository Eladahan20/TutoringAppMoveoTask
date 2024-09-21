import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const CodeBlock = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [code, setCode] = useState('');
    const [role, setRole] = useState('student');
    const [studentsCount, setStudentsCount] = useState(0);
    const [showSmiley, setShowSmiley] = useState(false); // State to control the smiley display
   // Use environment variables for the API and socket URLs
   const API_URL = process.env.REACT_APP_API_URL;
   const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

    const fetchCodeBlock = async () => {
        try {
            const response = await axios.get(`https://turoring-app-502bde048aa3.herokuapp.com/api/codeblocks/${id}`);
            setCode(response.data.template);
        } catch (error) {
            console.error('Error fetching code block:', error);
            navigate('/');
        }
    };

    useEffect(() => {
        fetchCodeBlock();

        const newSocket = io('https://turoring-app-502bde048aa3.herokuapp.com/');
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

        // Listen for success event and show the smiley face
        newSocket.on('code_success', () => {
            setShowSmiley(true); // Set state to display the smiley face
            setTimeout(() => {
                setShowSmiley(false); // Hide the smiley face after 2 seconds
            }, 2000); // 2000 milliseconds = 2 seconds
        });

        newSocket.on('mentor_left', () => {
            alert('Mentor has left, returning to the lobby.');
            navigate('/');
        });

        return () => {
            newSocket.emit('leave_block', id);
            newSocket.disconnect();
        };
    }, [id, navigate]);

    const handleCodeChange = (e) => {
        const newCode = e.target.value;
        setCode(newCode);

        if (role === 'student' && socket) {
            socket.emit('code_change', newCode); // Send code change to the server
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <h1>Code Block {id}</h1>
            <h2>Role: {role}</h2>
            <h3>Students in the room: {studentsCount}</h3>
            <textarea
                value={code}
                onChange={handleCodeChange}
                readOnly={role === 'mentor'}
                style={{ width: '100%', height: '400px' }}
            />

            {/* Smiley overlay */}
            {showSmiley && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}
                >
                    <span style={{ fontSize: '100px' }}>😊</span>
                </div>
            )}
        </div>
    );
};

export default CodeBlock;
