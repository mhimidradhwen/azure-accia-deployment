const path = require("path");
const multer = require("multer");
const fs = require("fs");
const unzipper = require("unzipper");
const uuidv4 = require('uuid').v4;
const asyncHandler = require('express-async-handler');
const { ValidateCreateAlbum } = require("../models/Album");
// Multer storage configuration
const storage = multer.memoryStorage();
// Array to store paths of uploaded pictures
let uploadedPictures = [];
// Middleware to handle file upload
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Filter to only allow zip files
    if (file.mimetype === "application/zip") {
      cb(null, true);
    } else {
      cb(
        { message: "Unsupported file format. Please upload a zip file." },
        false
      );
    }
  },
}).single("zipFile");
// Function to extract and upload images from a zip buffer
const extractAndUploadImages = (zipBuffer, folderName, ZipFolderName, newFolderName, req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const tempDir = path.join(__dirname, "../public");
      await fs.promises.mkdir(tempDir, { recursive: true });
      // Write zip buffer to temporary directory
      await fs.promises.writeFile(path.join(tempDir, "Upload", ZipFolderName), zipBuffer);
      // Options for unzip operation
      const unzipperOptions = {
        path: path.join(tempDir, folderName),
      };
      // Create unzip stream
      const extractStream = unzipper.Extract(unzipperOptions);
     // Event handler for unzip error
      extractStream.on("error", (err) => {
        reject(err);
      });
      // Event handler for unzip finish
      extractStream.on("finish", async () => {
        try {
          // Set folder path in request body
          const pathFolder = (path.join(tempDir, folderName, req.body.name));
          req.body.folderPath = pathFolder;
          // Read files from the unzipped folder
          const files = await fs.promises.readdir(path.join(tempDir, folderName, newFolderName));
          // Iterate through files, rename and move them
          for (const file of files) {
            if (file !== ".DS_Store" && file !== "__MACOSX") {
              const oldPath = path.join(tempDir, folderName, newFolderName, file);
              const fileExtension = path.extname(file);
              const newFileName = uuidv4() + fileExtension;
              const newPath = path.join(tempDir, folderName, newFolderName, newFileName);
              await fs.promises.rename(oldPath, newPath);
              // Check if the directory exists, if not, create it
              const directoryExists = await fs.promises.access(path.join(tempDir, folderName, req.body.name))
                .then(() => true)
                .catch(() => false);
              if (!directoryExists) {
                await fs.promises.mkdir(path.join(tempDir, folderName, req.body.name), { recursive: true });
              }
              // Move the file to the new path
              const changePath = path.join(tempDir, folderName, req.body.name, newFileName);
              await fs.promises.rename(newPath, changePath);

              // Add the new path to the list of uploaded pictures
              uploadedPictures.push(changePath);
            }
          }
          const foldertoDelete = path.join(tempDir, folderName, newFolderName)
          await deleteDirectory(foldertoDelete);
          // Remove __MACOSX directory
          const macosDir = path.join(tempDir, folderName, "__MACOSX");
          if (fs.existsSync(macosDir)) {
            await deleteDirectory(macosDir);
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      // Pipe the zip buffer to the extract stream
      fs.createReadStream(path.join(tempDir, "Upload", ZipFolderName)).pipe(extractStream);
    } catch (error) {
      reject(error);
    }
  });
};


// Function to delete a directory (async)
const deleteDirectory = (directoryPath) => {
  return new Promise((resolve, reject) => {
    fs.rm(directoryPath, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};


// Function to check if a directory is not empty (async)
const isDirectoryNotEmpty = async (directoryPath, req) => {


  const files = await fs.promises.readdir(directoryPath);

  // Filter out .DS_Store files
  const filteredFiles = files.filter(file => file !== ".DS_Store");

  return filteredFiles.length > 0;
};

// Middleware to verify if an album name already exists and contains files
const verifierAlbumName = asyncHandler(async (req, res, next) => {
  // Get the directory path
  const directoryPath = path.join(__dirname, '../public/Gallerie');
  // Read the list of files in the directory
  const fileList = await fs.promises.readdir(directoryPath);
  // Check if the requested album name exists in the file list and if it's not empty
  const existingAlbum = fileList.find(file => file === req.body.name);


  if (existingAlbum && (await isDirectoryNotEmpty(path.join(directoryPath, existingAlbum)))) {
    // Check if the request method is PUT
    if (req.method === "PUT") {
      next(); 
    } else {
      // If the request method is not PUT, return a 400 status with an error message
      return res.status(400).json({ message: 'Album name already exists and contains files' });
    }
  } else {
    next();  }
  
});


// Middleware to handle file upload and verify album name
const handleFileUploadMiddleware = async (req, res, next) => {

  try {
    await upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      // Extract the name from the uploaded zip file
      const contaierPic = path.parse(req.file.originalname).name;
      req.body.nameUploadedFolder = req.body.name;


      // Call the verifierAlbumName middleware directly here
      await verifierAlbumName(req, res, () => {
        extractAndUploadImages(
          req.file.buffer,
          req.body.folderName || "Gallerie",
          req.body.name + ".zip",
          contaierPic,
          req
        ).then(() => {


          uploadedPictures = [];
          const UploaddirectoryPath = path.join(__dirname, '../public/Upload');

          fs.readdir(UploaddirectoryPath, (err, files) => {
            if (err) {
              console.error('Error reading directory:', err);
              return;
            }

            files.forEach(folderInUpload => {
              const folderPath = path.join(UploaddirectoryPath, folderInUpload);
              deleteDirectory(folderPath)
                .then(() => console.log(`Deleted directory: ${folderPath}`))
                .catch(error => console.error(`Error deleting directory ${folderPath}:`, error));
            });
          });

          next();
        }).catch(async error => {
          // Handle error
          for (const uploadedPicture of uploadedPictures) {
            try {
              await fs.promises.unlink(uploadedPicture);
              console.log(`Deleted file: ${uploadedPicture}`);
            } catch (unlinkError) {
              console.error("Error deleting uploaded picture:", unlinkError);
            }
          }
          uploadedPictures = [];
          res.status(500).json({ message: "Internal server errortest", error: error.message });
        });
      });
    });
  } catch (error) {
    // Handle error
    for (const uploadedPicture of uploadedPictures) {
      try {
        await fs.promises.unlink(uploadedPicture);
      } catch (unlinkError) {
        console.error("Error deleting uploaded picture:", unlinkError);
      }
    }
    uploadedPictures = [];
    res.status(500).json({ message: "Internal server error2", error: error.message });
  }
};
module.exports = {
  handleFileUploadMiddleware,
};