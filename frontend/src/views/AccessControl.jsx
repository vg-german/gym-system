import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import api from '../services/api';

const AccessControl = () => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Look to the camera to enter');
  
 
  const statusRef = useRef('loading');
  const isProcessing = useRef(false);


  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const loadModelsAndStartVideo = async () => {
      try {
        setStatus('loading');
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('ready');
      } catch (err) {
        console.error("Error initializing video:", err);
        setMessage(`Error initializing AI: ${err.message}`);
        setStatus('error');
      }
    };

    loadModelsAndStartVideo();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  useEffect(() => {
    
    if (status === 'loading' || status === 'error') return;

    
    const interval = setInterval(async () => {
      if (
        isProcessing.current || 
        statusRef.current !== 'ready' || 
        !videoRef.current || 
        videoRef.current.paused || 
        videoRef.current.ended
      ) {
        return;
      }

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          isProcessing.current = true;
          setStatus('loading'); 
          setMessage('Verifying identity...');
          
          const embedding = Array.from(detection.descriptor);

          try {
            const response = await api.post('/members/verify-access', {
              face_embedding: embedding
            });

            const result = response.data;

            if (result.access === "Granted") {
              setStatus('granted');
              setMessage(`Welcome: ${result.message}`);
            } else {
              setStatus('denied');
              setMessage(`ACCESS DENIED: ${result.message}`);
            }

          } catch (apiErr) {
            setStatus('unknown');
            setMessage('Error connecting to server');
          }

          setTimeout(() => {
            setStatus('ready');
            setMessage('Look to the camera to enter');
            isProcessing.current = false;
          }, 5000);
        }
      } catch (error) {
        console.error("Error scanning:", error);
        isProcessing.current = false;
        setStatus('ready');
      }
    }, 250); 

    return () => clearInterval(interval);
  }, [status === 'ready']); 

  const getBackgroundClass = () => {
    switch (status) {
      case 'loading': return 'bg-[#151518] text-white';
      case 'ready': return 'bg-[#1b263b] text-white'; 
      case 'granted': return 'bg-emerald-600 text-white';
      case 'denied': return 'bg-rose-600 text-white';
      case 'unknown': return 'bg-amber-500 text-black';
      default: return 'bg-[#151518] text-white';
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 transition-colors duration-500 ${getBackgroundClass()}`}>
      
      {/* Main container */}
      <div className="w-full max-w-xl md:max-w-2xl landscape:max-w-5xl min-h-[80vh] landscape:min-h-[75vh] bg-[#151518] p-8 rounded-3xl shadow-2xl border border-white/10 flex flex-col landscape:flex-row gap-8 items-center justify-between transition-all duration-300">
        
        {/* Camera Section */}
        <div className="relative w-full landscape:w-1/2 aspect-[3/3] landscape:aspect-[3/4] rounded-2xl overflow-hidden bg-black shadow-inner flex-shrink-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform -scale-x-100"
          />

          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
          
        {/* Information Section */}
        <div className="w-full landscape:w-1/2 flex flex-col justify-center text-center landscape:text-left h-full py-4">
          <h1 className="text-2xl md:text-3xl font-black tracking-widest text-white mb-2 uppercase">
            Access Control
          </h1>
          
          <p className="text-xs font-bold tracking-widest mb-8 uppercase opacity-60">
            {status === 'loading' && <span className="text-amber-400">Initializing...</span>}
            {status === 'ready' && <span className="text-cyan-400">SYSTEM ONLINE - WAITING FOR FACE</span>}
            {status === 'granted' && <span className="text-green-400">Verified</span>}
            {status === 'denied' && <span className="text-red-400">Invalid</span>}
            {status === 'unknown' && <span className="text-yellow-400">Unknown</span>}
          </p>

          {/* Message Display */}
          <div className="min-h-[120px] flex items-center landscape:justify-start justify-center bg-white/5 rounded-2xl p-6 border border-white/5 shadow-inner">
            <p className={`text-2xl md:text-3xl font-black tracking-wide ${
              status === 'granted' ? 'text-green-400' : 
              status === 'denied' ? 'text-red-400' : 
              status === 'unknown' ? 'text-yellow-400' : 'text-white'
            }`}>
              {message}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AccessControl;