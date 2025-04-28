import React, { useState } from "react";
import styled from "styled-components";
import {
  Button,
  ButtonsGroup,
  PageContainer,
  PageHeader,
  PageTitle,
  Table,
  TableWrapper,
} from "../../../utils/BaseStyledComponents";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Page from "../../common/Page";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  deletePurchaseItemThunk,
  deletePurchaseRecordThunk,
  selectPurchaseById,
} from "../../Redux/purchaseSlice";
import { useDispatch, useSelector } from "react-redux";
import { AlertNotif } from "../../../utils/BaseStyledComponents";
import { Fade } from "@mui/material";
import * as XLSX from "xlsx";
import DeleteConfirmation from "../../common/DeleteConfirmation";
import { theme } from "../../../theme";
import DeleteIcon from "@mui/icons-material/Delete";
import { ArrowLeftIcon } from "@mui/x-date-pickers";

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

const PurchaseDetailsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const purchase = useSelector((state) => selectPurchaseById(state, id));

  const [alert, setAlert] = useState(null);
  const [deleteConfirmationFor, setDeleteConfirmationFor] = useState(null);
  const { error } = useSelector((state) => state.purchase);
  console.log("purchase: ", purchase);

  const handleExport = () => {
    try {
      console.log("exporting...");
      // Prepare table headers
      const headers = [
        [
          "Supplier",
          "Company",
          "Date",
          "Total",
          "Product Name",
          "Barcode",
          "Ref",
          "Quantity",
          "Price (Excl. Tax)",
          "Tax (%)",
          "Price (Incl. Tax)",
          "Total for Item",
          ...purchase.purchasedItems[0].purchaseItemStores.map(
            (store) => store.store.name
          ),
        ],
      ];

      // Prepare table data
      const tableData = purchase.purchasedItems?.map((item, index) => {
        const storeQuantities = {};
        item?.purchaseItemStores?.forEach((store) => {
          storeQuantities[store.store.name] = store.quantity;
        });

        const row = [
          index === 0 ? purchase.supplier?.name : null,
          index === 0 ? purchase.supplier?.company : null,
          index === 0 ? new Date(purchase.date).toLocaleDateString() : null,
          index === 0 ? purchase.total : null,
          item.productDetails.name,
          item.barcode,
          item.ref,
          item.quantity,
          item.priceExclTax,
          item.tax,
          item.priceInclTax,
          item.total,
          ...purchase.purchasedItems[0]?.purchaseItemStores?.map(
            (store) => storeQuantities[store.store.name] || 0
          ),
        ];

        return row;
      });

      // Merge headers and data
      const data = headers.concat(tableData);
      console.log("data: ", data);
      // Create a worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(data);

      // Create a workbook and append the sheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "PurchaseDetails");

      // Export the workbook to an Excel file
      XLSX.writeFile(
        workbook,
        `Purchase_Details_${purchase.supplier?.name}_${purchase.supplier?.company}_${purchase.date}.xlsx`
      );

      // Notify success (optional)
      setAlert({
        message: "Excel file exported successfully!",
        type: "success",
      });
      console.log("exported");
    } catch (error) {
      console.error("Error exporting to Excel:", error);

      // Notify the user about the error
      setAlert({
        message: "Failed to export Excel file. Please try again.",
        type: "error",
      });
    } finally {
      // Clear alert after a delay (optional)
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleDelete = (deleteFor) => {
    setDeleteConfirmationFor(deleteFor);
  };

  const handleDeleteConfirmation = async (id) => {
    console.log("id: ", id);
    let response = null;
    if (deleteConfirmationFor.type === "record") {
      response = await dispatch(deletePurchaseRecordThunk(id));
    } else if (deleteConfirmationFor.type === "item") {
      response = await dispatch(deletePurchaseItemThunk(id));
    }
    console.log("response: ", response);
    if (response.type.includes("fulfilled")) {
      setAlert({
        message: "Item deleted successfully",
        type: "success",
      });
      navigate("/inventory/purchases-invoices");
    } else {
      setAlert({
        message: error || "Failed to delete item",
        type: "error",
      });
    }
    setTimeout(() => setAlert(null), 1500);
  };

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <PageTitle>
            <ArrowLeftIcon onClick={() => navigate(-1)} />
            Purchase Record Details
          </PageTitle>
          <ButtonsGroup>
            <Button onClick={handleExport}>
              <FileDownloadOutlinedIcon />
              Export to Excel
            </Button>
            <Button
              onClick={() =>
                handleDelete({
                  id: purchase.id,
                  name: "This Purchase Record",
                  type: "record",
                })
              }
            >
              <DeleteOutlineOutlinedIcon />
              Delete
            </Button>
          </ButtonsGroup>
        </PageHeader>

        {/* Table for Purchase Overview and Items */}
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Company</th>
                <th>Date</th>
                <th>Total</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price (Excl. Tax)</th>
                <th>Tax (%)</th>
                <th>Price (Incl. Tax)</th>
                <th>Total for Item</th>
                {purchase.purchasedItems[0]?.purchaseItemStores?.map(
                  (store, index) => (
                    <th key={index}>{store.store.name}</th>
                  )
                )}
                <th />
              </tr>
            </thead>
            <tbody>
              {purchase.purchasedItems?.map((item, index) => {
                const storeQuantities = {};
                item.purchaseItemStores?.forEach((store) => {
                  storeQuantities[store.store.name] = store.quantity;
                });

                return (
                  <tr key={index}>
                    {/* Purchase Overview Row (Repeated for each item) */}
                    {index === 0 && (
                      <>
                        <td rowSpan={purchase.purchasedItems?.length}>
                          {purchase.supplier
                            ? purchase.supplier?.name
                            : "No supplier"}
                        </td>
                        <td rowSpan={purchase.purchasedItems?.length}>
                          {purchase.supplier
                            ? purchase.supplier?.company
                            : "No company"}
                        </td>
                        <td rowSpan={purchase.purchasedItems?.length}>
                          {new Date(purchase.date).toLocaleDateString()}
                        </td>
                        <td rowSpan={purchase.purchasedItems?.length}>
                          {purchase.total}
                        </td>
                      </>
                    )}

                    {/* Item Details */}
                    <td>{item.productDetails.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.priceExclTax}</td>
                    <td>{item.tax}</td>
                    <td>{item.priceInclTax}</td>
                    <td>{item.total}</td>
                    {purchase.purchasedItems[0].purchaseItemStores.map(
                      (store, storeIndex) => (
                        <td key={storeIndex}>
                          {storeQuantities[store.store.name] || 0}
                        </td>
                      )
                    )}
                    <td>
                      <IconButton
                        onClick={() =>
                          handleDelete({
                            id: item.id,
                            name: `the purchase of ${item.productDetails.name}`,
                            type: "item",
                          })
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrapper>
        <Fade in={alert}>
          <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
        </Fade>
        {deleteConfirmationFor && (
          <DeleteConfirmation
            itemName={deleteConfirmationFor.name}
            onCancel={() => setDeleteConfirmationFor(null)}
            onDelete={() => handleDeleteConfirmation(deleteConfirmationFor.id)}
          />
        )}
      </PageContainer>
    </Page>
  );
};

export default PurchaseDetailsPage;
