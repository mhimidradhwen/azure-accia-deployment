const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      minlength: 5,
    },
    password: {
      type: String,
      trim: true,
      minlength: 8,
    },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
        publicId: null,
      },
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    grade: {
      type: String,
      trim: true,
    },
    jobPosition: {
      type: String,
      trim: true,
    },
    ministry: {
      type: String,
      trim: true,
    },
    structure: {
      type: String,
      trim: true,
    },
    currentTask: {
      type: String,
      trim: true,
    },
    birthDay: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    tel: {
      type: String,
      trim: true,
      minlength: 8,
    },
    tel2: {
      type: String,
      trim: true,
      minlength: 8,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    fax: {
      type: String,
      trim: true,
    },
    EventId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }]
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//Generate Token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin, email: this.email },
    process.env.JWT_SECRETKEY,
    {
      expiresIn: "90m",
    }
  );
};

const User = mongoose.model("User", userSchema);
//validate Register user
function ValidateRegisterUser(obj) {
  const schema = Joi.object({
    firstName: Joi.string().trim().min(2).required(),
    lastName: Joi.string().trim().min(2).required(),
    email: Joi.string().trim().min(2).required().email(),
    password: Joi.string().trim().min(8).required(),
    grade: Joi.string().trim().min(2).required(),
    jobPosition: Joi.string().trim().min(2).required(),
    currentTask: Joi.string().trim().min(2).required(),
    structure: Joi.string().trim().min(2).required(),
    ministry: Joi.string().trim().min(2).required(),
    birthDay: Joi.date().required(),
    address: Joi.string().trim().min(2).required(),
    tel: Joi.string().trim().min(8).required(),
    fax: Joi.string().trim().min(8)
  });
  return schema.validate(obj);
}
function validateLoginUser(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(2).required().email(),
    password: Joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}
function ValidateUpdateUser(obj) {
  const schema = Joi.object({
    firstName: Joi.string().trim().min(2),
    lastName: Joi.string().trim().min(2),
    email: Joi.string().trim().min(2).email(),
    password: Joi.string().trim().min(8),
    grade: Joi.string().trim().min(2),
    jobPosition: Joi.string().trim().min(2),
    currentTask: Joi.string().trim().min(2),
    structure: Joi.string().trim().min(2),
    ministry: Joi.string().trim().min(2),
    birthDay: Joi.date(),
    address: Joi.string().trim().min(2),
    tel: Joi.string().trim().min(8),
    fax: Joi.string().trim().min(8),
  });
  return schema.validate(obj);
}
function ValidateCreateReservation(obj){
  const schema=Joi.object({
      firstName: Joi.string().trim().min(2).required(),
      lastName: Joi.string().trim().min(2).required(),
      email: Joi.string().trim().min(2).required().email(),
      jobPosition: Joi.string().trim().min(2).required(),
      address: Joi.string().trim().min(2).required(),
      tel: Joi.string().trim().min(8).required(),
  })
  return schema.validate(obj)
}
module.exports = {
  User,
  ValidateCreateReservation,
  ValidateRegisterUser,
  validateLoginUser,
  ValidateUpdateUser,
};
