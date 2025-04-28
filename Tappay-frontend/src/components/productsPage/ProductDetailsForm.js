import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Label,
  Input,
  RadioGroup,
  RadioButton,
  RadioInput,
  CheckboxInput,
  Button,
  ErrorMessage,
  CenterButton,
} from "../../utils/BaseStyledComponents";
import Dropdown from "../common/Dropdown";
import { Delete, Add } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { addCategoryThunk, fetchCategoriesThunk } from "../Redux/productSlice";
import config from "../../config";
import Popup from "../common/Popup";
import { ProductType, UnitOfMeasure } from "../../utils/enums";
import { CircularProgress } from "@mui/material";
import AddComponentPopup from "./AddComponentPopup";

const SectionHeader = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
`;

const SectionBox = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
`;

const FormGroup = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
`;

const FormRow2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
`;

const ImageUploadContainer = styled.div`
  width: 75%;
  height: 80%;
  margin: auto;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  background-color: #f9f9f9;
  transition: border 0.3s ease;

  &:hover {
    border-color: #ff6b6b;
  }
`;

const UploadText = styled.p`
  color: #aaa;
  font-size: 16px;
  text-align: center;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

const BarcodeListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const BarcodeItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 10px;
  align-items: center;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 8px;
`;

const Message = styled.div`
  font-size: 15px;
  color: #666;
`;

const IconButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 20px;
  gap: 10px;
`;

const ComponentRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

const ComponentName = styled.div`
  font-weight: 500;
