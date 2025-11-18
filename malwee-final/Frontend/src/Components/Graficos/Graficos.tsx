import React, { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement,
    RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie, PolarArea } from 'react-chartjs-2';
import { Chart } from '@mlw-packages/react-components';
import { useAccessibility } from "../Acessibilidade/AccessibilityContext";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement,
    RadialLinearScale
);

const API_URL = "http://localhost:3000";

const getToken = () => {
    return localStorage.getItem('jwt_token');
};

const formatarDadosChart = (backendData, label, backgroundColor, borderColor) => {
    if (!backendData || !backendData.labels || !backendData.data) {
        return { labels: [], datasets: [] };
    }

    const data = {
        labels: backendData.labels,
        datasets: [
            {
                label: label,
                data: backendData.data.map(d => parseFloat(d)),
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1,
                fill: backgroundColor.includes('rgba'),
            },
        ],
    };
    return data;
};

export const Graficos: React.FC = () => {
    const { t } = useAccessibility();

    const [producaoTempoData, setProducaoTempoData] = useState({ labels: [], datasets: [] });
    const [eficienciaData, setEficienciaData] = useState({ labels: [], datasets: [] });
    const [producaoTecidoData, setProducaoTecidoData] = useState({ labels: [], datasets: [] });
    const [localidadesData, setLocalidadesData] = useState({ labels: [], datasets: [] });
    const [sobrasData, setSobrasData] = useState({ labels: [], datasets: [] });
    const [setupData, setSetupData] = useState({ labels: [], datasets: [] });
    const [tirasData, setTirasData] = useState({ labels: [], datasets: [] });

    // Formatar dados para Produção por Tecido (usando Chart com series bar)
    const producaoTecidoDataMalwee = (producaoTecidoData.labels || []).map((label: string, i: number) => ({
        tecido: label,
        producao: (producaoTecidoData.datasets?.[0]?.data?.[i] ?? 0) as number,
    }));

    // Formatar dados para Eficiência da Máquina (usando Chart padrão)
    const eficienciaDataMalwee = (eficienciaData.labels || []).map((label: string, i: number) => ({
        maquina: label,
        eficiencia: (eficienciaData.datasets?.[0]?.data?.[i] ?? 0) as number,
    }));

    // Formatar dados para Setup (usando Chart com series line)
    const setupDataMalwee = (setupData.labels || []).map((label: string, i: number) => ({
        periodo: label,
        setup: (setupData.datasets?.[0]?.data?.[i] ?? 0) as number,
    }));

    // Formatar dados para Sobras de Rolo - usando o formato area
    const sobrasDataMalwee = (sobrasData.labels || []).map((label: string, i: number) => ({
        periodo: label,
        sobras: (sobrasData.datasets?.[0]?.data?.[i] ?? 0) as number,
    }));

    // Formatar dados para Produção ao Longo do Tempo - usando dados reais da API
    const producaoTempoDataMalwee = (producaoTempoData.labels || []).map((label: string, i: number) => ({
        periodo: label,
        producao: (producaoTempoData.datasets?.[0]?.data?.[i] ?? 0) as number,
    }));

    // Formatar dados para Produção por Localidade - usando MultipleBarSeries
    const localidadesDataBars = (localidadesData.labels || []).map((label: string, i: number) => ({
        localidade: label,
        producao: (localidadesData.datasets?.[0]?.data?.[i] ?? 0) as number,
    }));

    // Formatar dados para Distribuição da Quantidade de Tiras - usando dados da API
    const tirasDataMalwee = (tirasData.labels || []).map((label: string, i: number) => ({
        periodo: label,
        tiras: (tirasData.datasets?.[0]?.data?.[i] ?? 0) as number,
    }));

    useEffect(() => {
        const token = getToken();

        if (!token) {
            console.warn("Token não encontrado. Redirecionando...");
            window.location.href = "/login";
            return;
        }

        const handleAuthError = () => {
            console.error("Sessão expirada ou inválida.");
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('usuario');
            window.location.href = "/login";
        };

        const fetchData = async (endpoint, setter, label, bg, border) => {
            try {
                const response = await fetch(`${API_URL}${endpoint}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    handleAuthError();
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Erro ao buscar dados de ${endpoint}`);
                }
                const data = await response.json();
                setter(formatarDadosChart(data, label, bg, border));
            } catch (error) {
                console.error(error);
                setter({ labels: [], datasets: [] });
            }
        };

        // Requisições para os endpoints 
        fetchData(
            "/api/chart-producao-tempo",
            setProducaoTempoData,
            t('productionTime'),
            "rgba(54, 162, 235, 0.2)",
            "rgba(54, 162, 235, 1)"
        );
        fetchData(
            "/api/chart-data",
            setEficienciaData,
            t('averageMeters'),
            "rgba(75, 192, 192, 0.2)",
            "rgba(75, 192, 192, 1)"
        );
        fetchData(
            "/api/chart-producao-tecido",
            setProducaoTecidoData,
            t('totalProduced'),
            [
                "rgba(255, 159, 64, 0.5)",
                "rgba(75, 192, 192, 0.5)",
                "rgba(153, 102, 255, 0.5)",
                "rgba(255, 206, 86, 0.5)",
            ],
            [
                "rgba(255, 159, 64, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 206, 86, 1)",
            ]
        );
        fetchData(
            "/api/chart-localidades",
            setLocalidadesData,
            t('totalProduced'),
            [
                "rgba(153, 102, 255, 0.5)",
                "rgba(54, 162, 235, 0.5)",
                "rgba(255, 99, 132, 0.5)",
                "rgba(75, 192, 192, 0.5)",
            ],
            [
                "rgba(153, 102, 255, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(75, 192, 192, 1)",
            ]
        );
        fetchData(
            "/api/chart-sobras",
            setSobrasData,
            t('rollWaste'),
            ["rgba(255, 206, 86, 0.2)", "rgba(54, 162, 235, 0.2)"],
            ["rgba(255, 206, 86, 1)", "rgba(54, 162, 235, 1)"]
        );
        fetchData(
            "/api/chart-setup",
            setSetupData,
            t('averageTime'),
            "rgba(255, 99, 132, 0.2)",
            "rgba(255, 99, 132, 1)"
        );
        fetchData(
            "/api/chart-tiras",
            setTirasData,
            t('occurrences'),
            "rgba(192, 192, 192, 0.2)",
            "rgba(192, 192, 192, 1)"
        );
    }, [t]);

    const chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#999'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#FFF',
                bodyColor: '#FFF',
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#999'
                },
                grid: {
                    color: '#333'
                }
            },
            y: {
                ticks: {
                    color: '#999'
                },
                grid: {
                    color: '#333'
                }
            }
        }
    };

    const circularChartOptions = {
        ...chartOptions,
        scales: {}
    };

    const horizontalChartOptions = {
        ...chartOptions,
        indexAxis: 'y' as const,
        scales: {
            ...chartOptions.scales,
            y: {
                ...chartOptions.scales.y,
                grid: {
                    display: false,
                }
            }
        }
    };

    const polarAreaChartOptions = {
        ...circularChartOptions,
        scales: {
            r: {
                ticks: {
                    color: '#CCC',
                    backdropColor: 'rgba(0, 0, 0, 0.5)',
                    backdropPadding: 2,
                    z: 1
                },
                grid: {
                    color: '#444'
                },
                angleLines: {
                    color: '#555'
                }
            }
        }
    };

    return (
        <>
            {/* Gráficos principais */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 h-[400px] shadow-lg hover:-translate-y-1 hover:shadow-[var(--card)] transition-all no-underline">
                    <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">
                        {t('productionOverTime')}
                    </h3>
                    <Chart
                        data={producaoTempoDataMalwee}
                        xAxis="periodo"
                        series={{ bar: ['producao'] }}
                        labelMap={{
                            producao: t('productionMeters')
                        }}
                        colors={["#3b82f6"]}
                        height={350}
                    />
                </div>

                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 h-[400px] shadow-lg hover:-translate-y-1 hover:shadow-[var(--card)] transition-all no-underline">
                    <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">
                        {t('machineEfficiency')}
                    </h3>
                    <div className="h-[300px]">
                        <Chart
                            data={eficienciaDataMalwee}
                            xAxis="periodo"
                            height={300}
                        />
                    </div>
                </div>
            </section>

            {/* Gráficos secundários */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 h-[280px] shadow-lg hover:-translate-y-1 hover:shadow-[var(--card)] transition-all no-underline">
                    <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">
                        {t('productionByFabric')}
                    </h3>
                    <div className="h-[200px]">
                        <Chart
                            data={producaoTecidoDataMalwee}
                            xAxis="tecido"
                            series={{ bar: ['producao'] }}
                            labelMap={{ producao: t('productionMeters') }}
                            height={200}
                        />
                    </div>
                </div>

                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 h-[280px] shadow-lg hover:-translate-y-1 hover:shadow-[var(--card)] transition-all no-underline">
                    <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">
                        {t('rollWaste')}
                    </h3>
                    <div className="h-[200px]">
                        <Chart
                            data={sobrasDataMalwee}
                            xAxis="periodo"
                            series={{ area: ['sobras'] }}
                            labelMap={{ sobras: t('rollWaste') }}
                            colors={["#06b6d4"]}
                            height={200}
                        />
                    </div>
                </div>

                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 h-[280px] shadow-lg hover:-translate-y-1 hover:shadow-[var(--card)] transition-all no-underline">
                    <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">
                        {t('productionByLocation')}
                    </h3>
                    <div className="h-[200px]">
                        <Chart
                            data={localidadesDataBars}
                            xAxis="localidade"
                            series={{ bar: ['producao'] }}
                            labelMap={{ producao: t('productionMeters') }}
                            colors={["#3b82f6"]}
                            height={200}
                        />
                    </div>
                </div>
            </section>

            {/* Gráficos terciários */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-1 bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 h-[280px] shadow-lg hover:-translate-y-1 hover:shadow-[var(--card)] transition-all no-underline">
                    <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">
                        {t('averageSetupTime')}
                    </h3>
                    <div className="h-[200px]">
                        <Chart
                            data={setupDataMalwee}
                            xAxis="periodo"
                            series={{ line: ['setup'] }}
                            labelMap={{ setup: t('setupTimeMinutes') }}
                            colors={["#10b981"]}
                            height={200}
                        />
                    </div>
                </div>

                <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 h-[280px] shadow-lg hover:-translate-y-1 hover:shadow-[var(--card)] transition-all no-underline">
                    <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">
                        {t('stripQuantityDistribution')}
                    </h3>
                    <div className="h-[200px]">
                        <Chart
                            data={tirasDataMalwee}
                            xAxis="periodo"
                            series={{ bar: ['tiras'] }}
                            labelMap={{ tiras: t('stripQuantity') }}
                            colors={["#ef4444"]}
                            height={200}
                        />
                    </div>
                </div>
            </section>
        </>
    );
};