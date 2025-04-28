import React, { useState } from "react";
import Popup from "../common/Popup";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { addCategoryThunk } from "../Redux/productSlice";
import { Button, Input, Label } from "../../utils/BaseStyledComponents";

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const NewCategory = ({ setShowModal, handleChangeCategory }) => {
  const dispatch = useDispatch();
  const [newCategory, setNewCategory] = useState("");
  const handleSaveCategory = async () => {
    const response = await dispatch(addCategoryThunk({name:newCategory}));
    console.log('category response: ', response.payload);
    if (response.type.includes("fulfilled")) {
      handleChangeCategory(response.payload.id);
      setShowModal(false);
      setNewCategory("");
    }
  };
  return (
    <Popup title={"Add New Category"} onClose={() => setShowModal(false)}>
      <FormField>
        <Label>Category Name</Label>
        <Input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
      </FormField>
      <Button onClick={handleSaveCategory}>Add Category</Button>
    </Popup>
  );
};

export default NewCategory;
