import { useEffect, useState } from 'react';
import api from '../services/axios';
import '../Styles/Roles.css';  // we'll put styling here

const Roles = () => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    api.get('/roles').then((res) => setRoles(res.data));
  }, []);

  return (
    <div className="roles-container">
      <h2>Roles</h2>
      <table>
        <thead>
          <tr>
            <th>Role Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.role_id}>
              <td>{r.role_name}</td>
              <td>{r.description || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Roles;
