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
  const [editingCommentId, setEditingCommentId] = useState(null);


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

const handleUpdateComment = async (commId) => {
  try {
    await axios.put(`http://localhost:5000/comments/${commId}`, {
      comm_text: newComment,
    });

    toast.success("Comment updated successfully!");
    setShowPopup(false);
    setNewComment("");

    fetchComments();
  } catch {
    toast.error("Failed to update comment.");
  }
};

const handleEditComment = (commId, currentText) => {
  setNewComment(currentText);
  setShowPopup(true);
  setEditingCommentId(commId);
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

  const fetchComments = async () => {
  try {
    const commentsResponse = await axios.get(`http://localhost:5000/dogs/${dogId}/comments`);
    setComments({
      forum: commentsResponse.data.filter((c) => c.comm_type === "forum"),
      care: commentsResponse.data.filter((c) => c.comm_type === "care"),
      entertainment: commentsResponse.data.filter((c) => c.comm_type === "entertainment"),
    });
  } catch (err) {
    toast.error("Failed to fetch comments.");
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

      fetchComments();
    } catch {
      toast.error("Failed to add comment.");
    }
  };

  const handleEditClick = () => {
    setUpdatedData({ ...breed }); // Wypełnij formularz aktualnymi danymi
    setEditPopup(true);
  };

const handleUpdate = async () => {
  // Sprawdzamy, czy wszystkie wymagane dane są dostępne
  if (!updatedData.race || !updatedData.size || !updatedData.category || !updatedData.traits || !updatedData.allergies || !updatedData.age || !updatedData.description || !updatedData.cost_range || !updatedData.activity) {
    toast.error("Please fill in all fields before submitting.");
    return;
  }

  try {
    // Mapowanie danych z formularza (np. `updatedData`) na format oczekiwany przez backend
    const dataToSend = {
      race: updatedData.race,
      size: updatedData.size,
      category: updatedData.category,
      traits: updatedData.traits,
      allergies: updatedData.allergies,
      age: updatedData.age,
      description: updatedData.description,
      cost_range: updatedData.cost_range,
      activity: updatedData.activity,
    };

    // Wysyłamy dane na endpoint request-update
    const response = await axios.post(`http://localhost:5000/dog/request-update/${dogId}`, dataToSend);

    toast.success("Dog information update request submitted successfully!");
    setEditPopup(false);
  } catch (err) {
    // Obsługa błędów
    toast.error("Failed to submit update request.");
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
          value={updatedData.race || ""}
          onChange={(e) => setUpdatedData({ ...updatedData, race: e.target.value })}
        />
      </label>
      <label>
        Size:
        <select
          value={updatedData.size || ""}
          onChange={(e) => setUpdatedData({ ...updatedData, size: e.target.value })}
        >
          <option value="">Select size</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </label>
      <label>
        Category:
        <select
          value={updatedData.category || ""}
          onChange={(e) => setUpdatedData({ ...updatedData, category: e.target.value })}
        >
          <option value="">Select category</option>
          <option value="Sporting">Sporting</option>
          <option value="Herding">Herding</option>
          <option value="Non-Sporting">Non-Sporting</option>
          <option value="Hound">Hound</option>
          <option value="Working">Working</option>
          <option value="Toy">Toy</option>
        </select>
      </label>
      <fieldset>
        <legend>Traits:</legend>
        <label>
          <input
            type="checkbox"
            checked={updatedData.traits?.includes("loyal") || false}
            onChange={(e) => {
              const newTraits = e.target.checked
                ? [...(updatedData.traits || []), "loyal"]
                : updatedData.traits.filter((trait) => trait !== "loyal");
              setUpdatedData({ ...updatedData, traits: newTraits });
            }}
          />
          Loyal
        </label>
        <label>
          <input
            type="checkbox"
            checked={updatedData.traits?.includes("brave") || false}
            onChange={(e) => {
              const newTraits = e.target.checked
                ? [...(updatedData.traits || []), "brave"]
                : updatedData.traits.filter((trait) => trait !== "brave");
              setUpdatedData({ ...updatedData, traits: newTraits });
            }}
          />
          Brave
        </label>
        <label>
          <input
            type="checkbox"
            checked={updatedData.traits?.includes("strong") || false}
            onChange={(e) => {
              const newTraits = e.target.checked
                ? [...(updatedData.traits || []), "strong"]
                : updatedData.traits.filter((trait) => trait !== "strong");
              setUpdatedData({ ...updatedData, traits: newTraits });
            }}
          />
          Strong
        </label>
        <label>
          <input
            type="checkbox"
            checked={updatedData.traits?.includes("intelligent") || false}
            onChange={(e) => {
              const newTraits = e.target.checked
                ? [...(updatedData.traits || []), "intelligent"]
                : updatedData.traits.filter((trait) => trait !== "intelligent");
              setUpdatedData({ ...updatedData, traits: newTraits });
            }}
          />
          Intelligent
        </label>
      </fieldset>
      <label>
        Description:
        <textarea
          value={updatedData.description || ""}
          onChange={(e) => setUpdatedData({ ...updatedData, description: e.target.value })}
        />
      </label>
      <label>
        Cost Range:
        <input
          type="text"
          value={updatedData.cost_range || ""}
          onChange={(e) => setUpdatedData({ ...updatedData, cost_range: e.target.value })}
        />
      </label>
      <label>
        Activity:
        <input
          type="text"
          value={updatedData.activity || ""}
          onChange={(e) => setUpdatedData({ ...updatedData, activity: e.target.value })}
        />
      </label>
      <label>
        Allergies:
        <input
          type="text"
          value={updatedData.allergies || ""}
          onChange={(e) => setUpdatedData({ ...updatedData, allergies: e.target.value })}
        />
      </label>
      <label>
        Age:
        <input
          type="text"
          value={updatedData.age || ""}
          onChange={(e) => setUpdatedData({ ...updatedData, age: e.target.value })}
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
              <h2>{editingCommentId ? "Edit Comment" : "Add Comment"}</h2>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your comment here..."
              />
              <div>
                {editingCommentId ? (
                  <button onClick={() => handleUpdateComment(editingCommentId)}>Update</button>
                ) : (
                  <button onClick={handleAddComment}>Submit</button>
                )}
                <button onClick={() => { setShowPopup(false); setEditingCommentId(null); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      <ToastContainer />
    </div>
  );
};

export default DogDetail;
