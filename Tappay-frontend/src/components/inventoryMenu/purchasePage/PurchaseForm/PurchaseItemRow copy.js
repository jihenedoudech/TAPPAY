import { InputBox, Select } from "../../../../utils/BaseStyledComponents";
import { theme } from "../../../../theme";
import styled from "styled-components";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { UnitOfMeasure } from "../../../../utils/enums";
import NewCategory from "../../../productsPage/NewCategory";

const TableRow = styled.tr`
  background-color: ${(props) => (props.isChild ? "#f0f8ff" : "white")};
  font-style: ${(props) => (props.isChild ? "italic" : "normal")};
  border-top: ${(props) => (props.isChild ? "1px dashed #ddd" : "none")};
  border-left: ${(props) => (props.isChild ? "4px solid #007BFF" : "none")};
`;

const TableCell = styled.td`
  position: relative;
  border-right: 1px solid #ddd;
  padding: 10px;
  text-align: center;
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

const BarcodeDisplay = styled.div`
  position: absolute;
  cursor: pointer;
  color: ${theme.colors.primary};
  padding: 2px;
  &:hover {
    text-decoration: underline;
  }
`;

const PurchaseItemRow = ({
  item,
  index,
  visibleColumns,
  selectedStores,
  categories,
  handleInputChange,
  handleProductDetailsChange,
  handleBarcodeOrReferenceChange,
  handleStoreInputChange,
  removeItem,
  handleBarcodeClick,
  handlePackInputChange, // new prop – only passed for parent rows
  isChild, // new flag: true if this is the generated child row
}) => {
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    console.log("item: ", item);
  }, [item]);
  return (
    <TableRow isChild={isChild} key={index}>
      {visibleColumns.productDetails.name && (
        <TableCell>
          <InputBox
            value={item.productDetails.name || ""}
            onChange={(e) =>
              handleProductDetailsChange(index, "name", e.target.value)
            }
          />
        </TableCell>
      )}
      {visibleColumns.productDetails.barcode && (
        <TableCell>
          <InputBox
            placeholder="Enter barcode"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleBarcodeOrReferenceChange(
                  index,
                  e.target.value,
                  "barcode"
                );
                e.target.value = "";
              }
            }}
          />
          {item.productDetails.barcodes.length > 0 && (
            <BarcodeDisplay onClick={() => handleBarcodeClick(index)}>
              {item.productDetails.barcodes.length > 1
                ? `${item.productDetails.barcodes[0].barcode || item.productDetails.barcodes[0]}...`
                : item.productDetails.barcodes[0].barcode ||
                  item.productDetails.barcodes[0]}
            </BarcodeDisplay>
          )}
        </TableCell>
      )}
      {visibleColumns.productDetails.reference && (
        <TableCell>
          <InputBox
            value={item.productDetails.reference}
            onChange={(e) =>
              handleBarcodeOrReferenceChange(index, e.target.value, "reference")
            }
          />
        </TableCell>
      )}
      {visibleColumns.productDetails.unitOfMeasure && (
        <TableCell>
          {isChild ? (
            // For child rows, show static text (or styled text) indicating "PIECE"
            <span>{UnitOfMeasure.PIECE}</span>
          ) : item.productDetails.unitOfMeasure === UnitOfMeasure.PACK ? (
            // For parent rows with a PACK, combine the select and a small number input in one cell
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Select
                value={item.productDetails.unitOfMeasure}
                onChange={(e) =>
                  handleProductDetailsChange(index, "unitOfMeasure", e.target.value)
                }
              >
                <option value="">Select Measuring Type</option>
                {Object.values(UnitOfMeasure).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              <InputBox
                type="number"
                value={item.piecesPerPack || ""}
                onChange={(e) => handlePackInputChange(index, e.target.value)}
                step="1"
                placeholder="Pieces/Pack"
                style={{ width: "80px" }}
              />
            </div>
          ) : (
            // For other units, show the normal select
            <Select
              value={item.productDetails.unitOfMeasure}
              onChange={(e) =>
                handleProductDetailsChange(index, "unitOfMeasure", e.target.value)
              }
            >
              <option value="">Select Measuring Type</option>
              {Object.values(UnitOfMeasure).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          )}
        </TableCell>
      )}
      {visibleColumns.productDetails.category && (
        <TableCell>
          <Select
            value={item.productDetails.category || ""}
            onChange={(e) => {
              const selectedValue = e.target.value;
              if (selectedValue === "addNewCategory") {
                setShowModal(true); // Trigger the modal
              } else {
                handleProductDetailsChange(index, "category", selectedValue);
              }
            }}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
            <option value="addNewCategory">+ Add New Category</option>
          </Select>
        </TableCell>
      )}
      {visibleColumns.purchaseDetails.quantity && (
        <TableCell>
          <InputBox
            type="number"
            inputMode="decimal"
            value={item.quantity}
            onChange={(e) =>
              handleInputChange(index, "quantity", e.target.value)
            }
            step="1"
            disabled={isChild}
          />
        </TableCell>
      )}
      {visibleColumns.purchaseDetails.priceExclTax && (
        <TableCell>
          <InputBox
            type="number"
            inputMode="decimal"
            value={item.priceExclTax}
            onChange={(e) =>
              handleInputChange(index, "priceExclTax", e.target.value)
            }
            step="0.001"
            disabled={isChild}
          />
        </TableCell>
      )}
      {visibleColumns.purchaseDetails.tax && (
        <TableCell>
          <InputBox
            type="number"
            inputMode="decimal"
            value={item.tax}
            onChange={(e) => handleInputChange(index, "tax", e.target.value)}
            step="0.001"
            disabled={isChild}
          />
        </TableCell>
      )}
      {visibleColumns.purchaseDetails.priceInclTax && (
        <TableCell>
          <InputBox
            type="number"
            inputMode="decimal"
            value={item.priceInclTax}
            onChange={(e) =>
              handleInputChange(index, "priceInclTax", e.target.value)
            }
            step="0.001"
            disabled={isChild}
          />
        </TableCell>
      )}
      {visibleColumns.purchaseDetails.total && (
        <TableCell>
          <InputBox
            type="number"
            inputMode="decimal"
            value={item.total}
            onChange={(e) => handleInputChange(index, "total", e.target.value)}
            step="0.001"
            disabled={isChild}
          />
        </TableCell>
      )}
      {selectedStores?.map((store) => (
        <React.Fragment key={store.id}>
          {visibleColumns.stores[store.id]?.quantity && (
            <TableCell>
              {/* <StoreQtyInput> */}
              {/* <input
                  type="checkbox"
                  checked={item.stores.some((s) => s.storeId === store.id)}
                  onChange={() => handleStoreCheckboxChange(index, store)}
                /> */}
              {/* {item.stores.some((s) => s.storeId === store.id) && ( */}
              <InputBox
                type="number"
                inputMode="decimal"
                value={
                  item.stores.find((s) => s.storeId === store.id)?.quantity
                }
                onChange={(e) =>
                  handleStoreInputChange(
                    index,
                    store.id,
                    "quantity",
                    e.target.value
                  )
                }
                step="1"
                disabled={isChild}
              />
              {/* )} */}
              {/* </StoreQtyInput> */}
            </TableCell>
          )}
          {visibleColumns.stores[store.id]?.sellingRatio && (
            <TableCell>
              <InputBox
                type="number"
                inputMode="decimal"
                value={
                  item.stores.find((s) => s.storeId === store.id)
                    ?.sellingRatio || ""
                }
                onChange={(e) =>
                  handleStoreInputChange(
                    index,
                    store.id,
                    "sellingRatio",
                    e.target.value
                  )
                }
                step="0.001"
              />
            </TableCell>
          )}
          {visibleColumns.stores[store.id]?.sellingPrice && (
            <TableCell>
              <InputBox
                type="number"
                inputMode="decimal"
                value={
                  item.stores.find((s) => s.storeId === store.id)
                    ?.sellingPrice || ""
                }
                onChange={(e) =>
                  handleStoreInputChange(
                    index,
                    store.id,
                    "sellingPrice",
                    e.target.value
                  )
                }
                step="0.001"
              />
            </TableCell>
          )}
        </React.Fragment>
      ))}
      <td>
        <IconButton onClick={() => removeItem(index)}>
          <DeleteIcon />
        </IconButton>
      </td>
      {showModal && (
        <NewCategory
          setShowModal={setShowModal}
          handleChangeCategory={(e) => {
            console.log("category event: ", e);
            handleProductDetailsChange(index, "category", e);
          }}
        />
      )}
    </TableRow>
  );
};

export default PurchaseItemRow;
