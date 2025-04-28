import React from "react";
import Popup from "./Popup";
import { Button, ButtonsGroup, CancelButton } from "../../utils/BaseStyledComponents";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const Highlight = styled.span`
  font-weight: bold;
  color: #ff6b6b;
`;

const H2 = styled.h2`
  margin: 0 10px;
`;

const DeleteConfirmation = ({ itemName, onCancel, onDelete }) => {
  return (
    <Popup title="Delete Confirmation" onClose={onCancel}>
      <Container>
        <H2>
          Are you sure you want to delete{" "}
          <Highlight>{itemName ? itemName : "this item"}</Highlight> ?
        </H2>
        <ButtonsGroup>
          <CancelButton onClick={onCancel}>No</CancelButton>
          <Button primary onClick={onDelete}>
            Yes
          </Button>
        </ButtonsGroup>
      </Container>
    </Popup>
  );
};

export default DeleteConfirmation;
