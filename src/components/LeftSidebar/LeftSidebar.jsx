// import React, { useContext, useState } from 'react';
// import './LeftSidebar.css';
// import assets from '../../assets/assets';
// import { useNavigate } from 'react-router-dom';
// import { collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
// import { AppContext } from '../../context/AppContext';
// import { db } from '../../config/firebase';
// import { arrayUnion } from 'firebase/firestore'; // Import this for array updates in Firestore
// import { toast } from 'react-toastify';

// const LeftSidebar = () => {
//     const navigate = useNavigate();
//     const { userData, chatData, chatUser, setChatUser, setMessagesId, messagesId } = useContext(AppContext); // Ensure chatData is obtained from context
//     const [user, setUser] = useState(null);
//     const [showSearch, setShowSearch] = useState(false);

//     const inputHandler = async (e) => {
//         try {
//             const input = e.target.value;
//             if (input) {
//                 setShowSearch(true);
//                 const userRef = collection(db, 'users');
//                 const q = query(userRef, where('username', '==', input.toLowerCase()));
//                 const querySnap = await getDocs(q);

//                 if (!querySnap.empty) {
//                     const foundUser = querySnap.docs[0].data();
//                     if (foundUser.id !== userData?.id) { // Avoid showing the current user in the results
//                         // Check if user is already in the chat
//                         const userExist = chatData?.some((chatUser) => chatUser.rId === foundUser.id);
//                         if (!userExist) {
//                             setUser(foundUser);
//                         } else {
//                             setUser(null); // User already in chat
//                         }
//                     } else {
//                         setUser(null); // If the user being searched is the current user
//                     }
//                 } else {
//                     setUser(null); // No matching user found
//                 }
//             } else {
//                 setShowSearch(false); // Hide search results if input is empty
//                 setUser(null);
//             }
//         } catch (error) {
//             console.error('Error fetching user:', error);
//             toast.error('Error fetching user data');
//         }
//     };

//     const addChat = async () => {
//         try {
//             const messagesRef = collection(db, 'messages');
//             const chatsRef = collection(db, 'chats');

//             // Create a new message document
//             const newMessageRef = doc(messagesRef);
//             await setDoc(newMessageRef, {
//                 createdAt: serverTimestamp(),
//                 messages: []
//             });

//             // Update both users' chat data
//             await updateDoc(doc(chatsRef, user.id), {
//                 chatsData: arrayUnion({
//                     messageId: newMessageRef.id,
//                     lastMessage: '',
//                     rId: userData.id,
//                     updatedAt: Date.now(),
//                     messageSeen: true
//                 })
//             });
//             await updateDoc(doc(chatsRef, userData.id), {
//                 chatsData: arrayUnion({
//                     messageId: newMessageRef.id,
//                     lastMessage: '',
//                     rId: user.id,
//                     updatedAt: Date.now(),
//                     messageSeen: true
//                 })
//             });

//             toast.success('Chat added successfully');
//         } catch (error) {
//             toast.error('Error adding chat: ' + error.message);
//             console.error('Error adding chat:', error);
//         }
//     };

//     const setChat = (item) => {
//         setMessagesId(item.messageId);
//         setChatUser(item) // Handle chat selection logic here
//     };

//     return (
//         <div className="ls">
//             <div className="ls-top">
//                 <div className="ls-nav">
//                     <img src={assets.logo} className="logo" alt="Logo" />
//                     <div className="menu">
//                         <img src={assets.menu_icon} alt="Menu Icon" />
//                         <div className="sub-menu">
//                             <p onClick={() => navigate('/profile')}>Edit Profile</p>
//                             <hr />
//                             <p>Logout</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="ls-search">
//                     <img src={assets.search_icon} alt="Search Icon" />
//                     <input onChange={inputHandler} type="text" placeholder="Search users" />
//                 </div>
//             </div>
//             <div className="ls-list">
//                 {showSearch && user ? (
//                     <div onClick={addChat} className="friends add-user">
//                         <img src={user.avatar} alt="User Avatar" />
//                         <p>{user.name}</p>
//                     </div>
//                 ) : (
//                     chatData && chatData.length > 0 ? (
//                         chatData.map((item, index) => (
//                             <div onClick={() => setChat(item)} key={index} className="friends">
//                                 <img src={item.userData.avatar} alt="Friend Avatar" />
//                                 <div>
//                                     <p>{item.userData.name}</p>
//                                     <span>{item.lastMessage}</span>
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <p>No chats available</p>
//                     )
//                 )}
//             </div>
//         </div>
//     );
// };

