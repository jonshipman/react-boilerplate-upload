import React from "react";

const LoadingError = ({ error = "" }) => {
  return <>{`Error: ${error}`}</>;
};

export default LoadingError;
