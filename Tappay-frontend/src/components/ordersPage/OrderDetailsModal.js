import React from "react";
import styled from "styled-components";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
`;

const CloseButton = styled.button`
  background-color: #6200ea;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #3700b3;
  }
`;

const OrderDetailsModal = ({ order, onClose }) => {
  return (
    <ModalOverlay>
      <ModalContent>
        <h2>Order Details</h2>
        <p>
          <strong>Order ID:</strong> {order.id}
        </p>
        <p>
          <strong>Customer:</strong> {order.customer}
        </p>
        <p>
          <strong>Date:</strong> {order.date}
        </p>
        <p>
          <strong>Total:</strong> ${order.total.toFixed(2)}
        </p>
        <h3>Items:</h3>
        <ul>
          {order.items.map((item, index) => (
            <li key={index}>
              {item.name} - {item.quantity} x ${item.sellingPrice.toFixed(2)}
            </li>
          ))}
        </ul>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default OrderDetailsModal;
