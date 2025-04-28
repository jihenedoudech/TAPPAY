import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserThunk, fetchCurrentUserThunk } from "../../Redux/userSlice";
import styled from "styled-components";
import {
  Button,
  PageContainer,
  PageHeader,
} from "../../../utils/BaseStyledComponents";
import Page from "../../common/Page";
import { TextField } from "@mui/material";

// Updated color scheme based on the sidebar
const colors = {
  primary: "#ff6b6b", // Main red color from the sidebar gradient
  secondary: "#ffffff", // White background for content sections
  hover: "#f94d71", // Lighter red for hover effects
  danger: "#e57373", // Red for error states (consistent with the warning colors)
};

const ProfileSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: ${colors.secondary};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ErrorText = styled.p`
  color: ${colors.danger};
  font-size: 14px;
  text-align: center;
`;

const EditProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    dispatch(fetchCurrentUserThunk());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
      setAddress(user.address || "");
    }
  }, [user]);

  const handleUpdateProfile = () => {
    const updatedUser = {
      id: user.id,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
    };
    dispatch(updateUserThunk(updatedUser)).then((response) => {
      if (response.type.includes("fulfilled")) {
        setAlert({
          type: "success",
          message: "Profile updated successfully!",
        });
      } else {
        setAlert({
          type: "error",
          message: "Failed to update profile!",
        });
      }
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Edit Profile</h2>
        </PageHeader>
        <ProfileSection>
          <TextField
            fullWidth
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            margin="normal"
            required
          />
          {alert && <ErrorText>{alert.message}</ErrorText>}
          <Button onClick={handleUpdateProfile}>Save Changes</Button>
        </ProfileSection>
      </PageContainer>
    </Page>
  );
};

export default EditProfilePage;
