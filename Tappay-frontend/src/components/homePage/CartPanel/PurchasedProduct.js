import React, { useEffect } from "react";
import styled from "styled-components";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { updateCartItemQty, removeFromCart, setSelectedItem } from "../../Redux/cartSlice";
import { selectProductById } from "../../Redux/productSlice";
import config from "../../../config";
import { DiscountType } from "../../../utils/enums";

const CartItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 4fr 1.5fr;
  gap: 8px;
  align-items: center;
  background-color: #f7f7f7;
  padding: 8px;
  border-radius: 10px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const DiscountBadge = styled.div`
  background-color: #ff6b6b;
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  width: fit-content;
`;

const ItemImage = styled.img`
  width: 75px;
  height: 75px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #eee;
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemName = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #333;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const OldPrice = styled.div`
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
`;

const NewPrice = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #ff6b6b;
`;

const DiscountAmount = styled.div`
  font-size: 14px;
  color: #999;
`;

const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
`;

const QtyActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QtyButton = styled.button`
  background-color: #e0e0e0;
  color: #333;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #d0d0d0;
  }

  &:disabled {
    background-color: #f0f0f0;
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #ff3333;
  }
`;

const Quantity = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

const PurchasedProduct = ({ item }) => {
  const { cartItems, selectedItem } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const product = useSelector((state) =>
    selectProductById(state, item.productId)
  );

  // const discountPercentage = product.discount
  //   ? ((product.discount / product.sellingPrice) * 100).toFixed(0)
  //   : 0;

  const handleItemClick = () => {
    dispatch(setSelectedItem(item));
  };

  const incrementQuantity = (id) => {
    console.log(typeof cartItems.find((item) => item.productId === id).quantity)
    dispatch(
      updateCartItemQty({
        id,
        quantity: cartItems.find((item) => item.productId === id).quantity + 1,
      })
    );
  };

  const decrementQuantity = (id) => {
    const item = cartItems.find((item) => item.productId === id);
    if (item.quantity > 1) {
      dispatch(updateCartItemQty({ id, quantity: item.quantity - 1 }));
    }
  };

  const removeItem = (id) => {
    dispatch(removeFromCart(id));
  };

  return (
    <CartItem
      key={item.productId}
      onClick={handleItemClick}
      style={{
        border:
          selectedItem && selectedItem?.productId === item.productId
            ? "2px solid #ff6b6b"
            : "none",
      }}
    >
      <ItemImage
        src={`${config.IMAGE_BASE_URL}/products/${product.productDetails.image}`}
        alt={product.productDetails.name}
        onError={(e) => {
          e.target.src = "/images/products/default.jpg";
        }}
      />
      <ItemDetails>
        <ItemName>{product.productDetails.name}</ItemName>
        <PriceContainer>
          {(product.discount || item.discount || item.sellingPrice !== product.sellingPrice) && (
            <OldPrice>${product.sellingPrice}</OldPrice>
          )}
          <NewPrice>
            {product.discountType === DiscountType.PERCENTAGE ||
            item.discount ||
            item.sellingPrice !== product.sellingPrice ? (
              <NewPrice>${item.sellingPrice}</NewPrice>
            ) : (
              <NewPrice>${product.sellingPrice}</NewPrice>
            )}
          </NewPrice>
        </PriceContainer>
        {item.discount ? (
          <DiscountBadge>{`-${item.discount}%`}</DiscountBadge>
        ) : product.discountType === DiscountType.PERCENTAGE ? (
          <DiscountBadge>{`-${product.discount}%`}</DiscountBadge>
        ) : null}
      </ItemDetails>
      <ItemActions>
        <QtyActions>
          <QtyButton
            onClick={() => decrementQuantity(item.productId)}
            disabled={item.quantity === 1}
          >
            <Remove fontSize="sm" />
          </QtyButton>
          <Quantity>{item.quantity}</Quantity>
          <QtyButton onClick={() => incrementQuantity(item.productId)}>
            <Add fontSize="sm" />
          </QtyButton>
        </QtyActions>
        <RemoveButton onClick={() => removeItem(item.productId)}>
          <Delete />
        </RemoveButton>
      </ItemActions>
    </CartItem>
  );
};

export default PurchasedProduct;
