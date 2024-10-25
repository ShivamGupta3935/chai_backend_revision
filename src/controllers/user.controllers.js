import  promisehandler  from "../utils/promiseHandler.js";
import { User } from '../models/user.models.js'
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'
import {ApiError} from '../utils/ApiError.js'

//token generate
const generateAccessAndRefreshToken = async(userId) => {
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      // console.log("refreshtoken", refreshToken);
      
      await user.save({validateBeforeSave: false})

      return {accessToken, refreshToken}
   } catch (error) {
      throw new ApiError(401, "something went wrong while generating access and refresh token")
   }
}

const registerUser = promisehandler( async(req, res) => {
    //get all detail from user 
    //validation not empty
    //check the user exist or not email and username
    //check for image check for avatar 
    //upload them to cloudinary
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation 
    //return response


     const {username, email, fullname, password}= req.body
   //   console.log(`username:${username} email: ${email} fullname: ${fullname} `)

    if ([username, email, password, fullname].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(400, "user already exist")
    }

    console.log("req filess", req.files);
     const avatarLocalPath = req.files?.avatar[0]?.path
   //   console.log(req.files?.avatar[0]);
    
   //   console.log("avatar local path ", avatarLocalPath);
     
     
   //   const coverImageFile = req.files?.coverImage;
   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
   }
   // console.log("coverimage local path ", coverImageLocalPath);
   
    
   if (!avatarLocalPath) {
        throw new ApiError(400, "avatar image are required")
     }


     const avatar = await uploadOnCloudinary(avatarLocalPath)
    //  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   //  const coverImage = coverImageFile 
   //  ? await uploadOnCloudinary(coverImageFile[0]?.path) 
   //  : null;

   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

     if (!avatar) {
        throw new ApiError(400, "avatar file are required")
     }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
     })

     const createdUser = await User.findById(user._id).select('-password -refreshToken')

     if (!createdUser) {
        throw new ApiError(500, "something went wrong while creating user in db")
     }

     res.status(201).json(
        new ApiResponse(200, createdUser, "usercreated successfully")
     )


})

const loginUser = promisehandler(async(req, res) => {

   
//login user
//req.body -> data
//username or email base login 
// check user exist in database or not 
// if not exist throw error 
// if exist find the user 
// check the password 
// access & refresh token 
// send res
   const {username, email, password} = req.body
  
   // console.log("req body",req.body.username);
   // console.log("req body",req.body.email);   
   // console.log("email login", email);
   
   if (!username && !email) {
      throw new ApiError(401, "username or email not valid")
   }

   const user = await User.findOne({
      $or: [{email}, {username}]
     })

     if (!user) {
        throw new ApiError(401, "user does not exist")
     }

     const isPasswordValid = await user.isPasswordCorrect(password)

     if (!isPasswordValid) {
        throw new ApiError(400, "invalid user password")
     }

     const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id)
   //   console.log("accesstoken" , accessToken);
   //   console.log("refreshtoken" , refreshToken);
     
     const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

     const options = {
        httpOnly: true,
        secure: true
     }

     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json(
        new ApiResponse(
         200,{
            user: loggedInUser, 
            accessToken: accessToken, 
            refreshToken: refreshToken
         },
         "user logged in successfully"
        )
     )
})

const logoutUser = promisehandler(async(req, res) => {
   await User.findByIdAndUpdate(req.user._id,
      {
         $unset: {
            refreshToken: 1
         }
      }, 
      {
         new: true
      }
   )

   const options = {
      httpOnly: true,
      secure: true
   }

   const refreshAccessToken = promisehandler(async(req, res) => {
      const incomingRefreshtoken = req.cookies?.refreshToken || req.body.refreshToken

      if (!incomingRefreshtoken) {
         throw new ApiError(400, "unauthorized incomingrefreshtoken")
      }

      const decodedToken = jwt.verify(incomingRefreshtoken,
         process.env.REFRESH_TOKEN_SECRET
      )

      const user = await User.findById(decodedToken._id)

      if (!user) {
         throw new ApiError(401, "invalid refresh token")
      }

      if (incomingRefreshtoken !== user?.refreshToken) {
         throw new ApiError(401, "refresh token expired or used ")
      }

      const options = {
         httpOnly: true,
         secure: true
      }

   
   const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
   })

    return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
      new ApiResponse(200,
         {accessToken, refreshToken: newRefreshToken, },
         "new refresh token generated successfully"
      )
    )

   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(
      new ApiResponse(
         200,
         {},
         "logged out successfully"
      )
   )
})

export  {registerUser, loginUser, logoutUser, refreshAccessToken}
