const asyncHandler = require("express-async-handler");
const path = require("path")
const fs = require("fs")
const { ValidateCreateAlbum, Album } = require("../models/Album");
/**------------------------------------------------------------
 * @desc Create a new Album
 * @route /api/admin/album
 * @method post
 * @access private (only admin)
 -------------------------------------------------------------*/
module.exports.createAlbumCtrl = asyncHandler(async (req, res) => {
    // 1- validate Data
    const { error } = ValidateCreateAlbum(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    // 2- check for the file
    if (!req.file) {
        return res.status(404).json({ message: "file not found" });
    }
    // 3- save the path of the album in the db
    const newAlbum = await Album.create({
        name: req.body.nameUploadedFolder,
        path: req.body.folderPath
    })
    // 4 - return response to the client
    return res.status(201).json({ message: "Album uploaded successfully", Album: newAlbum });
});
/**------------------------------------------------------------
 * @desc Update Album
 * @route /api/admin/album
 * @method Put
 * @access private (only admin)
 -------------------------------------------------------------*/
module.exports.UpdateAlbumCtrl = asyncHandler(async (req, res) => {
    // 1- validate Data
    const { error } = ValidateCreateAlbum(req.body);
    // 2- check for the file
    if (!req.file) {
        return res.status(404).json({ message: "file not found" });
    }
    // 4 - return response to the client
    return res.status(201).json({ message: "Album Updated successfully" });
});
/**------------------------------------------------------------
 * @desc Get all image
 * @route /api/admin/album/
 * @method Get
 * @access private (only admin & member)
 -------------------------------------------------------------*/
module.exports.GetAllImageCtrl = asyncHandler(async (req, res) => {
    const fileList = [];
    // Vérify if the foler exist in the server
    const cheminDossier = path.join(__dirname, "../public/Gallerie/", req.params.eventFolder);
    if (!fs.existsSync(cheminDossier)) {
        return res.status(404).json({ message: `Album '${req.params.event}' does not exist` });
    }
    // get all images from the server
    const files = await new Promise((resolve, reject) => {
        fs.readdir(cheminDossier, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
    files.forEach(file => {
        fileList.push({
            url: path.join(cheminDossier, file), type: path.extname(file) === '.jpg' || path.extname(file) === '.png' ? 'image' : 'other'
        });
    });
    // send response to the client
    res.status(200).json(fileList);
});
/**------------------------------------------------------------
 * @desc Get One image
 * @route /api/admin/album/
 * @method Get
 * @access private (only admin & member)
 -------------------------------------------------------------*/
module.exports.GetOneImageCtrl = asyncHandler(async (req, res) => {
    // Vérifier si le dossier existe sur le serveur
    const cheminDossier = path.join(__dirname, "../public/Gallerie/", req.params.eventFolder);
    if (!fs.existsSync(cheminDossier)) {
        return res.status(404).json({ message: "Le dossier n'existe pas" });
    }

    // Obtenir tous les fichiers du serveur
    const files = await new Promise((resolve, reject) => {
        fs.readdir(cheminDossier, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });

    // Vérifier si un fichier correspond au nom demandé sans extension
    const requestedImageName = req.params.imageName;
    let foundImage = null;
    for (const file of files) {
        const fileNameWithoutExtension = path.parse(file).name;
        if (fileNameWithoutExtension === requestedImageName) {
            foundImage = file;
            break;
        }
    }

    if (!foundImage) {
        return res.status(404).json({ message: "Aucune image correspondante trouvée" });
    }

    // Construire l'URL de l'image
    const imageURL = path.join(__dirname, "../public/Gallerie/", req.params.eventFolder, foundImage);

    // Envoyer l'URL de l'image en réponse
    res.status(200).json({ imageURL: imageURL });
});

/**------------------------------------------------------------
 * @desc Get One image
 * @route /api/admin/album/
 * @method delete
 * @access private (only admin)
 -------------------------------------------------------------*/
module.exports.deleteOneImageCtrl = asyncHandler(async (req, res) => {
    // Vérifier si le dossier existe sur le serveur
    const cheminDossier = path.join(__dirname, "../public/Gallerie/", req.params.eventFolder);
    if (!fs.existsSync(cheminDossier)) {
        return res.status(404).json({ message: "Le dossier n'existe pas" });
    }

    // Obtenir tous les fichiers du serveur
    const files = await new Promise((resolve, reject) => {
        fs.readdir(cheminDossier, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });

    // Vérifier si un fichier correspond au nom demandé sans extension
    const requestedImageName = req.params.imageName;
    let foundImage = null;
    for (const file of files) {
        const fileNameWithoutExtension = path.parse(file).name;
        if (fileNameWithoutExtension === requestedImageName) {
            foundImage = file;
            break;
        }
    }

    if (!foundImage) {
        return res.status(404).json({ message: "Aucune image correspondante trouvée" });
    }

    // get the full path of the image
    const imagePath = path.join(cheminDossier, foundImage);

    // delete the image from the server
    fs.unlink(imagePath, async (err) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la suppression de l'image" });
        }

        // check if the folder is empty
        const remainingFiles = await fs.promises.readdir(cheminDossier);
        if (remainingFiles.length === 0) {
            // delete the folder if it's empty
            fs.rmdir(cheminDossier, async (err) => {
                if (err) {
                    return res.status(500).json({ message: "Erreur lors de la suppression du dossier" });
                }
                await Album.findOneAndDelete({ name: req.params.eventFolder })
                return res.status(200).json({ message: "L'image et le dossier ont été supprimés avec succès" });
            });

        } else {
            // send success response if the folder is not empty
            return res.status(200).json({ message: "L'image a été supprimée avec succès" });
        }
    });
});


