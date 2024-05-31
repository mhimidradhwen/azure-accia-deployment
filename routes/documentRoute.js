const router=require("express").Router()
const { CreateDocumentCtr,GetAllDocumentCtrl,GetOneDocumentCtrl, DeleteOneDocumentCtrl, UpdateOneDocumentCtrl } = require("../controllers/documentController");
const DocumentUpload = require("../middlewares/RapportUpload");
const VerifyObjectId = require("../middlewares/VerifyObjectId");

router.route("/").post( DocumentUpload.single('pdfDocument'), CreateDocumentCtr)
.get(GetAllDocumentCtrl);
router.route("/:id")
      .get(VerifyObjectId,GetOneDocumentCtrl)
      .delete(VerifyObjectId,DeleteOneDocumentCtrl)
      .put(VerifyObjectId,UpdateOneDocumentCtrl)
module.exports=router