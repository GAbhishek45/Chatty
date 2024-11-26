import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton";
import { useAuthStore } from "./../store/useAuthStore";
import { formatMessageTime } from "./../lib/utils";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null); // Create a ref for the messages container

  // Fetch messages when the selected user changes
  useEffect(() => {
    if (selectedUser && selectedUser._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  // Scroll to the bottom whenever messages change or when the component is first rendered
  useEffect(() => {
    // Scroll to the bottom when messages are loaded or new messages are added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]); // Trigger when messages change

  // Show loading state
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // Ensure there are messages to display
  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <div className="p-4 text-center text-gray-500">No messages yet.</div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          return (
            <div
              key={msg._id}
              className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      msg.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="Profile Picture"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50">
                  {formatMessageTime(msg.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col shrink max-w-[80%] sm:max-w-[60%]  p-2 rounded-lg">
                {msg.image && (
                  <img
                    className="sm:max-w-[200px] rounded-md mb-2"
                    src={msg.image}
                    alt="Sent Message"
                  />
                )}
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              </div>
            </div>
          );
        })}
        {/* Scroll to the bottom on mount or when new messages are added */}
        <div ref={messagesEndRef} /> 
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
