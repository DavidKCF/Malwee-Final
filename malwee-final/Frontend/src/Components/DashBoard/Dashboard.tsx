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

const getToken = () => {
  return localStorage.getItem('jwt_token');
};

const formatarDadosChart = (backendData, label, backgroundColor, borderColor) => {
  if (!backendData || !backendData.labels || !backendData.data) {
    console.warn("Dados do backend inválidos ou ausentes:", backendData);
    return { labels: [], datasets: [] };
  }

  return {
    labels: backendData.labels,
    datasets: [
      {
        label: label,
        data: backendData.data.map(d => parseFloat(d)),
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
        fill: Array.isArray(backgroundColor) ? false : backgroundColor.includes('rgba'),
      },
    ],
  };
};

export const Footer: React.FC = () => {
  const { t } = useAccessibility();

  return (
    <footer className="mt-8 py-6 text-center text-sm text-[var(--text-muted)] border-t border-[var(--border)]">
      {t('footerCopyright')}
    </footer>
  );
};

const chartButtons = [
  { label: "machineEfficiency", key: "eficiencia", type: "bar" },
  { label: "productionTime", key: "producaoTempo", type: "line" },
  { label: "productionFabric", key: "producaoTecido", type: "bar" },
  { label: "productionLocation", key: "localidade", type: "pie" },
  { label: "rollWaste", key: "sobras", type: "doughnut" },
  { label: "setupTime", key: "setup", type: "line" },
  { label: "stripQuantity", key: "tiras", type: "bar" },
];

