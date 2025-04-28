import { Alert } from "@mui/material";
import styled from "styled-components";
import { theme } from "../theme";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  min-height: calc(100vh - 100px);
  overflow-y: auto;
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #e0e0e0;
`;

export const PageTitle = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  gap: 10px;
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 20px;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  height: 100%;
  overflow-y: auto;
`;

export const BackButton = styled.div`
  cursor: pointer;
`;

export const TableWrapper = styled.div`
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  margin: 10px 0;
  border-radius: 10px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Poppins", sans-serif;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  th,
  td {
    padding: 12px;
    text-align: left;
  }

  th {
    background-color: #ff6b6b; /* Header color */
    color: white;
    font-weight: bold;
    /* white-space: nowrap; */
  }
  tr {
    border-bottom: 1px solid #ddd;
  }
  tr:hover {
    background-color: #f9f9f9; /* Hover effect for rows */
  }
`;

export const ButtonsGroup = styled.div`
  display: flex;
  gap: 7px;
`;

export const CenterButton = styled.div`
  display: flex;
  justify-content: center;
  & > button {
    width: 100%;
  }
`;

export const Button = styled.button`
  background-color: #ff6b6b;
  border: none;
  color: white;
  display: flex;
  justify-content: center;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  text-align: center;
  gap: 5px;
  &:hover {
    background-color: #f94d71;
  }
`;

export const CancelButton = styled(Button)`
  background-color: #ffffff;
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  &:hover {
    background-color: #f94d71;
    color: white;
  }
`;

export const StyledButton = styled.button`
  background-color: #ff6b6b;
  color: #ffffff;
  padding: 14px 30px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s;
  margin-top: 20px; /* Add space above the button */
  align-self: center; /* Center the button */
  &:hover {
    background-color: #e55b5b; /* Slightly darker shade */
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
  }
`;

export const Label = styled.label`
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
`;

export const Input = styled.input`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-size: 16px;
  height: 22px;
  /* text-align: center; */
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
  &:hover {
    border-color: #ff6b6b; /* Matches button background color */
  }

  &:focus {
    border-color: #ff6b6b; /* Matches button hover color */
    box-shadow: 0 0 8px rgba(255, 107, 107, 1); /* Slight glow with focus color */
    outline: none;
  }
`;

export const InputBox = styled.input`
width: calc(100% - 16px);
min-width: 50px;
padding: 8px;
font-size: 1em;
border: 1px solid ${theme.colors.lightGrey};
border-radius: 4px;
transition: border-color 0.3s;
&:focus {
  border-color: ${theme.colors.primary};
  box-shadow: 0 0 3px ${theme.colors.primary};
}
`;

export const Select = styled.select`
  padding: 12px;
  font-size: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  width: 100%;
  transition: border-color 0.3s;
  &:focus {
    border-color: #ff6b6b;
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  margin: 8px 0;
`;

export const RadioButton = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 16px;
  color: #555;

  &:hover input {
    border-color: #ff6b6b; /* Matches Input hover */
  }
`;

export const RadioInput = styled.input`
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  transition:
    border-color 0.3s ease,
    background-color 0.3s ease;

  &:checked {
    border-color: #f94d71; /* Matches Input focus */
    background-color: #ff6b6b; /* Matches Button default */
  }

  &:hover {
    border-color: #ff6b6b; /* Matches Input hover */
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(249, 77, 113, 0.5); /* Focus effect */
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  gap: 20px;
  margin: 8px 0;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 16px;
  color: #555;

  &:hover input {
    border-color: #ff6b6b; /* Matches Input hover */
  }
`;

export const CheckboxInput = styled.input`
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #e0e0e0;
  border-radius: 4px; /* Square corners with slight rounding */
  transition:
    border-color 0.3s ease,
    background-color 0.3s ease;

  &:checked {
    border-color: #f94d71; /* Matches Input focus */
    background-color: #ff6b6b; /* Matches Button default */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20.285 6.704a1 1 0 0 0-1.416 0L9 16.573l-4.285-4.286a1 1 0 0 0-1.416 1.416l5 5a1 1 0 0 0 1.416 0l10-10a1 1 0 0 0 0-1.416z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
  }

  &:hover {
    border-color: #ff6b6b; /* Matches Input hover */
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(249, 77, 113, 0.5); /* Focus effect */
  }
`;

export const AlertNotif = styled(Alert)`
  position: absolute;
  top: 10px;
  right: 42%;
  z-index: 10;
`;

export const ErrorMessage = styled.span`
  color: red;
  font-size: 12px;
  margin-top: 5px;
`;