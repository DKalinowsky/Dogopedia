import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [dogBreeds, setDogBreeds] = useState([]);
  const [filteredDogs, setFilteredDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get("http://localhost:5000/user");
        const dogsResponse = await axios.get("http://localhost:5000/dogs");

        setUsers(usersResponse.data);
        setDogs(dogsResponse.data);
        setDogBreeds(dogsResponse.data);
        setFilteredDogs(dogsResponse.data);
      } catch (err) {
        setError("Failed to load data.");
        toast.error("Error loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBanUser = async (userId) => {
     try {
      const response = await axios.patch(
        `http://localhost:5000/user/${userId}/ban`
      );
      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === userId ? { ...user, is_banned: true } : user
          )
        );
        toast.success(`User ${userId} has been banned.`);
      }
    } catch (err) {
      console.error("Error banning user:", err);
      setError("Failed to ban user.");
      toast.error("Failed to ban user.");
    }
  };

  const handleUnbanUser = async (userId) => {
     try {
      const response = await axios.patch(
        `http://localhost:5000/user/${userId}/unban`
      );
      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === userId ? { ...user, is_banned: false } : user
          )
        );
        toast.info(`User ${userId} has been unbanned.`);
      }
    } catch (err) {
      console.error("Error unbanning user:", err);
      setError("Failed to unban user.");
      toast.error("Failed to unban user.");
    }
  };

  const handleDeleteUser = async (userId) => {
     try {
      const response = await axios.delete(`http://localhost:5000/user/${userId}`);
      if (response.status === 200) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.user_id !== userId));
        toast.error(`User ${userId} has been deleted.`);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user.");
      toast.error("Failed to delete user.");
    }
  };

  const handleDeleteBreed = async (dogId) => {
    try {
      await axios.delete(`http://localhost:5000/dogs/${dogId}`);
      setDogBreeds(dogBreeds.filter(dog => dog.dog_id !== dogId));
      setFilteredDogs(filteredDogs.filter(dog => dog.dog_id !== dogId));
      toast.success("Breed deleted successfully!");
    } catch (err) {
      console.error("Error deleting breed:", err);
      toast.error("Failed to delete breed.");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="manage-users-container">
      <h2>Manage Users</h2>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Sekcja Użytkowników */}
      <table className="users-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Nickname</th>
            <th>Email</th>
            <th>Role</th>
            <th>Banned</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.customer_nickname}</td>
                <td>{user.email_addr}</td>
                <td>
                  <span>{user.role}</span>
                </td>
                <td>{user.is_banned ? "Yes" : "No"}</td>
                <td>
                  {user.is_banned ? (
                    <button
                      onClick={() => handleUnbanUser(user.user_id)}
                      className="unban-button"
                    >
                      Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBanUser(user.user_id)}
                      className="ban-button"
                    >
                      Ban
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteUser(user.user_id)}
                    className="delete-button"
                  >
                    Delete User
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Sekcja psów */}
      <div className="section-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Dog ID</th>
              <th>Dog Name</th>
              <th>Breed</th>
              <th>Size</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dogs.length > 0 ? (
              dogs.map((dog) => (
                <tr key={dog.dog_id}>
                  <td>{dog.dog_id}</td>
                  <td>{dog.name}</td>
                  <td>{dog.breed}</td>
                  <td>{dog.size}</td>
                  <td>{dog.status}</td>
                  <td>
                    <button className="update-button">Update</button>
                    <button className="delete-button">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No dogs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="breed-delete">
      <h2>Dana rasa wymarła?</h2>
        <button onClick={() => setShowDeletePopup(true)} className="delete-breed-button">
          Usuń ją teraz
        </button>
        </div>

      {/* Popup do usuwania rasy */}
      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Wybierz rasę do usunięcia</h3>
            <button onClick={() => setShowDeletePopup(false)} className="close-popup-button">
              Zamknij
            </button>
            <input
              type="text"
              placeholder="Szukaj po rasie"
              onChange={(e) => {
                const query = e.target.value.toLowerCase();
                setFilteredDogs(dogBreeds.filter(dog => dog.race.toLowerCase().includes(query)));
              }}
            />
            <table className="dog-breed-table">
              <thead>
                <tr>
                  <th>Dog ID</th>
                  <th>Breed Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDogs.map((dog) => (
                  <tr key={dog.dog_id}>
                    <td>{dog.dog_id}</td>
                    <td>{dog.race}</td>
                    <td>
                      <button onClick={() => handleDeleteBreed(dog.dog_id)} className="delete-button">
                        Usuń
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
