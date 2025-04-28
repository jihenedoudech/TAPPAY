import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import FilterComponent from "./FilterComponent";
import { fetchCategoriesThunk } from "../Redux/productSlice";
import SearchIcon from "@mui/icons-material/Search";

const Container = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 5px;
  margin: 5px;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  align-items: center;
`;

const CategoriesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  max-height: ${(props) => (props.showAll ? "none" : "35px")};
  overflow-y: hidden;
`;

const CategoryButton = styled.button`
  background-color: ${(props) => (props.active ? "#ff6b6b" : "#f0f0f0")};
  color: ${(props) => (props.active ? "#fff" : "#333")};
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.active ? "#ff6b6b" : "#e0e0e0")};
  }
`;

const IconsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 5px;
`;

const IconButton = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 5px 8px;
  border-radius: 15px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: #ff4f4f;
    color: white;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 5px;
  margin-left: 10px;
  transition: border 0.3s ease;

  &:hover {
    border: 1px solid #ff6b6b;
  }

  &:focus-within {
    border: 1px solid #ff6b6b;

    & > svg {
      color: #ff6b6b;
    }
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  padding: 5px;
  font-size: 14px;
  flex: 1;
`;

const Categories = ({ onSelectCategory, filters, setFilters, sortOrder, setSortOrder, onSearch }) => {
  const dispatch = useDispatch();
  const categories = useSelector(state => state.products.categoriesList);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category.id);
    onSelectCategory(category.id); // Notify parent component of the selected category
  };

  const toggleShowAll = () => {
    setShowAll((prevState) => !prevState);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value); // Notify parent component of the search query
  };

  return (
    <Container>
      <CategoriesContainer showAll={showAll}>
        <CategoryButton
          active={activeCategory === null}
          onClick={() => {
            setActiveCategory(null);
            onSelectCategory(null); // Reset to show all products
          }}
        >
          All
        </CategoryButton>
        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            active={activeCategory === category.id}
            onClick={() => handleCategoryClick(category)}
          >
            {category.name}
          </CategoryButton>
        ))}
        <CategoryButton
          active={activeCategory === "none"}
          onClick={() => {
            setActiveCategory("none");
            onSelectCategory("none");
          }}
        >
          Others
        </CategoryButton>
      </CategoriesContainer>
      <IconsContainer>
        <IconButton onClick={toggleShowAll}>
          {showAll ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
        <IconButton>
          <FilterComponent filters={filters} setFilters={setFilters} sortOrder={sortOrder} setSortOrder={setSortOrder} />
        </IconButton>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search product..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </SearchContainer>
      </IconsContainer>
    </Container>
  );
};

export default Categories;
