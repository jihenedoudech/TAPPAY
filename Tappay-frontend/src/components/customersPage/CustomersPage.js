import React, { useState } from "react";
import Page from "../common/Page";
import CustomersTable from "./CustomersTable"; // Assuming you have a CustomersTable component
import { useNavigate } from "react-router-dom";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import AddIcon from "@mui/icons-material/Add";
import {
  PageContainer,
  PageHeader,
  ButtonsGroup,
  Button,
} from "../../utils/BaseStyledComponents";

const CustomersPage = () => {
  const navigate = useNavigate();
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const handleAddCustomer = () => {
    navigate("/customers/add-new-customer"); // Redirect to customer form
  };

  const handleDeleteSelected = () => {
    // Logic to delete selected customers
    // Make sure to handle the deletion from your state/store
    console.log("Deleting customers:", selectedCustomers);
  };

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Customers List</h2>
          <ButtonsGroup>
            <Button onClick={handleDeleteSelected}>
              <LocalPrintshopOutlinedIcon />
              Delete
            </Button>
            <Button onClick={handleAddCustomer}>
              <AddIcon />
              Add New Customer
            </Button>
          </ButtonsGroup>
        </PageHeader>
        <CustomersTable
          selectedCustomers={selectedCustomers}
          setSelectedCustomers={setSelectedCustomers}
        />
      </PageContainer>
    </Page>
  );
};

export default CustomersPage;
