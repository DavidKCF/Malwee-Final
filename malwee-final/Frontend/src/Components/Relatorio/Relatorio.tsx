import React, { useState, useEffect, useMemo, ChangeEvent } from "react";
import {
  ButtonBase,
  InputBase,
  CheckboxBase,
  LabelBase,
  DateTimePicker,
  Combobox,
} from "@mlw-packages/react-components";

import { useAccessibility } from "../Acessibilidade/AccessibilityContext";
import { useProducaoData } from "../../hooks/useProducaoData";

// Interface para o estado dos filtros
interface Filters {
  startDate: string;
  endDate: string;
  maquina: string;
  tipoTecido: string;
  tarefaCompleta: string;
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
    search: "",
  });

  // Estado para as opções dos filtros
  const [maquinaOptions, setMaquinaOptions] = useState<string[]>([]);
  const [tecidoOptions, setTecidoOptions] = useState<number[]>([]);

  // Estado da paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  const items = [
    { label: 'Todos', value: 'all' },
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
  ];
  const [selected, setSelected] = React.useState(items[0].value);

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

  // --- Lógica de Filtro e Paginação ---

  // Memoiza os dados filtrados
  const filteredData = useMemo(() => {
    setCurrentPage(1); // Reseta a página ao aplicar filtros

    return producaoData.filter(item => {
      const s = filters.search.toLowerCase();

      // Filtro de Data Início
      if (filters.startDate) {
        const startDate = new Date(filters.startDate + "T00:00:00");
        const itemDate = new Date(item.Data);
        if (itemDate < startDate) return false;
      }
      // Filtro de Data Fim
      if (filters.endDate) {
        const endDate = new Date(filters.endDate + "T23:59:59");
        const itemDate = new Date(item.Data);
        if (itemDate > endDate) return false;
      }
      // Filtro de Máquina
      if (filters.maquina !== "all" && item.Maquina !== filters.maquina) {
        return false;
      }
      // Filtro de Tipo Tecido
      if (filters.tipoTecido !== "all" && item.TipoTecido !== parseInt(filters.tipoTecido, 10)) {
        return false;
      }
      // Filtro de Tarefa Completa
      if (filters.tarefaCompleta !== "all") {
        if (item.TarefaCompleta !== (filters.tarefaCompleta === "true")) return false;
      }

      // Filtro de Pesquisa (search)
      if (s) {
        const searchString = [
          item.Maquina,
          item.NumeroTarefa.toString(),
          item.TipoTecido.toString(),
          item.MetrosProduzidos.toString()
        ].join(' ').toLowerCase();

        if (!searchString.includes(s)) return false;
      }

      return true;
    });
  }, [producaoData, filters]);

  const { paginatedData, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const total = Math.ceil(filteredData.length / itemsPerPage);

    return {
      paginatedData: filteredData.slice(startIndex, endIndex),
      totalPages: total > 0 ? total : 1,
    };
  }, [filteredData, currentPage, itemsPerPage]);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler para limpar os filtros
  const handleClearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      maquina: "all",
      tipoTecido: "all",
      tarefaCompleta: "all",
      search: "",
    });
    setCurrentPage(1);
  };

  // Handler para mudança na pesquisa
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value,
    }));
  };

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
      t('setupTime'), t('productionTime'), t('metersProduced'), t('complete')
    ].join('\t');

    const tsvRows = filteredData.map(item => [
      new Date(item.Data).toLocaleString('pt-BR'),
      item.Maquina || "-",
      item.TipoTecido,
      item.NumeroTarefa,
      item.TempoSetup,
      item.TempoProducao,
      item.MetrosProduzidos,
      item.TarefaCompleta ? t('yes') : t('no')
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
      t('setupTime'), t('productionTime'), t('metersProduced'), t('complete')
    ];

    const csvRows = filteredData.map(item => [
      `"${new Date(item.Data).toLocaleString('pt-BR')}"`,
      `"${item.Maquina || "-"}"`,
      item.TipoTecido,
      item.NumeroTarefa,
      item.TempoSetup,
      item.TempoProducao,
      item.MetrosProduzidos,
      `"${item.TarefaCompleta ? t('yes') : t('no')}"`
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
      t('setupTime'), t('productionTime'), t('metersProduced'), t('complete')
    ];

    const csvRows = filteredData.map(item => [
      `"${new Date(item.Data).toLocaleString('pt-BR')}"`,
      `"${item.Maquina || "-"}"`,
      item.TipoTecido,
      item.NumeroTarefa,
      item.TempoSetup,
      item.TempoProducao,
      item.MetrosProduzidos,
      `"${item.TarefaCompleta ? t('yes') : t('no')}"`
    ].join(','));

    const csv = [headers.join(','), ...csvRows].join('\n');

    // Para Excel, usamos .xls mas na verdade é CSV com extensão .xls
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
    // Implementação básica de PDF - em produção você pode usar bibliotecas como jsPDF
    const content = `
      ${t('productionReport')}
      
      ${t('date')} | ${t('machine')} | ${t('fabricType')} | ${t('taskNumber')} | ${t('setupTime')} | ${t('productionTime')} | ${t('metersProduced')} | ${t('complete')}
      ${filteredData.map(item =>
      `${new Date(item.Data).toLocaleString('pt-BR')} | ${item.Maquina || "-"} | ${item.TipoTecido} | ${item.NumeroTarefa} | ${item.TempoSetup} | ${item.TempoProducao} | ${item.MetrosProduzidos} | ${item.TarefaCompleta ? t('yes') : t('no')}`
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
    <main className="flex flex-col min-h-screen ml-[80px] bg-[var(--surface)] text-[var(--text)]">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)]">{t('malweeGroup')}</h1>
        <p className="text-[var(--text-muted)] text-lg">{t('dataVisualizationSewing')}</p>
        <p className="mt-3 text-[18px] font-semibold text-[var(--text)]">{t('productionReport')}</p>
      </header>

      {/* Seção de Filtros */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 mb-8 shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-[var(--text)]">{t('searchFilter')}</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("startDate")}
            </LabelBase>
            <DateTimePicker
              placeholder={t("selectDate")}
            />
          </div>
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("endDate")}
            </LabelBase>
            <DateTimePicker
              placeholder={t("selectDate")}
            />
          </div>
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("machine")}
            </LabelBase>
            <InputBase
              label=''
              placeholder={t("machine")}
            />
          </div>

          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("fabricType")}
            </LabelBase>
            <Combobox
              items={items}
              selected={selected}
              onChange={(v) => v !== null && setSelected(v)}
              label=""
              placeholder={t("selectOption")}
              searchPlaceholder={t("searchPlaceholder")}
            />
          </div>
          <div className="flex items-center gap-6 mt-4">
            <LabelBase className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
              <CheckboxBase
                id="terms" data-testid="checkbox-terms" />
              {t("taskComplete")}
            </LabelBase>

            <LabelBase className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
              <CheckboxBase
                id="terms" data-testid="checkbox-terms"
              />
              {t("rollWaste")}
            </LabelBase>

            <ButtonBase
              onClick={handleClearFilters}
              className="bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--text)] px-5 py-2 rounded-lg border border-[var(--border)] transition-colors"
            >
              {t("filter")}
            </ButtonBase>
          </div>
        </form>

        <div className="flex justify-end mt-6 gap-3">

        </div>
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

          <div>
            <input
              type="text"
              placeholder={t('searchTable')}
              value={filters.search}
              onChange={handleSearchChange}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="border-t border-[var(--border)]">
                  <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    {t('loadingData')}
                  </td>
                </tr>
              ) : error ? (
                <tr className="border-t border-[var(--border)]">
                  <td colSpan={8} className="px-4 py-8 text-center text-red-500">
                    {t('error')}: {error}
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr className="border-t border-[var(--border)]">
                  <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-muted)]">
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