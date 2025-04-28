import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import AccountBoxOutlinedIcon from "@mui/icons-material/AccountBoxOutlined";
import { theme } from "../../theme";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  border: solid 1px ${(props) => props.theme.colors.secondary};
  padding: 12px 16px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 10px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.07);
`;

const CustomerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Name = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
`;

const Details = styled.div`
  font-size: 14px;
  color: ${(props) => props.theme.colors.text};
`;

const LoyaltyPoints = styled.div`
  font-size: 14px;
  color: ${(props) => props.theme.colors.primary};
  font-weight: 500;
  background-color: ${(props) => props.theme.colors.background};
  padding: 5px 10px;
  border-radius: 5px;
  display: inline-block;
  margin-top: 8px;
`;

const NoLoyaltyCard = styled.div`
  font-size: 14px;
  color: ${(props) => props.theme.colors.secondary};
  font-weight: 500;
  margin-top: 8px;
`;

const CustomerCard = () => {
  const customer = useSelector((state) => state.customers.selectedCustomer);

  return (
    <Container>
      <AccountBoxOutlinedIcon fontSize="large" />
      <CustomerDetails>
        <Name>{customer.name}</Name>
        <Details>{customer.phone}</Details>
        <Details>{`${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zip}`}</Details>
        {customer.loyaltyCard ? (
          <LoyaltyPoints>{`Loyalty Points: ${customer.loyaltyCard.points}`}</LoyaltyPoints>
        ) : (
          <NoLoyaltyCard>No loyalty card</NoLoyaltyCard>
        )}
      </CustomerDetails>
    </Container>
  );
};

export default CustomerCard;
