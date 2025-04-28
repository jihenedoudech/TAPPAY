import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
  fetchShiftsThunk,
  openShiftThunk,
  fetchCurrentUserShiftThunk,
  closeShiftThunk,
} from "../Redux/shiftSlice";
import ShiftsTable from "./ShiftsTable";
import Page from "../common/Page";
import {
  PageContainer,
  PageHeader,
  Button,
} from "../../utils/BaseStyledComponents";
import ShiftDetails from "./ShiftDetails";

const ShiftSummary = styled.div`
  background-color: #f8f8f8;
  border-radius: 10px;
  padding: 0 20px 20px 20px;
  margin: 15px 0;
`;

const DetailContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const DetailBlock = styled.div`
  margin: 0px 20px;
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
const CloseButton = styled(Button)`
  float: right;
`;

const ShiftsPage = () => {
  const dispatch = useDispatch();
  const { shiftsList, currentUserShift, loading, error } = useSelector(
    (state) => state.shifts
  );
  const [openingCashAmount, setOpeningCashAmount] = useState("");
  const [showFullDetails, setShowFullDetails] = useState(false);

  useEffect(() => {
    dispatch(fetchShiftsThunk());
    dispatch(fetchCurrentUserShiftThunk());
  }, [dispatch]);

  const onOpenShift = (openingCashAmount) => {
    if (openingCashAmount) {
      dispatch(openShiftThunk(openingCashAmount));
      console.log(openingCashAmount);
    } else {
      alert("Please enter the amount of money to start the shift.");
    }
  };

  const handleCloseShift = () => {
    console.log("closing shift");
    // dispatch(closeShiftThunk());
  };

  console.log("currentUserShift: ", currentUserShift);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Shifts</h2>
        </PageHeader>
        {currentUserShift ? (
          <ShiftSummary onClick={() => setShowFullDetails(true)}>
            <h2>Current Shift Summary</h2>
            <DetailContainer>
              <DetailBlock>
                <DetailItem>
                  <Label>Managed By:</Label>
                  <Value>
                    {currentUserShift.user.firstName}{" "}
                    {currentUserShift.user.lastName}
                  </Value>
                </DetailItem>
                <DetailItem>
                  <Label>Start Time:</Label>
                  <Value>
                    {new Date(currentUserShift.startTime).toLocaleTimeString()}
                  </Value>
                </DetailItem>
                <DetailItem>
                  <Label>Starting Amount:</Label>
                  <Value>
                    ${currentUserShift.openingCashAmount.toFixed(2)}
                  </Value>
                </DetailItem>
              </DetailBlock>
              <DetailBlock>
                <DetailItem>
                  <Label>Total Sales:</Label>
                  <Value>${currentUserShift.totalSales.toFixed(2)}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>Total Amount:</Label>
                  <Value>${currentUserShift.totalAmount.toFixed(2)}</Value>
                </DetailItem>
                <CloseButton onClick={handleCloseShift}>
                  Close Shift
                </CloseButton>
              </DetailBlock>
            </DetailContainer>
          </ShiftSummary>
        ) : (
          <div>
            <h2>Start a New Shift</h2>
            <input
              type="number"
              value={openingCashAmount}
              onChange={(e) => setOpeningCashAmount(e.target.value)}
              placeholder="Enter starting amount"
            />
            <Button onClick={() => onOpenShift(openingCashAmount)}>
              Start Shift
            </Button>
          </div>
        )}
        {showFullDetails && currentUserShift && (
          <ShiftDetails
            shift={currentUserShift}
            onClose={() => setShowFullDetails(false)}
          />
        )}
        <h2>Shift History</h2>
        <ShiftsTable shifts={shiftsList} />
      </PageContainer>
    </Page>
  );
};

export default ShiftsPage;
