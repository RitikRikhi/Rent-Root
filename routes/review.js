const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Review = require("../models/review");
const Listing = require("../models/listing");
const { reviewSchema } = require("../schema.js");

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to perform this action");
        return res.redirect("/login");
    }
    next();
};

// Validation middleware
const validateReview = (req, res, next) => {
    const result = reviewSchema.validate(req.body);
    if (result.error) {
        throw new ExpressError(400, result.error.details[0].message);
    }
    next();
};

// POST route to create a new review
router.post("/:listingId/reviews", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.listingId);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    listing.reviews.push(review);
    await review.save();
    // Add review to listing without triggering validation
    await Listing.findByIdAndUpdate(req.params.listingId, {
        $push: { reviews: review._id }
    });
    res.redirect(`/listings/${listing._id}`);
}));

// DELETE route to delete a review
router.delete("/:listingId/reviews/:reviewId", isLoggedIn, wrapAsync(async (req, res) => {
    const { listingId, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to delete this review");
        return res.redirect(`/listings/${listingId}`);
    }
    await Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${listingId}`);
}));

module.exports = router;
