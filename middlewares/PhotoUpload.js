const path = require("path");
const multer = require("multer");
const fs = require("fs");
const uuid = require("uuid");

//PhotoStorage
const PhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get the folder name from the request
    const folderName = req.body.folderName || "Upload"; // Default to 'Upload' if not provided
    // Construct the destination path
    const destinationPath = path.join(__dirname, `../public/${folderName}`);
    // Check if the folder exists, if not, create it
    fs.mkdir(destinationPath, { recursive: true }, (err) => {
      if (err) {
        // Handle error
        console.error("Error creating folder:", err);
        cb(err);
      } else {
        // Folder created successfully, set destination
        cb(null, destinationPath);
      }
    });
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier aléatoire
    const randomFileName = uuid.v4(); // Génère un UUID v4
    const fileExtension = file.originalname.split(".").pop();
    const newFileName = `${randomFileName}.${fileExtension}`;
    cb(null, newFileName);
  },
});

//photo Upload Middleware
const PhotoUpload = multer({
  storage: PhotoStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({ message: "unsupported file format" }, false);
    }
  },
  limits: { fieldSize: 1024 * 1024 * 3 },
});
module.exports = PhotoUpload;
