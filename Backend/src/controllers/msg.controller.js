import User from "../models/user.model.js"
import Message from '../models/message.model.js'
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";
export const getUserSidebar = async(req,res) => {
    try {
        const loggedInUsers = req.user._id

        const filteredUser = await User.find({_id:{$ne:loggedInUsers}}).select("-password")


        res.status(200).json(filteredUser)
    } catch (error) { 
        console.log("Error in getUserSidebar"+error)
        return res.status(500).json({
            success:false,
            msg:"Internal server error in getUserSidebar"
        })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChat } = req.params;
        const myId = req.user._id; // Ensure req.user._id exists (check if user is authenticated)

        // Assuming your message schema uses senderId and receiverId
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChat }, // Message sent by me to the other user
                { senderId: userToChat, receiverId: myId }  // Message sent by the other user to me
            ]
        }).sort({ createdAt: 1 }); // Optional: Sort messages by creation date (ascending)

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages: ", error);
        return res.status(500).json({
            success: false,
            msg: "Internal server error in getMessages"
        });
    }
};

export const sendMsg = async (req, res) => {
  try {
    const { text } = req.body;
    let image;
    let imageUrl = null;

    // Ensure req.files is defined and contains an image file
    if (req.files && req.files.image) {
      image = req.files.image;

      // Validate file type (ensure it's an image)
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validImageTypes.includes(image.mimetype)) {
        return res.status(400).json({ success: false, msg: "Invalid image format" });
      }

      // Validate file size (optional, for example, limit to 5MB)
      if (image.size > 5 * 1024 * 1024) {  // 5MB
        return res.status(400).json({ success: false, msg: "Image size exceeds the limit of 5MB" });
      }

      // Upload the image to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(image.tempFilePath);
      imageUrl = cloudinaryResponse.secure_url;  // Get the image URL from Cloudinary response
    }

    // Extract receiverId from URL params and senderId from user session
    const { id: receiverId } = req.params;
    const myId = req.user._id;  // Assuming req.user is populated (e.g., using a middleware like Passport)

    if (!myId || !receiverId) {
      return res.status(400).json({ success: false, msg: "Sender or Receiver ID is missing" });
    }

    // Create a new message object
    const newMsg = new Message({
      senderId: myId,
      receiverId: receiverId,
      text: text,
      image: imageUrl,  // Store the image URL if uploaded
    });

    // Save the new message to the database
    await newMsg.save();

    // Log message and receiver socket for debugging
    console.log("New message saved:", newMsg);
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log("Receiver Socket ID:", receiverSocketId);

    // Optionally, you can add real-time functionality here if using WebSockets
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMsg);
      console.log(`Message sent to receiver: ${receiverSocketId}`);
    } else {
      console.log(`Receiver is not connected: ${receiverId}`);
    }

    // Send the response back to the client
    res.status(200).json(newMsg);
  } catch (error) {
    console.error("Error in sendMsg:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error in sendMsg",
      error: error.message, // Include error message in the response for debugging
    });
  }
};


