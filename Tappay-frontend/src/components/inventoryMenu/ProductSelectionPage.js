import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Checkbox from "@mui/material/Checkbox";
import { useDispatch, useSelector } from "react-redux";
import Page from "../common/Page";
import {
  AlertNotif,
  BackButton,
  Button,
  Input,
  PageContainer,
  PageTitle,
  Select,
} from "../../utils/BaseStyledComponents";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import EastOutlinedIcon from "@mui/icons-material/EastOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchCategoriesThunk,
  fetchProductsInStoreThunk,
  fetchProductsDetailsThunk,
} from "../Redux/productSlice";
import { setProductsToMove } from "../Redux/stockMovementSlice";
import { setExpenseProducts } from "../Redux/expenseSlice";
import { Fade } from "@mui/material";
import BarcodeReader from "react-barcode-reader";
import { UserRole } from "../../utils/enums";
import { fetchCurrentUserThunk } from "../Redux/userSlice";
import { handleError, handleScan } from "../../utils/utilsFunctions";
import config from "../../config";

const SearchBar = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  color: #333;
  border-bottom: 2px solid #ccc;
  padding-bottom: 5px;
`;

const ProductsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-bottom: 1px solid #eee;
`;

const ProductDetails = styled.div`
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  gap: 5px;
  align-items: center;
  text-align: center;
  padding: 10px;
`;

const ProductName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const ProductReference = styled.div`
  font-size: 12px;
`;

const ProductStock = styled.div`
  font-size: 13px;
  color: ${(props) => (props.lowStock ? "#d9534f" : "#5cb85c")};
  font-weight: bold;
`;

const CheckboxWrapper = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NextButton = styled(Button)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ProductSelectionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { title, nextRoute, key } = location.state || {};
  const { productsInStore, categoriesList } = useSelector(
    (state) => state.products
  );
  const user = useSelector((state) => state.user.user);
  const currentProducts = useSelector((state) => {
    if (key === "StockMovements") {
      return state.stockMovement.productsToMove;
    } else if (key === "Expenses") {
      return state.expenses.expenseProducts;
    }
  });
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(
    currentProducts || []
  );
  const [alert, setAlert] = useState(null);
  const [selectedStore, setSelectedStore] = useState(
    localStorage.getItem("currentStoreId")
  );

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
    dispatch(fetchCurrentUserThunk());
  }, [dispatch]);

  useEffect(() => {
    if (selectedStore) {
      dispatch(fetchProductsInStoreThunk(selectedStore));
    } else {
      dispatch(fetchProductsDetailsThunk());
    }
  }, [dispatch, selectedStore]);

  const handleCheckboxChange = (product) => {
    setSelectedProducts((prev) =>
      prev.some((item) => item.id === product.id)
        ? prev.filter((item) => item.id !== product.id)
        : [...prev, product]
    );
  };

  useEffect(() => {
    console.log("categoriesList: ", categoriesList);
    console.log("selectedCategory: ", selectedCategory);
  }, [selectedCategory]);

  const handleCategoryChange = (categoryId) => {
    const category = categoriesList.find((cat) => cat.id === categoryId);
    setSelectedCategory(category || null);
  };

  const filteredProducts = productsInStore.filter((product) => {
    const matchesSearch =
      product.productDetails.name
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      product.productDetails.reference?.includes(searchText);
    const matchesCategory = selectedCategory
      ? product.productDetails.category?.id === selectedCategory?.id
      : true;

    return matchesSearch && matchesCategory;
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleNext = () => {
    if (key === "StockMovements") {
      dispatch(setProductsToMove(selectedProducts));
    } else if (key === "Expenses") {
      dispatch(setExpenseProducts(selectedProducts));
    } else {
      console.error("Invalid action key");
    }
    navigate(nextRoute);
  };

  const isNextDisabled =
    key === "StockMovements" && selectedProducts.length === 0;

  return (
    <Page>
      <PageContainer>
        <BarcodeReader
          onScan={(barcode) =>
            handleScan(barcode, productsInStore, handleCheckboxChange, setAlert)
          }
          onError={() => handleError(setAlert)}
        />
        <PageTitle>
          <BackButton onClick={handleBack}>
            <ArrowLeftIcon />
          </BackButton>
          {title}
        </PageTitle>
        <SearchBar>
          <Input
            type="text"
            placeholder="Search Product"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            value={selectedCategory?.id || ""}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categoriesList.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          {user?.role === UserRole.ADMIN && (
            <Select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              {user.assignedStores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </Select>
          )}
        </SearchBar>
        {selectedProducts.length > 0 && (
          <Section>
            <SectionTitle>Selected Products</SectionTitle>
            <ProductsContainer>
              {selectedProducts.map((product) => (
                <Card key={product.id}>
                  <CheckboxWrapper>
                    <Checkbox
                      checked={true}
                      onChange={() => handleCheckboxChange(product)}
                      color="primary"
                    />
                  </CheckboxWrapper>
                  <ProductImage
                    src={`${config.IMAGE_BASE_URL}/products/${product.productDetails.image}`}
                    alt={product.productDetails.name}
                    onError={(e) => {
                      e.target.src = "/images/products/default.jpg";
                    }}
                  />
                  <ProductDetails>
                    <ProductName>{product.productDetails.name}</ProductName>
                    <ProductReference>
                      {product.productDetails.reference}
                    </ProductReference>
                  </ProductDetails>
                </Card>
              ))}
            </ProductsContainer>
          </Section>
        )}
        <Section>
          <SectionTitle>All Products</SectionTitle>
          <ProductsContainer>
            {filteredProducts.map((product) => (
              <Card key={product.id}>
                <CheckboxWrapper>
                  <Checkbox
                    checked={selectedProducts.some(
                      (item) => item.id === product.id
                    )}
                    onChange={() => handleCheckboxChange(product)}
                    color="primary"
                  />
                </CheckboxWrapper>
                <ProductImage
                  src={`${config.IMAGE_BASE_URL}/products/${product.productDetails.image}`}
                  alt={product.productDetails.name}
                  onError={(e) => {
                    e.target.src = "/images/products/default.jpg";
                  }}
                />
                <ProductDetails>
                  <ProductName>{product.productDetails.name}</ProductName>
                  <ProductReference>
                    {product.productDetails.reference}
                  </ProductReference>
                  <ProductStock lowStock={product.availableStock === 0}>
                    {product.availableStock === 0
                      ? "Out of Stock"
                      : `Stock: ${product.availableStock}`}
                  </ProductStock>
                </ProductDetails>
              </Card>
            ))}
          </ProductsContainer>
        </Section>
      </PageContainer>
      <NextButton onClick={handleNext} disabled={isNextDisabled}>
        Next
        <EastOutlinedIcon />
      </NextButton>
      <Fade in={alert}>
        <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
      </Fade>
    </Page>
  );
};

export default ProductSelectionPage;
