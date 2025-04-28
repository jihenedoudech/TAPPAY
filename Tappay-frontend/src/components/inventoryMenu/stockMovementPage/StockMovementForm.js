import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Page from "../../common/Page";
import { theme } from "../../../theme";
import {
  AlertNotif,
  BackButton,
  Button,
  PageTitle,
  Table,
  TableWrapper,
  Select,
  Input,
  ContentContainer,
} from "../../../utils/BaseStyledComponents";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { CircularProgress, Fade } from "@mui/material";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { fetchStoresThunk } from "../../Redux/storeSlice";
import { moveStockThunk, setProductsToMove } from "../../Redux/stockMovementSlice";
import { removeNullValues } from "../../../utils/utilsFunctions";

const Container = styled.div`
  padding: 20px;
  margin: auto;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  width: calc(100vw - 80px);
  overflow: auto;
`;

const FormSection = styled.div`
  display: flex;
  gap: 16px;
`;

const InputBox = styled.input`
  width: 90%;
  padding: 8px;
  font-size: 1em;
  border: 1px solid ${theme.colors.lightGrey};
  border-radius: 4px;
  transition: border-color 0.3s;
  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 3px ${theme.colors.primary};
  }
`;

const StockMovementForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const productsToMove = useSelector(
    (state) => state.stockMovement.productsToMove
  );

  console.log("productsToMove: ", productsToMove);

  const storesList = useSelector((state) => state.store.storesList);
  const [fromStoreId, setFromStoreId] = useState(
    localStorage.getItem("currentStoreId") || ""
  );
  const [toStoreId, setToStoreId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [products, setProducts] = useState(
    productsToMove?.map((product) => ({
      ...product,
      quantity: 1,
      notes: null,
    }))
  );
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchStoresThunk());
  }, [dispatch]);

  const handleInputChange = (index, field, value) => {
    const updatedProducts = products?.map((product, i) =>
      i === index ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);
    if (!fromStoreId) {
      setAlert({
        message: "From Store is required",
        type: "error",
      });
      setTimeout(() => setAlert(null), 1500);
      setIsLoading(false);
      return;
    }
    if (!toStoreId) {
      setAlert({
        message: "To Store is required",
        type: "error",
      });
      setTimeout(() => setAlert(null), 1500);
      setIsLoading(false);
      return;
    }
    if (!date) {
      setAlert({
        message: "Movement date is required",
        type: "error",
      });
      setTimeout(() => setAlert(null), 1500);
      setIsLoading(false);
      return;
    }
    if (products.length === 0) {
      setAlert({
        message: "No products selected for stock movement.",
        type: "error",
      });
      setTimeout(() => setAlert(null), 1500);
      setIsLoading(false);
      return;
    }
    const invalidProducts = products.filter(
      (product) => product.quantity > product.availableStock
    );
    if (invalidProducts.length > 0) {
      const productNames = invalidProducts
        .map((product) => product.name)
        .join(", ");
      setAlert({
        message: `Error: Not enough stock for ${productNames}.`,
        type: "error",
      });
      setTimeout(() => setAlert(null), 1500);
      setIsLoading(false);
      return;
    }
    const stockMovementData = removeNullValues({
      fromStoreId,
      toStoreId,
      movementDate: date,
      items: products.map((product) => ({
        productId: product.id,
        quantity: parseInt(product.quantity, 10),
        notes: product.notes,
      })),
    });
    console.log("stockMovementData: ", stockMovementData);
    const response = await dispatch(moveStockThunk(stockMovementData));
    if (response.type.includes("fulfilled")) {
      dispatch(setProductsToMove([]));
      navigate("/inventory/stock-movements");
      setAlert({
        message: "Stock moved successfully.",
        type: "success",
      });
    } else {
      setAlert({
        message: "Failed to move stock.",
        type: "error",
      });
    }
    setTimeout(() => setAlert(null), 1500);
    setIsLoading(false);
    return;
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Page>
      <Container>
        <PageTitle>
          <BackButton onClick={handleBack}>
            <ArrowLeftIcon />
          </BackButton>
          Move Stock
        </PageTitle>
        <ContentContainer>
          <FormSection>
            <Select
              name="fromStore"
              value={fromStoreId}
              onChange={(e) => setFromStoreId(e.target.value)}
            >
              <option value="" disabled>
                Select From Store
              </option>
              {storesList.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </Select>
            <Select
              name="toStore"
              value={toStoreId}
              onChange={(e) => setToStoreId(e.target.value)}
            >
              <option value="" disabled>
                Select To Store
              </option>
              {storesList.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormSection>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((product, index) => (
                  <tr key={index}>
                    <td>{product.productDetails.name}</td>
                    <td>
                      <InputBox
                        type="number"
                        value={product.quantity}
                        onChange={(e) =>
                          handleInputChange(index, "quantity", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <InputBox
                        value={product.notes}
                        onChange={(e) =>
                          handleInputChange(index, "notes", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : "Move Stock"}
          </Button>
          <Fade in={alert}>
            <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
          </Fade>
        </ContentContainer>
      </Container>
    </Page>
  );
};

export default StockMovementForm;
