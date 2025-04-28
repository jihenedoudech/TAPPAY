import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSalesSummary } from "../Redux/reportsSlice";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import DateRangePicker from "../common/DateRangePicker";
import styled from "styled-components";
import Page from "../common/Page";
import {
  PageContainer,
  PageHeader,
  Table,
} from "../../utils/BaseStyledComponents";
import { fetchStoresThunk } from "../Redux/storeSlice";
import { OrderStatus } from "../../utils/enums";
import dayjs from "dayjs";

const FiltersContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 10px 0;
  flex-wrap: wrap;
`;

const FilterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FilterLabel = styled.label`
  font-size: 16px;
  color: #888;
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
    width: 100%; /* Ensure full width on small screens */
  }
`;

const StyledButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: ${(props) => (props.active ? "#f94d71" : "#f1f1f1")};
  color: ${(props) => (props.active ? "white" : "#444")};
  font-weight: bold;
  cursor: pointer;
  transition:
    background 0.3s ease,
    transform 0.3s ease;

  &:hover {
    background: #f94d71;
    color: white;
    transform: translateY(-2px); /* Slight hover effect */
  }

  @media (max-width: 768px) {
    padding: 6px 12px; /* Adjust padding for smaller screens */
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

const StatusButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const StatusButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: ${(props) => (props.active ? "#f94d71" : "#f1f1f1")};
  color: ${(props) => (props.active ? "white" : "#444")};
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #f94d71;
    color: white;
  }
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

const TotalsList = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;

  div {
    padding: 8px 12px;
    border-radius: 20px;
    background: #f1f1f1;
    color: #444;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: bold;

    &.active {
      background: #f94d71;
      color: white;
    }

    &:hover {
      background: #f94d71;
      color: white;
    }
  }
`;

const SalesSummaryPage = () => {
  const dispatch = useDispatch();
  const { salesSummary, isLoading, error } = useSelector(
    (state) => state.reports
  );
  const storesList = useSelector((state) => state.store.storesList);
  const [filters, setFilters] = useState({
    startDate: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
    storeId: localStorage.getItem("currentStoreId") || null,
    ordersStatus: [],
  });

  const [selectedMetric, setSelectedMetric] = useState("totalSales");

  useEffect(() => {
    dispatch(fetchStoresThunk());
    dispatch(fetchSalesSummary(filters));
  }, [filters, dispatch]);

  useEffect(() => {
    console.log("salesSummary: ", salesSummary);
    console.log("filters: ", filters);
  }, [salesSummary, filters]);

  const handleDateChange = (dates) => {
    const startDate = dates?.startDate ? dayjs(dates.startDate) : null;
    const endDate = dates?.endDate ? dayjs(dates.endDate) : null;
  
    setFilters({
      ...filters,
      startDate: startDate?.format("YYYY-MM-DD"),
      endDate: endDate?.format("YYYY-MM-DD"),
    });
  };

  const handleStoreChange = (event) => {
    setFilters({ ...filters, storeId: event.target.value });
  };

  const handleStatusChange = (status) => {
    if (status === "ALL") {
      setFilters({ ...filters, ordersStatus: [] }); // Reset to include all statuses
    } else {
      setFilters({
        ...filters,
        ordersStatus: filters.ordersStatus.includes(status)
          ? filters.ordersStatus.filter((item) => item !== status)
          : [...filters.ordersStatus, status],
      });
    }
  };

  const metrics = [
    { key: "totalSales", label: "Total Sales" },
    // { key: "netSales", label: "Net Sales" },
    { key: "discounts", label: "Discounts" },
    { key: "refunds", label: "Refunds" },
    { key: "costOfGoodsSold", label: "Cost Of Goods" },
    { key: "profit", label: "Profit" },
  ];

  const chartData = {
    labels:
      salesSummary?.dailyData?.map((day) =>
        dayjs(day.date).format("YYYY-MM-DD")
      ) || [],
    datasets: [
      {
        label: metrics.find((metric) => metric.key === selectedMetric)?.label,
        data:
          salesSummary?.dailyData?.map((day) =>
            parseFloat(day[selectedMetric])
          ) || [],
        borderColor: "#ff6b6b",
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        fill: true,
      },
    ],
  };

  console.log("storesList: ", storesList);

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Sales Summary</h2>
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
            <FilterLabel>Status</FilterLabel>
            <StatusButtonGroup>
              <StyledButton
                active={filters.ordersStatus.length === 0}
                onClick={() => handleStatusChange("ALL")}
              >
                All
              </StyledButton>
              {Object.values(OrderStatus).map((status) => (
                <StyledButton
                  key={status}
                  active={filters.ordersStatus.includes(status)}
                  onClick={() => handleStatusChange(status)}
                >
                  {status}
                </StyledButton>
              ))}
            </StatusButtonGroup>
          </FilterItem>
        </FiltersContainer>

        {isLoading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <SummaryBox>
          {metrics.map((metric) => (
            <SummaryCard key={metric.key}>
              <CardTitle>{metric.label}</CardTitle>
              <CardValue>
                {salesSummary?.totalSummary?.[metric.key]?.toLocaleString() ||
                  0}
              </CardValue>
            </SummaryCard>
          ))}
        </SummaryBox>

        <ChartContainer>
          <TotalsList>
            {metrics.map((metric) => (
              <div
                key={metric.key}
                className={metric.key === selectedMetric ? "active" : ""}
                onClick={() => setSelectedMetric(metric.key)}
              >
                {metric.label}
              </div>
            ))}
          </TotalsList>
          <Bar data={chartData} />
        </ChartContainer>

        <Table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Sales</th>
              {/* <th>Net Sales</th> */}
              <th>Discounts</th>
              <th>Refunds</th>
              <th>Cost Of Goods</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {salesSummary?.dailyData?.map((data, index) => (
              <tr key={index}>
                <td>{dayjs(data.date).format("YYYY-MM-DD")}</td>
                <td>{data.totalSales}</td>
                {/* <td>{data.netSales}</td> */}
                <td>{data.discounts}</td>
                <td>{data.refunds}</td>
                <td>{data.costOfGoodsSold}</td>
                <td>{data.profit}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </PageContainer>
    </Page>
  );
};

export default SalesSummaryPage;
