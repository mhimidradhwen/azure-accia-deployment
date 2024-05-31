const mongoose = require("mongoose");
const Joi = require("joi");

const PostSchema = new mongoose.Schema(
  {
    title: {
      ar: { type: String, required: true, trim: true },
      fr: { type: String, required: true, trim: true },
      eng: { type: String, required: true, trim: true },
    },
    description: {
      ar: { type: String, required: true, trim: true },
      fr: { type: String, required: true, trim: true },
      eng: { type: String, required: true, trim: true },
    },
    isVisible: {
      type: Boolean,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: Object,
      default: {
        url: "",
        publicID: null,
      },
    },
    Likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
PostSchema.virtual("AllComments", {
  ref: "Comment",
  foreignField: "postId",
  localField: "_id",
});
const Post = mongoose.model("Post", PostSchema);
function validateCreatePost(reqBody) {
  const schema = Joi.object({
    title_ar: Joi.string().required(),
    title_fr: Joi.string().required(),
    title_eng: Joi.string().required(),
    description_ar: Joi.string().required(),
    description_fr: Joi.string().required(),
    description_eng: Joi.string().required(),
    folderName: Joi.string(),
    isVisible: Joi.boolean().required(),
  });

  return schema.validate(reqBody);
}

function validateUpdatePost(obj) {
  const schema = Joi.object({
    title_ar: Joi.string(),
    title_fr: Joi.string(),
    title_eng: Joi.string(),
    description_ar: Joi.string(),
    description_fr: Joi.string(),
    description_eng: Joi.string(),
    isVisible: Joi.boolean(),
  });

  return schema.validate(obj);
}
module.exports = {
  validateCreatePost,
  validateUpdatePost,
  Post,
};
