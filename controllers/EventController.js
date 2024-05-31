const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs")
const { ValidateCreateEvent, Event, ValidateUpdateEvent } = require("../models/Event");
/**--------------------------------------------------------------------
 * @desc Create new Event
 * @routes /api/admin/event
 * @method post
 * @access private Only Admin 
---------------------------------------------------------------------*/
module.exports.CreateEventCtrl = asyncHandler(async (req, res) => {
    //validate the image
    if (!req.file) {
        return res.status(404).json({ message: "image not found" });
    }
    //validate the data
    const { error } = ValidateCreateEvent(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    //check if event exist
    const isEventexist = await Event.findOne({ title: req.body.title });
    if (isEventexist) {
        return res.status(200).json({ message: "event Exist in the database" })
    }
    const oldPath = req.file.path;
    const folderName = req.body.folderName;
    const fileName = path.basename(oldPath);
    const uploadFolderPath = path.join(__dirname,"../public/",folderName)
    const newPath = path.join(uploadFolderPath, fileName);
    // Vérifier si le dossier existe, sinon le créer

    if (!fs.existsSync(uploadFolderPath)) {
      fs.mkdirSync(uploadFolderPath, { recursive: true }); // Création du dossier de manière récursive
    }
    
    // Déplacer le fichier vers le nouveau chemin
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error("Une erreur s'est produite lors du déplacement du fichier :", err);
      } 
    });
    //create and save the event if not exit
    const NewEvent = await Event.create({
        title: req.body.title,
        description: req.body.description,
        Location: req.body.Location,
        H_Start: req.body.H_Start,
        H_Fin: req.body.H_Fin,
        date: req.body.date,
        isVisible: req.body.isVisible,
        "image.url": newPath,
    })

    //addSponsor if existe
    return res.status(200).json({ message: "event created successfully ", Event: NewEvent });
})
/**--------------------------------------------------------------------
 * @desc Get All Event
 * @routes /api/admin/event
 * @method Get
 * @access private Only Admin & member
---------------------------------------------------------------------*/
module.exports.GetAllEventCtrl = asyncHandler(async (req, res) => {

  const EVENT_PER_PAGE = 9;
  const { pageNumber, isVisible } = req.query;
  let events;

  if (pageNumber) {
    events = await Event.find()
      .skip((pageNumber - 1) * EVENT_PER_PAGE)
      .limit(EVENT_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("Sponsor"); 
  } else if (isVisible) {
    events = await Event.find({ isVisible })
      .populate("Sponsor");
  } else {
    events = await Event.find()
      .sort({ createdAt: -1 })
      .populate("Sponsor"); 
  }
  
  // Vérifiez si des événements ont été trouvés
  if (!events || events.length === 0) {
    return res.status(404).json({ message: "Aucun événement trouvé." });
  }

  // Envoyez la réponse au client
  return res.status(200).json(events);
});
/**--------------------------------------------------------------------
 * @desc Get One Event
 * @routes /api/admin/event/:id
 * @method Get
 * @access public
---------------------------------------------------------------------*/
module.exports.GetOneEventCtrl=asyncHandler(async(req,res)=>{
  //check if the document exist in the db
  const event_Db=await Event.findById(req.params.id);
  if(!event_Db){
    return res.status(404).json({message:"event don't exist"})
  }
  //send the response to the client
  return res.status(200).json(event_Db);
})
/**--------------------------------------------------------------------
 * @desc Delete One Event
 * @routes /api/admin/event/:id
 * @method delete
 * @access private only admin
---------------------------------------------------------------------*/
module.exports.DeleteOneEventCtrl=asyncHandler(async(req,res)=>{
  //check if the event exist
  const isEventPresent=await Event.findById(req.params.id)
  if(!isEventPresent){
    return res.status(404).json({message:"event don't Exist"})
  }
  //delete the image for the server
  fs.unlinkSync(isEventPresent.image.url)
  //delete the event form the db
  await Event.findByIdAndDelete(req.params.id)
  //send request to the client
  return res.status(200).json({message:"event deleted successfully !"})
})
/**--------------------------------------------------------------------
 * @desc update One Event
 * @routes /api/admin/event/:id
 * @method put
 * @access private only admin
---------------------------------------------------------------------*/
module.exports.UpdateOneEventCtrl=asyncHandler(async(req,res)=>{
  //validate data
  const {error}=ValidateUpdateEvent(req.body);
  if(error){
    return res.status(400).json({message:error.details[0].message})
  }
  //check if the event exist
  const isEventexist=await Event.findById(req.params.id);
  //update the event in the db
  const newEvent=await Event.findByIdAndUpdate(req.params.id,{
    $set:{
      title: req.body.title || isEventexist.title,
      description: req.body.description || isEventexist.description,
      Location: req.body.Location || isEventexist.Location,
      H_Start: req.body.H_Start || isEventexist.H_Start,
      H_Fin: req.body.H_Fin || isEventexist.H_Fin,
      date: req.body.date || isEventexist.date,
      isVisible:req.body.isVisible || isEventexist.isVisible,
    }
  },{new:true})

  //send response to the client
  return res.status(200).json({message:"event updated successfully !",updatedEvent:newEvent})
})
/**--------------------------------------------------------------------
 * @desc Update the photo of the Event
 * @routes /api/admin/event/update-photo/:id
 * @method put
 * @access private only admin
---------------------------------------------------------------------*/
module.exports.UpdatePhotoEventCtrl=asyncHandler(async(req,res)=>{
  //check if file exist
  if(!req.file){
    return res.status(404).json({message:"picture don't exist"})
  }
  //check if the event exist
  const isEventPresent=await Event.findById(req.params.id)
  if(!isEventPresent){
    return res.status(404).json({message:"event don't exist"})
  }
  //update photo of the event in the db
  olderPicturePath=isEventPresent.image.url;
  PathPictureUploaded=req.file.path;
  PictureName=req.file.filename;
  temp=path.join(__dirname,"../public/Event/");
  if(fs.existsSync(temp)){
    fs.mkdirSync(temp,{recursive:true});
  }
  newPicturePath=path.join(temp,PictureName)
  fs.renameSync(PathPictureUploaded,newPicturePath)
  const newEvent=await Event.findByIdAndUpdate(req.params.id,{
    $set:{
      "image.url":newPicturePath
    }
  },{new:true})
  //delete the old picture from the server
  fs.unlinkSync(olderPicturePath)
  //send response to the client
  return res.status(200).json({message:"pictuer updated successfully ",UpdatedEvent:newEvent})
})


