import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./DogDetail.css";

const DogDetail = () => {
  const { dogId } = useParams(); // Wyciągnięcie ID psa z URL
  const [breed, setBreed] = useState(null); // Przechowywanie danych o rasie
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false); // Stan ulubionego psa
  const [favoriteError, setFavoriteError] = useState(null); // Obsługa błędu ulubionych

  useEffect(() => {
    const fetchBreed = async () => {
      try {
        const response = await fetch("http://localhost:5000/dogs");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBreed();
  }, [dogId]);

  const handleFavoriteClick = async () => {
    try {
      const response = await fetch("http://localhost:5000/user/favorites/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dog_id: breed.dog_id, // Identyfikator psa
        }),
      });

      if (!response.ok) {
        throw new Error(`Error adding to favorites: ${response.statusText}`);
      }

      // Zakładając, że sukces to zmiana stanu serduszka
      setIsFavorite(true);
    } catch (err) {
      setFavoriteError(err.message);
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
          title={isFavorite ? "Added to favorites" : "Add to favorites"}
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
    </div>
  );
};

export default DogDetail;
