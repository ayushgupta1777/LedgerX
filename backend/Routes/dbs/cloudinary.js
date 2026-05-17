require("dotenv").config(); // ✅ Load environment variables
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ✅ Secure Cloudinary Configuration
cloudinary.config({
  cloud_name: "dpxfxnqbp",
  api_key: "755131411439535",
  api_secret: "Q7N7AlOPlLQWr59REyxDx0qXZD8",
});

// ✅ Setup Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads", // Change folder name as needed
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
  },
});

// ✅ Initialize Multer with Cloudinary Storage
const upload = multer({ storage });

module.exports = { upload, cloudinary };
