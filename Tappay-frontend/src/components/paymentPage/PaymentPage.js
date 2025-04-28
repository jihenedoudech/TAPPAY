import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import PaymentMethods from "./PaymentMethods";
import MiddlePanel from "./MiddlePanel";
import RightPanel from "./RightPanel";
import KeyboardDoubleArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftOutlined";

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const Header = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.colors.primary};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  letter-spacing: 1px;
  font-size: 28px;
  font-weight: 700;
  color: white;
`;

const BackButton = styled.button`
  position: absolute;
  left: 20px;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: transparent;
  color: white;
  font-size: 16px;
  border: 2px solid white;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: white;
    color: ${(props) => props.theme.colors.primary};
  }

  svg {
    margin-right: 8px;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 10px;
  padding: 10px;
  background-color: ${(props) => props.theme.colors.cardBackground};
`;

const SectionContainer = styled.div`
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
  padding: 30px;
  transition: box-shadow 0.3s;
  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const RightSectionContainer = styled(SectionContainer)`
  max-height: calc(100vh - 150px);
  overflow-y: auto;
`;

const PaymentPage = () => {
  const navigate = useNavigate();
  const [showContinue, setShowContinue] = useState(false);

  const handleBack = () => {
    setShowContinue(true);
  };

  const confirmNavigation = () => {
    setShowContinue(false);
    navigate("/");
  };

  return (
    <PageWrapper>
      <>
        <Header>
          <BackButton onClick={confirmNavigation}>
            <KeyboardDoubleArrowLeftOutlinedIcon />
            Back
          </BackButton>
          <Title>Payment</Title>
        </Header>

        <ContentContainer>
          <SectionContainer>
            <PaymentMethods />
          </SectionContainer>
          <SectionContainer>
            <MiddlePanel />
          </SectionContainer>
          <RightSectionContainer>
            <RightPanel />
          </RightSectionContainer>
        </ContentContainer>
      </>
    </PageWrapper>
  );
};

export default PaymentPage;
