import React, { useEffect, useState } from "react";
import styled from "styled-components";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Container = styled.div`
  position: relative;
  display: flex;
  width: 350px;
  border: 1px solid #e0e0e0;
  border-radius: 50px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  transition: box-shadow 0.3s ease;

  &:focus-within {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
`;

const Input = styled.input`
  width: 100%;
  height: 50px;
  padding: 0 15px;
  border: none;
  border-radius: 50px;
  outline: none;
  font-size: 16px;
  color: #333;
  transition: border 0.3s ease;

  &:focus {
    border: 1px solid #ff6b6b;
  }
`;

const SearchButton = styled.button`
  height: 50px;
  width: 50px;
  background-color: #ff6b6b;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ff4b4b;
  }

  &:focus {
    outline: none;
  }
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: 55px;
  width: 100%;
  border: 1px solid #ddd;
  background-color: #fff;
  z-index: 20;
  list-style: none;
  padding: 0;
  margin: 0;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
`;

const SuggestionItem = styled.li`
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const Search = () => {
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const productsList = useSelector((state) => state.products.productsList); // Access the product list from Redux

  useEffect(() => {
    if (searchValue) {
      const lowercasedFilter = searchValue.toLowerCase();
      const filteredItems = productsList.filter((product) =>
        product.name.toLowerCase().includes(lowercasedFilter)
      );

      setSuggestions(filteredItems);
    } else {
      setSuggestions([]);
    }
  }, [searchValue, productsList]);

  const handleChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      navigate(`/search?query=${searchValue}`);
      setSearchValue("");
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/items/item-details`, {
      state: { product },
    });
    setSuggestions([]);
    setSearchValue(""); // Clear the input after selecting a suggestion
  };

  return (
    <Container>
      <Input
        type="text"
        placeholder="Search products..."
        value={searchValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
      <SearchButton onClick={() => handleKeyPress({ key: "Enter" })}>
        <SearchIcon style={{ color: "#fff" }} />
      </SearchButton>
      {suggestions.length > 0 && (
        <SuggestionsList>
          {suggestions.map((product) => (
            <SuggestionItem
              key={product.id}
              onClick={() => handleSuggestionClick(product)}
            >
              {product.name}
            </SuggestionItem>
          ))}
        </SuggestionsList>
      )}
    </Container>
  );
};

export default Search;
