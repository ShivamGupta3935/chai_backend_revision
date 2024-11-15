import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Tweet} from '../models/tweet.models.js'
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { response } from "express"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    //check video is present or not 
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id")
    }

    const existedLike = await Like.findOne({
        video: videoId,
        likedBy: req?.user._id 
    })

    if (existedLike) {
        await Like.findByIdAndDelete(existedLike._id)
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {isLiked: false}
            ,"video unlike successfully"
        )
    )

    await Like.create({
        video: videoId,
        likedBy: req?.user._id
    })
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {isLiked: true},
        "video liked successfully"
    ))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "invalid comment id")
    }

    const existedCommentLike = await Like.findOne({
        comment: commentId,
        likedBy: req?.user._id
    })
    if (existedCommentLike) {
        await Like.findByIdAndDelete(existedCommentLike._id)
   
    return res
    .status(200)
    .json(new ApiResponse(200, {isLiked: false}, "comment like removed successfully"))
   }

   await Like.create({
      comment: commentId,
      likedBy: req?.user._id
   })
    
   return res
   .status(200)
   .json(new ApiResponse(200, {isLiked: true}, "comment like successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "invalid tweet id ")
    }

    const existedTweet = await tweetId.findOne({
        tweet: tweetId,
        likedBy: req?.user._id,
    })
    if (existedTweet) {
        await findByIdAndDelete(existedTweet._id)
        return res
        .status(200)
        .json(new ApiResponse(200, {isLiked: false}, "tweet like removed successfully"))
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, {isLiked: true}, "tweet liked successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const videos = await video.find({
        isLiked: true 
    })
    return res
    .status(200)
    .json(new ApiResponse(200, videos, "all liked video fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}