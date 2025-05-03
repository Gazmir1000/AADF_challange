import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../utils/firebase';

const useFirebaseUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const uploadFile = async (file, folder = 'documents') => {
    if (!file) return null;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Create a unique filename with timestamp
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      // Upload the file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed', 
          (snapshot) => {
            // Track upload progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            // Handle errors
            setIsUploading(false);
            setError(error.message);
            reject(error);
          },
          async () => {
            // Upload completed successfully
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadedUrls(prev => [...prev, downloadURL]);
            setIsUploading(false);
            setUploadProgress(0);
            resolve(downloadURL);
          }
        );
      });
    } catch (err) {
      setIsUploading(false);
      setError(err.message);
      return null;
    }
  };

  const deleteFile = async (fileUrl) => {
    if (!fileUrl) return;
    
    try {
      // Extract the file path from the URL
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
      
      // Remove the URL from the uploadedUrls state
      setUploadedUrls(prev => prev.filter(url => url !== fileUrl));
    } catch (err) {
      setError(err.message);
    }
  };

  const clearUploads = () => {
    setUploadedUrls([]);
    setUploadProgress(0);
    setError(null);
  };

  return {
    uploadFile,
    deleteFile,
    clearUploads,
    uploadProgress,
    isUploading,
    error,
    uploadedUrls
  };
};

export default useFirebaseUpload; 