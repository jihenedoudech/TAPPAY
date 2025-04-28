import React, { useEffect, useState } from "react";
import styled from "styled-components";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { useNavigate } from "react-router-dom";
import { Alert, Fade, CircularProgress } from "@mui/material";
import PrintReceipt from "../ordersPage/PrintReceipt";
import { GeneralCalculator } from "../common/Calculator";
import { useDispatch, useSelector } from "react-redux";
import {
  payOrderThunk,
  removePaymentMethod,
  resetPayments,
  selectPaymentMethod,
  updatePaymentMethod,
} from "../Redux/paymentSlice";
import { theme } from "../../theme";
import { clearCart } from "../Redux/cartSlice";
import { resetCurrentOrder } from "../Redux/orderSlice";

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
`;

const Total = styled.div`
  & > * {
    display: flex;
    justify-content: space-between;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 12px; // Spacing between items
  }
`;

const Payments = styled.div`
  margin: 15px 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  row-gap: 10px;
`;

const Payment = styled.div`
  padding: 10px 15px; // Increased padding for better touch targets
  display: flex;
  justify-content: space-between;
  border: ${(props) =>
    props.selected
      ? `solid 2px ${theme.colors.primary}`
      : "solid 1px #bdbdbd"}; // Teal for selected
  border-radius: 12px;
  cursor: pointer;
  background-color: #ffffff; // White background for payments
  transition: all 0.3s; // Smooth transition
  &:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15); // Hover shadow
    background-color: #e0f7fa; // Light teal background on hover
  }
`;

const Amount = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${theme.colors.text}; // Darker text for better contrast
`;

const Buttons = styled.div`
  display: flex;
  gap: 15px; // Increased gap for better spacing
  margin-top: 15px; // Margin above buttons
`;

const Button = styled.button`
  flex: 1;
  padding: 12px; // Slightly larger padding
  font-size: 18px;
  font-weight: bold;
  color: #ffffff; // White text for buttons
  background-color: ${theme.colors.primary};
  border: none;
  border-radius: 8px; // Rounded buttons
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.2s; // Smooth transition
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); // Button shadow
  &:hover {
    background-color: #f94d4d;
    transform: translateY(-1px); // Lift effect on hover
  }
`;

const AlertNotif = styled(Alert)`
  position: absolute;
  top: 20px;
  right: 42%; // Adjusted position for better alignment
  z-index: 10;
`;

