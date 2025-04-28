import React, { useEffect, useState } from "react";
import styled from "styled-components";
import StoreIcon from "@mui/icons-material/Store";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchStoresThunk,
  addStoreThunk,
  selectStoreThunk,
} from "../Redux/storeSlice";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import { fetchCurrentUserThunk, logoutThunk } from "../Redux/userSlice";
import { UserRole } from "../../utils/enums";
import { CircularProgress, Fade } from "@mui/material";
import { AlertNotif } from "../../utils/BaseStyledComponents";

const StoreSelectionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to bottom right, #ff5a5a, #ff905a);
  position: relative;
  overflow: hidden;
`;

const FloatingCircle = styled.div`
  position: absolute;
  width: ${(props) => props.size || "200px"};
  height: ${(props) => props.size || "200px"};
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: ${(props) => props.top || "10%"};
  left: ${(props) => props.left || "10%"};
`;

const LogoutButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }

  svg {
    font-size: 20px;
    transform: scaleX(-1);
  }
`;

const StoreSelectionBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), #fff);
  margin: 50px;
  padding: 30px;
  border-radius: 25px;
  box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const Title = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #ff5a5a;
  margin-bottom: 30px;
`;

const Button = styled.button`
  background-color: #ff5a5a;
  color: white;
  font-size: 18px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff905a;
  }

  display: flex;
  align-items: center;
  gap: 10px;
`;

const StoreGrid = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 25px;
  /* margin-top: 0px; */
  max-height: calc(100vh - 260px);
  overflow-y: auto;
  padding: 30px;
`;

const StoreCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  background: white;
  border-radius: 20px;
  padding: 50px 25px;
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.25);
  }

  ${(props) =>
    props.isSelected &&
    `border: 2px solid #ff5a5a;
     box-shadow: 0px 8px 20px rgba(255, 90, 90, 0.4);
  `}

  & > svg {
    color: #ff5a5a;
    transform: scale(3.5);
  }
`;

const StoreName = styled.span`
  color: #333;
  font-size: 26px;
  font-weight: 600;
  text-align: center;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InputsRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 25px;
`;

const InputField = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 10px 15px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const SubmitButton = styled(Button)`
  margin-top: 10px;
`;

const StoreSelectionPage = () => {
  const { user, currentUserRole } = useSelector((state) => state.user);
  const { loading, error } = useSelector((state) => state.store);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newStore, setNewStore] = useState({
    name: "",
    taxNumber: "",
    address: {
      country: "",
      state: "",
      city: "",
    },
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    dispatch(fetchCurrentUserThunk());
  }, [dispatch]);

  useEffect(() => {
    if (
      user?.assignedStores?.length === 1 &&
      currentUserRole !== UserRole.ADMIN
    ) {
      handleStoreSelect(user?.assignedStores[0].id);
    }
  }, [user?.assignedStores, currentUserRole]);

  console.log("user of store selection: ", user);

  const handleStoreSelect = async (storeId) => {
    console.log("storeId: ", storeId);
    const response = await dispatch(selectStoreThunk(storeId));
    if (response.type.includes("fulfilled")) {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    const response = await dispatch(logoutThunk());
    if (response.type.includes("fulfilled")) {
      navigate("/login");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewStore((prev) => {
      if (["country", "state", "city"].includes(name)) {
        // Update the nested address field
        return {
          ...prev,
          address: {
            ...prev.address,
            [name]: value,
          },
        };
      }
      // Update top-level fields
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleAddStore = async () => {
    if (isLoading) return;
    setIsLoading(true);
    if (!newStore.name) {
      alert("Store name is required!");
      return;
    }
    const response = await dispatch(addStoreThunk(newStore));
    if (response.type.includes("fulfilled")) {
      setNewStore({
        name: "",
        taxNumber: "",
        address: {
          country: "",
          state: "",
          city: "",
        },
      });
      setAlert({
        type: "success",
        message: "Store added successfully!",
      });
      window.location.reload();
      // setShowForm(false);
    } else {
      setAlert({
        type: "error",
        message: "Failed to add store!",
      });
    }
    setIsLoading(false);
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  return (
    <StoreSelectionContainer>
      {/* Floating Circles for Decorative Background */}
      <FloatingCircle size="400px" top="5%" left="10%" />
      <FloatingCircle size="250px" top="70%" left="75%" />
      <FloatingCircle size="180px" top="85%" left="15%" />

      <LogoutButton onClick={handleLogout}>
        <ExitToAppIcon />
        Logout
      </LogoutButton>

      <StoreSelectionBox>
        <Title>Select Your Store</Title>

        {user?.assignedStores?.length === 0 ? (
          <>
            {/* <Message>No stores available</Message> */}
            {!showForm && currentUserRole === UserRole.ADMIN && (
              <Button onClick={() => setShowForm(true)}>
                Create Your First Store
              </Button>
            )}
          </>
        ) : (
          !showForm && (
            <StoreGrid>
              {user?.assignedStores?.map((store) => (
                <StoreCard onClick={() => handleStoreSelect(store.id)}>
                  <StoreIcon />
                  <StoreName>{store.name}</StoreName>
                </StoreCard>
              ))}
              {currentUserRole === UserRole.ADMIN && (
                <StoreCard onClick={() => setShowForm(true)}>
                  <AddBusinessIcon />
                  <StoreName style={{ color: "#ff5a5a" }}>
                    Add New Store
                  </StoreName>
                </StoreCard>
              )}
            </StoreGrid>
          )
        )}

        {showForm && (
          <FormContainer>
            <InputsRow>
              <InputField
                name="name"
                placeholder="Store Name"
                value={newStore.name}
                onChange={handleInputChange}
              />
              <InputField
                name="taxNumber"
                placeholder="Tax Number"
                value={newStore.taxNumber}
                onChange={handleInputChange}
              />
            </InputsRow>
            <InputsRow>
              <InputField
                name="country"
                placeholder="Country"
                value={newStore.address.country}
                onChange={handleInputChange}
              />
              <InputField
                name="state"
                placeholder="State"
                value={newStore.address.state}
                onChange={handleInputChange}
              />
            </InputsRow>
            <InputsRow>
              <InputField
                name="city"
                placeholder="City"
                value={newStore.address.city}
                onChange={handleInputChange}
              />
            </InputsRow>
            <SubmitButton onClick={handleAddStore} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : "Add Store"}
            </SubmitButton>
          </FormContainer>
        )}
      </StoreSelectionBox>
      <Fade in={alert}>
        <AlertNotif severity={alert?.type}>{alert?.message}</AlertNotif>
        </Fade>
    </StoreSelectionContainer>
  );
};

export default StoreSelectionPage;
