const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const wrapAsync = require("../utils/wrapAsync");

// Middleware to check if user is authenticated
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in to create a new listing.");
        return res.redirect("/login");
    }
    next();
};

// Middleware to check if user is the owner of the listing
const isOwner = wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
});

// Validation middleware
const validateListing = (req, res, next) => {
    const { listing } = req.body;

    // Basic validation
    if (!listing) {
        throw new ExpressError(400, "Listing data is required");
    }

    if (!listing.title || !listing.title.trim()) {
        throw new ExpressError(400, "Title is required");
    }

    if (!listing.description || !listing.description.trim()) {
        throw new ExpressError(400, "Description is required");
    }

    if (!listing.location || !listing.location.trim()) {
        throw new ExpressError(400, "Location is required");
    }

    if (!listing.country || !listing.country.trim()) {
        throw new ExpressError(400, "Country is required");
    }

    if (!listing.price || isNaN(listing.price) || listing.price <= 0) {
        throw new ExpressError(400, "Valid price is required");
    }

    next();
};

// Show all listings with filtering
const index = wrapAsync(async (req, res) => {
    const { filter } = req.query;
    let query = {};

    // Apply category filter
    if (filter && filter !== 'all') {
        if (filter === 'new') {
            // Show newly added listings (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            query.createdAt = { $gte: sevenDaysAgo };
        } else if (filter === 'verified') {
            // Show verified listings
            query['amenities.verified'] = true;
        } else if (filter === 'pet-friendly') {
            // Show pet-friendly listings
            query['amenities.petFriendly'] = true;
        } else if (['trending', 'luxury', 'budget', 'beach', 'mountain', 'city', 'pool', 'standard'].includes(filter)) {
            // Show listings by category
            query.category = filter;
        }
    }

    const allListings = await Listing.find(query).sort({ createdAt: -1 });
    res.render("listings/index", { allListings, currentFilter: filter || 'all' });
});

// Show form to create new listing
const renderNewForm = (req, res) => {
    res.render("listings/new");
};

const createListing = wrapAsync(async (req, res) => {
    try {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        // Handle image upload
        if (req.file) {
            let url = req.file.path;
            let filename = req.file.filename;
            newListing.image = { url, filename };
        } else {
            // Default image if no file uploaded
            newListing.image = {
                url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNhbXBpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
                filename: "default_listing_image"
            };
        }

        // Handle coordinates - support both GeoJSON and simple lat/lng formats
        if (req.body.listing.geometry) {
            // GeoJSON format
            newListing.geometry = req.body.listing.geometry;
            // Extract lat/lng for backward compatibility
            if (req.body.listing.geometry.coordinates &&
                req.body.listing.geometry.coordinates.length === 2) {
                const [lng, lat] = req.body.listing.geometry.coordinates;
                newListing.latitude = lat;
                newListing.longitude = lng;
            }
        } else if (req.body.listing.latitude && req.body.listing.longitude) {
            // Simple lat/lng format - convert to GeoJSON
            const lat = parseFloat(req.body.listing.latitude);
            const lng = parseFloat(req.body.listing.longitude);
            newListing.geometry = {
                type: 'Point',
                coordinates: [lng, lat]
            };
            newListing.latitude = lat;
            newListing.longitude = lng;
        }

        await newListing.save();
        req.flash("success", "Successfully created a new listing!");
        res.redirect(`/listings/${newListing._id}`);
    } catch (error) {
        req.flash("error", "Failed to create a new listing. Please try again.");
        res.redirect("/listings/new");
    }
});

// Show single listing
const showListing = wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate("reviews").populate("owner").populate("reviews.author");

    // Calculate average rating
    let averageRating = 0;
    if (listing.reviews && listing.reviews.length > 0) {
        const totalRating = listing.reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = totalRating / listing.reviews.length;
    }

    res.render("listings/show", { listing, averageRating });
});

// Show edit form
const renderEditForm = wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    res.render("listings/edit", { listing });
});

// Update listing
const updateListing = wrapAsync(async (req, res) => {
    let { id } = req.params;
    let updateData = { ...req.body.listing };

    // Handle image upload
    if (req.file) {
        updateData.image = { url: req.file.path, filename: req.file.filename };
    }

    // Handle coordinates - support both GeoJSON and simple lat/lng formats
    if (req.body.listing.geometry) {
        // GeoJSON format
        updateData.geometry = req.body.listing.geometry;
        // Extract lat/lng for backward compatibility
        if (req.body.listing.geometry.coordinates &&
            req.body.listing.geometry.coordinates.length === 2) {
            const [lng, lat] = req.body.listing.geometry.coordinates;
            updateData.latitude = lat;
            updateData.longitude = lng;
        }
    } else if (req.body.listing.latitude && req.body.listing.longitude) {
        // Simple lat/lng format - convert to GeoJSON
        const lat = parseFloat(req.body.listing.latitude);
        const lng = parseFloat(req.body.listing.longitude);
        updateData.geometry = {
            type: 'Point',
            coordinates: [lng, lat]
        };
        updateData.latitude = lat;
        updateData.longitude = lng;
    }

    await Listing.findByIdAndUpdate(id, updateData);
    res.redirect(`/listings/${id}`);
});

// Delete listing
const deleteListing = wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});

module.exports = {
    isLoggedIn,
    isOwner,
    validateListing,
    index,
    renderNewForm,
    createListing,
    showListing,
    renderEditForm,
    updateListing,
    deleteListing,
    searchListings: async (req, res, next) => {
        try {
            const { q } = req.query;
            if (!q) {
                return res.redirect('/listings');
            }
            const regex = new RegExp(q, 'i');
            const allListings = await require('../models/listing').find({
                $or: [
                    { title: regex },
                    { description: regex }
                ]
            });
            res.render("listings/index", { allListings, currentFilter: 'search', searchQuery: q });
        } catch (err) {
            next(err);
        }
    }
};
