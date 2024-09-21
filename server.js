const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const app = express();
const server = http.createServer(app);
require('dotenv').config(); 

// Enable CORS
app.use(cors({ 
    origin: "*", // Your React app URL
    methods: ["GET", "POST"],
    credentials: true // Allow credentials if needed
}));
app.use(express.json()); // For parsing JSON requests
app.use(express.static(path.join(__dirname, 'client', 'build')));


// Database //
const mongoose = require('mongoose');
const CodeBlock = require('./Models/CodeBlock'); // Import the Mongoose model
const mongoURI = 'mongodb+srv://dbUser:e43221@cluster0.2mowt.mongodb.net/codeblocks_db?retryWrites=true&w=majority&appName=Cluster0;' // Change 'codeblocks_db' to your database name
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected...');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});


// Websocket //
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Store users and user counts per code block
const users = {};

io.on('connection', (socket) => {
    socket.on('join_block', async (blockId) => {
        console.log(`User ${socket.id} joined block: ${blockId}`);

        if (!users[blockId]) {
            users[blockId] = [];
        }

        users[blockId].push(socket.id);
        socket.join(blockId);

        if (users[blockId].length === 1) {
            socket.emit('role', 'mentor');
        } else {
            socket.emit('role', 'student');
        }

        const numberOfStudents = users[blockId].length;
        io.to(blockId).emit('update_students', numberOfStudents);

        // Handle code changes made by the student
        socket.on('code_change', async (newCode) => {
            socket.to(blockId).emit('update_code', newCode);

            try {
                // Fetch the solution from MongoDB
                const codeBlock = await CodeBlock.findById(blockId);
                if (codeBlock && newCode.trim() === codeBlock.solution.trim()) {
                    io.to(blockId).emit('code_success'); // Notify all users in the room
                }
            } catch (error) {
                console.error('Error checking solution:', error);
            }
        });

        socket.on('disconnect', () => {
            users[blockId] = users[blockId].filter(userId => userId !== socket.id);
            io.to(blockId).emit('update_students', users[blockId].length);

            if (users[blockId].length === 0) {
                delete users[blockId];
            } else if (users[blockId][0] !== socket.id) {
                io.to(blockId).emit('mentor_left');
            }
        });
    });
});
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});


// EndPoints //

// API endpoint to get all code blocks from MongoDB
app.get('/api/codeblocks', async (req, res) => {
    try {
        const codeBlocks = await CodeBlock.find(); // Fetch all code blocks
        res.json(codeBlocks); // Send code blocks as JSON
    } catch (error) {
        console.error('Error fetching code blocks:', error.response.data);
        res.status(500).send('Error fetching code blocks');
    }
});

// API endpoint to get a specific code block by ID
app.get('/api/codeblocks/:id', async (req, res) => {
    try {
        const codeBlock = await CodeBlock.findById(req.params.id); // Find code block by ID
        if (codeBlock) {
            res.json(codeBlock);
        } else {
            res.status(404).send('Code block not found');
        }
    } catch (error) {
        console.error('Error fetching code block:', error.response.data);
        res.status(500).send('Error fetching code block');
    }
});


// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
});
