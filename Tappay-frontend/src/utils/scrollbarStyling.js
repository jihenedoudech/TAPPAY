import styled from "styled-components";

export const ScrollbarStyling = styled.div`
  max-height: calc(100vh - 150px);
  overflow-y: auto;

  /* Scrollbar Styling for WebKit Browsers (Chrome, Safari, Edge) */
  &::-webkit-scrollbar {
    width: 10px; /* Width of the scrollbar */
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.cardBackground}; /* Track color */
    border-radius: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.primary}; /* Thumb color */
    border-radius: 5px;
    border: 2px solid ${(props) => props.theme.colors.cardBackground}; /* Adds padding around the thumb */
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.colors.primaryDark}; /* Thumb color on hover */
  }

  /* Scrollbar Styling for Firefox */
  scrollbar-width: thin; /* "auto" or "thin" */
  scrollbar-color: ${(props) => props.theme.colors.primary} ${(props) =>
  props.theme.colors.cardBackground}; /* Thumb and track color */
`;
