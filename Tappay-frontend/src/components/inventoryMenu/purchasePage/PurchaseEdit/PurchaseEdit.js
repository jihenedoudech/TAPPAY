import React, { useEffect, useState } from "react";
import Page from "../../../common/Page";
import {
  PageContainer,
  PageHeader,
  PageTitle,
} from "../../../../utils/BaseStyledComponents";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import HeaderEdit from "./HeaderEdit";
import PurchasedItemsEdit from "./PurchasedItemsEdit";
import { fetchOneWithCurrentQuantitiesThunk } from "../../../Redux/purchaseSlice";
import Loading from "../../../common/Loading";

const PurchaseEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [purchase, setPurchase] = useState(null);

  useEffect(() => {
    dispatch(fetchOneWithCurrentQuantitiesThunk(id)).then((response) => {
      setPurchase(response.payload);
    });
  }, [dispatch, id]);

  if (!purchase) {
    return <Loading />; // Or a loading spinner
  }

  console.log("purchase: ", purchase);

  const { purchasedItems, ...purchaseRecordData } = purchase;

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <PageTitle>
            <ArrowLeftIcon onClick={() => navigate(-1)} />
            Purchase Edit
          </PageTitle>
        </PageHeader>
        <HeaderEdit purchaseRecordData={purchaseRecordData} />
        <PurchasedItemsEdit purchasedItems={purchasedItems} />
      </PageContainer>
    </Page>
  );
};

export default PurchaseEdit;
