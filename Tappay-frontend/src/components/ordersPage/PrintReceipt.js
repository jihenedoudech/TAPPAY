import React, { useRef } from "react";
import styled from "styled-components";
import Popup from "../common/Popup";
import Receipt from "./Receipt";
import { useReactToPrint } from "react-to-print";

const ReceiptContainer = styled.div`
  max-height: calc(100vh - 200px);
  overflow-y: auto;
`;

const Buttons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button`
  flex: 1;
  padding: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #0c085c;
  background-color: #a8d0e7;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  transition: color 0.3s;
  box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.4);
  &:hover {
    background-color: #54528c;
    color: #a8d0e7;
  }
`;

const PrintReceipt = ({ orders, handleAfterPrint, handlePrintCancel }) => {
  const receiptRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    onAfterPrint: () => handleAfterPrint(),
  });

  console.log("orders", orders);

  return (
    <Popup title="Print Receipt" onClose={handlePrintCancel}>
      <>
        <ReceiptContainer>
          <div ref={receiptRef}>
            {orders.map((order, index) => (
              <Receipt key={order.id || index} order={order} />
            ))}
          </div>
        </ReceiptContainer>
        <Buttons>
          <Button
            onClick={() => {
              console.log("Printing...");
              handlePrint();
            }}
          >
            Yes
          </Button>
          <Button onClick={handlePrintCancel}>No</Button>
        </Buttons>
      </>
    </Popup>
  );
};

export default PrintReceipt;
