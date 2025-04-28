import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Page from "../common/Page";
import {
  BackButton,
  Button,
  ButtonsGroup,
  ContentContainer,
  PageContainer,
  PageHeader,
  PageTitle,
  AlertNotif,
} from "../../utils/BaseStyledComponents";
import styled from "styled-components";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Fade } from "@mui/material";
import DeleteConfirmation from "../common/DeleteConfirmation";
import {
  deleteCategoryThunk,
  fetchCategoriesThunk,
  selectCategoryById,
} from "../Redux/productSlice";

const CategoryDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CategoryName = styled.h3`
  margin: 15px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
`;

const CategoryDescription = styled.div`
  font-size: 16px;
  color: #666;
`;

const ProductsTitle = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-top: 10px;
`;

const ProductsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
`;

const ProductCard = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 120px;
  background: url(${(props) => props.src}) center/cover no-repeat;
  border-bottom: 1px solid #eee;
`;

const ProductName = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 10px 0 5px;
  text-transform: capitalize;
`;

const CategoryDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const categoryDetails = useSelector((state) => selectCategoryById(state, id));
  const [deleteConfirmationFor, setDeleteConfirmationFor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleDelete = () => {
    setDeleteConfirmationFor(categoryDetails);
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
        navigate("/products/categories");
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

  const handleUpdate = () => {
    navigate(`/products/categories/update-category/${id}`);
  };

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <PageTitle>
            <BackButton onClick={() => navigate(-1)}>
              <ArrowLeftIcon />
            </BackButton>
            Category Details
          </PageTitle>
          <ButtonsGroup>
            <Button onClick={handleUpdate}>
              <EditIcon />
              Edit
            </Button>
            <Button onClick={handleDelete}>
              <DeleteIcon />
              Delete
            </Button>
          </ButtonsGroup>
        </PageHeader>
        <ContentContainer>
          {categoryDetails ? (
            <CategoryDetailsContainer>
              <CategoryName>{categoryDetails.name}</CategoryName>
              <CategoryDescription>
                {categoryDetails.description || "No description"}
              </CategoryDescription>
              <ProductsTitle>Products :</ProductsTitle>
              <ProductsContainer>
                {categoryDetails.products.map((product) => (
                  <ProductCard key={product.id}>
                    <ProductImage
                      src={product.image || "/images/products/default.jpg"}
                    />
                    <ProductName>{product.name}</ProductName>
                  </ProductCard>
                ))}
              </ProductsContainer>
            </CategoryDetailsContainer>
          ) : (
            <p>Loading...</p>
          )}
        </ContentContainer>
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

export default CategoryDetails;
