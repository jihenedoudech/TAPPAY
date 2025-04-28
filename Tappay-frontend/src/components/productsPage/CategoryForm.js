import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchCategoriesThunk,
  addCategoryThunk,
  updateCategoryThunk,
  fetchProductsDetailsThunk,
} from "../Redux/productSlice";
import {
  PageContainer,
  PageHeader,
  Button,
  Label,
  Input,
  AlertNotif,
  PageTitle,
  BackButton,
  CheckboxInput,
} from "../../utils/BaseStyledComponents";
import Page from "../common/Page";
import Checkbox from "@mui/material/Checkbox";
import { CircularProgress, Fade } from "@mui/material";
import {
  handleError,
  handleScan,
  removeNullValues,
} from "../../utils/utilsFunctions";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import BarcodeReader from "react-barcode-reader";

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 20px;
  min-height: calc(100vh - 250px);
  overflow-y: auto;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SearchBar = styled.div`
  display: flex;
  width: 90%;
  gap: 15px;
  align-items: center;
  & > input {
    flex: 1;
  }
`;

const ProductsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  /* justify-content: center; */
  padding: 20px;
  /* margin: 0 auto; */
`;

const ProductCard = styled.div`
  width: 150px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 120px;
  background: url(${(props) => props.src}) center/cover no-repeat;
  border-bottom: 1px solid #eee;
`;

const ProductName = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 10px 0 5px;
  text-transform: capitalize;
`;

const ProductReference = styled.p`
  font-size: 12px;
  text-align: center;
  margin-bottom: 10px;
  color: #333;
`;

