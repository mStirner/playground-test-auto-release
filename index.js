const express = require("express");
const app = express();

const {
    HTTP_HOST,
    HTTP_PORT
} = Object.assign(process.env, {
    HTTP_HOST: "127.0.0.1",
    HTTP_PORT: "8123"
}, process.env);

app.use(express.json());

app.all("*", (req, res) => {

    res.json({
        headers: req.headers,
        url: req.url,
        ip: req.ip,
        body: req.body,
        method: req.method
    });

});

// comment #1
// comment #2
// comment #3
// comment #4
// comment #5
// comment #6
// git publish
// grunt publish command

app.listen(Number(HTTP_PORT), HTTP_HOST, (err) => {
    console.log(err || `HTTP Server listening on http://${HTTP_HOST}:${HTTP_PORT}`);
});