const Post = require("../../models/User/Post");
const admin_post = require("../../models/Admin/admin_post")
const hashtagSchema = require("../../models/User/hashtags");
// create post by admin
exports.create_postNew = async (req, res, next) => {
  try {
    const { text, url, body, thumbnail, place, type, user_id } = req.body;
    // string.match(/#\w+/g)
    var arr_hash = body.match(/(^|\s)#(\w+)/g);
    console.log(arr_hash);
    var hash_tag = [];
    if (arr_hash) {
      console.log(arr_hash);
      arr_hash = arr_hash.map(function (v) {
        return v.trim().substring(1);
      });
      hash_tag.push(...arr_hash);
      const get_hashtag = await hashtagSchema.distinct("hashtag", {
        hashtag: arr_hash,
      });
      console.log(get_hashtag);
      hash_tags = new Set(get_hashtag.map((tag) => tag));

      arr_hash = arr_hash.filter((id) => !hash_tags.has(id));

      console.log(arr_hash);

      arr_hash.forEach(async (element) => {
        const hashtag = new hashtagSchema({
          hashtag: element,
          created_at: new Date(),
        }).save();
      });
    }
    if (type == 1 || type == 2 || type == 3)
      update_postwithType(
        user_id,
        url,
        "",
        thumbnail,
        body,
        place,
        type,
        hash_tag,
        res
      );
    if (type == 4)
      update_postwithType(
        user_id,
        "",
        text,
        thumbnail,
        body,
        place,
        type,
        hash_tag,
        res
      );
  } catch (error) {
    return res.json({
      success: false,
      message: "Error adding post" + error,
    });
  }
};

async function update_postwithType(
  userId,
  url,
  text,
  thumbnail,
  body,
  place,
  type,
  hashtag,
  res
) {
  try {
    var createdPost = await new admin_post({
      user_id: userId,
      image: url,
      text_content: text,
      thumbnail: thumbnail,
      body: body,
      place: place,
      post_type: type,
      hastag: hashtag,
      isActive: true,
      created_at: Date.now(),
    }).save();
    return res.json({
      success: true,
      message: createdPost,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error adding post" + error,
    });
  }
}

exports.getAllPost = async (req, res, next) => {

  try {
    const getPosts = await Post.find({}).populate('user_id', 'username name avatar isActive').sort({ created_at: -1 }).exec();
    // const adminPost = await admin_post.find({}).sort({ created_at: -1 }).populate('user_id', 'username').exec();

    // const all_post = [...getPosts, ...adminPost];
    // console.log(all_post)
    if (getPosts.length > 0) {
      return res.json({
        success: true,
        result: getPosts,
        message: "Fetched posts successfully"
      });
    }
    else {
      return res.json({
        success: false,
        message: "No data found"
      });
    }
  }
  catch (error) {
    return res.json({
      success: false,
      message: "Error occured!" + error,
    });
  }
}

exports.getPostDetail = async (req, res, next) => {

  try {
    const getPost = await Post.findOne({ _id: req.query.post_id }).populate('user_id', 'username name avatar isActive').exec();
    if (getPost) {
      return res.json({
        success: true,
        result: getPost,
        message: "Fetched posts successfully"
      });
    }
    else {
      return res.json({
        success: false,
        message: "No data found"
      });
    }
  }
  catch (error) {
    return res.json({
      success: false,
      message: "Error occured!" + error,
    });
  }
}

exports.activatepost = async (req, res, next) => {
  try {
    const updateactivate = await Post.updateOne(
      { _id: req.body.post_id },
      {
        $set: { isActive: true },
      },
      { new: true }
    );
    if (updateactivate) {
      return res.json({
        success: true,
        result: "Successfully Activated",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured!",
    });
  }
};

exports.deactivatepost = async (req, res, next) => {
  try {
    const updateDeactivateUser = await Post.updateOne(
      { _id: req.body.post_id},
      {
        $set: { isActive: false }
      },
      { new: true }
    ).exec();
    
    if (updateDeactivateUser) {
      return res.json({
        success: true,
        result: "Successfully Deactivated",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured!",
    });
  }
};