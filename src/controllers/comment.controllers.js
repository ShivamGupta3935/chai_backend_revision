import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
// import {promiseHandler} from "../utils/promiseHandler.js"
import promiseHandler from '../utils/promiseHandler.js'
import {Video} from '../models/video.models.js'
import {comment} from "../models/comment.models.js"


const getVideoComments = promiseHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const _video = await Video.findById(videoId)
    if (!_video) {
        throw new ApiError(400, "There are no video present in this given id")
    }

    const getAllComments = await Comment.aggregate([
        {
            $match: new mongoose.Schema.ObjectId(videoId)
        },
        {
            $lookup: {
                from: "User",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }   
        },
        //get comment detail who like and reply on comment
        {
            $lookup: {
                from: "Like",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likeCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?_id, "$likes.likedBy"]},
                        then: true
                        else: false
                    }
                }
            }
        },
        {
            $sort: {
                createdAt : -1
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likeCount: 1,
                owner: {
                    username: 1,
                    fullname: 1,
                    "avatar.url": 1
                },
                isLiked: 1
            }
        }     
    ])

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const paginatedComment = await Comment.aggregatePaginate(
        getAllComments,
        options
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            paginatedComment,
            "comment fetched successfully"
        )
    )
})

const addComment = promiseHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body
    const {videoId} = req.params

    if (!content) {
        throw new ApiError(400, "content is empty")
    }

    const _video = await Video.findById(videoId)
    if (!_video) {
        throw new ApiError(400, "there are no video this id")
    }

    const createComment = await Comment.create({
        content,
        video: videoId,
        owner: req..user?._id
    })

    if (!createComment) {
        throw new ApiError(500, "fail to add comment plz try again")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, createComment, "comment add successfully")
    )


})

const updateComment = promiseHandler(async (req, res) => {
    // TODO: update a comment
const {commentId} = req.params
    const {content} = req.params

    if (!content) {
        throw new ApiError(400, "no comment added")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "comment not exist")
    }

    if (comment?.owner.toString() != req?.user._id.toString()) {
        throw new ApiError(400, "only comment owene can update this comment ")
    }

    const updateComment = await Comment.findByIdAndUpdate(
        comment?._id,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, updateComment, "comment updated successfully"
        )
    )

})

const deleteComment = promiseHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "no comment exist, invalid comment id ")
    }

    if (comment.owner.toString() != req?.user._id.toString()){
        throw new ApiError(400, "only comment owner can delete this commnet")
    }

    await Comment.findByIdAndDelete(comment._id)

    return res
    .status(200)
    .json(new ApiResponse(200, {},"comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }