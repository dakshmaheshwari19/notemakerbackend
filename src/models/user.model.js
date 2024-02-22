import mongoose, { model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        index:true,
    },
    email:{
        type: String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    avatar:{
        type:String, //cloudinary pe se
        required: true
    },
    refreshToken:{
        type:String,
    }
    
},{timestamps: true})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next(); //checking for pass change
this.password= await bcrypt.hash(this.password,10);//10 rounds of password hashing
next();//passing flag to the next  middleware
})

//creating custom method for isPassswordCorrect or injecting new custom mthods in schema
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email:this.email,
            username: this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


userSchema.plugin(mongooseAggregatePaginate)

export const User = mongoose.model("User",userSchema)