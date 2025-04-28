import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import CardMembershipOutlinedIcon from "@mui/icons-material/CardMembershipOutlined";
import RedeemOutlinedIcon from "@mui/icons-material/RedeemOutlined";
import { Alert, Fade, TextField } from "@mui/material";
import Popup from "../common/Popup";
import Process from "../common/Process";
import { useDispatch, useSelector } from "react-redux";
import { theme } from "../../theme";
import { addPaymentMethod } from "../Redux/paymentSlice";
import { Method } from "../../utils/enums";
import CheckDetailsPopup from "./CheckDetailsPopup";

const Container = styled.div`
  margin: 0px 30px 20px 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  font-size: 16px;
  max-width: 700px;
  margin: auto;
`;

const Heading = styled.div`
  font-size: 26px;
  color: ${theme.colors.primary};
  margin-bottom: 12px;
  font-weight: 600;
  text-align: center;
  border-bottom: 2px solid ${theme.colors.primary};
  padding-bottom: 8px;
`;

const PaymentGrid = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
`;

const PaymentBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  gap: 10px;
  background: ${(props) =>
    props.disabled
      ? "linear-gradient(135deg, #f1f1f1, #e1e1e1)"
      : "linear-gradient(135deg, #ffffff, #f7f7f7)"};
  border: 2.5px solid
    ${(props) => (props.disabled ? "#d0d0d0" : theme.colors.primary)};
  border-radius: 15px;
  box-shadow: ${(props) =>
    props.disabled ? "none" : "0 8px 16px rgba(0, 0, 0, 0.1)"};
  color: ${(props) => (props.disabled ? "#B0B0B0" : theme.colors.text)};
  font-size: 20px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

  &:hover {
    transform: ${(props) => (props.disabled ? "none" : "translateY(-6px)")};
    box-shadow: ${(props) =>
      props.disabled ? "none" : "0 10px 20px rgba(0, 0, 0, 0.15)"};
    color: ${(props) => (props.disabled ? "#B0B0B0" : theme.colors.primary)};
  }

  svg {
    font-size: 2.7rem;
    color: ${(props) => (props.disabled ? "#B0B0B0" : theme.colors.iconColor)};
    transition: color 0.3s;
  }

  &:hover svg {
    color: ${(props) => (props.disabled ? "#B0B0B0" : theme.colors.primary)};
  }
`;

const AlertNotif = styled(Alert)`
  position: absolute;
  top: 15px;
  right: 50%;
  transform: translateX(50%);
  z-index: 10;
`;

const PopupContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ButtonContainer = styled.div`
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 16px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background-color: ${theme.colors.primary};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #f94d4d;
    color: #e0f7fa;
  }
`;

