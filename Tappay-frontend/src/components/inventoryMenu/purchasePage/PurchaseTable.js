import React, { useEffect, useState } from "react";
import { TableWrapper, Table } from "../../../utils/BaseStyledComponents";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ActionMenu from "../../common/ActionMenu";
import {
  deletePurchaseRecordThunk,
  fetchPurchasesRecordsThunk,
  fetchSuppliersThunk,
} from "../../Redux/purchaseSlice";
import { AlertNotif, Select } from "../../../utils/BaseStyledComponents";
import { Fade, MenuItem, Menu } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DateRangePicker from "../../common/DateRangePicker";
import styled from "styled-components";

const MoreIcon = styled(MoreHorizIcon)`
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: lightgrey;
  }
`;

const PurchaseTable = ({ selectedPurchases, setSelectedPurchases }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const purchases = useSelector((state) => state.purchase.purchases);
  const suppliers = useSelector((state) => state.purchase.suppliers);
  const [alert, setAlert] = useState(null);
  const [filters, setFilters] = useState({
    supplier: "",
    startDate: "",
    endDate: "",
  });
  const [menuState, setMenuState] = useState({
    anchorEl: null,
    purchaseId: null,
  });

  useEffect(() => {
    dispatch(fetchPurchasesRecordsThunk());
    dispatch(fetchSuppliersThunk());
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
      setSelectedPurchases(purchases.map((purchase) => purchase));
    } else {
      setSelectedPurchases([]);
    }
  };

  const handleSelectPurchase = (purchase) => {
    setSelectedPurchases((prevSelected) =>
      prevSelected.includes(purchase)
        ? prevSelected.filter((item) => item !== purchase)
        : [...prevSelected, purchase]
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => {
      if (name === "supplier") {
        const newValue = prevFilters[name] === value ? "" : value;
        return { ...prevFilters, [name]: newValue };
      }
      return { ...prevFilters, [name]: value };
    });
  };

  const filterPurchases = () => {
    return purchases.filter((purchase) => {
      const purchaseDate = new Date(purchase.date);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      const matchesSupplier =
        !filters.supplier || purchase.supplier?.id === filters.supplier;

      return (
        matchesSupplier &&
        (!startDate || purchaseDate >= startDate) &&
        (!endDate || purchaseDate <= endDate)
      );
    });
  };

  const filteredPurchases = filterPurchases();

  const handleClick = (event, purchaseId) => {
    setMenuState({ anchorEl: event.currentTarget, purchaseId });
  };

  const handleClose = () => {
    setMenuState({ anchorEl: null, purchaseId: null });
  };

  const handleViewDetails = (purchase) => {
    navigate(`/inventory/purchases-invoices/purchase-details/${purchase.id}`);
  };

  const handleEditPurchase = (purchase) => {
    navigate(`/inventory/purchases-invoices/purchase-edit/${purchase.id}`);
  };

  const handleDeletePurchase = (purchase) => {
    const response = dispatch(deletePurchaseRecordThunk(purchase.id));
    if (response.type.includes("fulfilled")) {
      setAlert({
        message: "Purchase record deleted successfully",
        type: "success",
      });
    } else {
      setAlert({
        message: "Failed to delete purchase record",
        type: "error",
      });
    }
    setTimeout(() => setAlert(null), 1500);
  };

  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedPurchases?.length === purchases.length}
              />
            </th>
            <th>Supplier</th>
            <th>Company</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total Cost</th>
            <th>Discount</th>
            <th>Affected Stores</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td>
                <Select
                  name="supplier"
                  value={filters.supplier}
                  onChange={handleFilterChange}
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </Select>
            </td>
            <td></td>
            <td>
              <DateRangePicker onDateChange={handleDateRangeChange} />
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          {filteredPurchases.map((purchase, index) => {
            const uniqueStores = new Set();
            purchase.purchasedItems?.forEach((item) => {
              item.purchaseItemStores?.forEach((store) => {
                uniqueStores.add(store.store.name);
              });
            });
            const storeNames = Array.from(uniqueStores).join(", ");

            return (
              <tr key={index} onDoubleClick={() => handleViewDetails(purchase)}>
                <td>
                  <input
                    type="checkbox"
                    onChange={() => handleSelectPurchase(purchase)}
                    checked={selectedPurchases?.includes(purchase)}
                  />
                </td>
                <td>
                  {purchase.supplier ? purchase.supplier?.name : "No supplier"}
                </td>
                <td>
                  {purchase.supplier
                    ? purchase.supplier?.company
                    : "No company"}
                </td>
                <td>{new Date(purchase.date).toLocaleDateString()}</td>
                <td>{purchase.purchasedItems?.length}</td>
                <td>${purchase.total}</td>
                <td>${purchase.discount}</td>
                <td>{storeNames}</td>
                <td>
                  <MoreIcon
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={(event) => handleClick(event, purchase.id)}
                  />
                  <Menu
                    id="simple-menu"
                    anchorEl={menuState.anchorEl}
                    keepMounted
                    open={menuState.purchaseId === purchase.id}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={() => handleViewDetails(purchase)}>
                      View Details
                    </MenuItem>
                    <MenuItem onClick={() => handleEditPurchase(purchase)}>
                      Edit
                    </MenuItem>
                    <MenuItem onClick={() => handleDeletePurchase(purchase)}>
                      Delete
                    </MenuItem>
                  </Menu>
                </td>
              </tr>
            );
          })}
        </tbody>
        <Fade in={alert}>
          <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
        </Fade>
      </Table>
    </TableWrapper>
  );
};

export default PurchaseTable;
