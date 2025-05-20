"use client";

import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./pandaBot.css";

const PandaBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatMessagesRef = useRef(null);
  const imageUploadRef = useRef(null);
  const initialMessageSent = useRef(false);

  // Replace with your actual API key and consider using environment variables
  const API_KEY = import.meta.env.VITE_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);

  useEffect(() => {
    // Initial bot message - only sent once and using a ref to prevent duplicate renders
    if (!initialMessageSent.current) {
      addMessage(
        "I'm Pando, the Panda Bot. Upload a food image or describe what you ate, and I'll help you understand its nutrition!"
      );
      initialMessageSent.current = true;
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat messages
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (content, isUser = false, imageData = null) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { content, isUser, imageData },
    ]);
  };

  const uploadImage = () => {
    imageUploadRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target.result;
        setUploadedImage(imageData);

        // Add the message with the image attached
        addMessage("Image uploaded", true, imageData);

        // Process the image immediately
        await processImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData) => {
    setIsProcessing(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze the nutritional content of this food in detail. 
      Provide a comprehensive breakdown including:
      - Total estimated calories
      - Precise macronutrient breakdown (protein, carbohydrates, fats)
      - Key micronutrients present
      - Potential health benefits
      - Dietary considerations or recommendations
      
      IMPORTANT FORMATTING INSTRUCTIONS:
      1. Do not use any Markdown formatting
      2. Remove all asterisks (*) from your response
      3. Use double line breaks between each section or paragraph
      4. After each bullet point or list item, add a line break
      5. Format sections with clear headers followed by double line breaks
      6. Use proper line spacing throughout the entire response`;

      const image = {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageData.split(",")[1],
        },
      };

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }, image] }],
      });

      const response = await result.response;
      let text = response.text();

      // Clean up formatting
      text = text
        .replace(/\*\*\*/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "");

      // Improve formatting with more aggressive newline handling
      text = text.replace(/- ([^\n]+)(?!\n)/g, "- $1\n"); // Ensure newlines after bullet points
      text = text.replace(/([.:!?])\s+([A-Z])/g, "$1\n\n$2"); // Add paragraph breaks
      text = text.replace(/\n\s*\n/g, "\n\n"); // Normalize multiple newlines to exactly two
      text = text.replace(/([A-Za-z0-9]):(?!\n)/g, "$1:\n"); // Add newline after section headers with colons

      // Add bot response (without using the formatted message approach)
      addMessage(text);
    } catch (error) {
      console.error("Detailed Error:", error);
      addMessage(
        `Error: ${error.message}. Please check your API key and internet connection.`
      );
    } finally {
      setIsProcessing(false);
      setUploadedImage(null); // Clear the pending image after processing
    }
  };

  const sendMessage = async () => {
    const message = inputMessage.trim();
    if (!message && !uploadedImage) return;

    // Add user message
    addMessage(message, true);
    setInputMessage("");
    setIsProcessing(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze the nutritional content of this food in detail. 
      Provide a comprehensive breakdown including:
      - Total estimated calories
      - Precise macronutrient breakdown (protein, carbohydrates, fats)
      - Key micronutrients present
      - Potential health benefits
      - Dietary considerations or recommendations
      
      IMPORTANT FORMATTING INSTRUCTIONS:
      1. Do not use any Markdown formatting
      2. Remove all asterisks (*) from your response
      3. Use double line breaks between each section or paragraph
      4. After each bullet point or list item, add a line break
      5. Format sections with clear headers followed by double line breaks
      6. Use proper line spacing throughout the entire response

      Additional context from user: ${message}`;

      let result;
      if (uploadedImage) {
        const image = {
          inlineData: {
            mimeType: "image/jpeg",
            data: uploadedImage.split(",")[1],
          },
        };
        result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }, image] }],
        });
      } else {
        result = await model.generateContent(prompt);
      }

      const response = await result.response;
      let text = response.text();

      // Clean up formatting
      text = text
        .replace(/\*\*\*/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "");

      // Improve formatting with more aggressive newline handling
      text = text.replace(/- ([^\n]+)(?!\n)/g, "- $1\n"); // Ensure newlines after bullet points
      text = text.replace(/([.:!?])\s+([A-Z])/g, "$1\n\n$2"); // Add paragraph breaks
      text = text.replace(/\n\s*\n/g, "\n\n"); // Normalize multiple newlines to exactly two
      text = text.replace(/([A-Za-z0-9]):(?!\n)/g, "$1:\n"); // Add newline after section headers with colons

      // Add bot response (without using the formatted message approach)
      addMessage(text);

      // Reset uploaded image
      setUploadedImage(null);
    } catch (error) {
      console.error("Detailed Error:", error);
      addMessage(
        `Error: ${error.message}. Please check your API key and internet connection.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isProcessing) {
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <img
          src="https://placehold.co/100x100/4CAF50/FFFFFF/png?text=🐼"
          alt="Panda Bot Logo"
        />
        <h2>Panda Bot</h2>
      </div>
      <div id="chat-messages" ref={chatMessagesRef} className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.isUser ? "user-message" : "bot-message"}`}
          >
            {msg.content}
            {msg.imageData && (
              <img
                src={msg.imageData}
                alt="Uploaded Food"
                className="image-preview"
              />
            )}
          </div>
        ))}

        {/* Loading spinner shown when processing */}
        {isProcessing && <div className="loading-spinner"></div>}
      </div>
      <div className="input-area">
        <input
          type="file"
          ref={imageUploadRef}
          id="image-upload"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
        />
        <button
          onClick={uploadImage}
          disabled={isProcessing}
          className="upload-btn"
        >
          📷
        </button>
        <button
          onClick={sendMessage}
          disabled={isProcessing}
          className="send-btn"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default PandaBot;
