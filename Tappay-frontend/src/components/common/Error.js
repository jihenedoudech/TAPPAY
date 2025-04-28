import React from "react";
import styled from "styled-components";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.8);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  color: #ff6b6b;
`;

const ErrorMessage = styled.h2`
  font-size: 24px;
  margin-top: 20px;
`;

const Error = ({ message }) => {
  return (
    <ErrorContainer>
      <ErrorOutlineIcon style={{ fontSize: 60 }} />
      <ErrorMessage>{message}</ErrorMessage>
    </ErrorContainer>
  );
};

export default Error;
