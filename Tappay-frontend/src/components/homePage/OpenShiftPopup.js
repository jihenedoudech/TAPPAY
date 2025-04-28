import React, { useState } from "react";
import styled from "styled-components";
import Popup from "../common/Popup";
import { Button, Input } from "../../utils/BaseStyledComponents";
import { useDispatch } from "react-redux";
import { openShiftThunk } from "../Redux/shiftSlice";
import { Alert, Fade } from "@mui/material";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
`;

const Text = styled.div`
  font-size: 16px;
  font-weight: bold;
`;

const AlertNotif = styled(Alert)`
  position: absolute;
  top: 10px;
  right: 42%;
  z-index: 10;
`;

const OpenShiftPopup = () => {
  const dispatch = useDispatch();
  const [openingCashAmount, setOpeningCashAmount] = useState();
  const [showAlert, setShowAlert] = useState(false);

  const onOpenShift = (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    if (openingCashAmount) {
      dispatch(openShiftThunk(openingCashAmount));
      console.log(openingCashAmount);
    } else {
      emptyOpeningAmount();
    }
  };

  const emptyOpeningAmount = () => {
    if (!openingCashAmount) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 1500);
    }
  };

  return (
    <Popup title="Open New Shift">
      <Text>Enter the amount of money to start the shift.</Text>
      <Form onSubmit={onOpenShift}>
        <Input
          type="number"
          inputMode="decimal"
          step="0.001"
          value={openingCashAmount}
          onChange={(e) => setOpeningCashAmount(e.target.value)}
        />
        <Button type="submit">Open</Button>
      </Form>
      <Fade in={showAlert}>
        <AlertNotif severity="error">Please set an opening amount</AlertNotif>
      </Fade>
    </Popup>
  );
};

export default OpenShiftPopup;
