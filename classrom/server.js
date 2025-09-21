const express = require("express");
const app = express();
const session = require("express-session");

app.use(session({secret: "mysupersecret"}));

const sessionOptions = {
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: true,
};

app.use(session(sessionOptions));

app.get("/register", (req, res) => {
    let {name = "anonymous"} = req.query;
    req.session.name = name;
    res.send(name);
});

app.get("/hello", (req, res) => {
    res.send(`hello ${res.session.name}`);
})

app.listen(3000, () => {
    console.log("Serving on port 3000");
})