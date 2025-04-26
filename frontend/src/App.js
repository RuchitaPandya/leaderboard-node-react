import React, { useEffect, useState } from 'react';
import './Leaderboard.css';
import { toast, ToastContainer } from 'react-toastify';  // ✅ Import toast
import 'react-toastify/dist/ReactToastify.css';
export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('');
  const [searchId, setSearchId] = useState('');

  const fetchLeaderboard = async () => {
    const res = await fetch(`http://localhost:5000/api/leaderboard?filter=${filter}`);
    const data = await res.json();
    setLeaderboard(data);
  };

  const searchUser = async () => {
    if (!searchId) return fetchLeaderboard();
    const res = await fetch(`http://localhost:5000/api/leaderboard/search/${searchId}?filter=${filter}`);
    const data = await res.json();
    // if (data.length > 0) setLeaderboard([data[0], ...leaderboard.filter(u => u.id !== data[0].id)]);
    if (data.length > 0) {
      setLeaderboard([data[0]]);
    }
    else {
      toast.error('User not found!', { position: 'top-right', autoClose: 3000 });
      setLeaderboard([]);
    }
  };

  const handleRecalculate = async () => {
    await fetch('http://localhost:5000/api/leaderboard/recalculate', { method: 'POST' });
    fetchLeaderboard();
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  return (
    <div className="leaderboard-container">
      <ToastContainer />
      <h1 className="animated-title">Leaderboard</h1>

      <div className="controls">
        <input
          placeholder="Search by User ID"
          onChange={e => setSearchId(e.target.value)}
        />
        <button onClick={searchUser}>Search</button>

        <select onChange={e => setFilter(e.target.value)}>
          <option value="all">Filter By</option>
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>

        <button onClick={handleRecalculate}>Recalculate</button>
      </div>

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Points</th>
            <th>Rank</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard
            .sort((a, b) => b.total_points - a.total_points) // Sort descending by points
            .map((user, idx, arr) => {
              let rank = idx + 1;
              if (idx > 0 && user.total_points === arr[idx - 1].total_points) {
                rank = arr[idx - 1].rank; // Same points → same rank
              }
              user.rank = rank; // Store calculated rank for next iteration
              return (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.full_name}</td>
                  <td>{user.total_points}</td>
                  <td>#{rank}</td>
                </tr>
              );
            })}
        </tbody>

      </table>
    </div>
  );

}
