import { Calculate, ExpandMore } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { updateCartItems, applyTotalDiscount } from "../Redux/cartSlice";
import { UnitOfMeasure } from "../../utils/enums";

const CalculatorContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
`;

const Container = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  grid-gap: 8px;
  padding: 5px;
`;

const NumbersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 6px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Button = styled.button`
  padding: 4px;
  border-radius: 8px;
  background-color: #f2f2f2;
  border: 1px solid #ddd;
  cursor: pointer;
  font-weight: bold;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ActiveButton = styled(Button)`
  background-color: white;
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
`;

const CalculatorButton = styled.div`
  position: absolute;
  bottom: 2px;
  right: 0;
  display: flex;
  justify-content: right;
  padding: 0px;
  color: #ff6b6b;
  border: 2px solid #ff6b6b;
  border-radius: 10px;
`;

const Calculator = ({
  cartItems,
  setAlert,
  isCalculatorVisible,
  setIsCalculatorVisible,
}) => {
  const dispatch = useDispatch();
  const selectedItem = useSelector((state) => state.cart.selectedItem);
  const [input, setInput] = useState("");
  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    setInput(""); // Reset input when activeField or selectedItem changes
  }, [activeField, selectedItem]);

  const handleToggle = () => {
    setIsCalculatorVisible((prev) => !prev);
  };

  const handleButtonClick = (value) => {
    setInput((prevInput) => {
      let newInput = value === "C" ? prevInput.slice(0, -1) : prevInput + value;
      if (newInput === "") newInput = "0";

      const parsedValue = newInput ? parseFloat(newInput) : 0;

      if (activeField === "totalDiscount") {
        dispatch(applyTotalDiscount(parsedValue));
      } else {
        const updatedItems = cartItems.map((item) => {
          if (item.productId === selectedItem?.productId) {
            switch (activeField) {
              case "discount":
                const discountAmount =
                  item.product.sellingPrice * (parsedValue / 100);
                return {
                  ...item,
                  discount: parsedValue,
                  sellingPrice: item.product.sellingPrice - discountAmount,
                };
              case "quantity":
                if (item.unitOfMeasure === UnitOfMeasure.PIECE) {
                  if (newInput.includes(".")) {
                    setAlert({
                      type: "error",
                      message: "Quantity for pieces must be a whole number.",
                    });
                    setTimeout(() => setAlert(null), 1500);
                    return item;
                  }
                  return { ...item, quantity: parseInt(parsedValue, 10) };
                } else if (
                  item.unitOfMeasure === UnitOfMeasure.KILOGRAM ||
                  item.unitOfMeasure === UnitOfMeasure.LITER
                ) {
                  return { ...item, quantity: parseFloat(parsedValue) }; // Ensure a float
                }
                return item;
              case "sellingPrice":
                if (
                  // item.product.minimumSalePrice &&
                  parsedValue > item.product.minimumSalePrice
                ) {
                  return { ...item, sellingPrice: Number(parsedValue.toFixed(3)) };
                } else {
                  setAlert({
                    type: "error",
                    message:
                      "Minimum sale price for " +
                      item.productName +
                      " is " +
                      item.product.minimumSalePrice,
                  });
                  setTimeout(() => setAlert(null), 1500);
                  return {
                    ...item,
                    sellingPrice: Number(item.product.minimumSalePrice),
                  };
                }
              default:
                return item;
            }
          }
          return item;
        });
        dispatch(updateCartItems(updatedItems));
      }

      return newInput;
    });
  };

  const switchField = (field) => {
    setActiveField((prevField) => (prevField === field ? null : field));
    setInput("");
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      if (key === "Escape") {
        setIsCalculatorVisible((prev) => !prev);
      }
      if (!isCalculatorVisible) return;

      if (key === "Backspace") {
        handleButtonClick("C");
      } else if (key === "." || (key >= "0" && key <= "9")) {
        handleButtonClick(key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCalculatorVisible, activeField, selectedItem]);

  return (
    <CalculatorContainer>
      {isCalculatorVisible ? (
        <Container>
          <NumbersContainer>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "C"].map(
              (key) => (
                <Button key={key} onClick={() => handleButtonClick(key)}>
                  {key}
                </Button>
              )
            )}
          </NumbersContainer>
          <ButtonsContainer>
            {["discount", "quantity", "sellingPrice", "totalDiscount"].map(
              (field) => (
                <Button
                  key={field}
                  as={activeField === field ? ActiveButton : Button}
                  onClick={() => switchField(field)}
                >
                  {field === "discount" && "DISC"}
                  {field === "quantity" && "QTY"}
                  {field === "sellingPrice" && "PRICE"}
                  {field === "totalDiscount" && "TOTAL DISC"}
                </Button>
              )
            )}
          </ButtonsContainer>
          <CalculatorButton onClick={handleToggle}>
            <ExpandMore fontSize="large" />
          </CalculatorButton>
        </Container>
      ) : (
        <Container>
          <CalculatorButton onClick={handleToggle}>
            <Calculate fontSize="large" />
          </CalculatorButton>
        </Container>
      )}
    </CalculatorContainer>
  );
};

export default Calculator;

export const GeneralCalculator = ({ onButtonClick }) => {
  return (
    <div>
      <NumbersContainer>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "C"].map((key, index) => (
          <Button key={index} onClick={() => onButtonClick(key)}>
            {key}
          </Button>
        ))}
      </NumbersContainer>
    </div>
  );
};
