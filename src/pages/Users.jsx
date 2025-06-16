import { useEffect, useState } from 'react';
import api from '../services/axios';
import '../Styles/Users.css'; // Import custom styles

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users').then((res) => setUsers(res.data));
  }, []);

  return (
    <div className="users-container">
      <h2 className="users-title">Users</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role Name</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id}>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.role_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
