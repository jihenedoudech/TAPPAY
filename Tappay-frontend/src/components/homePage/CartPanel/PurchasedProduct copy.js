import React from "react";
import styled from "styled-components";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { updateCartItemQty, removeFromCart } from "../../Redux/cartSlice";
import { selectProductById } from "../../Redux/productSlice";
import config from "../../../config";

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
`;

const ItemImage = styled.img`
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #eee;
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ItemName = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #333;
`;

const ItemPrice = styled.div`
  font-size: 14px;
  color: #666;
`;

const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
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

const PurchasedProduct = ({ item, selectedItem, setSelectedItem }) => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const product =
    useSelector((state) => selectProductById(state, item.productId));

  console.log("product: ", product);

  const handleItemClick = () => {
    setSelectedItem((prevItem) => (prevItem === item ? null : item));
  };

  const incrementQuantity = (id) => {
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
        src={`${config.IMAGE_BASE_URL}/products/${product.image}`}
        alt={product.name}
        onError={(e) => {
          e.target.src = "/images/products/default.jpg";
        }}
      />
      <ItemDetails>
        <ItemName>{product.name}</ItemName>
        <ItemPrice>${product.sellingPrice}</ItemPrice>
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
