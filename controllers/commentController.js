const asyncHandler = require("express-async-handler");
const {
  Comment,
  ValidateCreateComment,
  ValidateUpdateComment,
} = require("../models/Comment");
const { User } = require("../models/User");
/**--------------------------------------------------------------------
 * @desc Create Comment 
 * @routes /api/users/comment
 * @method post
 * @access private Only login user  
---------------------------------------------------------------------*/
module.exports.CreateCommentCtrl = asyncHandler(async (req, res) => {
  const { error } = ValidateCreateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const user = await User.findById(req.user.id);
  const comment = await Comment.create({
    postId: req.body.postId,
    text: req.body.text,
    user: req.user.id,
    username: user.firstName + " " + user.lastName,
  });
  return res.status(201).json(comment);
});
/**--------------------------------------------------------------------
 * @desc Get All Comment 
 * @routes /api/users/comment/:idPost
 * @method Get
 * @access private Only Admin
---------------------------------------------------------------------*/
module.exports.GetAllCommentCtrl = asyncHandler(async (req, res) => {
  const comments = await Comment.find({postId:req.params.id});
  return res.status(200).json(comments);
});
/**--------------------------------------------------------------------
 * @desc Delete Comment 
 * @routes /api/users/comment/:id
 * @method DELETE
 * @access private Only Admin or owner of the comment
---------------------------------------------------------------------*/
module.exports.deleteCommentCtrl = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: "comment not found !" });
  }

  await Comment.findByIdAndDelete(req.params.id);
  return res.status(200).json({ message: "delete successfully !" });
});
/**--------------------------------------------------------------------
 * @desc Update Comment 
 * @routes /api/users/comment/:id
 * @method PUT
 * @access private (Only owner of the comment) 
---------------------------------------------------------------------*/
module.exports.UpdateCommentCtrl = asyncHandler(async (req, res) => {
  const { error } = ValidateUpdateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  let comment;
  comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: "comment not found" });
  }
  if (req.user.id !== comment.user.toString()) {
    return res.status(403).json({
      message: "access denied, only user himself can update this comment ",
    });
  } else {
    comment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          text: req.body.text,
        },
      },
      { new: true }
    );
  }
  return res.status(201).json(comment);
});
