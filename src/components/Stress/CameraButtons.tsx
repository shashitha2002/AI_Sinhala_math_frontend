import React from "react";

interface CameraButtonsProps {
  status: "stopped" | "running";
  onStart: () => void;
  onStop: () => void;
}

const CameraButtons: React.FC<CameraButtonsProps> = ({ status, onStart, onStop }) => {
  return (
    <div className="flex gap-4 items-center">
      <button
        onClick={onStart}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        disabled={status === "running"}
      >
        Start Camera
      </button>

      <button
        onClick={onStop}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        disabled={status === "stopped"}
      >
        Stop Camera
      </button>
    </div>
  );
};

export default CameraButtons;