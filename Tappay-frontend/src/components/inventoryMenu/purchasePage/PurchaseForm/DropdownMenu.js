import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

const DropdownMenuContainer = styled.div`
  position: absolute;
  top: 25px;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
  min-width: 200px;
`;

const DropdownHeader = styled.div`
  font-weight: bold;
  margin: 10px 0 5px;
  display: flex;
  align-items: center;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  margin-left: 15px;
`;

const DropdownCheckbox = styled.input`
  margin-right: 5px;
`;

const DropdownMenu = ({ visibleColumns, onCheckboxChange, onClose }) => {
  const dropdownRef = useRef(null);
  const storesList = useSelector((state) => state.store.storesList);
  const handleToggleAll = (checked) => {
    Object.keys(visibleColumns).forEach((section) => {
      if (section === "stores") {
        Object.keys(visibleColumns.stores).forEach((storeId) => {
          handleToggleSection("stores", storeId, checked);
        });
      } else {
        handleToggleSection(section, null, checked);
      }
    });
  };

  const handleToggleSection = (section, storeId, checked) => {
    const columns =
      section === "stores"
        ? visibleColumns.stores[storeId]
        : visibleColumns[section];
    Object.keys(columns).forEach((key) =>
      onCheckboxChange(section, key, storeId, checked)
    );
  };

  const isSectionChecked = (section, storeId) => {
    const columns =
      section === "stores"
        ? visibleColumns.stores[storeId]
        : visibleColumns[section];
    return Object.values(columns).every((checked) => checked);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  console.log("storesList", storesList);

  console.log("visibleColumns", visibleColumns.stores);

  return (
    <DropdownMenuContainer ref={dropdownRef}>
      {/* Global Check All/Uncheck All */}
      <DropdownHeader>
        <DropdownCheckbox
          type="checkbox"
          checked={Object.keys(visibleColumns).every((section) =>
            section === "stores"
              ? Object.keys(visibleColumns.stores).every((storeId) =>
                  isSectionChecked("stores", storeId)
                )
              : isSectionChecked(section, null)
          )}
          onChange={(e) => handleToggleAll(e.target.checked)}
        />
        Check/Uncheck All
      </DropdownHeader>

      {/* Product Details Section */}
      <DropdownHeader>
        <DropdownCheckbox
          type="checkbox"
          checked={isSectionChecked("productDetails", null)}
          onChange={(e) =>
            handleToggleSection("productDetails", null, e.target.checked)
          }
        />
        Product Details
      </DropdownHeader>
      {Object.entries(visibleColumns.productDetails).map(([key, checked]) => (
        <DropdownItem key={key}>
          <DropdownCheckbox
            type="checkbox"
            checked={checked}
            onChange={() => onCheckboxChange("productDetails", key)}
          />
          {key}
        </DropdownItem>
      ))}

      {/* Purchase Details Section */}
      <DropdownHeader>
        <DropdownCheckbox
          type="checkbox"
          checked={isSectionChecked("purchaseDetails", null)}
          onChange={(e) =>
            handleToggleSection("purchaseDetails", null, e.target.checked)
          }
        />
        Purchase Details
      </DropdownHeader>
      {Object.entries(visibleColumns.purchaseDetails).map(([key, checked]) => (
        <DropdownItem key={key}>
          <DropdownCheckbox
            type="checkbox"
            checked={checked}
            onChange={() => onCheckboxChange("purchaseDetails", key)}
          />
          {key}
        </DropdownItem>
      ))}

      {/* Stores Section */}
      {Object.entries(visibleColumns.stores).map(([storeId, columns]) => (
        <div key={storeId}>
          <DropdownHeader>
            <DropdownCheckbox
              type="checkbox"
              checked={isSectionChecked("stores", storeId)}
              onChange={(e) =>
                handleToggleSection("stores", storeId, e.target.checked)
              }
            />
            {storesList?.find((store) => store.id === storeId)?.name ??
              `Store ${storeId}`}
          </DropdownHeader>
          {Object.entries(columns).map(([key, checked]) => (
            <DropdownItem key={key}>
              <DropdownCheckbox
                type="checkbox"
                checked={checked}
                onChange={() => onCheckboxChange("stores", key, storeId)}
              />
              {key}
            </DropdownItem>
          ))}
        </div>
      ))}
    </DropdownMenuContainer>
  );
};

export default DropdownMenu;
