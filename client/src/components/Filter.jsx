import React from "react";
import { styled } from "styled-components";

const Container = styled.div`
  position: relative;
`;

const StyledSelect = styled.select`
  border: 1px solid #dddddd;
  border-radius: 0.25rem;
  padding: 0.563rem 0.938rem;
  font-size: 1rem;
  width: 100%;

  &:focus {
    border-color: #000; /* Change to your desired color */
    outline: none; /* Remove default outline */
  }
`;

const Filter = ({ filterElement, onFilterChange }) => {
  const handleFilterChange = (event) => {
    const selectedStatus = event.target.value;
    onFilterChange(selectedStatus);
  };

  return (
    <Container>
      <StyledSelect onChange={handleFilterChange}>
        <option value="">Filter by Status</option>
        {filterElement === "projects" ? (
          <>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </>
        ) : (
          <>
            <option value="to-do">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </>
        )}
      </StyledSelect>
    </Container>
  );
};

export default Filter;
