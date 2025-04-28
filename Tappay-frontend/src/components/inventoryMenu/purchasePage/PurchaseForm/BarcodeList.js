import React from "react";
import styled from "styled-components";
import { theme } from "../../../../theme";
import Popup from "../../../common/Popup";
import DeleteIcon from "@mui/icons-material/Delete";

const BarcodeListContainer = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 8px 0;
`;

const BarcodeItem = styled.li`
  display: flex;
  align-items: center;
  text-align: center;
  gap: 10px;
  margin-bottom: 4px;
  justify-content: space-between;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${theme.colors.secondary};
  }
`;

const SectionHeader = styled.h4`
  margin: 10px 0;
  color: ${theme.colors.primary};
`;

const BarcodeList = ({
  showBarcodes,
  setShowBarcodes,
  purchasedItems,
  setPurchasedItems,
}) => {
  const removeBarcode = (index, barcode) => {
    const updatedItems = purchasedItems.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          productDetails: {
            ...item.productDetails,
            barcodes: item.productDetails.barcodes.filter((b) => b !== barcode),
          },
        };
      }
      return item;
    });
    setPurchasedItems(updatedItems);
  };

  const handleCloseBarcodePopup = () => {
    setShowBarcodes(null);
  };

  console.log('purchasedItems: ', purchasedItems);

  const { barcodes } = purchasedItems[showBarcodes]?.productDetails || {};
  const newBarcodes = barcodes?.filter((b) => !b.id) || [];
  const existingBarcodes = barcodes?.filter((b) => b.id) || [];

  return (
    <Popup
    title={
      <>
        Barcodes for 
        <br />
        {purchasedItems[showBarcodes]?.productDetails?.name || "_"}
      </>
    }
      onClose={handleCloseBarcodePopup}
    >
      {newBarcodes.length > 0 && (
        <>
          <SectionHeader>New Barcodes</SectionHeader>
          <BarcodeListContainer>
            {newBarcodes.map((barcode, barcodeIndex) => (
              <BarcodeItem key={barcodeIndex} old={false}>
                {barcode.barcode}
                <IconButton onClick={() => removeBarcode(showBarcodes, barcode)}>
                  <DeleteIcon />
                </IconButton>
              </BarcodeItem>
            ))}
          </BarcodeListContainer>
        </>
      )}
      {existingBarcodes.length > 0 && (
        <>
          <SectionHeader>Existing Barcodes</SectionHeader>
          <BarcodeListContainer>
            {existingBarcodes.map((barcode, barcodeIndex) => (
              <BarcodeItem key={barcodeIndex} old={true}>
                {barcode.barcode}
                {barcode.description && (
                  <span> ({barcode.description})</span>
                )}
              </BarcodeItem>
            ))}
          </BarcodeListContainer>
        </>
      )}
      {newBarcodes.length === 0 && existingBarcodes.length === 0 && (
        <p>No barcodes found</p>
      )}
    </Popup>
  );
};

export default BarcodeList;