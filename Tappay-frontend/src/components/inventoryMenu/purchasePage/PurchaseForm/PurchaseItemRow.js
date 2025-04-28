import { InputBox, Select } from "../../../../utils/BaseStyledComponents";
import { theme } from "../../../../theme";
import styled from "styled-components";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { UnitOfMeasure } from "../../../../utils/enums";
import NewCategory from "../../../productsPage/NewCategory";
import ProductSearchPopup from "./ProductSearchPopup";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

// Update TableRow styling to be more discrete for child rows
const TableRow = styled.tr`
  background-color: ${(props) => (props.isChild ? "#fafafa" : "white")};
  font-style: ${(props) => (props.isChild ? "italic" : "normal")};
  border-bottom: 1px solid #ddd;
  /* If it's a child row, add a subtle left border and slight indent */
  ${(props) =>
    props.isChild &&
    `
      border-left: 2px solid #ddd;
      opacity: 0.9;
  `}
`;

const TableCell = styled.td`
  position: relative;
  border-right: 1px solid #ddd;
  padding: 12px;
  text-align: left;
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

// New styled components for the PACK composite control
const PackInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UnderlinedInput = styled.input`
  border: none;
  border-bottom: 1px solid #ccc;
  outline: none;
  width: 50px;
  text-align: center;
`;

const PackLabel = styled.span`
  font-size: 0.9rem;
  color: #333;
`;

const NameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
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
  handlePackInputChange,
  isChild,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showProductSearchPopup, setShowProductSearchPopup] = useState(false);

  useEffect(() => {
    console.log("item: ", item);
  }, [item]);

  const handleSelectFromPopup = (product) => {
    // If the product has barcodes, use the first one; otherwise use the reference.
    if (product.barcodes && product.barcodes.length > 0) {
      handleBarcodeOrReferenceChange(
        index,
        product.barcodes[0].barcode,
        "barcode"
      );
    } else {
      handleBarcodeOrReferenceChange(index, product.reference, "reference");
    }
    setShowProductSearchPopup(false);
  };

  return (
    <TableRow isChild={isChild} key={index}>
      {visibleColumns.productDetails.name && (
        <TableCell>
          <NameContainer>
            <InputBox
              value={item.productDetails.name || ""}
              onChange={(e) =>
                handleProductDetailsChange(index, "name", e.target.value)
              }
            />
            <IconButton onClick={() => setShowProductSearchPopup(true)}>
              <SearchOutlinedIcon />
            </IconButton>
          </NameContainer>
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
            // For child rows, display static text instead of a select
            <span>{UnitOfMeasure.PIECE}</span>
          ) : item.productDetails.unitOfMeasure === UnitOfMeasure.PACK ? (
            // For parent rows with PACK, combine the select and pieces-per-pack input in one cell
            <PackInputWrapper>
              <Select
                value={item.productDetails.unitOfMeasure}
                onChange={(e) =>
                  handleProductDetailsChange(
                    index,
                    "unitOfMeasure",
                    e.target.value
                  )
                }
                style={{ minWidth: "100px" }} // ensure full content (like "Pack") is visible
              >
                <option value="">Select Measuring Type</option>
                {Object.values(UnitOfMeasure).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              <PackLabel>of</PackLabel>
              <UnderlinedInput
                type="number"
                value={item.piecesPerPack || null}
                onChange={(e) =>
                  handlePackInputChange(item.localId, e.target.value)
                }
                step="1"
                placeholder=""
              />
              <PackLabel>pc</PackLabel>
            </PackInputWrapper>
          ) : (
            // For other units, render a normal select
            <Select
              value={item.productDetails.unitOfMeasure}
              onChange={(e) =>
                handleProductDetailsChange(
                  index,
                  "unitOfMeasure",
                  e.target.value
                )
              }
              style={{ minWidth: "100px" }}
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
                setShowModal(true);
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
                disabled={isChild}
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
      <TableCell>
        {!isChild && (
          <IconButton onClick={() => removeItem(index)}>
            <DeleteIcon />
          </IconButton>
        )}
      </TableCell>
      {showModal && (
        <NewCategory
          setShowModal={setShowModal}
          handleChangeCategory={(e) => {
            console.log("category event: ", e);
            handleProductDetailsChange(index, "category", e);
          }}
        />
      )}
      {showProductSearchPopup && (
        <ProductSearchPopup
          onClose={() => setShowProductSearchPopup(false)}
          onSelectProduct={handleSelectFromPopup}
        />
      )}
    </TableRow>
  );
};

export default PurchaseItemRow;
