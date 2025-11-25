// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "../../Frontend/src/theme/ThemeContext";
// Importe o hook de tradução
import { useAccessibility } from "../../Frontend/src/Components/Acessibilidade/AccessibilityContext";

import { Home } from "./Components/Home/Home";
import { Dashboard } from "./Components/DashBoard/Dashboard";
import { Sidebar } from "./Components/Sidebar/Sidebar";
import { Relatorio } from "./Components/Relatorio/Relatorio";
import { CadastroDados } from "../../Frontend/src/Components/CadastroDados/CadastroDados";
import { Acessibilidade } from "../../Frontend/src/Components/Acessibilidade/Acessibilidade";
import { Usuario } from "../../Frontend/src/Components/Usuario/Usuario";
import { Login } from "../../Frontend/src/Components/Login/Login";
import { Registro } from "./Components/Registro/Registro";
import { AlterarSenha } from './Components/AlterarSenha/AlterarSenha';

// Componente para rotas com layout (Sidebar)
function LayoutWithSidebar() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-[80px] p-4 bg-[var(--surface)] text-[var(--text)]">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/relatorios" element={<Relatorio />} />
          <Route path="/cadastrodados" element={<CadastroDados />} />
          <Route path="/acessibilidade" element={<Acessibilidade />} />
          <Route path="/usuario" element={<Usuario />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Redireciona a rota raiz "/" para "/login" */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/alterar-senha" element={<AlterarSenha />} />
          {/* Rotas com Sidebar */}
          <Route path="/*" element={<LayoutWithSidebar />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;