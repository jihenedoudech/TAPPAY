import React, { useState } from "react";
import Modal from "../Common/Modal";
import styled from "styled-components";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import FeedOutlinedIcon from "@mui/icons-material/FeedOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import InputWithValidation from "../Common/InputWithValidation";
import { CircularProgress } from "@mui/material";

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #0c085c;
`;

const Title = styled.h3`
  margin: auto;
  font-size: 26px;
`;

const Icon = styled.div`
  cursor: pointer;
  transition: color 0.3s ease;
  &:hover {
    color: rgba(0, 0, 0, 0.75);
  }
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const Inputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
`;
const Section = styled.div`
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  margin-right: 8px;
  border: solid #a8d0e7 1px;
  border-radius: 10px;
  box-shadow: 0 2px 3px 0 rgba(168, 208, 231, 0.7);
`;
const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  border-right: solid #a8d0e7 2px;
  padding: 10px 20px;
`;
const SectionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
`;
const Button = styled.button`
  padding: 10px;
  background-color: #a8d0e7;
  color: #0c085c;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #87bede;
  }
`;

const CustomerForm = (props) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    region: "",
    city: "",
    country: "",
    dateOfBirth: "",
    placeOfBirth: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;
    setIsLoading(true);
    props.addCustomer({
      name: `${formData.firstName} ${formData.lastName}`,
      ...formData,
    });
    props.closeCustomerForm(event);
    props.closeCustomersList(event);
    setIsLoading(false);
  };
  const returnToCustomerList = (event) => {
    props.closeCustomerForm(event);
    props.openCustomersList(event);
  };

  const validateName = (name) => {
    const regex = /^[a-zA-Z\s]*$/;
    return regex.test(name);
  };
  const validateNumber = (name) => {
    const regex = /^\+?[0-9\s]*$/;
    return regex.test(name);
  };
  // const validateEmail = (email) => {
  //   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return regex.test(email);
  // };

  return (
    <Modal onClose={props.closeCustomerForm}>
      <Header>
        <Title>Customer Form</Title>
        <Icon onClick={returnToCustomerList}>
          <CloseOutlinedIcon />
        </Icon>
      </Header>
      <Form onSubmit={handleSubmit}>
        <Inputs>
          <Section>
            <SectionTitle>
              <div>
                <FeedOutlinedIcon />
              </div>
              Personal Details
            </SectionTitle>
            <SectionDetails>
              <InputWithValidation
                label="First Name:"
                type="text"
                name="firstName"
                value={formData.firstName}
                handleChange={handleChange}
                placeholder="Enter first name..."
                errorMessage="First name should only contains letters."
                validator={validateName}
              />
              <InputWithValidation
                label="Last Name:"
                type="text"
                name="lastName"
                value={formData.lastName}
                handleChange={handleChange}
                placeholder="Enter last name..."
                errorMessage="Last name should only contains letters."
                validator={validateName}
              />
              <InputWithValidation
                label="Date of Birth:"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                handleChange={handleChange}
              />
              <InputWithValidation
                label="Place of Birth:"
                type="text"
                name="placeOfBirth"
                value={formData.placeOfBirth}
                handleChange={handleChange}
                placeholder="Enter place of birth..."
              />
            </SectionDetails>
          </Section>
          <Section>
            <SectionTitle>
              <div>
                <LocalPhoneOutlinedIcon />
              </div>
              Contact Info
            </SectionTitle>
            <SectionDetails>
              <InputWithValidation
                label="Phone:"
                type="text"
                name="phone"
                value={formData.phone}
                handleChange={handleChange}
                placeholder="Enter phone number..."
                errorMessage="Phone number should only contains numbers."
                validator={validateNumber}
              />
              <InputWithValidation
                label="Email:"
                type="email"
                name="email"
                value={formData.email}
                handleChange={handleChange}
                placeholder="Enter email address..."
                errorMessage="Email address is not valid."
                // validator={validateEmail}
              />
            </SectionDetails>
          </Section>
          <Section>
            <SectionTitle>
              <div>
                <LocationOnOutlinedIcon />
              </div>
              Address
            </SectionTitle>
            <SectionDetails>
              <InputWithValidation
                label="Region:"
                type="text"
                name="region"
                value={formData.region}
                handleChange={handleChange}
                placeholder="Enter region..."
              />
              <InputWithValidation
                label="City:"
                type="text"
                name="city"
                value={formData.city}
                handleChange={handleChange}
                placeholder="Enter city..."
              />
              <InputWithValidation
                label="Country:"
                type="text"
                name="country"
                value={formData.country}
                handleChange={handleChange}
                placeholder="Enter country..."
              />
            </SectionDetails>
          </Section>
        </Inputs>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : "Submit"}
        </Button>
      </Form>
    </Modal>
  );
};

export default CustomerForm;
