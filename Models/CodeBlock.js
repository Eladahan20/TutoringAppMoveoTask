// models/CodeBlock.js
const mongoose = require('mongoose');

// Define the schema for code blocks
const CodeBlockSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    template: {
        type: String,
        required: true
    },
    solution: {
        type: String,
        required: true
    }
});

// Export the CodeBlock model
module.exports = mongoose.model('CodeBlock', CodeBlockSchema);
