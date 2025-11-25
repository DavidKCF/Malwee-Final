import React, { useState } from "react";
import { Footer } from "../Footer/Footer";
import { useAccessibility, toolKeys } from "./AccessibilityContext";
import {
  ButtonBase,
  InputBase,
  LabelBase,
  Combobox,
  ModalBase,
  ModalTriggerBase,
  ModalContentBase,
  ModalTitleBase,
  ModalDescriptionBase,
  ModalFooterBase,
} from '@mlw-packages/react-components';
import { useTheme } from "../../theme/ThemeContext";

const AcessibilityModal: React.FC = () => {
  const { modalContent, setModalContent, t } = useAccessibility();
  const [feedbackText, setFeedbackText] = useState("");

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Feedback enviado:", feedbackText);
    setFeedbackText("");
    setModalContent(null);
    alert("Feedback enviado com sucesso!");
  };

  return (
    <ModalBase open={modalContent === "feedback"} onOpenChange={() => setModalContent(null)}>
      <ModalContentBase>
        <ModalTitleBase>{t("modalFeedbackTitle")}</ModalTitleBase>
        <ModalDescriptionBase>
          {t("modalFeedbackText")}
        </ModalDescriptionBase>

        <form onSubmit={handleFeedbackSubmit}>
          <div className="mb-4">
            <LabelBase htmlFor="feedback-textarea">
              {t("modalFeedbackPlaceholder")}
            </LabelBase>
            <textarea
              id="feedback-textarea"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={t("modalFeedbackPlaceholder")}
              className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
              rows={4}
            />
          </div>

          <ModalFooterBase>
            <ButtonBase
              type="button"
              variant="secondary"
              onClick={() => setModalContent(null)}
            >
              {t("cancel")}
            </ButtonBase>
            <ButtonBase type="submit">
              {t("modalFeedbackSubmit")}
            </ButtonBase>
          </ModalFooterBase>
        </form>
      </ModalContentBase>
    </ModalBase>
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
    handleToggleTool,
    handleFontSizeIncrease,
    handleFontSizeDecrease,
    handleResetAll,
    handleSendFeedback,
  } = useAccessibility();

  const { theme, toggleTheme } = useTheme();

  // Opções para o Combobox de idioma
  const languageOptions = [
    { value: "pt-BR", label: "Português (Brasil)" },
    { value: "en-US", label: "English (American)" }
  ];

  return (
    <main className="flex flex-col min-h-screen md:ml-[80px] ml-0 bg-[var(--surface)] text-[var(--text)] px-4 overflow-x-hidden">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)]">{t("malweeGroup")}</h1>
        <p className="text-[var(--text-muted)] text-lg">
          {t("title")}
        </p>
        <p className="mt-3 text-[18px] font-semibold text-[var(--text)]">
          {t("subtitle")}
        </p>
      </header>

      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1 max-w-[200px]">
            <LabelBase htmlFor="language-combobox" className="sr-only">
              {t("selectLanguage")}
            </LabelBase>
            <Combobox
              items={languageOptions}
              selected={language}
              onChange={(value) => value !== null && setLanguage(value as "pt-BR" | "en-US")}
              label=""
              placeholder={t("selectLanguage")}
              searchPlaceholder={t("searchPlaceholder")}
            />
          </div>

          <div className="flex gap-4">
            <ButtonBase
              variant="ghost"
              size="icon"
              onClick={handleResetAll}
              title={t("resetTooltip")}
              aria-label={t("resetTooltip")}
            >
              <i className="ri-refresh-line text-xl"></i>
            </ButtonBase>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4 text-[var(--text)]">
          {t("toolsTitle")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {toolKeys.map((toolKey) => {
            const label = t(toolKey);
            const isActive = activeTools.includes(toolKey);
            return (
              <ButtonBase
                key={toolKey}
                onClick={() => handleToggleTool(toolKey)}
                variant={isActive ? "default" : "outline"}
                className={`flex flex-col items-center justify-center p-6 h-auto min-h-[120px] ${
                  isActive
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)]"
                }`}
                aria-pressed={isActive}
              >
                <i
                  className={`ri-tools-line text-3xl mb-3 ${
                    isActive ? 'text-white' : 'text-[var(--text)]'
                  }`}
                ></i>
                <p className="text-base font-medium">{label}</p>
              </ButtonBase>
            );
          })}
        </div>

        <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">{t('adjustbrightness')}</h3>
        <div className="mb-8">
          <div className="flex flex-col gap-2">
            <LabelBase htmlFor="contrast-slider" className="text-sm text-[var(--text-muted)]">
              {t("brightnesslevel")}: {customContrast}%
            </LabelBase>
            <InputBase
              id="contrast-slider"
              type="range"
              min={0}
              max={100}
              value={customContrast}
              onChange={(e) => setCustomContrast(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="text-sm text-[var(--text-muted)] mt-2">
            {customContrast >= 80 && t("highContrastLight")}
            {customContrast <= 20 && t("highContrastDark")}
            {customContrast === 50 && t("normalContrast")}
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">{t("contentTitle")}</h3>
        <div className="mb-8">
          <LabelBase htmlFor="font-size-control" className="text-sm mb-2 text-[var(--text-muted)] block">
            {t("fontSize")}
          </LabelBase>
          <div className="flex items-center gap-3" id="font-size-control">
            <ButtonBase
              variant="outline"
              size="icon"
              onClick={handleFontSizeDecrease}
              aria-label={t("decreaseFontSize")}
            >
              -
            </ButtonBase>
            <span className="text-sm text-[var(--text)] w-10 text-center" aria-live="polite">
              {fontSize}px
            </span>
            <ButtonBase
              variant="outline"
              size="icon"
              onClick={handleFontSizeIncrease}
              aria-label={t("increaseFontSize")}
            >
              +
            </ButtonBase>
          </div>
        </div>

        {/* Botões de Tema */}
        <div className="mb-8">
          <LabelBase className="text-sm mb-2 text-[var(--text-muted)] block">
            {t("theme")}
          </LabelBase>
          <div className="flex gap-3">
            <ButtonBase
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => theme !== "light" && toggleTheme()}
              className="flex items-center justify-center gap-2 flex-1"
            >
              <i className="ri-sun-line text-[18px]"></i>
              <span>{t("lightTheme")}</span>
            </ButtonBase>

            <ButtonBase
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => theme !== "dark" && toggleTheme()}
              className="flex items-center justify-center gap-2 flex-1"
            >
              <i className="ri-moon-line text-[18px]"></i>
              <span>{t("darkTheme")}</span>
            </ButtonBase>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-center mt-6">
          <ModalBase>
            <ModalTriggerBase asChild>
              <ButtonBase variant="outline" className="w-full">
                {t("btnFeedback")}
              </ButtonBase>
            </ModalTriggerBase>

            <ModalContentBase>
              <ModalTitleBase>{t("modalFeedbackTitle")}</ModalTitleBase>
              <ModalDescriptionBase>
                {t("modalFeedbackText")}
              </ModalDescriptionBase>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const feedback = formData.get('feedback') as string;
                console.log("Feedback enviado:", feedback);
                alert(t("feedbackSuccess"));
                e.currentTarget.reset();
              }}>
                <div className="mb-4">
                  <LabelBase htmlFor="feedback-text">
                    {t("modalFeedbackPlaceholder")}
                  </LabelBase>
                  <textarea
                    id="feedback-text"
                    name="feedback"
                    placeholder={t("modalFeedbackPlaceholder")}
                    className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    required
                    rows={4}
                  />
                </div>

                <ModalFooterBase>
                  <ModalTriggerBase asChild>
                    <ButtonBase type="button" variant="secondary">
                      {t("cancel")}
                    </ButtonBase>
                  </ModalTriggerBase>
                  <ButtonBase type="submit">
                    {t("modalFeedbackSubmit")}
                  </ButtonBase>
                </ModalFooterBase>
              </form>
            </ModalContentBase>
          </ModalBase>
        </div>

        <Footer />
      </section>

      <AcessibilityModal />
    </main>
  );
};