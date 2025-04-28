import React, { useEffect, useState } from "react";
import styled from "styled-components";
import config from "../../config";
import { useNavigate, useParams } from "react-router-dom";
import Page from "../common/Page";
import {
  AlertNotif,
  PageContainer,
  PageHeader,
  PageTitle,
} from "../../utils/BaseStyledComponents";
import { DiscountType, Origin } from "../../utils/enums";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import {
  fetchProductsAcrossStoresThunk,
  selectProductDetailsById,
} from "../Redux/productSlice";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../common/Loading";
import { theme } from "../../theme";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { findPurchaseRecordOfItemThunk } from "../Redux/purchaseSlice";
import { Fade } from "@mui/material";

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: ${theme.colors.primary};

  &:hover {
    color: ${theme.colors.primaryDark};
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ProductImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 10px;
  background-color: #fff;
`;

const Section = styled.div`
  margin: 20px 0;
  padding: 10px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #555;
  margin: 0;
  margin-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 5px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr; /* Left column (text) 2fr, Right column (image) 1fr */
  gap: 20px;
  margin-top: 10px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Stack content and image on smaller screens */
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns for labels and values */
  gap: 15px;
  margin-top: 10px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Stack labels and values on smaller screens */
  }
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  color: #333;

  span:first-child {
    font-weight: bold;
    color: #555;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;

  th,
  td {
    text-align: left;
    padding: 12px;
    border: 1px solid #ddd;
  }

  th {
    background-color: #ff6b6b; /* Header color */
    color: white;
    font-weight: bold;
  }

  td {
    background-color: #fff;
  }

  tr:hover {
    background-color: #f9f9f9; /* Hover effect for rows */
  }
`;

const Badge = styled.span`
  background-color: #ff6b6b;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  margin-left: 10px;
`;

const StoreDetailsContainer = styled.div`
  margin-top: 20px;
`;

const StoreDetailItem = styled.div`
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const StoreName = styled.h4`
  font-size: 20px;
  color: #333;
  margin: 5px 0 15px 0;
`;

const StockBatchesContainer = styled.div`
  margin-top: 15px;
`;

const ProductDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [alert, setAlert] = useState(null);

  const product = useSelector((state) => selectProductDetailsById(state, id));

  useEffect(() => {
    if (!product && id) {
      dispatch(fetchProductsAcrossStoresThunk());
      console.log("product details useEffect");
    }
  }, [dispatch]);

  if (!product) {
    return <Loading />;
  }

  const formatDiscount = (discountType, discountAmount) => {
    if (discountType === DiscountType.PERCENTAGE) {
      return `${discountAmount}% OFF`;
    } else if (discountType === DiscountType.FIXED) {
      return `$${discountAmount} OFF`;
    }
    return null;
  };

  const handleEditItemOrigin = async (batch) => {
    if (batch.origin === Origin.PURCHASE) {
      const response = await dispatch(
        findPurchaseRecordOfItemThunk(batch.originId)
      );
      console.log("response: ", response);
      if (findPurchaseRecordOfItemThunk.fulfilled.match(response)) {
        navigate(
          `/inventory/purchases-invoices/purchase-edit/${response.payload.id}`,
          {
            state: { purchaseItemId: batch.originId },
          }
        );
      } else {
        setAlert({
          message: "Failed to find purchase record of item",
          type: "error",
        });
      }
    }
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  console.log("product", product);

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <PageTitle>
            <ArrowLeftIcon onClick={() => navigate(-1)} />
            {product.productDetails.name || "Product"} Details
          </PageTitle>
        </PageHeader>

        {/* Content Grid: Left (text) and Right (image) */}
        <ContentGrid>
          {/* Left Side (Details) */}
          <div>
            {/* Basic Information */}
            <Section>
              <SectionTitle>Basic Information</SectionTitle>
              <DetailGrid>
                <DetailItem>
                  <span>Name:</span>{" "}
                  <span>{product.productDetails.name || "N/A"}</span>
                </DetailItem>
                <DetailItem>
                  <span>Category:</span>{" "}
                  <span>{product.productDetails.category?.name || "N/A"}</span>
                </DetailItem>
                <DetailItem>
                  <span>Brand:</span>{" "}
                  <span>{product.productDetails.brand || "N/A"}</span>
                </DetailItem>
                <DetailItem>
                  <span>Reference:</span>{" "}
                  <span>{product.productDetails.reference || "N/A"}</span>
                </DetailItem>
                <DetailItem>
                  <span>Unit of Measure:</span>{" "}
                  <span>{product.productDetails.unitOfMeasure || "N/A"}</span>
                </DetailItem>
                {product.productDetails.parentId && (
                  <DetailItem>
                    <span>Parent Product:</span>{" "}
                    <span>{product.productDetails.parent.name || "N/A"}</span>
                  </DetailItem>
                )}
                <DetailItem>
                  <span>Returnable:</span>{" "}
                  <span>
                    {product.productDetails.returnable ? "Yes" : "No"}
                  </span>
                </DetailItem>
                <DetailItem>
                  <span>Type:</span>{" "}
                  <span>{product.productDetails.type || "N/A"}</span>
                </DetailItem>
              </DetailGrid>
            </Section>

            {product.productDetails.components &&
              product.productDetails.components.length > 0 && (
                <Section>
                  <SectionTitle>Components</SectionTitle>
                  <Table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.productDetails.components.map((component) => (
                        <tr key={component.id}>
                          <td>{component.componentProduct.name || "N/A"}</td>
                          <td>{component.qty || "N/A"}</td>
                          <td>{component.type || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Section>
              )}

            {/* Barcodes Table */}
            <Section>
              <SectionTitle>Barcodes</SectionTitle>
              {product.productDetails.barcodes?.length > 0 ? (
                <Table>
                  <thead>
                    <tr>
                      <th>Barcode</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.productDetails.barcodes.map((barcode) => (
                      <tr key={barcode.id}>
                        <td>{barcode.barcode}</td>
                        <td>{barcode.description || "No description"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No barcodes available.</p>
              )}
            </Section>

            {/* Description */}
            {product.productDetails.description && (
              <Section>
                <SectionTitle>Description</SectionTitle>
                <p>{product.productDetails.description}</p>
              </Section>
            )}
          </div>

          {/* Right Side (Image) */}
          <ImageContainer>
            <ProductImage
              src={
                product.productDetails.image
                  ? `${config.IMAGE_BASE_URL}/products/${product.productDetails.image}`
                  : "/images/products/default.jpg"
              }
              alt={product.productDetails.name}
              onError={(e) => {
                e.target.src = "/images/products/default.jpg";
              }}
            />
          </ImageContainer>
        </ContentGrid>

        {/* Store Details Section */}
        <Section>
          <SectionTitle>Store Details</SectionTitle>
          <StoreDetailsContainer>
            {product.storeDetails.map((store) => (
              <StoreDetailItem key={store.storeId}>
                <StoreName>{store.store.name}</StoreName>
                <DetailGrid>
                  <DetailItem>
                    <span>Selling Price:</span>{" "}
                    <span>${store.sellingPrice.toFixed(2)}</span>
                  </DetailItem>
                  <DetailItem>
                    <span>Available Stock:</span>{" "}
                    <span
                      style={{
                        color: store.availableStock > 0 ? "#28a745" : "#dc3545",
                      }}
                    >
                      {store.availableStock > 0
                        ? `${store.availableStock} units`
                        : "Out of Stock"}
                    </span>
                  </DetailItem>
                  <DetailItem>
                    <span>Discount:</span>{" "}
                    <span>
                      {store.discountType === DiscountType.NONE &&
                        "No Discount"}
                      {store.discountType === DiscountType.PERCENTAGE &&
                        `${store.discountAmount}%`}
                      {store.discountType === DiscountType.FIXED &&
                        `$${store.discountAmount}`}
                    </span>
                  </DetailItem>
                  <DetailItem>
                    <span>Sales Count:</span> <span>{store.salesCount}</span>
                  </DetailItem>
                </DetailGrid>

                {/* Stock Batches Table */}
                {store.stockBatches && store.stockBatches.length > 0 && (
                  <StockBatchesContainer>
                    <SectionTitle>Stock Batches</SectionTitle>
                    <Table>
                      <thead>
                        <tr>
                          <th>Origin</th>
                          <th>Original Stock</th>
                          <th>Current Stock</th>
                          <th>Cost (Incl. Tax)</th>
                          <th>Purchase Date</th>
                          <th>Supplier</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {store.stockBatches.map((batch) => (
                          <tr key={batch.id}>
                            <td>{batch.origin}</td>
                            <td>{batch.originalStock}</td>
                            <td
                              style={{
                                color:
                                  batch.currentStock > 0
                                    ? "#28a745"
                                    : "#dc3545",
                              }}
                            >
                              {batch.currentStock}
                            </td>
                            <td>${batch.costInclTax.toFixed(2)}</td>
                            <td>{batch.purchaseDate}</td>
                            <td>{batch.supplier?.name || "N/A"}</td>
                            <td>
                                <IconButton onClick={() => handleEditItemOrigin(batch)}>
                                  <EditOutlinedIcon />
                                </IconButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </StockBatchesContainer>
                )}
              </StoreDetailItem>
            ))}
          </StoreDetailsContainer>
        </Section>
      </PageContainer>
      <Fade in={alert}>
        <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
      </Fade>
    </Page>
  );
};

export default ProductDetails;
