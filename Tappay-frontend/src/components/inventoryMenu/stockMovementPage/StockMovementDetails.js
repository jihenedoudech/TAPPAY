import React from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import Page from "../../common/Page";
import {
  PageContainer,
  PageHeader,
  PageTitle,
  BackButton,
  TableWrapper,
  Table,
} from "../../../utils/BaseStyledComponents";
import { ArrowLeftIcon } from "@mui/x-date-pickers";

const DetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px;
`;

const DetailGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  & > * {
    flex: 1;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 12px 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    background-color: #f1f1f1;
    transform: translateY(-2px);
  }
`;

const Label = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: #4a4a4a;
`;

const Value = styled.div`
  font-size: 16px;
  color: #777;
`;

const ItemsSection = styled.div`
  margin-top: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 25px;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 8px;
  margin-bottom: 20px;
  font-weight: 600;
`;

const StockMovementDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stockMovement = location.state?.stockMovement;

  const handleBack = () => {
    navigate(-1);
  };

  if (!stockMovement) {
    return <div>No stock movement details available.</div>;
  }

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <PageTitle>
            <BackButton onClick={handleBack}>
              <ArrowLeftIcon />
            </BackButton>
            Stock Movement Details
          </PageTitle>
        </PageHeader>
        <div>
          <DetailsSection>
            <DetailGroup>
              <DetailItem>
                <Label>From Store:</Label>
                <Value>{stockMovement.fromStore.name}</Value>
              </DetailItem>
              <DetailItem>
                <Label>To Store:</Label>
                <Value>{stockMovement.toStore.name}</Value>
              </DetailItem>
            </DetailGroup>
            <DetailGroup>
              <DetailItem>
                <Label>Movement Date:</Label>
                <Value>
                  {new Date(stockMovement.movementDate).toLocaleDateString()}
                </Value>
              </DetailItem>
              <DetailItem>
                <Label>Created By:</Label>
                <Value>{stockMovement.createdBy.username}</Value>
              </DetailItem>
            </DetailGroup>
            <DetailItem>
              <Label>Notes:</Label>
              <Value>{stockMovement.notes || "No notes available"}</Value>
            </DetailItem>
          </DetailsSection>
          <ItemsSection>
            <SectionTitle>Items</SectionTitle>
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovement.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product?.productDetails?.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.notes || "No notes available"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          </ItemsSection>
        </div>
      </PageContainer>
    </Page>
  );
};

export default StockMovementDetails;
