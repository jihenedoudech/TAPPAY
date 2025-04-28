import React, { useEffect, useState, useMemo } from "react";
import {
  PageContainer,
  CenterButton,
  Button,
  Input,
  PageTitle,
  BackButton,
  AlertNotif,
  Select,
  Table,
  TableWrapper,
} from "../../../utils/BaseStyledComponents";
import Page from "../../common/Page";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategoriesThunk,
  fetchProductsInStoreThunk,
} from "../../Redux/productSlice";
import Loading from "../../common/Loading";
import Error from "../../common/Error";
import {
  createInventoryThunk,
  fetchInventoryByIdThunk,
  setSelectedStoreId,
} from "../../Redux/inventorySlice";
import ConfirmSaveTab from "./ConfirmSaveTab";
import { InventoryStatus } from "../../../utils/enums";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CircularProgress, Fade } from "@mui/material";
import { removeNullValues } from "../../../utils/utilsFunctions";
import AutorenewIcon from "@mui/icons-material/Autorenew";

const PageContent = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const FiltersContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const TotalsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 25px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const TotalItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Label = styled.span`
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
`;

const Value = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const InventoryForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productsInStore, categoriesList, loading, error } = useSelector(
    (state) => state.products
  );
  const selectedStoreId = useSelector(
    (state) => state.inventory.selectedStoreId
  );
  const { inventoryId } = useParams();
  const location = useLocation();
  const continueWithLastState = location.state?.continueWithLastState || false;

  const [inventory, setInventory] = useState(null);
  // Initialize products with an "editing" flag.
  const [products, setProducts] = useState([]);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: "",
    selectedCategory: "All",
  });

  console.log("selectedStoreId: ", selectedStoreId);

  useEffect(() => {
    if (!continueWithLastState && selectedStoreId) {
      dispatch(fetchProductsInStoreThunk(selectedStoreId));
    }
  }, [dispatch, selectedStoreId, continueWithLastState]);

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  useEffect(() => {
    if (inventoryId) {
      // Continuing an inventory
      if (!inventory) {
        // Fetch the inventory if it hasn't been loaded yet
        dispatch(fetchInventoryByIdThunk(inventoryId)).then((response) => {
          if (fetchInventoryByIdThunk.fulfilled.match(response)) {
            setInventory(response.payload);
            // Set the selected store from the fetched inventory
            dispatch(setSelectedStoreId(response.payload.store.id));
          }
        });
      } else {
        // Inventory is loaded, initialize products based on continue type
        if (continueWithLastState) {
          // --- Case 1: Continue with Last Inventory State ---
          const inventoryProducts = inventory.inventoryLines.map((line) => ({
            id: line.productStore.id,
            inventoryLineId: line.id, // include the inventory line ID for updating
            productDetails: line.productStore.productDetails,
            expectedQty: line.expectedQty,
            expectedValue: line.expectedValue,
            foundQty: line.foundQty,
            status: line.status, // COMPLETED or DRAFT
            stockBatches: line.productStore.stockBatches,
            editing: false,
          }));
          // Sort so that COMPLETED rows come after editable rows
          inventoryProducts.sort((a, b) => {
            if (
              a.status === InventoryStatus.COMPLETED &&
              b.status !== InventoryStatus.COMPLETED
            ) {
              return 1;
            } else if (
              a.status !== InventoryStatus.COMPLETED &&
              b.status === InventoryStatus.COMPLETED
            ) {
              return -1;
            }
            return 0;
          });
          setProducts(inventoryProducts);
        } else {
          // --- Case 2: Continue with Current Stock State ---
          // Use completed lines from the fetched inventory (read-only)
          const completedLines = inventory.inventoryLines
            .filter((line) => line.status === InventoryStatus.COMPLETED)
            .map((line) => ({
              id: line.productStore.id,
              inventoryLineId: line.id,
              productDetails: line.productStore.productDetails,
              expectedQty: line.expectedQty,
              expectedValue: line.expectedValue,
              foundQty: line.foundQty,
              status: line.status,
              stockBatches: line.productStore.stockBatches,
              editing: false,
            }));
          const completedIds = new Set(completedLines.map((line) => line.id));
          // Merge with new rows from productsInStore for products not already included.
          // New rows now use DRAFT as the default status.
          const newProducts = productsInStore
            .filter((product) => !completedIds.has(product.id))
            .map((product) => {
              const expectedQty = product.availableStock;
              const expectedValue = product.stockBatches.reduce(
                (total, batch) =>
                  total + batch.currentStock * batch.costInclTax,
                0
              );
              return {
                id: product.id,
                productDetails: product.productDetails,
                expectedQty,
                expectedValue,
                foundQty: null,
                stockBatches: product.stockBatches,
                status: InventoryStatus.DRAFT, // default status instead of "NEW"
                editing: false,
              };
            });
          // Concatenate new products first, then completed lines.
          setProducts([...newProducts, ...completedLines]);
        }
      }
    } else {
      // --- Case 3: New Inventory (No inventoryId) ---
      if (productsInStore && productsInStore.length > 0) {
        const initializedProducts = productsInStore.map((product) => {
          const expectedQty = product.availableStock;
          const expectedValue = product.stockBatches.reduce(
            (total, batch) => total + batch.currentStock * batch.costInclTax,
            0
          );
          return {
            id: product.id,
            productDetails: product.productDetails,
            expectedQty,
            expectedValue,
            foundQty: null,
            stockBatches: product.stockBatches,
            status: InventoryStatus.DRAFT, // use DRAFT rather than "NEW"
            editing: false,
          };
        });
        setProducts(initializedProducts);
      }
    }
  }, [
    inventoryId,
    inventory,
    productsInStore,
    continueWithLastState,
    dispatch,
  ]);

  // Toggle editing mode for a given product row.
  const toggleEditing = (id) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === id) {
          if (!product.editing) {
            if (!continueWithLastState) {
              const storeProd = productsInStore.find((p) => p.id === id);
              if (storeProd) {
                const newExpectedQty = storeProd.availableStock;
                const newExpectedValue = storeProd.stockBatches.reduce(
                  (total, batch) =>
                    total + batch.currentStock * batch.costInclTax,
                  0
                );
                return {
                  ...product,
                  editing: true,
                  expectedQty: newExpectedQty,
                  expectedValue: newExpectedValue,
                };
              }
            }
            return { ...product, editing: true };
          } else {
            return { ...product, editing: false };
          }
        }
        return product;
      })
    );
  };

  // Handle input change for found quantity
  const handleFoundQtyChange = (id, value) => {
    // Ensure no negative value is set.
    const numericValue = Math.max(0, Number(value));
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, foundQty: numericValue } : product
      )
    );
  };

  const calculateFoundValue = (product) => {
    if (!product.foundQty || product.foundQty <= 0) return 0;
    let remainingQty = product.foundQty;
    let foundValue = 0;
    // Sort stock batches by purchase date (most recent first)
    const sortedBatches = [...product.stockBatches].sort(
      (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
    );
    for (const batch of sortedBatches) {
      if (remainingQty <= 0) break;
      const qtyUsed = Math.min(remainingQty, batch.currentStock);
      foundValue += qtyUsed * batch.costInclTax;
      remainingQty -= qtyUsed;
    }
    return foundValue;
  };

  // Totals calculation
  const totalExpectedValue = useMemo(
    () => products.reduce((total, product) => total + product.expectedValue, 0),
    [products]
  );
  const totalFoundValue = useMemo(
    () =>
      products.reduce(
        (total, product) => total + calculateFoundValue(product),
        0
      ),
    [products]
  );

  // Helper to build each inventory line payload
  const buildInventoryLine = (product) => {
    const foundValue = calculateFoundValue(product);
    const difference = product.expectedQty - (product.foundQty || 0);
    const lossValue = product.expectedValue - foundValue;
    const lineStatus =
      product.foundQty === null
        ? InventoryStatus.DRAFT
        : InventoryStatus.COMPLETED;
    const line = {
      productStoreId: product.id,
      expectedQty: product.expectedQty,
      foundQty: product.foundQty,
      difference,
      expectedValue: product.expectedValue,
      foundValue,
      lossValue,
      status: lineStatus,
    };
    // If updating an existing inventory line, include its ID
    if (product.inventoryLineId) {
      line.id = product.inventoryLineId;
    }
    return line;
  };

  // Optimized saveInventory with inventory & line IDs for updates
  const saveInventory = async (status) => {
    if (isLoading) return;
    setIsLoading(true);

    const inventoryLines = products.map(buildInventoryLine);
    const inventoryPayload = {
      // Include inventory id if available (for updates)
      ...(inventory && inventory.id ? { id: inventory.id } : {}),
      status,
      storeId: selectedStoreId,
      expectedValue: totalExpectedValue,
      foundValue: totalFoundValue,
      lossValue: totalExpectedValue - totalFoundValue,
      inventoryLines,
    };

    const response = await dispatch(
      createInventoryThunk(removeNullValues(inventoryPayload))
    );
    if (createInventoryThunk.fulfilled.match(response)) {
      setAlert({
        type: "success",
        message:
          inventory && inventory.id
            ? "Inventory updated successfully"
            : "Inventory created successfully",
      });
      if (showConfirmSave) setShowConfirmSave(false);
      navigate("/inventory/inventories");
    } else {
      setAlert({
        type: "error",
        message:
          inventory && inventory.id
            ? "Failed to update inventory"
            : "Failed to create inventory",
      });
    }
    setTimeout(() => setAlert(null), 3000);
    setIsLoading(false);
  };

  const handleSubmit = () => {
    if (products.some((product) => product.foundQty === null)) {
      setShowConfirmSave(true);
    } else {
      saveInventory(InventoryStatus.COMPLETED);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  console.log("products", products);

  const filteredProducts = products.filter((product) => {
    const productDetails = product.productDetails;

    const matchesSearch =
      (productDetails.name &&
        productDetails.name
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase())) ||
      (productDetails.reference &&
        productDetails.reference
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase())) ||
      (productDetails.barcodes.length > 0 &&
        productDetails.barcodes.some((barcode) =>
          barcode.barcode
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())
        ));

    const matchesCategory =
      filters.selectedCategory === "All" ||
      (filters.selectedCategory === "None" && !productDetails.category) ||
      (productDetails.category &&
        productDetails.category.id === filters.selectedCategory);

    return matchesSearch && matchesCategory;
  });

  if (loading || !productsInStore) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <Page>
      <PageContainer>
        <PageTitle>
          <BackButton onClick={handleBack}>
            <ArrowLeftIcon />
          </BackButton>
          Inventory Form
        </PageTitle>
        <PageContent>
          <FiltersContainer>
            <Input
              type="text"
              placeholder="Search product"
              value={filters.searchTerm}
              onChange={(e) =>
                setFilters({ ...filters, searchTerm: e.target.value })
              }
            />
            <Select
              value={filters.selectedCategory}
              onChange={(e) =>
                setFilters({ ...filters, selectedCategory: e.target.value })
              }
            >
              <option value="All">All</option>
              <option value="None">No Category</option>
              {categoriesList.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FiltersContainer>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Reference</th>
                  <th>Expected Qty</th>
                  <th>Found Qty</th>
                  <th>Expected Value</th>
                  <th>Found Value</th>
                  {products.some(
                    (product) => product.status === InventoryStatus.COMPLETED
                  ) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.productDetails.name}</td>
                    <td>{product.productDetails.reference}</td>
                    <td>{product.expectedQty}</td>
                    <td>
                      {product.status === InventoryStatus.COMPLETED &&
                      !product.editing ? (
                        product.foundQty
                      ) : (
                        <Input
                          type="number"
                          value={product.foundQty ?? ""}
                          onChange={(e) =>
                            handleFoundQtyChange(product.id, e.target.value)
                          }
                          min="0"
                          max={product.expectedQty}
                        />
                      )}
                    </td>
                    <td>${product.expectedValue.toFixed(2)}</td>
                    <td>${calculateFoundValue(product).toFixed(2)}</td>
                    {products.some(
                      (product) => product.status === InventoryStatus.COMPLETED
                    ) && (
                      <td>
                        {product.status === InventoryStatus.COMPLETED &&
                          !product.editing && (
                            <AutorenewIcon
                              onClick={() => toggleEditing(product.id)}
                              style={{ cursor: "pointer" }}
                            />
                          )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>

          <div>
            {/* Totals Section */}
            <TotalsContainer>
              <TotalItem>
                <Label>Total Expected Value:</Label>
                <Value>${totalExpectedValue.toFixed(2)}</Value>
              </TotalItem>
              <TotalItem>
                <Label>Total Found Value:</Label>
                <Value>${totalFoundValue.toFixed(2)}</Value>
              </TotalItem>
              <TotalItem>
                <Label>Loss Value:</Label>
                <Value>
                  ${(totalExpectedValue - totalFoundValue).toFixed(2)}
                </Value>
              </TotalItem>
            </TotalsContainer>

            {/* Submit Button */}
            <CenterButton>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <CircularProgress /> : "Submit Inventory"}
              </Button>
            </CenterButton>
          </div>
        </PageContent>

        {showConfirmSave && (
          <ConfirmSaveTab
            setShowConfirmSave={setShowConfirmSave}
            saveInventory={saveInventory}
            isLoading={isLoading}
          />
        )}
        <Fade in={alert}>
          <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
        </Fade>
      </PageContainer>
    </Page>
  );
};

export default InventoryForm;
