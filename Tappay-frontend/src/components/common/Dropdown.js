import React, { useState } from "react";
import styled from "styled-components";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.div`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 22px;
`;

const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0;
  margin: 5px 0 0;
  z-index: 1000;
  max-height: 300px; /* Set a maximum height */
  overflow-y: auto; /* Enable vertical scrolling */
`;

const DropdownItem = styled.li`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const AddCategoryButton = styled(DropdownItem)`
  font-weight: bold;
  color: #007bff;
  &:hover {
    background-color: #e7f3ff;
  }
`;

const Dropdown = ({ options, selectedOption, onSelect, onAdd }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <DropdownContainer>
      <DropdownButton onClick={handleToggle}>
        {selectedOption ? selectedOption.name : "Select an Option"}
        <KeyboardArrowDownIcon />
      </DropdownButton>
      {open && (
        <DropdownList>
          {options.map((option) => (
            <DropdownItem
              key={option.id}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              {option.name}
            </DropdownItem>
          ))}
          {onAdd && (
            <AddCategoryButton
              onClick={() => {
                onAdd();
                setOpen(false);
              }}
            >
              + Add New Option
            </AddCategoryButton>
          )}
        </DropdownList>
      )}
    </DropdownContainer>
  );
};

export default Dropdown;
