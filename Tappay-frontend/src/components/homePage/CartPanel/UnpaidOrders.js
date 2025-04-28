import React, { useState } from "react";
import Order from "./Order";
import styled from "styled-components";
import { useSelector } from "react-redux";
import Popup from "../../common/Popup";
import { OrderStatus } from "../../../utils/enums";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
  background-color: ${(props) => props.theme.colors.background};
`;

const FilterList = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FilterItem = styled.button`
  padding: 10px 15px;
  margin: 0 5px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${(props) =>
    props.active ? props.theme.colors.primary : "transparent"};
  color: ${(props) => (props.active ? "#fff" : props.theme.colors.text)};
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: ${(props) =>
      props.active ? props.theme.colors.secondary : "#ececec"};
  }
`;

const OrdersContainer = styled.div`
  flex: 1;
  position: relative; /* Allows absolute positioning for the empty message */
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Ensures the list starts at the top */
  align-items: center;
  padding: 20px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 1px solid lightgrey;
  border-radius: 8px;
  overflow-y: auto;
`;

const OrdersList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EmptyMessage = styled.div`
  position: absolute; /* Centers the message in the container */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
  text-align: center;
`;

const UnpaidOrders = ({ closeUnpaidOrders, openOrderDetails }) => {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const orders = useSelector((state) =>
    state.orders.ordersList
      .filter((order) => {
        if (selectedFilter === OrderStatus.DRAFT) {
          return order.status === OrderStatus.DRAFT;
        }
        if (selectedFilter === OrderStatus.CONFIRMED) {
          return order.status === OrderStatus.CONFIRMED;
        }
        if (selectedFilter === "all") {
          return order.status === OrderStatus.DRAFT || order.status === OrderStatus.CONFIRMED;
        }
        return false;
      })
      .sort((a, b) => {
        const dateA = new Date(a.dateTime);
        const dateB = new Date(b.dateTime);
        return dateB - dateA;
      })
  );

  return (
    <Popup title="Unpaid Orders" onClose={closeUnpaidOrders}>
      <Container>
        <FilterList>
          <FilterItem
            active={selectedFilter === "all"}
            onClick={() => setSelectedFilter("all")}
          >
            All
          </FilterItem>
          <FilterItem
            active={selectedFilter === "DRAFT"}
            onClick={() => setSelectedFilter("DRAFT")}
          >
            Draft
          </FilterItem>
          <FilterItem
            active={selectedFilter === "CONFIRMED"}
            onClick={() => setSelectedFilter("CONFIRMED")}
          >
            Confirmed
          </FilterItem>
        </FilterList>
        <OrdersContainer>
          {orders.length > 0 ? (
            <OrdersList>
              {orders.map((order) => (
                <Order
                  key={order.id}
                  order={order}
                  openOrderDetails={openOrderDetails}
                  onClose={closeUnpaidOrders}
                />
              ))}
            </OrdersList>
          ) : (
            <EmptyMessage>No orders available</EmptyMessage>
          )}
        </OrdersContainer>
      </Container>
    </Popup>
  );
};

export default UnpaidOrders;
