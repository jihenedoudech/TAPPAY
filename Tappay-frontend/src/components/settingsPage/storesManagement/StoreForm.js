import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Label,
  PageContainer,
  PageTitle,
  BackButton,
  AlertNotif,
  CenterButton,
} from "../../../utils/BaseStyledComponents";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import Page from "../../common/Page";
import { CircularProgress, Fade } from "@mui/material";
import { addStoreThunk } from "../../Redux/storeSlice";
import { useDispatch } from "react-redux";
import { removeNullValues } from "../../../utils/utilsFunctions";

const Section = styled.div`
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.h4`
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: bold;
  color: #333;
  border-bottom: 2px solid #ff6b6b;
  padding-bottom: 10px;
`;

const FormGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const StoreForm = () => {
  const dispatch = useDispatch();
  const [store, setStore] = useState({
    name: null,
    phoneNumber: null,
    email: null,
    taxIdentificationNumber: null,
    isOpen: true,
    operatingHours: null,
    currency: null,
    paymentMethods: null,
    warehouseLocation: null,
    address: {
      fullAddress: null,
      country: null,
      state: null,
      city: null,
      street: null,
      zip: null,
    },
    manager: null,
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in store.address) {
      setStore({
        ...store,
        address: { ...store.address, [name]: value },
      });
    } else {
      setStore({ ...store, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!store.name) newErrors.name = "Store name is required.";
    // if (!store.phoneNumber) newErrors.phoneNumber = "Phone number is required.";
    // if (!store.email) newErrors.email = "Email is required.";
    // if (!store.address.fullAddress)
    //   newErrors.fullAddress = "Full address is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    if (validateForm()) {
      const storeData = removeNullValues(store);
      const response = await dispatch(addStoreThunk(storeData));
      if (response.type.includes("fulfilled")) {
        setAlert({
          message: "Store added successfully",
          type: "success",
        });
        navigate("/settings/stores-management");
      } else {
        setAlert({
          message: "Failed to add store",
          type: "error",
        });
      }
    }
    setIsLoading(false);
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Page>
      <PageContainer>
        <PageTitle>
          <BackButton onClick={handleBack}>
            <ArrowLeftIcon />
          </BackButton>
          Register Store
        </PageTitle>
        <form onSubmit={handleSubmit}>
          <Section>
            <SectionTitle>Store Information</SectionTitle>
            <FormGroup>
              <FormField>
                <Label>Store Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={store.name}
                  onChange={handleInputChange}
                />
                {errors.name && (
                  <span style={{ color: "red" }}>{errors.name}</span>
                )}
              </FormField>
              <FormField>
                <Label>Phone Number</Label>
                <Input
                  type="text"
                  name="phoneNumber"
                  value={store.phoneNumber}
                  onChange={handleInputChange}
                />
                {errors.phoneNumber && (
                  <span style={{ color: "red" }}>{errors.phoneNumber}</span>
                )}
              </FormField>
              <FormField>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={store.email}
                  onChange={handleInputChange}
                />
                {errors.email && (
                  <span style={{ color: "red" }}>{errors.email}</span>
                )}
              </FormField>
              <FormField>
                <Label>Tax Identification Number</Label>
                <Input
                  type="text"
                  name="taxIdentificationNumber"
                  value={store.taxIdentificationNumber}
                  onChange={handleInputChange}
                />
              </FormField>
            </FormGroup>
          </Section>
          <Section>
            <SectionTitle>Address Information</SectionTitle>
            <FormGroup>
              <FormField>
                <Label>Full Address</Label>
                <Input
                  type="text"
                  name="fullAddress"
                  value={store.address.fullAddress}
                  onChange={handleInputChange}
                />
                {errors.fullAddress && (
                  <span style={{ color: "red" }}>{errors.fullAddress}</span>
                )}
              </FormField>
              <FormField>
                <Label>Country</Label>
                <Input
                  type="text"
                  name="country"
                  value={store.address.country}
                  onChange={handleInputChange}
                />
              </FormField>
              <FormField>
                <Label>City</Label>
                <Input
                  type="text"
                  name="city"
                  value={store.address.city}
                  onChange={handleInputChange}
                />
              </FormField>
              <FormField>
                <Label>State</Label>
                <Input
                  type="text"
                  name="state"
                  value={store.address.state}
                  onChange={handleInputChange}
                />
              </FormField>
              <FormField>
                <Label>Street</Label>
                <Input
                  type="text"
                  name="street"
                  value={store.address.street}
                  onChange={handleInputChange}
                />
              </FormField>
              <FormField>
                <Label>ZIP Code</Label>
                <Input
                  type="text"
                  name="zip"
                  value={store.address.zip}
                  onChange={handleInputChange}
                />
              </FormField>
            </FormGroup>
          </Section>
          <Section>
            <SectionTitle>Operating Information</SectionTitle>
            <FormGroup>
              <FormField>
                <Label>Operating Hours</Label>
                <Input
                  type="text"
                  name="operatingHours"
                  value={store.operatingHours}
                  onChange={handleInputChange}
                />
              </FormField>
              <FormField>
                <Label>Currency</Label>
                <Input
                  type="text"
                  name="currency"
                  value={store.currency}
                  onChange={handleInputChange}
                />
              </FormField>
              <FormField>
                <Label>Payment Methods</Label>
                <Input
                  type="text"
                  name="paymentMethods"
                  value={store.paymentMethods}
                  onChange={handleInputChange}
                />
              </FormField>
            </FormGroup>
          </Section>
          <Section>
            <SectionTitle>Warehouse Details</SectionTitle>
            <FormGroup>
              <FormField>
                <Label>Warehouse Location</Label>
                <Input
                  type="text"
                  name="warehouseLocation"
                  value={store.warehouseLocation}
                  onChange={handleInputChange}
                />
              </FormField>
            </FormGroup>
          </Section>
          <CenterButton>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : "Register Store"}
            </Button>
          </CenterButton>
        </form>
        <Fade in={alert}>
          <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
        </Fade>
      </PageContainer>
    </Page>
  );
};

export default StoreForm;
