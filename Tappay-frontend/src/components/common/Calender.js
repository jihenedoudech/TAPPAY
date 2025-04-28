import React, { useState } from "react";
import styled from "styled-components";
import dayjs from "dayjs";

// Styled Components
const CalendarWrapper = styled.div`
  width: 320px;
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const MonthHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 18px;
`;

const MonthButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #3498db;
  font-size: 18px;
  &:hover {
    color: #2980b9;
  }
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  font-size: 14px;
`;

const Day = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
  background-color: ${({ isSelected, isInRange }) =>
    isSelected ? "#3498db" : isInRange ? "#ecf0f1" : "transparent"};
  color: ${({ isSelected }) => (isSelected ? "#fff" : "#2c3e50")};
  &:hover {
    background-color: ${({ isSelected }) => (isSelected ? "#3498db" : "#bdc3c7")};
  }
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-weight: bold;
  color: #7f8c8d;
`;

// Helper functions
const getDaysInMonth = (month, year) => new Array(dayjs(`${year}-${month}-01`).daysInMonth()).fill(null).map((_, i) => i + 1);

const isSameDay = (day1, day2) => day1 && day2 && day1.isSame(day2, "day");

const isDayInRange = (day, start, end) => start && end && day.isAfter(start) && day.isBefore(end);

// Main Component
const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  const startOfMonth = dayjs().year(currentYear).month(currentMonth).startOf("month");
  const daysInMonth = getDaysInMonth(currentMonth + 1, currentYear);
  const daysToAddBefore = startOfMonth.day();

  const handleDayClick = (day) => {
    const clickedDate = dayjs(`${currentYear}-${currentMonth + 1}-${day}`);
    if (!selectedStartDate || selectedEndDate) {
      setSelectedStartDate(clickedDate);
      setSelectedEndDate(null);
    } else if (clickedDate.isBefore(selectedStartDate)) {
      setSelectedEndDate(selectedStartDate);
      setSelectedStartDate(clickedDate);
    } else {
      setSelectedEndDate(clickedDate);
    }
  };

  const handlePreviousMonth = () => {
    const prevMonth = dayjs(`${currentYear}-${currentMonth + 1}-01`).subtract(1, "month");
    setCurrentMonth(prevMonth.month());
    setCurrentYear(prevMonth.year());
  };

  const handleNextMonth = () => {
    const nextMonth = dayjs(`${currentYear}-${currentMonth + 1}-01`).add(1, "month");
    setCurrentMonth(nextMonth.month());
    setCurrentYear(nextMonth.year());
  };

  return (
    <CalendarWrapper>
      <MonthHeader>
        <MonthButton onClick={handlePreviousMonth}>{"<"}</MonthButton>
        <div>
          {dayjs().month(currentMonth).format("MMMM")} {currentYear}
        </div>
        <MonthButton onClick={handleNextMonth}>{">"}</MonthButton>
      </MonthHeader>
      <DaysGrid>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <WeekdayLabel key={day}>{day}</WeekdayLabel>
        ))}
        {[...Array(daysToAddBefore)].map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map((day) => {
          const currentDay = dayjs(`${currentYear}-${currentMonth + 1}-${day}`);
          const isSelected =
            isSameDay(currentDay, selectedStartDate) || isSameDay(currentDay, selectedEndDate);
          const isInRange = isDayInRange(currentDay, selectedStartDate, selectedEndDate);

          return (
            <Day
              key={day}
              isSelected={isSelected}
              isInRange={isInRange}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </Day>
          );
        })}
      </DaysGrid>
    </CalendarWrapper>
  );
};

export default Calendar;
