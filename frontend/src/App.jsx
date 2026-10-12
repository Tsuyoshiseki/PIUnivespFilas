import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import RequireRole from "./components/RequireRole.jsx";
import EntrarNaFila from "./pages/EntrarNaFila.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import MinhaSenha from "./pages/MinhaSenha.jsx";
import NaoEncontrada from "./pages/NaoEncontrada.jsx";
import PainelAdmin from "./pages/PainelAdmin.jsx";
import PainelAtendente from "./pages/PainelAtendente.jsx";
import SemPermissao from "./pages/SemPermissao.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Públicas (cliente, sem login) */}
        <Route path="/" element={<Home />} />
        <Route path="/entrar" element={<EntrarNaFila />} />
        <Route path="/senha/:codigo" element={<MinhaSenha />} />

        {/* Funcionários */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/atendente"
          element={
            <RequireRole perfis={["ATENDENTE", "ADMIN"]}>
              <PainelAtendente />
            </RequireRole>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireRole perfis={["ADMIN"]}>
              <PainelAdmin />
            </RequireRole>
          }
        />

        <Route path="/sem-permissao" element={<SemPermissao />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  );
}
