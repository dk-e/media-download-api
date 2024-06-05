const express = require('express');
const cors = require('cors');
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const httpProxy = require('http-proxy')

const app = express();
const proxy = httpProxy.createProxyServer();

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

// Define a route handler to proxy requests to the client-side application
app.get('*', (req, res) => {
    proxy.web(req, res, { target: 'https://linkify.gg/' });
});

const port = 5000;
app.listen(port, function () {
    console.log(`Server started on port: ${port}`);
});