import React from "react";
import Popup from "../../common/Popup";
import styled from "styled-components";
import { Button } from "../../../utils/BaseStyledComponents";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  margin-top: -10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
`;

const OptionButton = styled(Button)`
  width: 100%;
  max-width: 300px;
  padding: 15px;
  font-weight: bold;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

const ContinueTab = ({ setShowContinueTab, inventory }) => {
  const navigate = useNavigate();

  const onContinueWithCurrentState = () => {
    navigate(`/inventory/inventories/add-inventory/${inventory.id}`, {
      state: { continueWithLastState: false },
    });
  };

  const onContinueWithStartDateState = () => {
    navigate(`/inventory/inventories/add-inventory/${inventory.id}`, {
      state: { continueWithLastState: true },
    });
  };

  return (
    <Popup title="Continue Inventory" onClose={() => setShowContinueTab(false)}>
      <Container>
        <h3>How would you like to continue this inventory?</h3>
        <OptionButton onClick={onContinueWithCurrentState}>
          Use Current Stock Levels
        </OptionButton>
        <OptionButton onClick={onContinueWithStartDateState}>
          Restore Stock to Last Inventory State
        </OptionButton>
      </Container>
    </Popup>
  );
};

export default ContinueTab;