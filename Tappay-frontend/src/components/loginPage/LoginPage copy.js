import React from "react";
import styled from "styled-components";
import LockIcon from "@mui/icons-material/Lock";
import tappayLogo from "../../assets/TAPPAY_LOGO.png";

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #f8f9fa;
`;

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${tappayLogo});
  background-repeat: repeat;
  background-size: 20%;
  opacity: 0.3;
  z-index: 0;
`;

const LoginBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.2);
  width: 350px;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const Greeting = styled.h2`
  font-size: 26px;
  color: #ff5f57;
  font-weight: 700;
  margin-bottom: 10px;
`;

const Message = styled.div`
  font-size: 18px;
  color: #333;
  line-height: 1.6;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 15px 0;
  position: relative;
  width: 100%;
`;

const Icon = styled.div`
  color: #ff905a;
  padding-right: 10px;
  z-index: 2;
`;

const InputField = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: #333;
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  font-family: inherit;
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  transition: border-color 0.3s ease;

  ::placeholder {
    color: rgba(0, 0, 0, 0.5);
  }

  &:focus {
    border-bottom: 2px solid #ff5f57;
  }
`;

const EnterButton = styled.button`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  color: #ffffff;
  font-weight: bold;
  background: linear-gradient(135deg, #ff5f57, #ff905a);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;

  &:hover {
    background: linear-gradient(135deg, #ff905a, #ff5f57);
    transform: scale(1.03);
  }
`;

const BottomMessage = styled.div`
  font-size: 20px;
  color: #666;
  margin-top: 25px;
  line-height: 1.4;
  font-weight: 500;
`;

const LoginPage = () => {
  const username = "Rim"; // Prefilled username for the cashier

  const handleLogin = () => {
    alert("Access granted, have a great day!");
  };

  return (
    <LoginContainer>
      {/* Background pattern with Tappay logo */}
      <BackgroundPattern />

      <LoginBox>
        <Greeting>Hello, {username}!</Greeting>

        {/* First part of the message */}
        <Message>Please enter your password to start your shift.</Message>

        <InputWrapper>
          <Icon>
            <LockIcon />
          </Icon>
          <InputField type="password" placeholder="Password" />
        </InputWrapper>

        <EnterButton onClick={handleLogin}>Proceed</EnterButton>

        {/* Second part of the message */}
        <BottomMessage>Wishing you a successful day ahead!</BottomMessage>
      </LoginBox>
    </LoginContainer>
  );
};

export default LoginPage;