const PaymentMethods = (props) => {
  const dispatch = useDispatch();
  const customer = useSelector((state) => state.customers.selectedCustomer);
  const remainingAmount = useSelector((state) => state.payment.remainingAmount);
  const [showPoints, setShowPoints] = useState(false);
  const [amountToPay, setAmountToPay] = useState(remainingAmount);
  const [pointsError, setPointsError] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showCreditCardProcess, setShowCreditCardProcess] = useState(false);
  const [showVoucherProcess, setShowVoucherProcess] = useState(false);
  const [expiredAlert, setExpiredAlert] = useState(false);
  const [showCheckDetails, setShowCheckDetails] = useState(false);
  
  const handleSelectCheck = () => setShowCheckDetails(true);
  const handleSelectCreditCard = () => setShowCreditCardProcess(true);
  // const handleSelectVoucher = () => setShowVoucherProcess(true);
  const handleSelectVoucher = () => {
    dispatch(addPaymentMethod({ method: Method.VOUCHER, amount: remainingAmount }));
  };

  useEffect(() => {
    setPointsError(calculatePointsNeeded() > customer?.loyaltyCard?.points);
  }, [amountToPay]);

  const handleSelectCash = () => {
    console.log("amountToPay: ", amountToPay);
    dispatch(addPaymentMethod({ method: Method.CASH, amount: remainingAmount }));
  };

  const handleSelectLoyaltyCard = () => {
    const expirationDate = new Date(customer.loyaltyCard.expirationDate);
    const currentDate = new Date();
    if (expirationDate < currentDate) {
      setExpiredAlert(true);
      setTimeout(() => setExpiredAlert(false), 1500);
      return;
    }

    if (customer.loyaltyCard.points !== 0) {
      const maxPayableAmount = Math.floor(customer.loyaltyCard.points / 33);
      const initialAmountToPay =
        remainingAmount > maxPayableAmount ? maxPayableAmount : remainingAmount;
      setAmountToPay(initialAmountToPay);
      setShowPoints(true);
    } else {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 1500);
    }
  };

  const calculatePointsNeeded = () => Math.ceil(amountToPay * 33);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "amountToPay") {
      const amount = parseFloat(value) || 0;
      setAmountToPay(amount);
    }
  };

  const handleConfirm = () => {
    if (!pointsError && amountToPay !== 0) {
      setShowPoints(false);
      const pointsToDeduct = Math.ceil(amountToPay * 33);
      const updatedPoints = customer.loyaltyCard.points - pointsToDeduct;
      // Update customer loyalty card points in the state here, if needed.
    }
  };

  const handleConfirmCheck = async (checkDetails) => {
    if (checkDetails.checkNumber && checkDetails.issueDate) {
      const result = await dispatch(
        addPaymentMethod({
          method: Method.CHECK,
          amount: remainingAmount,
          checkNumber: checkDetails.checkNumber,
          bankName: checkDetails.bankName,
          accountHolderName: checkDetails.accountHolderName,
          issueDate: new Date(checkDetails.issueDate),
        })
      );
      console.log("result: ", result);
      setShowCheckDetails(false);
    }
  };

  return (
    <Container>
      <Heading>Payment Method</Heading>
      <PaymentGrid>
        <PaymentBox onClick={handleSelectCash}>
          <AttachMoneyOutlinedIcon />
          Cash
        </PaymentBox>
        <PaymentBox onClick={handleSelectCreditCard}>
          <CreditCardOutlinedIcon />
          Credit Card
        </PaymentBox>
        {showCreditCardProcess && (
          <Process setShowProcess={setShowCreditCardProcess} />
        )}
        <PaymentBox onClick={handleSelectCheck}>
          <DriveFileRenameOutlineOutlinedIcon />
          Check
        </PaymentBox>
        {showCheckDetails && (
          <CheckDetailsPopup
            onConfirm={handleConfirmCheck}
            onClose={() => setShowCheckDetails(false)}
          />
        )}
        {customer?.loyaltyCard ? (
          <PaymentBox
            onClick={handleSelectLoyaltyCard}
            disabled={
              !customer.loyaltyCard ||
              new Date(customer.loyaltyCard.expirationDate) < new Date()
            }
          >
            <CardMembershipOutlinedIcon />
            Loyalty Card
          </PaymentBox>
        ) : (
          <PaymentBox disabled>
            <CardMembershipOutlinedIcon />
            Loyalty Card
          </PaymentBox>
        )}
        {expiredAlert && (
          <Fade in={expiredAlert}>
            <AlertNotif severity="error">Loyalty Card Expired!</AlertNotif>
          </Fade>
        )}
        {showAlert && (
          <Fade in={showAlert}>
            <AlertNotif severity="warning">Insufficient points!</AlertNotif>
          </Fade>
        )}
        {showPoints && (
          <Popup
            title="Pay with Loyalty Card"
            onClose={() => setShowPoints(false)}
          >
            <PopupContent>
              <TextField
                label="Amount to pay"
                name="amountToPay"
                type="number"
                inputMode="decimal"
                step="0.001"
                value={amountToPay}
                onChange={handleChange}
                size="small"
                InputLabelProps={{ shrink: true }}
                error={pointsError}
                helperText={
                  pointsError
                    ? `Insufficient points. Points required: ${calculatePointsNeeded()}`
                    : ""
                }
              />
              <div>Points available: {customer.loyaltyCard.points}</div>
              <div>Points needed: {calculatePointsNeeded()}</div>
            </PopupContent>
            <ButtonContainer>
              <Button onClick={handleConfirm}>Confirm</Button>
            </ButtonContainer>
          </Popup>
        )}
        <PaymentBox onClick={handleSelectVoucher}>
          <RedeemOutlinedIcon />
          Voucher
        </PaymentBox>
        {showVoucherProcess && (
          <Process setShowProcess={setShowVoucherProcess} />
        )}
      </PaymentGrid>
    </Container>
  );
};

export default PaymentMethods;
