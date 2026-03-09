import React from "react";

interface CameraStatusProps {
  status: "stopped" | "running";
}

const CameraStatus: React.FC<CameraStatusProps> = ({ status }) => {
  return (
    <span className="text-sm text-gray-600">
      Status: {status.toUpperCase()}
    </span>
  );
};

export default CameraStatus;