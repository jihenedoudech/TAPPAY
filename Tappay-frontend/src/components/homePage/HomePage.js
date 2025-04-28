import React, { useEffect, useState } from "react";
import Categories from "./Categories";
import CartPanel from "./CartPanel/CartPanel";
import styled from "styled-components";
import Page from "../common/Page";
import ProductsCatalogue from "./ProductsCatalogue";
import OpenShiftPopup from "./OpenShiftPopup";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCategoriesThunk,
  fetchProductsInStoreThunk,
} from "../Redux/productSlice";
import { fetchCurrentUserShiftThunk } from "../Redux/shiftSlice";
import { fetchOrdersThunk } from "../Redux/orderSlice";

const Container = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
`;

const HomePage = () => {
  const dispatch = useDispatch();
  const { currentUserShift } = useSelector((state) => state.shifts);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filters, setFilters] = useState({
    newArrivals: false,
    onPromotion: false,
    bestSellers: false,
    inStock: false,
  });
  const [sortOrder, setSortOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchCurrentUserShiftThunk());
    dispatch(fetchProductsInStoreThunk(localStorage.getItem("currentStoreId")));
    dispatch(fetchCategoriesThunk());
    dispatch(fetchOrdersThunk());
  }, [dispatch]);

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <Page>
      <Container>
        <div>
          <Categories
            onSelectCategory={handleSelectCategory}
            filters={filters}
            setFilters={setFilters}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onSearch={handleSearch}
          />
          <ProductsCatalogue
            selectedCategory={selectedCategory}
            filters={filters}
            sortOrder={sortOrder}
            searchQuery={searchQuery}
          />
        </div>
        <CartPanel />
      </Container>
      {!currentUserShift && <OpenShiftPopup />}
    </Page>
  );
};

export default HomePage;
