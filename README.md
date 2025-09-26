# 🏡 RentRoot — A Smarter Way to Rent, List, and Manage Properties

RentRoot is a full-stack rental marketplace designed to simplify the rental journey for tenants and property owners. Built with modern tech, clean UI, and scalable architecture, it delivers a seamless experience from discovery to decision.

---

## 🚀 Features

### 🔐 User Management
- Secure registration and login with session handling
- Profile dropdown with logout option

### 🏠 Property Listings
- Browse all rental properties with images, prices, and locations
- Detailed listing pages with features, reviews, and contact info
- Authenticated users can create, edit, and delete listings
- Cloudinary integration for image uploads
- MapTiler integration for location previews and geocoding

### 🔍 Search & Filtering
- Keyword search from navbar
- Category filters: trending, luxury, budget, beach, mountain, city, pool
- Amenity filters: WiFi, parking, etc.

### ⭐ Reviews & Ratings
- Authenticated users can leave reviews and ratings
- Users can delete their own reviews

### 🎯 Additional Highlights
- Special offers and ads section
- Tax toggle for pricing clarity
- Responsive design with Bootstrap
- Flash messages for success/error feedback
- Comprehensive error handling
- `/demouser` endpoint for instant testing

---

## 🧠 Tech Stack

- **Frontend:** EJS, HTML, CSS, Bootstrap  
- **Backend:** Node.js, Express  
- **Database:** MongoDB + Mongoose  
- **Auth & Security:** Password hashing, input validation, session security  
- **Deployment:** Railway / Render with environment variables  
- **Image Hosting:** Cloudinary  
- **Maps & Geolocation:** MapTiler

---

## 📦 Installation

```bash
git clone https://github.com/yourusername/rentroot
cd rentroot
npm install
npm run dev
