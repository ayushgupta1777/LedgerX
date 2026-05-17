const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ✅ Cloudinary Configuration
cloudinary.config({
    cloud_name: "dpxfxnqbp",
    api_key: "755131411439535",
    api_secret: "Q7N7AlOPlLQWr59REyxDx0qXZD8",
});

// ✅ Cloudinary Storage for Signatures
const signatureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "signatures", // Folder in Cloudinary
    format: async (req, file) => "png", // Adjust format if needed
    public_id: (req, file) => `signature-${Date.now()}-${file.originalname}`,
  },
});

// ✅ Export Upload Middleware
const upload2 = multer({ storage: signatureStorage });

module.exports = { upload2, cloudinary };
