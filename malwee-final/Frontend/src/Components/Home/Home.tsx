import React from "react";
import MalweeLogo from "../../image/logo.png";
import { Footer } from "../Footer/Footer";
import { Graficos } from "../Graficos/Graficos";
import { Link } from "react-router-dom"; 
import { useAccessibility } from "../Acessibilidade/AccessibilityContext"; //Hook de Acessibilidade

export const Home: React.FC = () => {
  const { t } = useAccessibility(); //Retorna os textos traduzidos 

  return (
    <main className="flex flex-col min-h-screen ml-[80px] bg-[var(--surface)] text-[var(--text)]">
      <header className="mb-8">
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)]">{t('malweeGroup')}</h1>
            <p className="text-[var(--text-muted)] text-lg">
              {t('dataVisualization')}
            </p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          <Link
            to="/dashboard"
            className="relative bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden flex flex-col items-center justify-center py-4 text-center text-[var(--text)] shadow-lg hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(20,255,200,0.25)] transition-all no-underline">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-[#55AF7D]"></div>
            <span className="mt-1 font-medium text-sm">{t('dashboard')}</span>
            <i className="ri-building-2-line text-2xl mt-2 text-emerald-300"></i>
          </Link>

          <Link
            to="/cadastrodados"
            className="relative bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden flex flex-col items-center justify-center py-4 text-center text-[var(--text)] shadow-lg hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(168,85,247,0.25)] transition-all">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-[#8E68FF]"></div>
            <span className="mt-1 font-medium text-sm">{t('dataRegistration')}</span>
            <i className="ri-database-2-line text-2xl mt-2 text-violet-400"></i>
          </Link>

          <Link
            to="/relatorios"
            className="relative bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden flex flex-col items-center justify-center py-4 text-center text-[var(--text)] shadow-lg hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(59,130,246,0.25)] transition-all">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-[#2273E1]"></div>
            <span className="mt-1 font-medium text-sm">{t('reports')}</span>
            <i className="ri-file-chart-line text-2xl mt-2 text-sky-400"></i>
          </Link>
        </div>

        <a
          href="https://grupomalwee.com.br/"
          target="_blank"
          rel="noopener noreferrer"
          className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-xl flex items-center justify-center gap-6 p-8 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(168,85,247,0.15)] transition-all text-[var(--text)] no-underline"
        >
          <img
            src={MalweeLogo}
            alt={t('malweeLogoAlt')}
            className="w-20 h-20 object-contain"
          />
          <h1 className="text-3xl font-semibold">{t('malweeGroup')}</h1>
        </a>
      </section>

      <Graficos /> 

      <Footer />
    </main>
  );
};