import React from "react";
import Barcode from "react-barcode";
import styled from "styled-components";

const Container = styled.div`
  display: grid;
  width: 240px;
  padding: 10px;
  margin: 10px;
  font-family: Arial, sans-serif;
  border: solid black 1px;
`;
const Header = styled.div``;
const CompanyInfo = styled.div`
  text-align: center;
  margin-bottom: 10px;
`;
const CompanyLogo = styled.div`
  font-size: 30px;
`;
const CompanyAddress = styled.div`
  font-size: 12px;
`;
const OrderInfo = styled.div``;

const Title = styled.div``;

const DateTime = styled.div``;

const HashedLine = styled.div`
  border-top: dashed black 1px;
  margin: 10px 2px;
`;

const Item = styled.div`
  display: grid;
  grid-template-columns: 10fr 4fr 2.5fr 4fr;
  column-gap: 4px;
  font-size: 12px;
`;
const DetailsTitle = styled.div`
  justify-self: center;
`;
const Details = styled.div`
  justify-self: right;
`;
const TotalDetails = styled.div`
  display: flex;
  justify-content: space-between;
`;
const BarcodeDiv = styled(Barcode)`
  margin: auto;
`;

const Receipt = ({ order }) => {
  console.log("order: ", order);
  // const soldItems = order?.purchasedItems.filter(
  //   (item) => item.status === "sold"
  // );

  return (
    <Container>
      <Header>
        <CompanyInfo>
          <CompanyLogo>Company Logo</CompanyLogo>
          <CompanyAddress>
            Address: Route something, sousse, tunisie.
          </CompanyAddress>
        </CompanyInfo>
        <OrderInfo>
          <Title>Receipt N° {order?.orderNumber}</Title>
          <DateTime>Date: {new Date().toLocaleString()}</DateTime>
        </OrderInfo>
      </Header>
      <HashedLine />
      <Item>
        <div>ITEM</div>
        <DetailsTitle>U.P</DetailsTitle>
        <DetailsTitle>QTE</DetailsTitle>
        <DetailsTitle>TOTAL</DetailsTitle>
      </Item>
      {order?.purchasedItems.map((item, index) => (
        <Item key={index}>
          <div>{item.productName}</div>
          <Details>{item.sellingPrice.toFixed(2)}</Details>
          <Details>x{item.quantity}</Details>
          <Details>{(item.sellingPrice * item.quantity).toFixed(2)}</Details>
        </Item>
      ))}
      <HashedLine />
      <div>
        <TotalDetails>
          <div>Items Count</div>
          <div>{order?.totalItems}</div>
        </TotalDetails>
        <TotalDetails>
          <div>Total</div>
          <div>{order?.totalAmount.toFixed(3)}</div>
        </TotalDetails>
      </div>
      <HashedLine />
      <BarcodeDiv value="Barcode" width={1} height={22} font="20" />
    </Container>
  );
};

export default Receipt;
