import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import {
  closeShiftThunk,
  fetchCurrentUserShiftThunk,
  openShiftThunk,
} from "../Redux/shiftSlice";
import Page from "../common/Page";
import {
  AlertNotif,
  Input,
  PageContainer,
  PageHeader,
  StyledButton,
} from "../../utils/BaseStyledComponents";
import { Fade } from "@mui/material";
import { UserRole } from "../../utils/enums";
import { fetchCurrentUserThunk } from "../Redux/userSlice";

// New Color Palette
const AccentColor = "#ff6b6b";
const NeutralBackground = "#f5f5f5";
const CardBackground = "#ffffff";
const ShadowColor = "rgba(0, 0, 0, 0.05)";
const TextGray = "#444";


// Styled Components
const ShiftSummaryContainer = styled.div`
  background-color: ${CardBackground};
  margin-top: 20px;
  border: 1px solid ${AccentColor};
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px ${ShadowColor};
  width: calc(100vw - 125px);
`;

const OpenShiftContainer = styled.div`
  display: flex;
  gap: 10px;
  > * {
    flex: 1;
    white-space: nowrap;
  }
`;

const ClosedShiftContainer = styled.div`
  display: flex;
  gap: 10px;
  > * {
    flex: 1;
    white-space: nowrap;
  }
`;

const ShiftDeatilsSetcion = styled.div`
  width: calc(100vw - 110px);
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

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
`;

const DetailCard = styled.div`
  background-color: ${CardBackground};
  padding: 15px; /* Reduced padding */
  border-radius: 12px;
  box-shadow: 0 4px 10px ${ShadowColor};
  transition:
    transform 0.2s,
    box-shadow 0.3s;
  display: flex; /* Ensures content alignment */
  flex-direction: column;
  align-items: flex-start; /* Align content to the left */
  gap: 5px; /* Add small spacing between items */
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px ${ShadowColor};
  }
`;

const Label = styled.h4`
  font-size: 1rem;
  color: ${TextGray};
  margin: 0; /* Remove bottom margin */
`;

const Value = styled.p`
  font-size: 1.4rem;
  font-weight: bold;
  color: ${AccentColor};
  margin: 0; /* Remove margins for tighter layout */
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: ${TextGray};
  margin-top: 30px;
  text-align: center;
`;

const LoadingMessage = styled(Message)`
  color: ${AccentColor};
`;

const ErrorMessage = styled(Message)`
  color: ${AccentColor};
`;

// Main Component
const CurrentShiftPage = () => {
  const dispatch = useDispatch();
  const { currentUserShift, loading, error } = useSelector(
    (state) => state.shifts
  );
  const currentUserRole = useSelector((state) => state.user.currentUserRole);
  const [openingCashAmount, setOpeningCashAmount] = useState("");
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    dispatch(fetchCurrentUserThunk());
    dispatch(fetchCurrentUserShiftThunk());
  }, [dispatch]);

  const onOpenShift = async (openingCashAmount) => {
    if (openingCashAmount) {
      const response = await dispatch(openShiftThunk(openingCashAmount));
      if (response.type.includes("fulfilled")) {
        dispatch(fetchCurrentUserShiftThunk());
        setAlert({
          message: "Shift opened successfully",
          type: "success",
        });
      } else {
        setAlert({
          message: "Failed to open shift",
          type: "error",
        });
      }
    } else {
      setAlert({
        message: "Please enter the amount of money to start the shift.",
        type: "error",
      });
    }
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };
  console.log("currentUserShift: ", currentUserShift);

  const handleCloseShift = () => {
    dispatch(closeShiftThunk(currentUserShift?.id));
  };

  if (loading) return <LoadingMessage>Loading shift data...</LoadingMessage>;
  if (error) return <ErrorMessage>Error: {error}</ErrorMessage>;

  return (
    <Page style={{ background: NeutralBackground }}>
      <PageContainer>
        <PageHeader>
          <h2 style={{ color: AccentColor }}>Current Shift Overview</h2>
        </PageHeader>

        {/* Shift Summary Section */}
        <ShiftSummaryContainer>
          {currentUserShift ? (
            <OpenShiftContainer>
              <div>
                <SummaryItem>
                  <h3>Manager</h3>
                  <p>
                    {currentUserShift?.user?.username}
                  </p>
                </SummaryItem>
                <SummaryItem>
                  <h3>Status</h3>
                  <p>{currentUserShift?.status}</p>
                </SummaryItem>
              </div>
              <div>
                <SummaryItem>
                  <h3>Start Time</h3>
                  <p>
                    {new Date(currentUserShift?.startTime).toLocaleString()}
                  </p>
                </SummaryItem>
                <StyledButton onClick={handleCloseShift}>
                  Close Shift
                </StyledButton>
              </div>
            </OpenShiftContainer>
          ) : (
            <ClosedShiftContainer>
              <Input
                type="number"
                inputMode="decimal"
                step="0.001"
                value={openingCashAmount}
                onChange={(e) => setOpeningCashAmount(e.target.value)}
                placeholder="Enter starting amount"
              />
              <StyledButton onClick={() => onOpenShift(openingCashAmount)}>
                Start Shift
              </StyledButton>
            </ClosedShiftContainer>
          )}
        </ShiftSummaryContainer>
        {currentUserShift && (
          <ShiftDeatilsSetcion>
            {/* Shift Details Section */}
            <h3 style={{ color: AccentColor, marginBottom: "20px" }}>
              Shift Details
            </h3>
            <DetailGrid>
              <DetailCard>
                <Label>Starting Amount</Label>
                <Value>${currentUserShift?.openingCashAmount}</Value>
              </DetailCard>
              <DetailCard>
                <Label>Total Amount</Label>
                <Value>${currentUserShift?.totalAmount}</Value>
              </DetailCard>
              <DetailCard>
                <Label>Total Sales</Label>
                <Value>${currentUserShift?.totalSales}</Value>
              </DetailCard>
              <DetailCard>
                <Label>Total Items</Label>
                <Value>{currentUserShift?.totalItems}</Value>
              </DetailCard>
              <DetailCard>
                <Label>Total Discounts</Label>
                <Value>${currentUserShift?.totalDiscounts}</Value>
              </DetailCard>
              <DetailCard>
                <Label>Total Refunds</Label>
                <Value>${currentUserShift?.totalRefunds}</Value>
              </DetailCard>
              <DetailCard>
                <Label>Total Transactions</Label>
                <Value>{currentUserShift?.totalTransactions}</Value>
              </DetailCard>
              {currentUserRole === UserRole.ADMIN && (
                <>
                  <DetailCard>
                    <Label>Total Cost</Label>
                    <Value>${currentUserShift?.totalCost}</Value>
                  </DetailCard>
                  <DetailCard>
                    <Label>Total Profit</Label>
                    <Value>${currentUserShift?.totalProfit}</Value>
                  </DetailCard>
                </>
              )}
            </DetailGrid>
          </ShiftDeatilsSetcion>
        )}
        <Fade in={alert}>
          <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
        </Fade>
      </PageContainer>
    </Page>
  );
};

export default CurrentShiftPage;
