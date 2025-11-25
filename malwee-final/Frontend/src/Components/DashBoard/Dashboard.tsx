import React, { useEffect, useState, useRef } from "react";
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
  Filler
} from 'chart.js';

import { Chart } from '@mlw-packages/react-components';
import { useAccessibility } from "../Acessibilidade/AccessibilityContext";

// Registro dos componentes do Chart.js (necessário antes do uso)
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
  RadialLinearScale,
  Filler
);

const API_URL = "http://localhost:3000";

// Recupera o token JWT armazenado no navegador
const getToken = () => localStorage.getItem('jwt_token');

// Função genérica para formatar dados recebidos do backend em formato compatível com Chart.js
const formatarDadosChart = (backendData, label, backgroundColor, borderColor) => {
  if (!backendData || !backendData.labels || !backendData.data) {
    console.warn("Dados do backend inválidos ou ausentes:", backendData);
    return { labels: [], datasets: [] };
  }

  return {
    labels: backendData.labels,
    datasets: [
      {
        label,
        data: backendData.data.map(d => parseFloat(d)),
        backgroundColor,
        borderColor,
        borderWidth: 1,
        fill: Array.isArray(backgroundColor) ? false : backgroundColor.includes('rgba'),
      },
    ],
  };
};

// Footer simples com texto acessível
export const Footer: React.FC = () => {
  const { t } = useAccessibility();
  return (
    <footer className="mt-8 py-6 text-center text-sm text-[var(--text-muted)] border-t border-[var(--border)]">
      {t('footerCopyright')}
    </footer>
  );
};

// Botões que alternam entre os gráficos
const chartButtons = [
  { label: "machineEfficiency", key: "eficiencia", type: "bar" },
  { label: "productionTime", key: "producaoTempo", type: "line" },
  { label: "productionFabric", key: "producaoTecido", type: "bar" },
  { label: "productionLocation", key: "localidade", type: "pie" },
  { label: "rollWaste", key: "sobras", type: "doughnut" },
  { label: "setupTime", key: "setup", type: "line" },
  { label: "stripQuantity", key: "tiras", type: "bar" },
];

const chartKeys = chartButtons.map(b => b.key);

// Tipos de dados dos cartões de KPI
interface KpiCardData {
  valor: string;
  comparativo: string;
  isPositive: boolean;
}

interface KpiData {
  eficiencia: KpiCardData;
  atingimento: KpiCardData;
  producao: KpiCardData;
  paradas: KpiCardData;
}

