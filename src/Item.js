import React, { useState, useEffect } from "react";

const calcTimeLeft = (file) => {
  const ttd = file.timeCurrent - file.timeStarted;
  const uploadSpeed = file.uploaded / (ttd / 1000);

  if (uploadSpeed > 0) {
    const tl = Math.round((file.size - file.uploaded) / uploadSpeed);
    return new Date(tl * 1000).toISOString().substr(11, 8);
  }

  return 0;
};

export const Item = ({
  file,
  loadingComponent: Load,
  loadingErrorComponent: Error,
  previewAltImages = {},
  progressBarClassName,
}) => {
  const [className, setClassname] = useState("bg-moon-gray");

  useEffect(() => {
    let timeout = setTimeout(() => {
      if (!file.loading) {
        setClassname("bg-white");
      }
    }, 2500);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [setClassname, file]);

  const timeLeft = calcTimeLeft(file);

  let preview = file.preview;

  // Allows the developer to specify alternative images, like a PDF or DOC thumbnail icon
  Object.keys(previewAltImages).forEach((key) => {
    if (key === file.type) {
      preview = previewAltImages[key];
    }
  });

  return (
    <div
      className={`bg-animate relative z-1 flex flex-wrap flex-nowrap-l items-center ${className}`}
    >
      <div
        className="w3 h3 bg-center cover relative z-2 ma2 bg-gray"
        style={{ backgroundImage: `url(${preview})` }}
      />
      <div className="black relative z-2">{file.name}</div>
      {file.loading && file.progress > 99 && (
        <div className="relative z-2 ma2">
          <Load color="#fff" />
        </div>
      )}
      {file.error && (
        <div className="relative z-2 ma2 black">
          <Error error={file.error} />
        </div>
      )}
      {!file.loading && !file.error && (
        <div className="relative z-2 mt2 mr2 mb2 white ml-auto">Done!</div>
      )}
      {timeLeft && (
        <div className="black ma2 relative z-2 ml-auto">
          {timeLeft} remaining
        </div>
      )}
      {(file.loading || file.error) && (
        <div
          className={`absolute z-1 top-0 bottom-0 left-0 w-100 ${
            file.error ? "bg-red" : progressBarClassName
          }`}
          style={{ width: `${file.progress}%` }}
        />
      )}
    </div>
  );
};
