import React, { useState } from "react";
import "./ContentGrid.css";
import dogBreeds from "./dogBreeds"; // Importujemy dane o rasach

const ContentGrid = () => {
  // Stan dla filtrów
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedTraits, setSelectedTraits] = useState([]);

  // Funkcja obsługująca zmiany w filtrach
  const handleFilterChange = (category, setState, selectedState) => {
    if (selectedState.includes(category)) {
      setState(selectedState.filter((item) => item !== category)); // Usuwamy kategorię
    } else {
      setState([...selectedState, category]); // Dodajemy kategorię
    }
  };

  // Filtrujemy psy na podstawie wybranych kategorii
  const filteredDogsList = dogBreeds.filter((dog) => {
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

    return categoryFilter && sizeFilter && traitsFilter;
  });

  return (
    <section className="content-grid">
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

      {/* Wyświetlanie psów */}
      <div className="dog-grid">
        {filteredDogsList.map((dog) => (
          <div key={dog.id} className="dog-card">
            <img src={dog.imageUrl} alt={dog.name} className="dog-image" />
            <h3 className="dog-name">{dog.name}</h3>
            <p className="dog-description">{dog.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContentGrid;
