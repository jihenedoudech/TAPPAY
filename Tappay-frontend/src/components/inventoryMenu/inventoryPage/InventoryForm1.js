import React, { useEffect, useState } from "react";
import {
  PageContainer,
  CenterButton,
  Button,
  Input,
  PageTitle,
  TableWrapper,
  Table,
  BackButton,
  AlertNotif,
} from "../../../utils/BaseStyledComponents";
import Page from "../../common/Page";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsInStoreThunk } from "../../Redux/productSlice";
import Loading from "../../common/Loading";
import Error from "../../common/Error";
import {
  createInventoryThunk,
  fetchInventoriesThunk,
} from "../../Redux/inventorySlice";
import ConfirmSaveTab from "./ConfirmSaveTab";
import { InventoryStatus } from "../../../utils/enums";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { useNavigate, useLocation } from "react-router-dom";
import { CircularProgress, Fade } from "@mui/material";
import { removeNullValues } from "../../../utils/utilsFunctions";

const PageContent = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const TotalsContainer = styled.div`
  display: flex;

  justify-content: space-between;
  /* margin-top: 20px; */
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
  const location = useLocation();
  const {
    productsInStore,
    loading: productsLoading,
    error: productsError,
  } = useSelector((state) => state.products);
  const {
    inventories,
    loading: inventoriesLoading,
    error: inventoriesError,
  } = useSelector((state) => state.inventory);
  const selectedStoreId = useSelector(
    (state) => state.inventory.selectedStoreId
  );
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [isContinueWithLastState, setIsContinueWithLastState] = useState(false);

  // Determine if we are continuing with the last inventory state
  useEffect(() => {
    if (location.state?.continueWithLastState) {
      setIsContinueWithLastState(true);
      dispatch(fetchInventoriesThunk());
    }
  }, [location, dispatch]);

  // Fetch products in store when selectedStoreId changes
  useEffect(() => {
    dispatch(fetchProductsInStoreThunk(selectedStoreId));
  }, [dispatch, selectedStoreId]);

  console.log("productsInStore: ", productsInStore);
  console.log("products: ", products);

  // Initialize products based on the selected scenario
  useEffect(() => {
    if (isContinueWithLastState) {
      // Continue with last inventory state
      const lastInventory = inventories[0]; // Assuming the most recent inventory is the first in the list
      if (lastInventory) {
        const completedLines = lastInventory.inventoryLines.filter(
          (line) => line.status === InventoryStatus.COMPLETED
        );
        console.log("completedLines: ", completedLines);
        const productsFromCompletedLines = completedLines.map((line) => ({
          id: line.id,
          name: line.productStore.productDetails.name,
          ref: line.productStore.productDetails.reference,
          expectedQty: line.expectedQty,
          expectedValue: line.expectedValue,
          foundQty: line.foundQty,
          stockBatches: line.productStore.stockBatches,
        }));
        setProducts(productsFromCompletedLines);
      }
    } else {
      // New inventory or continue with current stock state
      if (productsInStore.length > 0) {
        const initializedProducts = productsInStore.map((product) => {
          const expectedQty = product.availableStock;
          const expectedValue = product.stockBatches.reduce(
            (total, batch) => total + batch.currentStock * batch.costInclTax,
            0
          );
          return {
            id: product.id,
            name: product.productDetails.name,
            ref: product.productDetails.reference,
            expectedQty,
            expectedValue,
            foundQty: null,
            stockBatches: product.stockBatches,
          };
        });
        setProducts(initializedProducts);
      }
    }
  }, [productsInStore, inventories, isContinueWithLastState]);

  const handleFoundQtyChange = (id, value) => {
    const updatedProducts = products.map((product) =>
      product.id === id ? { ...product, foundQty: value } : product
    );
    setProducts(updatedProducts);
  };

  const calculateFoundValue = (product) => {
    if (!product.foundQty || product.foundQty <= 0) return 0;
    let remainingQty = product.foundQty;
    let foundValue = 0;
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

  const totalExpectedValue = products.reduce(
    (total, product) => total + product.expectedValue,
    0
  );

  const totalFoundValue = products.reduce(
    (total, product) => total + calculateFoundValue(product),
    0
  );

  const saveInventory = async (status) => {
    if (isLoading) return;
    setIsLoading(true);
    const inventoryLines = products.map((product) => {
      const foundValue = calculateFoundValue(product);
      const difference = product.expectedQty - (product.foundQty || 0);
      const lossValue = product.expectedValue - foundValue;
      return {
        productStoreId: product.id,
        expectedQty: product.expectedQty,
        foundQty: product.foundQty,
        difference,
        expectedValue: product.expectedValue,
        foundValue,
        lossValue,
        status:
          product.foundQty === null
            ? InventoryStatus.DRAFT
            : InventoryStatus.COMPLETED,
      };
    });
    const inventory = {
      status,
      storeId: selectedStoreId,
      expectedValue: totalExpectedValue,
      foundValue: totalFoundValue,
      lossValue: totalExpectedValue - totalFoundValue,
      inventoryLines,
    };
    const response = await dispatch(
      createInventoryThunk(removeNullValues(inventory))
    );
    if (createInventoryThunk.fulfilled.match(response)) {
      setAlert({
        type: "success",
        message: "Inventory created successfully",
      });
      if (showConfirmSave) {
        setShowConfirmSave(false);
      }
    } else {
      setAlert({
        type: "error",
        message: "Failed to create inventory",
      });
    }
    setTimeout(() => {
      setAlert(null);
    }, 3000);
    setIsLoading(false);
  };

  const handleSubmit = () => {
    if (products.some((product) => !product.foundQty)) {
      console.log("Some products found quantity is not set");
      setShowConfirmSave(true);
    } else {
      saveInventory(InventoryStatus.COMPLETED);
    }
  };

  if (productsLoading || inventoriesLoading) {
    return <Loading />;
  }

  if (productsError || inventoriesError) {
    return <Error message={productsError || inventoriesError} />;
  }

  const handleBack = () => {
    navigate(-1);
  };

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
          {/* Product Table */}
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
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.ref}</td>
                    <td>{product.expectedQty}</td>
                    <td>
                      {isContinueWithLastState ? (
                        product.foundQty
                      ) : (
                        <Input
                          type="number"
                          value={product.foundQty || ""}
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
