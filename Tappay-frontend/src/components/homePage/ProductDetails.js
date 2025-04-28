import React from "react";
import styled from "styled-components";
import config from "../../config";
import { DiscountType } from "../../utils/enums";

// Styled components for the modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  display: grid;
  grid-template-rows: auto auto auto;
  background-color: #fff;
  border-radius: 12px;
  padding: 10px; // Reduced padding
  width: 600px;
  max-width: 95%;
  height: 90%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  position: relative;
  text-align: left;
  animation: slide-down 0.3s ease forwards;
  overflow: hidden; // Prevent overflow if content exceeds

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Details = styled.div`
  max-height: 100%;
  overflow-y: auto;
  padding: 5px;
  padding-right: 15px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #ff6b6b;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const Header = styled.h3`
  margin: 0; // Adjusted margin
  font-size: 24px;
  color: #333;
  border-bottom: 3px solid #ff6b6b;
  padding: 10px 0; // Reduced padding
  text-align: center;
`;

const ProductImage = styled.img`
  width: 100%;
  max-height: 120px; // Reduced max height
  object-fit: contain;
  margin: 10px 0; // Adjusted margins
  border-radius: 8px;
  /* background-color: #f8f8f8; */
`;

const SectionTitle = styled.h4`
  font-size: 18px;
  color: #555;
  margin-top: 20px;
  margin-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 5px;
`;

const ProductDetail = styled.div`
  margin-bottom: 12px;
  font-size: 15px;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > span:first-child {
    font-weight: bold;
    color: #555;
  }

  & > span:last-child {
    color: #777;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #f0f0f0;
  margin: 15px 0;
`;

const Badge = styled.span`
  background-color: #ff6b6b;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  margin-left: 10px;
`;

// ProductDetails component definition
const ProductDetails = ({ product, onClose }) => {
  if (!product) return null;

  console.log("product: ", product)

  return (
    <ModalOverlay>
      <ModalContainer>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Header>{product.productDetails.name} Details</Header>
        <ProductImage
          src={`${config.IMAGE_BASE_URL}/products/${product.productDetails.image}`}
          alt={product.productDetails.name}
          onError={(e) => {
            e.target.src = "/images/products/default.jpg";
          }}
        />
        <Details>
          <SectionTitle>Basic Information</SectionTitle>
          <ProductDetail>
            <span>Name:</span> <span>{product.productDetails.name || "_"}</span>
          </ProductDetail>
          {/* <ProductDetail>
            <span>SKU:</span> <span>{product.sku || "_"}</span>
          </ProductDetail> */}
          <ProductDetail>
            <span>Category:</span> <span>{product.productDetails.category?.name || "_"}</span>
          </ProductDetail>
          <ProductDetail>
            <span>Brand:</span> <span>{product.productDetails.brand || "_"}</span>
          </ProductDetail>

          <Divider />

          <SectionTitle>Pricing and Stock</SectionTitle>
          <ProductDetail>
            <span>Price:</span>{" "}
            <span>
              {product.sellingPrice || "_"}{" "}
              {product.discount && <Badge>{product.discount} OFF</Badge>}
            </span>
          </ProductDetail>
          {product.discountType !== DiscountType.NONE && (
            <ProductDetail>
              <span>Discount:</span>{" "}
              <span>{product.discountAmount || "_"}</span>
            </ProductDetail>
          )}
          {/* <ProductDetail>
            <span>Margin:</span> <span>{product.margin || "_"}</span>
          </ProductDetail> */}
          {/* <ProductDetail>
            <span>Tax:</span> <span>{product.tax || "_"}%</span>
          </ProductDetail> */}
          <ProductDetail>
            <span>Stock:</span>
            <span
              style={{
                color: product.availableStock > 0 ? "#28a745" : "#dc3545",
              }}
            >
              {product.availableStock > 0
                ? `${product.availableStock} units`
                : "Out of Stock"}
            </span>
          </ProductDetail>

          <Divider />

          <SectionTitle>Additional Information</SectionTitle>
          <ProductDetail>
            <span>Unit of Measure:</span> <span>{product.productDetails.unitOfMeasure || "_"}</span>
          </ProductDetail>
          <ProductDetail>
            <span>Arrival Date:</span>{" "}
            <span>{product.productDetails.arrivalDate || "_"}</span>
          </ProductDetail>
          <ProductDetail>
            <span>Expiration Date:</span>{" "}
            <span>{product.expirationDate || "_"}</span>
          </ProductDetail>

          <Divider />

          <SectionTitle>Description</SectionTitle>
          <ProductDetail>
            <span>{product.description || "_"}</span>
          </ProductDetail>
        </Details>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ProductDetails;
