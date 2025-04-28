import React, { useEffect, useState } from "react";
import Popup from "../common/Popup";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsDetailsThunk } from "../Redux/productSlice";
import {
  CheckboxInput,
  Label,
  Input,
  Button,
  CenterButton,
} from "../../utils/BaseStyledComponents";
import styled from "styled-components";
import { ProductType } from "../../utils/enums";

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;

const ProductsContainer = styled.div`
  max-height: calc(100vh - 300px);
  overflow-y: auto;
`;

const SearchBarContainer = styled.div`
  margin-bottom: 16px;
`;

const AddComponentPopup = ({
  onClose,
  onSelectComponents,
  selectedComponentIds = [],
}) => {
  const dispatch = useDispatch();
  const { productsList } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    dispatch(fetchProductsDetailsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (productsList && selectedComponentIds.length > 0) {
      const preselected = productsList.filter((product) =>
        selectedComponentIds.includes(product.id)
      );
      setSelectedProducts(preselected);
    }
  }, [productsList, selectedComponentIds]);

  const handleCheckboxChange = (product) => {
    if (selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const filteredProducts = productsList.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      product.type !== ProductType.TRANSFORMED
  );

  const handleConfirmSelection = () => {
    if (onSelectComponents) {
      onSelectComponents(selectedProducts);
    }
    onClose();
  };

  return (
    <Popup title="Add Component" onClose={onClose}>
      <SearchBarContainer>
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBarContainer>
      <ProductsContainer>
        {filteredProducts.map((product) => (
          <CheckboxContainer key={product.id}>
            <CheckboxInput
              type="checkbox"
              checked={!!selectedProducts.find((p) => p.id === product.id)}
              onChange={() => handleCheckboxChange(product)}
            />
            <Label>{product.name}</Label>
          </CheckboxContainer>
        ))}
      </ProductsContainer>
      <CenterButton>
        <Button onClick={handleConfirmSelection}>Add Selected</Button>
      </CenterButton>
    </Popup>
  );
};

export default AddComponentPopup;
