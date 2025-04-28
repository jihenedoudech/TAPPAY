import React, { useState } from "react";
import styled from "styled-components";
import Popup from "../../../common/Popup";
import { useDispatch } from "react-redux";
import { addSupplierThunk } from "../../../Redux/purchaseSlice";
import { removeNullValues } from "../../../../utils/utilsFunctions";
import { CircularProgress } from "@mui/material";

// Styled Components
const FormContainer = styled.div`
  position: relative;
  padding: 30px;
  /* width: 500px; */
  max-height: calc(100vh - 200px);
  overflow-y: auto;
`;

const FormGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
`;

const Button = styled.button`
  background-color: #ff6b6b;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
  &:hover {
    background-color: #f94d71;
  }
`;

const SupplierForm = ({ handleClose, handleSelectSupplier }) => {
  const dispatch = useDispatch();
  const [supplier, setSupplier] = useState({
    name: null,
    phone: null,
    company: null,
    brand: null,
    taxId: null,
    email: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (isLoading) return;
    setIsLoading(true);
    e.preventDefault();
    const filteredSupplier = removeNullValues(supplier);
    console.log(filteredSupplier);
    const response = await dispatch(addSupplierThunk(filteredSupplier));
    console.log("response: ", response);
    if (response.type.includes("fulfilled")) {
      console.log("response.payload from supplier: ", response.payload);
      await handleSelectSupplier(response.payload);
      setSupplier(null);
      handleClose();
    }
    setIsLoading(false);
    return;
  };

  return (
    <Popup title="Add New Supplier" onClose={handleClose}>
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <FormField>
              <Label>Name</Label>
              <Input
                type="text"
                value={supplier.name}
                onChange={(e) =>
                  setSupplier({ ...supplier, name: e.target.value })
                }
              />
            </FormField>
            <FormField>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={supplier.phone}
                onChange={(e) =>
                  setSupplier({ ...supplier, phone: e.target.value })
                }
              />
            </FormField>
          </FormGroup>
          <FormGroup>
            <FormField>
              <Label>Company</Label>
              <Input
                type="text"
                value={supplier.company}
                onChange={(e) =>
                  setSupplier({ ...supplier, company: e.target.value })
                }
              />
            </FormField>
            <FormField>
              <Label>Brand</Label>
              <Input
                type="text"
                value={supplier.brand}
                onChange={(e) =>
                  setSupplier({ ...supplier, brand: e.target.value })
                }
              />
            </FormField>
          </FormGroup>
          <FormGroup>
            <FormField>
              <Label>Tax ID</Label>
              <Input
                type="text"
                value={supplier.taxId}
                onChange={(e) =>
                  setSupplier({ ...supplier, taxId: e.target.value })
                }
              />
            </FormField>
            <FormField>
              <Label>Email</Label>
              <Input
                type="email"
                value={supplier.email}
                onChange={(e) =>
                  setSupplier({ ...supplier, email: e.target.value })
                }
              />
            </FormField>
          </FormGroup>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : "Add Supplier"}
          </Button>
        </form>
      </FormContainer>
    </Popup>
  );
};

export default SupplierForm;
