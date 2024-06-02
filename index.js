const express = require('express');
const cors = require('cors');
const morgan = require('morgan')

const app = express();

// Enable CORS middleware
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const youtubeRoutes = require("./api/youtube.js");
app.use("/youtube", youtubeRoutes);

// Middleware to handle CORS preflight requests
app.options('/youtube/downloadMp4', cors());

// Route to handle the actual request
app.get('/youtube/downloadMp4', (req, res) => {

    res.header('Access-Control-Allow-Origin', 'https://linkify.gg');
    res.json({ message: 'Response' });
});

const port = 5000;
app.listen(port, function () {
    console.log(`Server started on port: ${port}`);
});