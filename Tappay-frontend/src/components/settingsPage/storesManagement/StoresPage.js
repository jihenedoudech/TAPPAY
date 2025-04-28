import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import Page from "../../common/Page";
import {
  Button,
  PageContainer,
  PageHeader,
  PageTitle,
} from "../../../utils/BaseStyledComponents";
import { fetchStoresThunk } from "../../Redux/storeSlice";
import { Typography, Chip } from "@mui/material";
import { theme } from "../../../theme";
import { UserRole } from "../../../utils/enums";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

const StoresGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 20px;
`;

const Card = styled.div`
  background: ${theme.colors.cardBackground};
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  border-left: 5px solid
    ${({ isOpen }) => (isOpen ? theme.colors.primary : theme.colors.secondary)};
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${theme.colors.border};
  padding-bottom: 10px;
`;

const Title = styled(Typography).attrs(() => ({
  variant: "h6",
}))`
  color: ${theme.colors.text};
`;

const Section = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RoleList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const Badge = styled.div`
  background: ${theme.colors.secondary};
  color: ${theme.colors.textInverse};
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.85rem;
`;

const StoresPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { storesList, loading, error } = useSelector((state) => state.store);

  useEffect(() => {
    dispatch(fetchStoresThunk());
  }, [dispatch]);

  const handleAddStore = () => {
    navigate("/settings/stores-management/add-store");
  };

  if (loading) {
    return <PageContainer>Loading stores...</PageContainer>;
  }

  if (error) {
    return <PageContainer>Error: {error}</PageContainer>;
  }

  const formatUserName = (user) =>
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username;

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Stores</h2>
          <Button onClick={handleAddStore}>
            <AddIcon />
            Add Store
          </Button>
        </PageHeader>
        <StoresGrid>
          {storesList.length > 0 ? (
            storesList.map((store) => {
              const managers = store.users.filter(
                (user) => user.role === UserRole.MANAGER
              );
              const cashiers = store.users.filter(
                (user) => user.role === UserRole.CASHIER
              );

              return (
                <Card key={store.id} isOpen={store.isOpen}>
                  <Header>
                    <Title>{store.name}</Title>
                    <Chip
                      label={store.isOpen ? "Open" : "Closed"}
                      color={store.isOpen ? "success" : "error"}
                      size="small"
                    />
                  </Header>
                  <Section>
                    <Column>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {store.phoneNumber || "N/A"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {store.email || "N/A"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Address:</strong>{" "}
                        {store.address?.fullAddress || "Not provided"}
                      </Typography>
                    </Column>
                    <Column>
                      <Typography variant="body2">
                        <strong>Managers:</strong>
                      </Typography>
                      <RoleList>
                        {managers.length > 0 ? (
                          managers.map((manager) => (
                            <Badge key={manager.id}>
                              {formatUserName(manager)}
                            </Badge>
                          ))
                        ) : (
                          <Badge>No managers</Badge>
                        )}
                      </RoleList>
                      <Typography variant="body2">
                        <strong>Cashiers:</strong>
                      </Typography>
                      <RoleList>
                        {cashiers.length > 0 ? (
                          cashiers.map((cashier) => (
                            <Badge key={cashier.id}>
                              {formatUserName(cashier)}
                            </Badge>
                          ))
                        ) : (
                          <Badge>No cashiers</Badge>
                        )}
                      </RoleList>
                    </Column>
                  </Section>
                </Card>
              );
            })
          ) : (
            <PageContainer>No stores available</PageContainer>
          )}
        </StoresGrid>
      </PageContainer>
    </Page>
  );
};

export default StoresPage;
