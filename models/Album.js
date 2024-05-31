const mongoose = require("mongoose");
const joi = require("joi");

const AlbumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      // unique:true
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Album = mongoose.model("Album", AlbumSchema);
function ValidateCreateAlbum(obj) {
  const schema = joi.object({
    name: joi.string().trim().min(2).required(),
    nameUploadedFolder:joi.string().trim().min(2).required(),
    folderPath:joi.string().trim().min(2).required(),
  });
  return schema.validate(obj);
}
module.exports = {
  Album,
  ValidateCreateAlbum,
};
