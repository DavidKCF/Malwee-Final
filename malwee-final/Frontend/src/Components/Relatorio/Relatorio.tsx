import React, { useState, useEffect, useMemo, ChangeEvent } from "react";
import {
  ButtonBase,
  InputBase,
  CheckboxBase,
  LabelBase,
  DateTimePicker,
  Combobox,
  ModalBase,
  ModalTriggerBase,
  ModalContentBase,
  ModalTitleBase,
  ModalDescriptionBase,
  ModalFooterBase,
  EditButton,
  VisibilityButton,
  CloseButton,
} from "@mlw-packages/react-components";

import { useAccessibility } from "../Acessibilidade/AccessibilityContext";

interface DataItem {
  data: Date;
  maquina: string;
  tipoTecido: number;
  tipoSaida: number;
  numeroTarefa: number;
  tempoSetup: number;
  tempoProducao: number;
  quantidadeTiras: number;
  metrosProduzidos: number;
  tarefaCompleta: boolean;
  sobraDeRolo: boolean;
}

// Interface para o estado dos filtros
interface Filters {
  startDate: string;
  endDate: string;
  maquina: string;
  tipoTecido: string; // string para "todos"
  tarefaCompleta: string; // string para "todos", "true", "false"
  search: string;
}

// --- Componente Footer (Incluso para ser um arquivo único) ---
export const Footer: React.FC = () => {
  const { t } = useAccessibility();

  return (
    <footer className="mt-8 pt-6 border-t border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
      <p>{t('footerCopyright')}</p>
    </footer>
  );
};

