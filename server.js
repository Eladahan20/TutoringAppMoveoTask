const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Mock data for code blocks
const codeBlocks = [
    { id: 1, title: "Async Case", template: "function fetchData() {}", solution: "function fetchData() { return fetch('...'); }" },
    { id: 2, title: "Promise Example", template: "const myPromise = new Promise((resolve, reject) => {});", solution: "const myPromise = Promise.resolve();" },
];

// Enable CORS
app.use(cors({ 
    origin: "http://localhost:3000", // Your React app URL
    methods: ["GET", "POST"],
    credentials: true // Allow credentials if needed
}));
app.use(express.json()); // For parsing JSON requests
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Store users and user counts per code block
const users = {};
const userCounts = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_block', (blockId) => {
        console.log(`User ${socket.id} joined block: ${blockId}`);

        if (!users[blockId]) {
            users[blockId] = []; // Initialize empty array for this block
        }

        users[blockId].push(socket.id); // Add user to the array of users in this block

        // Join the block room so we can broadcast to all users in the room
        socket.join(blockId);

        // Assign roles: first user is mentor, others are students
        if (users[blockId].length === 1) {
            socket.emit('role', 'mentor');
        } else {
            socket.emit('role', 'student');
        }

        // Update the number of students in the room
        const numberOfStudents = users[blockId].length;
        io.to(blockId).emit('update_students', numberOfStudents); // Broadcast the count to all users in the room

        // Handle code changes made by the student
        socket.on('code_change', (newCode) => {
            // Broadcast the new code to all users in the room except the sender
            socket.to(blockId).emit('update_code', newCode);
                        // Find the correct solution for the block
                        const codeBlock = codeBlocks.find(block => block.id == blockId);

                        if (codeBlock && newCode.trim() === codeBlock.solution.trim()) {
                            // If the student's code matches the solution, notify them
                            io.to(blockId).emit('code_success'); // Broadcast success to everyone in the room
                        }
        });

        // Handle user disconnection
        socket.on('disconnect', () => {
            console.log(`User ${socket.id} disconnected from block ${blockId}`);

            // Remove the user from the array for this block
            users[blockId] = users[blockId].filter(userId => userId !== socket.id);

            // Update the student count and notify if the mentor leaves
            io.to(blockId).emit('update_students', users[blockId].length);

            // If no users are left, delete the block
            if (users[blockId].length === 0) {
                delete users[blockId]; // Delete block if empty
            } else if (users[blockId][0] !== socket.id) {
                io.to(blockId).emit('mentor_left'); // Notify if the mentor leaves
            }
        });
    });
});
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// API endpoint to get all code blocks
app.get('/api/codeblocks', (req, res) => {
    res.json(codeBlocks);
});

// API endpoint to get a specific code block by ID
app.get('/api/codeblocks/:id', (req, res) => {
    const blockId = parseInt(req.params.id, 10);
    const codeBlock = codeBlocks.find(block => block.id === blockId);
    if (codeBlock) {
        res.json(codeBlock);
    } else {
        res.status(404).send('Code block not found');
    }
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT,"0.0.0.0" ,() => {
    console.log(`Server is running on port ${PORT}`);
});
