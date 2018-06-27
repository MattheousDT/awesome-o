"use strict";

const fs = require("fs");
const path = require("path");

const crypto = require("crypto");
const axios = require("axios");
const express = require("express");
const showdown = require("showdown");
const jwt = require("jsonwebtoken"); 

const schemas = require("../../db");
const Logger = require("../../logger");
const api = require("./api");
const { fetchSession, authLogin } = require("../middlewares");

const apiLogger = new Logger();
const router = express.Router();
const converter = new showdown.Converter();

const getUserData = token => {
    return new Promise((resolve, reject) => {

        axios({
            method: "get",
            url: "https://discordapp.com/api/v6/users/@me",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(res => {

            resolve(res.data);
        }).catch(err => {

            reject(err);
        });
    });
}

let config;
try {

    config = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "config.json")));
} catch(err) {

    apiLogger.fatalError(`Could not read config file: ${err}`);
}

router.use("/api/v3", api);

router.get("/auth/discord", fetchSession, (req, res) => {

    if (req.session !== undefined && req.session.discord.id !== null) {

        // Already logged in.
        return res.redirect("/dashboard");
    }

    const nonce = crypto.randomBytes(20).toString("hex");

    const session = new schemas.SessionSchema({
        nonce
    });

    session.save().then(doc => {

        const token = jwt.sign({ id: doc._id }, config.rawrxd);
        res.cookie("session", token);
        res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${config.id}&redirect_uri=${encodeURIComponent(config.redirect)}&response_type=code&scope=guilds%20identify&state=${nonce}`);

    }).catch(err => {

        res.json({ status: 401, message: "Unauthorized", error: err });
    });
});

router.get("/auth/discord/callback", fetchSession, (req, res) => {

    if (req.session === undefined || req.session.nonce === null) {
        return res.json({ status: 401, message: "Unauthorized", error: "Error fatching session" });
    }

    if (req.session.nonce !== req.query.state) {
        return res.json({ status: 401, message: "Unauthorized", error: "Login state was incorrect" });
    }

    axios({
        method: "post",
        url: `https://discordapp.com/api/oauth2/token?client_id=${config.id}&client_secret=${config.secret}&grant_type=authorization_code&code=${req.query.code}&redirect_uri=${encodeURIComponent(config.redirect)}`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then(tokenres => {

        axios({
            method: "get",
            url: "https://discordapp.com/api/v6/users/@me",
            headers: {
                "Authorization": `Bearer ${tokenres.data.access_token}`
            }
        }).then(userres => {

            req.session.discord.id = userres.data.id;
            req.session.discord.access_token = tokenres.data.access_token;
            req.session.discord.token_type = tokenres.data.token_type;
            req.session.discord.expires_in = tokenres.data.expires_in;
            req.session.discord.refresh_token = tokenres.data.refresh_token;
            req.session.discord.scope = tokenres.data.scope;

            req.session.save().then(doc => {

                res.redirect("/dashboard");
            }).catch(err => {

                res.json({ status: 401, message: "Unauthorized", error: err });
            });

        }).catch(err => {

            res.json({ status: 401, message: "Unauthorized", error: err });
        });
    }).catch(err => {

        res.json({ status: 401, message: "Unauthorized", error: err });
    });
});

router.get("/", fetchSession, async (req, res, next) => {

    let user = null;

    if (req.session !== undefined && req.session.discord.id !== null) {

        user = await getUserData(req.session.discord.access_token);
    }

    res.render("index", { md: text => { return converter.makeHtml(text); }, user });
});

router.get("/dashboard", fetchSession, authLogin, (req, res, next) => {

    res.send("this is the shitty commands page lol");
});

router.get("/token", fetchSession, authLogin, (req, res) => {
    
    res.json({ token: req.cookies.session });
});

