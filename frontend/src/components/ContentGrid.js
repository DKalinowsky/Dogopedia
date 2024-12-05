import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ContentGrid.css";
import dogBreeds from "./dogBreeds"; // Importujemy dane o rasach

const ContentGrid = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const dogsPerPage = 9;

  const navigate = useNavigate();

  // Funkcja obsługująca zmiany w filtrach
  const handleFilterChange = (category, setState, selectedState) => {
    if (selectedState.includes(category)) {
      setState(selectedState.filter((item) => item !== category));
    } else {
      setState([...selectedState, category]);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  // Filtrowanie psów
  const filteredDogsList = dogBreeds
    .filter((dog) => {
      const categoryFilter = selectedCategories.length
        ? selectedCategories.includes(dog.category)
        : true;

      const sizeFilter = selectedSizes.length
        ? selectedSizes.includes(dog.size)
        : true;

      const traitsFilter = selectedTraits.length
        ? selectedTraits.every((trait) => dog.traits.includes(trait))
        : true;

      const nameFilter = dog.name.toLowerCase().includes(searchTerm.toLowerCase());

      return categoryFilter && sizeFilter && traitsFilter && nameFilter;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  const indexOfLastDog = currentPage * dogsPerPage;
  const indexOfFirstDog = indexOfLastDog - dogsPerPage;
  const currentDogs = filteredDogsList.slice(indexOfFirstDog, indexOfLastDog);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredDogsList.length / dogsPerPage); i++) {
    pageNumbers.push(i);
  }

  // Obsługa kliknięcia na kafelek psa
  const handleCardClick = (breedName) => {
    navigate(`/dog-breed/${breedName.toLowerCase().replace(/\s+/g, "-")}`);
  };

  return (
    <section className="content-grid">
      {/* Filtry */}
      <div className="filters">
        <h3>Filter by Category</h3>
        <div className="filter-options">
          {["Sporting", "Herding", "Non-Sporting", "Hound", "Working", "Toy"].map((category) => (
            <div className="filter-option" key={category}>
              <input
                type="checkbox"
                id={category}
                checked={selectedCategories.includes(category)}
                onChange={() => handleFilterChange(category, setSelectedCategories, selectedCategories)}
              />
              <label htmlFor={category}>{category}</label>
            </div>
          ))}
        </div>

        <h3>Filter by Size</h3>
        <div className="filter-options">
          {["Small", "Medium", "Large"].map((size) => (
            <div className="filter-option" key={size}>
              <input
                type="checkbox"
                id={size}
                checked={selectedSizes.includes(size)}
                onChange={() => handleFilterChange(size, setSelectedSizes, selectedSizes)}
              />
              <label htmlFor={size}>{size}</label>
            </div>
          ))}
        </div>

        <h3>Filter by Traits</h3>
        <div className="filter-options">
          {["Intelligent", "Friendly", "Protective", "Energetic", "Calm"].map((trait) => (
            <div className="filter-option" key={trait}>
              <input
                type="checkbox"
                id={trait}
                checked={selectedTraits.includes(trait)}
                onChange={() => handleFilterChange(trait, setSelectedTraits, selectedTraits)}
              />
              <label htmlFor={trait}>{trait}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Wyszukiwanie i sortowanie */}
      <div className="search-sort">
        <input
          type="text"
          placeholder="Search by dog name..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select onChange={handleSortChange} value={sortOrder}>
          <option value="asc">Sort A-Z</option>
          <option value="desc">Sort Z-A</option>
        </select>
      </div>

      {/* Wyświetlanie psów */}
      <div className="dog-grid">
        {currentDogs.map((dog) => (
          <div
            key={dog.id}
            className="dog-card"
            onClick={() => handleCardClick(dog.name)}
          >
            <img src={dog.imageUrl} alt={dog.name} className="dog-image" />
            <h3 className="dog-name">{dog.name}</h3>
            <p className="dog-description">{dog.description}</p>
            <p className="dog-category">Category: {dog.category}</p>
            <p className="dog-size">Size: {dog.size}</p>
            <p className="dog-traits">Traits: {dog.traits.join(", ")}</p>
          </div>
        ))}
      </div>

      {/* Paginacja */}
      <div className="pagination">
        {pageNumbers.map((number) => (
          <button key={number} onClick={() => paginate(number)}>
            {number}
          </button>
        ))}
      </div>
    </section>
  );
};

export default ContentGrid;
