import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

export const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt

        if (!token) {
            return res.status(401).json({
                success: false,
                msg: "Unauthorized"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decoded.userId)

        if (!user) {
            return res.status(401).json({
                success: false,
                msg: "Unauthorized"
            })
        }

        req.user = user

        next()

    } catch (error) {
        console.log("Error in protectedRoute" + error)
        return res.status(500).json({
            success: false,
            msg: "Internal server error in protectedRoute"
        })
    }
}