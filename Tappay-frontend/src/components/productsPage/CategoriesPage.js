import React, { useEffect, useState } from "react";
import Page from "../common/Page";
import {
  AlertNotif,
  PageContainer,
  PageHeader,
} from "../../utils/BaseStyledComponents";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategoriesThunk,
  deleteCategoryThunk,
} from "../Redux/productSlice";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import DeleteConfirmation from "../common/DeleteConfirmation";
import { Fade } from "@mui/material";

// Styled components for the grid and card design
const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const CategoryCard = styled.div`
  background: #fff;
  border: 1px solid #ff6b6b;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  justify-content: center;
  padding: 15px 10px;
  gap: 10px;
  text-align: center;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 8px rgba(255, 107, 107, 1);
    /* box-shadow: 0 5px 8px rgba(255, 107, 107, 1); */
  }
`;

const CategoryName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
`;

const ProductCount = styled.div`
  font-size: 14px;
  color: #666;
`;

const AddCategoryCard = styled(CategoryCard)`
  background-color: #ff6b6b;
  border: 1px solid #ff6b6b;
  color: white;
  font-weight: 600;
  font-size: 20px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
    background-color: #ff3d3d;
  }
`;

const ActionIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
`;

const IconButton = styled.div`
  color: #ff6b6b;
  transition: color 0.2s ease;
  cursor: pointer;
  border-radius: 50%;
  padding: 5px;
  &:hover {
    background-color: #eee;
    color: #ff3d3d;
  }
`;

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categoriesList = useSelector((state) => state.products.categoriesList);
  const [deleteConfirmationFor, setDeleteConfirmationFor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  const handleDelete = (category) => {
    setDeleteConfirmationFor(category);
  };

  const handleDeleteConfirmation = async () => {
    if (isLoading) return;
    if (deleteConfirmationFor) {
      setIsLoading(true);
      const response = await dispatch(
        deleteCategoryThunk(deleteConfirmationFor.id)
      );
      if (response.type.includes("fulfilled")) {
        setDeleteConfirmationFor(null);
        setAlert({
          type: "success",
          message: "Category deleted successfully",
        });
        dispatch(fetchCategoriesThunk());
      } else {
        setAlert({
          type: "error",
          message: "Failed to delete category",
        });
      }
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setIsLoading(false);
    }
  };

  const handleUpdate = (categoryId) => {
    navigate(`/products/categories/update-category/${categoryId}`);
  };

  const handleViewDetails = (categoryId) => {
    navigate(`/products/categories/category-details/${categoryId}`);
  };

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Categories</h2>
        </PageHeader>
        <CategoriesGrid>
          <AddCategoryCard
            onClick={() => navigate("/products/categories/add-category")}
          >
            <div>
              <AddIcon style={{ fontSize: 48, marginBottom: 10 }} />
              <div>Add New Category</div>
            </div>
          </AddCategoryCard>
          {categoriesList?.length > 0 ? (
            categoriesList?.map((category) => (
              <CategoryCard key={category.id}>
                <CategoryName>{category.name}</CategoryName>
                <ProductCount>
                  {category.products?.length} Products
                </ProductCount>
                <ActionIcons>
                  <IconButton
                    aria-label="view"
                    onClick={() => handleViewDetails(category.id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    aria-label="edit"
                    onClick={() => handleUpdate(category.id)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    onClick={() => handleDelete(category)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ActionIcons>
              </CategoryCard>
            ))
          ) : (
            <p>No categories available</p>
          )}
        </CategoriesGrid>
        {/* Render DeleteConfirmation outside the map */}
        {deleteConfirmationFor && (
          <DeleteConfirmation
            itemName={deleteConfirmationFor.name}
            onCancel={() => setDeleteConfirmationFor(null)}
            onDelete={handleDeleteConfirmation}
          />
        )}
        <Fade in={alert}>
          <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
        </Fade>
      </PageContainer>
    </Page>
  );
};

export default CategoriesPage;
