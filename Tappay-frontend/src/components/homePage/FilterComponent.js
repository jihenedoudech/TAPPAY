import React, { useRef, useState, useEffect } from "react";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import styled from "styled-components";
import SwapVertOutlinedIcon from "@mui/icons-material/SwapVertOutlined";

const DropdownMenu = styled.div`
  position: absolute;
  top: 35px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px 0px;
  width: max-content;
  color: black;
  z-index: 1;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  cursor: pointer;
  background-color: ${(props) => (props.active ? "#a8d0e740" : "transparent")};
  &:hover {
    background-color: ${(props) => (props.active ? "#a8d0e740" : "#f5f5f5")};
  }
`;

const FilterComponent = ({ filters, setFilters, sortOrder, setSortOrder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckboxToggle = (name) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: !prevFilters[name],
    }));
  };

  const handleSortChange = (order) => {
    setSortOrder((prevOrder) => (prevOrder === order ? null : order));
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (filterRef.current && !filterRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={filterRef} onClick={toggleDropdown}>
      <FilterAltOutlinedIcon />
      {isOpen && (
        <DropdownMenu>
          <DropdownItem onClick={() => handleCheckboxToggle("newArrivals")}>
            <input
              type="checkbox"
              name="newArrivals"
              checked={filters.newArrivals}
              readOnly
            />
            New Arrivals
          </DropdownItem>
          <DropdownItem onClick={() => handleCheckboxToggle("onPromotion")}>
            <input
              type="checkbox"
              name="onPromotion"
              checked={filters.onPromotion}
              readOnly
            />
            On Promotion
          </DropdownItem>
          <DropdownItem onClick={() => handleCheckboxToggle("bestSellers")}>
            <input
              type="checkbox"
              name="bestSellers"
              checked={filters.bestSellers}
              readOnly
            />
            Best Sellers
          </DropdownItem>
          <DropdownItem onClick={() => handleCheckboxToggle("inStock")}>
            <input
              type="checkbox"
              name="inStock"
              checked={filters.inStock}
              readOnly
            />
            In Stock
          </DropdownItem>
          <DropdownItem active={sortOrder === "asc"} onClick={() => handleSortChange("asc")}>
            <SwapVertOutlinedIcon fontSize="small" />
            Price: Low to High
          </DropdownItem>
          <DropdownItem active={sortOrder === "desc"} onClick={() => handleSortChange("desc")}>
            <SwapVertOutlinedIcon fontSize="small" />
            Price: High to Low
          </DropdownItem>
        </DropdownMenu>
      )}
    </div>
  );
};

export default FilterComponent;
