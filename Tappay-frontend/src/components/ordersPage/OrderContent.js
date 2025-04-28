import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { refundOrderThunk } from "../Redux/orderSlice";
import { useNavigate } from "react-router-dom";
import {
  Table,
  AlertNotif,
  TableWrapper,
} from "../../utils/BaseStyledComponents";
import { Fade } from "@mui/material";

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #ff6b6b;
  padding-bottom: 10px;
  margin-bottom: 20px;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 28px;
  color: #ff6b6b;
`;

const DateTime = styled.p`
  font-size: 18px;
  color: #868686;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SubTitle = styled.h2`
  font-size: 22px;
  color: #ff6b6b;
  margin-bottom: 10px;
`;

const TotalContainer = styled.div`
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const TotalItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: bold;
`;

const Customer = styled.div`
  font-size: 18px;
  color: #333;
`;

const Input = styled.input`
  width: 60px;
  padding: 8px;
  font-size: 16px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 12px 24px;
  font-size: 18px;
  color: #fff;
  background-color: #ff6b6b;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  &:hover {
    background-color: #e55b5b;
  }
`;

const OrderContent = ({ order, mode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [refundItems, setRefundItems] = useState([]);
  const [alert, setAlert] = useState(null);

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
    <>
      <Header>
        <Title>Order N° {order.orderNumber}</Title>
        <DateTime>{new Date(order.dateTime).toLocaleString()}</DateTime>
      </Header>
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
                <th>Status</th>
                <th>Cost</th>
                <th>Profit</th>
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
                          refundItems.some((refund) => refund.id === item.id) ||
                          item.status === "REFUNDED"
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
                  <td>{item.status}</td>
                  <td>{item.cost.toFixed(3)} DT</td>
                  <td>{item.profit.toFixed(3)} DT</td>
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
      <TotalContainer>
        <TotalItem>
          <span>Total Amount</span>
          <span>{order.totalAmount.toFixed(3)} DT</span>
        </TotalItem>
        <TotalItem>
          <span>Total Cost</span>
          <span>{order.totalCost.toFixed(3)} DT</span>
        </TotalItem>
        <TotalItem>
          <span>Total Profit</span>
          <span>{order.totalProfit.toFixed(3)} DT</span>
        </TotalItem>
        {mode === "refund" && (
          <TotalItem>
            <span>Total Refund</span>
            <span>{totalRefund.toFixed(3)} DT</span>
          </TotalItem>
        )}
      </TotalContainer>
      <Section>
        <SubTitle>Customer Information</SubTitle>
        <Customer>{order.customer ? order.customer : "No customer"}</Customer>
      </Section>
      {mode === "refund" && (
        <ButtonContainer>
          <Button onClick={handleConfirmRefund}>Save</Button>
        </ButtonContainer>
      )}
      <Fade in={!!alert}>
        <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
      </Fade>
    </>
  );
};

export default OrderContent;