// export default LeftSidebar;

import React, { useContext, useEffect, useState } from 'react'
import './LeftSidebar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, arrayUnion, getDoc } from 'firebase/firestore' // Removed duplicate imports and added arrayUnion here
import { AppContext } from '../../context/AppContext'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify' // Fixed typo in toast import

const LeftSidebar = () => {

    const navigate = useNavigate();
    const { userData, chatData, chatUser, setChatUser, setMessagesId, messagesId, chatVisible, setChatVisible } = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                setShowSearch(true);
                const userRef = collection(db, "users");
                const q = query(userRef, where('username', '==', input.toLowerCase()));
                const querySnap = await getDocs(q);
                if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
                    let userExist = false;
                    chatData.map((user) => { // Mistake: used 'user' instead of 'chatUser' to avoid conflict with 'user' state
                        if (chatUser.rId === querySnap.docs[0].data().id) {
                            userExist = true;
                        }
                    });
                    if (!userExist) {
                        setUser(querySnap.docs[0].data());
                    }
                } else {
                    setUser(null);
                }
            } else {
                setShowSearch(false);
                setUser(null); // Mistake: reset user when the input is cleared
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }

    const addChat = async () => {
        const messagesRef = collection(db, "messages");
        const chatsRef = collection(db, "chats");
        try {
            const newMessageRef = doc(messagesRef);
            await setDoc(newMessageRef, {
                createdAt: serverTimestamp(), // Mistake: was 'createAt', changed to 'createdAt'
                messages: []
            })
            // Mistake: 'chatRef' was used instead of 'chatsRef'
            await updateDoc(doc(chatsRef, user.id), {
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })
            await updateDoc(doc(chatsRef, userData.id), {
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: user.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })
            const uSnap = await getDoc(doc(db, "users", user.id));
            const uData = uSnap.data();
            setChat({
                messagesId: newMessageRef.id,
                lastMessage: "",
                rId: user.id,
                updatedAt: Date.now(),
                messageSeen: true,
                userData: uData
            })
            setShowSearch(false)
            setChatVisible(true)
        } catch (error) {
            toast.error(error.message);
            console.error('Error adding chat:', error);
        }
    }

    const setChat = async (item) => {

        try {
            setMessagesId(item.messageId);
            setChatUser(item)
            const userChatsRef = doc(db, 'chats', userData.id);
            const userChatsSnapshot = await getDoc(userChatsRef);
            const userChatsData = userChatsSnapshot.data();
            const chatIndex = userChatsData.chatsData.findIndex((c) => c.messageId === item.messageId);
            userChatsData.chatsData[chatIndex].messageSeen = true;
            await updateDoc(userChatsRef, {
                chatsData: userChatsData.chatsData
            })
            setChatVisible(true);
        } catch (error) {
            toast.error(error.message)
        }

    }

    useEffect(() => {
        const updateChatUserData = async () => {
            if (chatUser) {
                const userRef = doc(db, "users", chatUser.userData.id);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                setChatUser(prev => ({ ...prev, userData: userData }))
            }
        }
        updateChatUserData();
    }, [chatData])
    return (


        <div className={`ls ${chatVisible ? "hidden" : ""}`}>
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo} className='logo' alt="Logo" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="Menu Icon" />
                        <div className="sub-menu">
                            <p onClick={() => navigate('/profile')}>Edit Profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="ls-search">
                    <img src={assets.search_icon} alt="Search Icon" />
                    <input onChange={inputHandler} type="text" placeholder="Search" />
                </div>
            </div>
            <div className="ls-list">
                {showSearch && user ? (
                    <div onClick={addChat} className='friends add-user'>
                        <img src={user.avatar} alt="User Avatar" />
                        <p>{user.name}</p>
                    </div>
                ) : (
                    chatData.map((item, index) => (
                        <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? "" : "border"}`}>
                            <img src={item.userData.avatar} alt="Friend Avatar" />
                            <div>
                                <p>{item.userData.name}</p>
                                <span>{item.lastMessage}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default LeftSidebar
