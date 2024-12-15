import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // Import `toast` i `ToastContainer`
import "react-toastify/dist/ReactToastify.css"; // Import CSS dla `react-toastify`
import "./DogDetail.css";

const DogDetail = () => {
  const { dogId } = useParams(); // Wyciągnięcie ID psa z URL
  const [breed, setBreed] = useState(null); // Przechowywanie danych o rasie
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false); // Stan ulubionego psa
  const [favoriteError, setFavoriteError] = useState(null); // Obsługa błędu ulubionych

  useEffect(() => {
    const fetchBreedAndFavorites = async () => {
      try {
        // Pobierz szczegóły psa
        const response = await axios.get("http://localhost:5000/dogs");
        const data = response.data;

        // Znajdź psa na podstawie dog_id
        const foundBreed = data.find((dog) => dog.dog_id === parseInt(dogId));

        if (!foundBreed) {
          throw new Error("Breed not found");
        }

        // Jeśli `traits` jest ciągiem znaków, rozdziel go na tablicę
        if (typeof foundBreed.traits === "string") {
          foundBreed.traits = foundBreed.traits.split(",").map((trait) => trait.trim());
        }

        setBreed(foundBreed);

        // Sprawdź, czy pies jest w ulubionych
        const favoritesResponse = await axios.get("http://localhost:5000/liked");
        const favoriteDogs = favoritesResponse.data;

        // Jeśli `dogId` jest na liście ulubionych, ustaw `isFavorite` na true
        const isFavoriteDog = favoriteDogs.some((favorite) => favorite.dog_id === foundBreed.dog_id);
        setIsFavorite(isFavoriteDog);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBreedAndFavorites();
  }, [dogId]);

  const handleFavoriteClick = async () => {
    try {
      if (isFavorite) {
        // Usuń z ulubionych
        await axios.delete("http://localhost:5000/user/favorites/remove", {
          data: { dog_id: breed.dog_id }, // Poprawka tutaj
        });
        setIsFavorite(false);
        toast.success(`${breed.race} has been removed from your favorites!`); // Powiadomienie o usunięciu
      } else {
        // Dodaj do ulubionych
        await axios.post("http://localhost:5000/user/favorites/add", {
          dog_id: breed.dog_id,
        });
        setIsFavorite(true);
        toast.success(`${breed.race} has been added to your favorites!`); // Powiadomienie o dodaniu
      }
    } catch (err) {
      setFavoriteError(err.response?.data?.error || "Error updating favorites");
      toast.error("There was an error updating favorites."); // Powiadomienie o błędzie
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>Error: {error}</h2>;
  }

  return (
    <div className="dog-detail">
      <div className="dog-detail-header">
        <img
          src={breed.image || "default-image-url"} // Placeholder dla braku obrazu
          alt={breed.race}
          className="dog-detail-image"
        />
        <button
          className={`favorite-button ${isFavorite ? "favorite" : ""}`}
          onClick={handleFavoriteClick}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>
      <h1 className="dog-detail-name">{breed.race}</h1>
      <p className="dog-detail-description">{breed.description}</p>
      <ul className="dog-detail-info">
        <li>Category: {breed.category || "Unknown"}</li>
        <li>Size: {breed.size || "Unknown"}</li>
        <li>Traits: {breed.traits?.join(", ") || "None"}</li>
        <li>Activity Level: {breed.activity || "Not specified"}</li>
        <li>Age: {breed.age || "Unknown"}</li>
        <li>Allergies: {breed.allergies || "None"}</li>
        <li>Cost Range: {breed.cost_range || "Unknown"}</li>
      </ul>
      {favoriteError && <p className="error">Error: {favoriteError}</p>}

      {/* Dodanie ToastContainer w komponencie */}
      <ToastContainer />
    </div>
  );
};

export default DogDetail;
