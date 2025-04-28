import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { selectProduct } from "../Redux/productSlice";
import config from "../../config";

const Card = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  }
`;

const ImageContainer = styled.div`
  max-height: 150px;
  width: auto;
  margin-bottom: 15px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 8px;
  }
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const ProductName = styled.h4`
  margin: 0;
  color: #333;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const OriginalPrice = styled.span`
  text-decoration: line-through;
  color: #999;
  font-size: 0.9rem;
  margin-right: 8px;
`;

const DiscountedPrice = styled.span`
  color: #ff6b6b;
  font-weight: bold;
  font-size: 1.1rem;
  margin-right: 8px;
`;

const DiscountLabel = styled.span`
  font-size: 0.9rem;
  color: #28a745;
`;

const Stock = styled.p`
  color: ${({ stock }) => (stock > 0 ? "#28a745" : "#dc3545")};
  margin: 5px 0 0 0;
`;

const StoreName = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const OverallStock = styled.div`
  font-size: 0.9rem;
  color: #333;
  margin-top: 10px;
  font-weight: bold;
`;

const StoreDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  gap: 10px;
`;

const CompactPriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ProductCard = ({ product, selectedStore }) => {
  const dispatch = useDispatch();

  const handleSelect = () => {
    dispatch(selectProduct(product.id));
  };

  const calculateDiscountedPrice = (storeDetail) => {
    if (storeDetail.discountType === 1) {
      // Percentage discount
      return (
        storeDetail.sellingPrice -
        (storeDetail.sellingPrice * storeDetail.discountAmount) / 100
      );
    } else if (storeDetail.discountType === 2) {
      // Fixed amount discount
      return storeDetail.sellingPrice - storeDetail.discountAmount;
    }
    return storeDetail.sellingPrice;
  };

  const hasDiscount = (storeDetail) => {
    return (
      (storeDetail.discountType === 1 || storeDetail.discountType === 2) &&
      storeDetail.discountAmount > 0
    );
  };

  const calculateOverallStock = () => {
    if (product.storeDetails) {
      return product.storeDetails.reduce(
        (total, storeDetail) => total + storeDetail.availableStock,
        0
      );
    }
    return product.availableStock;
  };

  return (
    <Card onClick={handleSelect}>
      <ImageContainer>
        <img
          src={`${config.IMAGE_BASE_URL}/products/${product.productDetails.image}`}
          alt={product.productDetails.name}
          onError={(e) => {
            e.target.src = "/images/products/default.jpg";
          }}
        />
      </ImageContainer>
      <InfoContainer>
        <ProductName>{product.productDetails.name}</ProductName>
        {product.storeDetails ? (
          <StoreDetailsContainer>
            {product.storeDetails.map((storeDetail, index) => (
              <div key={index}>
                {/* Conditionally render store name */}
                {selectedStore === "All" && (
                  <StoreName>{storeDetail.storeName}</StoreName>
                )}
                <CompactPriceContainer>
                  <DiscountedPrice>
                    ${calculateDiscountedPrice(storeDetail)}
                  </DiscountedPrice>
                  {hasDiscount(storeDetail) && (
                    <PriceContainer>
                      <OriginalPrice>
                        ${storeDetail.sellingPrice}
                      </OriginalPrice>
                      <DiscountLabel>
                        {storeDetail.discountType === 1
                          ? ` (-${storeDetail.discountAmount}%)`
                          : ` (-$${storeDetail.discountAmount})`}
                      </DiscountLabel>
                    </PriceContainer>
                  )}
                </CompactPriceContainer>
                <Stock stock={storeDetail.availableStock}>
                  {storeDetail.availableStock > 0
                    ? `${storeDetail.availableStock} in stock`
                    : "Out of stock"}
                </Stock>
              </div>
            ))}
            {/* Conditionally render overall stock */}
            {selectedStore === "All" && (
              <OverallStock>
                Overall Stock: {calculateOverallStock()}
              </OverallStock>
            )}
          </StoreDetailsContainer>
        ) : (
          <CompactPriceContainer>
            <DiscountedPrice>
              ${calculateDiscountedPrice(product)}
            </DiscountedPrice>
            {hasDiscount(product) && (
              <PriceContainer>
                <OriginalPrice>
                  ${product.sellingPrice}
                </OriginalPrice>
                <DiscountLabel>
                  {product.discountType === 1
                    ? ` (-${product.discountAmount}%)`
                    : ` (-$${product.discountAmount})`}
                </DiscountLabel>
              </PriceContainer>
            )}
            <Stock stock={product.availableStock}>
              {product.availableStock > 0
                ? `${product.availableStock} in stock`
                : "Out of stock"}
            </Stock>
          </CompactPriceContainer>
        )}
      </InfoContainer>
    </Card>
  );
};

export default ProductCard;
