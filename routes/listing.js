const express = require("express");
const multer = require("multer");
const listingController = require("../controller/listing");
const{ storage } = require("../cloudconfig");
const upload = multer({ storage });

const router = express.Router();



// Show all listings
router.get("/", listingController.index);

// Show advertisements only page
router.get("/ads", (req, res) => {
    res.render("listings/ads");
});

// Show form to create new listing
router.get("/new", listingController.isLoggedIn, listingController.renderNewForm);

// Create new listing
router.post("/", listingController.isLoggedIn, upload.single('image'), listingController.validateListing, listingController.createListing);

  
  
  
  
  
  
  
// Search listings
router.get("/search", listingController.searchListings);

// Show single listing
router.get("/:id", listingController.showListing);

// Show edit form
router.get("/:id/edit", listingController.isLoggedIn, listingController.isOwner, listingController.renderEditForm);

// Update listing
router.put("/:id", listingController.isLoggedIn, listingController.isOwner, upload.single('image'), listingController.validateListing, listingController.updateListing);

// Delete listing
router.delete("/:id", listingController.isLoggedIn, listingController.isOwner, listingController.deleteListing);

// Search listings
router.get("/search", listingController.searchListings);

module.exports = router;
