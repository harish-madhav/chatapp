import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const upload = async (file) => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${Date.now() + file.name}`);  // Fixed template literal

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                // Handle unsuccessful uploads
                console.error("Upload failed:", error);
                reject(error);  // Reject the promise with the error
            },
            () => {
                // Handle successful uploads on complete
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);  // Resolve the promise with the download URL
                }).catch((error) => {
                    console.error("Error getting download URL:", error);
                    reject(error);  // Handle error in fetching the download URL
                });
            }
        );
    });
}

export default upload;
