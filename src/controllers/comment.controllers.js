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
})

const updateComment = promiseHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = promiseHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }