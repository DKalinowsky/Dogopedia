import React from "react";
import { useParams } from "react-router-dom";
import dogBreeds from "./dogBreeds";
import "./DogDetail.css";

const DogDetail = () => {
  const { breedName } = useParams(); // Wyciągnięcie nazwy rasy z URL
  const breed = dogBreeds.find(
    (dog) => dog.name.toLowerCase().replace(/\s+/g, "-") === breedName
  );

  if (!breed) {
    return <h2>Breed not found</h2>;
  }

  return (
    <div className="dog-detail">
      <img src={breed.imageUrl} alt={breed.name} className="dog-detail-image" />
      <h1 className="dog-detail-name">{breed.name}</h1>
      <p className="dog-detail-description">{breed.description}</p>
      <ul className="dog-detail-info">
        <li>Category: {breed.category}</li>
        <li>Size: {breed.size}</li>
        <li>Traits: {breed.traits.join(", ")}</li>
      </ul>
    </div>
  );
};

export default DogDetail;
