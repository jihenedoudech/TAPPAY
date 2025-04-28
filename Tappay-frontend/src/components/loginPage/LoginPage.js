import React, { useState } from "react";
import styled from "styled-components";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import tappayLogo from "../../assets/TAPPAY_LOGO.png";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../Redux/userSlice";
import { useNavigate } from "react-router-dom";

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to bottom right, #ff5a5a, #ff905a);
  position: relative;
  overflow: hidden;
`;

const FloatingCircle = styled.div`
  position: absolute;
  width: ${(props) => props.size || "200px"};
  height: ${(props) => props.size || "200px"};
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: ${(props) => props.top || "10%"};
  left: ${(props) => props.left || "10%"};
`;

const LoginBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), #fff);
  padding: 25px 35px;
  border-radius: 20px;
  box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.1);
  width: 350px;
  text-align: center;
  position: relative;
`;

const Logo = styled.img`
  width: 200px;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.1));
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50px;
  padding: 10px;
  margin: 10px 0;
  width: 100%;
`;

const Icon = styled.div`
  color: #ff5a5a;
  padding: 0 10px;
`;

const InputField = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: #333;
  width: 100%;
  font-size: 18px;
  padding: 10px;
  font-family: inherit;

  ::placeholder {
    color: rgba(0, 0, 0, 0.5);
  }
`;

const TogglePasswordIcon = styled.div`
  color: #ff5a5a;
  cursor: pointer;
  padding: 0 10px;
`;

const LoginButton = styled.button`
  width: 100%;
  margin-top: 15px;
  padding: 12px;
  font-size: 18px;
  color: white;
  font-weight: bold;
  background: linear-gradient(to right, #ff5a5a, #ff905a);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username && password) {
      const response = await dispatch(loginThunk({ username, password }));
      console.log("response: ", response);
      if (localStorage.getItem("token")) {
        navigate("/store-selection"); // Navigate to StoreSelectionPage after login
        setError("");
      } else {
        setError("Login failed. Please try again.");
      }
    } else {
      setError("Please enter both username and password.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <LoginContainer>
      {/* Floating Circles for Decorative Background */}
      <FloatingCircle size="300px" top="5%" left="5%" />
      <FloatingCircle size="200px" top="60%" left="80%" />
      <FloatingCircle size="150px" top="80%" left="10%" />

      <LoginBox>
        <Logo src={tappayLogo} alt="Tappay Logo" />
        {error && <div style={{ color: "red" }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <InputWrapper>
            <Icon>
              <PersonIcon />
            </Icon>
            <InputField
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-label="Username"
            />
          </InputWrapper>

          <InputWrapper>
            <Icon>
              <LockIcon />
            </Icon>
            <InputField
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
            />
            <TogglePasswordIcon onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </TogglePasswordIcon>
          </InputWrapper>

          <LoginButton type="submit">Login</LoginButton>
        </form>
      </LoginBox>
    </LoginContainer>
  );
};

export default LoginPage;
