import React, { useState } from "react";
import { Footer } from "../Footer/Footer";
import { useAccessibility } from "../Acessibilidade/AccessibilityContext";

// --- Interfaces para os tipos de dados ---

interface FormData {
  espessura: string;
  largura: string;
  tipoMalha: string;
  metragem: string;
  saida: string;
  densidade: string;
  observacoes: string;
}

interface ResumoData {
  areaPorMetro: number;
  volumeTotal: number;
  gastoEstimado: number;
  rendimentoPorPeca: number;
}

// --- Estados Iniciais ---

const initialState: FormData = {
  espessura: "",
  largura: "",
  tipoMalha: "wovenFabric", // Valor padrão do select
  metragem: "",
  saida: "",
  densidade: "",
  observacoes: "",
};

const initialResumo: ResumoData = {
  areaPorMetro: 0,
  volumeTotal: 0,
  gastoEstimado: 0,
  rendimentoPorPeca: 0,
};

// --- Componente Principal ---

export const Producoes: React.FC = () => {
  const { t } = useAccessibility();
  const [formData, setFormData] = useState<FormData>(initialState);
  const [resumo, setResumo] = useState<ResumoData>(initialResumo);

  /**
   * Converte uma string com vírgula (ex: "1,2") para um número (ex: 1.2)
   */
  const parseLocalFloat = (value: string): number => {
    if (!value) return 0;
    // Substitui a vírgula por ponto para conversão
    return parseFloat(value.replace(",", ".")) || 0;
  };

  /**
   * Lidar com mudanças em qualquer input ou select
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Lógica de cálculo principal
   */
  const calcularValores = (): ResumoData => {
    // Converte para números e para metros (onde aplicável)
    const espessura_m = parseLocalFloat(formData.espessura) / 1000; // mm -> m
    const largura_m = parseLocalFloat(formData.largura) / 1000; // mm -> m
    const metragem_val = parseLocalFloat(formData.metragem);
    const saida_val = parseLocalFloat(formData.saida);
    const densidade_val = parseLocalFloat(formData.densidade); // kg/m³

    // 1. Área por metro (m²/m) = (largura em metros)
    const areaPorMetro = largura_m;

    // 2. Volume total (m³) = (metragem × largura × espessura)
    const volumeTotal = metragem_val * largura_m * espessura_m;

    // 3. Gasto estimado (kg) = (volume × densidade)
    const gastoEstimado = volumeTotal * densidade_val;

    // 4. Rendimento por peça (m) = (metragem / saída)
    const rendimentoPorPeca = saida_val > 0 ? metragem_val / saida_val : 0;

    return { areaPorMetro, volumeTotal, gastoEstimado, rendimentoPorPeca };
  };

  /**
   * Botão: Calcular Resumo
   */
  const calcularResumo = () => {
    const valores = calcularValores();
    setResumo(valores);
    console.log("Resumo calculado:", valores);
  };

  /**
   * Botão: Limpar Formulário
   */
  const limparFormulario = () => {
    setFormData(initialState);
    setResumo(initialResumo);
    console.log("Formulário limpo!");
  };

  /**
   * Botão: Exportar CSV
   */
  const exportarDados = () => {
    console.log("Exportando dados para CSV...");
    const valoresCalculados = calcularValores();

    const headers = [
      t('thickness'),
      t('width'),
      t('fabricType'),
      t('meterage'),
      t('output'),
      t('density'),
      t('observations'),
      t('areaPerMeter'),
      t('totalVolume'),
      t('estimatedCost'),
      t('yieldPerPiece'),
    ];

    const data = [
      formData.espessura,
      formData.largura,
      t(formData.tipoMalha as keyof typeof translations["pt-BR"]),
      formData.metragem,
      formData.saida,
      formData.densidade,
      `"${formData.observacoes.replace(/"/g, '""')}"`, // Trata aspas nas observações
      valoresCalculados.areaPorMetro.toFixed(2),
      valoresCalculados.volumeTotal.toFixed(3),
      valoresCalculados.gastoEstimado.toFixed(1),
      valoresCalculados.rendimentoPorPeca.toFixed(2),
    ];

    // Usa ponto e vírgula (;) como separador para compatibilidade com Excel pt-BR
    const csvHeader = headers.join(";") + "\n";
    const csvData = data.join(";");
    const csvString = csvHeader + csvData;

    // Cria e baixa o arquivo
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", t('production') + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex flex-col min-h-screen ml-[80px] bg-[var(--surface)] text-[var(--text)]">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)]">{t('malweeGroup')}</h1>
        <p className="text-[var(--text-muted)] text-lg">
          {t('dataVisualizationSewing')}
        </p>
        <p className="mt-3 text-[18px] font-semibold text-[var(--text)]">
          {t('production')}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD ESQUERDA */}
        <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-[var(--text)]">
            {t('productionInput')}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            {t('fillParameters')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('thickness')}
              placeholder="1,2"
              name="espessura"
              value={formData.espessura}
              onChange={handleChange}
            />
            <Input
              label={t('stripWidth')}
              placeholder="50"
              name="largura"
              value={formData.largura}
              onChange={handleChange}
            />

            <div>
              <label className="text-sm font-medium text-[var(--text)]">
                {t('fabricType')}
              </label>
              <select
                name="tipoMalha"
                value={formData.tipoMalha}
                onChange={handleChange}
                className="mt-2 w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="wovenFabric">{t('wovenFabric')}</option>
                <option value="cottonFabric">{t('cottonFabric')}</option>
                <option value="syntheticFabric">{t('syntheticFabric')}</option>
              </select>
            </div>

            <Input
              label={t('meterage')}
              placeholder="100"
              name="metragem"
              value={formData.metragem}
              onChange={handleChange}
            />
            <Input
              label={t('output')}
              placeholder="200"
              name="saida"
              value={formData.saida}
              onChange={handleChange}
            />
            <Input
              label={t('density')}
              placeholder="900"
              name="densidade"
              value={formData.densidade}
              onChange={handleChange}
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-[var(--text)]">
              {t('observations')}
            </label>
            <input
              type="text"
              placeholder={t('productionNotes')}
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              className="mt-2 w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-end mt-6">
            <button
              onClick={calcularResumo}
              className="px-5 py-2 rounded-lg bg-[var(--accent)] hover:opacity-90 font-medium transition-opacity"
            >
              {t('calculateSummary')}
            </button>

            <button
              onClick={limparFormulario}
              className="px-5 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--text)] border border-[var(--border)] transition-colors"
            >
              {t('clear')}
            </button>

            <button
              onClick={exportarDados}
              className="px-5 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--text)] border border-[var(--border)] transition-colors"
            >
              {t('exportCSV')}
            </button>
          </div>
        </section>

        {/* CARD DIREITA */}
        <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-[var(--text)]">
            {t('summary')}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            {t('quickOverview')}
          </p>

          {/* Valores agora vêm do estado 'resumo' e são formatados */}
          <ResumoBox
            label={t('areaPerMeter')}
            value={resumo.areaPorMetro.toFixed(2)}
            detail={t('areaPerMeterDetail')}
          />
          <ResumoBox
            label={t('totalVolume')}
            value={resumo.volumeTotal.toFixed(3)}
            detail={t('totalVolumeDetail')}
          />
          <ResumoBox
            label={t('estimatedCost')}
            value={resumo.gastoEstimado.toFixed(1)}
            detail={t('estimatedCostDetail')}
          />
          <ResumoBox
            label={t('yieldPerPiece')}
            value={resumo.rendimentoPorPeca.toFixed(2)}
            detail={t('yieldPerPieceDetail')}
          />

          <div className="text-sm text-[var(--text-muted)] mt-6">
            <p>{t('selectedFabricType')}: {t(formData.tipoMalha as keyof typeof translations["pt-BR"]) || "–"}</p>
            <p className="mt-1">{t('observations')}: {formData.observacoes || "–"}</p>
            <p className="mt-4 text-xs">
              {t('calculatedValues')}
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
};

// --- Componente Input (Modificado) ---

interface InputProps {
  label: string;
  placeholder: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  name,
  value,
  onChange,
}) => (
  <div>
    <label className="text-sm font-medium text-[var(--text)]">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-2 w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
    />
  </div>
);

// --- Componente ResumoBox ---

const ResumoBox = ({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) => (
  <div className="bg-[var(--surface)] p-4 rounded-lg border-l-4 border-[var(--accent)] mb-4">
    <h3 className="text-sm font-medium text-[var(--text)]">{label}</h3>
    <p className="text-lg font-bold mt-1 text-[var(--text)]">{value}</p>
    <small className="text-xs text-[var(--text-muted)]">{detail}</small>
  </div>
);

// Traduções auxiliares para o select
const translations = {
  "pt-BR": {
    wovenFabric: "Malha Tecida",
    cottonFabric: "Malha de Algodão",
    syntheticFabric: "Malha Sintética",
  },
  "en-US": {
    wovenFabric: "Woven Fabric",
    cottonFabric: "Cotton Fabric",
    syntheticFabric: "Synthetic Fabric",
  },
};