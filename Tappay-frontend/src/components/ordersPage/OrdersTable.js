import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrdersThunk } from "../Redux/orderSlice";
import styled from "styled-components";
import { Menu, MenuItem, TextField, Select } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DateRangePicker from "../common/DateRangePicker";
import { useNavigate } from "react-router-dom";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import CurrencyExchangeOutlinedIcon from "@mui/icons-material/CurrencyExchangeOutlined";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import PrintReceipt from "./PrintReceipt";
import { TableWrapper, Table } from "../../utils/BaseStyledComponents";
import { fetchUsersThunk } from "../Redux/userSlice";
import { OrderStatus } from "../../utils/enums";

const StatusBadge = styled.span`
  padding: 5px 10px;
  border-radius: 5px;
  color: white;
  background-color: ${({ status }) =>
    status === OrderStatus.COMPLETED
      ? "#28a745"  // Original Green - Success/Complete (unchanged)
      : status === OrderStatus.CONFIRMED
        ? "#2e8b57"  // Sea Green - Confirmed/In Progress
        : status === OrderStatus.DRAFT
          ? "#f4a261"  // Sandy Orange - Pending/Draft
          : status === OrderStatus.REFUNDED
            ? "#d9534f"  // Soft Red - Refunded/Attention
            : status === OrderStatus.CANCELED
              ? "#6c757d"  // Slate Gray - Canceled/Inactive
              : "#6c757d"};  // Default: Slate Gray - Unknown status
`;

const MoreIcon = styled(MoreHorizIcon)`
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: lightgrey;
  }
`;

const OrdersTable = ({ selectedOrders, setSelectedOrders }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ordersList, loading, error } = useSelector((state) => state.orders);
  const { users } = useSelector((state) => state.user);
  const [filters, setFilters] = useState({
    orderNumber: "",
    customer: "",
    status: "All",
    startDate: "",
    endDate: "",
    placedBy: "All",
  });
  const [menuState, setMenuState] = useState({
    anchorEl: null,
    orderId: null,
  });
  const [printPopup, setPrintPopup] = useState(false);

  useEffect(() => {
    dispatch(fetchOrdersThunk());
    dispatch(fetchUsersThunk());
  }, [dispatch]);

  const handleDateRangeChange = (range) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      startDate: range.startDate,
      endDate: range.endDate,
    }));
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedOrders(ordersList.map((order) => order));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrders((prevSelected) =>
      prevSelected.includes(order)
        ? prevSelected.filter((num) => num !== order)
        : [...prevSelected, order]
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const filterOrders = () => {
    return ordersList.filter((order) => {
      const orderDate = new Date(order.dateTime);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      // Ensure dates are at start/end of day for proper comparison
      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const matchesStatus =
        filters.status === "All" || order.status === filters.status;
      const matchesCustomer =
        !filters.customer ||
        (order.customer &&
          order.customer
            .toLowerCase()
            .includes(filters.customer.toLowerCase()));
      const matchesPlacedBy =
        filters.placedBy === "All" ||
        order.shift?.user?.username === filters.placedBy;
      const matchesDate =
        (!startDate || orderDate >= startDate) &&
        (!endDate || orderDate <= endDate);

      return (
        order.orderNumber.includes(filters.orderNumber) &&
        matchesCustomer &&
        matchesDate &&
        matchesStatus &&
        matchesPlacedBy
      );
    });
  };

  const filteredOrders = filterOrders();

  console.log("ordersList", ordersList);
  console.log("filteredOrders", filteredOrders);

  const handleClick = (event, orderId) => {
    setMenuState({ anchorEl: event.currentTarget, orderId });
  };

  const handleClose = () => {
    setMenuState({ anchorEl: null, orderId: null });
  };

  const handleDetails = (order) => {
    handleClose();
    navigate(`/orders/order-details/details/${order.id}`);
  };

  const handleRefund = (order) => {
    handleClose();
    navigate(`/orders/order-details/refund/${order.id}`);
  };

  const handlePrint = () => {
    setMenuState({ anchorEl: null, orderId: null });
    setPrintPopup(true);
  };

  const handleAfterPrint = () => {
    setPrintPopup(false);
  };

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
                checked={selectedOrders.length === ordersList.length}
              />
            </th>
            <th>Order Number</th>
            <th>Status</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Time</th>
            <th>Total Amount</th>
            <th>Total Items</th>
            <th>Placed by</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td>
              <TextField
                label="Order Number"
                name="orderNumber"
                variant="outlined"
                size="small"
                value={filters.orderNumber}
                onChange={handleFilterChange}
                style={{ marginRight: 10 }}
              />
            </td>
            <td>
              <Select
                label="Status"
                name="status"
                variant="outlined"
                size="small"
                value={filters.status}
                onChange={handleFilterChange}
                style={{ marginRight: 10 }}
              >
                <MenuItem value="All">All</MenuItem>
                {Object.values(OrderStatus).map((status) => (
                  <MenuItem value={status}>{status}</MenuItem>
                ))}
              </Select>
            </td>
            <td>
              <TextField
                label="Customer"
                name="customer"
                variant="outlined"
                size="small"
                value={filters.customer}
                onChange={handleFilterChange}
                style={{ marginRight: 10 }}
              />
            </td>
            <td>
              <DateRangePicker onDateChange={handleDateRangeChange} />
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td>
              <Select
                label="Placed by"
                name="placedBy"
                variant="outlined"
                size="small"
                value={filters.placedBy}
                onChange={handleFilterChange}
                style={{ marginRight: 10 }}
              >
                <MenuItem value="All">All</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.username}>
                    {user.username}
                  </MenuItem>
                ))}
              </Select>
            </td>
          </tr>
          {filteredOrders.map((order) => (
            <>
              <tr
                key={order.orderNumber}
                onDoubleClick={() => handleDetails(order)}
              >
                <td>
                  <input
                    type="checkbox"
                    onChange={() => handleSelectOrder(order)}
                    checked={selectedOrders.includes(order)}
                  />
                </td>
                <td>{order.orderNumber}</td>
                <td>
                  <StatusBadge status={order.status}>
                    {order.status}
                  </StatusBadge>
                </td>
                <td>{order.customer || "N/A"}</td>
                <td>{new Date(order.dateTime).toLocaleDateString()}</td>
                <td>{new Date(order.dateTime).toLocaleTimeString()}</td>
                <td>${order.totalAmount.toFixed(2)}</td>
                <td>{order.totalItems}</td>
                <td>{order.shift?.user?.username}</td>
                <td>
                  <MoreIcon
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={(event) => handleClick(event, order.id)}
                  />
                </td>
                <Menu
                  id="simple-menu"
                  anchorEl={menuState.anchorEl}
                  keepMounted
                  open={menuState.orderId === order.id}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => handleDetails(order)}>
                    <NotesOutlinedIcon />
                    View Details
                  </MenuItem>
                  <MenuItem onClick={() => handleRefund(order)}>
                    <CurrencyExchangeOutlinedIcon />
                    Refund
                  </MenuItem>
                  <MenuItem onClick={handlePrint}>
                    <LocalPrintshopOutlinedIcon />
                    Print
                  </MenuItem>
                </Menu>
              </tr>
              {printPopup && (
                <PrintReceipt
                  orders={[order]}
                  handleAfterPrint={handleAfterPrint}
                  handlePrintCancel={handleAfterPrint}
                />
              )}
            </>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};

export default OrdersTable;
