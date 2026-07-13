const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname).toLowerCase();
    const originalNameBase = path.basename(file.originalname, fileExt).replace(/[^a-zA-Z0-9]/g, '');
    cb(null, `${originalNameBase}-${uniqueSuffix}${fileExt}`);
  },
});

// File filter (accept images only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG, and WEBP image formats are allowed!'));
  }
};

// Configured Multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB file size
  fileFilter: fileFilter,
});

module.exports = upload;
