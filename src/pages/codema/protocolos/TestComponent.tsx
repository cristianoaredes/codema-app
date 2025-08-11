import React from 'react';

export default function TestComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Component - Protocolos Page is Loading!</h1>
      <p>If you can see this message, the routing is working correctly.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}