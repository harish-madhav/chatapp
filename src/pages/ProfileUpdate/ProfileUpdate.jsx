// import React, { useContext, useEffect, useState } from 'react';
// import './ProfileUpdate.css';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth, db } from '../../config/firebase';
// import assets from '../../assets/assets';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import upload from '../../lib/upload';
// import { AppContext } from '../../context/AppContext';

// const ProfileUpdate = () => {
//   const navigate = useNavigate();
//   const [image, setImage] = useState(null); // Fixed the initial value to null
//   const [name, setName] = useState("");
//   const [bio, setBio] = useState("");
//   const [uid, setUid] = useState("");
//   const [prevImage, setPrevImage] = useState("");
//   const { setUserData } = useContext(AppContext);

//   const profileUpdate = async (event) => {
//     event.preventDefault();

//     try {
//       if (!prevImage && !image) {
//         toast.error("Please upload a profile picture");
//         return;
//       }

//       const docRef = doc(db, 'users', uid);

//       const updateData = {
//         name: name || '',  // Ensure name is not undefined
//         bio: bio || ''     // Ensure bio is not undefined
//       };

//       if (image) {
//         const imgUrl = await upload(image);
//         setPrevImage(imgUrl);
//         updateData.avatar = imgUrl; // Add avatar if image is uploaded
//       }

//       await updateDoc(docRef, updateData);

//       const snap = await getDoc(docRef);
//       setUserData(snap.data());
//       navigate('/chat');
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       toast.error(error.message);
//     }
//   };

//   useEffect(() => {
//     onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setUid(user.uid);
//         const docRef = doc(db, "users", user.uid);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           setName(data.name || '');
//           setBio(data.bio || '');
//           setPrevImage(data.avatar || '');
//         }
//       } else {
//         navigate('/');
//       }
//     });
//   }, [navigate]);

//   return (
//     <div className='profile'>
//       <div className="profile-container">
//         <form onSubmit={profileUpdate}>
//           <h3>Profile Details</h3>
//           <label htmlFor='avatar'>
//             <input
//               onChange={(e) => setImage(e.target.files[0])}
//               type='file' id='avatar'
//               accept='.png, .jpg, .jpeg' hidden
//             />
//             <img
//               src={image ? URL.createObjectURL(image) : prevImage || assets.avatar_icon}
//               alt='Profile'
//             />
//             Upload profile image
//           </label>
//           <input
//             onChange={(e) => setName(e.target.value)}
//             value={name}
//             type="text"
//             placeholder='Your name'
//             required
//           />
//           <textarea
//             onChange={(e) => setBio(e.target.value)}  // Corrected the value retrieval
//             value={bio}
//             placeholder='Write profile bio'
//             required
//           />
//           <button type='submit'>Save</button>
//         </form>
//         <img
//           className='profile-pic'
//           src={image ? URL.createObjectURL(image) : prevImage || assets.logo_icon}
//           alt='Profile'
//         />
//       </div>
//     </div>
//   );
// };

// export default ProfileUpdate;

import React, { useContext, useEffect, useState } from 'react';
import './ProfileUpdate.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import assets from '../../assets/assets';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import upload from '../../lib/upload';
import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const { setUserData } = useContext(AppContext);

  const profileUpdate = async (event) => {
    event.preventDefault();

    try {
      if (!prevImage && !image) {
        toast.error("Please upload a profile picture");
        return;
      }

      const docRef = doc(db, 'users', uid);

      const updateData = {
        name: name || '',
        bio: bio || ''
      };

      if (image) {
        const imgUrl = await upload(image);
        setPrevImage(imgUrl);
        updateData.avatar = imgUrl; // Add avatar if image is uploaded
      }

      // Update the user document in Firestore
      await updateDoc(docRef, updateData);

      // Fetch updated user data
      const snap = await getDoc(docRef);
      setUserData(snap.data()); // Update user data in context

      // Navigate to chat page
      navigate('/chat');
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    // Monitor authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setBio(data.bio || '');
          setPrevImage(data.avatar || '');
        }
      } else {
        navigate('/'); // Redirect to home if not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [navigate]);

  return (
    <div className='profile'>
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor='avatar'>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type='file'
              id='avatar'
              accept='.png, .jpg, .jpeg'
              hidden
            />
            <img
              src={image ? URL.createObjectURL(image) : prevImage || assets.avatar_icon}
              alt='Profile'
            />
            Upload profile image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder='Your name'
            required
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder='Write profile bio'
            required
          />
          <button type='submit'>Save</button>
        </form>
        <img
          className='profile-pic'
          src={image ? URL.createObjectURL(image) : prevImage || assets.logo_icon}
          alt='Profile'
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;

