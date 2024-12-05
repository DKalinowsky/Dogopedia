import React, { useState } from "react";
import dogBreeds from "./dogBreeds";

const DogFilter = ({ onFilter }) => {
  const [selectedType, setSelectedType] = useState("All");

  const handleFilterChange = (event) => {
    setSelectedType(event.target.value);
    onFilter(event.target.value);
  };

  return (
    <div className="dog-filter">
      <label htmlFor="dog-type">Filter by Type: </label>
      <select
        id="dog-type"
        value={selectedType}
        onChange={handleFilterChange}
      >
        <option value="All">All</option>
        <option value="Sporting">Sporting</option>
        <option value="Herding">Herding</option>
        <option value="Non-Sporting">Non-Sporting</option>
        <option value="Hound">Hound</option>
        <option value="Working">Working</option>
        <option value="Toy">Toy</option>
      </select>
    </div>
  );
};

export default DogFilter;
