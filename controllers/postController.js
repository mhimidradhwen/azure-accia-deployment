const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const {
  validateCreatePost,
  validateUpdatePost,
  Post,
} = require("../models/Post");
const { Comment } = require("../models/Comment");
/**-------------------------------------------------------------------
 * @desc  create new Post
 * @route /api/admin/posts
 * @method POST
 * @method private (only admin)
--------------------------------------------------------------------*/
module.exports.createPostCtrl = asyncHandler(async (req, res) => {
  // Validation de l'image (décommentez si nécessaire)
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }
  // Validation des données (décommentez si nécessaire)
  const { error } = validateCreatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  // Récupération du chemin de l'image uploadée
  const imagePath = req.file.path;
  //get the url of the logo
  const newPathForPic = path.join(__dirname, "../public/Posts/")
  if (!fs.existsSync(newPathForPic)) {
    fs.mkdirSync(newPathForPic, { recursive: true })
  }
  aftermovelogoPath = path.join(newPathForPic, req.file.filename)
  fs.rename(imagePath, aftermovelogoPath, (err) => {
    if (err) {
      console.log("Une erreur s'est produite lors du déplacement du fichier :", err)
    } 
  })
  // Création d'un nouveau post et sauvegarde dans la base de données
  const post = await Post.create({
    title: {
      ar: req.body.title_ar || "",
      fr: req.body.title_fr || "",
      eng: req.body.title_eng || "",
    },
    description: {
      ar: req.body.description_ar || "",
      fr: req.body.description_fr || "",
      eng: req.body.description_eng || "",
    },
    isVisible: req.body.isVisible || false,
    user: req.user.id,
    "image.url": aftermovelogoPath,
  });
  // Envoi de la réponse au client
  res.status(201).json({ post: post, message: "post created successfully" });
});
/**-------------------------------------------------------------------
 * @desc  Get All Post
 * @route /api/admin/posts
 * @method GET
 * @method private (only admin or memeber)
--------------------------------------------------------------------*/
module.exports.GetAllPostsCtrl = asyncHandler(async (req, res) => {
  // 1- Get All Post form Bd

  const POST_PER_PAGE = 9;
  const { pageNumber, isVisible } = req.query;
  let posts;
  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else if (isVisible) {
    posts = await Post.find({ isVisible }).populate("user", ["-password"]);
  } else {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  }
  // 2 - send response to client
  res.status(200).json(posts);
});

/**-------------------------------------------------------------------
 * @desc  Get One Post
 * @route /api/admin/posts/:id
 * @method GET
 * @method public
--------------------------------------------------------------------*/
module.exports.GetOnePostsCtrl = asyncHandler(async (req, res) => {
  // 1- Get All Post form Bd

  const post = await Post.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("AllComments");
  // 2- check if the post not exist
  if (!post) {
    return res.status(404).json({ message: "post not found !" });
  }
  // 3- send the response to the client
  res.status(200).json(post);
});
/**-------------------------------------------------------------------
 * @desc  Count the  Post
 * @route /api/admin/posts/count
 * @method GET
 * @method public
--------------------------------------------------------------------*/
module.exports.GetPostsCountCtrl = asyncHandler(async (req, res) => {
  // 1- Get All Post form Bd
  const count = await Post.countDocuments();
  // 3- send the response to the client
  res.status(200).json(count);
});
/**-------------------------------------------------------------------
 * @desc  Delete  Post
 * @route /api/admin/posts/:id
 * @method DELETE
 * @method private only admin
--------------------------------------------------------------------*/
module.exports.DeletePostCtrl = asyncHandler(async (req, res) => {
  // 1- check if the post existe in the database
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  if (post.image && post.image.url) {
    fs.unlinkSync(post.image.url);

  }
  //Delete all comments that belong to this post
  await Comment.deleteMany({ postId: post._id });
  await Post.findByIdAndDelete(post._id);
  // 3- send the response to the client
  res
    .status(200)
    .json({ message: "delete successfully ", poste_deleted: post });
});
/**-------------------------------------------------------------------
 * @desc  Update Post
 * @route /api/admin/posts/:id
 * @method Put
 * @method private only admin
--------------------------------------------------------------------*/
module.exports.UpdatePostCtrl = asyncHandler(async (req, res) => {
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(401).json({ message: error.details[0].message });
  }
  let post;
  post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const UpdatePost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: {
          ar: req.body.title_ar || post.title.ar,
          fr: req.body.title_fr || post.title.fr,
          eng: req.body.title_eng || post.title.eng,
        },

        description: {
          ar: req.body.description_ar || post.description.ar,
          fr: req.body.description_fr || post.description.fr,
          eng: req.body.description_eng || post.description.eng,
        },

        isVisible: req.body.isVisible || post.isVisible,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json({ message: "Update successfully", poste: UpdatePost });
});
/**-------------------------------------------------------------------
 * @desc  Update Post Image
 * @route /api/admin/posts/Update-photo/:id
 * @method Put
 * @method private only admin
--------------------------------------------------------------------*/
module.exports.UpdatePhotoPostCtr = asyncHandler(async (req, res) => {
  // 1- validation
  if (!req.file) {
    return res.status(404).json({ message: "no image provided !" });
  }
  const OlderPost = await Post.findById(req.params.id);
  const logoPath = req.file.path;
  const newPathForPic = path.join(__dirname, "../public/Posts/")
  if (!fs.existsSync(newPathForPic)) {
    fs.mkdirSync(newPathForPic, { recursive: true })
  }
  aftermovelogoPath = path.join(newPathForPic, req.file.filename)
  fs.rename(logoPath, aftermovelogoPath, (err) => {
    if (err) {
      console.log("Une erreur s'est produite lors du déplacement du fichier :", err)
    } 
  })
  const UpdatePathPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        "image.url": aftermovelogoPath,
      },
    },
    { new: true }
  );
  try {
    fs.unlinkSync(OlderPost.image.url);
  } catch (error) {
    return res.status(401).json({ message: error.details[0].message });
  }
  return res.status(200).json({ message: "update photo successfully" });
});
/**-------------------------------------------------------------------
 * @desc  toggle like 
 * @route /api/admin/posts/like/:id
 * @method PUT
 * @method private only login user
--------------------------------------------------------------------*/
module.exports.ToggleLikeCtrl = asyncHandler(async (req, res) => {
  let post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  const isPostAlreadyLiked = post.Likes.find(
    (user) => user.toString() == req.user.id
  );
  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          Likes: req.user.id,
        },
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          Likes: req.user.id,
        },
      },
      { new: true }
    );
  }
  return res.status(200).json(post);
});
