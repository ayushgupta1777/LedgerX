const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ✅ Configure Cloudinary
cloudinary.config({
    cloud_name: "dpxfxnqbp",
    api_key: "755131411439535",
    api_secret: "Q7N7AlOPlLQWr59REyxDx0qXZD8",
});

// ✅ Define Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // Change folder name as needed
    format: async (req, file) => "png", // Adjust format if needed
    public_id: (req, file) => `image-${Date.now()}-${file.originalname}`,
  },
});

// ✅ Create Multer Upload Middleware
const upload = multer({ storage });

module.exports = { upload, cloudinary };
