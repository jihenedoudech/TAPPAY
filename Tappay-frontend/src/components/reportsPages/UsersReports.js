import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersReports } from "../Redux/reportsSlice";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import DateRangePicker from "../common/DateRangePicker";
import styled from "styled-components";
import Page from "../common/Page";
import {
  Input,
  PageContainer,
  PageHeader,
  Table,
} from "../../utils/BaseStyledComponents";
import { fetchStoresThunk } from "../Redux/storeSlice";
import { fetchUsersThunk } from "../Redux/userSlice";

const FiltersContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 10px 0;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const FilterItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  color: #444;
  font-weight: bold;
  display: block;
`;

const StyledSelect = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #fff;
  font-size: 14px;
  width: 200px;
  transition: border 0.3s ease;

  &:hover {
    border-color: #f94d71;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Charts = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

const ChartContainer = styled.div`
  width: 500px;
  margin: 10px auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const UsersReports = () => {
  const dispatch = useDispatch();
  const { usersReports, isLoading, error } = useSelector(
    (state) => state.reports
  );
  const storesList = useSelector((state) => state.store.storesList);
  const users = useSelector((state) => state.user.users);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    storeId: localStorage.getItem("currentStoreId"),
    userId: null,
  });

  useEffect(() => {
    dispatch(fetchUsersReports(filters));
    dispatch(fetchStoresThunk());
    dispatch(fetchUsersThunk());
  }, [filters, dispatch]);

  const handleDateChange = (dates) => {
    setFilters({
      ...filters,
      startDate: dates?.[0]?.format("YYYY-MM-DD"),
      endDate: dates?.[1]?.format("YYYY-MM-DD"),
    });
  };

  const handleStoreChange = (event) => {
    setFilters({ ...filters, storeId: event.target.value });
  };

  const handleUserChange = (event) => {
    setFilters({ ...filters, userId: event.target.value });
  };

  const renderTotalSalesByUserChart = () => {
    if (!usersReports?.totalSalesByUser) return null;

    const labels = usersReports.totalSalesByUser.map((item) => item.userName);
    const data = usersReports.totalSalesByUser.map((item) => item.totalSales);

    const chartData = {
      labels,
      datasets: [
        {
          label: "Total Sales by User",
          data,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };

    return <Bar data={chartData} />;
  };

  const renderAverageSalesPerShiftChart = () => {
    if (!usersReports?.averageSalesPerShiftByUser) return null;

    const labels = usersReports.averageSalesPerShiftByUser.map(
      (item) => item.userName
    );
    const data = usersReports.averageSalesPerShiftByUser.map(
      (item) => item.averageSalesPerShift
    );

    const chartData = {
      labels,
      datasets: [
        {
          label: "Average Sales Per Shift by User",
          data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    return <Pie data={chartData} />;
  };

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Users Reports</h2>
        </PageHeader>

        <FiltersContainer>
          <FilterItem>
            <FilterLabel htmlFor="dateRange">Date Range</FilterLabel>
            <DateRangePicker onDateChange={handleDateChange} />
          </FilterItem>
          <FilterItem>
            <FilterLabel htmlFor="storeSelect">Store</FilterLabel>
            <StyledSelect
              id="storeSelect"
              value={filters.storeId}
              onChange={handleStoreChange}
            >
              <option value="">All Stores</option>
              {storesList?.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </StyledSelect>
          </FilterItem>
          <FilterItem>
            <FilterLabel htmlFor="userSelect">User</FilterLabel>
            <StyledSelect
              id="userSelect"
              value={filters.userId}
              onChange={handleUserChange}
            >
              <option value="">All Users</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </StyledSelect>
          </FilterItem>
        </FiltersContainer>

        {isLoading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <Charts>
          <ChartContainer>
            <h3>Total Sales by User</h3>
            {renderTotalSalesByUserChart()}
          </ChartContainer>

          <ChartContainer>
            <h3>Average Sales Per Shift by User</h3>
            {renderAverageSalesPerShiftChart()}
          </ChartContainer>
        </Charts>

        <Table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>User Name</th>
              <th>Number of Shifts</th>
              <th>Total Sales</th>
              <th>Total Profit</th>
              <th>Total Transactions</th>
              <th>Total Items</th>
              <th>Total Discounts</th>
              <th>Total Refunds</th>
              <th>Total Expenses</th>
              <th>Average Sales Per Shift</th>
            </tr>
          </thead>
          <tbody>
            {usersReports?.userData?.map((report, index) => (
              <tr key={index}>
                <td>{report.userId}</td>
                <td>{report.userName}</td>
                <td>{report.numberOfShifts}</td>
                <td>{report.totalSales}</td>
                <td>{report.totalProfit}</td>
                <td>{report.totalTransactions}</td>
                <td>{report.totalItems}</td>
                <td>{report.totalDiscounts}</td>
                <td>{report.totalRefunds}</td>
                <td>{report.totalCost}</td>
                <td>{report.averageSalesPerShift}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </PageContainer>
    </Page>
  );
};

export default UsersReports;
