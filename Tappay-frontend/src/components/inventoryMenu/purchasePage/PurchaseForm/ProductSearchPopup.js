import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsDetailsThunk } from "../../../Redux/productSlice";
import { Input } from "../../../../utils/BaseStyledComponents";
import { ProductType } from "../../../../utils/enums";
import Popup from "../../../common/Popup";

const ProductsList = styled.div`
  max-height: calc(100vh - 300px);
  overflow-y: auto;
`;

const ProductItem = styled.div`
  padding: 8px;
  cursor: pointer;
  &:hover {
    background-color: #eee;
  }
`;

const ProductSearchPopup = ({ onClose, onSelectProduct }) => {
  const dispatch = useDispatch();
  const { productsList } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchProductsDetailsThunk());
  }, [dispatch]);

  const filteredProducts = productsList.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      product.type !== ProductType.TRANSFORMED
  );

  return (
    <Popup title="Search Product" onClose={onClose}>
      <Input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ProductsList>
        {filteredProducts.map((product) => (
          <ProductItem key={product.id} onClick={() => onSelectProduct(product)}>
            {product.name}
          </ProductItem>
        ))}
      </ProductsList>
    </Popup>
  );
};

export default ProductSearchPopup;
