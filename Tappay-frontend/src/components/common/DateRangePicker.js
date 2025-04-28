import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styled from "styled-components";

const DateRangePickerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const DateInput = styled.input`
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
`;

const CalendarContainer = styled.div`
  position: absolute;
  top: 45px;
  left: 0;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background: #fff;
  border-radius: 8px;
`;

const DateRangePicker = ({ onDateChange, defaultStartDate, defaultEndDate }) => {
  const [startDate, setStartDate] = useState(
    defaultStartDate ? new Date(defaultStartDate) : null
  );
  const [endDate, setEndDate] = useState(
    defaultEndDate ? new Date(defaultEndDate) : null
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      onDateChange({ startDate: start, endDate: end }); // Correctly call the prop function
      setIsOpen(false); // Close calendar after selecting range
    }
  };

  const formattedStartDate = startDate
    ? startDate.toLocaleDateString()
    : "Start Date";
  const formattedEndDate = endDate ? endDate.toLocaleDateString() : "End Date";

  return (
    <DateRangePickerWrapper>
      <DateInput
        readOnly
        value={`${formattedStartDate} - ${formattedEndDate}`}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <CalendarContainer>
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
          />
        </CalendarContainer>
      )}
    </DateRangePickerWrapper>
  );
};

export default DateRangePicker;
