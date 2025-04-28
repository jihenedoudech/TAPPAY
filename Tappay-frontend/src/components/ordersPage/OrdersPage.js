import React, { useEffect, useState } from "react";
import QrCodeScannerOutlinedIcon from "@mui/icons-material/QrCodeScannerOutlined";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import Page from "../common/Page";
import OrdersTable from "./OrdersTable";
import Scanning from "../common/Scanning";
import PrintReceipt from "./PrintReceipt";
import {
  Button,
  ButtonsGroup,
  PageContainer,
  PageHeader,
} from "../../utils/BaseStyledComponents";

const OrdersPage = () => {
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [printPopup, setPrintPopup] = useState(false);

  const openScan = () => {
    setIsScanOpen(true);
  };

  const closeScan = () => {
    setIsScanOpen(false);
  };

  const handlePrintSelected = () => {
    setPrintPopup(true);
  };

  const handleAfterPrint = () => {
    setPrintPopup(false);
  };

  useEffect(() => {
    console.log(selectedOrders);
  }, [selectedOrders]);

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Orders List</h2>
          <ButtonsGroup>
            <Button onClick={handlePrintSelected}>
              <LocalPrintshopOutlinedIcon />
              Print
            </Button>
            <Button onClick={openScan}>
              <QrCodeScannerOutlinedIcon />
              Scan Code
            </Button>
            {isScanOpen && <Scanning handleClose={closeScan} />}
          </ButtonsGroup>
        </PageHeader>
        <OrdersTable
          selectedOrders={selectedOrders}
          setSelectedOrders={setSelectedOrders}
        />
        {printPopup && (
          <PrintReceipt
            orders={selectedOrders}
            handleAfterPrint={handleAfterPrint}
            handlePrintCancel={handleAfterPrint}
          />
        )}
      </PageContainer>
    </Page>
  );
};

export default OrdersPage;
