import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePasswordThunk } from "../../Redux/userSlice";
import { Fade } from "@mui/material";
import { AlertNotif, Button, Input } from "../../../utils/BaseStyledComponents";
import styled from "styled-components";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Popup from "../../common/Popup";

const PasswordContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 10px;
  background: #ffffff;
  border-radius: 8px;
  position: relative;
`;

const ErrorText = styled.p`
  color: #e57373;
  font-size: 14px;
  text-align: center;
`;

const IconButton = styled.button`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
  width: 100%;
`;

const ChangePassword = ({ setShowPasswordChange }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [alert, setAlert] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    const response = await dispatch(
      changePasswordThunk({ id: user.id, currentPassword, newPassword })
    );
    console.log("response of change password: ", response);
    if (changePasswordThunk.fulfilled.match(response)) {
      setAlert({
        type: "success",
        message: "Password changed successfully!",
      });
      setShowPasswordChange(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    } else {
      setAlert({
        type: "error",
        message: response?.payload?.message || "Failed to change password!",
      });
    }

    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  const handleClose = () => {
    setShowPasswordChange(false);
  };

  return (
    <Popup title="Change Password" onClose={handleClose}>
      <PasswordContainer>
        <InputContainer>
          <Input
            type={showCurrentPassword ? "text" : "password"}
            placeholder="Old Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <IconButton
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </InputContainer>

        <InputContainer>
          <Input
            type={showNewPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </InputContainer>

        <InputContainer>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <IconButton
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </InputContainer>

        {passwordError && <ErrorText>{passwordError}</ErrorText>}
        <Button onClick={handlePasswordChange}>Change Password</Button>
      </PasswordContainer>
      <Fade in={alert !== null}>
        <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
      </Fade>
    </Popup>
  );
};

export default ChangePassword;
