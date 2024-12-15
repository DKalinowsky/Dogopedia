import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider"; // Kontekst autoryzacji
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
              <li key={dog.id} className="favorite-item">
                <h3>{dog.name}</h3>
                <img
                  src={dog.imageUrl}
                  alt={dog.name}
                  className="favorite-image"
                />
                <p>{dog.description}</p>
                <p>Category: {dog.category}</p>
                <p>Size: {dog.size}</p>
                <p>Traits: {dog.traits.join(", ") || "None"}</p>
                <p>Activity Level: {dog.activity}</p>
                <p>Age: {dog.age}</p>
                <p>Cost Range: {dog.cost_range}</p>
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
