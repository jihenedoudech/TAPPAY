import React, { useEffect, useState } from "react";
import styled from "styled-components";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsInStoreThunk } from "../Redux/productSlice";
import { addToCart } from "../Redux/cartSlice";
import ProductDetails from "./ProductDetails";
import config from "../../config";
import BarcodeReader from "react-barcode-reader";
import { Fade } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Button, AlertNotif } from "../../utils/BaseStyledComponents";
import Loading from "../common/Loading";
import Error from "../common/Error";
import { DiscountType, ProductType } from "../../utils/enums";
import { handleError, handleScan } from "../../utils/utilsFunctions";

const NoProductsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin: auto;
`;

const CatalogueContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 15px;
  padding: 10px;
  max-height: calc(100vh - 155px);
  overflow-y: auto;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => (props.outOfStock ? "#f8f8f8" : "#fff")};
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  text-align: center;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  opacity: ${(props) => (props.outOfStock ? "0.5" : "1")};
  position: relative;

  &:hover {
    transform: ${(props) => (props.outOfStock ? "none" : "translateY(-5px)")};
    box-shadow: ${(props) =>
      props.outOfStock ? "none" : "0 6px 12px rgba(0, 0, 0, 0.15)"};
  }
  border: ${(props) => (props.discounted ? "2px solid #ff6b6b" : "none")};
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff6b6b;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  padding: 5px 8px;
  border-radius: 5px;
  z-index: 1;
`;

const ProductImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 10px;
`;

const ProductName = styled.h4`
  margin: 0;
  font-size: 16px;
  color: #333;
`;

const ProductReference = styled.p`
  font-size: 12px;
  color: #666;
  margin: 5px 0;
`;

const ProductPriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const OriginalPrice = styled.span`
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin-bottom: 4px;
`;

const DiscountedPrice = styled.span`
  font-size: 16px;
  color: #ff6b6b;
`;

const Stock = styled.p`
  font-size: 12px;
  color: ${(props) => (props.stock ? "#28a745" : "#dc3545")};
`;

const InfoIcon = styled(InfoOutlinedIcon)`
  color: #ff6b6b;
  cursor: pointer;
  position: absolute;
  bottom: 10px;
  right: 10px;
`;

const ProductsCatalogue = ({
  selectedCategory,
  filters,
  sortOrder,
  searchQuery,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productsInStore, loading, error } = useSelector(
    (state) => state.products
  );
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    dispatch(fetchProductsInStoreThunk(localStorage.getItem("currentStoreId")));
  }, [dispatch]);

  const handleInfoClick = (e, product) => {
    e.stopPropagation();
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const handleAddToCart = (product) => {
    if (
      product.availableStock > 0 ||
      product.parent ||
      product.productDetails.type === ProductType.TRANSFORMED
    ) {
      dispatch(addToCart(product));
    } else {
      setAlert({
        message: "Product out of stock!",
        type: "error",
      });
      setTimeout(() => setAlert(null), 1500);
    }
  };

  const calculateDiscountedPrice = (
    sellingPrice,
    discountType,
    discountAmount
  ) => {
    if (discountType === DiscountType.PERCENTAGE) {
      return sellingPrice * (1 - discountAmount / 100);
    } else if (discountType === DiscountType.FIXED) {
      return sellingPrice - discountAmount;
    }
    return parseFloat(sellingPrice);
  };

  const filteredProducts = productsInStore.filter(
    (product) =>
      product.productDetails.type !== ProductType.COMPONENT &&
      // If no category is selected, include all products.
      (!selectedCategory ||
        // If "none" is selected, include products with no category.
        (selectedCategory === "none" && !product.productDetails.category) ||
        // Otherwise, include products matching the selected category id.
        product.productDetails.category?.id === selectedCategory)
  );

  const applyFilters = (products) => {
    let filtered = products;

    if (filters.newArrivals) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      filtered = filtered.filter(
        (product) => new Date(product.arrivalDate) >= threeMonthsAgo
      );
    }

    if (filters.onPromotion) {
      filtered = filtered.filter((product) => product.discount !== null);
    }

    if (filters.bestSellers) {
      const topSellers = products
        .slice()
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 10);
      filtered = filtered.filter((product) => topSellers.includes(product));
    }

    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        if (sortOrder === "asc") {
          return a.sellingPrice - b.sellingPrice;
        } else if (sortOrder === "desc") {
          return b.sellingPrice - a.sellingPrice;
        }
        return 0;
      });
    }

    if (filters.inStock) {
      filtered = filtered.filter((product) => product.availableStock > 0);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.productDetails.name?.toLowerCase().includes(query) ||
          product.productDetails.reference?.includes(searchQuery) ||
          product.productDetails.brand?.toLowerCase().includes(query) ||
          (product.productDetails.barcodes && 
            product.productDetails.barcodes.some(b => b.barcode === searchQuery))
      );
    }

    return filtered;
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <>
      {productsInStore.length === 0 ? (
        <NoProductsContainer>
          <h2>No products available yet!</h2>
          <Button onClick={() => navigate("/products/add-new-product")}>
            Add a New Product
          </Button>
        </NoProductsContainer>
      ) : (
        <>
          <BarcodeReader
            onScan={(barcode) =>
              handleScan(barcode, productsInStore, handleAddToCart, setAlert)
            }
            // onError={() => handleError(setAlert)}
          />
          <CatalogueContainer>
            {applyFilters(filteredProducts)?.map((product) => (
              <Card
                key={product.id}
                outOfStock={
                  product.availableStock === 0 &&
                  !product.parent &&
                  product.productDetails.type !== ProductType.TRANSFORMED
                }
                discounted={product.discountType}
                onClick={() => handleAddToCart(product)}
              >
                {product.discountType !== DiscountType.NONE && (
                  <DiscountBadge>
                    {product.discountType === DiscountType.PERCENTAGE
                      ? `${product.discountAmount}%`
                      : `$${product.discountAmount}`}
                  </DiscountBadge>
                )}
                <ProductImage
                  src={`${config.IMAGE_BASE_URL}/products/${product.productDetails.image}`}
                  alt={product.productDetails.name}
                  onError={(e) => {
                    e.target.src = "/images/products/default.jpg";
                  }}
                />
                <ProductName>{product.productDetails.name}</ProductName>
                <ProductReference>
                  {product.productDetails.reference}
                </ProductReference>
                <ProductPriceContainer>
                  {product.discountType !== DiscountType.NONE && (
                    <OriginalPrice>
                      ${product.sellingPrice.toFixed(2)}
                    </OriginalPrice>
                  )}
                  <DiscountedPrice>
                    $
                    {calculateDiscountedPrice(
                      product.sellingPrice,
                      product.discountType,
                      product.discountAmount
                    ).toFixed(2)}
                  </DiscountedPrice>
                </ProductPriceContainer>
                <Stock stock={product.availableStock}>
                  {product.availableStock > 0
                    ? `In Stock: ${product.availableStock}`
                    : "Out of Stock"}
                </Stock>
                <InfoIcon onClick={(e) => handleInfoClick(e, product)} />
              </Card>
            ))}
          </CatalogueContainer>
          {selectedProduct && (
            <ProductDetails
              product={selectedProduct}
              onClose={closeProductDetails}
            />
          )}
          <Fade in={alert}>
            <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
          </Fade>
        </>
      )}
    </>
  );
};

export default ProductsCatalogue;
