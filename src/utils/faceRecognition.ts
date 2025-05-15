
// A simple utility for face recognition
// In production, you'd use a more sophisticated solution like face-api.js or AWS Rekognition

/**
 * Compares two face images and returns a similarity score
 * @param currentFace The current face image as a data URL
 * @param storedFace The stored face image as a data URL
 * @returns A promise that resolves to a similarity score between 0 and 1
 */
export const compareFaces = async (
  currentFace: string,
  storedFace: string
): Promise<number> => {
  // In a real application, this would use an actual facial recognition API
  // For demo purposes, we'll simulate a comparison with a random score biased towards success
  
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // For demo, generate a similarity score between 0.6 and 1.0 (biased towards success)
      // In a real app, this would be the result of actual face comparison
      const similarityScore = 0.6 + Math.random() * 0.4;
      resolve(similarityScore);
    }, 1500);
  });
};

/**
 * Captures an image from the webcam
 * @returns A promise that resolves to the captured image as a data URL
 */
export const captureFromWebcam = async (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create video element to display the stream
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Wait for video to be ready
      video.onloadedmetadata = () => {
        // Create a canvas element to capture the frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to the canvas
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Stop all video tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg');
        resolve(dataUrl);
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Checks if the facial recognition is valid based on similarity score
 * @param similarityScore The similarity score between two faces
 * @returns Whether the face is considered matched
 */
export const isFaceMatched = (similarityScore: number): boolean => {
  // Threshold for considering a face match
  const FACE_MATCH_THRESHOLD = 0.75; 
  return similarityScore >= FACE_MATCH_THRESHOLD;
};