const ProductCategory = styled.p`
  font-size: 12px;
  text-align: center;
  margin-bottom: 10px;
  color: ${(props) => (props.hasCategory ? "#28a745" : "#dc3545")};
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

const Message = styled.div`
  font-size: 16px;
  color: #666;
  text-align: center;
  margin: 20px 0;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CategoryForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const products = useSelector((state) => state.products.productsList);
  const categoriesList = useSelector((state) => state.products.categoriesList);

  // New state for search text
  const [searchText, setSearchText] = useState("");
  const [showOnlyUncategorized, setShowOnlyUncategorized] = useState(false);

  const [category, setCategory] = useState({
    name: "",
    description: "",
    productsIds: [],
  });
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    dispatch(fetchProductsDetailsThunk());
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);
  
  useEffect(() => {
    if (id && categoriesList.length > 0 && !isEditMode) {
      const existingCategory = categoriesList.find(
        (cat) => cat.id === id
      );
      if (existingCategory) {
        setCategory({
          name: existingCategory.name,
          description: existingCategory.description,
          productsIds: existingCategory.products.map((product) => product.id),
        });
        setIsEditMode(true);
      }
    }
  }, [id, categoriesList, isEditMode]);  

  const handleSelectProduct = (product) => {
    setCategory((prev) => ({
      ...prev,
      productsIds: prev.productsIds.includes(product.id)
        ? prev.productsIds.filter((id) => id !== product.id)
        : [...prev.productsIds, product.id],
    }));
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const existingCategory = categoriesList.find(
      (cat) =>
        cat.name.toLowerCase() === category.name.toLowerCase() && cat.id !== id
    );
    if (existingCategory) {
      setAlert({
        message: "Category name already exists.",
        type: "error",
      });
      setIsLoading(false);
      return;
    }
    const categoryWithoutNulls = removeNullValues(category);
    let response;
    if (isEditMode) {
      response = await dispatch(
        updateCategoryThunk({ id: id, ...categoryWithoutNulls })
      );
    } else {
      response = await dispatch(addCategoryThunk(categoryWithoutNulls));
    }
    if (response.type.includes("fulfilled")) {
      setAlert({
        message: isEditMode
          ? "Category updated successfully."
          : "Category created successfully.",
        type: "success",
      });
      navigate("/products/categories");
    } else {
      setAlert({
        message: isEditMode
          ? "Failed to update category."
          : "Failed to create category.",
        type: "error",
      });
    }
    setIsLoading(false);
  };

  // Compute selected and unselected products
  const selectedProducts = products.filter((product) =>
    category.productsIds.includes(product.id)
  );
  const unselectedProducts = products.filter(
    (product) => !category.productsIds.includes(product.id)
  );

  // Filter available products based on search text (name or reference) and category filter
  const filteredUnselectedProducts = unselectedProducts.filter((product) => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchLower) ||
      (product.reference &&
        product.reference.toLowerCase().includes(searchLower));
    const matchesCategoryFilter = showOnlyUncategorized
      ? !product.category
      : true;
    return matchesSearch && matchesCategoryFilter;
  });

  return (
    <Page>
      <PageContainer>
        <BarcodeReader
          onScan={(barcode) =>
            handleScan(barcode, products, handleSelectProduct, setAlert)
          }
          onError={() => handleError(setAlert)}
        />
        <PageHeader>
          <PageTitle>
            <BackButton onClick={() => navigate(-1)}>
              <ArrowLeftIcon />
            </BackButton>
            {isEditMode ? "Edit Category" : "Add New Category"}
          </PageTitle>
        </PageHeader>
        <FormContainer>
          <FormField>
            <Label>Category Name</Label>
            <Input
              type="text"
              value={category.name}
              onChange={(e) =>
                setCategory({ ...category, name: e.target.value })
              }
              required
            />
          </FormField>
          <FormField>
            <Label>Category Description</Label>
            <Input
              type="text"
              value={category.description}
              onChange={(e) =>
                setCategory({ ...category, description: e.target.value })
              }
            />
          </FormField>
          <FormField>
            <Label>Selected Products</Label>
            <ProductsContainer>
              {selectedProducts.length > 0 ? (
                selectedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                  >
                    <CheckboxWrapper>
                      <Checkbox
                        checked={category.productsIds.includes(product.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectProduct(product);
                        }}
                        color="primary"
                      />
                    </CheckboxWrapper>
                    <ProductImage
                      src={product.image || "/images/products/default.jpg"}
                    />
                    <ProductName>{product.name}</ProductName>
                    <ProductCategory hasCategory={product.category}>
                      {product.category ? product.category.name : "No Category"}
                    </ProductCategory>
                  </ProductCard>
                ))
              ) : (
                <Message>No selected products</Message>
              )}
            </ProductsContainer>
          </FormField>
          {/* New search input for available products */}
          <SearchBar>
            <Label>Search Products</Label>
            <Input
              type="text"
              placeholder="Search by name or ref"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <FilterContainer>
              <CheckboxInput
                type="checkbox"
                checked={showOnlyUncategorized}
                onChange={(e) => setShowOnlyUncategorized(e.target.checked)}
                color="primary"
              />
              <Label>Show only uncategorized products</Label>
            </FilterContainer>
          </SearchBar>
          <FormField>
            <Label>Available Products</Label>
            <ProductsContainer>
              {filteredUnselectedProducts.length > 0 ? (
                filteredUnselectedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                  >
                    <CheckboxWrapper>
                      <Checkbox
                        checked={category.productsIds.includes(product.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectProduct(product);
                        }}
                        color="primary"
                      />
                    </CheckboxWrapper>
                    <ProductImage
                      src={product.image || "/images/products/default.jpg"}
                    />
                    <ProductName>{product.name}</ProductName>
                    <ProductReference>{product.reference}</ProductReference>
                    <ProductCategory hasCategory={product.category}>
                      {product.category ? product.category.name : "No Category"}
                    </ProductCategory>
                  </ProductCard>
                ))
              ) : (
                <Message>No available products</Message>
              )}
            </ProductsContainer>
          </FormField>
        </FormContainer>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : "Submit"}
        </Button>
        <Fade in={alert}>
          <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
        </Fade>
      </PageContainer>
    </Page>
  );
};

export default CategoryForm;
