import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import ArrowDropUpOutlinedIcon from "@mui/icons-material/ArrowDropUpOutlined";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUserThunk, logoutThunk } from "../Redux/userSlice";
import { UserRole } from "../../utils/enums";

const Container = styled.div`
  position: fixed;
  height: 100%;
  display: flex;
  align-items: flex-start;
  z-index: 2;
  background: linear-gradient(135deg, #ff6b6b, #f94d71);
`;

const SidebarContainer = styled.div`
  width: ${(props) => (props.showSidebar ? "200px" : "45px")};
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #ff6b6b, #f94d71);
  transition: width 0.3s ease;
  /* overflow: hidden; */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */

  &::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
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
  flex-grow: 1;
  /* overflow-y: auto; */
`;

const Menu = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 12px;
  gap: 8px;
  color: #ffffff;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
  position: relative;
  background-color: ${(props) =>
    props.isActive ? "rgba(255, 255, 255, 0.3)" : "transparent"};
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  h4 {
    margin: 0;
    padding: 0;
    display: ${(props) => (props.showSidebar ? "block" : "none")};
  }

  svg {
    color: #ffffff;
  }
`;

const ArrowIcon = styled.div`
  margin-left: auto;
  color: #ffffff;
`;

const Submenu = styled(Link)`
  padding-left: 30px;
  color: #ffffff;
  text-decoration: none;
  padding: 8px 20px 8px 55px;
  font-weight: bold;
  transition: background-color 0.3s ease;
  display: ${(props) => (props.showSidebar ? "block" : "none")};
  background-color: ${(props) =>
    props.isActive ? "rgba(255, 255, 255, 0.3)" : "transparent"};
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const Sidebar = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const currentUserRole = useSelector((state) => state.user.currentUserRole);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    if (!currentUserRole) {
      dispatch(fetchCurrentUserThunk());
    }
  }, [dispatch]);

  const handleSidebar = () => {
    props.setShowSidebar(!props.showSidebar);
  };

  const handleMenuClick = (menu) => {
    if (!props.showSidebar && menu !== "home") {
      props.setShowSidebar(true);
    }
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      props.setShowSidebar(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);

  const handleLogout = async () => {
    const response = await dispatch(logoutThunk());
    if (response.type.includes("fulfilled") && !localStorage.getItem("token")) {
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (props.showSidebar) {
      const paths = {
        orders: ["/orders", "/orders-reports"],
        shifts: ["/current-shift", "/shifts"],
        products: ["/products", "/categories"],
        customers: ["/customers", "/loyalty-card"],
        purchases: ["/purchases"],
        settings: [
          "/profile-settings",
          "/users-management",
          "/stores-management",
        ],
        reports: ["/sales-summary"],
      };

      const currentPath = location.pathname;
      const activeKey = Object.keys(paths).find((key) =>
        paths[key].includes(currentPath)
      );

      if (activeKey) {
        setActiveMenu(activeKey);
      }
    }
  }, [props.showSidebar, location.pathname]);

  return (
    <Container>
      <SidebarContainer showSidebar={props.showSidebar} ref={sidebarRef}>
        <ToggleButton onClick={handleSidebar}>
          <MenuOutlinedIcon style={{ color: "#fff" }} />
        </ToggleButton>
        <Menus>
          <Menu to="/" showSidebar={props.showSidebar} isActive={isActive("/")}>
            <HomeOutlinedIcon />
            <h4>Home</h4>
          </Menu>
          <Menu
            onClick={() => handleMenuClick("orders")}
            showSidebar={props.showSidebar}
          >
            <ShoppingCartOutlinedIcon />
            <h4>Orders</h4>
            <ArrowIcon>
              {activeMenu === "orders" ? (
                <ArrowDropUpOutlinedIcon />
              ) : (
                <ArrowDropDownOutlinedIcon />
              )}
            </ArrowIcon>
          </Menu>
          {activeMenu === "orders" && (
            <>
              <Submenu
                to="/orders"
                showSidebar={props.showSidebar}
                isActive={isActive("/orders")}
              >
                Orders
              </Submenu>
            </>
          )}
          <Menu
            onClick={() => handleMenuClick("shifts")}
            showSidebar={props.showSidebar}
          >
            <AccessTimeOutlinedIcon />
            <h4>Shifts</h4>
            <ArrowIcon>
              {activeMenu === "shifts" ? (
                <ArrowDropUpOutlinedIcon />
              ) : (
                <ArrowDropDownOutlinedIcon />
              )}
            </ArrowIcon>
          </Menu>
          {activeMenu === "shifts" && (
            <>
              <Submenu
                to="/shifts/current-shift"
                showSidebar={props.showSidebar}
                isActive={isActive("/shifts/current-shift")}
              >
                Current Shift
              </Submenu>
              <Submenu
                to="/shifts/shifts-history"
                showSidebar={props.showSidebar}
                isActive={isActive("/shifts/shifts-history")}
              >
                Shifts History
              </Submenu>
              <Submenu
                to="/shifts/day-details"
                showSidebar={props.showSidebar}
                isActive={isActive("/shifts/day-details")}
              >
                Day Details
              </Submenu>
            </>
          )}
          <Menu
            onClick={() => handleMenuClick("products")}
            showSidebar={props.showSidebar}
          >
            <ListAltOutlinedIcon />
            <h4>Products</h4>
            <ArrowIcon>
              {activeMenu === "products" ? (
                <ArrowDropUpOutlinedIcon />
              ) : (
                <ArrowDropDownOutlinedIcon />
              )}
            </ArrowIcon>
          </Menu>
          {activeMenu === "products" && (
            <>
              <Submenu
                to="/products"
                showSidebar={props.showSidebar}
                isActive={isActive("/products")}
              >
                All Products
              </Submenu>
              <Submenu
                to="/products/categories"
                showSidebar={props.showSidebar}
                isActive={isActive("/products/categories")}
              >
                Categories
              </Submenu>
            </>
          )}
          {currentUserRole === UserRole.ADMIN && (
            <>
              <Menu
                onClick={() => handleMenuClick("customers")}
                showSidebar={props.showSidebar}
              >
                <PeopleAltOutlinedIcon />
                <h4>Customers</h4>
                <ArrowIcon>
                  {activeMenu === "customers" ? (
                    <ArrowDropUpOutlinedIcon />
                  ) : (
                    <ArrowDropDownOutlinedIcon />
                  )}
                </ArrowIcon>
              </Menu>
              {activeMenu === "customers" && (
                <>
                  <Submenu
                    to="/customers"
                    showSidebar={props.showSidebar}
                    isActive={isActive("/customers")}
                  >
                    Customers
                  </Submenu>
                  <Submenu
                    to="/loyalty-card"
                    showSidebar={props.showSidebar}
                    isActive={isActive("/loyalty-card")}
                  >
                    Loyalty Card
                  </Submenu>
                </>
              )}
            </>
          )}
          <Menu
            onClick={() => handleMenuClick("inventory")}
            showSidebar={props.showSidebar}
          >
            <Inventory2OutlinedIcon />
            <h4>Inventory</h4>
            <ArrowIcon>
              {activeMenu === "inventory" ? (
                <ArrowDropUpOutlinedIcon />
              ) : (
                <ArrowDropDownOutlinedIcon />
              )}
            </ArrowIcon>
          </Menu>
          {activeMenu === "inventory" && (
            <>
              {currentUserRole === UserRole.ADMIN && (
                <Submenu
                  to="/inventory/purchases-invoices"
                  showSidebar={props.showSidebar}
                  isActive={isActive("/inventory/purchases-invoices")}
                >
                  Purchases Invoices
                </Submenu>
              )}
              <Submenu
                to="/inventory/stock-movements"
                showSidebar={props.showSidebar}
                isActive={isActive("/inventory/stock-movements")}
              >
                Stock Movements
              </Submenu>
              <Submenu
                to="/inventory/expenses"
                showSidebar={props.showSidebar}
                isActive={isActive("/inventory/expenses")}
              >
                Expenses
              </Submenu>
              <Submenu
                to="/inventory/inventories"
                showSidebar={props.showSidebar}
                isActive={isActive("/inventory/inventories")}
              >
                Inventory
              </Submenu>
            </>
          )}
          {currentUserRole === UserRole.ADMIN && (
            <>
              <Menu
                onClick={() => handleMenuClick("reports")}
                showSidebar={props.showSidebar}
              >
                <BarChartOutlinedIcon />
                <h4>Reports</h4>
                <ArrowIcon>
                  {activeMenu === "reports" ? (
                    <ArrowDropUpOutlinedIcon />
                  ) : (
                    <ArrowDropDownOutlinedIcon />
                  )}
                </ArrowIcon>
              </Menu>
              {activeMenu === "reports" && (
                <>
                  <Submenu
                    to="/reports/sales-summary"
                    showSidebar={props.showSidebar}
                    isActive={isActive("/reports/sales-summary")}
                  >
                    Sales Summary
                  </Submenu>
                  <Submenu
                    to="/reports/products-reports"
                    showSidebar={props.showSidebar}
                    isActive={isActive("/reports/products-reports")}
                  >
                    Products Reports
                  </Submenu>
                  <Submenu
                    to="/reports/users-reports"
                    showSidebar={props.showSidebar}
                    isActive={isActive("/reports/users-reports")}
                  >
                    Users Reports
                  </Submenu>
                </>
              )}
            </>
          )}

          <Menu
            onClick={() => handleMenuClick("settings")}
            showSidebar={props.showSidebar}
          >
            <SettingsOutlinedIcon />
            <h4>Settings</h4>
            <ArrowIcon>
              {activeMenu === "settings" ? (
                <ArrowDropUpOutlinedIcon />
              ) : (
                <ArrowDropDownOutlinedIcon />
              )}
            </ArrowIcon>
          </Menu>
          {activeMenu === "settings" && (
            <>
              <Submenu
                to="/settings/profile-settings"
                showSidebar={props.showSidebar}
                isActive={isActive("/settings/profile-settings")}
              >
                Profile Settings
              </Submenu>
              {currentUserRole === UserRole.ADMIN && (
                <>
                  <Submenu
                    to="/settings/users-management"
                    showSidebar={props.showSidebar}
                    isActive={isActive("/users-management")}
                  >
                    Users Management
                  </Submenu>
                  <Submenu
                    to="/settings/stores-management"
                    showSidebar={props.showSidebar}
                    isActive={isActive("/settings/stores-management")}
                  >
                    Stores Management
                  </Submenu>
                </>
              )}
              {/* <Submenu
                to="/payment-settings"
                showSidebar={props.showSidebar}
                isActive={isActive("/payment-settings")}
              >
                Payment Settings
              </Submenu>
              <Submenu
                to="/hardware-settings"
                showSidebar={props.showSidebar}
                isActive={isActive("/hardware-settings")}
              >
                Hardware Settings
              </Submenu> */}
            </>
          )}
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
