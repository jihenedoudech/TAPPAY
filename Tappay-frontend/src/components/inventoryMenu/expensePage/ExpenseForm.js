import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Page from "../../common/Page";
import { theme } from "../../../theme";
import {
  PageContainer,
  AlertNotif,
  BackButton,
  Button,
  PageTitle,
  Table,
  TableWrapper,
  Select,
  Input,
} from "../../../utils/BaseStyledComponents";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Fade } from "@mui/material";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { addExpensesThunk, setExpenseProducts } from "../../Redux/expenseSlice";
import { removeNullValues } from "../../../utils/utilsFunctions";
import { ExpenseType } from "../../../utils/enums";
import { fetchCurrentUserThunk } from "../../Redux/userSlice";

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const ExpensesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
`;

const FormSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.div`
  margin: 10px 0;
  font-size: 22px;
  font-weight: 600;
  color: ${theme.colors.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InputBox = styled.input`
  width: 90%;
  padding: 8px;
  font-size: 1em;
  border: 1px solid ${theme.colors.lightGrey};
  border-radius: 4px;
  transition: border-color 0.3s;
  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 3px ${theme.colors.primary};
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${theme.colors.secondary};
  }
`;

const ExpenseForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const expenseProducts = useSelector(
    (state) => state.expenses.expenseProducts
  );
  const [store, setStore] = useState(
    localStorage.getItem("currentStoreId") || ""
  );
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [internalExpenses, setInternalExpenses] = useState(
    expenseProducts.map((product) => ({
      ...product,
      quantity: 1,
      notes: null,
    }))
  );
  const [externalExpenses, setExternalExpenses] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentUserThunk());
  }, [dispatch]);

  const handleInternalInputChange = (index, field, value) => {
    const updatedInternalExpenses = internalExpenses.map((expense, i) =>
      i === index ? { ...expense, [field]: value } : expense
    );
    setInternalExpenses(updatedInternalExpenses);
  };

  const handleExternalInputChange = (index, field, value) => {
    const updatedExternalExpenses = externalExpenses.map((expense, i) =>
      i === index ? { ...expense, [field]: value } : expense
    );
    setExternalExpenses(updatedExternalExpenses);
  };

  const handleAddExternalExpense = () => {
    setExternalExpenses([
      ...externalExpenses,
      {
        externalExpenseName: null,
        cost: null,
        quantity: 1,
        notes: null,
      },
    ]);
  };

  const handleRemoveExternalExpense = (index) => {
    setExternalExpenses(externalExpenses.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);
    if (!store) {
      setAlert({
        message: "Store is required",
        type: "error",
      });
      setTimeout(() => setAlert(null), 1500);
      setIsLoading(false);
      return;
    }
    if (!date) {
      setAlert({
        message: "Date is required",
        type: "error",
      });
      setTimeout(() => setAlert(null), 1500);
      setIsLoading(false);
      return;
    }

    const invalidInternalExpenses = internalExpenses.filter(
      (expense) => !expense.quantity
    );

    if (invalidInternalExpenses.length > 0) {
      setAlert({
        message: "Please fill in all required fields for internal expenses.",
        type: "error",
      });
      setTimeout(() => setAlert(null), 1500);
      setIsLoading(false);
      return;
    }

    const invalidExternalExpenses = externalExpenses.filter(
      (expense) => !expense.externalExpenseName || !expense.cost
    );

    if (invalidExternalExpenses.length > 0) {
      setAlert({
        message: "Please fill in all required fields for external expenses.",
        type: "error",
      });
      setTimeout(() => setAlert(null), 1500);
      setIsLoading(false);
      return;
    }

    const internalExpenseData = internalExpenses.map((expense) => ({
      storeId: store,
      type: ExpenseType.INTERNAL,
      date: date,
      productId: expense.id,
      quantity: parseInt(expense.quantity, 10),
      notes: expense.notes,
    }));

    const externalExpenseData = externalExpenses.map((expense) => ({
      storeId: store,
      type: ExpenseType.EXTERNAL,
      date: date,
      externalExpenseName: expense.externalExpenseName,
      cost: parseFloat(expense.cost),
      quantity: parseInt(expense.quantity, 10),
      notes: expense.notes,
    }));

    const allExpenses = [...internalExpenseData, ...externalExpenseData];
    const filteredExpenses = allExpenses.map((expense) => {
      return removeNullValues(expense);
    });
    const response = await dispatch(addExpensesThunk(filteredExpenses));
    console.log("all expenses", allExpenses);
    if (response.type.includes("fulfilled")) {
      dispatch(setExpenseProducts([]));
      navigate("/inventory/expenses");
      setAlert({
        message: "Expenses added successfully",
        type: "success",
      });
    } else {
      setAlert({
        message: "Failed to add expenses",
        type: "error",
      });
    }
    setTimeout(() => setAlert(null), 1500);
    setIsLoading(false);
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
          Add Expenses
        </PageTitle>
        <ContentContainer>
          <FormSection>
            <Select
              name="store"
              value={store}
              onChange={(e) => setStore(e.target.value)}
            >
              <option value="" disabled>
                Select Store
              </option>
              {user?.assignedStores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormSection>
          <ExpensesContainer>
            {expenseProducts.length > 0 && (
              <div>
                <SectionTitle>Internal Expenses</SectionTitle>
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {internalExpenses.map((expense, index) => (
                        <tr key={index}>
                          <td>{expense.productDetails.name}</td>
                          <td>
                            <InputBox
                              type="number"
                              value={expense.quantity}
                              onChange={(e) =>
                                handleInternalInputChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <InputBox
                              value={expense.notes}
                              onChange={(e) =>
                                handleInternalInputChange(
                                  index,
                                  "notes",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>
              </div>
            )}
            <div>
              <SectionTitle>
                External Expenses
                <Button onClick={handleAddExternalExpense}>
                  <AddIcon /> New External Expense
                </Button>
              </SectionTitle>
              {externalExpenses.length > 0 && (
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <th>External Expense Name</th>
                        <th>Cost</th>
                        <th>Quantity</th>
                        <th>Notes</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {externalExpenses.map((expense, index) => (
                        <tr key={index}>
                          <td>
                            <InputBox
                              type="text"
                              value={expense.externalExpenseName}
                              onChange={(e) =>
                                handleExternalInputChange(
                                  index,
                                  "externalExpenseName",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <InputBox
                              type="number"
                              inputMode="decimal"
                              step="0.001"
                              value={expense.cost}
                              onChange={(e) =>
                                handleExternalInputChange(
                                  index,
                                  "cost",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <InputBox
                              type="number"
                              value={expense.quantity}
                              onChange={(e) =>
                                handleExternalInputChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <InputBox
                              value={expense.notes}
                              onChange={(e) =>
                                handleExternalInputChange(
                                  index,
                                  "notes",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <IconButton
                              onClick={() => handleRemoveExternalExpense(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>
              )}
            </div>
          </ExpensesContainer>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : "Add Expenses"}
          </Button>
          <Fade in={alert}>
            <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
          </Fade>
        </ContentContainer>
      </PageContainer>
    </Page>
  );
};

export default ExpenseForm;
