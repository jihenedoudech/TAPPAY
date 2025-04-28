import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { TableWrapper, Table } from "../../utils/BaseStyledComponents";
import { useNavigate } from "react-router-dom";
import ActionMenu from "../common/ActionMenu";

const Stock = styled.div`
  color: ${({ stock }) => (stock > 0 ? "#28a745" : "#dc3545")};
  font-weight: bold;
`;

const StoreContainer = styled.div`
  border: 1px solid #ddd;
  padding: 5px;
  margin-bottom: 5px;
  border-radius: 4px;
  background-color: #f9f9f9;
`;

const StoreName = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
`;

const ProductsTable = ({ selectedStore, products }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    sellingPrice: "",
    stock: "",
    discount: "",
    category: "",
  });

  const handleSelectAll = (event) => {
    setSelectedProducts(
      event.target.checked ? products.map((product) => product.id) : []
    );
  };

  const handleSelectProducts = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const handleViewDetails = (product) => {
    console.log("product: ", product);
    navigate(`/products/product-details/${product.id}`);
  };

  const handleEditProduct = (product) => {
    navigate(`/products/edit-product/${product.id}`);
  };

  const handleDeleteProduct = (product) => {
    // dispatch(deleteProductThunk(product.id));
  };

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const filteredProducts = products.filter((product) => {
    return (
      product.productDetails.name
        .toLowerCase()
        .includes(filters.name.toLowerCase()) &&
      (filters.sellingPrice === "" ||
        product.storeDetails.some(
          (store) => store.sellingPrice === parseFloat(filters.sellingPrice)
        )) &&
      (filters.stock === "" ||
        product.storeDetails.some((store) =>
          store.availableStock.toString().includes(filters.stock)
        )) &&
      (filters.discount === "" ||
        product.storeDetails.some((store) =>
          store.discountAmount.toString().includes(filters.discount)
        )) &&
      (filters.category === "" ||
        product.productDetails.category?.name
          .toLowerCase()
          .includes(filters.category.toLowerCase()))
    );
  });

  const calculateOverallStock = (product) => {
    if (product.storeDetails) {
      return product.storeDetails.reduce(
        (total, storeDetail) => total + storeDetail.availableStock,
        0
      );
    }
    return product.availableStock;
  };

  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedProducts.length === products.length}
              />
            </th>
            <th>Product Name</th>
            <th>Refrence</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Discount</th>
            <th>Category</th>
            {selectedStore === "AllStores" && <th>Store</th>}
            {selectedStore === "AllStores" && <th>Overall Stock</th>}
            <th />
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr
              key={product.id}
              onDoubleClick={() => handleViewDetails(product.productDetails)}
            >
              <td>
                <input
                  type="checkbox"
                  onChange={() => handleSelectProducts(product.id)}
                  checked={selectedProducts.includes(product.id)}
                />
              </td>
              <td>{product.productDetails.name}</td>
              <td>{product.productDetails.reference}</td>
              <td>
                {selectedStore === "AllStores" ? (
                  product.storeDetails.map((storeDetail, index) => (
                    <StoreContainer key={index}>
                      <StoreName>{storeDetail.store.name}</StoreName>
                      <div>${storeDetail.sellingPrice}</div>
                    </StoreContainer>
                  ))
                ) : (
                  <div>${product.storeDetails[0]?.sellingPrice}</div>
                )}
              </td>
              <td>
                {selectedStore === "AllStores" ? (
                  product.storeDetails.map((storeDetail, index) => (
                    <StoreContainer key={index}>
                      <StoreName>{storeDetail.store.name}</StoreName>
                      <Stock stock={storeDetail.availableStock}>
                        {storeDetail.availableStock > 0
                          ? `${storeDetail.availableStock} in stock`
                          : "Out of stock"}
                      </Stock>
                    </StoreContainer>
                  ))
                ) : (
                  <Stock stock={product.storeDetails[0]?.availableStock || 0}>
                    {product.storeDetails[0]?.availableStock > 0
                      ? `${product.storeDetails[0].availableStock} in stock`
                      : "Out of stock"}
                  </Stock>
                )}
              </td>
              <td>
                {selectedStore === "All" ? (
                  product.storeDetails.map((storeDetail, index) => (
                    <StoreContainer key={index}>
                      <StoreName>{storeDetail.store.name}</StoreName>
                      <div>
                        {storeDetail.discountAmount > 0
                          ? `-${storeDetail.discountAmount}`
                          : "No Discount"}
                      </div>
                    </StoreContainer>
                  ))
                ) : (
                  <div>
                    {product.storeDetails[0]?.discountAmount > 0
                      ? `-${product.storeDetails[0].discountAmount}`
                      : "No Discount"}
                  </div>
                )}
              </td>
              <td>{product.productDetails.category?.name}</td>
              {selectedStore === "All" && (
                <td>
                  {product.storeDetails.map((storeDetail, index) => (
                    <StoreContainer key={index}>
                      <StoreName>{storeDetail.store.name}</StoreName>
                    </StoreContainer>
                  ))}
                </td>
              )}
              {selectedStore === "AllStores" && (
                <td>
                  <Stock stock={calculateOverallStock(product)}>
                    {calculateOverallStock(product)}
                  </Stock>
                </td>
              )}
              <td>
                {selectedStore !== "AllStores" && (
                  <ActionMenu
                    selectedItem={product.productDetails}
                    handleViewDetails={handleViewDetails}
                    handleEdit={handleEditProduct}
                    handleDelete={handleDeleteProduct}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};

export default ProductsTable;
