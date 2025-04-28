import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { fetchUsersThunk, deleteUserThunk } from "../../Redux/userSlice";
import {
  AlertNotif,
  Button,
  PageContainer,
  PageHeader,
} from "../../../utils/BaseStyledComponents";
import Page from "../../common/Page";
import DeleteIcon from "@mui/icons-material/Delete";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import { theme } from "../../../theme";
import { Fade } from "@mui/material";

// Styled Components
const StyledUserList = styled.div`
  width: 100%;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StyledUserRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  border-radius: 10px;
  background: linear-gradient(145deg, #ffffff, #f0f0f3);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  }
`;

const UserDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const UserAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const UserName = styled.h4`
  margin: 0;
  font-size: 1.4rem;
  color: ${theme.colors.primaryDark};
  font-weight: 600;
`;

const UserDetailRow = styled.div`
  display: flex;
  gap: 5px;

  & > span:first-child {
    font-weight: bold;
    color: ${theme.colors.textPrimary};
  }

  & > span:last-child {
    color: ${theme.colors.textSecondary};
  }
`;

const UserStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: bold;
  color: ${({ isActive }) =>
    isActive ? theme.colors.success : theme.colors.error};
`;

const StoreList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const StoreTag = styled.div`
  background: ${theme.colors.primaryLight};
  color: ${theme.colors.primaryDark};
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 15px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  padding: 10px;
  transition: color 0.3s;

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const LoadingIndicator = () => (
  <div style={{ textAlign: "center", margin: "20px 0" }}>
    <CircularProgress  />
  </div>
);

const ErrorMessage = ({ error }) => (
  <div style={{ textAlign: "center", color: "red", margin: "20px 0" }}>
    Error: {error}
  </div>
);

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state) => state.user);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    dispatch(fetchUsersThunk());
  }, [dispatch]);

  const handleDeleteUser = async (userId) => {
    console.log("userId of delete user: ", userId);
    const response = await dispatch(deleteUserThunk(userId));
    console.log("response of delete user: ", response);
    if (response.type.includes("fulfilled")) {
      setAlert({
        type: "success",
        message: "User deleted successfully",
      });
      dispatch(fetchUsersThunk());
    } else {
      setAlert({
        type: "error",
        message: "Failed to delete user",
      });
    }
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Users Management</h2>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/settings/users-management/add-user")}
          >
            <AddIcon />
            Add User
          </Button>
        </PageHeader>

        <StyledUserList>
          {users.map((user) => (
            <StyledUserRow key={user.id}>
              <UserDetails>
                <UserAvatar>
                  {user.firstName
                    ? user.firstName.charAt(0).toUpperCase()
                    : user.username.charAt(0).toUpperCase()}
                  {user.lastName
                    ? user.lastName.charAt(0).toUpperCase()
                    : user.username.charAt(0).toUpperCase()}
                </UserAvatar>
                <UserInfo>
                  <UserName>
                    {user.firstName ? user.firstName : user.username}
                    {user.lastName && (
                      <>
                        <span>&nbsp;</span>
                        {user.lastName}
                      </>
                    )}
                  </UserName>
                  <UserDetailRow>
                    <span>Email:</span>
                    <span>{user.email || "N/A"}</span>
                  </UserDetailRow>
                  <UserDetailRow>
                    <span>Phone:</span>
                    <span>{user.phoneNumber || "N/A"}</span>
                  </UserDetailRow>
                  <UserStatus isActive={user.isActive}>
                    {user.isActive ? (
                      <>
                        <CheckCircleIcon /> Active
                      </>
                    ) : (
                      <>
                        <CancelIcon /> Inactive
                      </>
                    )}
                  </UserStatus>
                </UserInfo>
              </UserDetails>

              <StoreList>
                {user.assignedStores && user.assignedStores.length > 0 ? (
                  user.assignedStores.map((store) => (
                    <StoreTag key={store.id}>{store.name}</StoreTag>
                  ))
                ) : (
                  <StoreTag>No assigned stores</StoreTag>
                )}
              </StoreList>

              <ActionsContainer>
                {/* <Tooltip title="Send Email">
                  <ActionButton>
                    <EmailIcon />
                  </ActionButton>
                </Tooltip> */}
                <Tooltip title="Edit User">
                  <ActionButton
                    onClick={() =>
                      navigate(`/settings/users-management/edit-user`, {
                        state: { user: user },
                      })
                    }
                  >
                    <EditIcon />
                  </ActionButton>
                </Tooltip>
                <Tooltip title="Delete User">
                  <ActionButton onClick={() => handleDeleteUser(user.id)}>
                    <DeleteIcon />
                  </ActionButton>
                </Tooltip>
              </ActionsContainer>
            </StyledUserRow>
          ))}
        </StyledUserList>
        <Fade in={alert}>
          <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
        </Fade>
      </PageContainer>
    </Page>
  );
};

export default UsersPage;
