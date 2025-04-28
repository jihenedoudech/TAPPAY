import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Page from "../common/Page";
import {
  AlertNotif,
  Button,
  Input,
  Label,
  RadioButton,
  RadioGroup,
  RadioInput,
} from "../../utils/BaseStyledComponents";
import { removeNullValues } from "../../utils/utilsFunctions";
import { addCustomerThunk } from "../Redux/customerSlice";
import { useDispatch } from "react-redux";
import { CircularProgress, Fade } from "@mui/material";
// Styled Components
const FormContainer = styled.div`
  padding: 30px;
  height: auto;
  overflow-y: auto;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
`;

const Title = styled.h3`
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
`;

const FormField = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 20px;
`;

const LoyaltyInput = styled(Input)`
  margin-top: 10px;
`;

const CustomerForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    firstName: null,
    lastName: null,
    cin: null,
    email: null,
    phone: null,
    address: {
      street: null,
      city: null,
      zipCode: null,
    },
    loyaltyCard: {
      haveLoyaltyCard: false,
      reference: null,
    },
    status: "active",
    dateOfBirth: null,
  });

  const [addLoyaltyCard, setAddLoyaltyCard] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (isLoading) return;
    e.preventDefault();
    setIsLoading(true);
    const customerData = removeNullValues(customer);
    console.log("customerData: ", customerData);
    const response = await dispatch(addCustomerThunk(customerData));
    console.log("response: ", response);
    if (response.type.includes("fulfilled")) {
      setAlert({
        type: "success",
        message: "Customer added successfully",
      });
      navigate("/customers");
    } else {
      setAlert({
        type: "error",
        message: "Failed to add customer",
      });
    }
    setTimeout(() => {
      setAlert(null);
    }, 3000);
    setIsLoading(false);
    return;
  };

  return (
    <Page>
      <FormContainer>
        <Title>Add New Customer</Title>
        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormField>
              <Label>First Name</Label>
              <Input
                type="text"
                value={customer.firstName}
                onChange={(e) =>
                  setCustomer({ ...customer, firstName: e.target.value })
                }
              />
            </FormField>
            <FormField>
              <Label>Last Name</Label>
              <Input
                type="text"
                value={customer.lastName}
                onChange={(e) =>
                  setCustomer({ ...customer, lastName: e.target.value })
                }
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <Label>CIN</Label>
              <Input
                type="text"
                value={customer.cin}
                onChange={(e) =>
                  setCustomer({ ...customer, cin: e.target.value })
                }
              />
            </FormField>
            <FormField>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={customer.dateOfBirth}
                onChange={(e) =>
                  setCustomer({ ...customer, dateOfBirth: e.target.value })
                }
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <Label>Email</Label>
              <Input
                type="email"
                value={customer.email}
                onChange={(e) =>
                  setCustomer({ ...customer, email: e.target.value })
                }
              />
            </FormField>
            <FormField>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <Label>City</Label>
              <Input
                type="text"
                value={customer.address.city}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    address: { ...customer.address, city: e.target.value },
                  })
                }
              />
            </FormField>
            <FormField>
              <Label>ZIP Code</Label>
              <Input
                type="text"
                value={customer.address.zipCode}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    address: { ...customer.address, zipCode: e.target.value },
                  })
                }
              />
            </FormField>
            <FormField>
              <Label>Street</Label>
              <Input
                type="text"
                value={customer.address.street}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    address: { ...customer.address, street: e.target.value },
                  })
                }
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField>
              <Label>Status</Label>
              <RadioGroup
                value={customer.status}
                onChange={(e) =>
                  setCustomer({ ...customer, status: e.target.value })
                }
              >
                <RadioButton>
                  <RadioInput
                    type="radio"
                    value="active"
                    checked={customer.status === "active"}
                  />
                  Active
                </RadioButton>
                <RadioButton>
                  <RadioInput
                    type="radio"
                    value="inactive"
                    checked={customer.status === "inactive"}
                  />
                  Inactive
                </RadioButton>
              </RadioGroup>
            </FormField>
            <FormField>
              <Label>Loyalty Card</Label>
              <RadioGroup>
                <RadioButton>
                  <RadioInput
                    type="radio"
                    value="no"
                    checked={!addLoyaltyCard}
                    onChange={() => setAddLoyaltyCard(false)}
                  />
                  No
                </RadioButton>
                <RadioButton>
                  <RadioInput
                    type="radio"
                    value="yes"
                    checked={addLoyaltyCard}
                    onChange={() => {
                      setAddLoyaltyCard(true);
                      setCustomer((customer) => ({
                        ...customer,
                        loyaltyCard: {
                          ...customer.loyaltyCard,
                          haveLoyaltyCard: true,
                        },
                      }));
                    }}
                  />
                  Yes
                </RadioButton>
              </RadioGroup>
            </FormField>
            <FormField>
              {addLoyaltyCard && (
                <>
                  <Label>Loyalty Card Reference</Label>
                  <LoyaltyInput
                    type="text"
                    placeholder="Enter reference manually"
                    value={customer.loyaltyCard.reference}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        loyaltyCard: {
                          ...customer.loyaltyCard,
                          reference: e.target.value,
                        },
                      })
                    }
                  />
                </>
              )}
            </FormField>
          </FormRow>
          <FormField>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : "Add Customer"}
            </Button>
          </FormField>
        </form>
        <Fade in={alert}>
          <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
        </Fade>
      </FormContainer>
    </Page>
  );
};

export default CustomerForm;
