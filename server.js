require('dotenv').config();
const express = require('express');
const router = require('./src/routes/routes');
const cors = require('cors');
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use('/', router)
app.use(cors());

app.listen(port, () => {
    console.log(`Server running on http:localhost:${port}/`)
})