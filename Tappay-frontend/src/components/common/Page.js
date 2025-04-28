import React, { useState } from "react";
import styled from "styled-components";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Container = styled.div`
  width: ${(props) =>
    props.showSidebar ? "calc(100% - 200px)" : "calc(100% - 45px)"};
  padding-left: ${(props) => (props.showSidebar ? "200px" : "45px")};
  transition: padding-right 0.3s ease;
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh; /* Set container to full viewport height */
  overflow: hidden; /* Hide overflow initially */
`;

const Page = (props) => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <Container showSidebar={showSidebar}>
        <Header />
        {props.children}
      </Container>
    </>
  );
};

export default Page;
