import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://samrt-windowblind.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function SmartBlindControl() {
  const [blindData, setBlindData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('auto');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/blinds');
      setBlindData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const sendCommand = async (command) => {
    setMessage(`Sending ${command} command...`);
    try {
      const response = await api.post('/blinds/control', { command });
      console.log(`Command ${command} sent successfully`);
      
      if (command === 'auto' || command === 'manual') {
        setMode(command);
        setMessage(`System switched to ${command} mode`);
      } else if (command === 'open' || command === 'close') {
        setStatus(command === 'open' ? 'opening' : 'closing');
        setMessage(`Blinds are ${command === 'open' ? 'opening' : 'closing'}...`);
        
        // Simulate a delay for the blind operation
        setTimeout(() => {
          setStatus(command === 'open' ? 'opened' : 'closed');
          setMessage(`Blinds are ${command === 'open' ? 'opened' : 'closed'}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending command:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Smart Blind Control</h1>
      <div className="mb-4">
        <button 
          onClick={() => sendCommand('open')} 
          className="btn btn-primary me-2"
          disabled={mode === 'auto'}
        >
          Open Blinds
        </button>
        <button 
          onClick={() => sendCommand('close')} 
          className="btn btn-primary me-2"
          disabled={mode === 'auto'}
        >
          Close Blinds
        </button>
        <button
          onClick={() => sendCommand(mode === 'auto' ? 'manual' : 'auto')}
          className={`btn me-2 ${mode === 'auto' ? 'btn-success' : 'btn-danger'}`}
        >
          {mode === 'auto' ? 'Switch to Manual' : 'Switch to Auto'}
        </button>
        <button onClick={fetchData} className="btn btn-secondary">
          Refresh Data
        </button>
      </div>
      <div className="alert alert-info" role="alert">
        {message}
      </div>
      <div className="mb-4">
        <strong>Current Mode:</strong> {mode.charAt(0).toUpperCase() + mode.slice(1)}
        {mode === 'manual' && (
          <span> | <strong>Blind Status:</strong> {status.charAt(0).toUpperCase() + status.slice(1)}</span>
        )}
      </div>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-light">
            <tr>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Humidity</th>
              <th>Light Level</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center">Loading...</td>
              </tr>
            ) : (
              blindData.map((data, index) => (
                <tr key={index}>
                  <td>{new Date(data.timestamp).toLocaleString()}</td>
                  <td>{data.status}</td>
                  <td>{data.humidity}%</td>
                  <td>{data.light_level}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}