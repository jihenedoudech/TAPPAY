import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteCustomerThunk, fetchCustomersThunk } from "../Redux/customerSlice";
import styled from "styled-components";
import {
  IconButton,
  TextField,
  Select,
  InputLabel,
  FormControl,
  MenuItem as MuiMenuItem,
} from "@mui/material";
import DateRangePicker from "../common/DateRangePicker";
import { TableWrapper, Table } from "../../utils/BaseStyledComponents";
import ActionMenu from "../common/ActionMenu";
import { useNavigate } from "react-router-dom";

const TrItem = styled.tr`
  &:hover {
    background-color: #f9f9f9;
  }
`;

const CustomersTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customersList, loading, error } = useSelector(
    (state) => state.customers
  );
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    cin: "",
    email: "",
    phone: "",
    registrationDate: "",
    status: "all",
    loyaltyPoints: { min: "", max: "" },
  });

  useEffect(() => {
    dispatch(fetchCustomersThunk());
  }, [dispatch]);

  const handleViewDetails = (customer) => {
    console.log(customer);
  };

  const handleEditCustomer = (customer) => {
    console.log(customer);
  };

  const handleDeleteCustomer = (customer) => {
    const response = dispatch(deleteCustomerThunk(customer.id));
    console.log("response: ", response);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedCustomers(customersList.map((customer) => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers((prevSelected) =>
      prevSelected.includes(customerId)
        ? prevSelected.filter((id) => id !== customerId)
        : [...prevSelected, customerId]
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "min" || name === "max") {
      setFilters((prevFilters) => ({
        ...prevFilters,
        loyaltyPoints: { ...prevFilters.loyaltyPoints, [name]: value },
      }));
    } else {
      setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    }
  };

  const filterCustomers = () => {
    return customersList.filter((customer) => {
      const isFirstNameMatch = customer.firstName
        ?.toLowerCase()
        .includes(filters.firstName?.toLowerCase());
      const isLastNameMatch = customer.lastName
        ?.toLowerCase()
        .includes(filters.lastName?.toLowerCase());
      const isCinMatch = customer.cin
        ?.toLowerCase()
        .includes(filters.cin?.toLowerCase());
      const isEmailMatch = (customer.email || "")
        .toLowerCase()
        .includes(filters.email?.toLowerCase());
      const isPhoneMatch = (customer.phone || "")
        .toLowerCase()
        .includes(filters.phone?.toLowerCase());
      const isStatusMatch =
        filters.status === "all" ||
        customer.status.toLowerCase() === filters.status.toLowerCase();
      const isLoyaltyPointsMatch =
        (!filters.loyaltyPoints.min ||
          (customer.loyaltyCard?.points || 0) >=
            Number(filters.loyaltyPoints.min)) &&
        (!filters.loyaltyPoints.max ||
          (customer.loyaltyCard?.points || 0) <=
            Number(filters.loyaltyPoints.max));

      return (
        isFirstNameMatch &&
        isLastNameMatch &&
        isCinMatch &&
        isEmailMatch &&
        isPhoneMatch &&
        isStatusMatch &&
        isLoyaltyPointsMatch
      );
    });
  };

  const filteredCustomers = filterCustomers();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  selectedCustomers.length === customersList.length &&
                  customersList.length !== 0
                }
              />
            </th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>CIN</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Registration Date</th>
            <th>Status</th>
            <th>Loyalty Points</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td>
              <TextField
                label="First Name"
                name="firstName"
                variant="outlined"
                size="small"
                value={filters.firstName}
                onChange={handleFilterChange}
              />
            </td>
            <td>
              <TextField
                label="Last Name"
                name="lastName"
                variant="outlined"
                size="small"
                value={filters.lastName}
                onChange={handleFilterChange}
              />
            </td>
            <td>
              <TextField
                label="CIN"
                name="cin"
                variant="outlined"
                size="small"
                value={filters.cin}
                onChange={handleFilterChange}
              />
            </td>
            <td>
              <TextField
                label="Email"
                name="email"
                variant="outlined"
                size="small"
                value={filters.email}
                onChange={handleFilterChange}
              />
            </td>
            <td>
              <TextField
                label="Phone"
                name="phone"
                variant="outlined"
                size="small"
                value={filters.phone}
                onChange={handleFilterChange}
              />
            </td>
            <td>
              <DateRangePicker
                onDateChange={(range) =>
                  setFilters((prev) => ({ ...prev, registrationDate: range }))
                }
              />
            </td>
            <td>
              <FormControl variant="outlined" size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MuiMenuItem value="all">All</MuiMenuItem>
                  <MuiMenuItem value="active">Active</MuiMenuItem>
                  <MuiMenuItem value="inactive">Inactive</MuiMenuItem>
                </Select>
              </FormControl>
            </td>
            <td>
              <TextField
                label="Min Points"
                name="min"
                variant="outlined"
                size="small"
                type="number"
                value={filters.loyaltyPoints.min}
                onChange={handleFilterChange}
                style={{ marginRight: 10 }}
              />
              <TextField
                label="Max Points"
                name="max"
                variant="outlined"
                size="small"
                type="number"
                value={filters.loyaltyPoints.max}
                onChange={handleFilterChange}
              />
            </td>
          </tr>
          {filteredCustomers.map((customer) => (
            <TrItem key={customer.id}>
              <td>
                <input
                  type="checkbox"
                  onChange={() => handleSelectCustomer(customer.id)}
                  checked={selectedCustomers.includes(customer.id)}
                />
              </td>
              <td>{customer.firstName || "N/A"}</td>
              <td>{customer.lastName || "N/A"}</td>
              <td>{customer.cin || "N/A"}</td>
              <td>{customer.email || "N/A"}</td>
              <td>{customer.phone || "N/A"}</td>
              <td>
                {new Date(customer.registrationDate).toLocaleDateString()}
              </td>
              <td>{customer.status}</td>
              <td>
                {customer.loyaltyCard ? customer.loyaltyCard.points : "N/A"}
              </td>
              <td>
                <ActionMenu
                  selectedItem={customer}
                  handleViewDetails={handleViewDetails}
                  handleEdit={handleEditCustomer}
                  handleDelete={handleDeleteCustomer}
                />
              </td>
            </TrItem>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};

export default CustomersTable;
