const mongoose=require("mongoose")
const joi=require("joi");

const documentSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    documentPath:{
        type:Object,
        default:{
            url:"",
            publicId:null
        }
    },
    date:{
        type:Date,
    },
    type:{
        type:String,
        required:true
    },
    isVisible:{
        type:Boolean,
        required:true
    }
},{
    timestamps:true,
    timeseries:true
});
const RapportDocument=mongoose.model("Document",documentSchema);
function ValidateCreateDocument(obj){
    const schema=joi.object({
        title: joi.string().trim().required(),
        type: joi.string().required(), 
        isVisible: joi.boolean().required(),
        folderName:joi.string()
    })
    return schema.validate(obj)
}
function ValidateUpdateDocument(obj){
    const schema=joi.object({
        title:joi.string().trim(),
        type:joi.string(),
        isVisible:joi.boolean()
    })
    return schema.validate(obj)
}
module.exports={
    RapportDocument,ValidateCreateDocument,ValidateUpdateDocument
}