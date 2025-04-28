import React, { useEffect, useMemo, useState } from "react";
import ProductDetailsForm from "./ProductDetailsForm";
import ProductStoreForm from "./ProductStoreForm";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductsAcrossStoresThunk,
  saveProductDetailsThunk,
  saveProductStoreThunk,
  selectProductDetailsById,
} from "../Redux/productSlice";
import Page from "../common/Page";
import {
  AlertNotif,
  BackButton,
  Button,
  CenterButton,
  PageTitle,
} from "../../utils/BaseStyledComponents";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { fetchCurrentUserThunk } from "../Redux/userSlice";
import { CircularProgress, Fade } from "@mui/material";
import { removeNullValues } from "../../utils/utilsFunctions";
import Loading from "../common/Loading";
import { ProductType, UnitOfMeasure } from "../../utils/enums";

const Container = styled.div`
  padding: 30px;
  height: auto;
  overflow-y: auto;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #ff6b6b;
  justify-content: flex-start;
  overflow-x: auto;
`;

const Tab = styled.div`
  padding: 10px 20px;
  cursor: pointer;
  background-color: ${({ isActive }) => (isActive ? "#ffecec" : "transparent")};
  color: ${({ isActive }) => (isActive ? "#ff6b6b" : "#000")};
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #ffecec;
  }
`;

const ProductForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const product = useSelector((state) => selectProductDetailsById(state, id));
  const [activeTab, setActiveTab] = useState(0);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    dispatch(fetchCurrentUserThunk());
    if (!product && id) {
      dispatch(fetchProductsAcrossStoresThunk());
    }
  }, [dispatch, product, id]);

  const isUpdateMode = !!product;
  const [productDetails, setProductDetails] = useState({
    id: product?.productDetails?.id || null,
    name: product?.productDetails?.name || null,
    description: product?.productDetails?.description || null,
    brand: product?.productDetails?.brand || null,
    reference: product?.productDetails?.reference || null,
    image: product?.productDetails?.image || null,
    category: product?.productDetails?.category || null,
    barcodes: product?.productDetails?.barcodes || [],
    unitOfMeasure: product?.productDetails?.unitOfMeasure || UnitOfMeasure.PIECE,
    piecesPerPack: product?.productDetails?.piecesPerPack || null,
    parent: product?.productDetails?.parent || null,
    returnable: product?.productDetails?.returnable || false,
    type: product?.productDetails?.type || ProductType.FINAL,
    components: product?.productDetails?.components?.map((component) => ({
      id: component?.id || null,
      name: component?.componentProduct?.name || null,
      qty: component?.qty || null,
      type: component?.componentProduct?.type || null,
    })),
  });

  console.log("product: ", product);

  const initialStoreProducts = useMemo(() => {
    if (user?.assignedStores && product) {
      return user.assignedStores.reduce((acc, store) => {
        // Find the storeProduct for the current store
        const storeProduct = product.storeDetails.find(
          (sd) => sd.store.id === store.id
        );
        // Set the storeProduct fields with fallback values
        acc[store.id] = {
          id: storeProduct?.id || null,
          productDetailsId: product?.productDetails?.id || null,
          storeId: store.id || null,
          sellingPrice: storeProduct?.sellingPrice || null,
          minimumSalePrice: storeProduct?.minimumSalePrice || null,
          pricingTiers: storeProduct?.pricingTiers || [],
          stockAlertLevel: storeProduct?.stockAlertLevel || null,
          discountType: storeProduct?.discountType || null,
          discountAmount: storeProduct?.discountAmount || null,
          loyaltyPointsEarned: storeProduct?.loyaltyPointsEarned || null,
          loyaltyPointsRedeemed: storeProduct?.loyaltyPointsRedeemed || null,
        };
        return acc;
      }, {});
    }
    return {}; // Default value if user or product is not available
  }, [user, product]);

  const [storeProducts, setStoreProducts] = useState(initialStoreProducts);

  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSaveProductDetails = async (productDetails) => {
    if (isLoading) return;
    setIsLoading(true);
    if (Object.keys(errors).length === 0) {
      const filteredProductDetails = removeNullValues(productDetails);
      const formData = new FormData();
      formData.append("product", JSON.stringify(filteredProductDetails));
      if (productDetails.image instanceof File) {
        formData.append("image", productDetails.image);
      }
      console.log("productDetails: ", productDetails);
      console.log("formData: ", formData);
      const response = await dispatch(saveProductDetailsThunk(formData));
      if (response.type.includes("fulfilled")) {
        setAlert({
          message: "Product details saved successfully",
          type: "success",
        });
      } else {
        setAlert({
          message: "Failed to save product details",
          type: "error",
        });
      }
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    }
    setErrors({});
    setIsLoading(false);
  };

  const handleSaveStoreDetails = async (storeProduct, store) => {
    if (isLoading) return;
    setIsLoading(true);
    console.log('product detials id: ', productDetails.id)
    console.log("storeProduct: ", removeNullValues(storeProduct));
    console.log("store: ", store);

    const response = await dispatch(saveProductStoreThunk(removeNullValues(storeProduct)));
    if (response.type.includes("fulfilled")) {
      setAlert({
        message: "Product in " + store.name + " store details saved successfully",
        type: "success",
      });
    } else {
      setAlert({
        message: "Failed to save product in " + store.name + " store details",
        type: "error",
      });
    }
    setTimeout(() => {
      setAlert(null);
    }, 3000);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);

    setIsLoading(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Page>
      <Container>
        <PageTitle>
          <BackButton onClick={handleBack}>
            <ArrowLeftIcon />
          </BackButton>
          {isUpdateMode ? "Update Product" : "Add New Product"}
        </PageTitle>
        <ProductDetailsForm
          productDetails={productDetails}
          setProductDetails={setProductDetails}
          onSave={handleSaveProductDetails}
          isLoading={isLoading}
        />
        <TabContainer>
          {user?.assignedStores?.map((store, index) => (
            <Tab
              key={store.id}
              isActive={activeTab === index}
              onClick={() => setActiveTab(index)}
            >
              {store.name}
            </Tab>
          ))}
        </TabContainer>
        {user?.assignedStores?.map((store, index) =>
          activeTab === index ? (
            <ProductStoreForm
              key={store.id}
              store={store}
              storeProduct={storeProducts[store.id]}
              setStoreProduct={(updatedStoreProduct) =>
                setStoreProducts((prev) => ({
                  ...prev,
                  [store.id]: updatedStoreProduct,
                }))
              }
              onSave={handleSaveStoreDetails}
              isLoading={isLoading}
            />
          ) : null
        )}
        {/* <CenterButton>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : "Save All"}
          </Button>
        </CenterButton> */}
        <Fade in={alert}>
          <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
        </Fade>
      </Container>
    </Page>
  );
};

export default ProductForm;
