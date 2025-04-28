import React, { useEffect } from "react";
import Page from "../../common/Page";
import StockMovementTable from "./StockMovementTable";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import {
  PageContainer,
  PageHeader,
  Button,
} from "../../../utils/BaseStyledComponents";
import { useDispatch } from "react-redux";
import { fetchStockMovementsThunk } from "../../Redux/stockMovementSlice";

const StockMovementPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchStockMovementsThunk());
  }, [dispatch]);

  const handleAddStockMovement = () => {
    navigate("/inventory/select-products", {
      state: {
        title: "Select Products To Move",
        nextRoute: "/inventory/stock-movements/add-stock-movement",
        key: "StockMovements"
      },
    });
  };

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Stock Movement Management</h2>
          <Button onClick={handleAddStockMovement}>
            <AddIcon />
            New Stock Movement
          </Button>
        </PageHeader>
        <StockMovementTable />
      </PageContainer>
    </Page>
  );
};

export default StockMovementPage;