// --- Dados Estáticos do CSV Corrigido ---
const csvDataString = `Data (AAAA-MM-DD HH:MM:SS),Maquina,Tipo Tecido,Tipo de Saida,Numero da tarefa,Tempo de setup,Tempo de Produção,Quantidade de Tiras,Metros Produzidos,Tarefa completa?,Sobra de Rolo?
2025-05-23 05:39:04,CD1,1,0,1,453,166,3,4787,TRUE,FALSE
2025-05-23 05:56:21,CD2,3,1,2,425,224,2,4120,FALSE,FALSE
2025-05-23 05:59:48,CD1,3,1,3,66,129,2,3240,TRUE,FALSE
2025-05-23 06:13:29,CD3,3,1,4,48,129,2,3240,TRUE,FALSE
2025-05-23 06:15:28,CD2,3,1,5,90,14,2,320,FALSE,FALSE
2025-05-23 06:37:00,CD1,3,1,6,644,214,1,2160,TRUE,FALSE
2025-05-23 06:43:33,CD4,3,1,7,250,132,1,1630,FALSE,FALSE
2025-05-23 06:50:09,CD3,3,1,8,252,143,1,1630,TRUE,FALSE
2025-05-23 06:56:39,CD2,3,1,9,240,146,1,1630,TRUE,FALSE
2025-05-23 07:01:21,CD1,3,1,10,140,144,1,1630,TRUE,FALSE
2025-05-23 07:05:32,CD4,3,1,11,118,15,1,160,TRUE,FALSE
2025-05-23 07:22:12,CD3,1,0,12,654,166,3,4787,TRUE,FALSE
2025-05-23 07:27:07,CD2,1,0,13,115,160,3,4787,TRUE,FALSE
2025-05-23 07:33:31,CD1,1,0,14,214,161,3,4787,TRUE,FALSE
2025-05-23 07:38:22,CD4,1,0,15,123,161,3,4787,TRUE,FALSE
2025-05-23 07:43:18,CD3,1,0,16,115,162,3,4787,TRUE,FALSE
2025-05-23 07:48:47,CD2,1,0,17,162,166,3,4787,TRUE,FALSE
2025-05-23 07:54:15,CD1,1,0,18,159,161,3,4787,TRUE,FALSE
2025-05-23 07:59:43,CD4,1,0,19,160,162,3,4787,TRUE,FALSE
2025-05-23 08:04:36,CD3,1,0,20,123,162,3,4787,TRUE,FALSE
2025-05-23 08:09:37,CD2,1,0,21,130,162,3,4787,TRUE,FALSE
2025-05-23 08:14:32,CD1,1,0,22,115,162,3,4787,TRUE,FALSE
2025-05-23 08:19:28,CD4,1,0,23,116,162,3,4787,TRUE,FALSE
2025-05-23 08:24:21,CD3,1,0,24,115,161,3,4787,TRUE,FALSE
2025-05-23 08:29:14,CD2,1,0,25,116,161,3,4787,TRUE,FALSE
2025-05-23 08:34:10,CD1,1,0,26,117,161,3,4787,TRUE,FALSE
2025-05-23 08:39:03,CD4,1,0,27,116,161,3,4787,TRUE,FALSE
2025-05-23 08:43:56,CD3,1,0,28,116,161,3,4787,TRUE,FALSE
2025-05-23 08:48:52,CD2,1,0,29,117,162,3,4787,TRUE,FALSE
2025-05-23 08:53:45,CD1,1,0,30,116,161,3,4787,TRUE,FALSE
2025-08-07 10:01:21,CD1,1,0,1,101,162,3,4787,TRUE,FALSE
2025-08-07 10:07:37,CD2,1,0,2,207,161,3,4787,TRUE,FALSE
2025-08-07 10:13:21,CD3,1,0,3,174,161,3,4787,TRUE,FALSE
2025-08-07 10:18:23,CD4,1,0,4,130,162,3,4787,TRUE,FALSE
2025-08-07 10:23:19,CD1,1,0,5,117,161,3,4787,TRUE,FALSE
2025-08-07 10:28:13,CD2,1,0,6,116,161,3,4787,TRUE,FALSE
2025-08-07 10:33:07,CD3,1,0,7,116,161,3,4787,TRUE,FALSE
2025-08-07 10:38:00,CD4,1,0,8,116,162,3,4787,TRUE,FALSE
2025-08-07 10:42:54,CD1,1,0,9,116,161,3,4787,TRUE,FALSE
2025-08-07 10:47:48,CD2,1,0,10,116,161,3,4787,TRUE,FALSE
2025-08-07 10:52:43,CD3,1,0,11,116,161,3,4787,TRUE,FALSE
2025-08-07 10:57:38,CD4,1,0,12,116,161,3,4787,TRUE,FALSE
2025-08-07 11:02:32,CD1,1,0,13,116,161,3,4787,TRUE,FALSE
2025-08-07 11:07:23,CD2,1,0,14,124,161,3,4787,TRUE,FALSE
2025-08-07 11:12:16,CD3,1,0,15,116,161,3,4787,TRUE,FALSE
2025-08-07 11:17:10,CD4,1,0,16,116,161,3,4787,TRUE,FALSE
2025-08-07 11:19:42,CD1,2,1,17,35,129,2,3240,TRUE,FALSE
2025-08-07 11:21:49,CD2,2,1,18,105,12,2,280,TRUE,FALSE
2025-08-07 11:24:26,CD3,2,1,19,42,129,2,3240,TRUE,FALSE
2025-08-07 11:28:02,CD4,2,1,20,126,129,2,3240,TRUE,FALSE
2025-08-07 11:30:08,CD1,2,1,21,105,1,2,40,TRUE,FALSE
2025-08-07 11:30:28,CD2,2,1,22,0,19,2,40,TRUE,FALSE
2025-08-07 11:31:50,CD3,2,1,23,5,157,2,3678,TRUE,FALSE
2025-08-07 11:32:05,CD4,2,1,24,15,158,2,3678,TRUE,FALSE
2025-08-07 11:34:04,CD1,2,1,25,31,158,2,3678,TRUE,FALSE
2025-08-07 11:35:45,CD2,2,1,26,89,158,2,3678,TRUE,FALSE
2025-08-07 11:37:19,CD3,2,1,27,191,157,2,3678,FALSE,FALSE
2025-08-07 11:37:37,CD4,2,1,27,191,157,2,3678,TRUE,FALSE
2025-08-07 11:38:57,CD1,2,1,28,21,50,2,1178,TRUE,FALSE
2025-08-07 12:07:24,CD2,1,0,29,638,181,3,5577,TRUE,FALSE
2025-08-07 12:13:20,CD3,1,0,30,181,168,3,5577,TRUE,FALSE
2025-08-07 12:18:58,CD4,1,0,31,147,169,3,5577,TRUE,FALSE
2025-08-07 12:30:11,CD1,1,0,32,408,173,3,5577,TRUE,FALSE
2025-08-07 12:35:54,CD2,1,0,33,170,173,3,5577,TRUE,FALSE
2025-08-07 12:41:35,CD3,1,0,34,168,173,3,5577,TRUE,FALSE
2025-08-07 12:47:19,CD4,1,0,35,170,173,3,5577,TRUE,FALSE
2025-08-07 12:53:02,CD1,1,0,36,170,173,3,5577,TRUE,FALSE
2025-08-07 12:58:43,CD2,1,0,37,169,173,3,5577,TRUE,FALSE
2025-08-07 13:04:26,CD3,1,0,38,170,173,3,5577,TRUE,FALSE
2025-08-07 13:10:09,CD4,1,0,39,170,173,3,5577,TRUE,FALSE
2025-08-07 13:15:53,CD1,1,0,40,170,173,3,5577,TRUE,FALSE
2025-08-07 13:21:36,CD2,1,0,41,170,173,3,5577,TRUE,FALSE
2025-08-07 13:27:19,CD3,1,0,42,170,173,3,5577,TRUE,FALSE
2025-08-07 13:33:02,CD4,1,0,43,170,173,3,5577,TRUE,FALSE
2025-08-07 13:38:46,CD1,1,0,44,170,173,3,5577,TRUE,FALSE
2025-08-07 13:44:28,CD2,1,0,45,170,173,3,5577,TRUE,FALSE
2025-08-07 13:50:11,CD3,1,0,46,170,173,3,5577,TRUE,FALSE
2025-08-07 13:55:54,CD4,1,0,47,170,173,3,5577,TRUE,FALSE
2025-08-07 14:01:38,CD1,1,0,48,170,173,3,5577,TRUE,FALSE
2025-08-07 14:07:22,CD2,1,0,49,170,173,3,5577,TRUE,FALSE
2025-08-07 14:13:06,CD3,1,0,50,170,173,3,5577,TRUE,FALSE
2025-08-07 14:18:49,CD4,1,0,51,170,173,3,5577,TRUE,FALSE
2025-08-07 14:24:32,CD1,1,0,52,170,173,3,5577,TRUE,FALSE
2025-08-07 14:30:17,CD2,1,0,53,170,173,3,5577,TRUE,FALSE
2025-08-07 14:36:00,CD3,1,0,54,170,173,3,5577,TRUE,FALSE
2025-08-07 14:41:44,CD4,1,0,55,170,173,3,5577,TRUE,FALSE
2025-08-07 14:47:29,CD1,1,0,56,170,173,3,5577,TRUE,FALSE
2025-08-07 14:53:13,CD2,1,0,57,170,173,3,5577,TRUE,FALSE
2025-08-07 14:58:57,CD3,1,0,58,170,173,3,5577,TRUE,FALSE
2025-08-07 15:04:41,CD4,1,0,59,170,173,3,5577,TRUE,FALSE
2025-08-07 15:10:25,CD1,1,0,60,170,173,3,5577,TRUE,FALSE
2025-08-07 15:16:09,CD2,1,0,61,170,173,3,5577,TRUE,FALSE
2025-08-07 15:21:54,CD3,1,0,62,170,173,3,5577,TRUE,FALSE
2025-08-07 15:27:38,CD4,1,0,63,170,173,3,5577,TRUE,FALSE
2025-08-07 15:33:22,CD1,1,0,64,170,173,3,5577,TRUE,FALSE
2025-08-07 15:39:07,CD2,1,0,65,170,173,3,5577,TRUE,FALSE
2025-08-07 15:44:50,CD3,1,0,66,170,173,3,5577,TRUE,FALSE
2025-08-07 15:50:33,CD4,1,0,67,170,173,3,5577,TRUE,FALSE
2025-08-07 15:56:17,CD1,1,0,68,170,173,3,5577,TRUE,FALSE
2025-08-07 16:02:00,CD2,1,0,69,170,173,3,5577,TRUE,FALSE
2025-08-07 16:07:44,CD3,1,0,70,170,173,3,5577,TRUE,FALSE
2025-08-07 16:13:28,CD4,1,0,71,170,173,3,5577,TRUE,FALSE
2025-08-07 16:19:12,CD1,1,0,72,170,173,3,5577,TRUE,FALSE
2025-08-07 16:24:55,CD2,1,0,73,170,173,3,5577,TRUE,FALSE
2025-08-07 16:30:38,CD3,1,0,74,170,173,3,5577,TRUE,FALSE
2025-08-07 16:36:21,CD4,1,0,75,170,173,3,5577,TRUE,FALSE
2025-08-07 16:42:04,CD1,1,0,76,170,173,3,5577,TRUE,FALSE
2025-08-07 16:47:47,CD2,1,0,77,170,173,3,5577,TRUE,FALSE
2025-08-07 16:53:32,CD3,1,0,78,170,173,3,5577,TRUE,FALSE
2025-08-07 16:59:15,CD4,1,0,79,170,173,3,5577,TRUE,FALSE
2025-08-07 17:04:58,CD1,1,0,80,170,173,3,5577,TRUE,FALSE
2025-08-07 17:10:41,CD2,1,0,81,170,173,3,5577,TRUE,FALSE
2025-08-07 17:16:25,CD3,1,0,82,170,173,3,5577,TRUE,FALSE
2025-08-07 17:22:09,CD4,1,0,83,170,173,3,5577,TRUE,FALSE
2025-08-07 17:27:53,CD1,1,0,84,170,173,3,5577,TRUE,FALSE
2025-08-07 17:33:37,CD2,1,0,85,170,173,3,5577,TRUE,FALSE
2025-08-07 17:39:21,CD3,1,0,86,170,173,3,5577,TRUE,FALSE
2025-08-07 17:45:05,CD4,1,0,87,170,173,3,5577,TRUE,FALSE
2025-08-07 17:50:49,CD1,1,0,88,170,173,3,5577,TRUE,FALSE
2025-08-07 17:56:32,CD2,1,0,89,170,173,3,5577,TRUE,FALSE
2025-08-07 18:02:16,CD3,1,0,90,170,173,3,5577,TRUE,FALSE
2025-08-07 18:08:00,CD4,1,0,91,170,173,3,5577,TRUE,FALSE
2025-08-07 18:13:43,CD1,1,0,92,170,173,3,5577,TRUE,FALSE
2025-08-07 18:19:26,CD2,1,0,93,170,173,3,5577,TRUE,FALSE
2025-08-07 18:25:09,CD3,1,0,94,170,173,3,5577,TRUE,FALSE
2025-08-07 18:30:52,CD4,1,0,95,170,173,3,5577,TRUE,FALSE
2025-08-07 18:36:35,CD1,1,0,96,170,173,3,5577,TRUE,FALSE
2025-08-07 18:42:19,CD2,1,0,97,170,173,3,5577,TRUE,FALSE
2025-08-07 18:48:02,CD3,1,0,98,170,173,3,5577,TRUE,FALSE
2025-08-07 18:53:46,CD4,1,0,99,170,173,3,5577,TRUE,FALSE
2025-08-07 18:59:29,CD1,1,0,100,170,173,3,5577,TRUE,FALSE
`;

