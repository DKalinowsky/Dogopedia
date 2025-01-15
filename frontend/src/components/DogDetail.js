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
  const [comments, setComments] = useState({ forum: [], care: [], entertainment: [] });
  const [activeTab, setActiveTab] = useState("forum");
  const [showPopup, setShowPopup] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editPopup, setEditPopup] = useState(false); // Popup do edycji
  const [updatedData, setUpdatedData] = useState({}); // Dane do edycji

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
        const commentsResponse = await axios.get(`http://localhost:5000/dogs/${dogId}/comments`);
        setComments({
          forum: commentsResponse.data.filter((c) => c.comm_type === "forum"),
          care: commentsResponse.data.filter((c) => c.comm_type === "care"),
          entertainment: commentsResponse.data.filter((c) => c.comm_type === "entertainment"),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBreedAndFavorites();
  }, [dogId]);

  const handleEditComment = (commId, currentText) => {
    setNewComment(currentText); // Wypełnij pole tekstowe istniejącym komentarzem
    setShowPopup(true); // Otwórz popup dla edycji
  };
  
  const handleDeleteComment = async (commId) => {
    try {
      await axios.delete(`http://localhost:5000/comments/${commId}`);
      setComments((prevComments) => ({
        ...prevComments,
        [activeTab]: prevComments[activeTab].filter((comment) => comment.comm_id !== commId),
      }));
      toast.success("Comment deleted successfully!");
    } catch {
      toast.error("Failed to delete comment.");
    }
  };
  

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

  const handleAddComment = async () => {
    try {
      const response = await axios.post("http://localhost:5000/comments", {
        dog_id: parseInt(dogId),
        comm_text: newComment,
        comm_type: activeTab,
      });

      setComments((prevComments) => ({
        ...prevComments,
        [activeTab]: [...prevComments[activeTab], response.data],
      }));

      toast.success("Comment added successfully!");
      setNewComment("");
      setShowPopup(false);
    } catch {
      toast.error("Failed to add comment.");
    }
  };

  const handleEditClick = () => {
    setUpdatedData({ ...breed }); // Wypełnij formularz aktualnymi danymi
    setEditPopup(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/dog/${dogId}`, updatedData);
      setBreed(updatedData); // Zaktualizuj dane na stronie
      toast.success("Dog information updated successfully!");
      setEditPopup(false);
    } catch (err) {
      toast.error("Failed to update dog information.");
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
          src={`/photos/${breed.race}.jpg`}
          onError={(e) => {
            if (e.target.src !== "/photos/default-image.jpg") {
              e.target.src = "/photos/default-image.jpg"; // Zapobiega nieskończonemu cyklowi
            }
          }}
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
      <button className="button edit-button" onClick={handleEditClick}>
        Edit Dog Info
      </button>

      {editPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Edit Dog Information</h2>
            <label>
              Race:
              <input
                type="text"
                value={updatedData.race}
                onChange={(e) => setUpdatedData({ ...updatedData, race: e.target.value })}
              />
            </label>
            <label>
              Size:
              <input
                type="text"
                value={updatedData.size}
                onChange={(e) => setUpdatedData({ ...updatedData, size: e.target.value })}
              />
            </label>
            <label>
              Category:
              <input
                type="text"
                value={updatedData.category}
                onChange={(e) => setUpdatedData({ ...updatedData, category: e.target.value })}
              />
            </label>
            <label>
              Traits:
              <input
                type="text"
                value={updatedData.traits}
                onChange={(e) => setUpdatedData({ ...updatedData, traits: e.target.value })}
              />
            </label>
            <label>
              Description:
              <textarea
                value={updatedData.description}
                onChange={(e) => setUpdatedData({ ...updatedData, description: e.target.value })}
              />
            </label>
            <button onClick={handleUpdate}>Submit</button>
            <button onClick={() => setEditPopup(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="comments-section">
        <h2>Comments</h2>
        <div className="tabs">
          {["forum", "care", "entertainment"].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <ul className="comments-list">
  {comments[activeTab].map((comment) => (
    <li key={comment.comm_id} className="comment-item">
      <div className="comment-text">
        <strong>{comment.customer_nickname || "Anonymous"}:</strong> {comment.comm_text}
      </div>
      <div className="comment-actions">
        <button
          className="button edit-comment-button"
          onClick={() => handleEditComment(comment.comm_id, comment.comm_text)}
        >
          Edit
        </button>
        <button
          className="button delete-comment-button"
          onClick={() => handleDeleteComment(comment.comm_id)}
        >
          Delete
        </button>
      </div>
    </li>
  ))}
</ul>

        <button className="button add-comment-button" onClick={() => setShowPopup(true)}>
          Add Comment
        </button>
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Add Comment</h2>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your comment here..."
            />
            <div>
              <button onClick={handleAddComment}>Submit</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default DogDetail;
