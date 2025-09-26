const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const { userSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");

const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

const validateLogin = (req, res, next) => {
    const loginSchema = userSchema.fork(['username'], (field) => field.optional()).fork(['email'], (field) => field.required());
    const { error } = loginSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

router.get("/signup", (req, res) => {
    res.render("users/signup", { showNavbar: false, showFooter: false, showCenteredContent: true, error: req.flash("error") });
})

router.post("/signup", validateUser, wrapAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                console.error("Error during login after signup:", err);
                req.flash("error", "Login after signup failed. Please login manually.");
                return res.redirect("/login");
            }
            req.flash("success", "Welcome to RentRoot!");
            return res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

const passport = require("passport");

router.get("/login", (req, res) => {
    res.render("users/login", { showNavbar: false, showFooter: false, showCenteredContent: true, error: req.flash("error") });
});

router.post("/login", validateLogin, passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
    failureMessage: "Invalid username or password."
}), (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.returnTo || "/listings";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged out successfully");
        res.redirect("/listings");
    });
});

module.exports = router;
