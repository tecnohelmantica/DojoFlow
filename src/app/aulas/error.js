"use client";

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Caught by aulas error boundary:", error);
  }, [error]);

  return (
    <div style={{ padding: '50px', background: '#ffebee', color: '#c62828', fontFamily: 'monospace', borderRadius: '10px', margin: '20px' }}>
      <h2 style={{ margin: '0 0 20px 0' }}>An error occurred in Centro de Aulas</h2>
      <p><strong>Message:</strong> {error.message}</p>
      <p><strong>Name:</strong> {error.name}</p>
      <p><strong>Stack:</strong></p>
      <pre style={{ background: '#ffcdd2', padding: '15px', borderRadius: '5px', overflowX: 'auto' }}>
        {error.stack}
      </pre>
      <button 
        onClick={() => reset()}
        style={{ marginTop: '20px', padding: '10px 20px', background: '#c62828', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Try Again
      </button>
    </div>
  );
}
