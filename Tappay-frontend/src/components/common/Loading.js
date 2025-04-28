import React from "react";
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.8);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
`;

const Loader = styled.div`
  border: 8px solid rgba(255, 107, 107, 0.3);
  border-top: 8px solid #ff6b6b;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 1s linear infinite;
`;

const Loading = () => {
  return (
    <LoaderContainer>
      <Loader />
    </LoaderContainer>
  );
};

export default Loading;
