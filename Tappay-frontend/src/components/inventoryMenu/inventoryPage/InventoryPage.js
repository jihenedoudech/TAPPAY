import React, { useEffect, useState } from "react";
import Page from "../../common/Page";
import {
  Button,
  PageContainer,
  PageHeader,
} from "../../../utils/BaseStyledComponents";
import InventoryTable from "./InventoryTable";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUserThunk } from "../../Redux/userSlice";
import Popup from "../../common/Popup";
import styled from "styled-components";

import { Storefront } from "@mui/icons-material"; // Import an icon for the store
import { setSelectedStoreId } from "../../Redux/inventorySlice";

const StoreItem = styled.div`
  background: linear-gradient(135deg, #ffffff, #f9f9f9); // Gradient background
  border: 1px solid #e0e0e0; // Subtle border
  border-radius: 8px; // Rounded corners
  padding: 15px; // Increased padding
  margin: 10px 0; // Adjusted margin
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px; // Space between icon and text
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); // Subtle shadow

  &:hover {
    transform: translateY(-3px); // Lift effect on hover
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); // Enhanced shadow on hover
    border-color: #ff6b6b; // Highlight border on hover
  }
`;

const StoreIcon = styled(Storefront)`
  color: #ff6b6b; // Icon color matching the theme
  font-size: 24px; // Icon size
`;

const StoreName = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #333; // Darker text for better readability
  transition: color 0.3s ease;

  ${StoreItem}:hover & {
    color: #ff6b6b; // Change text color on hover
  }
`;

const InventoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [showStoresList, setShowStoresList] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentUserThunk());
  }, [dispatch]);

  const openStoresList = () => {
    console.log("openStoresList");
    setShowStoresList(true);
  };

  const selectStore = (store) => {
    setShowStoresList(false);
    dispatch(setSelectedStoreId(store.id));
    navigate(`/inventory/inventories/add-inventory`);
  };

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Inventory Management</h2>
          <Button onClick={openStoresList}>
            <Add />
            New Inventory
          </Button>
        </PageHeader>
        <InventoryTable />
        {showStoresList && (
          <Popup
            title="Select a store"
            onClose={() => setShowStoresList(false)}
          >
            {user?.assignedStores?.map((store) => (
              <StoreItem key={store.id} onClick={() => selectStore(store)}>
                <StoreIcon /> {/* Add the store icon */}
                <StoreName>{store.name}</StoreName> {/* Add the store name */}
              </StoreItem>
            ))}
          </Popup>
        )}
      </PageContainer>
    </Page>
  );
};

export default InventoryPage;
