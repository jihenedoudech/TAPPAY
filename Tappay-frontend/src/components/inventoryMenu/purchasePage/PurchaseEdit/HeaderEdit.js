import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { theme } from "../../../../theme";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  AlertNotif,
  Input,
  Select,
} from "../../../../utils/BaseStyledComponents";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSuppliersThunk,
  updatePurchaseCommonDataThunk,
} from "../../../Redux/purchaseSlice";
import { CircularProgress, Fade } from "@mui/material";

const FormContainer = styled.div`
  margin: 15px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid #ff6b6b;
  border-radius: 8px;
  background-color: white;
`;

const FormSection = styled.div`
  flex: 1;
  display: flex;
  gap: 16px;
  align-items: center;
  & > * {
    flex: 1;
  }
`;

const FieldContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FieldLabel = styled.span`
  font-weight: 600;
  color: ${theme.colors.darkGrey};
  min-width: 80px;
`;

const EditableField = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: ${theme.colors.primary};

  &:hover {
    color: ${theme.colors.primaryDark};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NoSupplierText = styled.span`
  color: ${theme.colors.grey};
  font-style: italic;
`;

const HeaderEdit = ({ purchaseRecordData }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const suppliers = useSelector((state) => state.purchase.suppliers);
  const [supplier, setSupplier] = useState(null);
  const [date, setDate] = useState(
    purchaseRecordData.date ? purchaseRecordData.date.split("T")[0] : ""
  );
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchSuppliersThunk());
  }, [dispatch]);

  useEffect(() => {
    if (suppliers.length > 0) {
      const selectedSupplier = suppliers.find(
        (s) => s?.id === purchaseRecordData?.supplier?.id
      );
      setSupplier(selectedSupplier || null);
    }
    console.log("supplier: ", purchaseRecordData.supplier);
  }, [suppliers, purchaseRecordData.supplier]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const purchaseData = {
      supplierId: supplier?.id,
      date,
    };
    console.log("purchaseData: ", purchaseData);
    const response = await dispatch(
      updatePurchaseCommonDataThunk({
        id: purchaseRecordData.id,
        purchaseData,
      })
    );
    if (response.type.includes("fulfilled")) {
      setAlert({
        type: "success",
        message: "Purchase record updated successfully",
      });
    } else {
      setAlert({
        type: "error",
        message: "Failed to update purchase record",
      });
    }
    setIsEditing(false);
    setIsLoading(false);
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  const handleCancelClick = () => {
    setSupplier(
      suppliers.find((s) => s?.id === purchaseRecordData.supplier) || null
    );
    setDate(
      purchaseRecordData.date ? purchaseRecordData.date.split("T")[0] : ""
    );
    setIsEditing(false);
  };

  const handleSupplierChange = (e) => {
    const selectedSupplierId = e.target.value;
    const selectedSupplier = suppliers.find((s) => s?.id === selectedSupplierId);
    setSupplier(selectedSupplier || null);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  return (
    <FormContainer>
      <FormSection>
        <FieldContainer>
          <FieldLabel>Supplier:</FieldLabel>
          <EditableField>
            {isEditing ? (
              <Select
                name="supplier"
                value={supplier?.id || ""}
                onChange={handleSupplierChange}
              >
                <option value="" disabled>
                  Select Supplier
                </option>
                {suppliers.map((supplier) => (
                  <option key={supplier?.id} value={supplier?.id}>
                    {supplier?.name}
                  </option>
                ))}
              </Select>
            ) : (
              <span>
                {supplier?.name ? (
                  supplier.name
                ) : (
                  <NoSupplierText>No supplier selected</NoSupplierText>
                )}
              </span>
            )}
          </EditableField>
        </FieldContainer>

        <FieldContainer>
          <FieldLabel>Date:</FieldLabel>
          <EditableField>
            {isEditing ? (
              <Input
                type="date"
                name="date"
                value={date}
                onChange={handleDateChange}
              />
            ) : (
              <span>{date}</span>
            )}
          </EditableField>
        </FieldContainer>
      </FormSection>

      <ActionButtons>
        {isEditing ? (
          isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <>
              <IconButton onClick={handleSaveClick}>
                <CheckOutlinedIcon />
                <span>Save</span>
              </IconButton>
              <IconButton onClick={handleCancelClick}>
                <CloseOutlinedIcon />
                <span>Cancel</span>
              </IconButton>
            </>
          )
        ) : (
          <IconButton onClick={handleEditClick}>
            <EditOutlinedIcon />
            <span>Edit</span>
          </IconButton>
        )}
      </ActionButtons>
      <Fade in={alert}>
        <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
      </Fade>
    </FormContainer>
  );
};

export default HeaderEdit;
