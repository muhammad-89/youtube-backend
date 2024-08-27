import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/ApiResponse";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend/postman 
    const { username, fullname, email, password } = req.body;
    console.log("emial : ", email);

    // validation - not empty 24:27
    if (
        [fullname, email, username, password].some((field) =>
            field.trim() === ""
        )) {
        throw new ApiError(400, "All fields are required")
    }


    // check if user already exist : username , email 
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exist");
    }

    // check for images ,check for avatar 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImagePath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required ! ")
    }

    // upload them to cloudinary 
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImagePath)
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required ! ")
    }

    // create user object - create entry in database
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const creaedUser = await User.findById(user._id).select(    // remove password and refresh token field from response 
        "-password -refreshToken"
    )

    //check for user creation 
    if (!creaedUser) {
        throw new ApiError(500, "Failed to create user")
    }

    //return response 
    return res.status(201).json(
        new APIResponse(200, creaedUser, "User registered Successfully")
    )

})

export {
    registerUser
}