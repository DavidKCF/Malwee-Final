import React from "react";
import { Link } from "react-router-dom";
import logo from "../../image/logo.png";
import { useTheme } from "../../theme/ThemeContext";
import { useAccessibility } from "../Acessibilidade/AccessibilityContext"; // CAMINHO CORRETO

export const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useAccessibility();

  return (
    <div className="bg-[var(--surface)] text-[var(--text)] transition-colors duration-300">
      <div
        className="group fixed top-0 left-0 h-screen w-[80px] hover:w-[260px] bg-[var(--sidebar)] border-r border-[var(--border)]
                   flex flex-col items-center transition-all duration-300 ease-in-out overflow-hidden z-[1000]"
      >
        {/* Logo */}
        <div className="flex items-center justify-center mt-5 mb-6 w-full">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
        </div>

        {/* Menu */}
        <nav className="flex flex-col w-full gap-2 px-3 group">
          <Link
            to="/home"
            className="flex items-center gap-4 text-[var(--text-muted)] py-3 px-3 rounded-lg 
                       hover:bg-[var(--surface)] hover:text-[var(--accent2)] transition-all duration-300"
          >
            <i className="ri-home-4-line text-[22px] min-w-[40px] flex justify-center"></i>
            <span className="opacity-0 group-hover:opacity-100 text-[15px] text-[var(--text)] transition-opacity duration-300 whitespace-nowrap">
              {t('home')}
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-4 text-[var(--text-muted)] py-3 px-3 rounded-lg 
                       hover:bg-[var(--surface)] hover:text-[var(--accent2)] transition-all duration-300"
          >
            <i className="ri-bar-chart-line text-[22px] min-w-[40px] flex justify-center"></i>
            <span className="opacity-0 group-hover:opacity-100 text-[15px] text-[var(--text)] transition-opacity duration-300 whitespace-nowrap">
              {t('dashboard')}
            </span>
          </Link>

          <Link
            to="/relatorios"
            className="flex items-center gap-4 text-[var(--text-muted)] py-3 px-3 rounded-lg 
                       hover:bg-[var(--surface)] hover:text-[var(--accent2)] transition-all duration-300"
          >
            <i className="ri-book-open-line text-[22px] min-w-[40px] flex justify-center"></i>
            <span className="opacity-0 group-hover:opacity-100 text-[15px] text-[var(--text)] transition-opacity duration-300 whitespace-nowrap">
              {t('reports')}
            </span>
          </Link>

          <Link
            to="/producoes"
            className="flex items-center gap-4 text-[var(--text-muted)] py-3 px-3 rounded-lg 
                       hover:bg-[var(--surface)] hover:text-[var(--accent2)] transition-all duration-300"
          >
            <i className="ri-clipboard-line text-[22px] min-w-[40px] flex justify-center"></i>
            <span className="opacity-0 group-hover:opacity-100 text-[15px] text-[var(--text)] transition-opacity duration-300 whitespace-nowrap">
              {t('productions')}
            </span>
          </Link>

          <Link
            to="/cadastrodados"
            className="flex items-center gap-4 text-[var(--text-muted)] py-3 px-3 rounded-lg 
                       hover:bg-[var(--surface)] hover:text-[var(--accent2)] transition-all duration-300"
          >
            <i className="ri-file-add-line text-[22px] min-w-[40px] flex justify-center"></i>
            <span className="opacity-0 group-hover:opacity-100 text-[15px] text-[var(--text)] transition-opacity duration-300 whitespace-nowrap">
              {t('dataRegistration')}
            </span>
          </Link>

          <Link
            to="/usuario"
            className="flex items-center gap-4 text-[var(--text-muted)] py-3 px-3 rounded-lg 
                       hover:bg-[var(--surface)] hover:text-[var(--accent2)] transition-all duration-300"
          >
            <i className="ri-user-line text-[22px] min-w-[40px] flex justify-center"></i>
            <span className="opacity-0 group-hover:opacity-100 text-[15px] text-[var(--text)] transition-opacity duration-300 whitespace-nowrap">
              {t('user')}
            </span>
          </Link>

          <Link
            to="/acessibilidade"
            className="flex items-center gap-4 text-[var(--text-muted)] py-3 px-3 rounded-lg 
                       hover:bg-[var(--surface)] hover:text-[var(--accent2)] transition-all duration-300"
          >
            <i className="ri-settings-3-line text-[22px] min-w-[40px] flex justify-center"></i>
            <span className="opacity-0 group-hover:opacity-100 text-[15px] text-[var(--text)] transition-opacity duration-300 whitespace-nowrap">
              {t('settings')}
            </span>
          </Link>
        </nav>

        {/* Rodapé */}
        <div className="mt-auto flex flex-col gap-4 px-4 pb-6 text-[var(--text-muted)] text-sm w-full">
          <Link 
          to="/login" 
          className="group flex items-center justify-start gap-3 w-full text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors px-3 py-2">
            <i className="ri-logout-box-r-line text-lg"></i>
            <span className="ml-2 text-[15px] text-[var(--text)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {t('logout')}
            </span>
          </Link>

          {/* Botão alternar tema */}
          <button
            onClick={toggleTheme}
            className="group flex items-center justify-start gap-3 w-full text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors px-3 py-2"
          >
            <i className={`ri-${theme === "light" ? "moon-line" : "sun-line"} text-lg`}></i>
            <span className="ml-2 text-[15px] text-[var(--text)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {t('toggleTheme')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};