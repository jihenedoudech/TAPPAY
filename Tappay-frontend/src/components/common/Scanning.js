import React from "react";
import Popup from "./Popup";
import styled from "styled-components";
import QrCodeScannerOutlinedIcon from "@mui/icons-material/QrCodeScannerOutlined";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
`;

const Instruction = styled.p`
  font-size: 16px;
  color: #333;
  margin: 10px 0;
`;

const ScannerBox = styled.div`
  border: 2px dashed #0c085c;
  border-radius: 10px;
  margin-top: 10px;
`;

const ScannerIcon = styled(QrCodeScannerOutlinedIcon)`
  font-size: 80px !important;
  color: #0c085c;
  padding: 10px;
`;

const Scanning = (props) => {
  return (
    <Popup title="Scan Code" onClose={props.handleClose}>
      <Container>
        <Instruction>Place your QR code for scanning.</Instruction>
        <ScannerBox>
          <ScannerIcon />
        </ScannerBox>
      </Container>
    </Popup>
  );
};

export default Scanning;
