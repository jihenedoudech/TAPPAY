import React from "react";
import { PropagateLoader } from "react-spinners";
import styled from "styled-components";
import Popup from "./Popup";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;
const Process = ({ setShowProcess }) => {
  const handleClose = () => {
    setShowProcess(false);
  };
  return (
    <Popup title={"Process In Progress"} onClose={handleClose}>
      <Container>
        <PropagateLoader size={10} />
      </Container>
    </Popup>
  );
};

export default Process;
