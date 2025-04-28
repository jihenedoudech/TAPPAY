import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import {
  deleteInventoryThunk,
  fetchInventoriesThunk,
  setSelectedStoreId,
} from "../../Redux/inventorySlice";
import { useDispatch } from "react-redux";
import Loading from "../../common/Loading";
import Error from "../../common/Error";
import {
  TableWrapper,
  Table,
  AlertNotif,
} from "../../../utils/BaseStyledComponents";
import styled from "styled-components";
import { InventoryStatus } from "../../../utils/enums";
import { Fade, IconButton, Menu, MenuItem } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ContinueTab from "./ContinueTab";
import DeleteConfirmation from "../../common/DeleteConfirmation";

const Message = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #888;
`;

const StatusBadge = styled.span`
  padding: 5px 10px;
  border-radius: 5px;
  color: white;
  background-color: ${({ status }) =>
    status === InventoryStatus.COMPLETED
      ? "#28a745"
      : status === InventoryStatus.DRAFT
        ? "#ffc107"
        : "#ffc107"};
`;

const InventoryTable = () => {
  const dispatch = useDispatch();
  const { inventories, loading, error } = useSelector(
    (state) => state.inventory
  );
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showContinueTab, setShowContinueTab] = useState(false);
  const [alert, setAlert] = useState(null);
  const [deleteConfirmationFor, setDeleteConfirmationFor] = useState(null);

  useEffect(() => {
    dispatch(fetchInventoriesThunk());
  }, [dispatch]);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleContinue = (inventory) => {
    console.log("store id: ", inventory.store.id);
    dispatch(setSelectedStoreId(inventory.store.id));
    setSelectedInventory(inventory);
    setShowContinueTab(true);
  };

  const handleDelete = () => {
    setDeleteConfirmationFor();
  };

  const handleDeleteConfirmation = async () => {
    if (deleteConfirmationFor) {
      const response = await dispatch(deleteInventoryThunk(deleteConfirmationFor.id));
      if (deleteInventoryThunk.fulfilled.match(response)) {
        setDeleteConfirmationFor(null);
        setAlert({
          type: "success",
          message: "Inventory deleted successfully",
        });
        dispatch(fetchInventoriesThunk());
      } else {
        setAlert({
          type: "error",
          message: "Failed to delete inventory",
        });
      }
    }
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <>
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th>Store</th>
              <th>Status</th>
              <th>Satrted at</th>
              <th>Last update</th>
              <th>Expected Value</th>
              <th>Found Value</th>
              <th>Loss Value</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {inventories?.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  <Message>No inventories found</Message>
                </td>
              </tr>
            ) : (
              inventories?.map((inventory) => (
                <tr key={inventory.id}>
                  <td>{inventory.store?.name}</td>
                  <td>
                    <StatusBadge status={inventory.status}>
                      {inventory.status}
                    </StatusBadge>
                  </td>
                  <td>{inventory.createdAt.split("T")[0]}</td>
                  <td>{inventory.updatedAt.split("T")[0]}</td>
                  <td>{inventory.expectedValue}</td>
                  <td>{inventory.foundValue}</td>
                  <td>{inventory.lossValue}</td>
                  <td>
                    <IconButton
                      aria-label="more"
                      aria-controls={`menu-${inventory.id}`}
                      aria-haspopup="true"
                      onClick={(event) =>
                        setAnchorEl({
                          id: inventory.id,
                          anchorEl: event.currentTarget,
                        })
                      }
                    >
                      <MoreHorizIcon />
                    </IconButton>
                    <Menu
                      id={`menu-${inventory.id}`}
                      anchorEl={
                        anchorEl?.id === inventory.id
                          ? anchorEl?.anchorEl
                          : null
                      }
                      open={Boolean(anchorEl?.id === inventory.id)}
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() => {
                          handleContinue(inventory);
                          handleMenuClose();
                        }}
                      >
                        Continue
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setDeleteConfirmationFor(inventory);
                          handleMenuClose();
                        }}
                      >
                        Delete
                      </MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableWrapper>
      {showContinueTab && (
        <ContinueTab
          setShowContinueTab={setShowContinueTab}
          inventory={selectedInventory}
        />
      )}
      {deleteConfirmationFor && (
        <DeleteConfirmation
          itemName={'this inventory'}
          onCancel={() => setDeleteConfirmationFor(null)}
          onDelete={handleDeleteConfirmation}
        />
      )}
      <Fade in={alert}>
        <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
      </Fade>
    </>
  );
};

export default InventoryTable;