// --- Componente Principal Relatorio ---
export const Relatorio: React.FC = () => {
  const { t } = useAccessibility();

  // --- Estados ---
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para os filtros
  const [filters, setFilters] = useState<Filters>({
    startDate: "",
    endDate: "",
    maquina: "all",
    tipoTecido: "all",
    tarefaCompleta: "all",
    search: "",
  });

  // Estado para as opções dos <select>
  const [maquinaOptions, setMaquinaOptions] = useState<string[]>([]);
  const [tecidoOptions, setTecidoOptions] = useState<number[]>([]);

  // Estado da paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // --- Funções Auxiliares ---

  /**
   * Converte uma string booleana ("TRUE", "FALSE", "") para boolean.
   */
  const parseBoolean = (val: string): boolean => val.trim().toUpperCase() === "TRUE";

  /**
   * Faz o parsing do texto CSV para um array de DataItem.
   */
  const parseCSV = (text: string): DataItem[] => {
    try {
      const lines = text.trim().split("\n");

      // Remove a linha de cabeçalho
      const headerLine = lines.shift();
      if (!headerLine) return [];

      // Mapeia os cabeçalhos para índices para robustez
      const headers = headerLine.split(',').map(h => h.trim());
      const idx = {
        data: headers.findIndex(h => h.startsWith("Data")),
        maquina: headers.findIndex(h => h === "Maquina"),
        tipoTecido: headers.findIndex(h => h === "Tipo Tecido"),
        tipoSaida: headers.findIndex(h => h === "Tipo de Saida"),
        numeroTarefa: headers.findIndex(h => h === "Numero da tarefa"),
        tempoSetup: headers.findIndex(h => h === "Tempo de setup"),
        tempoProducao: headers.findIndex(h => h === "Tempo de Produção"),
        quantidadeTiras: headers.findIndex(h => h === "Quantidade de Tiras"),
        metrosProduzidos: headers.findIndex(h => h === "Metros Produzidos"),
        tarefaCompleta: headers.findIndex(h => h === "Tarefa completa?"),
        sobraDeRolo: headers.findIndex(h => h === "Sobra de Rolo?"),
      };

      // Valida se todos os cabeçalhos esperados estão presentes
      if (Object.values(idx).some(i => i === -1)) {
        console.error("CSV com cabeçalho inválido. Cabeçalhos encontrados:", headers);
        setError(t('csvHeaderError'));
        return [];
      }

      const parsedData: DataItem[] = [];
      for (const line of lines) {
        if (!line.trim()) continue; // Pula linhas vazias

        const values = line.split(',');

        // Validação básica da linha
        if (values.length < headers.length) {
          console.warn("Linha do CSV pulada (colunas insuficientes):", line);
          continue;
        }

        try {
          const item: DataItem = {
            data: new Date(values[idx.data].trim()),
            maquina: values[idx.maquina].trim(),
            tipoTecido: parseInt(values[idx.tipoTecido].trim(), 10) || 0,
            tipoSaida: parseInt(values[idx.tipoSaida].trim(), 10) || 0,
            numeroTarefa: parseInt(values[idx.numeroTarefa].trim(), 10) || 0,
            tempoSetup: parseInt(values[idx.tempoSetup].trim(), 10) || 0,
            tempoProducao: parseInt(values[idx.tempoProducao].trim(), 10) || 0,
            quantidadeTiras: parseInt(values[idx.quantidadeTiras].trim(), 10) || 0,
            metrosProduzidos: parseInt(values[idx.metrosProduzidos].trim(), 10) || 0,
            tarefaCompleta: parseBoolean(values[idx.tarefaCompleta]),
            sobraDeRolo: parseBoolean(values[idx.sobraDeRolo]),
          };

          // Validação final (ex: data inválida)
          if (isNaN(item.data.getTime())) {
            console.warn("Linha do CSV pulada (data inválida):", line);
            continue;
          }

          parsedData.push(item);
        } catch (e) {
          console.warn("Erro ao processar linha do CSV:", line, e);
        }
      }
      return parsedData;
    } catch (e) {
      console.error("Erro fatal no parsing do CSV:", e);
      setError(t('csvProcessingError'));
      return [];
    }
  };

  // --- Efeitos ---

  // Efeito para carregar e processar o CSV na montagem do componente
  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const parsedData = parseCSV(csvDataString);

      setData(parsedData);

      // Extrair opções únicas para os filtros <select>
      const maquinas = [...new Set(parsedData.map(item => item.maquina).filter(Boolean))];
      const tecidos = [...new Set(parsedData.map(item => item.tipoTecido))].sort((a, b) => a - b);
      setMaquinaOptions(maquinas);
      setTecidoOptions(tecidos);

    } catch (e: any) {
      console.error(e);
      setError(e.message || t('unknownError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // --- Lógica de Filtro e Paginação (com useMemo) ---

  // Memoiza os dados filtrados
  const filteredData = useMemo(() => {
    setCurrentPage(1); // Reseta a página ao aplicar filtros

    return data.filter(item => {
      const s = filters.search.toLowerCase();

      // Filtro de Data Início
      if (filters.startDate) {
        const startDate = new Date(filters.startDate + "T00:00:00");
        if (item.data < startDate) return false;
      }
      // Filtro de Data Fim
      if (filters.endDate) {
        const endDate = new Date(filters.endDate + "T23:59:59");
        if (item.data > endDate) return false;
      }
      // Filtro de Máquina
      if (filters.maquina !== "all" && item.maquina !== filters.maquina) {
        return false;
      }
      // Filtro de Tipo Tecido
      if (filters.tipoTecido !== "all" && item.tipoTecido !== parseInt(filters.tipoTecido, 10)) {
        return false;
      }
      // Filtro de Tarefa Completa
      if (filters.tarefaCompleta !== "all") {
        if (item.tarefaCompleta !== (filters.tarefaCompleta === "true")) return false;
      }

      // Filtro de Pesquisa (search)
      if (s) {
        const searchString = [
          item.maquina,
          item.numeroTarefa.toString(),
          item.tipoTecido.toString(),
          item.metrosProduzidos.toString()
        ].join(' ').toLowerCase();

        if (!searchString.includes(s)) return false;
      }

      return true;
    });
  }, [data, filters]);

  // Memoiza os dados paginados
  const { paginatedData, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const total = Math.ceil(filteredData.length / itemsPerPage);

    return {
      paginatedData: filteredData.slice(startIndex, endIndex),
      totalPages: total > 0 ? total : 1, // Garante pelo menos 1 página
    };
  }, [filteredData, currentPage, itemsPerPage]);

  // --- Handlers de Eventos ---

  // Handler para mudança nos filtros
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
      item.data.toLocaleString('pt-BR'),
      item.maquina || "-",
      item.tipoTecido,
      item.numeroTarefa,
      item.tempoSetup,
      item.tempoProducao,
      item.metrosProduzidos,
      item.tarefaCompleta ? t('yes') : t('no')
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
      `"${item.data.toLocaleString('pt-BR')}"`,
      `"${item.maquina || "-"}"`,
      item.tipoTecido,
      item.numeroTarefa,
      item.tempoSetup,
      item.tempoProducao,
      item.metrosProduzidos,
      `"${item.tarefaCompleta ? t('yes') : t('no')}"`
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
              {t("dateTime")}
            </LabelBase>
            <DateTimePicker
            />
          </div>
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("dateTime")}
            </LabelBase>
            <DateTimePicker
            />
          </div>
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">{t('machine')}</LabelBase>
            <InputBase label='Maquina' placeholder='seu@M.com'>
            </InputBase>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">{t('fabricType')}</label>
            <select
              name="tipoTecido"
              value={filters.tipoTecido}
              onChange={handleFilterChange}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="all">{t('all')}</option>
              {tecidoOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">{t('taskComplete')}</label>
            <select
              name="tarefaCompleta"
              value={filters.tarefaCompleta}
              onChange={handleFilterChange}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="all">{t('all')}</option>
              <option value="true">{t('yes')}</option>
              <option value="false">{t('no')}</option>
            </select>
          </div>
        </form>

        <div className="flex justify-end mt-6 gap-3">
          <ButtonBase
            onClick={handleClearFilters}
            className="bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--text)] px-5 py-2 rounded-lg border border-[var(--border)] transition-colors"
          >
            {t('clear')}
          </ButtonBase>
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
                    <td className="px-4 py-3 text-[var(--text)] whitespace-nowrap">{item.data.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.maquina || "-"}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.tipoTecido}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.numeroTarefa}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.tempoSetup}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.tempoProducao}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.metrosProduzidos}</td>
                    <td className="px-4 py-3 text-[var(--text)]">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.tarefaCompleta
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {item.tarefaCompleta ? t('yes') : t('no')}
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