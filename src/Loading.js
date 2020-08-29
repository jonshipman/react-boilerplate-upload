import React from "react";

const Loading = ({ color, ...props }) => {
  const style = {};
  if (color) {
    style.borderTopColor = color;
  }

  return (
    <span {...props}>
      <span className="lds-ring">
        {Array.from(new Array(3)).map(() => (
          <span key={Math.random()} style={style} />
        ))}
      </span>
    </span>
  );
};

export default Loading;
