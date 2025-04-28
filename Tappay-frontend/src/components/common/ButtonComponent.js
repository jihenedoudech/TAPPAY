import React from "react";
import styled from "styled-components";

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 20px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  padding: 4px 8px;
  font-size: 16px;
  text-decoration: none;
`;

const ButtonComponent = ({ title, icon, handleClick }) => {
  return (
    <Button onClick={handleClick}>
      {title}
      {icon}
    </Button>
  );
};

export default ButtonComponent;
