import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
  fetchShiftsThunk,
  openShiftThunk,
  fetchCurrentUserShiftThunk,
  closeShiftThunk,
} from "../Redux/shiftSlice";
import ShiftsTable from "./ShiftsTable";
import Page from "../common/Page";
import {
  PageContainer,
  PageHeader,
} from "../../utils/BaseStyledComponents";

const ShiftsHistoryPage = () => {
  const dispatch = useDispatch();
  const { shiftsList, loading, error } = useSelector((state) => state.shifts);

  useEffect(() => {
    dispatch(fetchShiftsThunk());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <h2>Shifts History</h2>
        </PageHeader>
        <ShiftsTable shifts={shiftsList} />
      </PageContainer>
    </Page>
  );
};

export default ShiftsHistoryPage;
