const path = require("path");
const multer = require("multer");
const fs = require("fs");
const uuid = require("uuid");

//DocumentStorage
const DocumentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get the folder name from the request
    const folderName =  "Upload"; // Default to 'Upload' if not provided
    // Construct the destination path
    const destinationPath = path.join(__dirname, `../public/docs/${folderName}`);
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
    // Generate a random file name
    const randomFileName = uuid.v4(); // Generate UUID v4
    const fileExtension = file.originalname.split(".").pop();
    const newFileName = `${randomFileName}.${fileExtension}`;
    cb(null, newFileName);
  },
});

// Document Upload Middleware for PDF files
const DocumentUpload = multer({
  storage: DocumentStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true); // Accept PDF files
    } else {
      cb({ message: "Unsupported file format. Only PDF files are allowed." }, false);
    }
  },
});
module.exports = DocumentUpload;
