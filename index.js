const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors()); // Enable CORS for all routes

// Handle preflight requests
app.options('*', cors());

const youtubeRoutes = require("./api/youtube.js");
app.use("/youtube", youtubeRoutes);

const port = 5000;
app.listen(port, function () {
    console.log(`Server started on port: ${port}`);
});