export const Dashboard: React.FC = () => {
  const { t } = useAccessibility();

  // Gráfico ativo atual
  const [activeChart, setActiveChart] = useState<string>('eficiencia');
  const [autoRotate, setAutoRotate] = useState<boolean>(true); // Estado para controle da rotação automática
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Armazena dados formatados de cada gráfico
  const [producaoTempoData, setProducaoTempoData] = useState({ labels: [], datasets: [] });
  const [eficienciaData, setEficienciaData] = useState({ labels: [], datasets: [] });
  const [producaoTecidoData, setProducaoTecidoData] = useState({ labels: [], datasets: [] });
  const [localidadesData, setLocalidadesData] = useState({ labels: [], datasets: [] });
  const [sobrasData, setSobrasData] = useState({ labels: [], datasets: [] });
  const [setupData, setSetupData] = useState({ labels: [], datasets: [] });
  const [tirasData, setTirasData] = useState({ labels: [], datasets: [] });

  // Estados para os KPIs
  const [kpiLoading, setKpiLoading] = useState<boolean>(true);
  const [kpiData, setKpiData] = useState<KpiData | null>(null);

  // Transforma o dado bruto do backend em estrutura esperada pelo componente de gráficos da Malwee
  const formatarDadosParaChart = (chartData, xAxisKey, seriesKey) => {
    if (!chartData.labels?.length) return [];
    return chartData.labels.map((labelItem, index) => ({
      [xAxisKey]: labelItem,
      [seriesKey]: chartData.datasets?.[0]?.data?.[index] || 0
    }));
  };

  // Dados formatados para os gráficos
  const eficienciaChartData = formatarDadosParaChart(eficienciaData, 'periodo', 'eficiencia');
  const producaoTempoChartData = formatarDadosParaChart(producaoTempoData, 'periodo', 'producao');
  const producaoTecidoChartData = formatarDadosParaChart(producaoTecidoData, 'tecido', 'producao');
  const setupChartData = formatarDadosParaChart(setupData, 'periodo', 'setup');
  const tirasChartData = formatarDadosParaChart(tirasData, 'periodo', 'tiras');

  // Função para iniciar a rotação automática
  const startAutoRotate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setActiveChart(current => {
        const i = chartKeys.indexOf(current);
        return chartKeys[(i + 1) % chartKeys.length];
      });
    }, 10000);
  };

  // Função para parar a rotação automática
  const stopAutoRotate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Função para alternar entre pausar e retomar
  const toggleAutoRotate = () => {
    if (autoRotate) {
      stopAutoRotate();
    } else {
      startAutoRotate();
    }
    setAutoRotate(!autoRotate);
  };

  // Carrega todos os dados assim que o dashboard é aberto
  useEffect(() => {
    const token = getToken();

    // Se o token sumir, redireciona imediatamente
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const handleAuthError = () => {
      console.error("Sessão expirada ou inválida.");
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('usuario');
      window.location.href = "/login";
    };

    // Função para chamar endpoints genéricos dos gráficos
    const fetchData = async (endpoint, setter, label, bg, border) => {
      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401 || response.status === 403) {
          handleAuthError();
          return;
        }

        if (!response.ok) throw new Error(`Erro ao buscar ${endpoint}`);

        const data = await response.json();
        setter(formatarDadosChart(data, label, bg, border));

      } catch (err) {
        console.error(err);
        setter({ labels: [], datasets: [] });
      }
    };

    // Carrega KPIs
    const fetchKpiData = async () => {
      setKpiLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/kpi-data`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401 || response.status === 403) {
          handleAuthError();
          return;
        }

        if (!response.ok) throw new Error('Erro nos KPIs');

        setKpiData(await response.json());

      } catch (error) {
        console.error(error);
        setKpiData(null);
      } finally {
        setKpiLoading(false);
      }
    };

    fetchKpiData();

    // Chamada para todos os gráficos
    fetchData("/api/chart-data", setEficienciaData, t('averageMeters'),
      "rgba(75, 192, 192, 0.2)", "rgba(75, 192, 192, 1)");

    fetchData("/api/chart-producao-tempo", setProducaoTempoData, t('productionTime'),
      "rgba(54, 162, 235, 0.2)", "rgba(54, 162, 235, 1)");

    fetchData("/api/chart-producao-tecido", setProducaoTecidoData, t('totalProduced'),
      ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)"], ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"]);

    fetchData("/api/chart-localidades", setLocalidadesData, t('totalProduced'),
      ["rgba(255, 205, 86, 0.2)", "rgba(75, 192, 192, 0.2)"], ["rgba(255, 205, 86, 1)", "rgba(75, 192, 192, 1)"]);

    fetchData("/api/chart-sobras", setSobrasData, t('rollWaste'),
      ["rgba(153, 102, 255, 0.2)", "rgba(255, 159, 64, 0.2)"], ["rgba(153, 102, 255, 1)", "rgba(255, 159, 64, 1)"]);

    fetchData("/api/chart-setup", setSetupData, t('averageTime'),
      "rgba(255, 99, 132, 0.2)", "rgba(255, 99, 132, 1)");

    fetchData("/api/chart-tiras", setTirasData, t('occurrences'),
      "rgba(192,192,192,0.2)", "rgba(192,192,192,1)");

  }, [t]);

  // Alternância automática dos gráficos a cada 10 segundos
  useEffect(() => {
    if (autoRotate) {
      startAutoRotate();
    }

    return () => {
      stopAutoRotate();
    };
  }, [autoRotate]);

  // Renderiza o gráfico atual selecionado
  const renderActiveChart = () => {
    switch (activeChart) {
      case 'eficiencia':
        return (
          <Chart
            data={eficienciaChartData}
            xAxis="periodo"
            series={{ bar: ['eficiencia'] }}
            labelMap={{ eficiencia: t('machineEfficiency') }}
            colors={["#55AF7D"]}
            height={350}
          />
        );

      case 'producaoTempo':
        return (
          <Chart
            data={producaoTempoChartData}
            xAxis="periodo"
            series={{ line: ['producao'] }}
            labelMap={{ producao: t('production') }}
            colors={["#2273E1"]}
            height={350}
          />
        );

      case 'producaoTecido':
        return (
          <Chart
            data={producaoTecidoChartData}
            xAxis="tecido"
            series={{ bar: ['producao'] }}
            labelMap={{ producao: t('production') }}
            colors={["#55AF7D"]}
            height={350}
          />
        );

      case 'localidade':
        return (
          <Chart
            data={localidadesData.labels?.map((label, index) => ({
              localidade: label,
              producao: localidadesData.datasets?.[0]?.data?.[index] || 0
            }))}
            xAxis="localidade"
            series={{ bar: ['producao'] }}
            labelMap={{ producao: t('productionMeters') }}
            colors={["#2273E1"]}
            height={350}
          />
        );

      case 'sobras':
        return (
          <Chart
            data={sobrasData.labels?.map((label, index) => ({
              periodo: label,
              sobras: sobrasData.datasets?.[0]?.data?.[index] || 0
            }))}
            xAxis="periodo"
            series={{ area: ['sobras'] }}
            labelMap={{ sobras: t('rollWaste') }}
            colors={["#8E68FF"]}
            height={350}
          />
        );

      case 'setup':
        return (
          <Chart
            data={setupChartData}
            xAxis="periodo"
            series={{ line: ['setup'] }}
            labelMap={{ setup: t('setupTime') }}
            colors={["#55AF7D"]}
            height={350}
          />
        );

      case 'tiras':
        return (
          <Chart
            data={tirasChartData}
            xAxis="periodo"
            series={{ bar: ['tiras'] }}
            labelMap={{ tiras: t('stripQuantity') }}
            colors={["#8E68FF"]}
            height={350}
          />
        );

      default:
        return null;
    }
  };

  // Renderiza conteúdo interno das KPIs
  const renderKpiCardContent = (data: KpiCardData | null | undefined) => {
    const loading = kpiLoading || !data;
    return (
      <h2 className="text-2xl font-bold text-[var(--text)] mb-1">
        {loading ? "..." : data.valor}
      </h2>
    );
  };

  return (
    <main className="flex flex-col min-h-screen md:ml-[80px] ml-0 bg-[var(--surface)] text-[var(--text)] px-4 overflow-x-hidden">

      {/* Título */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t('malweeGroup')}</h1>
          <p className="text-sm text-[var(--text-muted)]">{t('dataVisualizationCutting')}</p>
        </div>

        {/* Botão de controle da rotação automática */}
        <button
          onClick={toggleAutoRotate}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors mt-4 md:mt-0 ${
            autoRotate
              ? 'bg-[#8E68FF] text-white'
              : 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]'
          }`}
        >
          <i className={`ri-${autoRotate ? 'pause' : 'play'}-line`}></i>
          {autoRotate ? t('pauseRotation') : t('resumeRotation')}
        </button>
      </div>

      {/* KPIs */}
      <h1 className="text-2xl font-semibold mb-6">{t('productionOverview')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* Eficiencia */}
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl">
          <div className="flex justify-between items-center text-[var(--text-muted)] mb-2">
            <h3 className="text-sm">{t('machineEfficiency')}</h3>
            <i className="ri-line-chart-line text-xl text-[var(--yellow)]"></i>
          </div>
          {renderKpiCardContent(kpiData?.eficiencia)}
        </div>

        {/* Atingimento */}
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl">
          <div className="flex justify-between items-center text-[var(--text-muted)] mb-2">
            <h3 className="text-sm">{t('goalAchievement')}</h3>
            <i className="ri-check-double-line text-xl text-[var(--accent2)]"></i>
          </div>
          {renderKpiCardContent(kpiData?.atingimento)}
        </div>

        {/* Produção */}
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl">
          <div className="flex justify-between items-center text-[var(--text-muted)] mb-2">
            <h3 className="text-sm">{t('totalProduction')}</h3>
            <i className="ri-ruler-2-line text-xl text-cyan-400"></i>
          </div>
          {renderKpiCardContent(kpiData?.producao)}
        </div>

        {/* Paradas */}
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl">
          <div className="flex justify-between items-center text-[var(--text-muted)] mb-2">
            <h3 className="text-sm">{t('stoppagesSetup')}</h3>
            <i className="ri-time-line text-xl text-[var(--red)]"></i>
          </div>
          {renderKpiCardContent(kpiData?.paradas)}
        </div>
      </div>

      {/* Container do gráfico */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">

        {/* Botões para troca manual dos gráficos */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
          {chartButtons.map((button) => (
            <button
              key={button.key}
              onClick={() => setActiveChart(button.key)}
              className={`px-3 py-1 rounded-lg transition-colors 
                ${
                  activeChart === button.key
                    ? 'bg-[#8E68FF] text-white font-medium'
                    : 'bg-[var(--surface)] text-[var(--text)]'
                }
              `}
            >
              {t(button.label)}
            </button>
          ))}
        </div>

        {/* Indicador de rotação automática */}
        <div className="flex items-center justify-center mb-4 text-sm text-[var(--text-muted)]">
          <i className={`ri-${autoRotate ? 'play' : 'pause'}-line mr-2`}></i>
          {autoRotate ? t('autoRotationEnabled') : t('autoRotationPaused')}
        </div>

        {/* Gráfico */}
        <div className="relative w-full h-[50vh] md:h-[400px] overflow-hidden">
          {renderActiveChart()}
        </div>
      </div>

      <Footer />
    </main>
  );
};