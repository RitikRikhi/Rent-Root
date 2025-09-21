const joi = require('joi');

module.exports.listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        price: joi.number().required().min(1),
        location: joi.string().required(),
        country: joi.string().required(),
        image: joi.string().allow("", null),
        // GeoJSON geometry validation
        geometry: joi.object({
            type: joi.string().valid('Point').required(),
            coordinates: joi.array()
                .items(joi.number())
                .length(2)
                .required()
                .custom((value, helpers) => {
                    const [lng, lat] = value;
                    if (lng < -180 || lng > 180) {
                        return helpers.error('Longitude must be between -180 and 180');
                    }
                    if (lat < -90 || lat > 90) {
                        return helpers.error('Latitude must be between -90 and 90');
                    }
                    return value;
                })
        }).optional(),
        // Keep latitude and longitude for backward compatibility
        latitude: joi.number().min(-90).max(90).optional(),
        longitude: joi.number().min(-180).max(180).optional()
    }).required(),
}).unknown(true);

module.exports.reviewSchema = joi.object({
    review: joi.object({
        comment: joi.string().required().min(1),
        rating: joi.number().required().min(1).max(5)
    }).required(),
});

module.exports.userSchema = joi.object({
    username: joi.string().required().min(3).max(30),
    email: joi.string().email().required(),
    password: joi.string().required().min(6)
});
