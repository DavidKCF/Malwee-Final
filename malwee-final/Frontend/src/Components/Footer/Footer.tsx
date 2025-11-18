import React from "react";
import { useAccessibility } from "../Acessibilidade/AccessibilityContext";

export const Footer: React.FC = () => {
  const { t } = useAccessibility();

  return (
    <footer className="text-center text-gray-400 text-sm mt-12 py-6 border-t border-[var(--border)]">
      {t('footerCopyright')}
    </footer>
  );
};