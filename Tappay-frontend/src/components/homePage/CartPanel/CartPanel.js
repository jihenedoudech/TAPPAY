import React, { useState, useEffect } from "react";
import styled from "styled-components";
import PurchasedProduct from "./PurchasedProduct";
import Total from "./Total";
import CartHeader from "./CartHeader";
import { useSelector } from "react-redux";
import Calculator from "../../common/Calculator";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import UnpaidOrders from "./UnpaidOrders";
import OrderDetails from "./OrderDetails";
import { Fade } from "@mui/material";
import { AlertNotif } from "../../../utils/BaseStyledComponents";
import { OrderStatus } from "../../../utils/enums";

const CartContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #fff;
  padding: 0 5px;
  border-left: 2px solid #eee;
  height: calc(100vh - 75px);
`;

const MiddleContainer = styled.div`
  flex: 1;
  width: 100%;
  position: relative;
  margin: 4px 0;
  display: flex;
`;

const CartItemList = styled.div`
  flex: 1;
  max-height: ${props => props.isOpen ? 'calc(100vh - 340px)' : 'calc(100vh - 200px)'};
  overflow-y: auto;
  margin-bottom: 10px;
`;

const OpenOrderButtonContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0; /* Adds some space around the button */
`;

const OpenOrderButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #ff6b6b;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background-color: #ff4f4f;
  }
`;

const CartPanel = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const [showUnpaidOrders, setShowUnpaidOrders] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);
  const unpaidOrders = useSelector((state) =>
    state.orders.ordersList.filter(
      (order) =>
        order.status === OrderStatus.DRAFT ||
        order.status === OrderStatus.CONFIRMED
    )
  );

  const openUnpaidOrders = () => setShowUnpaidOrders(true);
  const closeUnpaidOrders = () => setShowUnpaidOrders(false);
  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  const closeOrderDetails = () => setShowOrderDetails(false);

  useEffect(() => {
    console.log("cartItems: ", cartItems);
  }, [cartItems]);

  return (
    <CartContainer>
      <CartHeader />
      <MiddleContainer>
        {cartItems.length === 0 ? (
          <>
            {unpaidOrders.length !== 0 && (
              <OpenOrderButtonContainer>
                <OpenOrderButton onClick={(event) => openUnpaidOrders(event)}>
                  <ReceiptLongOutlinedIcon sx={{ fontSize: 25 }} />
                  {unpaidOrders.length} Unpaid Order
                  {unpaidOrders.length > 1 ? "s" : ""}
                </OpenOrderButton>
              </OpenOrderButtonContainer>
            )}
            {showUnpaidOrders && (
              <UnpaidOrders
                closeUnpaidOrders={(event) => closeUnpaidOrders(event)}
                openOrderDetails={openOrderDetails}
              />
            )}
            {showOrderDetails && selectedOrder && (
              <OrderDetails
                order={selectedOrder}
                closeOrderDetails={(event) => closeOrderDetails(event)}
                openOrdersList={(event) => openUnpaidOrders(event)}
              />
            )}
          </>
        ) : (
          <CartItemList isOpen={isCalculatorVisible}>
            {cartItems.map((product, index) => (
              <PurchasedProduct
                key={index}
                item={product}
                cartItems={cartItems}
              />
            ))}
          </CartItemList>
        )}
        <Calculator cartItems={cartItems} setAlert={setAlert} isCalculatorVisible={isCalculatorVisible} setIsCalculatorVisible={setIsCalculatorVisible}/>
      </MiddleContainer>
      <Total />
      <Fade in={alert}>
        <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
      </Fade>
    </CartContainer>
  );
};

export default CartPanel;
