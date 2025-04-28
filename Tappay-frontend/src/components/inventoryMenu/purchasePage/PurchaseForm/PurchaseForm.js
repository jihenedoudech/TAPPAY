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
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [itemCounter, setItemCounter] = useState(1);
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

  const createNewItem = () => {
    console.log("create new item");
    setItemCounter(itemCounter + 1);
    return {
      localId: itemCounter, // Unique ID for this row
      parentLocalId: null, // No parent for this item
      productDetails: {
        name: null,
        barcodes: [],
        reference: null,
        unitOfMeasure: UnitOfMeasure.PIECE,
        piecesPerPack: null,
        category: null,
      },
      quantity: 1,
      priceExclTax: null,
      tax: 0,
      priceInclTax: null,
      total: null,
      stores: selectedStores.map((store) => ({
        storeId: store.id,
        quantity: 0,
        sellingPrice: store.sellingPrice,
      })),
    };
  };

  const addItem = () => {
    setPurchasedItems([...purchasedItems, createNewItem()]);
  };

  useEffect(() => {
    addItem();
  }, []);

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
      if (selectedStores.length === 1) {
        const storeId = selectedStores[0].id;
        const store = updatedItem.stores.find((s) => s.storeId === storeId);
        if (store) {
          store.quantity = value;
        }
      }
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
    let updatedItems = purchasedItems.map((item, i) => {
      if (i === index) {
        // Build updated product details for the targeted item
        let newProductDetails = {
          ...item.productDetails,
          [field]: value,
        };

        // If unitOfMeasure is changed and it's not PACK, reset piecesPerPack to null
        if (field === "unitOfMeasure" && value !== UnitOfMeasure.PACK) {
          newProductDetails.piecesPerPack = null;
        }

        return {
          ...item,
          productDetails: newProductDetails,
        };
      }
      console.log("item.productDetails: ", item.productDetails);
      return item;
    });

    // Optionally, filter out child items if they exist for the current parent
    if (field === "unitOfMeasure" && value !== UnitOfMeasure.PACK) {
      const parentLocalId = purchasedItems[index].localId;
      updatedItems = updatedItems.filter(
        (item) => item.parentLocalId !== parentLocalId
      );
    }

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
      console.log("product: ", product);
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
        stores: selectedStores.map((selectedStore) => {
          // Find product store info if available.
          const productStore = product.productStores.find(
            (ps) => ps.store.id === selectedStore.id
          );
          // Optionally, preserve any existing quantity from the current item.
          const existingStore =
            currentItem.stores &&
            currentItem.stores.find((s) => s.storeId === selectedStore.id);
          return {
            storeId: selectedStore.id,
            sellingPrice: productStore
              ? productStore.sellingPrice
              : selectedStore.sellingPrice,
            quantity: existingStore ? existingStore.quantity : 0,
          };
        }),
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

  const handlePackInputChange = (parentLocalId, value) => {
    console.log("handlePackInputChange: ", parentLocalId, value);
    setPurchasedItems((prevItems) => {
      // First, update the parent's piecesPerPack value.
      let updatedItems = prevItems.map((item) =>
        item.localId === parentLocalId
          ? {
              ...item,
              productDetails: {
                ...item.productDetails,
                piecesPerPack: Number(value),
              },
            }
          : item
      );

      // Find the updated parent.
      const parentItem = updatedItems.find(
        (item) => item.localId === parentLocalId
      );
      console.log("parentItem: ", parentItem);
      console.log("parentItem.localId: ", parentItem.localId);

      // If the parent's unit is PACK, generate or update the child row.
      if (
        parentItem &&
        parentItem.productDetails.unitOfMeasure === UnitOfMeasure.PACK
      ) {
        const newChild = generateChildItem(parentItem);
        console.log("newChild: ", newChild);
        // Remove any existing child associated with this parent.
        updatedItems = updatedItems.filter(
          (item) => item.parentLocalId !== parentLocalId
        );
        // Find the parent's current index.
        const parentIndex = updatedItems.findIndex(
          (item) => item.localId === parentLocalId
        );
        // Insert the child row right after the parent.
        updatedItems.splice(parentIndex + 1, 0, newChild);
      } else {
        // If not PACK or value cleared, remove any existing child row.
        updatedItems = updatedItems.filter(
          (item) => item.parentLocalId !== parentLocalId
        );
      }
      return updatedItems;
    });
  };

  useEffect(() => {
    console.log("purchasedItems: ", purchasedItems);
    console.log("supplier: ", purchaseRecordData.supplier);
  }, [purchasedItems, purchaseRecordData.supplier]);

  useEffect(() => {
    console.log("selectedStores: ", selectedStores);
  }, [selectedStores]);

  useEffect(() => {
    console.log("stores: ", purchasedItems[0]?.stores);
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
          : null;
      } else if (field === "sellingPrice") {
        store[field] = parseFloat(value) || "";
        store.sellingRatio = store.sellingPrice
          ? (
              ((parseFloat(store.sellingPrice) -
                parseFloat(item.priceInclTax)) /
                parseFloat(item.priceInclTax)) *
              100
            ).toFixed(2)
          : null;
      }

      return updatedItems;
    });
  };

  const removeItem = (index) => {
    setPurchasedItems((prevItems) => {
      // Identify the item to remove (the parent)
      const itemToRemove = prevItems[index];
      console.log("itemToRemove: ", itemToRemove);
      if (!itemToRemove) return prevItems;
      const parentLocalId = itemToRemove.localId;
      console.log("parentLocalId: ", parentLocalId);
      // Filter out both the parent and its child(ren)
      return prevItems.filter(
        (item) =>
          item.localId !== parentLocalId && item.parentLocalId !== parentLocalId
      );
    });
  };

  const generateChildItem = (parentItem) => {
    console.log("generateChildItem: ", parentItem);
    setItemCounter(itemCounter + 1);
    const pieces = parseFloat(parentItem.piecesPerPack) || 1;
    const pieceSellingPrice = parentItem.sellingPrice
      ? (parseFloat(parentItem.sellingPrice) / pieces).toFixed(3)
      : null;
    return {
      localId: itemCounter, // Unique local identifier for the child
      parentLocalId: parentItem.localId, // Link to parent's identifier
      productDetails: {
        name: parentItem.productDetails.name
          ? `${parentItem.productDetails.name} piece`
          : null,
        reference: parentItem.productDetails.reference
          ? `${parentItem.productDetails.reference}PC`
          : null,
        unitOfMeasure: UnitOfMeasure.PIECE,
        category: parentItem.productDetails.category || null,
        barcodes: [],
      },
      stores: parentItem.stores.map((store) => ({
        storeId: store.storeId,
        sellingPrice: pieceSellingPrice,
        sellingRatio:
          pieceSellingPrice && parentItem.priceInclTax && pieces
            ? (pieceSellingPrice / (parentItem.priceInclTax / pieces)).toFixed(
                2
              )
            : null,
      })),
      isChild: true,
    };
  };

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
      if (!item.isChild) {
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

      if (!item.isChild) {
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
        // Include our temporary linking fields:
        localId: item.localId, // our temporary unique identifier
        parentLocalId: item.parentLocalId || null, // will be set for child rows
        isChild: item.isChild || false, // flag to indicate if this row is a child
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
        // Process stores: filter out any store that doesn't have quantity.
        stores: item.stores
          .filter((store) =>
            item.isChild ? true : store.quantity && store.quantity !== 0
          )
          .map((store) => ({
            storeId: store.storeId,
            quantity: Number(store.quantity),
            sellingPrice: store.sellingPrice
              ? Number(store.sellingPrice)
              : null,
            sellingRatio: store.sellingRatio
              ? Number(store.sellingRatio)
              : null,
          })),
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
                <PurchaseItemRow
                  key={index}
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
                  handlePackInputChange={
                    !item.parentId &&
                    item.productDetails.unitOfMeasure === UnitOfMeasure.PACK
                      ? handlePackInputChange
                      : undefined
                  }
                  isChild={item.isChild || false}
                />
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
