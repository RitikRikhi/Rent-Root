const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initdata = require("../init/data.js"); 

const MONGO_URL = "mongodb://localhost:27017/mydatabase";

main().then(() => {
  console.log("Connected to MongoDB");
  initDB(); // ✅ Run after connection
}).catch(err => {
  console.log(err);
});

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  const existing = await Listing.find({});
  if (existing.length === 0) {
    await Listing.insertMany(initdata.data);
    console.log("✅ Sample listings inserted");
  } else {
    console.log("⚠️ Listings already exist, skipping insert");
  }
};