const chartKeys = chartButtons.map(b => b.key)

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

  const [activeChart, setActiveChart] = useState<string>('eficiencia');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [producaoTempoData, setProducaoTempoData] = useState({ labels: [], datasets: [] });
  const [eficienciaData, setEficienciaData] = useState({ labels: [], datasets: [] });
  const [producaoTecidoData, setProducaoTecidoData] = useState({ labels: [], datasets: [] });
  const [localidadesData, setLocalidadesData] = useState({ labels: [], datasets: [] });
  const [sobrasData, setSobrasData] = useState({ labels: [], datasets: [] });
  const [setupData, setSetupData] = useState({ labels: [], datasets: [] });
  const [tirasData, setTirasData] = useState({ labels: [], datasets: [] });

  const [kpiLoading, setKpiLoading] = useState<boolean>(true);
  const [kpiData, setKpiData] = useState<KpiData | null>(null);

  const formatarDadosParaChart = (chartData, xAxisKey, seriesKey, label) => {
    if (!chartData.labels || chartData.labels.length === 0) {
      return [];
    }

    return chartData.labels.map((labelItem, index) => ({
      [xAxisKey]: labelItem,
      [seriesKey]: chartData.datasets?.[0]?.data?.[index] || 0
    }));
  };

  const eficienciaChartData = formatarDadosParaChart(eficienciaData, 'periodo', 'eficiencia', t('machineEfficiency'));
  const producaoTempoChartData = formatarDadosParaChart(producaoTempoData, 'periodo', 'producao', t('production'));
  const producaoTecidoChartData = formatarDadosParaChart(producaoTecidoData, 'tecido', 'producao', t('production'));
  const setupChartData = formatarDadosParaChart(setupData, 'periodo', 'setup', t('setupTime'));
  const tirasChartData = formatarDadosParaChart(tirasData, 'periodo', 'tiras', t('stripQuantity'));

  useEffect(() => {
    const token = getToken();

    // Se não tiver token, redireciona para o login imediatamente
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

    const fetchKpiData = async () => {
      setKpiLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/kpi-data`, {
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
          throw new Error('Erro ao buscar dados dos KPIs');
        }
        const data: KpiData = await response.json();
        setKpiData(data);
      } catch (error) {
        console.error(error);
        setKpiData(null);
      } finally {
        setKpiLoading(false)
      }
    };

    fetchKpiData();

    fetchData(
      "/api/chart-data",
      setEficienciaData,
      t('averageMeters'),
      "rgba(75, 192, 192, 0.2)",
      "rgba(75, 192, 192, 1)"
    );
    fetchData(
      "/api/chart-producao-tempo",
      setProducaoTempoData,
      t('productionTime'),
      "rgba(54, 162, 235, 0.2)",
      "rgba(54, 162, 235, 1)"
    );
    fetchData(
      "/api/chart-producao-tecido",
      setProducaoTecidoData,
      t('totalProduced'),
      ["rgba(255, 159, 64, 0.5)", "rgba(75, 192, 192, 0.5)", "rgba(153, 102, 255, 0.5)", "rgba(255, 206, 86, 0.5)"],
      ["rgba(255, 159, 64, 1)", "rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)", "rgba(255, 206, 86, 1)"]
    );
    fetchData(
      "/api/chart-localidades",
      setLocalidadesData,
      t('totalProduced'),
      ["rgba(153, 102, 255, 0.5)", "rgba(54, 162, 235, 0.5)", "rgba(255, 99, 132, 0.5)", "rgba(75, 192, 192, 0.5)"],
      ["rgba(153, 102, 255, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)", "rgba(75, 192, 192, 1)"]
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

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveChart(currentChart => {
        const currentIndex = chartKeys.indexOf(currentChart);
        const nextIndex = (currentIndex + 1) % chartKeys.length;
        return chartKeys[nextIndex]
      });
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    };
  }, []);

  const renderActiveChart = () => {
    switch (activeChart) {
      case 'eficiencia':
        return (
          <Chart
            data={eficienciaChartData}
            xAxis="periodo"
            series={{ bar: ['eficiencia'] }}
            labelMap={{ eficiencia: t('machineEfficiency') }}
            colors={["#3b82f6"]}
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
            colors={["#10b981"]}
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
            colors={["#8b5cf6"]}
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
            colors={["#3b82f6"]}
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
            colors={["#06b6d4"]}
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
            colors={["#ef4444"]}
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
            colors={["#f59e0b"]}
            height={350}
          />
        );
      default:
        return (
          <Chart
            data={eficienciaChartData}
            xAxis="periodo"
            series={{ bar: ['eficiencia'] }}
            labelMap={{ eficiencia: t('machineEfficiency') }}
            colors={["#3b82f6"]}
            height={350}
          />
        );
    }
  };

  const handleChartButtonClick = (chartKey: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setActiveChart(chartKey);
  }

  const renderKpiCardContent = (data: KpiCardData | null | undefined) => {
    const isLoading = kpiLoading || !data;
    const valor = isLoading ? "..." : data!.valor;

    return (
      <>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-1">
          {valor}
        </h2>
      </>
    );
  }

  return (
    <main className="flex flex-col min-h-screen md:ml-[80px] ml-0 bg-[var(--surface)] text-[var(--text)] px-4 md:px-0 overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">{t('malweeGroup')}</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {t('dataVisualizationCutting')}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0"></div>
      </div>

      <h1 className="text-2xl font-semibold mb-6 text-[var(--text)]">{t('productionOverview')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl">
          <div className="flex justify-between items-center text-[var(--text-muted)] mb-2">
            <h3 className="text-sm">{t('machineEfficiency')}</h3>
            <i className="ri-line-chart-line text-xl text-[var(--yellow)]"></i>
          </div>
          {renderKpiCardContent(kpiData?.eficiencia)}
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl">
          <div className="flex justify-between items-center text-[var(--text-muted)] mb-2">
            <h3 className="text-sm">{t('goalAchievement')}</h3>
            <i className="ri-check-double-line text-xl text-[var(--accent2)]"></i>
          </div>
          {renderKpiCardContent(kpiData?.atingimento)}
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl">
          <div className="flex justify-between items-center text-[var(--text-muted)] mb-2">
            <h3 className="text-sm">{t('totalProduction')}</h3>
            <i className="ri-ruler-2-line text-xl text-cyan-400"></i>
          </div>
          {renderKpiCardContent(kpiData?.producao)}
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl">
          <div className="flex justify-between items-center text-[var(--text-muted)] mb-2">
            <h3 className="text-sm">{t('stoppagesSetup')}</h3>
            <i className="ri-time-line text-xl text-[var(--red)]"></i>
          </div>
          {renderKpiCardContent(kpiData?.paradas)}
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 min-w-0">
        <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start w-full">
          {chartButtons.map((button) => (
            <button
              key={button.key}
              onClick={() => handleChartButtonClick(button.key)}
              className={`px-3 py-1 rounded-lg transition-colors duration-200
              ${activeChart === button.key
                  ? 'bg-[#8E68FF] text-white font-medium'
                  : 'bg-[var(--surface)] text-[var(--text)]'
                }`}
            >
              {t(button.label)}
            </button>
          ))}
        </div>

        <div className="relative w-full h-[50vh] md:h-[400px] max-w-full overflow-x-hidden" id="chart-container">
          {renderActiveChart()}
        </div>
      </div>

      <Footer />
    </main>
  );
};