import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSalesByItemSummary } from "../Redux/reportsSlice";
import { Bar, Pie, Line } from "react-chartjs-2";
import "chart.js/auto";
import DateRangePicker from "../common/DateRangePicker";
import styled from "styled-components";
import Page from "../common/Page";
import {
  PageContainer,
  PageHeader,
  Table,
} from "../../utils/BaseStyledComponents";
import { fetchCategoriesThunk } from "../Redux/productSlice";

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

const SummaryBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
`;

const SummaryCard = styled.div`
  flex: 1;
  background: #fff;
  border: 1px solid #f1f1f1;
  border-radius: 8px;
  padding: 15px 20px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
`;

const CardValue = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #ff6b6b;
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

const SalesByItemPage = () => {
  const dispatch = useDispatch();
  const { salesByItemSummary, isLoading, error } = useSelector(
    (state) => state.reports
  );
  const categoriesList = useSelector((state) => state.products.categoriesList);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    categoryId: null,
  });

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
    dispatch(fetchSalesByItemSummary(filters));
  }, [filters, dispatch]);

  console.log("categoriesList", categoriesList);
  console.log("salesByItemSummary", salesByItemSummary);

  const handleDateChange = (dates) => {
    setFilters({
      ...filters,
      startDate: dates?.[0]?.format("YYYY-MM-DD"),
      endDate: dates?.[1]?.format("YYYY-MM-DD"),
    });
  };

  const handleCategoryChange = (event) => {
    setFilters({ ...filters, categoryId: event.target.value });
  };

  const topSellingItemsData = {
    labels:
      salesByItemSummary?.topSellingItems?.map((item) => item.productName) ||
      [],
    datasets: [
      {
        label: "Quantity Sold",
        data:
          salesByItemSummary?.topSellingItems?.map(
            (item) => item.quantitySold
          ) || [],
        backgroundColor: "#ff6b6b",
      },
    ],
  };

  const topProfitableItemsData = {
    labels:
      salesByItemSummary?.topProfitableItems?.map((item) => item.productName) ||
      [],
    datasets: [
      {
        label: "Profit",
        data:
          salesByItemSummary?.topProfitableItems?.map(
            (item) => item.totalProfit
          ) || [],
        backgroundColor: "#4caf50",
      },
    ],
  };

  const salesByCategoryData = {
    labels:
      salesByItemSummary?.salesByCategory?.map(
        (category) => category.categoryName
      ) || [],
    datasets: [
      {
        label: "Total Sales",
        data:
          salesByItemSummary?.salesByCategory?.map(
            (category) => category.totalSales
          ) || [],
        backgroundColor: "#2196f3",
      },
    ],
  };

  const salesTrendData = {
    labels: salesByItemSummary?.salesTrend?.map((day) => day.date) || [],
    datasets: [
      {
        label: "Daily Sales",
        data:
          salesByItemSummary?.salesTrend?.map((day) => day.totalSales) || [],
        borderColor: "#ff6b6b",
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        fill: true,
      },
    ],
  };

  const discountsData = {
    labels:
      salesByItemSummary?.discounts?.map((item) => item.productName) || [],
    datasets: [
      {
        label: "Discount Amount",
        data:
          salesByItemSummary?.discounts?.map((item) => item.discountAmount) ||
          [],
        backgroundColor: "#ff9800",
      },
    ],
  };

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Sales by Item</h2>
        </PageHeader>

        <FiltersContainer>
          <FilterItem>
            <FilterLabel htmlFor="dateRange">Date Range</FilterLabel>
            <DateRangePicker onDateChange={handleDateChange} />
          </FilterItem>

          <FilterItem>
            <FilterLabel htmlFor="categorySelect">Category</FilterLabel>
            <StyledSelect
              id="categorySelect"
              value={filters.categoryId}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categoriesList.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </StyledSelect>
          </FilterItem>
        </FiltersContainer>

        {isLoading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <SummaryBox>
          <SummaryCard>
            <CardTitle>Top Selling Items</CardTitle>
            <CardValue>
              {salesByItemSummary?.topSellingItems?.length || 0}
            </CardValue>
          </SummaryCard>
          <SummaryCard>
            <CardTitle>Top Profitable Items</CardTitle>
            <CardValue>
              {salesByItemSummary?.topProfitableItems?.length || 0}
            </CardValue>
          </SummaryCard>
          <SummaryCard>
            <CardTitle>Sales by Category</CardTitle>
            <CardValue>
              {salesByItemSummary?.salesByCategory?.length || 0}
            </CardValue>
          </SummaryCard>
          <SummaryCard>
            <CardTitle>Total Discounts</CardTitle>
            <CardValue>
              {salesByItemSummary?.discounts?.reduce(
                (sum, item) => sum + item.discountAmount,
                0
              ) || 0}
            </CardValue>
          </SummaryCard>
        </SummaryBox>

        <ChartContainer>
          <h3>Top Selling Items</h3>
          <Bar data={topSellingItemsData} />
        </ChartContainer>

        <ChartContainer>
          <h3>Top Profitable Items</h3>
          <Bar data={topProfitableItemsData} />
        </ChartContainer>

        <ChartContainer>
          <h3>Sales by Category</h3>
          <Pie data={salesByCategoryData} />
        </ChartContainer>

        <ChartContainer>
          <h3>Sales Trend</h3>
          <Line data={salesTrendData} />
        </ChartContainer>

        <ChartContainer>
          <h3>Discounts</h3>
          <Bar data={discountsData} />
        </ChartContainer>

        <Table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity Sold</th>
              <th>Total Sales</th>
              <th>Total Profit</th>
              <th>Discount Amount</th>
              <th>Loyalty Points</th>
              <th>Returnable</th>
            </tr>
          </thead>
          <tbody>
            {salesByItemSummary?.topSellingItems?.map((item, index) => (
              <tr key={index}>
                <td>{item.productName}</td>
                <td>{item.quantitySold}</td>
                <td>{item.totalSales}</td>
                <td>{item.totalProfit}</td>
                <td>{item.discountAmount}</td>
                <td>{item.loyaltyPoints}</td>
                <td>{item.returnable ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </PageContainer>
    </Page>
  );
};

export default SalesByItemPage;
