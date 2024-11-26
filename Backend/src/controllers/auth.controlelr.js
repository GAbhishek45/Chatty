import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcrypt"
import generateJwtToken from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";


export const signUp = async(req,res) => {
    try {
        const {email,fullName,password} = req.body 

        if(!email || !fullName || !password){
            return res.status(400).json({
                success:false,
                msg:"All fields are required"
            })        
        }

        if(password.length < 8){
            return res.status(400).json({
                success:false,
                msg:"Password must be at least 8 characters"
            })
        }

        const exsistingUser = await User.findOne({email})

        if(exsistingUser){
            return res.status(400).json({
                success:false,
                msg:"User already exists"
            })
        }

        const hashedPass = await bcrypt.hash(password,10)

        const newUser = new User({
            email,
            fullName,
            password:hashedPass
        })


        if(newUser){

            //generate jwt
            generateJwtToken(newUser._id,res)
            await newUser.save()
            res.status(200).json({
                success:true,
                msg:"User created successfully"
            })
        }else{
            return res.status(400).json({
                success:false,
                msg:"User not created"
            })
        }

    } catch (error) {
        console.log("Error in sign up"+error)
        return res.status(500).json({
            success:false,
            msg:"Internal server error in sign up"
        })
    }
}

export const login = async(req,res) => {
    try {
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                success:false,
                msg:"All fields are required"
            })        
        }

        const exsistingUser = await User.findOne({email})

        if(!exsistingUser){
            return res.status(400).json({
                success:false,
                msg:"User not found"
            })
        }

        const isMatch = await bcrypt.compare(password,exsistingUser.password)

        if(!isMatch){
            return res.status(400).json({
                success:false,
                msg:"Invalid credentials"
            })
        }

        //generate jwt
        generateJwtToken(exsistingUser._id,res)

        res.status(200).json({
            success:true,
            msg:"User logged in successfully"
        })
    } catch (error) {
        console.log("Error in login"+error)
        return res.status(500).json({
            success:false,
            msg:"Internal server error in login"
        })
    }
}


export const logout = async(req,res) => {
    try {
        await res.clearCookie("jwt")
        res.status(200).json({
            success:true,
            msg:"User logged out successfully"
        })
    } catch (error) {
        console.log("Error in logout"+error)    
        return res.status(500).json({
            success:false,
            msg:"Internal server error in logout"
        })
    }
}

export const updateProfile = async(req,res) => {
    try {
        const {profilePic} = req.files
        const user = req.user._id


        if(!profilePic){
            return res.status(400).json({
                success:false,
                msg:"ProfilePic is  required"
            })        
        }

        const response = await cloudinary.uploader.upload(profilePic.tempFilePath)

        const updatedUser = await User.findByIdAndUpdate(user,{profilePic:response.secure_url},{new:true})


        res.status(200).json({
            success:true,
            msg:"Profile updated successfully",
            updatedUser
        })

    } catch (error) {
        console.log("Error in updateProfile"+error)
        return res.status(500).json({
            success:false,
            msg:"Internal server error in updateProfile"
        })
    }
}


export const checkAuth = async(req,res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth"+error)
        return res.status(500).json({
            success:false,
            msg:"Internal server error in checkAuth"
        })
    }
}