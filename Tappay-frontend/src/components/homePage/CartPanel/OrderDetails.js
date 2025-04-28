import React from "react";
import Popup from "../../common/Popup";
import Receipt from "../../ordersPage/Receipt";


const OrderDetails = ({ order, closeOrderDetails, openOrdersList }) => {
  const returnToOrdersList = (event) => {
    closeOrderDetails(event);
    openOrdersList(event);
  };

  return (
    <Popup title="Order Details" onClose={returnToOrdersList}>
      <Receipt order={order} />
    </Popup>
  );
};

export default OrderDetails;
