import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  TableWrapper,
  Table,
  AlertNotif,
} from "../../../utils/BaseStyledComponents";
import {
  fetchStockMovementsThunk,
  undoStockMovementThunk,
} from "../../Redux/stockMovementSlice";
import DetailsUndoMenu from "../../common/DetailsUndoMenu";
import { useNavigate } from "react-router-dom";
import { Fade } from "@mui/material";

const StockMovementTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stockMovements = useSelector(
    (state) => state.stockMovement.stockMovements
  );
  const [alert, setAlert] = useState(null);
  useEffect(() => {
    dispatch(fetchStockMovementsThunk());
  }, [dispatch]);

  console.log("stockMovements: ", stockMovements);

  const handleViewDetails = (stockMovement) => {
    navigate("/inventory/stock-movements/stock-movement-details", {
      state: {
        stockMovement: stockMovement,
      },
    });
  };

  const handleUndoStockMovement = async (stockMovement) => {
    const response = await dispatch(undoStockMovementThunk(stockMovement.id));
    if (response.type.includes("fulfilled")) {
      setAlert({
        type: "success",
        message: "Stock movement undone successfully",
      });
    } else {
      setAlert({
        type: "error",
        message: "Failed to undo stock movement",
      });
    }
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <th>From Store</th>
            <th>To Store</th>
            <th>Items</th>
            <th>Quantity</th>
            <th>Movement Date</th>
            <th>Affected by</th>
            <th>Notes</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {stockMovements?.map((stockMovement, index) => (
            <tr key={index}>
              <td>{stockMovement.fromStore.name}</td>
              <td>{stockMovement.toStore.name}</td>
              <td>
                {stockMovement.items
                  ?.map((item) => item.product?.productDetails?.name)
                  .join(", ")}
              </td>
              <td>
                {stockMovement.items?.map((item) => item.quantity).join(", ")}
              </td>
              <td>
                {new Date(stockMovement.movementDate).toLocaleDateString()}
              </td>
              <td>{stockMovement.createdBy?.username || "N/A"}</td>
              <td>{stockMovement.notes || "N/A"}</td>
              <td>
                <DetailsUndoMenu
                  selectedItem={stockMovement}
                  handleViewDetails={handleViewDetails}
                  handleUndo={handleUndoStockMovement}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Fade in={alert}>
        <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
      </Fade>
    </TableWrapper>
  );
};

export default StockMovementTable;
