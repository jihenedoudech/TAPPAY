import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { fetchOrdersThunk, deleteOrder } from "../Redux/orderSlice";

const OrderContainer = styled.div`
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
`;

const SearchInput = styled.input`
  padding: 10px;
  margin: 20px 0;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const OrderList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const OrderItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  margin-bottom: 10px;
  background-color: #f9f9f9;

  &:hover {
    background-color: #f1f1f1;
  }
`;

const Button = styled.button`
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #e55c5c;
  }
`;

const OrderDetails = styled.div`
  display: none; // Initially hidden
`;

const OrderMenu = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.orders);
  const orderStatus = useSelector((state) => state.orders.status);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (orderStatus === "idle") {
      dispatch(fetchOrdersThunk());
    }
  }, [orderStatus, dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteOrder(id));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredOrders = orders.filter((order) =>
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDetails = (order) => {
    setSelectedOrder(selectedOrder === order ? null : order);
  };

  return (
    <OrderContainer>
      <Title>Orders</Title>
      <SearchInput
        type="text"
        placeholder="Search by customer..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <OrderList>
        {filteredOrders.map((order) => (
          <OrderItem key={order.id}>
            <div>
              <strong>{order.customer}</strong> - {order.date} - $
              {order.total.toFixed(2)}
            </div>
            <div>
              <Button onClick={() => toggleDetails(order)}>
                {selectedOrder === order ? "Hide Details" : "View Details"}
              </Button>
              <Button onClick={() => handleDelete(order.id)}>Delete</Button>
            </div>
            {selectedOrder === order && (
              <OrderDetails>
                <div>
                  <strong>Items:</strong>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.name} - {item.quantity} x $
                        {item.sellingPrice.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              </OrderDetails>
            )}
          </OrderItem>
        ))}
      </OrderList>
    </OrderContainer>
  );
};

export default OrderMenu;
