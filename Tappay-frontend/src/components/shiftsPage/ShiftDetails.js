import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Page from "../common/Page";
import {
  PageContainer,
  PageTitle,
} from "../../utils/BaseStyledComponents";
import {
  fetchShiftByIdThunk,
  selectShiftById,
} from "../Redux/shiftSlice";
import { UserRole } from "../../utils/enums";
import { ArrowLeftIcon } from "@mui/x-date-pickers";

// New Color Palette
const AccentColor = "#ff6b6b";
const NeutralBackground = "#f5f5f5";
const CardBackground = "#ffffff";
const ShadowColor = "rgba(0, 0, 0, 0.05)";
const TextGray = "#444";

const ShiftDetailsContainer = styled.div`
  background-color: ${CardBackground};
  margin-top: 20px;
  border: 1px solid ${AccentColor};
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px ${ShadowColor};
  width: calc(100vw - 125px);
  display: flex;
  gap: 10px;
  > * {
    flex: 1;
    white-space: nowrap;
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
`;

const DetailCard = styled.div`
  background-color: ${CardBackground};
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 10px ${ShadowColor};
  transition:
    transform 0.2s,
    box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  }
`;

const Label = styled.h4`
  font-size: 1rem;
  color: ${TextGray};
  margin: 0;
`;

const Value = styled.p`
  font-size: 1.4rem;
  font-weight: bold;
  color: ${AccentColor};
  margin: 0;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: ${TextGray};
  margin-top: 30px;
  text-align: center;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  h3 {
    font-size: 1rem;
    color: ${TextGray};
    margin: 0;
  }
  p {
    font-size: 1.2rem;
    color: ${AccentColor};
    margin: 0;
    font-weight: bold;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background-color: ${(props) => (props.active ? AccentColor : '#e0e0e0')};
  color: ${(props) => (props.active ? CardBackground : TextGray)};
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    background-color: ${(props) => (props.active ? AccentColor : '#d0d0d0')};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${CardBackground};
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  padding: 15px;
  background-color: ${NeutralBackground};
  color: ${TextGray};
  text-align: left;
  font-weight: bold;
`;

const Td = styled.td`
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  color: ${TextGray};
`;

