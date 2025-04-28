import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import PersonIcon from "@mui/icons-material/Person";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import Popup from "../../common/Popup";
import { fetchCustomersThunk } from "../../Redux/customerSlice";
import { theme } from "../../../theme";

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border 0.3s;

  &:focus {
    border-color: ${theme.colors.primary}; // Main accent color
  }
`;

const CustomerListContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd; // Add border for separation
  border-radius: 8px;
  background-color: ${theme.colors.cardBackground}; // Clean white for cards
`;

const Customer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: ${(props) =>
    props.selected
      ? `${theme.colors.secondary}40`
      : "transparent"}; // Light accent for selected
  transition: background-color 0.3s;

  &:hover {
    background-color: ${(props) =>
      props.selected
        ? `${theme.colors.secondary}40`
        : theme.colors.background}; // Light gray on hover
  }
`;

const CustomerName = styled.div`
  margin-left: 10px;
  font-size: 16px;
  cursor: pointer;
  color: ${theme.colors.text}; // Dark gray for text
`;

const AddCustomerButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${theme.colors.primary}; // Main accent color
  margin-bottom: 10px;
  font-weight: bold;

  &:hover {
    color: ${theme.colors.secondary}; // Lighter accent on hover
  }
`;

const Message = styled.div`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin: auto;
`;

const CustomersList = ({ onClose, onSelectCustomer }) => {
  const { customersList, selectedCustomer, loading, error } = useSelector(
    (state) => state.customers
  );
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const dispatch = useDispatch();
  const listContainerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCustomersThunk());
  }, [dispatch]);

  useEffect(() => {
    setFilteredCustomers(customersList);
  }, [customersList]);

  const handleSearch = (event) => {
    const searchQuery = event.target.value.toLowerCase();
    const filtered = customersList.filter((customer) =>
      customer.name.toLowerCase().includes(searchQuery)
    );
    setFilteredCustomers(filtered);
  };

  const handleCustomerClick = (customer, event) => {
    event.stopPropagation();
    onSelectCustomer(customer);
    onClose(event);
  };
  console.log(selectedCustomer);
  useEffect(() => {
    const scrollToSelectedCustomer = () => {
      if (listContainerRef.current && selectedCustomer) {
        const selectedCustomerElement = listContainerRef.current.querySelector(
          `.customer-item-${selectedCustomer.id}`
        );
        if (selectedCustomerElement) {
          selectedCustomerElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }
    };

    // Ensure the effect runs after the selected customer is set
    scrollToSelectedCustomer();
  }, [selectedCustomer, filteredCustomers]);

  return (
    <Popup title="Select Customer" onClose={onClose}>
      {loading ? (
        <Message>Loading customers...</Message>
      ) : error ? (
        <Message>Error loading customers: {error}</Message>
      ) : (
        <>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Search customers..."
              onChange={handleSearch}
            />
          </SearchContainer>
          <AddCustomerButton>
            <AddOutlinedIcon style={{ marginRight: "5px" }} />
            Add New Customer
          </AddCustomerButton>
          {filteredCustomers.length === 0 ? (
            <Message>No customers</Message>
          ) : (
            <CustomerListContainer ref={listContainerRef}>
              {filteredCustomers.map((customer) => (
                <Customer
                  key={customer.id}
                  onClick={(event) => handleCustomerClick(customer, event)}
                  selected={
                    selectedCustomer && selectedCustomer.id === customer.id
                  }
                  className={`customer-item-${customer.id}`}
                >
                  <PersonIcon />
                  <CustomerName>{customer.name}</CustomerName>
                </Customer>
              ))}
            </CustomerListContainer>
          )}
        </>
      )}
    </Popup>
  );
};

export default CustomersList;
