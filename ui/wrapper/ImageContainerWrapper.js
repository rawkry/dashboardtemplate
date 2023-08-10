import React from "react";
import { Card } from "react-bootstrap";

const ImageContainerWrapper = ({ children }) => {
  return (
    <Card
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
        marginBottom: "1rem",
      }}
    >
      {children}
    </Card>
  );
};

export default ImageContainerWrapper;
