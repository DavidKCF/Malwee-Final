import React, { useState } from "react";
import { Footer } from "../Footer/Footer";
import { useAccessibility, toolKeys } from "./AccessibilityContext";

// Componente do Modal (separado para clareza)
const AcessibilityModal: React.FC = () => {
  const { modalContent, setModalContent, t } = useAccessibility();
  const [feedbackText, setFeedbackText] = useState("");

  if (!modalContent) return null;

  const handleOverlayClick = () => setModalContent(null);
  const handleContentClick = (e: React.MouseEvent) => e.stopPropagation();

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Feedback enviado:", feedbackText);
    setFeedbackText("");
    setModalContent(null);
    alert("Feedback enviado com sucesso!");
  };

  return (
    <div className="acessibility-modal-overlay" onClick={handleOverlayClick}>
      <div className="acessibility-modal-content" onClick={handleContentClick}>
        <button
          className="acessibility-modal-close-btn"
          onClick={() => setModalContent(null)}
          aria-label={t("modalClose")}
        >
          <i className="ri-close-line"></i>
        </button>

        {modalContent === "feedback" && (
          <>
            <h2>{t("modalFeedbackTitle")}</h2>
            <p>{t("modalFeedbackText")}</p>
            <form onSubmit={handleFeedbackSubmit}>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={t("modalFeedbackPlaceholder")}
                aria-label={t("modalFeedbackPlaceholder")}
                required
              />
              <button type="submit" className="acessibility-modal-submit-btn">
                {t("modalFeedbackSubmit")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export const Acessibilidade: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    activeTools,
    customContrast,
    setCustomContrast,
    fontSize,
    cursorType,
    setCursorType,
    
    handleToggleTool,
    handleFontSizeIncrease,
    handleFontSizeDecrease,
    handleResetAll,
    handleSendFeedback,
  } = useAccessibility();

  return (
    <main className="flex flex-col min-h-screen ml-[80px] bg-[var(--surface)] text-[var(--text)]">
      {/* HEADER */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)]">Grupo Malwee</h1>
        <p className="text-[var(--text-muted)] text-lg">
          {t("title")}
        </p>
        <p className="mt-3 text-[18px] font-semibold text-[var(--text)]">
          {t("subtitle")}
        </p>
      </header>

      {/* CARD PRINCIPAL */}
      <section className="acessibility-card bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-md">

        {/* Seletores do topo */}
        <div className="flex justify-between items-center mb-6">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "pt-BR" | "en-US")}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            aria-label="Selecionar Idioma"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (American)</option>
          </select>

          <div className="flex gap-4 text-[var(--text-muted)] text-xl">
            <button
              onClick={handleResetAll}
              className="cursor-pointer hover:text-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
              title={t("resetTooltip")}
              aria-label={t("resetTooltip")}
            >
              <i className="ri-refresh-line"></i>
            </button>
          </div>
        </div>

        {/* GRID DE FUNCIONALIDADES - AJUSTADO */}
        <h2 className="text-lg font-semibold mb-4 text-[var(--text)]">
          {t("toolsTitle")}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {toolKeys.map((toolKey) => {
            const label = t(toolKey);
            const isActive = activeTools.includes(toolKey);
            return (
              <button
                key={toolKey}
                onClick={() => handleToggleTool(toolKey)}
                aria-pressed={isActive}
                className={`flex flex-col items-center justify-center p-6 text-center border rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]
                  ${isActive
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--border)] text-[var(--text-muted)]"
                  }
                `}
              >
                <i
                  className={`ri-tools-line text-3xl mb-3 ${isActive ? 'text-white' : 'text-[var(--text)]'}`}
                ></i>
                <p className="text-base font-medium">{label}</p>
              </button>
            );
          })}
        </div>

        {/* BRILHO */}
        <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">Ajuste de Brilho</h3>
        <div className="mb-8">
          <label htmlFor="custom-contrast" className="text-sm text-[var(--text-muted)] mb-2 block">Nível de Brilho</label>
          <input
            id="custom-contrast"
            type="range"
            min="0"
            max="100"
            value={customContrast}
            onChange={(e) => {
              setCustomContrast(Number(e.target.value));
            }}
            className="w-full"
          />
        </div>

        {/* AJUSTES DE TEXTO */}
        <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">{t("contentTitle")}</h3>
        <div className="mb-8">
          <p className="text-sm mb-2 text-[var(--text-muted)]">{t("fontSize")}</p>
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={handleFontSizeDecrease}
              className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--border)] text-[var(--text)]"
              aria-label="Diminuir tamanho da fonte"
            >
              -
            </button>
            <span className="text-sm text-[var(--text)] w-10 text-center" aria-live="polite">{fontSize}px</span>
            <button
              onClick={handleFontSizeIncrease}
              className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--border)] text-[var(--text)]"
              aria-label="Aumentar tamanho da fonte"
            >
              +
            </button>
          </div>
        </div>

        {/* CURSOR */}
        <div className="mb-8">
          <p className="text-sm mb-2 text-[var(--text-muted)]">{t("cursor")}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setCursorType('claro')}
              aria-pressed={cursorType === 'claro'}
              className={`flex-1 py-2 border rounded-lg text-sm transition-colors
                ${cursorType === 'claro' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--border)] text-[var(--text)]'}
              `}
            >
              {t("cursorLight")}
            </button>
            <button
              onClick={() => setCursorType('escuro')}
              aria-pressed={cursorType === 'escuro'}
              className={`flex-1 py-2 border rounded-lg text-sm transition-colors
                ${cursorType === 'escuro' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--border)] text-[var(--text)]'}
              `}
            >
              {t("cursorDark")}
            </button>
          </div>
        </div>

        {/* FOOTER AÇÕES */}
        <div className="flex flex-col gap-3 text-center mt-6">
          <button
            onClick={handleSendFeedback}
            className="w-full py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--border)] text-[var(--text)]"
          >
            {t("btnFeedback")}
          </button>
        </div>

        <Footer />
      </section>

      {/* RENDERIZAÇÃO DO MODAL */}
      <AcessibilityModal />
    </main>
  );
};