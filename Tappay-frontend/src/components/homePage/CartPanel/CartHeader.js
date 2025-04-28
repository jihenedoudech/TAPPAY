import React, { useEffect, useState } from "react";
import styled from "styled-components";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { useSelector, useDispatch } from "react-redux";
import CustomersList from "./CustomersList";
import { selectCustomer } from "../../Redux/customerSlice";
import { setOrderNumber } from "../../Redux/orderSlice";

const CartHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7.5px;
  margin: 1px;
  border-bottom: 1px solid #ddd;
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const OrderNumber = styled.h2`
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
`;

const SubText = styled.span`
  font-size: 12px;
  color: #888;
`;

const CustomerSection = styled.div`
  display: flex;
  text-align: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 17px;
  font-weight: 500;
  color: #333;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
    color: #ff6b6b;
  }
`;

const CartHeader = () => {
  const dispatch = useDispatch();
  const currentOrder = useSelector((state) => state.orders.currentOrder);
  useEffect(() => {
    console.log("currentOrder: ", currentOrder);
  }, [currentOrder]);
  const orderNumber = useSelector((state) => state.orders.orderNumber);
  if (!currentOrder) {
    dispatch(setOrderNumber());
  }
  const selectedCustomer = useSelector(
    (state) => state.customers.selectedCustomer
  );
  const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);

  const handleOpenCustomerList = () => setIsCustomerListOpen(true);
  const handleCloseCustomerList = () => setIsCustomerListOpen(false);
  const handleSelectCustomer = (customer) => {
    dispatch(selectCustomer(customer));
    handleCloseCustomerList();
  };

  return (
    <CartHeaderContainer>
      <OrderInfo>
        <OrderNumber>Order N°: {orderNumber}</OrderNumber>
        <SubText>Current Order</SubText>
      </OrderInfo>
      {/* <CustomerSection onClick={handleOpenCustomerList}>
        <PersonAddAltIcon />
        {selectedCustomer ? (
          <>{selectedCustomer.name}</>
        ) : (
          <>Customer</>
        )}
      </CustomerSection> */}
      {isCustomerListOpen && (
        <CustomersList
          onClose={handleCloseCustomerList}
          onSelectCustomer={handleSelectCustomer}
        />
      )}
    </CartHeaderContainer>
  );
};

export default CartHeader;
