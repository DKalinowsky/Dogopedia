import React, { useState } from "react";
import "./ContentGrid.css";
import dogBreeds from "./dogBreeds"; // Importujemy dane o rasach

const ContentGrid = () => {
  // Stan dla filtrów
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // Ustawiamy domyślny porządek sortowania
  const [currentPage, setCurrentPage] = useState(1); // Bieżąca strona
  const dogsPerPage = 9; // Liczba psów na stronie
  
  // Funkcja obsługująca zmiany w filtrach
  const handleFilterChange = (category, setState, selectedState) => {
    if (selectedState.includes(category)) {
      setState(selectedState.filter((item) => item !== category)); // Usuwamy kategorię
    } else {
      setState([...selectedState, category]); // Dodajemy kategorię
    }
  };

  // Funkcja obsługująca zmianę w polu wyszukiwania
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Funkcja obsługująca zmianę porządku sortowania
  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  // Filtrowanie psów na podstawie wybranych kategorii, rozmiarów, cech i nazwy
  const filteredDogsList = dogBreeds
    .filter((dog) => {
      // Filtrujemy na podstawie wybranych kategorii
      const categoryFilter = selectedCategories.length
        ? selectedCategories.includes(dog.category)
        : true;

      // Filtrujemy na podstawie wybranego rozmiaru
      const sizeFilter = selectedSizes.length
        ? selectedSizes.includes(dog.size)
        : true;

      // Filtrujemy na podstawie cech
      const traitsFilter = selectedTraits.length
        ? selectedTraits.every((trait) => dog.traits.includes(trait))
        : true;

      // Filtrujemy na podstawie nazwy psa (wyszukiwanie)
      const nameFilter = dog.name.toLowerCase().includes(searchTerm.toLowerCase());

      return categoryFilter && sizeFilter && traitsFilter && nameFilter;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name); // A-Z
      } else {
        return b.name.localeCompare(a.name); // Z-A
      }
    });

  // Obliczanie indeksów dla bieżącej strony
  const indexOfLastDog = currentPage * dogsPerPage;
  const indexOfFirstDog = indexOfLastDog - dogsPerPage;
  const currentDogs = filteredDogsList.slice(indexOfFirstDog, indexOfLastDog);

  // Funkcje do zmiany stron
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Obliczanie liczby stron
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredDogsList.length / dogsPerPage); i++) {
    pageNumbers.push(i);
  }

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
          <div key={dog.id} className="dog-card">
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