const ShiftDetails = () => {
  const navigate = useNavigate();
  const { shiftId } = useParams();
  const dispatch = useDispatch();

  const currentUserRole = useSelector((state) => state.user.currentUserRole);
  const [shiftDetails, setShiftDetails] = useState();
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (shiftId) {
      dispatch(fetchShiftByIdThunk(shiftId)).then((action) => {
        if (fetchShiftByIdThunk.fulfilled.match(action)) {
          setShiftDetails(action.payload);
        }
      });
    }
  }, [dispatch, shiftId]);

  // Aggregate product data
  const getProductSummary = () => {
    if (!shiftDetails?.orders) return [];
    
    const productMap = new Map();
    
    shiftDetails.orders.forEach(order => {
      order.purchasedItems.forEach(item => {
        const existing = productMap.get(item.productName) || {
          productName: item.productName,
          quantity: 0,
          totalSales: 0,
          totalCost: 0,
          totalProfit: 0
        };
        
        productMap.set(item.productName, {
          ...existing,
          quantity: existing.quantity + item.quantity,
          totalSales: existing.totalSales + item.total,
          totalCost: existing.totalCost + (item.cost || 0),
          totalProfit: existing.totalProfit + (item.profit || 0)
        });
      });
    });
    
    return Array.from(productMap.values());
  };

  return (
    <Page style={{ background: NeutralBackground }}>
      <PageContainer>
        <PageTitle>
          <ArrowLeftIcon onClick={() => navigate(-1)} />
          Shift Details
        </PageTitle>
        {shiftDetails ? (
          <>
            <ShiftDetailsContainer>
              <div>
                <SummaryItem>
                  <h3>Manager</h3>
                  <p>{shiftDetails?.user?.username}</p>
                </SummaryItem>
                <SummaryItem>
                  <h3>Status</h3>
                  <p>{shiftDetails?.status}</p>
                </SummaryItem>
              </div>
              <div>
                <SummaryItem>
                  <h3>Start Time</h3>
                  <p>{new Date(shiftDetails?.startTime).toLocaleString()}</p>
                </SummaryItem>
                <SummaryItem>
                  <h3>End Time</h3>
                  <p>
                    {shiftDetails?.endTime
                      ? new Date(shiftDetails?.endTime).toLocaleString()
                      : "Ongoing"}
                  </p>
                </SummaryItem>
              </div>
            </ShiftDetailsContainer>
            <h3 style={{ color: AccentColor, marginBottom: "20px" }}>
              Shift Details
            </h3>
            <DetailGrid>
              <DetailCard>
                <Label>Starting Amount</Label>
                <Value>${shiftDetails?.openingCashAmount.toFixed(2)}</Value>
              </DetailCard>
              <DetailCard>
                <Label>Total Amount</Label>
                <Value>${shiftDetails?.totalAmount.toFixed(2)}</Value>
              </DetailCard>
              <DetailCard>
                <Label>Total Sales</Label>
                <Value>${shiftDetails?.totalSales.toFixed(2)}</Value>
              </DetailCard>
              <DetailCard>
                <Label>Total Items</Label>
                <Value>{shiftDetails?.totalItems}</Value>
              </DetailCard>
              <DetailCard>
                <Label>Total Discounts</Label>
                <Value>${shiftDetails?.totalDiscounts.toFixed(2)}</Value>
              </DetailCard>
              <DetailCard>
                <Label>Total Refunds</Label>
                <Value>${shiftDetails?.totalRefunds.toFixed(2)}</Value>
              </DetailCard>
              <DetailCard>
                <Label>Total Transactions</Label>
                <Value>{shiftDetails?.totalTransactions}</Value>
              </DetailCard>
              {currentUserRole === UserRole.ADMIN && (
                <>
                  <DetailCard>
                    <Label>Total Cost</Label>
                    <Value>${shiftDetails?.totalCost.toFixed(2)}</Value>
                  </DetailCard>
                  <DetailCard>
                    <Label>Total Profit</Label>
                    <Value>${shiftDetails?.totalProfit.toFixed(2)}</Value>
                  </DetailCard>
                </>
              )}
            </DetailGrid>
            
            <h3 style={{ color: AccentColor, margin: "20px 0" }}>
              Shift Breakdown
            </h3>
            <TabsContainer>
              <Tab
                active={activeTab === 'products'}
                onClick={() => setActiveTab('products')}
              >
                Products
              </Tab>
              <Tab
                active={activeTab === 'orders'}
                onClick={() => setActiveTab('orders')}
              >
                Orders
              </Tab>
            </TabsContainer>

            {activeTab === 'products' && (
              <Table>
                <thead>
                  <tr>
                    <Th>Product Name</Th>
                    <Th>Quantity Sold</Th>
                    <Th>Total Sales</Th>
                    {currentUserRole === UserRole.ADMIN && (
                      <>
                        <Th>Total Cost</Th>
                        <Th>Total Profit</Th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {getProductSummary().map((product, index) => (
                    <tr key={index}>
                      <Td>{product.productName}</Td>
                      <Td>{product.quantity}</Td>
                      <Td>${product.totalSales.toFixed(2)}</Td>
                      {currentUserRole === UserRole.ADMIN && (
                        <>
                          <Td>${product.totalCost.toFixed(2)}</Td>
                          <Td>${product.totalProfit.toFixed(2)}</Td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            {activeTab === 'orders' && (
              <Table>
                <thead>
                  <tr>
                    <Th>Order Number</Th>
                    <Th>Date/Time</Th>
                    <Th>Items</Th>
                    <Th>Total</Th>
                    {currentUserRole === UserRole.ADMIN && (
                      <>
                        <Th>Cost</Th>
                        <Th>Profit</Th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {shiftDetails.orders.map((order) => (
                    <tr key={order.id}>
                      <Td>{order.orderNumber}</Td>
                      <Td>{new Date(order.dateTime).toLocaleString()}</Td>
                      <Td>
                        {order.purchasedItems.map((item, index) => (
                          <div key={index}>
                            {item.quantity} x {item.productName} (${item.total.toFixed(2)})
                          </div>
                        ))}
                      </Td>
                      <Td>${order.totalAmount.toFixed(2)}</Td>
                      {currentUserRole === UserRole.ADMIN && (
                        <>
                          <Td>${order.totalCost.toFixed(2)}</Td>
                          <Td>${order.totalProfit.toFixed(2)}</Td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        ) : (
          <Message>No shift details available.</Message>
        )}
      </PageContainer>
    </Page>
  );
};

export default ShiftDetails;