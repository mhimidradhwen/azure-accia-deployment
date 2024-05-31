const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const { ValidateCreateDocument, RapportDocument, ValidateUpdateDocument } = require("../models/document");

/**--------------------------------------------------------------------
 * @desc Create Document 
 * @routes /api/admin/document
 * @method post
 * @access private Only Admin  
---------------------------------------------------------------------*/
module.exports.CreateDocumentCtr = asyncHandler(async (req, res) => {
    // Validate if file exists
    if (!req.file) {
        return res.status(404).json({ message: "File doess not exist" });
    }

    // Validate request data
    const { error } = ValidateCreateDocument(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Check if the document already exists in the database
    const isExistDocument = await RapportDocument.findOne({ title: req.body.title });
    if (isExistDocument) {
        return res.status(200).json({ message: "Rapport already exists in the database" });
    }

    const oldPath = req.file.path;
    const folderName = req.body.folderName;
    const fileName = path.basename(oldPath);
    const uploadFolderPath = path.join(__dirname, '../public/docs'); // Corrected path

    // Construct the new path for the file
    const newPath = path.join(uploadFolderPath, folderName, fileName);

    // Ensure the destination folder exists, if not, create it
    const folderPath = path.join(uploadFolderPath, folderName);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true }); // Create the folder recursively
    }

    // Move the file to the new path
    fs.renameSync(oldPath, newPath); // Renamed to fs.renameSync for simplicity

    // Save the document in the database
    const Rapport = await RapportDocument.create({
        title: req.body.title,
        data: formatDate(new Date()),
        type: req.body.type,
        isVisible: req.body.isVisible,
        "documentPath.url": newPath,
    });

    // Send response to the client
    return res.status(201).json({ message: "Rapport added successfully", newRapport: Rapport });
});
/**--------------------------------------------------------------------
 * @desc Get All Documents 
 * @routes /api/admin/document
 * @method Get
 * @access private Only Admin & member
---------------------------------------------------------------------*/
module.exports.GetAllDocumentCtrl = asyncHandler(async (req, res) => {
    //get All document form the db
    const AllDcocument = await RapportDocument.find();
    //send Response to the client
    return res.status(200).json(AllDcocument)
})
/**--------------------------------------------------------------------
 * @desc Get One Document 
 * @routes /api/admin/document
 * @method Get
 * @access public
---------------------------------------------------------------------*/
module.exports.GetOneDocumentCtrl = asyncHandler(async (req, res) => {
    //verify if document exist in the data base
    const DocumentPdf = await RapportDocument.findById(req.params.id);
    if (!DocumentPdf) {
        return res.status(404).json({ message: "document not found" });
    }
    //send the response to the client
    return res.status(200).json(DocumentPdf);
})
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
/**--------------------------------------------------------------------
 * @desc Update One Document 
 * @routes /api/admin/document/:id
 * @method PUT
 * @access private Only Admin 
---------------------------------------------------------------------*/
module.exports.UpdateOneDocumentCtrl = asyncHandler(async (req, res) => {
    //validation
    const { error } = ValidateUpdateDocument(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    //check if the document exist in the db
    const isDocumentPresent = await RapportDocument.findById(req.params.id);
    if (!isDocumentPresent) {
        return res.status(404).json({ message: "document not found ! " });
    }
    //update the document
    const newDocument = await RapportDocument.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title || isDocumentPresent.title,
            data: formatDate(new Date()),
            type: req.body.type || isDocumentPresent.type,
            isVisible: req.body.isVisible || isDocumentPresent.isVisible,
        }
    }, { new: true })
    //send response to the client
    return res.status(200).json({ message: "document updated successfully ", newdocs: newDocument })
})
/**--------------------------------------------------------------------
 * @desc Delete One Document 
 * @routes /api/admin/document/:id
 * @method Delete
 * @access private Only Admin 
---------------------------------------------------------------------*/
module.exports.DeleteOneDocumentCtrl = asyncHandler(async (req, res) => {
    //check if the document exist
    const isDocumentPresent = await RapportDocument.findById(req.params.id);
    if (!isDocumentPresent) {
        return res.status(404).json({ message: 'document does not exist' });
    }
    //delete the document from the db
    await RapportDocument.findByIdAndDelete(req.params.id)
    //delete the document form the server
    const pathFolderToDelete = isDocumentPresent.documentPath.url;
    fs.unlinkSync(pathFolderToDelete);
    //send response to the client
    return res.status(200).json({ message: "Document deleted successfully" })
})
/**--------------------------------------------------------------------
 * @desc Download One Document 
 * @routes /api/admin/document/:id
 * @method get
 * @access private Only Admin 
---------------------------------------------------------------------*/
module.exports.DownloadOneDocumentCtrl = asyncHandler(async (req, res) => {
    //check if the document exist
    //download the document form the server
    //send response to the client
})