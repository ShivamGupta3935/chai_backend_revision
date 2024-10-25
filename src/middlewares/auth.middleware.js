import promiseHandler from '../utils/promiseHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.models.js'

export const verifyJwt = promiseHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        console.log("token ", token);
        
    
        if (!token) {
            throw new ApiError(401, "Invalid unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log( "decoded token ", decodedToken);
        
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    console.log( "user decoded token", user);
    
        if (!user) {
            throw new ApiError(400, "unauthorized token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token")
    }
}) 