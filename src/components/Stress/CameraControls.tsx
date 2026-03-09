import React, { useState, useEffect } from "react";
import CameraButtons from "./CameraButtons";
import CameraStatus from "./CameraStatus";
import stressClient from "../../services/stressClient";
import axios from "axios";
import { useAuth } from '../../hooks/useAuth';

interface Props {
  triggerPrompt: boolean;
}

const CameraControls: React.FC<Props> = ({ triggerPrompt }) => {
  const [cameraStatus, setCameraStatus] = useState<"stopped" | "running">("stopped");
  const [showPrompt, setShowPrompt] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (triggerPrompt) setShowPrompt(true);
  }, [triggerPrompt]);

  const checkStress = async (emotions: { emotion: string; confidence: number }[]) => {
    try {
      const response = await axios.post("http://localhost:5000/stress/check", {
        username: user?.username,
        emotions,
      });

      const isStressed = response.data.is_stressed;
      console.log("Stress check result:", response.data);

      // Set motivational feedback based on stress
      if (isStressed) {
        setFeedback("You seem stressed. Take a short break and try deep breathing!");
      } else {
        setFeedback("You look calm and focused. Keep up the great work!");
      }
    } catch (err) {
      console.error("Error checking stress:", err);
    }
  };

  const startCamera = async () => {
    try {
      await stressClient.get("/video_feed");
      setCameraStatus("running");
      console.log("Camera started");

      await stressClient.post("/save_data", {
        timestamp: new Date().toISOString(),
        username: user?._id,
      });
    } catch (err: any) {
      console.error("Error starting camera:", err.message);
    }
  };

  const stopCamera = async () => {
    try {
      await axios.get("http://localhost:5000/stress/stop");
      setCameraStatus("stopped");
      console.log("Camera stopped");

      // Example emotions - replace with real detected emotions
      const emotions = [
        { emotion: "happy", confidence: 0.9 },
        { emotion: "sad", confidence: 0.7 },
        { emotion: "neutral", confidence: 0.8 },
      ];

      await checkStress(emotions); // Check stress when stopping camera
    } catch (err: any) {
      console.error("Error stopping camera:", err.message);
    }
  };

  const handleStart = () => {
    startCamera();
    setShowPrompt(false);
    setFeedback(null); // clear previous feedback
  };

  const handleStop = () => {
    stopCamera();
    setShowPrompt(false);
  };

  return (
    <>
      {showPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Stress Detection
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Do you need to run the stress detection?
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleStart}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Yes, Start Camera
              </button>
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                No, Stop
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Stress Controls
        </h3>

        <div className="flex flex-col gap-4">
          <CameraButtons status={cameraStatus} onStart={startCamera} onStop={stopCamera} />
          <CameraStatus status={cameraStatus} />
          {feedback && (
            <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-lg">
              {feedback}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CameraControls;