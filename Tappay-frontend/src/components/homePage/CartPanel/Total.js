import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { createOrderThunk, resetCurrentOrder, setOrderNumber, updateOrderThunk } from "../../Redux/orderSlice";
import { Fade, CircularProgress } from "@mui/material";
import { AlertNotif } from "../../../utils/BaseStyledComponents";
import SaveTicketConfirm from "./SaveTicketConfirm";
import { initiatePayment } from "../../Redux/paymentSlice";
import { clearCart } from "../../Redux/cartSlice";

const TotalContainer = styled.div`
  padding: 5px 15px;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TotalInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const TotalLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const TotalValue = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #ff6b6b;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const SaveCartButton = styled.button`
  background-color: transparent;
  color: #ff6b6b;
  border: none;
  font-size: 12px;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const PayButton = styled.button`
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background-color: #ff4f4f;
  }
`;

const Total = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const orderNumber = useSelector((state) => state.orders.orderNumber);
  const { totalItems, totalAmount } = useSelector((state) => state.cart);
  const currentOrder = useSelector((state) => state.orders.currentOrder);
  const selectedCustomer = useSelector((state) => state.customers.selectedCustomer);
  const [alert, setAlert] = useState(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emptyCart = () => {
    if (cart.totalItems === 0) {
      setAlert({
        message: "Cart is empty!",
        type: "error",
      });
      setTimeout(() => setAlert(null), 1500);
    }
  };

  const handleOrder = async (cart, selectedCustomer, currentOrder) => {
    let orderResult;
    const updatedOrder = {
      ...currentOrder,
      totalAmount: cart.totalAmount,
      totalItems: cart.totalItems,
      purchasedItems: cart.cartItems,
      customerId: selectedCustomer?.id,
    };
  
    if (currentOrder) {
      // Update existing order
      console.log('in current order')
      orderResult = await dispatch(
        updateOrderThunk({ orderId: currentOrder.id, updatedOrder })
      );
    } else {
      // Create a new order
      console.log('in create order')
      orderResult = await dispatch(createOrderThunk({orderNumber, cart, selectedCustomer }));
    }
    
    return orderResult;
  };
  
  const handlePay = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    const orderResult = await handleOrder(cart, selectedCustomer, currentOrder);
  
    console.log("orderResult: ", orderResult);
    if (orderResult.type.includes("fulfilled")) {
      console.log("Created Order:", orderResult);
      dispatch(initiatePayment(parseFloat(cart.totalAmount)));
      navigate("/payment");
    } else {
      setAlert({
        message: "Failed to process payment!",
        type: "error",
      });
    }
    setTimeout(() => setAlert(null), 1500);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const orderResult = await handleOrder(cart, selectedCustomer, currentOrder);
  
    console.log("orderResult: ", orderResult);
    if (orderResult.type.includes("fulfilled")) {
      setShowSaveConfirm(false);
      dispatch(clearCart());
      dispatch(setOrderNumber());
      dispatch(resetCurrentOrder());
      setAlert({
        message: "Ticket saved successfully!",
        type: "success",
      });
    } else {
      setAlert({
        message: "Failed to save ticket!",
        type: "error",
      });
    }
    setTimeout(() => setAlert(null), 1500);
    setIsLoading(false);
  };

  return (
    <TotalContainer>
      <TotalInfo>
        <TotalLabel>Total Items: {totalItems}</TotalLabel>
        <TotalValue>${totalAmount}</TotalValue>{" "}
        {/* Formatting to 2 decimal places */}
      </TotalInfo>

      <ButtonGroup>
        {/* <SaveCartButton onClick={handleSave}>Save</SaveCartButton>
        <PayButton onClick={handlePay}>Pay</PayButton> */}
        {totalItems === 0 ? (
          <>
            <SaveCartButton onClick={emptyCart} disabled={isLoading}>{isLoading ? <CircularProgress size={24} /> : "Save"}</SaveCartButton>
            <PayButton onClick={emptyCart} disabled={isLoading}>{isLoading ? <CircularProgress size={24} /> : "Pay"}</PayButton>
          </>
        ) : (
          <>
            <SaveCartButton onClick={() => setShowSaveConfirm(true)} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : "Save"}
            </SaveCartButton>
            <PayButton onClick={handlePay} disabled={isLoading}>{isLoading ? <CircularProgress size={24} /> : "Pay"}</PayButton>
          </>
        )}

        {showSaveConfirm && (
          <SaveTicketConfirm
            setShowSaveConfirm={setShowSaveConfirm}
            handleSave={handleSave}
          />
        )}
        <Fade in={alert}>
          <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
        </Fade>
      </ButtonGroup>
    </TotalContainer>
  );
};

export default Total;
