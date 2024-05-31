const asyncHandler=require("express-async-handler")
const path=require("path");
const fs=require("fs")
const { ValidateCreateSponsor, Sponsor } = require("../models/Sponsor")
module.exports.CreateSponsorCtrl=asyncHandler(async(req,res)=>{
    //validate the database
    const {error}= ValidateCreateSponsor(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }
    //verifie that the file exist
    if(!req.file){
        return res.status(404).json({message:'logo not found !'});
    }
    //move the logo of sponor to sponsor folder
    const logoPath=req.file.path;
     //get the url of the logo
    const newPathForlogo=path.join(__dirname,"../public/sponosor/")
    if(!fs.existsSync(newPathForlogo)){
         fs.mkdirSync(newPathForlogo,{recursive:true})
    }
    aftermovelogoPath=path.join(newPathForlogo,req.file.filename)
    fs.rename(logoPath,aftermovelogoPath,(err)=>
    {
        if(err){
            console.log("Une erreur s'est produite lors du déplacement du fichier :", err)
        }else{
            console.log("la logo est placer dans le bon place")
        }
    })
    //save the sponsor in the database
    const sponsor=await Sponsor.create({
        name:req.body.name,
        link:req.body.link || "",
        "logo.url":aftermovelogoPath
    })
    //send response to the client
    return res.status(201).json({message:"sponsor added successfully",newSponsor:sponsor})
})
/**--------------------------------------------------------------------
 * @desc add sponsor to the Event
 * @routes /api/admin/event/sponosor/
 * @method put
 * @access private only admin
---------------------------------------------------------------------*/
module.exports.ToggleSponsorToEventCtrl=asyncHandler(async(req,res)=>{ 
    //check if the event exist
    //toggle the sponosr
    //send response to the client
  })