const MiddlePanel = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentOrder = useSelector((state) => state.orders.currentOrder);
  const [printPopup, setPrintPopup] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    paymentMethods,
    selectedPaymentMethod,
    totalAmountDue,
    totalPaidAmount,
    remainingAmount,
    changeAmount,
    isFullyPaid,
  } = useSelector((state) => state.payment);
  // const changeAmount =
  //   totalPaidAmount > totalAmountDue ? totalPaidAmount - totalAmountDue : 0;
  const [inputValue, setInputValue] = useState(""); // Track calculator input

  // console.log(payments);
  const handleSelectPaymentMethod = (method) => {
    dispatch(selectPaymentMethod(method));
    setInputValue("");
  };

  const handleRemovePayment = (method) => {
    console.log(`Removing payment: ${method}`);
    dispatch(removePaymentMethod({ method }));
  };

  const handleCalculatorButtonClick = (key) => {
    if (selectedPaymentMethod) {
      setInputValue((prev) => {
        let newInput;
        if (key === "C" || key === "Backspace") {
          newInput = prev.slice(0, -1);
          if (newInput.length === 0) {
            newInput = "0";
          }
        } else if (key === "." || key === "Decimal") {
          if (prev === "0" || prev === "") {
            newInput = "0.";
          } else if (!prev.includes(".")) {
            newInput = prev + ".";
          } else {
            newInput = prev;
          }
        } else if (!isNaN(key)) {
          if (prev === "0") {
            newInput = key;
          } else {
            newInput = prev + key;
          }
        } else {
          return prev;
        }
        const amount = parseFloat(newInput) || 0;
        dispatch(updatePaymentMethod({ amount }));
        return newInput;
      });
    } else {
      setAlert({
        message: "Please select a payment method first",
        type: "error",
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      const { key } = event;
      if (
        (!isNaN(key) && key !== " ") || // Numeric keys
        key === "." ||
        key === "Backspace" ||
        key === "Enter"
      ) {
        event.preventDefault();
        if (key === "Enter") {
          // Optional: Handle enter key separately if needed
          return;
        }
        handleCalculatorButtonClick(key);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedPaymentMethod]);

  const handlePay = async () => {
    if (isLoading) return;
    setIsLoading(true);
    if (totalPaidAmount >= totalAmountDue) {
      const response = await dispatch(
        payOrderThunk({
          orderId: currentOrder.id,
          paymentMethods,
          totalAmountDue,
          totalPaidAmount,
          remainingAmount,
          changeAmount,
          isFullyPaid,
        })
      );
      console.log("pay response");
      if (response.type.includes("fulfilled")) {
        // setPrintPopup(true);
        dispatch(resetPayments());
        dispatch(clearCart());
        dispatch(resetCurrentOrder());
        navigate("/");
      } else {
        setAlert({
          message: "Error while paying order",
          type: "error",
        });
      }
    } else {
      setAlert({
        message: "Insufficient amount paid!",
        type: "error",
      });
    }
    setTimeout(() => setAlert(null), 1500);
    setIsLoading(false);
  };

  const handleCancel = () => {
    if (isLoading) return;
    setIsLoading(true);
    navigate("/");
    setIsLoading(false);
  };

  const handleAfterPrint = () => {
    setPrintPopup(false);
    navigate("/");
  };

  const handlePrintCancel = () => {
    setPrintPopup(false);
    navigate("/");
  };

  return (
    <Container>
      {/* Displaying payment summary */}
      <Total>
        <div>
          <div>Total :</div>
          <div>{totalAmountDue.toFixed(2)} DT</div>
        </div>
        <div>
          <div>Paid :</div>
          <div>{parseFloat(totalPaidAmount).toFixed(2)} DT</div>
        </div>
        <div>
          <div>Remaining :</div>
          <div>{remainingAmount.toFixed(2)} DT</div>
        </div>
        <div>
          <div>Change :</div>
          <div>{changeAmount.toFixed(2)} DT</div>
        </div>
      </Total>

      {/* Payment methods display */}
      <Payments>
        {paymentMethods?.map((payment, index) => (
          <Payment
            key={index}
            isSelected={payment.isSelected}
            onClick={() => handleSelectPaymentMethod(payment.method)}
            selected={selectedPaymentMethod === payment.method}
          >
            <div>{payment.method} :</div>
            <Amount>
              {payment.amount} DT
              <CloseOutlinedIcon
                fontSize="small"
                style={{ cursor: "pointer", color: "#e53935" }} // Red color for close icon
                onClick={() => handleRemovePayment(payment.method)}
              />
            </Amount>
          </Payment>
        ))}
      </Payments>

      {/* Calculator and action buttons */}
      <div>
        {/* <Calculator
          onButtonClick={(key) => console.log(`Pressed key: ${key}`)}
        /> */}
        <GeneralCalculator onButtonClick={handleCalculatorButtonClick} />
        <Buttons>
          <Button onClick={handlePay} disabled={isLoading}>{isLoading ? <CircularProgress size={24} /> : "Pay"}</Button>
          <Button onClick={handleCancel} disabled={isLoading}>{isLoading ? <CircularProgress size={24} /> : "Cancel"}</Button>
        </Buttons>
      </div>

      {/* Alert for insufficient payment */}
      <Fade in={alert}>
        <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
      </Fade>

      {/* Print receipt popup */}
      {printPopup && (
        <PrintReceipt
          orders={[currentOrder]}
          handleAfterPrint={handleAfterPrint}
          handlePrintCancel={handlePrintCancel}
        />
      )}
    </Container>
  );
};

export default MiddlePanel;
