import React from "react";
import styled from "styled-components";
import logo from "../../assets/TAPPAY_LOGO.png";
import { Link } from "react-router-dom";

const Container = styled(Link)`
  display: flex;
  gap: 5px;
  align-items: center;
  text-decoration: none;
  color: black;
  cursor: pointer;
`;
const Img = styled.img`
  max-width: 200px;
`;

const Logo = () => {
  return (
    <Container to="/">
      <Img src={logo} alt="" />
    </Container>
  );
};

export default Logo;
