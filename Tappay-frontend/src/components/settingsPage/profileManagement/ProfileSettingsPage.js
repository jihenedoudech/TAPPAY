import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUserThunk } from "../../Redux/userSlice";
import styled from "styled-components";
import {
  Button,
  ButtonsGroup,
  PageContainer,
  PageHeader,
} from "../../../utils/BaseStyledComponents";
import Page from "../../common/Page";
import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/Key";
import StoreIcon from "@mui/icons-material/Store";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChangePassword from "./ChangePassword"; // Import the ChangePassword component
import { useNavigate } from "react-router-dom";

// Updated color scheme based on the sidebar
const colors = {
  primary: "#ff6b6b", // Main red color from the sidebar gradient
  secondary: "#ffffff", // White background for content sections
  hover: "#f94d71", // Lighter red for hover effects
  danger: "#e57373", // Red for error states (consistent with the warning colors)
};

const TabContainer = styled.div`
  display: flex;
  gap: 20px;
  margin: 20px 0;
`;

const Tab = styled.div`
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  background: ${({ active }) => (active ? colors.primary : colors.secondary)};
  color: ${({ active }) => (active ? colors.secondary : colors.primary)};
  font-weight: ${({ active }) => (active ? "bold" : "normal")};
  box-shadow: ${({ active }) =>
    active ? "0 4px 6px rgba(0, 0, 0, 0.2)" : "0 1px 3px rgba(0, 0, 0, 0.1)"};
  border: 1px solid ${colors.primary};

  &:hover {
    background: ${colors.hover};
    color: ${colors.secondary};
    transition: 0.3s ease;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InfoCard = styled.div`
  background: ${colors.secondary};
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const IconContainer = styled.div`
  background: ${colors.primary};
  color: ${colors.secondary};
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileSettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("personal");
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentUserThunk());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Profile Details</h2>
          <ButtonsGroup>
            <Button
              onClick={() =>
                navigate("/settings/profile-settings/edit-profile", {
                  state: { user: user },
                })
              }
            >
              <EditIcon />
              Edit Profile
            </Button>
            <Button onClick={() => setShowPasswordChange(true)}>
              <KeyIcon />
              Change Password
            </Button>
          </ButtonsGroup>
        </PageHeader>

        <TabContainer>
          <Tab
            active={activeTab === "personal"}
            onClick={() => setActiveTab("personal")}
          >
            Personal Info
          </Tab>
          <Tab
            active={activeTab === "stores"}
            onClick={() => setActiveTab("stores")}
          >
            Store Details
          </Tab>
          <Tab
            active={activeTab === "shifts"}
            onClick={() => setActiveTab("shifts")}
          >
            Shifts
          </Tab>
        </TabContainer>

        {activeTab === "personal" && (
          <InfoSection>
            <InfoCard>
              <span>Full Name</span>
              <span>
                {user?.firstName} {user?.lastName}
              </span>
            </InfoCard>
            <InfoCard>
              <span>Email</span>
              <span>{user?.email || "N/A"}</span>
            </InfoCard>
            <InfoCard>
              <span>Phone Number</span>
              <span>{user?.phoneNumber || "N/A"}</span>
            </InfoCard>
            <InfoCard>
              <span>Username</span>
              <span>{user?.username || "N/A"}</span>
            </InfoCard>
            <InfoCard>
              <span>Role</span>
              <span>{user?.role}</span>
            </InfoCard>
            <InfoCard>
              <span>Is Active</span>
              <span>{user?.isActive ? "Yes" : "No"}</span>
            </InfoCard>
            <InfoCard>
              <span>Created At</span>
              <span>{new Date(user?.createdAt).toLocaleString()}</span>
            </InfoCard>
            <InfoCard>
              <span>Updated At</span>
              <span>{new Date(user?.updatedAt).toLocaleString()}</span>
            </InfoCard>
            <InfoCard>
              <span>Address</span>
              <span>{user?.address || "N/A"}</span>
            </InfoCard>
          </InfoSection>
        )}

        {activeTab === "stores" && (
          <InfoSection>
            {user?.storeInUse ? (
              <InfoCard>
                <IconContainer>
                  <StoreIcon />
                </IconContainer>
                <div>
                  <strong>{user.storeInUse.name}</strong>
                  <p>{user.storeInUse.phoneNumber || "No phone number"}</p>
                  <p>{user.storeInUse.email || "No email"}</p>
                  <p>
                    Tax ID: {user.storeInUse.taxIdentificationNumber || "N/A"}
                  </p>
                  <p>
                    Operating Hours: {user.storeInUse.operatingHours || "N/A"}
                  </p>
                  <p>Currency: {user.storeInUse.currency || "N/A"}</p>
                  <p>
                    Payment Methods: {user.storeInUse.paymentMethods || "N/A"}
                  </p>
                  <p>
                    Warehouse Location:{" "}
                    {user.storeInUse.warehouseLocation || "N/A"}
                  </p>
                </div>
              </InfoCard>
            ) : (
              <div>No store assigned</div>
            )}
          </InfoSection>
        )}

        {activeTab === "shifts" && (
          <InfoSection>
            {user?.shifts?.map((shift) => (
              <InfoCard key={shift.id}>
                <IconContainer>
                  <AccessTimeIcon />
                </IconContainer>
                <div>
                  <strong>Status:</strong> {shift.status}
                  <p>
                    Start Time: {new Date(shift.startTime).toLocaleString()} |
                    Cash: ${shift.openingCashAmount}
                  </p>
                  <p>Total Amount: ${shift.totalAmount}</p>
                  <p>Total Sales: ${shift.totalSales}</p>
                  <p>Total Items: {shift.totalItems}</p>
                  <p>Total Discounts: ${shift.totalDiscounts}</p>
                  <p>Total Refunds: ${shift.totalRefunds}</p>
                  <p>Total Profit: ${shift.totalProfit}</p>
                  <p>Total Cost: ${shift.totalCost}</p>
                  <p>Total Transactions: {shift.totalTransactions}</p>
                </div>
              </InfoCard>
            ))}
          </InfoSection>
        )}

        {showPasswordChange && (
          <ChangePassword setShowPasswordChange={setShowPasswordChange} />
        )}
      </PageContainer>
    </Page>
  );
};

export default ProfileSettingsPage;
