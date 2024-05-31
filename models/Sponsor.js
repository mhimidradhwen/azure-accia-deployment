const mongoose=require("mongoose");
const joi=require("joi")
const SponsorSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    logo:{
        type:Object,
        default:{
            url:'',
            publicID:null
        }
    },
    link:{
        type:String
    }

})
const Sponsor=mongoose.model("Sponsor",SponsorSchema);
function ValidateCreateSponsor(obj){
    const schema=joi.object({
        name:joi.string().trim().required(),
        link:joi.string()
    })
    return schema.validate(obj)
}
function ValidateUpdateSponsor(obj){
    const schema=joi.object({
        name:joi.string().trim(),
        link:joi.string()
    })
    return schema.validate(obj)
}
module.exports={
    Sponsor,
    ValidateCreateSponsor,
    ValidateUpdateSponsor
}