import React from "react";
import styled from "styled-components";
import Receipt from "../ordersPage/Receipt";
import { useSelector } from "react-redux";
import CustomerCard from "./CustomerCard";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
`;

const RightPanel = () => {
  const customer = useSelector((state) => state.customers.selectedCustomer);
  const currentOrder = useSelector((state) => state.orders.currentOrder);
  return (
    <Container>
      {customer && <CustomerCard />}
      {currentOrder && <Receipt order={currentOrder} />}
    </Container>
  );
};

export default RightPanel;
