import { useEffect, useState } from "react";
import { apiGet } from "./services/api.js";

export default function App() {
  const [status, setStatus] = useState("verificando...");

  useEffect(() => {
    apiGet("/health")
      .then((d) => setStatus(d.status))
      .catch(() => setStatus("indisponível"));
  }, []);

  return (
    <main>
      <h1>Fila Virtual</h1>
      <p>Status da API: {status}</p>
    </main>
  );
}
