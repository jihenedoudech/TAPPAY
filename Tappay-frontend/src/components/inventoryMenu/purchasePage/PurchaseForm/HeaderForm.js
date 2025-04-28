import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { theme } from "../../../../theme";
import ViewWeekOutlinedIcon from "@mui/icons-material/ViewWeekOutlined";
import DropdownMenu from "./DropdownMenu";
import { Input, Select } from "../../../../utils/BaseStyledComponents";
import { useDispatch, useSelector } from "react-redux";
import SupplierForm from "./SupplierForm";
import { fetchSuppliersThunk } from "../../../Redux/purchaseSlice";
import { fetchStoresThunk } from "../../../Redux/storeSlice";

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 16px;
  align-items: center;
`;

const StoresSelection = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  gap: 16px;
`;

const SelectItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 1px solid ${theme.colors.lightGrey};
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &.selected {
    background-color: ${theme.colors.primary};
    color: white;
  }
`;

const StoresSelectionHeader = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const ColumnIcon = styled(ViewWeekOutlinedIcon)`
  float: right;
  color: grey;
  transform: scale(1.5);
  cursor: pointer;
`;

const DropDownContainer = styled.div`
  position: relative;
`;

const AddNewSupplierOption = styled.option`
  color: ${theme.colors.primary};
  font-weight: bold;
  &:hover {
    background-color: ${theme.colors.secondary};
  }
`;

const HeaderForm = ({
  purchaseRecordData,
  setPurchaseRecordData,
  visibleColumns,
  setVisibleColumns,
  selectedStores,
  setSelectedStores,
  purchasedItems,
  setPurchasedItems,
}) => {
  const dispatch = useDispatch();
  const suppliers = useSelector((state) => state.purchase.suppliers);
  const storesList = useSelector((state) => state.store.storesList);
  const [openSupplierForm, setOpenSupplierForm] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSuppliersThunk());
    dispatch(fetchStoresThunk());
  }, [dispatch]);

  const handleCheckboxChange = (
    section,
    key,
    storeId = null,
    checked = null
  ) => {
    setVisibleColumns((prev) => {
      const updated = { ...prev };
      if (storeId) {
        updated.stores[storeId][key] =
          checked !== null ? checked : !updated.stores[storeId][key];
      } else {
        updated[section][key] =
          checked !== null ? checked : !updated[section][key];
      }
      return updated;
    });
  };

  const handleSelectSupplier = (selectedSupplier) => {
    console.log("selectedSupplier: ", selectedSupplier);
    if (selectedSupplier === "add-new") {
      setOpenSupplierForm(true);
    } else {
      setPurchaseRecordData({
        ...purchaseRecordData,
        supplier: selectedSupplier,
      });
    }
  };

  useEffect(() => {
    console.log("selectedStores: ", selectedStores);
  }, [selectedStores]);

  const handleSelectStores = (index, store) => {
    setSelectedStores((prevSelectedStores) => {
      const isStoreSelected = prevSelectedStores.includes(store);
      const newSelectedStores = isStoreSelected
        ? prevSelectedStores.filter((selectedStore) => selectedStore !== store)
        : [...prevSelectedStores, store];

      setPurchasedItems((prevItems) =>
        prevItems.map((item, i) => {
          if (i === index) {
            const storeExists = item.stores.some((s) => s.storeId === store.id);

            if (storeExists) {
              console.log("store exists: ", store);
              if (newSelectedStores.includes(store)) {
                console.log("store is selected: ", store);
                return {
                  ...item,
                  stores: item.stores.map((s) =>
                    s.storeId === store.id ? { ...s, quantity: 0 } : s
                  ),
                };
              } else {
                console.log("store is not selected: ");
                return {
                  ...item,
                  stores: item.stores.filter((s) => s.storeId !== store.id),
                };
              }
            } else {
              console.log("store does not exist: ");
              return {
                ...item,
                stores: [...item.stores, { storeId: store.id, quantity: 0 }],
              };
            }
          }
          return item;
        })
      );

      return newSelectedStores;
    });

    setVisibleColumns((prev) => {
      const updatedStores = { ...prev.stores };

      if (!updatedStores[store.id]) {
        updatedStores[store.id] = {
          quantity: true,
          sellingRatio: false,
          sellingPrice: false,
        };
      }

      return { ...prev, stores: updatedStores };
    });
  };

  const handleCloseSupplierForm = () => {
    setOpenSupplierForm(false);
  };

  const handleColumnIconClick = (event) => {
    event.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  return (
    <FormContainer>
      <FormSection>
        <Select
          name="supplier"
          value={purchaseRecordData.supplier}
          onChange={(e) => handleSelectSupplier(e.target.value)}
        >
          <option value="" disabled>
            Select Supplier
          </option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
          <AddNewSupplierOption value="add-new">
            + Add New Supplier
          </AddNewSupplierOption>
        </Select>
        <Input
          type="date"
          value={purchaseRecordData.date}
          onChange={(e) =>
            setPurchaseRecordData({
              ...purchaseRecordData,
              date: e.target.value,
            })
          }
        />
      </FormSection>
      <FormSection>
        <StoresSelection>
          <StoresSelectionHeader>Select Stores :</StoresSelectionHeader>
          {storesList?.map((store) => (
            <SelectItem
              key={store.id}
              className={
                selectedStores.some((s) => s.id === store.id) ? "selected" : ""
              }
              onClick={() => handleSelectStores(0, store)}
            >
              {store.name}
            </SelectItem>
          ))}
        </StoresSelection>
        <DropDownContainer>
          <ColumnIcon onClick={handleColumnIconClick} />
          {isDropdownOpen && (
            <DropdownMenu
              visibleColumns={visibleColumns}
              onCheckboxChange={handleCheckboxChange}
              onClose={handleDropdownClose}
            />
          )}
        </DropDownContainer>
      </FormSection>
      {openSupplierForm && (
        <SupplierForm
          handleClose={handleCloseSupplierForm}
          handleSelectSupplier={handleSelectSupplier}
        />
      )}
    </FormContainer>
  );
};

export default HeaderForm;
