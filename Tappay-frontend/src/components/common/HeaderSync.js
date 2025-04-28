import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Logo from "./Logo";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUserThunk } from "../Redux/userSlice";
import { Button } from "../../utils/BaseStyledComponents";
import axiosInstance from "../../utils/axiosInstance";

// Styled Components
const Container = styled.div`
  margin: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
`;

const UserContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 15px;
  border-radius: 25px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background-color: #e0e0e0;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
`;

const UserName = styled.span`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ff6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
`;

const SyncButton = styled(Button)`
  margin: 0 15px; /* Space between Logo and UserContainer */
  background-color: ${(props) => (props.isOnline ? "#4caf50" : "#ccc")};
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.isOnline ? "#45a049" : "#ccc")};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const SyncStatus = styled.span`
  font-size: 14px;
  color: ${(props) => (props.error ? "#d32f2f" : "#388e3c")};
  margin-left: 10px;
`;

const Header = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUserThunk());
    }
  }, [user, dispatch]);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    setSyncStatus("Syncing...");
    try {
      const response = await axiosInstance.post("/turso-sync");
      if (response.data.success) {
        setSyncStatus("Sync successful!");
        // Optionally refresh data (e.g., transactions)
        dispatch(fetchCurrentUserThunk()); // Adjust to your data fetch action
      } else {
        setSyncStatus(`Sync failed: ${response.data.message}`);
      }
    } catch (error) {
      setSyncStatus(`Sync failed: ${error.message}`);
    }
    setIsSyncing(false);
    setTimeout(() => setSyncStatus(""), 3000); // Clear status after 3s
  };

  return (
    <Container>
      <Logo />
      <div style={{ display: "flex", alignItems: "center" }}>
        <SyncButton
          onClick={handleSync}
          disabled={!isOnline || isSyncing}
          isOnline={isOnline}
        >
          {isSyncing ? "Syncing..." : "Sync"}
        </SyncButton>
        {syncStatus && (
          <SyncStatus error={syncStatus.includes("failed")}>
            {syncStatus}
          </SyncStatus>
        )}
      </div>
      <UserContainer>
        <Avatar>{user ? user.username.charAt(0).toUpperCase() : "G"}</Avatar>
        <UserName>{user ? user.username : "Guest"}</UserName>
      </UserContainer>
    </Container>
  );
};

export default Header;
