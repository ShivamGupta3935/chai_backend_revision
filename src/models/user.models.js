import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'



const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true
    },
    fullname: {
        type: true,
        required: true,
        trim: true
    },
    avatar: {
        type: String,  //cloudinary url
        required: true
    },
    coverImage: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ]
}, {timestamps:true})

UserSchema.pre('save',async function(next){
    if (!this.isModified('password')) return next()
    this.password = bcrypt.hash(this.password, 8)
    next()
})

//costom methods 
UserSchema.methods.isPasswordCorrect = async function(){
   return await bcrypt.compare(password, this.password)
}

//jwt costom method for token
UserSchema.methods.generateAccessToken = jwt.sign(
    {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)

UserSchema.methods.generateRefreshToken = jwt.sign(
    {
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)

export const Video = mongoose.model('User', UserSchema)