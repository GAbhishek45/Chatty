import express from 'express'
import { checkAuth, login, logout, signUp, updateProfile } from '../controllers/auth.controlelr.js'
import { protectedRoute } from '../middlewares/auth.middleware.js'

const authRoutes = express.Router()


authRoutes.post('/signup',signUp)
authRoutes.post('/login',login)
authRoutes.post('/logout',logout)
authRoutes.put('/update-profile',protectedRoute,updateProfile)
authRoutes.get('/check',protectedRoute,checkAuth)

export default authRoutes