import React, { useState } from "react";
import styled from "styled-components";
import { TextField } from "@mui/material";
import Popup from "../common/Popup";

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
  background-color: ${(props) => props.theme.colors.primary};
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

const CheckDetailsPopup = ({ onClose, onConfirm }) => {
  const [checkDetails, setCheckDetails] = useState({
    checkNumber: "",
    bankName: "",
    accountHolderName: "",
    issueDate: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCheckDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleConfirm = () => {
    if (checkDetails.checkNumber && checkDetails.issueDate) {
      onConfirm(checkDetails);
      onClose();
    }
  };

  return (
    <Popup title="Check Details" onClose={onClose}>
      <PopupContent>
        <TextField
          label="Check Number"
          name="checkNumber"
          type="number"
          value={checkDetails.checkNumber}
          onChange={handleChange}
          size="small"
        />
        <TextField
          label="Bank Name"
          name="bankName"
          type="text"
          value={checkDetails.bankName}
          onChange={handleChange}
          size="small"
        />
        <TextField
          label="Account Holder Name"
          name="accountHolderName"
          type="text"
          value={checkDetails.accountHolderName}
          onChange={handleChange}
          size="small"
        />
        <TextField
          label="Issue Date"
          name="issueDate"
          type="date"
          value={checkDetails.issueDate}
          onChange={handleChange}
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
        />
      </PopupContent>
      <ButtonContainer>
        <Button onClick={handleConfirm}>Confirm</Button>
      </ButtonContainer>
    </Popup>
  );
};

export default CheckDetailsPopup;