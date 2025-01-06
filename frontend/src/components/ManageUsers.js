import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get("http://localhost:5000/user");
        const dogsResponse = await axios.get("http://localhost:5000/dogs");
        const reportsResponse = await axios.get("http://localhost:5000/reports");

        setUsers(usersResponse.data);
        setDogs(dogsResponse.data);
        setReports(reportsResponse.data);
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
    // Implementacja banowania użytkownika
  };

  const handleUnbanUser = async (userId) => {
    // Implementacja odbanowywania użytkownika
  };

  const handleDeleteUser = async (userId) => {
    // Implementacja usuwania użytkownika
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

      {/* Nowa sekcja New/Updated Dogs */}
      <div className="section-container">
        <h2>New/Updated Dogs</h2>
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

      {/* Nowa sekcja Reports */}
      <div className="section-container">
        <h2>Reports</h2>
        <table className="users-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>User ID</th>
              <th>Content</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.map((report) => (
                <tr key={report.report_id}>
                  <td>{report.report_id}</td>
                  <td>{report.user_id}</td>
                  <td>{report.content}</td>
                  <td>{report.date}</td>
                  <td>{report.status}</td>
                  <td>
                    <button className="resolve-button">Resolve</button>
                    <button className="delete-button">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No reports found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
