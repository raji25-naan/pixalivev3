
const Post = require('../../models/User/Post');
const follow_unfollow = require("../../models/User/follow_unfollow");
const likeSchema = require("../../models/User/like");
const TagPost = require('../../models/User/userTagpost');
const sleep = require('sleep-promise');
const blocked = require("../../models/User/blocked");


// All post of the user except reloop
exports.user_allPost = async (req, res, next) => {
        const current_user_id = req.user_id;
        const getpost_user_id = req.query.user_id;
        let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: current_user_id }).exec();
        let getBlockedUsers2 = await blocked.distinct("Blocked_user", { Blocked_by: getpost_user_id }).exec();
        let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
        var get_post;
        if ((current_user_id).toString() == (getpost_user_id).toString()) {
            get_post = await Post.find({
                user_id: getpost_user_id,
                isActive: true,
                isDeleted: false
            }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
        }
        else {
            const follower_data = await follow_unfollow.findOne({ followerId: current_user_id, followingId: getpost_user_id, status: 1 });
            if (follower_data) {
                get_post = await Post.find({
                    user_id: getpost_user_id,
                    privacyType: { $nin: "onlyMe" },
                    isActive: true,
                    isDeleted: false
                }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
            }
            else {
                get_post = await Post.find({
                    user_id: { $in: getpost_user_id, $nin: totalBlockedUser },
                    privacyType: { $nin: ["onlyMe", "private"] },
                    isActive: true, isDeleted: false
                }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
            }

        }
        if (get_post.length) {
            const arr_post = []
            get_post.forEach(post => {
                if (post.reloopPostId == undefined) {
                    arr_post.push(post)
                }
            })
            if (arr_post.length)
             {
                //follower_data_main
                const follower_data_main = await follow_unfollow.distinct("followingId", {
                    followerId: current_user_id,
                    status: 1
                });
                var change_string = follower_data_main.map(String);
                var getAll_Id = [...new Set(change_string)];
                //request_data_main
                const request_data_main = await follow_unfollow.distinct("followingId", {
                    followerId: current_user_id,
                    status: 0
                });
                var requestData = request_data_main.map(String);
                var requested = [...new Set(requestData)];

                const getUser_like = await likeSchema.distinct("post_id", {
                    user_id: current_user_id,
                    isLike: 1,
                }).exec();
                const liked_Ids = getUser_like.map(String);
                //follow1
                arr_post.forEach((data) => {
                    getAll_Id.forEach((followId) => {
                        if (followId == data.user_id._id) {
                            data.user_id.follow = 1;
                        }
                    })
                });
                //follow2
                arr_post.forEach((data) => {
                    requested.forEach((followId) => {
                        if (followId == data.user_id._id) {
                            data.user_id.follow = 2;
                        }
                    })
                });
                //isLiked
                arr_post.forEach((post) => {
                    liked_Ids.forEach((id) => {
                        if (id == post._id) {
                            post.isLiked = 1;
                        }
                    });
                });

                sleep(2000).then(function () {
                    return res.json({
                        success: true,
                        feeds: arr_post,
                    });
                });

            }
            else {
                return res.json({
                    success: true,
                    feeds: [],
                    message: "No post uploaded",
                });
            }

        }
        else {
            return res.json({
                success: false,
                feeds: [],
                message: " No post Uploaded ",
            });
        }
}


// Relooped posts
exports.user_reloopPost = async (req, res, next) => {

        const current_user_id = req.user_id;
        const getpost_user_id = req.query.user_id;
        let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: current_user_id }).exec();
        let getBlockedUsers2 = await blocked.distinct("Blocked_user", { Blocked_by: getpost_user_id }).exec();
        let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
        var get_post;
        if ((current_user_id).toString() == (getpost_user_id).toString()) {
            get_post = await Post.find({
                user_id: getpost_user_id,
                isActive: true, isDeleted: false
            }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
        }
        else {
            const follower_data = await follow_unfollow.findOne({ followerId: current_user_id, followingId: getpost_user_id, status: 1 });
            if (follower_data) {
                get_post = await Post.find({
                    user_id: getpost_user_id,
                    privacyType: { $nin: "onlyMe" },
                    isActive: true, isDeleted: false
                }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
            }
            else {
                get_post = await Post.find({
                    user_id: { $in: getpost_user_id, $nin: totalBlockedUser },
                    privacyType: { $nin: ["onlyMe", "private"] },
                    isActive: true, isDeleted: false
                }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
            }

        }
        const arr_post = [];
        if (get_post.length) {

            get_post.forEach(post => {
                if (post.reloopPostId) {
                    arr_post.push(post)
                }
            })
            console.log(arr_post)
            if (arr_post.length) {
                //follower_data
                const follower_data = await follow_unfollow.distinct("followingId", {
                    followerId: current_user_id,
                    status: 1
                });
                var change_string = follower_data.map(String);
                var getAll_Id = [...new Set(change_string)];
                //request_data_main
                const request_data_main = await follow_unfollow.distinct("followingId", {
                    followerId: current_user_id,
                    status: 0
                });
                var requestData = request_data_main.map(String);
                var requested = [...new Set(requestData)];

                const getUser_like = await likeSchema.distinct("post_id", {
                    user_id: current_user_id,
                    isLike: 1,
                }).exec();
                const liked_Ids = getUser_like.map(String);
                //follow1
                arr_post.forEach((data) => {
                    getAll_Id.forEach((followId) => {
                        if (followId == data.user_id._id) {
                            data.user_id.follow = 1;
                        }
                    })
                });
                //follow2
                arr_post.forEach((data) => {
                    requested.forEach((followId) => {
                        if (followId == data.user_id._id) {
                            data.user_id.follow = 2;
                        }
                    })
                });
                //isLiked
                arr_post.forEach((post) => {
                    liked_Ids.forEach((id) => {
                        if (id == post._id) {
                            post.isLiked = 1;
                        }
                    });
                });

                sleep(2000).then(function () {
                    return res.json({
                        success: true,
                        feeds: arr_post,
                    });
                });

            }
            else {
                return res.json({
                    success: true,
                    feeds: [],
                    message: "No relooped post uploaded",
                });
            }

        }
        else {
            return res.json({
                success: false,
                feeds: [],
                message: " No post Uploaded ",
            });
        }
}

// tagged post
exports.user_taggedPost = async (req, res, next) => {
        const current_user_id = req.user_id;
        const getpost_user_id = req.query.user_id;

        const get_taggedPost = await TagPost.distinct("post_id", { tagged_userId: getpost_user_id }).exec();
        console.log(get_taggedPost);
        if (get_taggedPost.length) {
            let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: current_user_id }).exec();
            let getBlockedUsers2 = await blocked.distinct("Blocked_user", { Blocked_by: getpost_user_id }).exec();
            let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
            var get_post;
            if ((current_user_id).toString() == (getpost_user_id).toString()) {
                get_post = await Post.find({
                    _id: get_taggedPost,
                    isActive: true, isDeleted: false
                }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
            }
            else {
                const follower_data = await follow_unfollow.findOne({ followerId: current_user_id, followingId: getpost_user_id, status: 1 });
                if (follower_data) {
                    get_post = await Post.find({
                        _id: get_taggedPost,
                        privacyType: { $nin: "onlyMe" },
                        isActive: true, isDeleted: false
                    }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
                }
                else {
                    get_post = await Post.find({
                        user_id: { $nin: totalBlockedUser },
                        _id: get_taggedPost,
                        privacyType: { $nin: ["onlyMe", "private"] },
                        isActive: true, isDeleted: false
                    }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
                }

            }
            if (get_post.length) {
                const arr_post = []
                get_post.forEach(post => {
                    if (post.reloopPostId == undefined) {
                        arr_post.push(post)
                    }
                })
                console.log(arr_post)
                if (arr_post.length) 
                {
                    //follower_data
                    const follower_data = await follow_unfollow.distinct("followingId", {
                        followerId: current_user_id,
                        status: 1
                    });
                    var change_string = follower_data.map(String);
                    var getAll_Id = [...new Set(change_string)];
                    //request_data_main
                    const request_data_main = await follow_unfollow.distinct("followingId", {
                        followerId: current_user_id,
                        status: 0
                    });
                    var requestData = request_data_main.map(String);
                    var requested = [...new Set(requestData)];
                    //getUser_like
                    const getUser_like = await likeSchema.distinct("post_id", {
                        user_id: current_user_id,
                        isLike: 1,
                    }).exec();
                    const liked_Ids = getUser_like.map(String);
                    //follow1
                    arr_post.forEach((data) => {
                        getAll_Id.forEach((followId) => {
                            if (followId == data.user_id._id) {
                                data.user_id.follow = 1;
                            }
                        })
                    });
                    //follow2
                    arr_post.forEach((data) => {
                        requested.forEach((followId) => {
                            if (followId == data.user_id._id) {
                                data.user_id.follow = 2;
                            }
                        })
                    });
                    //isLiked
                    arr_post.forEach((post) => {
                        liked_Ids.forEach((id) => {
                            if (id == post._id) {
                                post.isLiked = 1;
                            }
                        });
                    });

                    sleep(2000).then(function () {
                        return res.json({
                            success: true,
                            feeds: arr_post,
                        });
                    });
                }
            }
            else {
                return res.json({
                    success: false,
                    feeds: [],
                    message: " No Tagged post added ",
                });
            }
        }
        else {
            return res.json({
                success: false,
                feeds: [],
                message: " No Tagged post added ",
            });
        }
}
// trending Post
exports.trending_post = async (req, res, next) => {
        const current_user_id = req.user_id;
        let date_obj = new Date();
        let oneDay = new Date(new Date().setDate(date_obj.getDate() - 1));
        // let oneHour = new Date(new Date().getTime() - 1000 * 60 * 60)
        let getBlockedUsers = await blocked.distinct("Blocked_user", { Blocked_by: current_user_id }).exec();

        const get_post = await Post.find({
            user_id: { $nin: getBlockedUsers },
            created_at: { $gt: oneDay },
            isActive: true,
            isDeleted: false,
            privacyType: { $nin: "onlyMe" }
        }).sort({ created_at: -1 }).exec();

        if (get_post.length) {
            var arr = []
            get_post.forEach(data => {
                if (data.reloopPostId != undefined) {
                    arr.push(data.reloopPostId)
                }
            })

            if (arr.length) {
                arr.toString();
                console.log(arr)
                var result = arr.reduce(function (prev, cur) {
                    prev[cur] = (prev[cur] || 0) + 1;
                    return prev;
                }, {})
                console.log(result)
                var keysSorted = Object.keys(result).sort(function (a, b) { return result[b] - result[a] })
                console.log(keysSorted);

                const get_all_post = await Post.find({ _id: keysSorted }).populate("user_id", "username avatar name private follow").exec();
                console.log(get_all_post)
                if (get_all_post.length) {
                    //follower_data
                    const follower_data = await follow_unfollow.distinct("followingId", {
                        followerId: current_user_id,
                        status: 1
                    });
                    var change_string = follower_data.map(String);
                    var getAll_Id = [...new Set(change_string)];
                    //request_data_main
                    const request_data_main = await follow_unfollow.distinct("followingId", {
                        followerId: current_user_id,
                        status: 0
                    });
                    var requestData = request_data_main.map(String);
                    var requested = [...new Set(requestData)];
                    //getUser_like
                    const getUser_like = await likeSchema.distinct("post_id", {
                        user_id: current_user_id,
                        isLike: 1,
                    }).exec();
                    const liked_Ids = getUser_like.map(String);
                    //follow1
                    get_all_post.forEach((data) => {
                        getAll_Id.forEach((followId) => {
                            if (followId == data.user_id._id) {
                                data.user_id.follow = 1;
                            }
                        })
                    });
                    //follow2
                    get_all_post.forEach((data) => {
                        requested.forEach((followId) => {
                            if (followId == data.user_id._id) {
                                data.user_id.follow = 2;
                            }
                        })
                    });
                    //isLiked
                    get_all_post.forEach((post) => {
                        liked_Ids.forEach((id) => {
                            if (id == post._id) {
                                post.isLiked = 1;
                            }
                        });
                    });
                    console.log("enter")
                    sleep(2000).then(function () {
                        return res.json({
                            success: true,
                            feeds: get_all_post,
                            message: "Trending Post",
                        });
                    });
                }
                else {
                    return res.json({
                        success: false,
                        feeds: [],
                        message: "No Trending Post Find",
                    });
                }
            }
            else {
                return res.json({
                    success: false,
                    feeds: [],
                    message: "No Trending Post Find",
                });
            }
        }
        else {
            return res.json({
                success: false,
                feeds: [],
                message: "No Trending Post Find",
            });
        }
}


// trending post by category
exports.trending_postByCategory = async (req, res, next) => {

        const category_name = req.query.category_name;
        const current_user_id = req.user_id;
        const loop = req.query.loop;
        let date_obj = new Date();
        let oneHour = new Date(new Date().getTime() - 1000 * 60 * 60);
        let oneDay = new Date(new Date().setDate(date_obj.getDate() - 1));
        var get_post;
        var get_all_post;
        var arr = []
        let getBlockedUsers = await blocked.distinct("Blocked_user", { Blocked_by: current_user_id }).exec();
        if (loop == 1) {
            get_post = await Post.find({
                user_id: { $nin: getBlockedUsers },
                created_at: { $gt: oneDay },
                category: category_name,
                isActive: true,
                isDeleted: false,
                privacyType: { $nin: "onlyMe" }
            }).sort({ created_at: -1 }).exec();

            if (get_post.length) {
                get_post.forEach(data => {
                    if (data.reloopPostId != undefined) {
                        arr.push(data.reloopPostId)
                    }
                })

                if (arr.length) {
                    arr.toString();
                    console.log(arr)
                    var result = arr.reduce(function (prev, cur) {
                        prev[cur] = (prev[cur] || 0) + 1;
                        return prev;
                    }, {})
                    console.log(result)
                    var keysSorted = Object.keys(result).sort(function (a, b) { return result[b] - result[a] })
                    console.log(keysSorted);

                    get_all_post = await Post.find({ _id: keysSorted }).populate("user_id", "username avatar name private follow")
                    console.log(get_all_post)
                }
                else {
                    return res.json({
                        success: false,
                        message: "No Trending Post Find",
                    });
                }
            }
            else {
                return res.json({
                    success: false,
                    message: "No Trending Post Find",
                });
            }


        }
        else if (loop == 2) {
            get_post = await Post.find({
                user_id: { $nin: getBlockedUsers },
                category: category_name,
                isActive: true,
                isDeleted: false,
                privacyType: { $nin: "onlyMe" }
            }).populate("user_id", "username avatar name private follow").sort({ created_at: -1 }).exec();
            if (get_post.length) {
                get_post.forEach(data => {
                    if (data.reloopPostId == undefined) {
                        arr.push(data)
                    }
                })
                get_all_post = arr;
            }
            else {
                return res.json({
                    success: false,
                    message: "No Trending Post Find",
                });
            }
        }

        if (get_all_post.length) {
            //follower_data
            const follower_data = await follow_unfollow.distinct("followingId", {
                followerId: current_user_id,
                status: 1
            });
            var change_string = follower_data.map(String);
            var getAll_Id = [...new Set(change_string)];
            //request_data_main
            const request_data_main = await follow_unfollow.distinct("followingId", {
                followerId: current_user_id,
                status: 0
            });
            var requestData = request_data_main.map(String);
            var requested = [...new Set(requestData)];
            //getUser_like
            const getUser_like = await likeSchema.distinct("post_id", {
                user_id: current_user_id,
                isLike: 1,
            }).exec();
            const liked_Ids = getUser_like.map(String);
            //follow1
            get_all_post.forEach((data) => {
                getAll_Id.forEach((followId) => {
                    if (followId == data.user_id._id) {
                        data.user_id.follow = 1;
                    }
                })
            });
            //follow2
            get_all_post.forEach((data) => {
                requested.forEach((followId) => {
                    if (followId == data.user_id._id) {
                        data.user_id.follow = 2;
                    }
                })
            });
            //isLiked
            get_all_post.forEach((post) => {
                liked_Ids.forEach((id) => {
                    if (id == post._id) {
                        post.isLiked = 1;
                    }
                });
            });
            sleep(2000).then(function () {
                return res.json({
                    success: true,
                    feeds: get_all_post,
                    message: "Trending Post",
                });
            });
        }
        else {
            return res.json({
                success: false,
                message: "No Trending Post Find",
            });
        }
}
