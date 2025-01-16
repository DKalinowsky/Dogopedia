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
  const [awaitingRequests, setAwaitingRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get("http://localhost:5000/user");
        const dogsResponse = await axios.get("http://localhost:5000/dogs");
        const awaitingResponse = await axios.get("http://localhost:5000/awaiting");

        setUsers(usersResponse.data);
        setDogs(dogsResponse.data);
        setDogBreeds(dogsResponse.data);
        setFilteredDogs(dogsResponse.data);
        setAwaitingRequests(awaitingResponse.data);
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

  const handleApproveRequest = async (requestId, dogId, requestData) => {
    try {
      // Update dog breed with all the new data from the request
      const response = await axios.put(`http://localhost:5000/dog/${dogId}`, requestData);

      if (response.status === 200) {
        // Successfully updated breed, now delete the request
        await axios.delete(`http://localhost:5000/awaiting/${requestId}`);
        setAwaitingRequests(awaitingRequests.filter(req => req.request_id !== requestId));
        toast.success("Request approved and breed updated.");
      }
    } catch (err) {
      console.error("Error approving request:", err);
      toast.error("Failed to approve request.");
    }
  };


  const handleDeleteRequest = async (requestId) => {
    try {
      await axios.delete(`http://localhost:5000/awaiting/${requestId}`);
      setAwaitingRequests(awaitingRequests.filter(req => req.request_id !== requestId));
      toast.success("Request deleted successfully!");
    } catch (err) {
      console.error("Error deleting request:", err);
      toast.error("Failed to delete request.");
    }
  };

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

       {/* Sekcja próśb o zmiany */}
      <div className="section-container">
       <table className="users-table">
        <thead>
          <tr>
            <th>Race</th>
            <th>Size</th>
            <th>Category</th>
            <th>Traits</th>
            <th>Allergies</th>
            <th>Age</th>
            <th>Description</th>
            <th>Cost Range</th>
            <th>Activity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {awaitingRequests.length > 0 ? (
            awaitingRequests.map((req) => (
              <tr key={req.request_id}>
                <td>{req.new_race}</td>
                <td>{req.new_size}</td>
                <td>{req.new_category}</td>
                <td>{req.new_traits}</td>
                <td>{req.new_allergies}</td>
                <td>{req.new_age}</td>
                <td>{req.new_description}</td>
                <td>{req.new_cost_range}</td>
                <td>{req.new_activity}</td>
                <td>
                  <button
                    className="approve-button"
                    onClick={() => handleApproveRequest(req.request_id, req.dog_id, {
                      race: req.new_race,
                      size: req.new_size,
                      category: req.new_category,
                      traits: req.new_traits,
                      allergies: req.new_allergies,
                      age: req.new_age,
                      description: req.new_description,
                      cost_range: req.new_cost_range,
                      activity: req.new_activity,
                    })}
                  >
                    Approve
                  </button>
                  <button className="delete-button" onClick={() => handleDeleteRequest(req.request_id)}>
                    Reject
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">No pending requests.</td>
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
