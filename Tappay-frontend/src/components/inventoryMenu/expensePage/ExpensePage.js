import React, { useEffect } from "react";
import Page from "../../common/Page";
import ExpenseTable from "./ExpenseTable";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import {
  PageContainer,
  PageHeader,
  Button,
} from "../../../utils/BaseStyledComponents";
import { useDispatch } from "react-redux";
import { fetchExpensesThunk } from "../../Redux/expenseSlice";

const ExpensePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchExpensesThunk());
  }, [dispatch]);

  const handleAddExpense = () => {
    navigate("/inventory/select-products", {
      state: {
        title: "Select Products For Expenses",
        nextRoute: "/inventory/expenses/add-expense",
        key: "Expenses"
      },
    });
  };

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Expense Management</h2>
          <Button onClick={handleAddExpense}>
            <AddIcon />
            New Expense
          </Button>
        </PageHeader>
        <ExpenseTable />
      </PageContainer>
    </Page>
  );
};

export default ExpensePage;
