const express = require('express');
const router = express.Router();
const { handleFileUploadMiddleware, verifierAlbumName } = require('../middlewares/AlbumUpload');
const { createAlbumCtrl, UpdateAlbumCtrl, GetAllImageCtrl, GetOneImageCtrl, deleteOneImageCtrl } = require('../controllers/albumController');
const multer = require('multer');
const upload = multer();
router.route("/")
        .post(handleFileUploadMiddleware, createAlbumCtrl)
        .put(handleFileUploadMiddleware, UpdateAlbumCtrl)
router.route("/:eventFolder")
        .get(GetAllImageCtrl)
router.route("/:eventFolder/:imageName")
        .get(GetOneImageCtrl)
        .delete(deleteOneImageCtrl)
module.exports = router;
