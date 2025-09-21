
require("dotenv").config();
console.log(process.env.SECRET);
console.log(process.env.MAPTILER_API_KEY);

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const MongoStore = require("connect-mongo");
const userRouter = require("./routes/user");

const app = express();


// Validation middleware
const validateListing = (req, res, next) => {
    const result = listingSchema.validate(req.body);
    if (result.error) {
        throw new ExpressError(400, result.error.details[0].message);
    }
    next();
};

// Basic setup for form data and method override
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/mydatabase";

const secret = process.env.SECRET || "mysupersecret";

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,
    },
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.user = req.user;
    next();
});

app.use("/", userRouter);

app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "student"
    });

    let registeredUser = await User.register(fakeUser, "student");
    res.send(registeredUser);
});

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Connect to MongoDB
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

// Use listing routes
app.use("/listings", listingRoutes);

// Use review routes
app.use("/listings", reviewRoutes);

app.all("*", ( req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
});

// Start server
const PORT = process.env.PORT || 0; // 0 means let OS assign available port
const server = app.listen(PORT, () => {
    const actualPort = server.address().port;
    console.log(`Server running on port ${actualPort}`);
});