/*
const fs = require("fs");
const path = require("path");

const commandsfile = fs.readFileSync(path.join(__dirname, "..", "translations", "commands", "commands.json"));
const commands = JSON.parse(commandsfile);
*/

/*
router.get("/",  async (req, res) => {

    /*
    if (req.session.discord_login !== null && req.session.discord_login !== undefined) {
        
        if (req.session.userData === null || req.session.userData === undefined || (Date.now() - req.session.userData.time) / 1000 > 300) {

            req.session.userData = await getUserData(req.session.discord_login.access_token);
            if (req.session.userData === null) {

                res.status(500).send("Error getting user info.");
                return;
            }
        }

        res.render("index", { md: text => { return converter.makeHtml(text); }, user: req.session.userData });

    } else {

        res.render("index", { md: text => { return converter.makeHtml(text); }, user: null });
    }


    res.render("index", { md: text => { return converter.makeHtml(text); }, user: null });
});
*/

// /commands

/*
router.get("/commands", async (req, res) => {

    if (req.session.discord_login !== null && req.session.discord_login !== undefined) {
        
        if (req.session.userData === null || req.session.userData === undefined || (Date.now() - req.session.userData.time) / 1000 > 300) {

            req.session.userData = await getUserData(req.session.discord_login.access_token);
            if (req.session.userData === null) {

                res.status(500).send("Error getting user info.");
                return;
            }
        }

        res.render("commands", { md: text => { return converter.makeHtml(text); }, user: req.session.userData});

    } else {

        res.render("commands", { md: text => { return converter.makeHtml(text); }, user: null});
    }
});

// /dashboard

router.get("/dashboard/profiles/mattheous", (req, res) => {
    return res.render("profile-admin", { md: text => { return converter.makeHtml(text); } });
});
*/

/* -------------------------- */
/* >>> DISCORD LOGIN SHIT <<< */
/* -------------------------- */

/*
router.get("/auth/discord", (req, res) => {

    const state = crypto.randomBytes(20).toString("hex");

    req.session.nonce = state;

    res.redirect("https://discordapp.com/api/oauth2/authorize?client_id=372462428690055169&redirect_uri=http%3A%2F%2F81.156.215.77%3A80%2Fauth%2Fdiscord%2Fcallback&response_type=code&scope=guilds%20identify&state="+state);
    return;
});

router.get("/auth/discord/callback", (req, res) => {

    if (req.session.nonce === null || req.session.nonce === undefined) {
        res.status(500).send("Error logging in.");
        return;
    }

    if (req.query.code === null || req.query.code === undefined) {
        res.status(500).send("Error logging in.");
        return;
    }

    if (req.session.nonce !== req.query.state) {
        res.status(500).send("Error logging in.");
        return;
    }

    req.session.nonce = null;

    axios({
        method: "post",
        url: "https://discordapp.com/api/oauth2/token?client_id=372462428690055169&client_secret=e-GgLn0Ndv9LJc1jupdpsk1zNGPy4g4U&grant_type=authorization_code&code="+req.query.code+"&redirect_uri=http%3A%2F%2F81.156.215.77%3A80%2Fauth%2Fdiscord%2Fcallback",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then(res2 => {

        req.session.discord_login = res2.data;
        res.redirect("/dashboard");
        return;
    }).catch(err => {

        res.status(500).send("Error logging in.");
        return;
    });
});
*/

/*
router.get("/auth/discord/me", (req, res) => {
    
    if (!req.session.token.access_token) {
        return res.status(500).send("Error logging in.");
    }
    axios({
        method: "get",
        url: "https://discordapp.com/api/v6/users/@me",
        headers: {
            "Authorization": "Bearer "+req.session.token.access_token
        }
    }).then(res2 => {
        req.session.user = res2.data;
        return res.redirect("/");
    }).catch(err => {
        return res.status(500).send("Error logging in.");
    });
});
*/

/* -------------------------- */
/*        >>> END <<<         */
/* -------------------------- */

module.exports = router;