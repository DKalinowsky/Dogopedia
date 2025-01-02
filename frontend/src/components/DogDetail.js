import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./DogDetail.css";

const DogDetail = () => {
  const { dogId } = useParams();
  const [breed, setBreed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteError, setFavoriteError] = useState(null);
  const [comments, setComments] = useState({ forum: [], care: [], fun: [] });
  const [activeTab, setActiveTab] = useState("forum");
  const [showAddCommentPopup, setShowAddCommentPopup] = useState(false);
  const [showUpdateInfoPopup, setShowUpdateInfoPopup] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [updatedInfo, setUpdatedInfo] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const breedResponse = await axios.get("http://localhost:5000/dogs");
        const breedData = breedResponse.data.find(
          (dog) => dog.dog_id === parseInt(dogId)
        );
        if (!breedData) throw new Error("Breed not found");

        setBreed(breedData);

        const commentsResponse = await axios.get(
          `http://localhost:5000/comments/${dogId}`
        );
        setComments(commentsResponse.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dogId]);

  const handleFavoriteClick = async () => {
    try {
      if (isFavorite) {
        await axios.delete("http://localhost:5000/user/favorites/remove", {
          data: { dog_id: breed.dog_id },
        });
        setIsFavorite(false);
        toast.success(`${breed.race} has been removed from your favorites!`);
      } else {
        await axios.post("http://localhost:5000/user/favorites/add", {
          dog_id: breed.dog_id,
        });
        setIsFavorite(true);
        toast.success(`${breed.race} has been added to your favorites!`);
      }
    } catch (err) {
      setFavoriteError(err.response?.data?.error || "Error updating favorites");
      toast.error("There was an error updating favorites.");
    }
  };

  const handleAddComment = async () => {
    try {
      await axios.post(`http://localhost:5000/comments/add`, {
        dog_id: dogId,
        category: activeTab,
        comment: newComment,
      });
      setComments((prev) => ({
        ...prev,
        [activeTab]: [...prev[activeTab], newComment],
      }));
      setNewComment("");
      setShowAddCommentPopup(false);
      toast.success("Comment added successfully!");
    } catch (err) {
      toast.error("Failed to add comment.");
    }
  };

  const handleUpdateInfo = async () => {
    try {
      await axios.post("http://localhost:5000/dogs/update", {
        dog_id: dogId,
        ...updatedInfo,
      });
      toast.success("Update request sent for validation!");
      setShowUpdateInfoPopup(false);
    } catch (err) {
      toast.error("Failed to send update request.");
    }
  };

  const openUpdateInfoPopup = () => {
    setUpdatedInfo(breed); // Wypełnij formularz aktualnymi danymi
    setShowUpdateInfoPopup(true);
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <div className="dog-detail">
      <div className="dog-detail-header">
        <img
          src={breed.image || "default-image-url"}
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

      <button
        className="update-info-button"
        onClick={openUpdateInfoPopup}
      >
        Update Information
      </button>

      {/* Zakładki komentarzy */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "forum" ? "active" : ""}`}
          onClick={() => setActiveTab("forum")}
        >
          Forum Dyskusyjne
        </button>
        <button
          className={`tab ${activeTab === "care" ? "active" : ""}`}
          onClick={() => setActiveTab("care")}
        >
          Pielęgnacja
        </button>
        <button
          className={`tab ${activeTab === "fun" ? "active" : ""}`}
          onClick={() => setActiveTab("fun")}
        >
          Rozrywka
        </button>
      </div>

      <ul className="comments-list">
        {comments[activeTab].map((comment, index) => (
          <li key={index} className="comment-item">
            {comment}
          </li>
        ))}
      </ul>

      <button
        className="add-comment-button"
        onClick={() => setShowAddCommentPopup(true)}
      >
        Add Comment
      </button>

      {showAddCommentPopup && (
        <div className="popup">
          <div className="popup-content">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here..."
            ></textarea>
            <button onClick={handleAddComment}>Submit</button>
            <button onClick={() => setShowAddCommentPopup(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showUpdateInfoPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Update Information</h2>
            <label>
              Race:
              <input
                type="text"
                value={updatedInfo.race}
                onChange={(e) =>
                  setUpdatedInfo((prev) => ({ ...prev, race: e.target.value }))
                }
              />
            </label>
            <label>
              Description:
              <textarea
                value={updatedInfo.description}
                onChange={(e) =>
                  setUpdatedInfo((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              ></textarea>
            </label>
            <label>
              Category:
              <input
                type="text"
                value={updatedInfo.category}
                onChange={(e) =>
                  setUpdatedInfo((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              />
            </label>
            <label>
              Size:
              <input
                type="text"
                value={updatedInfo.size}
                onChange={(e) =>
                  setUpdatedInfo((prev) => ({
                    ...prev,
                    size: e.target.value,
                  }))
                }
              />
            </label>
            <button onClick={handleUpdateInfo}>Submit</button>
            <button onClick={() => setShowUpdateInfoPopup(false)}>Cancel</button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default DogDetail;
