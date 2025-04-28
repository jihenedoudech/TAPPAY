import React, { useState } from "react";
import Page from "../../common/Page";
import PurchaseTable from "./PurchaseTable";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import {
  PageContainer,
  PageHeader,
  Button,
  ButtonsGroup,
} from "../../../utils/BaseStyledComponents";
import styled from "styled-components";

const DisplayButton = styled(Button)`
  font-weight: bold;
  background-color: white;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(255, 107, 107, 1);
  &:hover {
    background-color: white;
  }
`;

const PurchasePage = () => {
  const navigate = useNavigate();
  const [selectedPurchases, setSelectedPurchases] = useState([]);

  const handleAddPurchase = () => {
    navigate("/inventory/purchases-invoices/add-purchase-record");
  };

  const calculateTotalCost = () => {
    return selectedPurchases.reduce(
      (total, purchase) => total + purchase.total,
      0
    );
  };

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Purchase Management</h2>
          <ButtonsGroup>
            <DisplayButton>
              Total Selected: ${calculateTotalCost().toFixed(2)}
            </DisplayButton>
            <Button onClick={handleAddPurchase}>
              <AddIcon />
              New Purchase
            </Button>
          </ButtonsGroup>
        </PageHeader>
        <PurchaseTable
          selectedPurchases={selectedPurchases}
          setSelectedPurchases={setSelectedPurchases}
        />
      </PageContainer>
    </Page>
  );
};

export default PurchasePage;
