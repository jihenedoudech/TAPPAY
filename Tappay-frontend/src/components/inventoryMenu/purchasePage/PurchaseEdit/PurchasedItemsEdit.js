import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../../../theme";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  InputBox,
  Table,
  TableWrapper,
  AlertNotif,
} from "../../../../utils/BaseStyledComponents";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUserThunk } from "../../../Redux/userSlice";
import { CircularProgress, Fade } from "@mui/material";
import { updatePurchaseItemThunk } from "../../../Redux/purchaseSlice";
import { removeNullValues } from "../../../../utils/utilsFunctions";
import { useLocation } from "react-router-dom";

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: ${theme.colors.primary};

  &:hover {
    color: ${theme.colors.primaryDark};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TotalContainer = styled.div`
  margin-top: 16px;
  padding: 12px;
  background-color: ${theme.colors.lightGrey};
  border-radius: 8px;
  font-weight: 600;
  text-align: right;
`;

const StoreQuantityInput = styled(InputBox)`
  width: 80px;
  margin-left: 8px;
`;

const StoreQuantityContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StoreQuantityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CurrentQuantityLabel = styled.span`
  font-size: 0.9em;
  color: ${theme.colors.grey};
`;

const QuantityContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TableRow = styled.tr`
  background-color: ${({ isFocus }) =>
    isFocus ? "rgba(255, 255, 0, 0.3)" : "transparent"};
`;

const PurchasedItemsEdit = ({ purchasedItems }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const purchaseItemId = location.state?.purchaseItemId;
  const user = useSelector((state) => state.user.user);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editedItems, setEditedItems] = useState(purchasedItems);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUserThunk());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (purchaseItemId) {
      const element = document.getElementById(
        `purchase-item-${purchaseItemId}`
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [purchaseItemId]);

  const handleEditClick = (id) => {
    setEditingRowId(id);
  };

  const validateQuantities = (item) => {
    const totalStoreQuantity = item.purchaseItemStores.reduce(
      (total, store) => total + parseFloat(store.quantity),
      0
    );

    if (totalStoreQuantity > parseFloat(item.quantity)) {
      setAlert({
        message: `Exceeded quantity for ${item.productDetails.name} in stores.`,
        type: "error",
      });
      return false;
    } else if (totalStoreQuantity < parseFloat(item.quantity)) {
      setAlert({
        message: `Insufficient quantity for ${item.productDetails.name} in stores.`,
        type: "error",
      });
      return false;
    }
    setTimeout(() => {
      setAlert(null);
    }, 3000);
    return true;
  };

  const handleSaveClick = async (id) => {
    if (isLoading) return;
    setIsLoading(true);
    const itemToUpdate = editedItems.find((item) => item.id === id);
    if (!validateQuantities(itemToUpdate)) {
      setIsLoading(false);
      return;
    }
    try {
      console.log("itemToUpdate: ", itemToUpdate);
      const { productDetails, ...purchaseItemData } = removeNullValues({
        quantity: itemToUpdate.quantity,
        priceExclTax: itemToUpdate.priceExclTax,
        tax: itemToUpdate.tax,
        priceInclTax: itemToUpdate.priceInclTax,
        total: itemToUpdate.total,
        stores: itemToUpdate.purchaseItemStores
          .filter((store) => store.quantity > 0)
          .map((store) => ({
            id: store.id,
            storeId: store.store.id,
            quantity: store.quantity,
          })),
      });
      console.log("purchaseItemData: ", purchaseItemData);
      const response = await dispatch(
        updatePurchaseItemThunk({ id, purchaseItemData })
      );
      if (response.type.includes("fulfilled")) {
        setAlert({
          message: `Successfully updated ${itemToUpdate.productDetails.name}.`,
          type: "success",
        });
      }
      setEditingRowId(null);
    } catch (error) {
      setAlert({
        message: `Failed to update ${itemToUpdate.productDetails.name}.`,
        type: "error",
      });
    }
    setIsLoading(false);
  };

  const handleCancelClick = (id) => {
    setEditedItems((prev) =>
      prev.map((item) =>
        item.id === id ? purchasedItems.find((i) => i.id === id) : item
      )
    );
    setEditingRowId(null);
  };

  const handleChange = (e, id, field, storeId = null) => {
    const { value } = e.target;
    setEditedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (storeId) {
            // Update store quantity
            return {
              ...item,
              purchaseItemStores: item.purchaseItemStores.map((store) =>
                store.id === storeId
                  ? { ...store, quantity: parseFloat(value) }
                  : store
              ),
            };
          } else {
            // Update overall quantity or price
            const updatedItem = { ...item, [field]: parseFloat(value) };
            if (field === "quantity") {
              updatedItem.total =
                updatedItem.quantity * updatedItem.priceInclTax;
            } else if (field === "priceInclTax") {
              updatedItem.priceExclTax =
                updatedItem.priceInclTax / (1 + updatedItem.tax / 100);
              updatedItem.total =
                updatedItem.quantity * updatedItem.priceInclTax;
            } else if (field === "tax") {
              updatedItem.priceInclTax =
                updatedItem.priceExclTax * (1 + updatedItem.tax / 100);
              updatedItem.total =
                updatedItem.quantity * updatedItem.priceInclTax;
            } else if (field === "priceExclTax") {
              updatedItem.priceInclTax =
                updatedItem.priceExclTax * (1 + updatedItem.tax / 100);
              updatedItem.total =
                updatedItem.quantity * updatedItem.priceInclTax;
            }
            return updatedItem;
          }
        }
        return item;
      })
    );
  };

  const handleNewStoreQuantityChange = (e, id, storeId) => {
    const { value } = e.target;
    setEditedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const storeExists = item.purchaseItemStores.some(
            (store) => store.store.id === storeId
          );
          if (!storeExists) {
            // Add new store with quantity
            const newStore = {
              id: null, // Temporary ID for new store
              quantity: parseFloat(value),
              store: user.assignedStores.find((store) => store.id === storeId),
            };
            return {
              ...item,
              purchaseItemStores: [...item.purchaseItemStores, newStore],
            };
          } else {
            // Update existing store quantity
            return {
              ...item,
              purchaseItemStores: item.purchaseItemStores.map((store) =>
                store.store.id === storeId
                  ? { ...store, quantity: parseFloat(value) }
                  : store
              ),
            };
          }
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return editedItems
      .reduce((total, item) => total + item.total, 0)
      .toFixed(2);
  };

  return (
    <>
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price (Excl. Tax)</th>
              <th>Tax</th>
              <th>Price (Incl. Tax)</th>
              <th>Total</th>
              <th>Stores</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {editedItems.map((item) => (
              <TableRow
                key={item.id}
                id={`purchase-item-${item.id}`}
                isFocus={purchaseItemId === item.id}
              >
                <td>
                  {item.productDetails.name} ({item.productDetails.reference})
                </td>
                <td>
                  <QuantityContainer>
                    {editingRowId === item.id ? (
                      <InputBox
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleChange(e, item.id, "quantity")}
                      />
                    ) : (
                      item.quantity
                    )}
                    <CurrentQuantityLabel>
                      (Current: {item.currentQuantities.totalCurrentQuantity})
                    </CurrentQuantityLabel>
                  </QuantityContainer>
                </td>
                <td>
                  {editingRowId === item.id ? (
                    <InputBox
                      type="number"
                      value={item.priceExclTax}
                      onChange={(e) => handleChange(e, item.id, "priceExclTax")}
                    />
                  ) : (
                    item.priceExclTax
                  )}
                </td>
                <td>
                  {editingRowId === item.id ? (
                    <InputBox
                      type="number"
                      value={item.tax}
                      onChange={(e) => handleChange(e, item.id, "tax")}
                    />
                  ) : (
                    item.tax
                  )}
                </td>
                <td>
                  {editingRowId === item.id ? (
                    <InputBox
                      type="number"
                      value={item.priceInclTax}
                      onChange={(e) => handleChange(e, item.id, "priceInclTax")}
                    />
                  ) : (
                    item.priceInclTax
                  )}
                </td>
                <td>{item.total.toFixed(2)}</td>
                <td>
                  <StoreQuantityContainer>
                    {editingRowId === item.id
                      ? // Show all assigned stores in editing mode
                        user?.assignedStores.map((store) => {
                          const storeData = item.purchaseItemStores.find(
                            (s) => s.store.id === store.id
                          );
                          const quantity = storeData ? storeData.quantity : 0;
                          const currentQuantity =
                            item.currentQuantities.storeQuantities[store.id]
                              ?.currentStock || 0;
                          return (
                            <StoreQuantityRow key={store.id}>
                              <span>{store.name}: </span>
                              <StoreQuantityInput
                                type="number"
                                value={quantity}
                                onChange={(e) =>
                                  handleNewStoreQuantityChange(
                                    e,
                                    item.id,
                                    store.id
                                  )
                                }
                              />
                              <CurrentQuantityLabel>
                                (Current: {currentQuantity})
                              </CurrentQuantityLabel>
                            </StoreQuantityRow>
                          );
                        })
                      : // Show only stores affected by the purchase in non-editing mode
                        item.purchaseItemStores
                          .filter((store) => store.quantity > 0)
                          .map((store) => {
                            const currentQuantity =
                              item.currentQuantities.storeQuantities[
                                store.store.id
                              ]?.currentStock || 0;
                            return (
                              <StoreQuantityRow key={store.id}>
                                <span>{store.store.name}: </span>
                                {store.quantity}
                                <CurrentQuantityLabel>
                                  (Current: {currentQuantity})
                                </CurrentQuantityLabel>
                              </StoreQuantityRow>
                            );
                          })}
                  </StoreQuantityContainer>
                </td>
                <td>
                  {editingRowId === item.id ? (
                    isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <ActionButtons>
                        <IconButton onClick={() => handleSaveClick(item.id)}>
                          <CheckOutlinedIcon />
                        </IconButton>
                        <IconButton onClick={() => handleCancelClick(item.id)}>
                          <CloseOutlinedIcon />
                        </IconButton>
                      </ActionButtons>
                    )
                  ) : (
                    <IconButton onClick={() => handleEditClick(item.id)}>
                      <EditOutlinedIcon />
                    </IconButton>
                  )}
                </td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
      <TotalContainer>Total: ${calculateTotal()}</TotalContainer>
      <Fade in={alert}>
        <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
      </Fade>
    </>
  );
};

export default PurchasedItemsEdit;
