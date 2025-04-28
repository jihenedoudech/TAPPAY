import React from "react";
import Popup from "../../common/Popup";
import styled from "styled-components";
import { Button, ButtonsGroup } from "../../../utils/BaseStyledComponents";
import { InventoryStatus } from "../../../utils/enums";
import { CircularProgress } from "@mui/material";

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

const CancelButton = styled(Button)`
  background-color: #ffffff;
  border: 1px solid #ff6b6b;
  color: #ff6b6b;

  &:hover {
    background-color: #f94d71;
    color: white;
  }
`;

const ConfirmSaveTab = ({ setShowConfirmSave, saveInventory, isLoading }) => {
  return (
    <Popup title="Confirm Save" onClose={() => setShowConfirmSave(false)}>
      <Container>
        <H2>
          Some Products Found quantities is not set.
          <br />
          Do you want to save this as
          <Highlight> Draft</Highlight>?
        </H2>


        <ButtonsGroup>
          <CancelButton onClick={() => setShowConfirmSave(false)}>
            Cancel
          </CancelButton>
          <Button onClick={() => saveInventory(InventoryStatus.DRAFT)} disabled={isLoading}>
            {isLoading ? <CircularProgress /> : "Save"}
          </Button>
        </ButtonsGroup>
      </Container>
    </Popup>

  );
};

export default ConfirmSaveTab;
