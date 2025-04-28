import React, { useState } from "react";
import styled from "styled-components";
import {
  Label,
  Input,
  RadioGroup,
  RadioButton,
  RadioInput,
  Button,
  ErrorMessage,
  CenterButton,
} from "../../utils/BaseStyledComponents";
import { Delete, Add } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { CircularProgress } from "@mui/material";
import { DiscountType } from "../../utils/enums";

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

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const PricingTierContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const PricingTierItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  align-items: center;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 8px;
`;

const AddButton = styled.button`
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
`;

const RemoveButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

const AddToStore = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  & > button {
    padding: 15px 30px;
    font-size: 20px;
  }
`;

const ProductStoreForm = ({
  store,
  storeProduct,
  setStoreProduct,
  onSave,
  isLoading,
}) => {
  const [inStore, setInStore] = useState(!!storeProduct?.sellingPrice);
  const [errors, setErrors] = useState({});

  const handleAddPricingTier = () => {
    setStoreProduct({
      ...storeProduct,
      pricingTiers: [
        ...storeProduct?.pricingTiers,
        { minimumQuantity: null, price: null },
      ],
    });
  };

  const handleRemovePricingTier = (index) => {
    const newPricingTiers = [...storeProduct?.pricingTiers];
    newPricingTiers.splice(index, 1);
    setStoreProduct({ ...storeProduct, pricingTiers: newPricingTiers });
  };

  const handlePricingTierChange = (index, field, value) => {
    const newPricingTiers = [...storeProduct?.pricingTiers];
    newPricingTiers[index][field] = value;
    setStoreProduct({ ...storeProduct, pricingTiers: newPricingTiers });
  };

  return (
    <>
      <SectionBox>
        <SectionHeader>Store Details</SectionHeader>
        {inStore ? (
          <>
            <FormRow>
              <FormField>
                <Label>Price</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={storeProduct?.sellingPrice}
                  onChange={(e) =>
                    setStoreProduct({
                      ...storeProduct,
                      sellingPrice: parseFloat(e.target.value),
                    })
                  }
                  step="0.001"
                />
                {errors.sellingPrice && (
                  <ErrorMessage>{errors.sellingPrice}</ErrorMessage>
                )}
              </FormField>
              <FormField>
                <Label>Minimum Sale Price</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={storeProduct?.minimumSalePrice}
                  onChange={(e) =>
                    setStoreProduct({
                      ...storeProduct,
                      minimumSalePrice: Number(e.target.value),
                    })
                  }
                  step="0.001"
                />
              </FormField>
            </FormRow>
            <FormRow>
              {/* <FormField>
                <Label>Pricing Tiers</Label>
                <PricingTierContainer>
                  {storeProduct?.pricingTiers?.map((tier, index) => (
                    <PricingTierItem key={index}>
                      <Input
                        type="number"
                        value={tier.minimumQuantity}
                        onChange={(e) =>
                          handlePricingTierChange(
                            index,
                            "minimumQuantity",
                            Number(e.target.value)
                          )
                        }
                        placeholder="Minimum Quantity"
                      />
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.001"
                        value={tier.price}
                        onChange={(e) =>
                          handlePricingTierChange(
                            index,
                            "price",
                            Number(e.target.value)
                          )
                        }
                        placeholder="Price"
                      />
                      <RemoveButton
                        type="button"
                        onClick={() => handleRemovePricingTier(index)}
                      >
                        <Delete />
                      </RemoveButton>
                    </PricingTierItem>
                  ))}
                  <AddButton type="button" onClick={handleAddPricingTier}>
                    <Add />
                  </AddButton>
                </PricingTierContainer>
              </FormField> */}
              <FormField>
                <Label>Stock Alert Level</Label>
                <Input
                  type="number"
                  value={storeProduct?.stockAlertLevel}
                  onChange={(e) =>
                    setStoreProduct({
                      ...storeProduct,
                      stockAlertLevel: Number(e.target.value),
                    })
                  }
                />
              </FormField>
            </FormRow>
            <FormRow>
              <FormField>
                <Label>Discount Type</Label>
                <RadioGroup
                  value={storeProduct?.discountType}
                  onChange={(e) =>
                    setStoreProduct({
                      ...storeProduct,
                      discountType: e.target.value,
                    })
                  }
                >
                  <RadioButton>
                    <RadioInput
                      type="radio"
                      value="none"
                      checked={storeProduct?.discountType === DiscountType.NONE}
                    />
                    None
                  </RadioButton>
                  <RadioButton>
                    <RadioInput
                      type="radio"
                      value="percentage"
                      checked={
                        storeProduct?.discountType === DiscountType.PERCENTAGE
                      }
                    />
                    Percentage
                  </RadioButton>
                  <RadioButton>
                    <RadioInput
                      type="radio"
                      value="fixed"
                      checked={
                        storeProduct?.discountType === DiscountType.FIXED
                      }
                    />
                    Fixed
                  </RadioButton>
                </RadioGroup>
              </FormField>

              <FormField>
                <Label>Discount Amount</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.001"
                  value={storeProduct?.discountAmount}
                  onChange={(e) =>
                    setStoreProduct({
                      ...storeProduct,
                      discountAmount: Number(e.target.value),
                    })
                  }
                  disabled={storeProduct?.discountType === DiscountType.NONE}
                />
              </FormField>
            </FormRow>
            <FormRow>
              <FormField>
                <Label>Loyalty Points Earned</Label>
                <Input
                  type="number"
                  value={storeProduct?.loyaltyPointsEarned}
                  onChange={(e) =>
                    setStoreProduct({
                      ...storeProduct,
                      loyaltyPointsEarned: Number(e.target.value),
                    })
                  }
                />
              </FormField>
              <FormField>
                <Label>Loyalty Points Redeemed</Label>
                <Input
                  type="number"
                  value={storeProduct?.loyaltyPointsRedeemed}
                  onChange={(e) =>
                    setStoreProduct({
                      ...storeProduct,
                      loyaltyPointsRedeemed: Number(e.target.value),
                    })
                  }
                />
              </FormField>
            </FormRow>
            <CenterButton>
              <Button
                onClick={() => onSave(storeProduct, store)}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : "Save"}
              </Button>
            </CenterButton>
          </>
        ) : (
          <AddToStore>
            <Button onClick={() => setInStore(true)}>
              <Add />
              Add to {store.name}
            </Button>
          </AddToStore>
        )}
      </SectionBox>
    </>
  );
};

export default ProductStoreForm;
