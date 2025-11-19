// Frontend/src/Components/Relatorio/RelatorioProducao.tsx
import React, { useState, useMemo, ChangeEvent } from 'react';
import { ButtonBase } from "@mlw-packages/react-components";
import { useProducaoData } from '../../hooks/useProducaoData';
import { useAccessibility } from '../Acessibilidade/AccessibilityContext';

interface RelatorioProducaoProps {
    csvUrl?: string;
}

interface Filters {
    startDate: string;
    endDate: string;
    maquina: string;
    tipoTecido: string;
    tarefaCompleta: string;
    search: string;
}

export const RelatorioProducao: React.FC<RelatorioProducaoProps> = ({ csvUrl }) => {
    const { t } = useAccessibility();
    const { data, loading, error, uploadFile } = useProducaoData(csvUrl);

    const [filters, setFilters] = useState<Filters>({
        startDate: "",
        endDate: "",
        maquina: "all",
        tipoTecido: "all",
        tarefaCompleta: "all",
        search: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Estado para as opções dos filtros
    const [maquinaOptions, setMaquinaOptions] = useState<string[]>([]);

    // Efeito para extrair opções únicas dos dados carregados
    React.useEffect(() => {
        if (data.length > 0) {
            const maquinas = [...new Set(data.map(item => item.Maquina).filter(Boolean))];
            setMaquinaOptions(maquinas);
        }
    }, [data]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            uploadFile(file);
        }
    };

    // Cálculos para métricas
    const totalRegistros = data.length;
    const totalMetros = data.reduce((sum, item) => sum + item.MetrosProduzidos, 0);
    const totalTempoProducao = data.reduce((sum, item) => sum + item.TempoProducao, 0);
    const totalTempoSetup = data.reduce((sum, item) => sum + item.TempoSetup, 0);
    const eficiencia = totalTempoProducao > 0 ?
        (totalTempoProducao / (totalTempoProducao + totalTempoSetup)) * 100 : 0;

    // Filtros
    const filteredData = useMemo(() => {
        setCurrentPage(1); // Reseta a página ao aplicar filtros

        return data.filter(item => {
            const searchLower = filters.search.toLowerCase();

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
            if (filters.maquina !== "all" && item.Maquina !== filters.maquina) return false;
            // Filtro de Tipo Tecido
            if (filters.tipoTecido !== "all" && item.TipoTecido !== parseInt(filters.tipoTecido, 10)) return false;
            // Filtro de Tarefa Completa
            if (filters.tarefaCompleta !== "all") {
                if (item.TarefaCompleta !== (filters.tarefaCompleta === "true")) return false;
            }
            // Filtro de Pesquisa
            if (searchLower) {
                const searchString = [
                    item.Maquina,
                    item.NumeroTarefa.toString(),
                    item.TipoTecido.toString(),
                    item.MetrosProduzidos.toString()
                ].join(' ').toLowerCase();
                if (!searchString.includes(searchLower)) return false;
            }
            return true;
        });
    }, [data, filters]);

    // Paginação
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
        setFilters(prev => ({ ...prev, [name]: value }));
    };

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

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({
            ...prev,
            search: e.target.value,
        }));
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Handlers de Exportação
    const handleCopy = () => {
        const headers = [
            'Data', 'Máquina', 'Tipo Tecido', 'Número Tarefa',
            'Tempo Setup', 'Tempo Produção', 'Metros Produzidos', 'Completa'
        ].join('\t');

        const tsvRows = filteredData.map(item => [
            new Date(item.Data).toLocaleString('pt-BR'),
            item.Maquina || "-",
            item.TipoTecido,
            item.NumeroTarefa,
            item.TempoSetup,
            item.TempoProducao,
            item.MetrosProduzidos,
            item.TarefaCompleta ? 'Sim' : 'Não'
        ].join('\t'));

        const tsv = [headers, ...tsvRows].join('\n');

        try {
            navigator.clipboard.writeText(tsv).then(() => {
                console.log('Copiado para área de transferência');
            }, () => {
                const textArea = document.createElement("textarea");
                textArea.value = tsv;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    console.log('Copiado (fallback)');
                } catch (err) {
                    console.error('Falha ao copiar', err);
                }
                document.body.removeChild(textArea);
            });
        } catch (e) {
            console.error('Erro ao copiar', e);
        }
    };

    const handleExportCSV = () => {
        const headers = [
            'Data', 'Máquina', 'Tipo Tecido', 'Número Tarefa',
            'Tempo Setup', 'Tempo Produção', 'Metros Produzidos', 'Completa'
        ];

        const csvRows = filteredData.map(item => [
            `"${new Date(item.Data).toLocaleString('pt-BR')}"`,
            `"${item.Maquina || "-"}"`,
            item.TipoTecido,
            item.NumeroTarefa,
            item.TempoSetup,
            item.TempoProducao,
            item.MetrosProduzidos,
            `"${item.TarefaCompleta ? 'Sim' : 'Não'}"`
        ].join(','));

        const csv = [headers.join(','), ...csvRows].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "relatorio_producao.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <div className="text-center py-8">{t('loadingData')}</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
        <div className="relatorio-producao p-6">
            {/* Upload de Arquivo */}
            <div className="upload-section mb-6">
                <h3 className="text-sm font-medium mb-2">Carregar CSV de Produção</h3>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {/* Filtros */}
            <div className="filtros-section bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 mb-6 shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Máquina */}
                    <div>
                        <label className="block text-sm text-[var(--text-muted)] mb-2">
                            Máquina
                        </label>
                        <select
                            name="maquina"
                            value={filters.maquina}
                            onChange={handleFilterChange}
                            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        >
                            <option value="all">Todas</option>
                            {maquinaOptions.map(maquina => (
                                <option key={maquina} value={maquina}>{maquina}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tipo de Tecido */}
                    <div>
                        <label className="block text-sm text-[var(--text-muted)] mb-2">
                            Tipo de Tecido
                        </label>
                        <select
                            name="tipoTecido"
                            value={filters.tipoTecido}
                            onChange={handleFilterChange}
                            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        >
                            <option value="all">Todos</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                        </select>
                    </div>

                    {/* Tarefa Completa */}
                    <div>
                        <label className="block text-sm text-[var(--text-muted)] mb-2">
                            Tarefa Completa
                        </label>
                        <select
                            name="tarefaCompleta"
                            value={filters.tarefaCompleta}
                            onChange={handleFilterChange}
                            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        >
                            <option value="all">Todos</option>
                            <option value="true">Sim</option>
                            <option value="false">Não</option>
                        </select>
                    </div>

                    {/* Botão Limpar Filtros */}
                    <div className="flex items-end">
                        <ButtonBase
                            onClick={handleClearFilters}
                            className="bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--text)] px-5 py-2 rounded-lg border border-[var(--border)] transition-colors w-full"
                        >
                            Limpar Filtros
                        </ButtonBase>
                    </div>
                </div>

                {/* Pesquisa */}
                <div className="flex justify-between items-center">
                    <div className="flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Pesquisar na tabela..."
                            value={filters.search}
                            onChange={handleSearchChange}
                            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        />
                    </div>
                    <div className="flex gap-2 ml-4">
                        <ButtonBase
                            onClick={handleCopy}
                            className="bg-[var(--surface)] hover:bg-[#8E68FF] hover:text-white px-3 py-2 rounded-lg text-sm border border-[var(--border)] transition-colors text-[var(--text)]"
                        >
                            Copiar
                        </ButtonBase>
                        <ButtonBase
                            onClick={handleExportCSV}
                            className="bg-[var(--surface)] hover:bg-[#8E68FF] hover:text-white px-3 py-2 rounded-lg text-sm border border-[var(--border)] transition-colors text-[var(--text)]"
                        >
                            Exportar CSV
                        </ButtonBase>
                    </div>
                </div>
            </div>

            {/* Métricas */}
            <div className="metricas-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="metrica-card bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
                    <h3 className="text-sm text-[var(--text-muted)]">Total Registros</h3>
                    <p className="text-2xl font-bold text-[var(--text)]">{totalRegistros}</p>
                </div>
                <div className="metrica-card bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
                    <h3 className="text-sm text-[var(--text-muted)]">Total Metros</h3>
                    <p className="text-2xl font-bold text-[var(--text)]">{totalMetros.toLocaleString()} m</p>
                </div>
                <div className="metrica-card bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
                    <h3 className="text-sm text-[var(--text-muted)]">Tempo Produção</h3>
                    <p className="text-2xl font-bold text-[var(--text)]">{totalTempoProducao} min</p>
                </div>
                <div className="metrica-card bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
                    <h3 className="text-sm text-[var(--text-muted)]">Eficiência</h3>
                    <p className="text-2xl font-bold text-[var(--text)]">{eficiencia.toFixed(1)}%</p>
                </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
                <table className="min-w-full text-sm">
                    <thead className="bg-[var(--surface)] text-[var(--text-muted)]">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Data</th>
                            <th className="px-4 py-3 text-left font-medium">Máquina</th>
                            <th className="px-4 py-3 text-left font-medium">Tipo Tecido</th>
                            <th className="px-4 py-3 text-left font-medium">Tarefa</th>
                            <th className="px-4 py-3 text-left font-medium">Setup (min)</th>
                            <th className="px-4 py-3 text-left font-medium">Produção (min)</th>
                            <th className="px-4 py-3 text-left font-medium">Metros</th>
                            <th className="px-4 py-3 text-left font-medium">Completa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr className="border-t border-[var(--border)]">
                                <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-muted)]">
                                    Nenhum resultado encontrado
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
                                            {item.TarefaCompleta ? 'Sim' : 'Não'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            <div className="flex flex-col lg:flex-row justify-between items-center mt-6 text-sm text-[var(--text-muted)] gap-4">
                <p>
                    Mostrando {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                    {' - '}
                    {(currentPage - 1) * itemsPerPage + paginatedData.length}
                    {' de '}
                    {filteredData.length} registros
                </p>
                <div className="flex gap-2 items-center">
                    <ButtonBase
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-lg hover:text-[var(--accent)] transition-colors disabled:opacity-50"
                    >
                        Anterior
                    </ButtonBase>
                    <span className="text-[var(--text)]">
                        Página {currentPage} de {totalPages}
                    </span>
                    <ButtonBase
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-lg hover:text-[var(--accent)] transition-colors disabled:opacity-50"
                    >
                        Próxima
                    </ButtonBase>
                </div>
            </div>
        </div>
    );
};