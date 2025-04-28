import React from "react";
import styled from "styled-components";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { theme } from "../../theme"; // Assuming you have this in a theme file

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5); // Dark overlay
  color: ${theme.colors.text}; // Dark gray for text
  z-index: 1;
`;

const Box = styled.div`
  background-color: ${theme.colors.cardBackground}; // Clean white for cards
  width: fit-content;
  border: solid ${theme.colors.primary} 1px; // Border with primary color
  border-radius: 8px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: ${theme.colors.primary}; // Main accent color for header
`;

const Title = styled.div`
  margin: auto;
  text-align: center;
  padding: 0 15px;
  font-size: 22px;
  font-weight: bold;
`;

const Icon = styled.div`
  cursor: pointer;
  transition: color 0.3s ease;
  padding-top: 5px;

  &:hover {
    color: ${theme.colors.secondary}; // Lighter accent on hover
  }
`;

const Popup = (props) => {
  return (
    <Container>
      <Box>
        <Header>
          <Title>{props.title}</Title>
          {props.onClose && (
            <Icon onClick={props.onClose}>
              <CloseOutlinedIcon />
            </Icon>
          )}
        </Header>
        {props.children}
      </Box>
    </Container>
  );
};

export default Popup;
