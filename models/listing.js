const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new schema({
    title: {
        type: String,
        required: false,
    },
    description: String,
    image: {
     url: String,
     filename: String
    },
    price: Number,
    location: String,
    country: String,
    // Category field for filtering
    category: {
        type: String,
        enum: ['trending', 'luxury', 'budget', 'beach', 'mountain', 'city', 'pool', 'standard'],
        default: 'standard'
    },
    // Amenities field for quick filters
    amenities: {
        wifi: { type: Boolean, default: false },
        parking: { type: Boolean, default: false },
        ac: { type: Boolean, default: false },
        kitchen: { type: Boolean, default: false },
        petFriendly: { type: Boolean, default: false },
        breakfast: { type: Boolean, default: false },
        verified: { type: Boolean, default: false },
        new: { type: Boolean, default: true }
    },
    // GeoJSON geometry field for coordinates
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: false
        },
        coordinates: {
            type: [Number],
            required: false,
            validate: {
                validator: function(coords) {
                    return coords.length === 2 &&
                           coords[0] >= -180 && coords[0] <= 180 && // longitude
                           coords[1] >= -90 && coords[1] <= 90;    // latitude
                },
                message: 'Invalid coordinates provided'
            }
        }
    },
    // Keep latitude and longitude for backward compatibility
    latitude: Number,
    longitude: Number,
    reviews: [
    {
        type: schema.Types.ObjectId,
        ref: "Review",
    },
],
owner: {
    type: schema.Types.ObjectId,
    ref: "User",
}
});

// Add 2dsphere index for geospatial queries
listingSchema.index({ geometry: '2dsphere' });

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({
            _id: { $in: listing.reviews }
        });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;