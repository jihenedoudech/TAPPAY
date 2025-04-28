import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSelectedProduct,
  fetchProductsAcrossStoresThunk,
  fetchProductsInStoreThunk,
} from "../Redux/productSlice";
import ProductCard from "./ProductCard";
import ProductDetails from "./ProductDetails";
import { useNavigate } from "react-router-dom";
import GridViewIcon from "@mui/icons-material/GridView";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import ProductsTable from "./ProductsTable";
import Page from "../common/Page";
import {
  PageContainer,
  PageHeader,
  Button,
  Select,
  Input,
} from "../../utils/BaseStyledComponents";
import { fetchStoresThunk } from "../Redux/storeSlice";
import { fetchCurrentUserThunk } from "../Redux/userSlice";
import { UserRole } from "../../utils/enums";

const SubHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
`;

const FiltersContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: ${({ isActive }) => (isActive ? "#ff6b6b" : "#333")};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  transition: color 0.3s ease;
`;

const ProductsCardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  /* grid-template-columns: repeat(auto-fill, minmax(140px, 220px)); */
  gap: 20px;
  margin-top: 20px;
  padding: 10px;
  max-height: calc(100vh - 155px);
  overflow-y: auto;
  & > * {
    width: ${({ isAll }) => (isAll ? "200px" : "140px")};
  }
`;

const ProductsPage = () => {
  const dispatch = useDispatch();
  const stores = useSelector((state) => state.store.storesList);
  const { user, currentUserRole } = useSelector((state) => state.user);
  const [selectedStore, setSelectedStore] = useState(
    localStorage.getItem("currentStoreId") || ""
  );
  const productsAcrossStores = useSelector(
    (state) => state.products.productsAcrossStores
  );
  const selectedProduct = useSelector(
    (state) => state.products.selectedProduct
  );
  const navigate = useNavigate();
  const [viewType, setViewType] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchStoresThunk());
    dispatch(clearSelectedProduct());
    dispatch(fetchCurrentUserThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProductsAcrossStoresThunk());
  }, [dispatch]);

  // Filter products for the selected store
  const filteredProducts = productsAcrossStores
    .map((product) => {
      if (selectedStore === "NotInStores") {
        return product.storeDetails.length === 0 ? product : null;
      } else if (selectedStore === "AllStores") {
        return product.storeDetails.length > 0 ? product : null;
      } else {
        const storeDetails = product.storeDetails.filter(
          (store) => store.store.id === selectedStore
        );
        return storeDetails.length > 0
          ? {
              ...product,
              storeDetails,
            }
          : null;
      }
    })
    .filter((product) => product !== null) // Remove null entries
    .filter(
      (product) =>
        product.productDetails.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.productDetails.reference
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.productDetails?.barcodes?.some((barcode) =>
          barcode.barcode.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

  const handleAddProduct = () => {
    navigate("/products/add-new-product");
  };

  const toggleView = () => {
    setViewType((prevType) => (prevType === "grid" ? "list" : "grid"));
  };

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Products</h2>
          <Button onClick={handleAddProduct}>
            <AddIcon />
            Add New Product
          </Button>
        </PageHeader>
        <SubHeader>
          <FiltersContainer>
            <Input
              type="text"
              placeholder="Search product"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {currentUserRole === UserRole.ADMIN && (
              <Select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
              >
                <option value="AllStores">All Stores</option>
                <option value="NotInStores">Not In Stores</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </Select>
            )}
          </FiltersContainer>
          <ToggleContainer>
            <ToggleButton onClick={toggleView} isActive={viewType === "grid"}>
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton onClick={toggleView} isActive={viewType === "list"}>
              <MenuIcon />
            </ToggleButton>
          </ToggleContainer>
        </SubHeader>

        {viewType === "grid" ? (
          <ProductsCardContainer isAll={selectedStore === "AllStores"}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                selectedStore={selectedStore}
              />
            ))}
          </ProductsCardContainer>
        ) : (
          <ProductsTable
            selectedStore={selectedStore}
            products={filteredProducts}
          />
        )}

        {selectedProduct && <ProductDetails product={selectedProduct} />}
      </PageContainer>
    </Page>
  );
};

export default ProductsPage;
