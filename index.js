const express = require('express');
const cors = require('cors');
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')

const app = express();

app.use(cors({ 
    origin: "*",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Ensure the existence of the temp directory
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
    console.log('Temp directory created successfully.');
}

const youtubeRoutes = require("./api/youtube.js");
app.use("/youtube", youtubeRoutes);

// Serve the React app's HTML file for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log(`Server started on port: ${port}`);
});