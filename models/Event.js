const mongoose = require("mongoose");
const Joi = require("joi");

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: Object,
        default: {
            url: "",
            publicID: null
        }
    },
    H_Start: {
        type: Date,
        required: true
    },
    H_Fin: {
        type: Date,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    Location: {
        type: String,
        required: true
    },
    Sponsor: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Sponsor"
        }
    ]

    ,
    isVisible: {
        type: Boolean,
        required: true
    }
}, {
    timeseries: true,
    timestamps: true
});


const Event = mongoose.model('Event', EventSchema);

function ValidateCreateEvent(obj) {
    const schema = Joi.object({
        title: Joi.string().trim().max(30).required(),
        description: Joi.string().trim().min(10).required(),
        Location: Joi.string().trim().min(5).required(),
        H_Start: Joi.date().required(),
        H_Fin: Joi.date().required(),
        date: Joi.date().required(),
        isVisible: Joi.boolean().required(),
        folderName: Joi.string()
    });
    return schema.validate(obj);
}
function ValidateUpdateEvent(obj) {
    const schema = Joi.object({
        title: Joi.string().trim(),
        description: Joi.string().trim().min(10),
        Location: Joi.string().trim().min(5),
        H_Start: Joi.date().iso(), // Date avec heure spécifique au format ISO 8601
        H_Fin: Joi.date().iso(),
        date: Joi.date(),
        Upload: Joi.string(),
        isVisible: Joi.boolean(),

    });
    return schema.validate(obj);
}
module.exports = {
    Event, ValidateCreateEvent, ValidateUpdateEvent
}