import React, { useContext, useState, useEffect } from 'react';
import './ChatBox.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';
import upload from '../../lib/upload';

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages, chatVisible, setChatVisible } = useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input || !messagesId) return; // Guard clause for empty input or missing messageId
    try {
      const messageData = {
        sId: userData.id,
        text: input,
        createdAt: new Date(),
      };

      await updateDoc(doc(db, 'messages', messagesId), {
        messages: arrayUnion(messageData),
      });

      await updateUserChats(input);
    } catch (error) {
      toast.error(`Failed to send message: ${error.message}`);
    } finally {
      setInput(""); // Clear input after message is sent
    }
  };

  const updateUserChats = async (lastMessage) => {
    const userIDs = [chatUser.rId, userData.id];

    for (const id of userIDs) {
      const userChatsRef = doc(db, 'chats', id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const userChatData = userChatsSnapshot.data();
        const chatIndex = userChatData.chatsData.findIndex(c => c.messageId === messagesId);

        if (chatIndex !== -1) {
          userChatData.chatsData[chatIndex].lastMessage = lastMessage.slice(0, 30);
          userChatData.chatsData[chatIndex].updatedAt = Date.now();
          if (userChatData.chatsData[chatIndex].rId === userData.id) {
            userChatData.chatsData[chatIndex].messageSeen = false;
          }
          await updateDoc(userChatsRef, { chatsData: userChatData.chatsData });
        }
      }
    }
  };

  const sendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !messagesId) return;

    try {
      const fileUrl = await upload(file);

      if (fileUrl) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          }),
        });
        await updateUserChats("Image");
      }
    } catch (error) {
      toast.error(`Failed to send image: ${error.message}`);
    }
  };

  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const suffix = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour > 12 ? hour - 12 : hour;
    return `${adjustedHour}:${minute.toString().padStart(2, "0")} ${suffix}`;
  };

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId, setMessages]);

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="User avatar" />
        <p>{chatUser.userData.name} {Date.now() - chatUser.userData.lastSeen <= 70000 && <img className='dot' src={assets.green_dot} alt="Online status" />}</p>
        <img src={assets.help_icon} className="help" alt="Help icon" />
        <img onClick={() => setChatVisible(false)} src={assets.arrow_icon} className='arrow' alt="Close chat" />
      </div>

      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sId === userData.id ? 's-msg' : 'r-msg'}>
            {msg.image ? (
              <img className='msg-img' src={msg.image} alt="Sent image" />
            ) : (
              <p className='msg'>{msg.text}</p>
            )}

            <div className="msg-info">
              <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt='User avatar' />
              <p>{convertTimestamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Type a message..."
        />
        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="Upload image" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="Send message" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <img src={assets.logo_icon} alt="Chat logo" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
