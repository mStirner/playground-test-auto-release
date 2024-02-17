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

// Testing git commits: "`fix` commit added"
// https://github.com/mStirner/playground-test-auto-release/issues/22
// test "feature" category for github release notes
// test commit #1
// test commit #2
// test commit #3

app.listen(Number(HTTP_PORT), HTTP_HOST, (err) => {
    console.log(err || `HTTP Server listening on http://${HTTP_HOST}:${HTTP_PORT}`);
});