`;

const ComponentQtyContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ComponentTypeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProductDetailsForm = ({
  productDetails,
  setProductDetails,
  onSave,
  isLoading,
}) => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.products.categoriesList);

  const [imagePreview, setImagePreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [errors, setErrors] = useState({});
  // State for adding new component (when product is transformed)
  const [openAddComponentPopup, setOpenAddComponentPopup] = useState(false);

  useEffect(() => {
    if (productDetails && productDetails.image) {
      if (productDetails.image instanceof File) {
        setImagePreview(URL.createObjectURL(productDetails.image));
      } else {
        setImagePreview(
          `${config.IMAGE_BASE_URL}/products/${productDetails.image}`
        );
      }
    } else {
      setImagePreview(null);
    }
  }, [productDetails]);

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductDetails({ ...productDetails, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setProductDetails({ ...productDetails, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSelectCategory = (category) => {
    setProductDetails({ ...productDetails, category: category });
  };

  const handleAddCategory = () => {
    setShowModal(true);
  };

  const handleSaveCategory = async () => {
    const response = await dispatch(addCategoryThunk({ name: newCategory }));
    if (response.type.includes("fulfilled")) {
      setProductDetails({ ...productDetails, category: response.payload });
      setShowModal(false);
      setNewCategory("");
    }
  };

  const handleAddBarcode = () => {
    setProductDetails({
      ...productDetails,
      barcodes: [...productDetails.barcodes, { barcode: "", description: "" }],
    });
  };

  const handleRemoveBarcode = (index) => {
    const newBarcodes = [...productDetails.barcodes];
    newBarcodes.splice(index, 1);
    setProductDetails({ ...productDetails, barcodes: newBarcodes });
  };

  const handleBarcodeChange = (index, field, value) => {
    const newBarcodes = [...productDetails.barcodes];
    newBarcodes[index][field] = value;
    setProductDetails({ ...productDetails, barcodes: newBarcodes });
  };

  const handleAddComponent = () => {
    setOpenAddComponentPopup(true);
  };

  const handleRemoveComponent = (index) => {
    const newComponents = productDetails.components
      ? [...productDetails.components]
      : [];
    newComponents.splice(index, 1);
    setProductDetails({ ...productDetails, components: newComponents });
  };

  const handleComponentTypeChange = (index, newType) => {
    const newComponents = productDetails.components
      ? [...productDetails.components]
      : [];
    newComponents[index].type = newType;
    setProductDetails({ ...productDetails, components: newComponents });
  };

  const handleComponentQtyChange = (index, value) => {
    const newComponents = productDetails.components
      ? [...productDetails.components]
      : [];
    newComponents[index].qty = Number(value);
    setProductDetails({ ...productDetails, components: newComponents });
  };

  const handleSelectComponents = (selectedProducts) => {
    const newComponents = selectedProducts.map((product) => ({
      ProductId: product.id,
      name: product.name,
      type: ProductType.COMPONENT,
      qty: 1,
    }));
    setProductDetails({
      ...productDetails,
      components: productDetails.components
        ? [...productDetails.components, ...newComponents]
        : newComponents,
    });
  };

  return (
    <>
      <SectionBox>
        <SectionHeader>Product Details</SectionHeader>
        <FormGroup>
          <div>
            <FormField>
              <Label>Product Name</Label>
              <Input
                type="text"
                value={productDetails.name}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    name: e.target.value,
                  })
                }
              />
              {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
            </FormField>

            <FormField>
              <Label>Description</Label>
              <Input
                type="text"
                value={productDetails.description}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    description: e.target.value,
                  })
                }
              />
            </FormField>

            <FormRow>
              <FormField>
                <Label>Reference</Label>
                <Input
                  type="text"
                  value={productDetails.reference}
                  onChange={(e) =>
                    setProductDetails({
                      ...productDetails,
                      reference: e.target.value,
                    })
                  }
                />
              </FormField>

              <FormField>
                <Label>Brand</Label>
                <Input
                  type="text"
                  value={productDetails.brand}
                  onChange={(e) =>
                    setProductDetails({
                      ...productDetails,
                      brand: e.target.value,
                    })
                  }
                />
              </FormField>
              <FormField>
                <Label>Category</Label>
                <Dropdown
                  options={categories}
                  selectedOption={productDetails.category}
                  onSelect={handleSelectCategory}
                  onAdd={handleAddCategory}
                />
              </FormField>
            </FormRow>
          </div>

          <ImageUploadContainer
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <ImagePreview src={imagePreview} alt="Product Preview" />
            ) : (
              <UploadText>Drag & Drop or Click to Upload Image</UploadText>
            )}
            <Input
              type="file"
              accept="image/*"
              style={{ position: "absolute", opacity: 0, cursor: "pointer" }}
              onChange={handleImageChange}
            />
          </ImageUploadContainer>
        </FormGroup>

        <FormRow>
          <FormRow>
            <FormField>
              <Label>Unit of Measure</Label>
              <RadioGroup>
                {Object.entries(UnitOfMeasure).map(([key, value]) => (
                  <RadioButton key={value}>
                    <RadioInput
                      type="radio"
                      value={value}
                      checked={productDetails.unitOfMeasure === value}
                      onChange={(e) =>
                        setProductDetails({
                          ...productDetails,
                          unitOfMeasure: e.target.value,
                        })
                      }
                    />
                    {/* Format the label if needed, e.g., converting "PIECE" to "Piece" */}
                    {value.charAt(0) + value.slice(1).toLowerCase()}
                  </RadioButton>
                ))}
              </RadioGroup>
            </FormField>
          </FormRow>
          {productDetails.parent ? (
            <FormField>
              <Label>Parent Product</Label>
              <Input
                type="text"
                value={productDetails.parent.name}
                disabled
              />
            </FormField>
          ) : (
            <FormField>
              <Label>Pieces per Pack</Label>
              <Input
                type="number"
                value={productDetails.piecesPerPack}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    piecesPerPack: e.target.value,
                  })
                }
                disabled={productDetails.unitOfMeasure !== UnitOfMeasure.PACK}
              />
            </FormField>
          )}

          <CheckboxContainer>
            <CheckboxInput
              type="checkbox"
              checked={productDetails.returnable}
              onChange={(e) =>
                setProductDetails({
                  ...productDetails,
                  returnable: e.target.checked,
                })
              }
            />
            <Label>Returnable</Label>
          </CheckboxContainer>
        </FormRow>

        <FormRow2>
          <FormField>
            <Label>Product Type</Label>
            {productDetails.type !== ProductType.COMPONENT &&
            productDetails.type !== ProductType.FINAL_COMPONENT ? (
              <RadioGroup>
                <RadioButton>
                  <RadioInput
                    type="radio"
                    name="productType"
                    value={ProductType.FINAL}
                    checked={productDetails.type === ProductType.FINAL}
                    onChange={(e) =>
                      setProductDetails({
                        ...productDetails,
                        type: ProductType.FINAL,
                        components: [],
                      })
                    }
                  />
                  Final
                </RadioButton>
                <RadioButton>
                  <RadioInput
                    type="radio"
                    name="productType"
                    value={ProductType.TRANSFORMED}
                    checked={productDetails.type === ProductType.TRANSFORMED}
                    onChange={(e) =>
                      setProductDetails({
                        ...productDetails,
                        type: ProductType.TRANSFORMED,
                      })
                    }
                  />
                  Transformed
                </RadioButton>
              </RadioGroup>
            ) : (
              <RadioGroup>
                <RadioButton>
                  <RadioInput
                    type="radio"
                    name="productType"
                    value={ProductType.COMPONENT}
                    checked={productDetails.type === ProductType.COMPONENT}
                    onChange={(e) =>
                      setProductDetails({
                        ...productDetails,
                        type: ProductType.COMPONENT,
                      })
                    }
                  />
                  Component
                </RadioButton>
                <RadioButton>
                  <RadioInput
                    type="radio"
                    name="productType"
                    value={ProductType.FINAL_COMPONENT}
                    checked={
                      productDetails.type === ProductType.FINAL_COMPONENT
                    }
                    onChange={(e) =>
                      setProductDetails({
                        ...productDetails,
                        type: ProductType.FINAL_COMPONENT,
                      })
                    }
                  />
                  Final & Component
                </RadioButton>
              </RadioGroup>
            )}
          </FormField>

          {/* --- Components selection appears only when type is TRANSFORMED --- */}
          {productDetails.type === ProductType.TRANSFORMED && (
            <FormField>
              <Label>Components</Label>
              {productDetails.components &&
                productDetails.components.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    {productDetails.components.map((component, index) => (
                      <ComponentRow key={component.productId}>
                        <ComponentName>{component.name}</ComponentName>
                        <ComponentQtyContainer>
                          <Label>Qty:</Label>
                          <Input
                            type="number"
                            step="any"
                            value={component.qty}
                            onChange={(e) =>
                              handleComponentQtyChange(index, e.target.value)
                            }
                            style={{ width: "80px" }}
                          />
                        </ComponentQtyContainer>
                        <ComponentTypeContainer>
                          <RadioGroup>
                            <RadioButton>
                              <RadioInput
                                type="radio"
                                name={`componentType-${index}`}
                                value={ProductType.COMPONENT}
                                checked={
                                  component.type === ProductType.COMPONENT
                                }
                                onChange={() =>
                                  handleComponentTypeChange(
                                    index,
                                    ProductType.COMPONENT
                                  )
                                }
                              />
                              Component
                            </RadioButton>
                            <RadioButton>
                              <RadioInput
                                type="radio"
                                name={`componentType-${index}`}
                                value={ProductType.FINAL_COMPONENT}
                                checked={
                                  component.type === ProductType.FINAL_COMPONENT
                                }
                                onChange={() =>
                                  handleComponentTypeChange(
                                    index,
                                    ProductType.FINAL_COMPONENT
                                  )
                                }
                              />
                              Component & Final
                            </RadioButton>
                          </RadioGroup>
                        </ComponentTypeContainer>
                        <IconButton
                          type="button"
                          onClick={() => handleRemoveComponent(index)}
                        >
                          <Delete />
                        </IconButton>
                      </ComponentRow>
                    ))}
                  </div>
                )}
              <Button type="button" onClick={handleAddComponent}>
                <Add /> Add Component
              </Button>
            </FormField>
          )}
        </FormRow2>

        <FormField>
          <Label>Barcodes</Label>
          <BarcodeListContainer>
            {productDetails.barcodes && productDetails.barcodes.length > 0 ? (
              productDetails.barcodes.map((barcode, index) => (
                <BarcodeItem key={index}>
                  <Input
                    type="text"
                    value={barcode.barcode}
                    onChange={(e) =>
                      handleBarcodeChange(index, "barcode", e.target.value)
                    }
                    placeholder="Barcode"
                  />
                  <Input
                    type="text"
                    value={barcode.description}
                    onChange={(e) =>
                      handleBarcodeChange(index, "description", e.target.value)
                    }
                    placeholder="Description"
                  />
                  <IconButton
                    type="button"
                    onClick={() => handleRemoveBarcode(index)}
                  >
                    <Delete />
                  </IconButton>
                  {index === productDetails.barcodes.length - 1 && (
                    <IconButton type="button" onClick={handleAddBarcode}>
                      <Add />
                    </IconButton>
                  )}
                </BarcodeItem>
              ))
            ) : (
              <IconButton type="button" onClick={handleAddBarcode}>
                <Add />
                <Message>Add New Barcode</Message>
              </IconButton>
            )}
          </BarcodeListContainer>
        </FormField>
        <CenterButton>
          <Button onClick={() => onSave(productDetails)} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </CenterButton>
      </SectionBox>
      {showModal && (
        <Popup title={"Add New Category"} onClose={() => setShowModal(false)}>
          <FormField>
            <Label>Category Name</Label>
            <Input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </FormField>
          <Button onClick={handleSaveCategory}>Add Category</Button>
        </Popup>
      )}
      {openAddComponentPopup && (
        <AddComponentPopup
          onClose={() => setOpenAddComponentPopup(false)}
          onSelectComponents={handleSelectComponents}
          selectedComponentIds={
            productDetails.components
              ? productDetails.components.map((c) => c.id)
              : []
          }
        />
      )}
    </>
  );
};

export default ProductDetailsForm;
