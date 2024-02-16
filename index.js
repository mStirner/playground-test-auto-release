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
        body: req.body
    });

});

// this line was added to test github actions
// TODO: lorem ipsum
// foo
// bar
// test commit: `fix`: foo
// test commit: [fix]: foo
// another test commit `fix`: foo

app.listen(Number(HTTP_PORT), HTTP_HOST, (err) => {
    console.log(err || `HTTP Server listening on http://${HTTP_HOST}:${HTTP_PORT}`);
});