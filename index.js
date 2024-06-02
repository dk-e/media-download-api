const express = require('express');
const cors = require('cors');
const morgan = require('morgan')

const app = express();

app.use(cors({ 
    origin: "https://linkify.gg", // Allow requests only from this origin
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const youtubeRoutes = require("./api/youtube.js");
app.use("/youtube", youtubeRoutes);

const port = 5000;
app.listen(port, function () {
    console.log(`Server started on port: ${port}`);
});