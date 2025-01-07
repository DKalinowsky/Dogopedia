import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ContentGrid.css";

const ContentGrid = () => {
  const [dogBreeds, setDogBreeds] = useState([]); // Wszystkie psy z backendu
  const [filteredDogs, setFilteredDogs] = useState([]); // Psy po filtrowaniu
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const dogsPerPage = 9;
  const [showAddForm, setShowAddForm] = useState(false); // Popup
  const [newDog, setNewDog] = useState({
    race: "",
    category: "",
    size: "",
    traits: "",
    description: "",
    image: "",
  });

  const navigate = useNavigate();

  // Pobranie danych z backendu
  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const response = await fetch("http://localhost:5000/dogs");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setDogBreeds(data); // Ustawiamy wszystkie psy
        setFilteredDogs(data); // Domyślnie wszystkie psy są wyświetlane
      } catch (err) {
        console.error("Error fetching dog data:", err.message);
      }
    };

    fetchDogs();
  }, []);

  // Obsługa filtrowania
  useEffect(() => {
    const filterDogs = () => {
      const filtered = dogBreeds
        .filter((dog) => {
          const categoryFilter = selectedCategories.length
            ? selectedCategories.includes(dog.category)
            : true;

          const sizeFilter = selectedSizes.length
            ? selectedSizes.includes(dog.size)
            : true;

          const traitsFilter = selectedTraits.length
            ? selectedTraits.every((trait) =>
                dog.traits ? dog.traits.includes(trait) : false
              )
            : true;

          const nameFilter = dog.race
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

          return categoryFilter && sizeFilter && traitsFilter && nameFilter;
        })
        .sort((a, b) => {
          if (sortOrder === "asc") {
            return a.race.localeCompare(b.race);
          } else {
            return b.race.localeCompare(a.race);
          }
        });

      setFilteredDogs(filtered);
    };

    filterDogs();
  }, [dogBreeds, selectedCategories, selectedSizes, selectedTraits, searchTerm, sortOrder]);

  // Obsługa zmiany strony
  const indexOfLastDog = currentPage * dogsPerPage;
  const indexOfFirstDog = indexOfLastDog - dogsPerPage;
  const currentDogs = filteredDogs.slice(indexOfFirstDog, indexOfLastDog);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  const handleCardClick = (dogId) => {
    navigate(`/dog-breed/${dogId}`); // Przekazujemy dog_id w URL
  };
  
  const handleAddDogChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    if (type === 'checkbox') {
      // Jeśli checkbox jest zaznaczony, dodajemy cechę do tablicy, w przeciwnym razie ją usuwamy
      setNewDog((prevDog) => {
        const updatedTraits = checked
          ? [...prevDog.traits, value] // Dodaj cechę
          : prevDog.traits.filter((trait) => trait !== value); // Usuń cechę
        return { ...prevDog, [name]: updatedTraits }; // Zaktualizuj stan cech
      });
    } else {
      // Inne pola formularza (np. tekstowe, select)
      setNewDog((prevDog) => ({
        ...prevDog,
        [name]: value,
      }));
    }
  };
  
  

  const handleAddDogSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/new-dogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDog),
      });

      if (!response.ok) {
        throw new Error("Failed to add dog");
      }

      const addedDog = await response.json();
      setDogBreeds([...dogBreeds, addedDog]);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding dog:", error.message);
    }
  };
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredDogs.length / dogsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <section className="content-grid">
      {/* Filtry */}
      <div className="filters">
        <h3>Filter by Category</h3>
        <div className="filter-options">
          {["Sporting", "Herding", "Non-Sporting", "Hound", "Working", "Toy"].map(
            (category) => (
              <div className="filter-option" key={category}>
                <input
                  type="checkbox"
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onChange={() =>
                    handleFilterChange(category, setSelectedCategories, selectedCategories)
                  }
                />
                <label htmlFor={category}>{category}</label>
              </div>
            )
          )}
        </div>

        <h3>Filter by Size</h3>
        <div className="filter-options">
          {["Small", "Medium", "Large"].map((size) => (
            <div className="filter-option" key={size}>
              <input
                type="checkbox"
                id={size}
                checked={selectedSizes.includes(size)}
                onChange={() =>
                  handleFilterChange(size, setSelectedSizes, selectedSizes)
                }
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
      key={dog.dog_id} // Klucz oparty na dog_id
      className="dog-card"
      onClick={() => handleCardClick(dog.dog_id)} // Przekazywanie dog_id do funkcji
    >
      <img
        src={`/photos/${dog.race}.jpg`} // Placeholder dla braku obrazu
        alt={dog.race}
        className="dog-image"
      />
      <h3 className="dog-name">{dog.race}</h3>
      <p className="dog-description">{dog.description}</p>
      <p className="dog-category">Category: {dog.category || "Unknown"}</p>
      <p className="dog-size">Size: {dog.size}</p>
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
      
      {/* Dodanie rasy psa */}
<div className="add-dog-container">
        <p>Nie znalazłeś rasy psa, której szukałeś?</p>
        <button onClick={() => setShowAddForm(true)}>Dodaj rasę psa</button>
      </div>

      {showAddForm && (
  <div className="popup">
    <div className="popup-content">
      <h3>Dodaj nową rasę psa</h3>
      <form onSubmit={handleAddDogSubmit}>
        <input
          type="text"
          name="race"
          placeholder="Nazwa rasy"
          value={newDog.race}
          onChange={handleAddDogChange}
          required
        />

        {/* Kategoria */}
        <select
          name="category"
          value={newDog.category}
          onChange={handleAddDogChange}
          required
        >
          <option value="">Wybierz kategorię</option>
          <option value="Sporting">Sporting</option>
          <option value="Herding">Herding</option>
          <option value="Non-Sporting">Non-Sporting</option>
          <option value="Hound">Hound</option>
          <option value="Working">Working</option>
          <option value="Toy">Toy</option>
        </select>

        {/* Rozmiar */}
        <select
          name="size"
          value={newDog.size}
          onChange={handleAddDogChange}
          required
        >
          <option value="">Wybierz rozmiar</option>
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Large">Large</option>
        </select>

        <textarea
          name="description"
          placeholder="Opis"
          value={newDog.description}
          onChange={handleAddDogChange}
        ></textarea>

        {/* Cechy: Checkboxy */}
        <div className="traits-checkboxes">
          <label>
            <input
              type="checkbox"
              name="traits"
              value="Intelligent"
              checked={newDog.traits.includes('Intelligent')}
              onChange={handleAddDogChange}
            />
            Intelligent
          </label>
          <label>
            <input
              type="checkbox"
              name="traits"
              value="Friendly"
              checked={newDog.traits.includes('Friendly')}
              onChange={handleAddDogChange}
            />
            Friendly
          </label>
          <label>
            <input
              type="checkbox"
              name="traits"
              value="Protective"
              checked={newDog.traits.includes('Protective')}
              onChange={handleAddDogChange}
            />
            Protective
          </label>
          <label>
            <input
              type="checkbox"
              name="traits"
              value="Energetic"
              checked={newDog.traits.includes('Energetic')}
              onChange={handleAddDogChange}
            />
            Energetic
          </label>
          <label>
            <input
              type="checkbox"
              name="traits"
              value="Calm"
              checked={newDog.traits.includes('Calm')}
              onChange={handleAddDogChange}
            />
            Calm
          </label>
        </div>

        <input
          type="text"
          name="image"
          placeholder="URL obrazka"
          value={newDog.image}
          onChange={handleAddDogChange}
        />

        <button type="submit">Dodaj</button>
        <button type="button" onClick={() => setShowAddForm(false)}>
          Anuluj
        </button>
      </form>
          </div>
        </div>
      )}
    </section>
    
  );
};

export default ContentGrid;
