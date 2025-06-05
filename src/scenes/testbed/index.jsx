import React, { useEffect, useState } from "react";

const URL = "https://bemfabe.vercel.app/api/v1";

const Testbed = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${URL}/pengurus`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => setData({ error: err.message }));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Pengurus Endpoint Response</h2>
      <pre
        style={{
          background: "#222",
          color: "#fff",
          padding: 16,
          borderRadius: 8,
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default Testbed;
