import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { addUserThunk } from "../../Redux/userSlice"; // Example redux slice for user actions
import Page from "../../common/Page";
import {
  PageContainer,
  Input,
  Button,
  Label,
  CheckboxInput,
  CheckboxLabel,
  CheckboxGroup,
  PageTitle,
  BackButton,
  Select,
} from "../../../utils/BaseStyledComponents";
import { fetchStoresThunk } from "../../Redux/storeSlice";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { useNavigate } from "react-router-dom";
import { UserRole } from "../../../utils/enums";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { removeLocalizedDigits } from "@mui/x-date-pickers/internals/hooks/useField/useField.utils";
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

const ErrorMessage = styled.span`
  color: red;
  font-size: 14px;
  margin-top: 5px;
`;

const PasswordInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  & > input {
    flex: 1;
  }
`;

const TogglePasswordIcon = styled.div`
  position: absolute;
  right: 10px;
  cursor: pointer;
  color: #666;
`;

const UserForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const storesList = useSelector((state) => state.store.storesList);
  const [user, setUser] = useState({
    username: null,
    password: null,
    role: "",
    assignedStoresIds: [],
    firstName: null,
    lastName: null,
    nationalId: null,
    dateOfBirth: null,
    email: null,
    phone: null,
    address: {
      country: null,
      state: null,
      city: null,
      street: null,
      zip: null,
    },
    salaryAmount: null,
    bankAccount: null,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(fetchStoresThunk());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleStoreSelection = (storeId) => {
    setUser((prevState) => {
      const isSelected = prevState.assignedStoresIds.includes(storeId);
      const updatedStores = isSelected
        ? prevState.assignedStoresIds.filter((id) => id !== storeId)
        : [...prevState.assignedStoresIds, storeId];
      return { ...prevState, assignedStoresIds: updatedStores };
    });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      address: { ...user.address, [name]: value },
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!user.username) newErrors.username = "Username is required.";
    if (!user.password) {
      newErrors.password = "Password is required.";
    } else if (user.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }
    if (!user.role) newErrors.role = "Please select a role.";
    if (!user.assignedStoresIds.length)
      newErrors.assignedStores = "Please select at least one store.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("user before submit: ", user);
    const userWithoutNulls = removeNullValues(user);
    console.log("user without nulls: ", userWithoutNulls);
    if (!validateForm()) {
      return;
    }
    const response = await dispatch(addUserThunk(userWithoutNulls));
    console.log("response of register user: ", response);
    if (response.type.includes("fulfilled")) {
      navigate("/settings/users-management");
    }
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
          Register User
        </PageTitle>
        <form onSubmit={handleSubmit}>
          {/* Account Details */}
          <Section>
            <SectionTitle>Account Details (Required)</SectionTitle>
            <FormGroup>
              <FormField>
                <Label>Username</Label>
                <Input
                  type="text"
                  name="username"
                  value={user.username}
                  onChange={handleInputChange}
                />
                {errors.username && (
                  <ErrorMessage>{errors.username}</ErrorMessage>
                )}
              </FormField>
              <FormField>
                <Label>Password</Label>
                <PasswordInput>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={user.password}
                    onChange={handleInputChange}
                  />
                  <TogglePasswordIcon
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </TogglePasswordIcon>
                </PasswordInput>
                {errors.password && (
                  <ErrorMessage>{errors.password}</ErrorMessage>
                )}
              </FormField>
              <FormField>
                <Label>Role</Label>
                <Select
                  name="role"
                  value={user.role}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>
                    Select Role
                  </option>
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
                {errors.role && <ErrorMessage>{errors.role}</ErrorMessage>}
              </FormField>
              <FormField>
                <Label>Assigned Stores</Label>
                <CheckboxGroup>
                  {storesList.map((store, index) => (
                    <CheckboxLabel key={index}>
                      <CheckboxInput
                        type="checkbox"
                        checked={user.assignedStoresIds.includes(store.id)}
                        onChange={() => handleStoreSelection(store.id)}
                      />
                      {store.name}
                    </CheckboxLabel>
                  ))}
                </CheckboxGroup>
                {errors.assignedStores && (
                  <ErrorMessage>{errors.assignedStores}</ErrorMessage>
                )}
              </FormField>
            </FormGroup>
          </Section>
          {/* Personal Information */}
          <Section>
            <SectionTitle>Personal Information</SectionTitle>
            <FormGroup>
              <FormField>
                <Label>First Name</Label>
                <Input
                  type="text"
                  name="firstName"
                  value={user.firstName}
                  onChange={handleInputChange}
                />
              </FormField>
              <FormField>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  name="lastName"
                  value={user.lastName}
                  onChange={handleInputChange}
                />
              </FormField>
              <FormField>
                <Label>National ID</Label>
                <Input
                  type="text"
                  name="nationalId"
                  value={user.nationalId}
                  onChange={handleInputChange}
                />
              </FormField>
              <FormField>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={user.dateOfBirth}
                  onChange={handleInputChange}
                />
              </FormField>
            </FormGroup>
          </Section>

          {/* Contact Information */}
          <Section>
            <SectionTitle>Contact Information</SectionTitle>
            <FormGroup>
              <FormField>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleInputChange}
                />
              </FormField>
              <FormField>
                <Label>Phone</Label>
                <Input
                  type="text"
                  name="phone"
                  value={user.phone}
                  onChange={handleInputChange}
                />
              </FormField>
            </FormGroup>
          </Section>

          {/* Address */}
          <Section>
            <SectionTitle>Address</SectionTitle>
            <FormGroup>
              <FormField>
                <Label>Country</Label>
                <Input
                  type="text"
                  name="country"
                  value={user.address.country}
                  onChange={handleAddressChange}
                />
              </FormField>
              <FormField>
                <Label>State</Label>
                <Input
                  type="text"
                  name="state"
                  value={user.address.state}
                  onChange={handleAddressChange}
                />
              </FormField>
              <FormField>
                <Label>City</Label>
                <Input
                  type="text"
                  name="city"
                  value={user.address.city}
                  onChange={handleAddressChange}
                />
              </FormField>
              <FormField>
                <Label>Street</Label>
                <Input
                  type="text"
                  name="street"
                  value={user.address.street}
                  onChange={handleAddressChange}
                />
              </FormField>
              <FormField>
                <Label>ZIP Code</Label>
                <Input
                  type="text"
                  name="zip"
                  value={user.address.zip}
                  onChange={handleAddressChange}
                />
              </FormField>
            </FormGroup>
          </Section>

          {/* Employment Details */}
          <Section>
            <SectionTitle>Employment Details</SectionTitle>
            <FormGroup>
              <FormField>
                <Label>Salary Amount</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.001"
                  name="salaryAmount"
                  value={user.salaryAmount}
                  onChange={handleInputChange}
                />
              </FormField>
              <FormField>
                <Label>Bank Account</Label>
                <Input
                  type="text"
                  name="bankAccount"
                  value={user.bankAccount}
                  onChange={handleInputChange}
                />
              </FormField>
            </FormGroup>
          </Section>

          {/* Submit Button */}
          <Button type="submit">Add User</Button>
        </form>
      </PageContainer>
    </Page>
  );
};

export default UserForm;
