import React from "react";
import styled from "styled-components";
import Popup from "../common/Popup";

const DetailContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const DetailBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Label = styled.span`
  font-weight: bold;
`;

const Value = styled.span`
  margin-left: 10px;
`;

const ShiftDetails = ({ shift, onClose }) => {
  return (
    <Popup title="Shift Details" onClose={onClose}>
      <DetailContainer>
        <DetailBlock>
          <DetailItem>
            <Label>Managed By:</Label>
            <Value>
              {shift.user?.firstName} {shift.user?.lastName}
            </Value>
          </DetailItem>
          <DetailItem>
            <Label>Start Time:</Label>
            <Value>{new Date(shift.startTime).toLocaleString()}</Value>
          </DetailItem>
          <DetailItem>
            <Label>End Time:</Label>
            <Value>
              {shift.endTime ? new Date(shift.endTime).toLocaleString() : "Ongoing"}
            </Value>
          </DetailItem>
          <DetailItem>
            <Label>Starting Amount:</Label>
            <Value>${shift.openingCashAmount.toFixed(2)}</Value>
          </DetailItem>
          <DetailItem>
            <Label>Total Sales:</Label>
            <Value>${shift.totalSales.toFixed(2)}</Value>
          </DetailItem>
        </DetailBlock>
        <DetailBlock>
          <DetailItem>
            <Label>Total Items:</Label>
            <Value>{shift.totalItems}</Value>
          </DetailItem>
          <DetailItem>
            <Label>Total Discounts:</Label>
            <Value>${shift.totalDiscounts?.toFixed(2) || "0.00"}</Value>
          </DetailItem>
          <DetailItem>
            <Label>Total Refunds:</Label>
            <Value>${shift.totalRefunds?.toFixed(2) || "0.00"}</Value>
          </DetailItem>
          <DetailItem>
            <Label>Total Profit:</Label>
            <Value>${shift.totalProfit?.toFixed(2) || "0.00"}</Value>
          </DetailItem>
          <DetailItem>
            <Label>Total Cost:</Label>
            <Value>${shift.totalCost?.toFixed(2) || "0.00"}</Value>
          </DetailItem>
          <DetailItem>
            <Label>Total Transactions:</Label>
            <Value>{shift.totalTransactions}</Value>
          </DetailItem>
        </DetailBlock>
      </DetailContainer>
    </Popup>
  );
};

export default ShiftDetails;
