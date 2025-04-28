import React, { useRef } from "react";
import styled from "styled-components";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined"; // New menu icon for top toggle
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"; // Import logout icon
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutThunk } from "../Redux/userSlice";

const Container = styled.div`
  position: fixed;
  height: 100%;
  display: flex;
  align-items: flex-start;
  z-index: 2;
  background: linear-gradient(135deg, #ff6b6b, #f94d71); /* Full gradient */
`;

const SidebarContainer = styled.div`
  width: ${(props) =>
    props.showSidebar ? "200px" : "45px"}; /* Keep icons visible at 80px */
  height: 100%;
  background: linear-gradient(
    135deg,
    #ff6b6b,
    #f94d71
  ); /* Gradient across sidebar */
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ToggleButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

const Menus = styled.div`
  margin: auto 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: "Poppins", sans-serif;
  flex-grow: 1; // Allow Menus to grow and push logout to the bottom
`;

const Menu = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 15px;
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s ease;
  cursor: pointer;
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  & h4 {
    margin: 0;
    padding: 0;
    display: ${(props) =>
      props.showSidebar ? "block" : "none"}; /* Hide text when collapsed */
  }

  & svg {
    color: #ffffff;
  }
`;

const Sidebar = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const handleSidebar = () => {
    props.setShowSidebar(!props.showSidebar);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      props.setShowSidebar(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  };

  return (
    <Container>
      <SidebarContainer showSidebar={props.showSidebar} ref={sidebarRef}>
        {/* Toggle Button at the top */}
        <ToggleButton onClick={handleSidebar}>
          <MenuOutlinedIcon style={{ color: "#fff" }} />
        </ToggleButton>
        <Menus>
          <Menu to="/" showSidebar={props.showSidebar}>
            <HomeOutlinedIcon />
            <h4>Home</h4>
          </Menu>
          <Menu to="/orders" showSidebar={props.showSidebar}>
            <ShoppingCartOutlinedIcon />
            <h4>Orders</h4>
          </Menu>
          <Menu to="/shifts" showSidebar={props.showSidebar}>
            <AccessTimeOutlinedIcon />
            <h4>Shifts</h4>
          </Menu>
          <Menu to="/products" showSidebar={props.showSidebar}>
            <ListAltOutlinedIcon />
            <h4>Products</h4>
          </Menu>
          <Menu to="/customers" showSidebar={props.showSidebar}>
            <PeopleAltOutlinedIcon />
            <h4>Customers</h4>
          </Menu>
          <Menu to="/purchase" showSidebar={props.showSidebar}>
            <Inventory2OutlinedIcon />
            <h4>Purchase</h4>
          </Menu>
          <Menu to="/settings" showSidebar={props.showSidebar}>
            <SettingsOutlinedIcon />
            <h4>Settings</h4>
          </Menu>
        </Menus>
        <Menu onClick={handleLogout} showSidebar={props.showSidebar}>
          <LogoutOutlinedIcon />
          <h4>Logout</h4>
        </Menu>
      </SidebarContainer>
    </Container>
  );
};

export default Sidebar;
