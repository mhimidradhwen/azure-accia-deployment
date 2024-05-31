const mongoose=require("mongoose")
const joi=require("joi")
const ReservationSchema=new mongoose.Schema({
    EventId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Event',
        unique:true
    },
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    date:{
        type:Date,
    },
    isPresent:{
        type:Boolean
    }
},  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

const Reservation=mongoose.model("Reservation",ReservationSchema);
function ValidateUpdateReservation(obj){
const schema=joi.object({
    isPresent:joi.boolean().required()
})
return schema.validate(obj)
}
module.exports={
    Reservation,
    ValidateUpdateReservation
}