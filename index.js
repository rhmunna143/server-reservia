const express = require('express');

const app = express()
const port = process.env.PORT || 8050;


app.get("/", (req, res) => {
    res.send("reservia server is running...")
})










app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})