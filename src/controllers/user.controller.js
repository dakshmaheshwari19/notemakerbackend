import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const genrateAccessAndRefreshToken = async (userId)=>{

    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,
            "something went wrong while generating refresh and access tokens");
    }

}



const registerUser= asyncHandler(async(req,res)=>{
    //steps 
    // take username,email,password,fullname,avatar,
    // check if input fields are not empty
    // check if user already exists through username search
    // upload avatar on cloudinary,return link
    // make new user and add it in database
    // check if this user created successfully or not
    // genrate access and refresh token
    // make cookies

    const {username,email,fullname,password}=req.body
    console.log(req.body);

    if (!username || !email || !fullname || !password ){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = await User.findOne({
        username
    })

    if(existedUser){
        throw new ApiError(400,"User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }
    
    console.log("\n going to create user");

    const user = await User.create({
        username:username.toLowerCase(),
        email,
        password,
        fullname,
        avatar:avatar.url
    })


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    console.log("\n checked for user created");


    if(!createdUser){
        throw new ApiError(500,"Something went wrong while creating new user")
    }
    
    console.log(createdUser);

    return res.status(202).json({ createdUser,message: 'user created successfully' })
    
})


const loginUser = asyncHandler(async (req,res)=>{

    // check if user has refreshToken at this endpoint
    // if yes then continue to Sign in 
    // if no 
    // then go for form data which has be filled or received by user
    // that is - username and password
    // check for presence of username in database if no -- user doesnt exist 
    // if yes then go for -- password validation 
    // hash the password and match with that of username in database 
    // if correct --- give user refreshtoken and login continue
    
    // sir ka tarika
    
    // req body
    // username or email
    // check for user
    // check for password
    // genrate access and refresh token
    // send cookies
     
    console.log(req.body);
    
        const {email,username,password} = req.body
        console.log(email);
    
        if(!username && !email){
            throw new ApiError(400,"Username or email is required")
        }
    
    
        const user = await User.findOne({
            $or:[{username},{email}]
        })
    
        if(!user){
            throw new ApiError(404,"User does not exist")
        }
    
    
    
        // isPasswordCorrect jo method humne bnaya is available for
        //  user(instance) not for User(mongoose object)
        const isPasswordValid = await user.isPasswordCorrect(password)
    
        if(!isPasswordValid){
            throw new ApiError(404,"Password Invalid")
        }
    
    
    
        const {accessToken,refreshToken} = await genrateAccessAndRefreshToken(user._id)
    
    
    
        const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken")
    
        const options = {
            httpOnly : true,
            secure : true
            //cookies modifiable from server only not frontend
        }
        
    
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    user:loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged In successfully"
            )
        )
    
    })
    
    
    const logoutUser = asyncHandler(async(req,res)=>{
        //clear cookies
        //reset refresh token
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset:{
                     refreshToken: 1 //this removes the field from document
                    }
            },
            {
                new : true
            }
        )
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User logged out"))
    })


    const refreshAccessToken = asyncHandler(async(req,res)=>{

        const incomingRefreshToken = req.cookies.refreshToken || 
        req.body.refreshToken
    
        if(!incomingRefreshToken){
            throw new ApiError(401,"Unauthorized request")
        }
    
    try {
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )
        
            const user = await User.findById(decodedToken?._id)
        
            if(!user){
                throw new ApiError(401,"invalid refresh Token")
            }
        
            if(incomingRefreshToken !== user?.refreshToken){
                throw new ApiError(401,"Refresh token is expired")
            }
        
            const options={
                httpOnly:true,
                secure:true
            }
        
            const {accessToken,newrefreshToken}=await genrateAccessAndRefreshToken(user._id);
        
            res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newrefreshToken,options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,refreshToken:newrefreshToken
                    },
                    "New tokens generated"
                )
            )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token" )
    }
    
    
    })

export {registerUser,loginUser,logoutUser,refreshAccessToken}