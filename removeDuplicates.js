const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const MONGO_URL = "mongodb://localhost:27017/mydatabase";

main().then(() => {
  console.log("Connected to MongoDB");
  clearDB();
}).catch(err => {
  console.log(err);
});

async function main() {
  await mongoose.connect(MONGO_URL);
}

const clearDB = async () => {
  await Listing.deleteMany({});
  console.log("✅ All listings cleared");
  process.exit();
};
