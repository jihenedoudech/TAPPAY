import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TableWrapper, Table } from "../../../utils/BaseStyledComponents";
import { fetchExpensesThunk } from "../../Redux/expenseSlice";

const ExpenseTable = () => {
  const dispatch = useDispatch();
  const expenses = useSelector((state) => state.expenses.expenses);

  useEffect(() => {
    dispatch(fetchExpensesThunk());
  }, [dispatch]);

  console.log("expenses", expenses);

  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <th>Store</th>
            <th>Type</th>
            <th>Date</th>
            <th>Product / External Name</th>
            <th>Quantity</th>
            <th>Cost</th>
            <th>Affected by</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {expenses?.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.store?.name || "N/A"}</td>
              <td>{expense.type}</td>
              <td>{new Date(expense.date).toLocaleDateString()}</td>
              <td>
                {expense.type === "INTERNAL"
                  ? expense.product?.productDetails?.name || "N/A"
                  : expense.externalExpenseName || "N/A"}
              </td>
              <td>{expense.quantity || "N/A"}</td>
              <td>{expense.cost || "N/A"}</td>
              <td>{expense.createdBy?.username || "N/A"}</td>
              <td>{expense.notes || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};

export default ExpenseTable;
