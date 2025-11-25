import React, { useState, useEffect, useMemo } from "react";
import {
  ButtonBase,
  LabelBase,
  DateTimePicker,
  Combobox,
  CheckboxBase,
} from "@mlw-packages/react-components";

import { useAccessibility } from "../Acessibilidade/AccessibilityContext";
import { useProducaoData } from "../../hooks/useProducaoData";

// Interface para o estado dos filtros
interface Filters {
  startDate: string;
  endDate: string;
  maquina: string;
  tipoTecido: string;
  tarefaCompleta: string; // "all", "true", "false"
  sobraRolo: string; // "all", "true", "false"
  tipoSaida: string;
  search: string;
}

// --- Componente Footer ---
export const Footer: React.FC = () => {
  const { t } = useAccessibility();

  return (
    <footer className="mt-8 pt-6 border-t border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
      <p>{t('footerCopyright')}</p>
    </footer>
  );
};

// --- Componente Principal Relatorio ---
export const Relatorio: React.FC = () => {
  const { t } = useAccessibility();

  // Usa o hook para carregar dados automaticamente do CSV
  const { data: producaoData, loading, error } = useProducaoData('/data/data.csv');

  // --- Estados ---
  const [filters, setFilters] = useState<Filters>({
    startDate: "",
    endDate: "",
    maquina: "all",
    tipoTecido: "all",
    tarefaCompleta: "all",
    sobraRolo: "all",
    tipoSaida: "all",
    search: "",
  });

  // Estado para as opções dos filtros
  const [maquinaOptions, setMaquinaOptions] = useState<string[]>([]);
  const [tecidoOptions, setTecidoOptions] = useState<number[]>([]);

  // Estado da paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Opções para os combobox
  const tipoTecidoItems = [
    { label: t('all'), value: 'all' },
    { label: '0 - meia malha', value: '0' },
    { label: '1 - cotton', value: '1' },
    { label: '2 - punho pun', value: '2' },
    { label: '3 - punho new', value: '3' },
    { label: '4 - punho san', value: '4' },
    { label: '5 - punho elan', value: '5' },
  ];

  // Opções para Tipo de Saída
  const tipoSaidaItems = [
    { label: t('all'), value: 'all' },
    { label: '0 - rolinho', value: '0' },
    { label: '1 - fraldado', value: '1' },
  ];

  // --- Efeitos ---

  // Efeito para extrair opções únicas dos dados carregados
  useEffect(() => {
    if (producaoData.length > 0) {
      const maquinas = [...new Set(producaoData.map(item => item.Maquina).filter(Boolean))];
      const tecidos = [...new Set(producaoData.map(item => item.TipoTecido))].sort((a, b) => a - b);

      setMaquinaOptions(maquinas);
      setTecidoOptions(tecidos);
    }
  }, [producaoData]);

  // --- Handlers dos Filtros ---

  const handleStartDateChange = (value: string) => {
    setFilters(prev => ({ ...prev, startDate: value }));
    setCurrentPage(1);
  };

  const handleEndDateChange = (value: string) => {
    setFilters(prev => ({ ...prev, endDate: value }));
    setCurrentPage(1);
  };

  const handleMaquinaChange = (value: string) => {
    setFilters(prev => ({ ...prev, maquina: value }));
    setCurrentPage(1);
  };

  const handleTipoTecidoChange = (value: string | null) => {
    setFilters(prev => ({ ...prev, tipoTecido: value || 'all' }));
    setCurrentPage(1);
  };

  // CORRIGIDO: Handlers para os checkboxes de tarefa completa
  const handleTarefaCompletaSimChange = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      tarefaCompleta: checked ? "true" : (prev.tarefaCompleta === "false" ? "false" : "all")
    }));
    setCurrentPage(1);
  };

  const handleTarefaCompletaNaoChange = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      tarefaCompleta: checked ? "false" : (prev.tarefaCompleta === "true" ? "true" : "all")
    }));
    setCurrentPage(1);
  };

  // CORRIGIDO: Handlers para os checkboxes de sobra rolo
  const handleSobraRoloSimChange = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      sobraRolo: checked ? "true" : (prev.sobraRolo === "false" ? "false" : "all")
    }));
    setCurrentPage(1);
  };

  const handleSobraRoloNaoChange = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      sobraRolo: checked ? "false" : (prev.sobraRolo === "true" ? "true" : "all")
    }));
    setCurrentPage(1);
  };

  const handleTipoSaidaChange = (value: string | null) => {
    setFilters(prev => ({ ...prev, tipoSaida: value || 'all' }));
    setCurrentPage(1);
  };

  // Handler para limpar os filtros
  const handleClearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      maquina: "all",
      tipoTecido: "all",
      tarefaCompleta: "all",
      sobraRolo: "all",
      tipoSaida: "all",
      search: "",
    });
    setCurrentPage(1);
  };

  // Handler para mudança na pesquisa
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value,
    }));
    setCurrentPage(1);
  };

  // --- Lógica de Filtro e Paginação ---

  // Função auxiliar para normalizar datas
  const normalizeDate = (dateString: string): Date => {
    try {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes, seconds] = timePart ? timePart.split(':') : ['00', '00', '00'];

      const normalizedDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds)
      );

      return isNaN(normalizedDate.getTime()) ? new Date(dateString) : normalizedDate;
    } catch {
      return new Date(dateString);
    }
  };

  // Memoiza os dados filtrados
  const filteredData = useMemo(() => {
    if (!producaoData.length) return [];

    return producaoData.filter(item => {
      const searchTerm = filters.search.toLowerCase().trim();

      // Filtro de Data Início
      if (filters.startDate) {
        const startDate = new Date(filters.startDate + "T00:00:00");
        const itemDate = normalizeDate(item.Data);
        if (itemDate < startDate) return false;
      }

      // Filtro de Data Fim
      if (filters.endDate) {
        const endDate = new Date(filters.endDate + "T23:59:59");
        const itemDate = normalizeDate(item.Data);
        if (itemDate > endDate) return false;
      }

      // Filtro de Máquina
      if (filters.maquina !== "all" && item.Maquina !== filters.maquina) {
        return false;
      }

      // Filtro de Tipo Tecido
      if (filters.tipoTecido !== "all") {
        const filterTecido = parseInt(filters.tipoTecido, 10);
        if (item.TipoTecido !== filterTecido) return false;
      }

      // Filtro de Tarefa Completa (checkbox)
      if (filters.tarefaCompleta !== "all") {
        const shouldBeComplete = filters.tarefaCompleta === "true";
        if (item.TarefaCompleta !== shouldBeComplete) return false;
      }

      // Filtro de Sobra de Rolo (checkbox)
      if (filters.sobraRolo !== "all") {
        const shouldHaveSobra = filters.sobraRolo === "true";
        if (item.SobraRolo !== shouldHaveSobra) return false;
      }

      // Filtro de Tipo de Saída
      if (filters.tipoSaida !== "all") {
        const filterTipoSaida = parseInt(filters.tipoSaida, 10);
        if (item.TipoSaida !== filterTipoSaida) return false;
      }

      // Filtro de Pesquisa
      if (searchTerm) {
        const searchableFields = [
          item.Maquina || '',
          item.NumeroTarefa?.toString() || '',
          item.TipoTecido?.toString() || '',
          item.MetrosProduzidos?.toString() || '',
          item.TempoSetup?.toString() || '',
          item.TempoProducao?.toString() || '',
          item.TarefaCompleta ? t('completeTasks') : t('incompleteTasks'),
          item.SobraRolo ? t('withWaste') : t('withoutWaste'),
          item.TipoSaida ? (item.TipoSaida === 0 ? t('rollType') : t('diaperType')) : '',
          new Date(item.Data).toLocaleDateString('pt-BR')
        ].join(' ').toLowerCase();

        if (!searchableFields.includes(searchTerm)) return false;
      }

      return true;
    });
  }, [producaoData, filters, t]);

  const { paginatedData, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const total = Math.ceil(filteredData.length / itemsPerPage);

    return {
      paginatedData: filteredData.slice(startIndex, endIndex),
      totalPages: total > 0 ? total : 1,
    };
  }, [filteredData, currentPage, itemsPerPage]);

  // Handlers de Paginação
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handlers de Exportação
  const handleCopy = () => {
    const headers = [
      t('date'), t('machine'), t('fabricType'), t('taskNumber'),
      t('setupTime'), t('productionTime'), t('metersProduced'), t('complete'),
      t('typeofexit')
    ].join('\t');

    const tsvRows = filteredData.map(item => [
      new Date(item.Data).toLocaleString('pt-BR'),
      item.Maquina || "-",
      item.TipoTecido,
      item.NumeroTarefa,
      item.TempoSetup,
      item.TempoProducao,
      item.MetrosProduzidos,
      item.TarefaCompleta ? t('yes') : t('no'),
      item.TipoSaida === 0 ? t('rollType') : t('diaperType')
    ].join('\t'));

    const tsv = [headers, ...tsvRows].join('\n');

    try {
      navigator.clipboard.writeText(tsv).then(() => {
        console.log(t('copiedToClipboard'));
      }, () => {
        const textArea = document.createElement("textarea");
        textArea.value = tsv;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          console.log(t('copiedFallback'));
        } catch (err) {
          console.error(t('copyFailedFallback'), err);
        }
        document.body.removeChild(textArea);
      });
    } catch (e) {
      console.error(t('copyFailed'), e);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      t('date'), t('machine'), t('fabricType'), t('taskNumber'),
      t('setupTime'), t('productionTime'), t('metersProduced'), t('complete'),
      t('typeofexit')
    ];

    const csvRows = filteredData.map(item => [
      `"${new Date(item.Data).toLocaleString('pt-BR')}"`,
      `"${item.Maquina || "-"}"`,
      item.TipoTecido,
      item.NumeroTarefa,
      item.TempoSetup,
      item.TempoProducao,
      item.MetrosProduzidos,
      `"${item.TarefaCompleta ? t('yes') : t('no')}"`,
      `"${item.TipoSaida === 0 ? t('rollType') : t('diaperType')}"`
    ].join(','));

    const csv = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", t('productionReport') + ".csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    const headers = [
      t('date'), t('machine'), t('fabricType'), t('taskNumber'),
      t('setupTime'), t('productionTime'), t('metersProduced'), t('complete'),
      t('typeofexit')
    ];

    const csvRows = filteredData.map(item => [
      `"${new Date(item.Data).toLocaleString('pt-BR')}"`,
      `"${item.Maquina || "-"}"`,
      item.TipoTecido,
      item.NumeroTarefa,
      item.TempoSetup,
      item.TempoProducao,
      item.MetrosProduzidos,
      `"${item.TarefaCompleta ? t('yes') : t('no')}"`,
      `"${item.TipoSaida === 0 ? t('rollType') : t('diaperType')}"`
    ].join(','));

    const csv = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", t('productionReport') + ".xls");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const content = `
      ${t('productionReport')}
      
      ${t('date')} | ${t('machine')} | ${t('fabricType')} | ${t('taskNumber')} | ${t('setupTime')} | ${t('productionTime')} | ${t('metersProduced')} | ${t('complete')} | ${t('typeofexit')}
      ${filteredData.map(item =>
      `${new Date(item.Data).toLocaleString('pt-BR')} | ${item.Maquina || "-"} | ${item.TipoTecido} | ${item.NumeroTarefa} | ${item.TempoSetup} | ${item.TempoProducao} | ${item.MetrosProduzidos} | ${item.TarefaCompleta ? t('yes') : t('no')} | ${item.TipoSaida === 0 ? t('rollType') : t('diaperType')}`
    ).join('\n')}
    `;

    const blob = new Blob([content], { type: 'application/pdf;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", t('productionReport') + ".pdf");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Renderização ---
  return (
    <main className="flex flex-col min-h-screen md:ml-[80px] ml-0 bg-[var(--surface)] text-[var(--text)] px-4 overflow-x-hidden">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)]">{t('malweeGroup')}</h1>
        <p className="text-[var(--text-muted)] text-lg">{t('dataVisualizationSewing')}</p>
        <p className="mt-3 text-[18px] font-semibold text-[var(--text)]">{t('productionReport')}</p>
      </header>

      {/* Seção de Filtros - CORRIGIDA COM DOIS CHECKBOXES PARA CADA */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 mb-8 shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-[var(--text)]">{t('searchFilter')}</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Data Início */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("startDate")}
            </LabelBase>
            <DateTimePicker
              value={filters.startDate}
              onChange={handleStartDateChange}
              placeholder={t("selectDate")}
            />
          </div>

          {/* Data Fim */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("endDate")}
            </LabelBase>
            <DateTimePicker
              value={filters.endDate}
              onChange={handleEndDateChange}
              placeholder={t("selectDate")}
            />
          </div>

          {/* Máquina */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("machine")}
            </LabelBase>
            <Combobox
              items={[
                { value: "all", label: t('all') },
                ...maquinaOptions.map(maquina => ({
                  value: maquina,
                  label: maquina
                }))
              ]}
              selected={filters.maquina}
              onChange={handleMaquinaChange}
              label=""
              placeholder={t("selectOption")}
              searchPlaceholder={t("searchPlaceholder")}
            />
          </div>

          {/* Tipo de Tecido */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("fabricType")}
            </LabelBase>
            <Combobox
              items={tipoTecidoItems}
              selected={filters.tipoTecido}
              onChange={handleTipoTecidoChange}
              label=""
              placeholder={t("selectOption")}
              searchPlaceholder={t("searchPlaceholder")}
            />
          </div>

          {/* Tarefa Completa - DOIS CHECKBOXES */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("taskComplete")}
            </LabelBase>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckboxBase
                  checked={filters.tarefaCompleta === "true"}
                  onCheckedChange={handleTarefaCompletaSimChange}
                />
                <span className="text-sm text-[var(--text)]">{t('completeTasks')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckboxBase
                  checked={filters.tarefaCompleta === "false"}
                  onCheckedChange={handleTarefaCompletaNaoChange}
                />
                <span className="text-sm text-[var(--text)]">{t('incompleteTasks')}</span>
              </div>
            </div>
          </div>

          {/* Tipo de Saída */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("typeofexit")}
            </LabelBase>
            <Combobox
              items={tipoSaidaItems}
              selected={filters.tipoSaida}
              onChange={handleTipoSaidaChange}
              label=""
              placeholder={t("selectOption")}
              searchPlaceholder={t("searchPlaceholder")}
            />
          </div>

          {/* Sobra de Rolo - DOIS CHECKBOXES */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("rollWaste")}
            </LabelBase>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckboxBase
                  checked={filters.sobraRolo === "true"}
                  onCheckedChange={handleSobraRoloSimChange}
                />
                <span className="text-sm text-[var(--text)]">{t('withWaste')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckboxBase
                  checked={filters.sobraRolo === "false"}
                  onCheckedChange={handleSobraRoloNaoChange}
                />
                <span className="text-sm text-[var(--text)]">{t('withoutWaste')}</span>
              </div>
            </div>
          </div>

          {/* Botão Limpar Filtros */}
          <div className="flex items-end">
            <ButtonBase
              onClick={handleClearFilters}
              className="bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--text)] px-5 py-2 rounded-lg border border-[var(--border)] transition-colors w-full"
            >
              {t("clearFilters")}
            </ButtonBase>
          </div>
        </form>
      </section>

      {/* Seção de Resultados */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-[var(--text)]">{t('searchResults')}</h2>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <ButtonBase
              onClick={handleCopy}
              className="bg-[var(--surface)] hover:bg-[#8E68FF] hover:text-white px-3 py-2 rounded-lg text-sm border border-[var(--border)] transition-colors text-[var(--text)]"
            >
              {t('copy')}
            </ButtonBase>
            <ButtonBase
              onClick={handleExportCSV}
              className="bg-[var(--surface)] hover:bg-[#8E68FF] hover:text-white px-3 py-2 rounded-lg text-sm border border-[var(--border)] transition-colors text-[var(--text)]"
            >
              CSV
            </ButtonBase>
            <ButtonBase
              onClick={handleExportExcel}
              className="bg-[var(--surface)] hover:bg-[#8E68FF] hover:text-white px-3 py-2 rounded-lg text-sm border border-[var(--border)] transition-colors text-[var(--text)]"
            >
              EXCEL
            </ButtonBase>
            <ButtonBase
              onClick={handleExportPDF}
              className="bg-[var(--surface)] hover:bg-[#8E68FF] hover:text-white px-3 py-2 rounded-lg text-sm border border-[var(--border)] transition-colors text-[var(--text)]"
            >
              PDF
            </ButtonBase>
          </div>

        </div>

        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--surface)] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('date')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('machine')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fabricType')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('taskNumber')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('setupTime')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('productionTime')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('metersProduced')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('complete')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('typeofexit')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="border-t border-[var(--border)]">
                  <td colSpan={9} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    {t('loadingData')}
                  </td>
                </tr>
              ) : error ? (
                <tr className="border-t border-[var(--border)]">
                  <td colSpan={9} className="px-4 py-8 text-center text-red-500">
                    {t('error')}: {error}
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr className="border-t border-[var(--border)]">
                  <td colSpan={9} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    {t('noResults')}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={index} className="border-t border-[var(--border)] hover:bg-[var(--surface)]">
                    <td className="px-4 py-3 text-[var(--text)] whitespace-nowrap">
                      {new Date(item.Data).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.Maquina || "-"}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.TipoTecido}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.NumeroTarefa}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.TempoSetup}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.TempoProducao}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.MetrosProduzidos}</td>
                    <td className="px-4 py-3 text-[var(--text)]">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.TarefaCompleta
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {item.TarefaCompleta ? t('yes') : t('no')}
                      </span>
                    </td>
                    {/* Coluna Tipo de Saída */}
                    <td className="px-4 py-3 text-[var(--text)]">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.TipoSaida === 0
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                        }`}>
                        {item.TipoSaida === 0 ? t('rollType') : t('diaperType')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginação */}
        <div className="flex flex-col lg:flex-row justify-between items-center mt-6 text-sm text-[var(--text-muted)] gap-4">
          <p>
            {t('showing')} {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            {' - '}
            {(currentPage - 1) * itemsPerPage + paginatedData.length}
            {' '}{t('of')}{' '}
            {filteredData.length} {t('records')}
          </p>
          <div className="flex gap-2 items-center">
            <ButtonBase
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1 rounded-lg hover:text-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('previous')}
            </ButtonBase>
            <span className="text-[var(--text)]">
              {t('page')} {currentPage} {t('of')} {totalPages}
            </span>
            <ButtonBase
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1 rounded-lg hover:text-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('next')}
            </ButtonBase>
          </div>
        </div>

        <Footer />
      </section>
    </main>
  );
};

export default Relatorio;