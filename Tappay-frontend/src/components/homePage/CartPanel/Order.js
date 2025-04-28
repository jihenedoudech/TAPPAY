import React, { useState } from "react";
import styled from "styled-components";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import { Fade, Menu, MenuItem } from "@mui/material";
import { useDispatch } from "react-redux";
import { updateCart } from "../../Redux/cartSlice";
import { selectCustomer } from "../../Redux/customerSlice";
import { deleteOrderThunk, fetchOrdersThunk, selectCurrentOrder } from "../../Redux/orderSlice";
import { AlertNotif } from "../../../utils/BaseStyledComponents";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 1px solid lightgrey;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 15px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  cursor: pointer;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }
`;

const OrderInfo = styled.div`
  display: flex;
  gap: 20px;
  flex: 1;
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  & > div {
    font-size: 14px;
    color: ${(props) => props.theme.colors.text};
  }

  & > div:first-child {
    font-weight: bold;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Order = ({ order, openOrderDetails, onClose }) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [alert, setAlert] = useState(null);


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDetails = (order) => {
    openOrderDetails(order);
    setAnchorEl(null);
  };

  const handleContinue = (event) => {
    const cartItemsFromOrder = order.purchasedItems.map(({ product, ...rest }) => ({
      ...rest,
      productId: product.id, // Add productId from product object
    }));
    console.log("order: ", order);
    dispatch(selectCurrentOrder({ order: order }));
    dispatch(
      updateCart({
        orderNumber: order.orderNumber,
        cartItems: cartItemsFromOrder,
      })
    );
    dispatch(selectCustomer(order.customer));
    handleClose();
    onClose(event);
  };

  const handleDelete = async () => {
    const response = await dispatch(deleteOrderThunk(order.id));
    if (response.type.includes("fulfilled")) {
      handleClose();
      setAlert({
        message: "Order deleted successfully",
        type: "success",
      });
      dispatch(fetchOrdersThunk());
    } else {
      setAlert({
        message: "Failed to delete order",
        type: "error",
      });
    }
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  return (
    <Container>
      <OrderInfo>
        <InfoBlock>
          <div>Order N° {order.orderNumber}</div>
          <div>{new Date(order.dateTime).toLocaleString()}</div>
        </InfoBlock>
        <InfoBlock>
          <div>Total: {order.totalAmount.toFixed(3)}</div>
          <div>
            Customer: {order.customer ? order.customer.name : "Unknown"}
          </div>
        </InfoBlock>
      </OrderInfo>
      <IconWrapper>
        <MoreVertOutlinedIcon
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleClick}
          style={{
            color: `${(props) => props.theme.colors.text}`,
            fontSize: 24,
          }}
        />
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => handleDetails(order)}>Details</MenuItem>
          <MenuItem onClick={handleContinue}>Continue</MenuItem>
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
      </IconWrapper>
      <Fade in={alert}>
        <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
      </Fade>
    </Container>
  );
};

export default Order;
