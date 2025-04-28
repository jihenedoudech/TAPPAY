import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsReports } from "../Redux/reportsSlice";
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
import { fetchCategoriesThunk } from "../Redux/productSlice";
import { fetchStoresThunk } from "../Redux/storeSlice";
import dayjs from "dayjs";

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

const Charts = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

const ChartContainer = styled.div`
  max-height: 400px;
  margin: 10px auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ProductsReports = () => {
  const dispatch = useDispatch();
  const { productsReports, isLoading, error } = useSelector(
    (state) => state.reports
  );
  const categoriesList = useSelector((state) => state.products.categoriesList);
  const storesList = useSelector((state) => state.store.storesList);
  const [filters, setFilters] = useState({
    startDate: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
    categoryId: null,
    storeId: localStorage.getItem("currentStoreId"),
    displayLimit: 5,
  });

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
    dispatch(fetchProductsReports(filters));
    dispatch(fetchStoresThunk());
  }, [filters, dispatch]);

  useEffect(() => {
    console.log("categoriesList", categoriesList);
    console.log("productsReports", productsReports);
  }, [categoriesList, productsReports]);

  const handleDateChange = (dates) => {
    const startDate = dates?.startDate ? dayjs(dates.startDate) : null;
    const endDate = dates?.endDate ? dayjs(dates.endDate) : null;

    setFilters({
      ...filters,
      startDate: startDate?.format("YYYY-MM-DD"),
      endDate: endDate?.format("YYYY-MM-DD"),
    });
  };

  const handleCategoryChange = (event) => {
    setFilters({ ...filters, categoryId: event.target.value });
  };

  const handleDisplayLimitChange = (event) => {
    setFilters({ ...filters, displayLimit: Number(event.target.value) });
  };

  const handleStoreChange = (event) => {
    setFilters({ ...filters, storeId: event.target.value });
  };

  const renderTopSellingProductsChart = () => {
    if (!productsReports?.topSellingProducts) return null;

    const labels = productsReports.topSellingProducts.map(
      (item) => item.productName
    );
    const data = productsReports.topSellingProducts.map(
      (item) => item.totalQuantity
    );

    const chartData = {
      labels,
      datasets: [
        {
          label: "Top Selling Products",
          data,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };

    return <Bar data={chartData} />;
  };

  const renderProfitabilityDistributionChart = () => {
    if (!productsReports?.profitabilityDistribution) return null;

    const labels = productsReports.profitabilityDistribution.map(
      (item) => item.productName
    );
    const data = productsReports.profitabilityDistribution.map(
      (item) => item.totalProfit
    );

    const chartData = {
      labels,
      datasets: [
        {
          label: "Profitability Distribution",
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

  // Helper functions for formatting
  const formatQuantity = (value) => {
    if (value == null) return "";
    return Number(value).toString(); // removes trailing zeros (e.g., 1.000 -> "1", 3.500 -> "3.5")
  };

  const formatMargin = (value) => {
    if (value == null) return "";
    return Number(value).toFixed(2); // always 2 decimals
  };

  const formatCost = (value) => {
    if (value == null) return "";
    return Number(value).toFixed(3); // always 3 decimals
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
            <DateRangePicker
              onDateChange={handleDateChange}
              defaultStartDate={filters.startDate}
              defaultEndDate={filters.endDate}
            />
          </FilterItem>
          <FilterItem>
            <FilterLabel htmlFor="storeSelect">Store</FilterLabel>
            <StyledSelect
              id="storeSelect"
              value={filters.storeId}
              onChange={handleStoreChange}
            >
              <option value="">All Stores</option>
              {storesList.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </StyledSelect>
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
          <FilterItem>
            <FilterLabel htmlFor="displayLimit">Display Count</FilterLabel>
            <Input
              type="number"
              value={filters.displayLimit}
              onChange={handleDisplayLimitChange}
            />
          </FilterItem>
        </FiltersContainer>

        {isLoading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <Charts>
          <ChartContainer>
            <h3>Top Selling Products</h3>
            {renderTopSellingProductsChart()}
          </ChartContainer>

          <ChartContainer>
            <h3>Profitability Distribution</h3>
            {renderProfitabilityDistributionChart()}
          </ChartContainer>
        </Charts>

        <Table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Sold Quantity</th>
              <th>Net Sales</th>
              <th>Total Profit</th>
              <th>Margin</th>
              <th>Current Cost</th>
              <th>Least Cost</th>
              <th>Total Cost</th>
              <th>Items Refunded</th>
            </tr>
          </thead>
          <tbody>
            {productsReports?.productData?.map((item, index) => (
              <tr key={index}>
                <td>{item.productName}</td>
                <td>{formatQuantity(item.soldQuantity)}</td>
                <td>{item.netSales}</td>
                <td>{item.totalProfit}</td>
                <td>{formatMargin(item.margin)}</td>
                <td>{formatCost(item.currentCost)}</td>
                <td>{item.leastCost}</td>
                <td>{formatCost(item.totalCost)}</td>
                <td>{formatQuantity(item.itemsRefunded)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </PageContainer>
    </Page>
  );
};

export default ProductsReports;
