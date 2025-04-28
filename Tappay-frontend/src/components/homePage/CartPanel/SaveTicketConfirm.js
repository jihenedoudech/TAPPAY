import React from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "../../Redux/cartSlice";
import { resetCurrentOrder } from "../../Redux/orderSlice";
import Popup from "../../common/Popup";
import {
  Button,
  ButtonsGroup,
  CancelButton,
} from "../../../utils/BaseStyledComponents";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const H2 = styled.h2`
  margin: 0 10px;
`;

const SaveTicketConfirm = ({
  setShowSaveConfirm,
  confirmNavigation,
  handleSave,
}) => {
  const dispatch = useDispatch();

  const handleConfirm = () => {
    handleSave();
    if (confirmNavigation) {
      confirmNavigation();
    }
  };
  const handleClose = () => {
    setShowSaveConfirm(false);
  };
  const handleCancel = () => {
    setShowSaveConfirm(false);
    dispatch(clearCart());
    dispatch(resetCurrentOrder());
    if (confirmNavigation) {
      confirmNavigation();
    }
  };

  return (
    <Popup title="Save Order Confirmation" onClose={handleClose}>
      <Container>
        <H2>Do you want to save this ticket?</H2>
        <ButtonsGroup>
          <CancelButton onClick={handleCancel}>No</CancelButton>
          <Button onClick={handleConfirm}>Yes</Button>
        </ButtonsGroup>
      </Container>
    </Popup>
  );
};

export default SaveTicketConfirm;
