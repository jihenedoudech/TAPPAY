import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import CurrencyExchangeOutlinedIcon from "@mui/icons-material/CurrencyExchangeOutlined";
import Page from "../common/Page";
import PrintReceipt from "./PrintReceipt";
import { selectOrderById, refundOrderThunk } from "../Redux/orderSlice";
import {
  PageContainer,
  Button as StyledButton,
  ButtonsGroup,
  PageHeader,
  PageTitle,
  Table,
  AlertNotif,
  TableWrapper,
} from "../../utils/BaseStyledComponents";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { Fade } from "@mui/material";
import { fetchCurrentUserThunk } from "../Redux/userSlice";
import { UserRole } from "../../utils/enums";

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #ff6b6b;
  padding-bottom: 10px;
  margin-bottom: 20px;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 32px;
  color: #ff6b6b;
  font-weight: bold;
`;

const DateTime = styled.p`
  font-size: 18px;
  color: #868686;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SubTitle = styled.h2`
  font-size: 24px;
  color: #ff6b6b;
  margin-bottom: 15px;
  border-bottom: 2px solid #ff6b6b;
  padding-bottom: 5px;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  border-left: 4px solid #ff6b6b; /* Add a colored border for emphasis */
  transition:
    transform 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* Enhanced shadow on hover */
  }

  span:first-child {
    font-weight: bold;
    color: #333;
  }

  span:last-child {
    color: #555;
  }
`;

const TotalContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const TotalBox = styled.div`
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: translateY(-3px);
  }
`;

const TotalLabel = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

const TotalValue = styled.div`
  font-size: 22px;
  font-weight: bold;
  color: #ff6b6b;
`;

const Customer = styled.div`
  font-size: 18px;
  color: #555;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  width: 50px;
  padding: 10px;
  font-size: 16px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #ff6b6b;
    box-shadow: 0 0 5px rgba(255, 107, 107, 0.5);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const RefundButton = styled.button`
  padding: 14px 28px;
  font-size: 18px;
  color: #fff;
  background-color: #ff6b6b;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  &:hover {
    background-color: #e55b5b;
    transform: translateY(-3px);
  }
`;

const OrderDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id, mode } = useParams();
  const user = useSelector((state) => state.user.user);
  const order = useSelector((state) => selectOrderById(state, id));
  const [printPopup, setPrintPopup] = useState(false);
  const [refundItems, setRefundItems] = useState([]);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUserThunk());
    }
  }, [user, dispatch]);

  const handleRefund = () => {
    navigate(`/orders/order-details/refund/${order.id}`);
  };

  const handlePrint = () => {
    setPrintPopup(true);
  };

  const handleAfterPrint = () => {
    setPrintPopup(false);
  };

  useEffect(() => {
    console.log("Refund Items:", refundItems);
  }, [refundItems]);

  const handleSelectChange = (itemId, quantity) => {
    setRefundItems((prev) => {
      const existingItem = prev.find((item) => item.id === itemId);
      if (existingItem) {
        return prev.filter((item) => item.id !== itemId);
      }
      return [...prev, { id: itemId, quantity }];
    });
  };

  const handleQuantityChange = (itemId, quantity) => {
    setRefundItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
      )
    );
  };

  const handleConfirmRefund = async () => {
    const response = await dispatch(
      refundOrderThunk({ orderId: order.id, refundItems })
    );
    if (response.type.includes("fulfilled")) {
      navigate("/orders");
    } else {
      setAlert({
        type: "error",
        message: "Error refunding order",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    }
  };

  const totalRefund = refundItems.reduce((total, refund) => {
    const item = order.purchasedItems.find((p) => p.id === refund.id);
    return total + refund.quantity * (item?.sellingPrice || 0);
  }, 0);

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <PageTitle>
            <ArrowLeftIcon onClick={() => navigate(-1)} />
            Order N° {order.orderNumber}
          </PageTitle>
          {mode === "details" && (
            <ButtonsGroup>
              <StyledButton onClick={handleRefund}>
                <CurrencyExchangeOutlinedIcon fontSize="sm" />
                Refund
              </StyledButton>
              <StyledButton onClick={handlePrint}>
                <LocalPrintshopOutlinedIcon fontSize="sm" />
                Print
              </StyledButton>
            </ButtonsGroup>
          )}
        </PageHeader>
        <Section>
          <SubTitle>Order Details</SubTitle>
          <DetailGrid>
            <DetailItem>
              <span>Status:</span> <span>{order.status}</span>
            </DetailItem>
            <DetailItem>
              <span>Date and Time:</span>{" "}
              <span>{new Date(order.dateTime).toLocaleString()}</span>
            </DetailItem>
            <DetailItem>
              <span>Store:</span> <span>{order.shift.store.name}</span>
            </DetailItem>
            <DetailItem>
              <span>Shift Status:</span> <span>{order.shift.status}</span>
            </DetailItem>
            <DetailItem>
              <span>User:</span> <span>{order.shift.user.username}</span>
            </DetailItem>
          </DetailGrid>
        </Section>
        <Section>
          <SubTitle>Order Summary</SubTitle>
          <TotalContainer>
            <TotalBox>
              <TotalLabel>Total Amount</TotalLabel>
              <TotalValue>{order.totalAmount.toFixed(3)} DT</TotalValue>
            </TotalBox>
            {user?.role === UserRole.ADMIN && (
              <>
                <TotalBox>
                  <TotalLabel>Total Cost</TotalLabel>
                  <TotalValue>{order.totalCost.toFixed(3)} DT</TotalValue>
                </TotalBox>
                <TotalBox>
                  <TotalLabel>Total Profit</TotalLabel>
                  <TotalValue>{order.totalProfit.toFixed(3)} DT</TotalValue>
                </TotalBox>
              </>
            )}
            <TotalBox>
              <TotalLabel>Total Discount</TotalLabel>
              <TotalValue>{order.totalDiscount.toFixed(3)} DT</TotalValue>
            </TotalBox>
            {mode === "refund" && (
              <TotalBox>
                <TotalLabel>Total Refund</TotalLabel>
                <TotalValue>{totalRefund.toFixed(3)} DT</TotalValue>
              </TotalBox>
            )}
          </TotalContainer>
        </Section>
        <Section>
          <SubTitle>Purchased Items</SubTitle>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  {mode === "refund" && <th>Select</th>}
                  <th>Item</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Total db</th>
                  <th>Status</th>
                  {user.role === UserRole.ADMIN && (
                    <>
                      <th>Cost</th>
                      <th>Profit</th>
                    </>
                  )}
                  {mode === "refund" && <th>Refund Quantity</th>}
                </tr>
              </thead>
              <tbody>
                {order.purchasedItems.map((item) => (
                  <tr key={item.id}>
                    {mode === "refund" && (
                      <td>
                        <Input
                          type="checkbox"
                          checked={
                            refundItems.some(
                              (refund) => refund.id === item.id
                            ) || item.status === "REFUNDED"
                          }
                          onChange={() =>
                            handleSelectChange(item.id, item.quantity)
                          }
                        />
                      </td>
                    )}
                    <td>{item.productName}</td>
                    <td>{item.sellingPrice.toFixed(3)} DT</td>
                    <td>{item.quantity}</td>
                    <td>{(item.sellingPrice * item.quantity).toFixed(3)} DT</td>
                    <td>{item.total}</td>
                    <td>{item.status}</td>
                    {user.role === UserRole.ADMIN && (
                      <>
                        <td>{item.cost.toFixed(3)} DT</td>
                        <td>{item.profit.toFixed(3)} DT</td>
                      </>
                    )}
                    {mode === "refund" && (
                      <td>
                        <Input
                          type="number"
                          value={
                            refundItems.find((refund) => refund.id === item.id)
                              ?.quantity || 0
                          }
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value, 10)
                            )
                          }
                          min="0"
                          max={item.quantity}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </Section>
        <Section>
          <SubTitle>Customer Information</SubTitle>
          <Customer>{order.customer ? order.customer : "No customer"}</Customer>
        </Section>
        {mode === "refund" && (
          <ButtonContainer>
            <RefundButton onClick={handleConfirmRefund}>Save</RefundButton>
          </ButtonContainer>
        )}
        <Fade in={!!alert}>
          <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
        </Fade>
        {printPopup && (
          <PrintReceipt
            orders={[order]}
            handleAfterPrint={handleAfterPrint}
            handlePrintCancel={handleAfterPrint}
          />
        )}
      </PageContainer>
    </Page>
  );
};

export default OrderDetails;
