'use client';

export default function DebugPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Debug Information</h1>
      <div style={{ background: '#f0f0f0', padding: '20px', marginTop: '20px' }}>
        <h2>Environment Variables:</h2>
        <p><strong>NEXT_PUBLIC_API_URL:</strong> {apiUrl || 'NOT SET'}</p>
        <p><strong>Constructed API URL:</strong> {`${apiUrl || 'http://localhost:8000'}/api`}</p>
      </div>

      <div style={{ background: '#fff3cd', padding: '20px', marginTop: '20px' }}>
        <h2>Expected Values:</h2>
        <p><strong>Should be:</strong> https://seo-geo-optimizer-api.onrender.com</p>
        <p><strong>Full API path should be:</strong> https://seo-geo-optimizer-api.onrender.com/api</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Test Backend Connection:</h2>
        <button
          onClick={async () => {
            const url = `${apiUrl || 'http://localhost:8000'}/api/content/tones`;
            console.log('Fetching from:', url);
            try {
              const response = await fetch(url);
              const data = await response.json();
              alert(`Success! Got ${data.tones?.length || 0} tones from backend`);
              console.log('Response:', data);
            } catch (error) {
              alert(`Error: ${error}`);
              console.error('Error:', error);
            }
          }}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test API Connection
        </button>
      </div>
    </div>
  );
}
