import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider"; // Kontekst autoryzacji
import { useNavigate } from "react-router-dom"; // Import useNavigate do przekierowywania
import { Link } from "react-router-dom"; // Import Link z react-router-dom
import "./Dashboard.css";

// Funkcja mapująca dane psów
const mapDogData = (dog) => ({
  id: dog.dog_id,
  name: dog.race,
  imageUrl: dog.image || "default-image.jpg",
  description: dog.description || "No description available.",
  category: dog.category || "Unknown",
  size: dog.size || "Unknown",
  traits: typeof dog.traits === "string" ? dog.traits.split(",").map((trait) => trait.trim()) : dog.traits || [],
  activity: dog.activity || "Unknown",
  age: dog.age || "Unknown",
  cost_range: dog.cost_range || "Unknown",
});

const Dashboard = () => {
  const { user } = useAuth(); // Pobranie użytkownika z kontekstu
  const isLoggedIn = !!user; // Sprawdzenie, czy użytkownik jest zalogowany
  const [likedDogs, setLikedDogs] = useState([]); // Przechowywanie ulubionych psów
  const [loading, setLoading] = useState(true); // Status ładowania
  const [error, setError] = useState(null); // Obsługa błędów
  const navigate = useNavigate(); // Hook nawigacji

  const handleCardClick = (dogId) => {
    navigate(`/dog-breed/${dogId}`); // Przekazujemy dog_id w URL
  };

  // Pobieranie psów i ulubionych psów po zalogowaniu
  useEffect(() => {
    const fetchBreedAndFavorites = async () => {
      try {
        // Pobierz wszystkie psy
        const response = await axios.get("http://localhost:5000/dogs");
        const data = response.data;

        if (isLoggedIn) {
          // Pobierz id ulubionych psów
          const likedResponse = await axios.get("http://localhost:5000/liked", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const likedDogIds = likedResponse.data.map((liked) => liked.dog_id);

          // Filtruj psy, które są w ulubionych
          const likedDogs = data.filter((dog) => likedDogIds.includes(dog.dog_id));

          // Modyfikacja danych psów (np. `traits` jako tablica)
          const mappedDogs = likedDogs.map((dog) => mapDogData(dog));

          setLikedDogs(mappedDogs);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch liked dogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBreedAndFavorites();
  }, [isLoggedIn]); // useEffect będzie reagować na zmianę isLoggedIn

  if (!isLoggedIn) {
    return (
      <section className="dashboard">
        <h2>Access Restricted</h2>
        <p>
          You need to <a href="/login" className="login-link">log in</a> to access your dashboard.
        </p>
      </section>
    );
  }

  if (loading) {
    return <h2>Loading your favorite dogs...</h2>;
  }

  if (error) {
    return <h2>Error: {error}</h2>;
  }

  return (
    <section className="dashboard">
      <div className="dashboard-container">
        <h2>Welcome to Your Dashboard!</h2>
        <h3>Your Favorite Dogs</h3>
        <ul className="favorites-list">
          {likedDogs.length > 0 ? (
            likedDogs.map((dog) => (
              <li key={dog.id} className="favorite-item" onClick={() => handleCardClick(dog.id)}>
                <div className="favorite-item-left">
                  <img
                    src={dog.imageUrl}
                    alt={dog.name}
                    className="favorite-image"
                    onClick={() => handleCardClick(dog.id)} // Kliknięcie obrazu psa przekierowuje do szczegółów
                  />
                  <div className="favorite-info">
                    <h3>
                        {dog.name}
                    </h3>
                    <p>{dog.description}</p>
                    <p><strong>Category:</strong> {dog.category}</p>
                    <p><strong>Size:</strong> {dog.size}</p>
                    <p><strong>Traits:</strong> {dog.traits.join(", ") || "None"}</p>
                    <p><strong>Activity Level:</strong> {dog.activity}</p>
                    <p><strong>Age:</strong> {dog.age}</p>
                    <p><strong>Cost Range:</strong> {dog.cost_range}</p>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p>You don't have any favorite breeds yet. Start exploring!</p>
          )}
        </ul>
      </div>
    </section>
  );
};

export default Dashboard;
