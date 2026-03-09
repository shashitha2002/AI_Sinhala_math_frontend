import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import { stressService } from '../../services/stressService';
import { useAuth } from '../../hooks/useAuth';

interface EmotionData {
  emotion?: string;
  confidence?: number;
  faces_detected?: number;
}

interface StressIndicatorProps {}

const StressIndicator: React.FC<StressIndicatorProps> = () => {
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [status, setStatus] = useState("stopped");

  const { user } = useAuth();
  const username = user?.username;
  const email = user?.email;

  useEffect(() => {
    if (!username || !email) return;

    startDetection();

    const interval = setInterval(fetchStatus, 5000);

    return () => {
      clearInterval(interval);
      stopDetection();
    };
  }, [username, email]);

  const startDetection = async () => {
    if (!username || !email) return;

    try {
      const data = await stressService.start(username, email);
      if (data?.success) {
        setStatus("running");
      }
    } catch (error) {
      console.error("Error starting detection:", error);
    }
  };

  const stopDetection = async () => {
    try {
      await stressService.stop(username);
      setStatus("stopped");
    } catch (error) {
      console.error("Error stopping detection:", error);
    }
  };

  const fetchStatus = async () => {
    try {
      const data = await stressService.status(username);

      if (!data) return;

      setStatus(data.status || "stopped");

      if (data.emotion) {
        setEmotionData({
          emotion: data.emotion,
          confidence: data.confidence,
          faces_detected: data.faces_detected
        });
      }

    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  if (!emotionData) {
    return (
      <div className="fixed bottom-6 right-6 bg-white shadow-lg rounded-xl p-4 border">
        <p className="text-sm text-gray-600">Waiting for emotion data...</p>
      </div>
    );
  }

  const emotion = emotionData.emotion || "neutral";
  const confidence = emotionData.confidence || 0;

  const isStress =
    emotion === "angry" ||
    emotion === "fear" ||
    emotion === "sad";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

      {showDetails && (
        <div className="mb-4 bg-white rounded-xl shadow-xl p-4 w-72 border">

          <div className="flex justify-between mb-3">
            <h3 className="font-semibold">Emotion Status</h3>
            <button onClick={() => setShowDetails(false)}>✕</button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <p className="font-medium">Emotion</p>
              <p>{emotion}</p>
            </div>

            <div className="bg-gray-50 p-2 rounded">
              <p className="font-medium">Confidence</p>
              <p>{Math.round(confidence)}%</p>
            </div>

            <div className="bg-gray-50 p-2 rounded">
              <p className="font-medium">Faces</p>
              <p>{emotionData.faces_detected ?? 0}</p>
            </div>

            <div className="bg-gray-50 p-2 rounded">
              <p className="font-medium">Status</p>
              <p>{status}</p>
            </div>
          </div>

        </div>
      )}

      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg
        ${isStress
          ? 'bg-red-100 text-red-700 ring-2 ring-red-400'
          : 'bg-green-100 text-green-700 ring-2 ring-green-400'
        }`}
      >
        {isStress ? (
          <ExclamationTriangleIcon className="h-5 w-5 animate-pulse" />
        ) : (
          <FaceSmileIcon className="h-5 w-5" />
        )}

        <span className="font-bold">{Math.round(confidence)}%</span>

        {!showDetails && (
          <span className="text-xs hidden sm:inline">
            {emotion}
          </span>
        )}
      </button>
    </div>
  );
};

export default StressIndicator;