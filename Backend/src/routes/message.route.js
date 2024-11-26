import express from  'express'
import { protectedRoute } from '../middlewares/auth.middleware.js'
import { getMessages, getUserSidebar, sendMsg } from '../controllers/msg.controller.js'

const msgRoutes = express.Router()

msgRoutes.get('/user',protectedRoute,getUserSidebar)
msgRoutes.get('/:id',protectedRoute,getMessages)
msgRoutes.post('/send/:id',protectedRoute,sendMsg)

export default msgRoutes