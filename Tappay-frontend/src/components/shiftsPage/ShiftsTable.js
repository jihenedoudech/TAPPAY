import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { TableWrapper, Table } from "../../utils/BaseStyledComponents";
import { useNavigate } from "react-router-dom";
import { ShiftStatus, UserRole } from "../../utils/enums";
import { Select, MenuItem } from "@mui/material";
import DateRangePicker from "../common/DateRangePicker";
import { useDispatch, useSelector } from "react-redux";
import { fetchStoresThunk } from "../Redux/storeSlice";
import { fetchCurrentUserThunk } from "../Redux/userSlice";

// Styled status badge
const StatusBadge = styled.span`
  padding: 5px 10px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  background-color: ${({ status }) =>
    status === ShiftStatus.CLOSED
      ? "#ff6b6b"
      : status === ShiftStatus.OPEN
        ? "#28a745"
        : "#ffc107"};
`;

const formatDateTime = (dateTime) =>
  new Date(dateTime).toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const ShiftsTable = ({ shifts }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { storesList } = useSelector((state) => state.store);
  const { currentUserRole, user } = useSelector((state) => state.user);
  const [filters, setFilters] = useState({
    cashier: "All",
    store: "All",
    status: "All",
    startDateStart: "",
    startDateEnd: "",
    endDateStart: "",
    endDateEnd: "",
  });

  useEffect(() => {
    dispatch(fetchStoresThunk());
    dispatch(fetchCurrentUserThunk());
  }, [dispatch]);

  const handleViewDetails = (shift) => {
    navigate(`/shifts/shift-details/${shift.id}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleStartDateRangeChange = (range) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      startDateStart: range.startDate,
      startDateEnd: range.endDate,
    }));
  };

  const handleEndDateRangeChange = (range) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      endDateStart: range.startDate,
      endDateEnd: range.endDate,
    }));
  };

  console.log("currentUser: ", user);

  const filterShifts = () => {
    return shifts.filter((shift) => {
      if (currentUserRole !== UserRole.ADMIN) {
        return shift.user?.id === user.id;
      }
      const shiftStartDate = new Date(shift.startTime);
      const shiftEndDate = shift.endTime ? new Date(shift.endTime) : null;
      const startDateStart = filters.startDateStart
        ? new Date(filters.startDateStart)
        : null;
      const startDateEnd = filters.startDateEnd
        ? new Date(filters.startDateEnd)
        : null;
      const endDateStart = filters.endDateStart
        ? new Date(filters.endDateStart)
        : null;
      const endDateEnd = filters.endDateEnd
        ? new Date(filters.endDateEnd)
        : null;

      // Normalize dates for full-day comparison
      if (startDateStart) startDateStart.setHours(0, 0, 0, 0);
      if (startDateEnd) startDateEnd.setHours(23, 59, 59, 999);
      if (endDateStart) endDateStart.setHours(0, 0, 0, 0);
      if (endDateEnd) endDateEnd.setHours(23, 59, 59, 999);

      const matchesCashier =
        filters.cashier === "All" || shift.user?.username === filters.cashier;
      const matchesStore =
        filters.store === "All" || shift.store?.name === filters.store; // Updated to exact match
      const matchesStatus =
        filters.status === "All" || shift.status === filters.status;
      const matchesStartDate =
        (!startDateStart || shiftStartDate >= startDateStart) &&
        (!startDateEnd || shiftStartDate <= startDateEnd);
      const matchesEndDate =
        (!endDateStart || (shiftEndDate && shiftEndDate >= endDateStart)) &&
        (!endDateEnd || (shiftEndDate && shiftEndDate <= endDateEnd));

      return (
        matchesCashier &&
        matchesStore &&
        matchesStatus &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  };

  const filteredShifts = filterShifts();

  // Get unique cashiers for select options
  const uniqueCashiers = [
    ...new Set(shifts.map((shift) => shift.user?.username).filter(Boolean)),
  ];

  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <th>Cashier</th>
            <th>Store</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Opening Cash</th>
            <th>Total Sales</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {currentUserRole === UserRole.ADMIN && (
                <Select
                  label="Cashier"
                  name="cashier"
                  variant="outlined"
                  size="small"
                  value={filters.cashier}
                onChange={handleFilterChange}
                style={{ marginRight: 10, minWidth: 120 }}
              >
                <MenuItem value="All">All</MenuItem>
                {uniqueCashiers.map((username) => (
                  <MenuItem key={username} value={username}>
                    {username}
                  </MenuItem>
                  ))}
                </Select>
              )}
            </td>
            <td>
              <Select
                label="Store"
                name="store"
                variant="outlined"
                size="small"
                value={filters.store}
                onChange={handleFilterChange}
                style={{ marginRight: 10, minWidth: 120 }}
              >
                <MenuItem value="All">All</MenuItem>
                {storesList.map((store) => (
                  <MenuItem key={store.id} value={store.name}>
                    {store.name}
                  </MenuItem>
                ))}
              </Select>
            </td>
            <td>
              <DateRangePicker onDateChange={handleStartDateRangeChange} />
            </td>
            <td>
              <DateRangePicker onDateChange={handleEndDateRangeChange} />
            </td>
            <td></td>
            <td></td>
            <td>
              <Select
                label="Status"
                name="status"
                variant="outlined"
                size="small"
                value={filters.status}
                onChange={handleFilterChange}
                style={{ marginRight: 10, minWidth: 120 }}
              >
                <MenuItem value="All">All</MenuItem>
                {Object.values(ShiftStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </td>
          </tr>
          {filteredShifts.map((shift) => (
            <tr key={shift.id} onDoubleClick={() => handleViewDetails(shift)}>
              <td>{shift.user?.username || "Unknown"}</td>
              <td>{shift.store?.name || "Unknown"}</td>
              <td>{formatDateTime(shift.startTime)}</td>
              <td>
                {shift.endTime ? formatDateTime(shift.endTime) : "Ongoing"}
              </td>
              <td>${shift.openingCashAmount.toFixed(2)}</td>
              <td>${shift.totalSales.toFixed(2)}</td>
              <td>
                <StatusBadge status={shift.status}>{shift.status}</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};

export default ShiftsTable;
