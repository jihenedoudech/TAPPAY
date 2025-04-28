import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AddIcon from "@mui/icons-material/Add";
import Page from "../../../common/Page";
import { theme } from "../../../../theme";
import {
  AlertNotif,
  BackButton,
  Button,
  PageTitle,
  Table,
  TableWrapper,
  InputBox,
} from "../../../../utils/BaseStyledComponents";
import { addPurchaseRecordThunk } from "../../../Redux/purchaseSlice";
import { useDispatch, useSelector } from "react-redux";
import { removeNullValues } from "../../../../utils/utilsFunctions";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Fade } from "@mui/material";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import {
  fetchCategoriesThunk,
  fetchProductsDetailsThunk,
} from "../../../Redux/productSlice";
import HeaderForm from "./HeaderForm";
import BarcodeList from "./BarcodeList";
import PurchaseItemRow from "./PurchaseItemRow";
import { UnitOfMeasure } from "../../../../utils/enums";

const Container = styled.div`
  padding: 20px;
  margin: auto;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  width: calc(100vw - 80px);
  overflow: auto;
`;

const StyledTable = styled(Table)`
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
`;

const HeaderCell = styled.th`
  background-color: ${theme.colors.lightGrey};
  border-right: 1px solid #ddd;
  padding: 10px;
  text-align: center;
`;

const SubHeaderCell = styled.th`
  background-color: ${theme.colors.white};
  border-right: 1px solid #ddd;
  padding: 10px;
  text-align: center;
`;

const PurchaseForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productsList, categoriesList } = useSelector(
    (state) => state.products
  );
  const [purchaseRecordData, setPurchaseRecordData] = useState({
    supplier: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [purchasedItems, setPurchasedItems] = useState([
    {
      productDetails: {
        id: null,
        name: null,
        barcodes: [],
        reference: null,
        unitOfMeasure: UnitOfMeasure.PIECE,
      },
      quantity: 1,
      priceExclTax: null,
      tax: 0,
      priceInclTax: null,
      total: null,
      stores: [],
    },
  ]);
  const [alert, setAlert] = useState(null);
  const [showBarcodes, setShowBarcodes] = useState(null);
  const [selectedStores, setSelectedStores] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState({
    productDetails: {
      name: true,
      barcode: true,
      reference: true,
      unitOfMeasure: false,
      category: false,
    },
    purchaseDetails: {
      quantity: true,
      priceExclTax: false,
      tax: false,
      priceInclTax: true,
      total: true,
    },
    stores: selectedStores.reduce((acc, storeId) => {
      acc[storeId] = {
        quantity: true,
        sellingRatio: false,
        sellingPrice: false,
      };
      return acc;
    }, {}),
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
    dispatch(fetchProductsDetailsThunk());
  }, [dispatch]);

  const calculateTotalForItem = (item) => {
    const taxMultiplier = 1 + parseFloat(item.tax) / 100;
    const priceInclTax = parseFloat(item.priceExclTax) * taxMultiplier;
    const total = parseFloat(item.quantity) * priceInclTax;
    return {
      priceInclTax: priceInclTax.toFixed(3),
      total: total.toFixed(3),
    };
  };

  const handleInputChange = (index, field, value) => {
    const updatedItem = { ...purchasedItems[index], [field]: value };

    if (field === "total") {
      const taxMultiplier = 1 + parseFloat(updatedItem.tax) / 100;
      updatedItem.priceInclTax = (
        parseFloat(value) / parseFloat(updatedItem.quantity)
      ).toFixed(3);
      updatedItem.priceExclTax = (
        parseFloat(updatedItem.priceInclTax) / taxMultiplier
      ).toFixed(3);
    } else if (field === "priceInclTax") {
      updatedItem.total = (
        parseFloat(value) * parseFloat(updatedItem.quantity)
      ).toFixed(3);
      const taxMultiplier = 1 + parseFloat(updatedItem.tax) / 100;
      updatedItem.priceExclTax = (parseFloat(value) / taxMultiplier).toFixed(3);
    } else if (field === "quantity") {
      console.log("updatedItem: ", updatedItem);
      console.log("value: ", value);
      console.log("isNaN(parseInt(value)): ", isNaN(parseInt(value)));
      if (updatedItem.productDetails.unitOfMeasure === UnitOfMeasure.PIECE) {
        if (!/^\d*$/.test(value)) {
          setAlert({
            message: `Quantity for pieces must be a whole number.`,
            type: "error",
          });
          setTimeout(() => setAlert(null), 3000);
          return;
        }
        value = Math.floor(value);
      }
      console.log("value outside: ", value);
      updatedItem.total = updatedItem.priceInclTax
        ? (parseFloat(updatedItem.priceInclTax) * parseFloat(value)).toFixed(3)
        : null;
    } else if (field === "priceExclTax" || field === "tax") {
      const { priceInclTax, total } = calculateTotalForItem(updatedItem);
      updatedItem.priceInclTax = priceInclTax;
      updatedItem.total = total;
    }

    const updatedItems = purchasedItems.map((item, i) =>
      i === index ? updatedItem : item
    );
    setPurchasedItems(updatedItems);
  };

  const handleProductDetailsChange = (index, field, value) => {
    console.log("handleProductDetailsChange: ", index, field, value);
    const updatedItem = {
      ...purchasedItems[index],
      productDetails: {
        ...purchasedItems[index].productDetails,
        [field]: value,
      },
    };
    const updatedItems = purchasedItems.map((item, i) =>
      i === index ? updatedItem : item
    );
    setPurchasedItems(updatedItems);
  };

  const handleBarcodeOrReferenceChange = (index, value, type) => {
    // Determine if the input is barcode or reference
    const isBarcode = type === "barcode";

    // Check for duplicate barcodes
    if (isBarcode) {
      const barcodeExists = purchasedItems.some((item) =>
        item.productDetails.barcodes.some((b) => b.barcode === value)
      );

      if (barcodeExists) {
        setAlert({
          message: `Barcode "${value}" already exists.`,
          type: "error",
        });
        setTimeout(() => setAlert(null), 3000);
        return;
      }
    }

    const currentItem = purchasedItems[index];
    const currentReference = currentItem.productDetails.reference;

    // Find the product in productsList based on the reference or barcode
    const product = productsList.find((product) =>
      isBarcode
        ? product.barcodes.some((b) => b.barcode === value)
        : product.reference === value
    );

    let updatedItems = [...purchasedItems];

    if (product) {
      // Reference matches a product: Update product details
      const updatedItem = {
        ...currentItem,
        productDetails: {
          id: product.id,
          name: product.name,
          reference: product.reference,
          category: product.category?.id,
          unitOfMeasure: product.unitOfMeasure,
          barcodes: product.barcodes.map((b) => ({
            barcode: b.barcode,
            id: b.id,
            description: b.description,
          })),
        },
        stores: product.productStores.map((store) => ({
          storeId: store.store.id,
          sellingPrice: store.sellingPrice,
        })),
      };

      updatedItems[index] = updatedItem;
    } else {
      console.log("currentItem: ", currentItem);
      // Reference doesn't match any product OR has changed: Reset product details
      const shouldReset =
        type === "reference" &&
        ((currentReference &&
          currentReference !== value &&
          // currentItem.productDetails.barcodes.length === 0 &&
          currentItem.productDetails.id !== null) ||
          (value === "" && currentItem.productDetails.id !== null));

      console.log("shouldReset: ", shouldReset);

      const newBarcode = {
        barcode: value,
        id: null,
        description: null,
      };

      updatedItems[index] = {
        ...currentItem,
        productDetails: shouldReset
          ? {
              id: null,
              name: null,
              reference: value.trim() || null, // Keep the new reference if non-empty, otherwise null
              category: null,
              unitOfMeasure: null,
              barcodes: [],
            }
          : {
              ...currentItem.productDetails,
              reference: isBarcode
                ? currentItem.productDetails.reference
                : value,
              barcodes: isBarcode
                ? [...currentItem.productDetails.barcodes, newBarcode]
                : currentItem.productDetails.barcodes,
            },
      };
    }
    console.log("updatedItems: ", updatedItems);
    setPurchasedItems(updatedItems);
  };

  useEffect(() => {
    console.log("purchasedItems: ", purchasedItems);
  }, [purchasedItems]);

  const handleStoreInputChange = (itemIndex, storeId, field, value) => {
    console.log("handleStoreInputChange: ", itemIndex, storeId, field, value);
    setPurchasedItems((prevItems) => {
      const updatedItems = [...prevItems];
      const item = updatedItems[itemIndex];

      console.log("stores : ", item.stores);
      const store = item.stores.find((s) => s.storeId === storeId);
      console.log("store: ", store);

      if (!store) return prevItems;

      if (field === "quantity") {
        if (item.productDetails.unitOfMeasure === UnitOfMeasure.PIECE) {
          if (!/^\d*$/.test(value)) {
            setAlert({
              message: `Quantity for pieces must be a whole number.`,
              type: "error",
            });
            setTimeout(() => setAlert(null), 3000);
            return prevItems;
          }
          value = Math.floor(value);
        }
        store[field] = parseFloat(value) || "";
      } else if (field === "sellingRatio") {
        store[field] = parseFloat(value) || "";
        store.sellingPrice = store.sellingRatio
          ? (
              parseFloat(item.priceInclTax) +
              (store.sellingRatio / 100) * parseFloat(item.priceInclTax)
            ).toFixed(3)
          : "";
      } else if (field === "sellingPrice") {
        store[field] = parseFloat(value) || "";
        store.sellingRatio = store.sellingPrice
          ? (
              ((parseFloat(store.sellingPrice) -
                parseFloat(item.priceInclTax)) /
                parseFloat(item.priceInclTax)) *
              100
            ).toFixed(2)
          : "";
      }

      return updatedItems;
    });
  };

  const handleStoreInputChangeForChild = (index, storeId, field, value) => {
    // Retrieve the parent item so we can calculate the cost per piece
    const parentItem = purchasedItems[index]; // parent's data at the same index
    let childCost = 0;
    if (parentItem.priceInclTax && parentItem.piecesPerPack) {
      childCost =
        parseFloat(parentItem.priceInclTax) /
        parseFloat(parentItem.piecesPerPack);
    }

    // Update the specific store for the child row
    const updatedStores = parentItem.childItem.stores.map((store) => {
      if (store.storeId === storeId) {
        let newStoreData = { ...store, [field]: value };

        if (field === "sellingPrice" && childCost > 0) {
          // Calculate new selling ratio automatically
          const newSellingPrice = parseFloat(value);
          const newSellingRatio = (
            ((newSellingPrice - childCost) / childCost) *
            100
          ).toFixed(2);
          newStoreData = { ...newStoreData, sellingRatio: newSellingRatio };
        }

        if (field === "sellingRatio" && childCost > 0) {
          // Optionally, calculate selling price automatically if the user updates selling ratio
          const newSellingRatio = parseFloat(value);
          const newSellingPrice = (
            childCost *
            (1 + newSellingRatio / 100)
          ).toFixed(3);
          newStoreData = { ...newStoreData, sellingPrice: newSellingPrice };
        }

        return newStoreData;
      }
      return store;
    });

    // Update the child row with the new stores data
    const updatedChild = {
      ...purchasedItems[index].childItem,
      stores: updatedStores,
    };
    const updatedItems = purchasedItems.map((it, i) =>
      i === index ? { ...it, childItem: updatedChild } : it
    );
    setPurchasedItems(updatedItems);
  };

  const handlePackInputChange = (index, value) => {
    const updatedItem = { ...purchasedItems[index], piecesPerPack: value };
    if (
      value &&
      updatedItem.productDetails.unitOfMeasure === UnitOfMeasure.PACK
    ) {
      // (Re)generate the child item based on the new pieces-per-pack value.
      updatedItem.childItem = generateChildItem(updatedItem);
    } else {
      updatedItem.childItem = null;
    }
    const updatedItems = purchasedItems.map((item, i) =>
      i === index ? updatedItem : item
    );
    setPurchasedItems(updatedItems);
  };

  const addItem = () => {
    setPurchasedItems([
      ...purchasedItems,
      {
        productDetails: {
          name: null,
          barcodes: [],
          reference: null,
        },
        quantity: 1,
        priceExclTax: null,
        tax: 0,
        priceInclTax: null,
        total: null,
        sellingPrice: null,
        sellingRatio: 0,
        stores: selectedStores.map((store) => ({
          storeId: store.id,
          quantity: 0,
        })),
        // New fields for pack handling:
        piecesPerPack: null, // to be entered if unit is PACK
        childItem: null, // will be generated when piecesPerPack is provided
      },
    ]);
  };

  const generateChildItem = (parentItem) => {
    const pieces = parseFloat(parentItem.piecesPerPack) || 1;
    return {
      productDetails: {
        name: parentItem.productDetails.name
          ? `${parentItem.productDetails.name} piece`
          : "",
        reference: parentItem.productDetails.reference
          ? `${parentItem.productDetails.reference}PC`
          : "",
        unitOfMeasure: UnitOfMeasure.PIECE,
        category: parentItem.productDetails.category || null,
        barcodes: [], // do not initialize barcodes
      },
      stores: parentItem.stores.map((store) => ({
        storeId: store.storeId,
        quantity: 0, // disabled – quantity is only handled in the parent
        sellingPrice: store.sellingPrice
          ? (parseFloat(store.sellingPrice) / pieces).toFixed(3)
          : "",
        sellingRatio: store.sellingRatio,
      })),
      isChild: true, // flag so that the row is rendered differently
    };
  };

  const removeItem = (index) =>
    setPurchasedItems(purchasedItems.filter((_, i) => i !== index));

  const calculateTotalPurchase = () =>
    purchasedItems
      .reduce((total, item) => total + parseFloat(item.total || 0), 0)
      .toFixed(3);

  const validateQuantities = () => {
    for (const item of purchasedItems) {
      console.log("item.stores: ", item.stores);
      const totalStoreQuantity = item.stores
        .filter((store) => store.quantity !== 0)
        .reduce((total, store) => total + parseFloat(store.quantity), 0);
      console.log("totalStoreQuantity: ", totalStoreQuantity);
      if (totalStoreQuantity > parseFloat(item.quantity)) {
        setAlert({
          message: `Exceeded quantity for ${item.productDetails.name} in stores.`,
          type: "error",
        });
        return false;
      } else if (totalStoreQuantity < parseFloat(item.quantity)) {
        setAlert({
          message: `Insufficient quantity for ${item.productDetails.name} in stores.`,
          type: "error",
        });
        return false;
      }
    }
    return true;
  };

  const validateRequiredFields = () => {
    if (purchaseRecordData.date === null) {
      setAlert({
        message: `Date is required.`,
        type: "error",
      });
      return false;
    }
    if (purchasedItems.length === 0) {
      setAlert({
        message: `No items added.`,
        type: "error",
      });
      return false;
    }
    for (const item of purchasedItems) {
      console.log("item: ", item);

      if (!item.productDetails.name) {
        setAlert({
          message: `Name is required for all items.`,
          type: "error",
        });
        return false;
      }
      if (
        !item.productDetails.barcodes.length &&
        !item.productDetails.reference
      ) {
        setAlert({
          message: `Either barcode or reference is required for all items.`,
          type: "error",
        });
        return false;
      }
      if (!item.total) {
        console.log("total is required for all items: ", item);
        setAlert({
          message: `Total is required for all items.`,
          type: "error",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);
    if (!validateRequiredFields() || !validateQuantities()) {
      setTimeout(() => setAlert(null), 3000);
      setIsLoading(false);
      return;
    }

    const purchaseData = {
      supplierId: purchaseRecordData.supplier,
      date: purchaseRecordData.date,
      purchasedItems: purchasedItems.map((item) => ({
        ...item,
        productDetails: {
          ...item.productDetails,
          reference:
            item.productDetails.reference === ""
              ? null
              : item.productDetails.reference,
        },
        quantity: Number(item.quantity),
        priceExclTax: Number(item.priceExclTax),
        tax: Number(item.tax),
        priceInclTax: Number(item.priceInclTax),
        total: Number(item.total),
        sellingPrice: item.sellingPrice ? Number(item.sellingPrice) : null,
        stores: item.stores.filter(
          (store) => store.quantity && store.quantity !== 0
        ),
      })),
      total: Number(calculateTotalPurchase()),
    };

    const PurchaseDataFiltered = removeNullValues(purchaseData);
    console.log("PurchaseDataFiltered: ", PurchaseDataFiltered);
    const response = await dispatch(
      addPurchaseRecordThunk(PurchaseDataFiltered)
    );

    if (response.type.includes("fulfilled")) {
      navigate("/inventory/purchases-invoices");
      setAlert({
        message: "Purchase added successfully",
        type: "success",
      });
    } else {
      setAlert({
        message: "Failed to add purchase",
        type: "error",
      });
    }
    setTimeout(() => {
      setAlert(null);
    }, 1500);
    setIsLoading(false);
    return;
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleBarcodeClick = (index) => {
    setShowBarcodes(index);
  };

  useEffect(() => {
    console.log("purchasedItems: ", purchasedItems);
  }, [purchasedItems]);

  return (
    <Page>
      <Container>
        <PageTitle>
          <BackButton onClick={handleBack}>
            <ArrowLeftIcon />
          </BackButton>
          Add New Purchase
        </PageTitle>
        <HeaderForm
          purchaseRecordData={purchaseRecordData}
          setPurchaseRecordData={setPurchaseRecordData}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          selectedStores={selectedStores}
          setSelectedStores={setSelectedStores}
          purchasedItems={purchasedItems}
          setPurchasedItems={setPurchasedItems}
        />
        <TableWrapper>
          <StyledTable>
            <thead>
              <tr>
                <HeaderCell
                  colSpan={
                    Object.values(visibleColumns.productDetails).filter(Boolean)
                      .length
                  }
                >
                  Product Details
                </HeaderCell>
                <HeaderCell
                  colSpan={
                    Object.values(visibleColumns.purchaseDetails).filter(
                      Boolean
                    ).length
                  }
                >
                  Purchase Details
                </HeaderCell>
                {selectedStores?.map((store) => (
                  <HeaderCell
                    key={store.id}
                    colSpan={
                      Object.values(visibleColumns.stores[store.id])?.filter(
                        Boolean
                      )?.length
                    }
                  >
                    {store.name}
                  </HeaderCell>
                ))}
                <HeaderCell rowSpan={2} />
              </tr>
              <tr>
                {Object.entries(visibleColumns.productDetails).map(
                  ([key, visible]) =>
                    visible ? (
                      <SubHeaderCell key={key}>{key}</SubHeaderCell>
                    ) : null
                )}
                {Object.entries(visibleColumns.purchaseDetails).map(
                  ([key, visible]) =>
                    visible ? (
                      <SubHeaderCell key={key}>{key}</SubHeaderCell>
                    ) : null
                )}
                {selectedStores?.map((store) =>
                  Object.entries(visibleColumns.stores[store.id])?.map(
                    ([key, visible]) =>
                      visible ? (
                        <SubHeaderCell key={`${store.id}-${key}`}>
                          {key}
                        </SubHeaderCell>
                      ) : null
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {purchasedItems.map((item, index) => (
                <React.Fragment key={index}>
                  {/* Parent Row */}
                  <PurchaseItemRow
                    item={item}
                    index={index}
                    categories={categoriesList}
                    visibleColumns={visibleColumns}
                    selectedStores={selectedStores}
                    handleProductDetailsChange={handleProductDetailsChange}
                    handleInputChange={handleInputChange}
                    handleBarcodeOrReferenceChange={
                      handleBarcodeOrReferenceChange
                    }
                    handleStoreInputChange={handleStoreInputChange}
                    removeItem={removeItem}
                    handleBarcodeClick={handleBarcodeClick}
                    // Pass the pack-change handler to the parent row so it can show the extra input.
                    handlePackInputChange={handlePackInputChange}
                    isChild={false}
                  />
                  {/* Child Row – render only if the product unit is PACK and a child item exists */}
                  {item.productDetails.unitOfMeasure === UnitOfMeasure.PACK &&
                    item.childItem && (
                      <PurchaseItemRow
                        item={item.childItem}
                        index={index} // you can pass the parent index here if needed
                        categories={categoriesList}
                        visibleColumns={visibleColumns}
                        selectedStores={selectedStores}
                        handleProductDetailsChange={(i, field, value) => {
                          // Update only child product details
                          const updatedChild = {
                            ...purchasedItems[index].childItem,
                            productDetails: {
                              ...purchasedItems[index].childItem.productDetails,
                              [field]: value,
                            },
                          };
                          const updatedItems = purchasedItems.map((it, i) =>
                            i === index
                              ? { ...it, childItem: updatedChild }
                              : it
                          );
                          setPurchasedItems(updatedItems);
                        }}
                        handleBarcodeOrReferenceChange={
                          handleBarcodeOrReferenceChange
                        }
                        handleStoreInputChange={handleStoreInputChangeForChild}
                        handleBarcodeClick={handleBarcodeClick}
                        isChild={true} // mark this row as a child row
                      />
                    )}
                </React.Fragment>
              ))}
              <tr>
                <td colSpan={2}>
                  <Button onClick={addItem}>
                    <AddIcon /> Add Item
                  </Button>
                </td>
              </tr>
              <tr>
                <td align="right">
                  <strong>Total Purchase:</strong>
                </td>
                <td colSpan={2}>
                  <InputBox readOnly value={calculateTotalPurchase()} />
                </td>
              </tr>
            </tbody>
          </StyledTable>
        </TableWrapper>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : "Save Purchase"}
        </Button>
        <Fade in={alert}>
          <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
        </Fade>
        {showBarcodes !== null && (
          <BarcodeList
            showBarcodes={showBarcodes}
            setShowBarcodes={setShowBarcodes}
            purchasedItems={purchasedItems}
            setPurchasedItems={setPurchasedItems}
          />
        )}
      </Container>
    </Page>
  );
};

export default PurchaseForm;
