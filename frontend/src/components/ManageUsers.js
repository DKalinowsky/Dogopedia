import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]); // Lista użytkowników
  const [loading, setLoading] = useState(true); // Status ładowania
  const [error, setError] = useState(null); // Błąd ładowania

  // Pobranie danych użytkowników z backendu
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/user");

        console.log(response.data); // Sprawdzamy odpowiedź backendu

        if (response.status === 200) {
          setUsers(response.data); // Ustawiamy użytkowników w stanie
        } else {
          throw new Error("Failed to fetch users.");
        }
      } catch (err) {
        setError("Failed to load users.");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Tylko raz przy pierwszym renderowaniu komponentu

  // Funkcja do zmiany roli użytkownika
  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/user/${userId}/role`,
        { role: newRole }
      );
      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === userId ? { ...user, role: newRole } : user
          )
        );
      }
    } catch (err) {
      console.error("Error updating role:", err);
      setError("Failed to update role.");
    }
  };

  // Funkcja do banowania użytkownika na 24 godziny
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
      }
    } catch (err) {
      console.error("Error banning user:", err);
      setError("Failed to ban user.");
    }
  };

  // Funkcja do usuwania użytkownika
  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/user/${userId}`);
      if (response.status === 200) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.user_id !== userId));
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user.");
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
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </td>
                <td>{user.is_banned ? "Yes" : "No"}</td>
                <td>
                  {!user.is_banned && (
                    <button onClick={() => handleBanUser(user.user_id)} className="ban-button">
                      Ban for 24h
                    </button>
                  )}
                  <button onClick={() => handleDeleteUser(user.user_id)} className="delete-button">
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
    </div>
  );
};

export default ManageUsers;
