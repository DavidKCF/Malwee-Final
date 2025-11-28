import React, { useState, useEffect } from "react";
import { Footer } from "../Footer/Footer";
import { useAccessibility } from "../Acessibilidade/AccessibilityContext";

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

interface HistoryItem {
  id: number;
  data: Date;
  maquina: string;
  tipoTecido: string;
  tipoSaida: string;
  numeroTarefa: number;
  tempoSetup: number;
  tempoProducao: number;
  quantidadeCarreiras: number;
  metrosProduzidos: number;
  observacoes: string;
  tarefaCompleta: boolean;
  sobrasRolo: boolean;
}

export const CadastroDados: React.FC = () => {
  const { t, language } = useAccessibility();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [maquina, setMaquina] = useState("");
  const [fabricType, setFabricType] = useState("0");
  const [outputType, setOutputType] = useState("0");
  const [numeroTarefa, setNumeroTarefa] = useState("");
  const [tempoSetup, setTempoSetup] = useState("");
  const [tempoProducao, setTempoProducao] = useState("");
  const [quantidadeCarreiras, setQuantidadeCarreiras] = useState("");
  const [metrosProduzidos, setMetrosProduzidos] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [tarefaCompleta, setTarefaCompleta] = useState(false);
  const [sobrasRolo, setSobrasRolo] = useState(false);

  // Estados para modais e ações
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<HistoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<HistoryItem | null>(null);

  // Estados para dados e loading
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fabricOptions = [
    "0 - Meia Malha",
    "1 - Cotton",
    "2 - Punho Pun",
    "3 - Punho New",
    "4 - Punho San",
    "5 - Punho Elan",
  ].map((n) => ({
    label: n,
    value: n,
  }));

  const outputOptions = ["0 - Rolinho", "1 - Fraldado"].map((n) => ({
    label: n,
    value: n,
  }));

  const getFabricTypeLabel = (typeNumber: number): string => {
    const fabricTypes: { [key: number]: string } = {
      0: "0 - Meia Malha",
      1: "1 - Cotton",
      2: "2 - Punho Pun",
      3: "3 - Punho New",
      4: "4 - Punho San",
      5: "5 - Punho Elan"
    };
    return fabricTypes[typeNumber] || `Tecido ${typeNumber}`;
  };

  const getOutputTypeLabel = (typeNumber: number): string => {
    const outputTypes: { [key: number]: string } = {
      0: "0 - Rolinho",
      1: "1 - Fraldado"
    };
    return outputTypes[typeNumber] || `Saída ${typeNumber}`;
  };

  const loadHistoryData = async () => {
    const token = localStorage.getItem("jwt_token");

    if (!token) {
      console.error("Usuário não autenticado");
      return;
    }

    setLoading(true);
    try {
      console.log("🔄 Fazendo requisição para /api/historico...");

      const response = await fetch("http://localhost:3000/api/historico", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("📊 Status da resposta:", response.status);

      if (response.status === 401 || response.status === 403) {
        alert("Sessão expirada. Faça login novamente.");
        localStorage.removeItem("jwt_token");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro do servidor:", errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Dados recebidos da API:", data);

      // Verificar se há dados
      if (!data || data.length === 0) {
        console.log("📭 Nenhum dado encontrado no banco");
        setHistoryData([]);
        return;
      }

      // Transformar os dados da API para o formato do frontend
      const formattedData: HistoryItem[] = data.map((item: any, index: number) => {
        console.log(`📝 Processando item ${index}:`, item);

        const formattedItem = {
          id: item.id || `temp-${index}-${Date.now()}`,
          data: new Date(item.data),
          maquina: item.Maquina || item.maquina || "N/A",
          tipoTecido: getFabricTypeLabel(item['Tipo Tecido'] || item.tipoTecido),
          tipoSaida: getOutputTypeLabel(item['Tipo de Saida'] || item.tipoSaida),
          numeroTarefa: item['Numero da tarefa'] || item.numeroTarefa || 0,
          tempoSetup: item['Tempo de setup'] || item.tempoSetup || 0,
          tempoProducao: item['Tempo de Produção'] || item.tempoProducao || 0,
          quantidadeCarreiras: item['Quantidade de Trass'] || item.quantidadeCarreiras || 0,
          metrosProduzidos: item['Metros Produzidos'] || item.metrosProduzidos || 0,
          observacoes: item.observacoes || item.Observações || "",
          tarefaCompleta: item['Tarefa completa?'] === 'TRUE' || item.tarefaCompleta === true || item.tarefaCompleta === 1,
          sobrasRolo: item['Sobra de Rolo?'] === 'TRUE' || item.sobrasRolo === true || item.sobrasRolo === 1
        };

        console.log(`🎯 Item ${index} formatado:`, formattedItem);
        return formattedItem;
      });

      console.log("📦 Dados formatados:", formattedData);

      // Pegar apenas os últimos 3 registros
      const lastThreeRecords = formattedData.slice(0, 3);
      setHistoryData(lastThreeRecords);

    } catch (error) {
      console.error("❌ Erro ao carregar histórico:", error);
      alert("Não foi possível carregar o histórico de produção");
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    loadHistoryData();
  }, []);

  // Função para adicionar novo registro
  const handleAddRecord = async () => {
    if (!selectedDate || !maquina) {
      alert("Preencha pelo menos Data e Máquina");
      return;
    }

    const token = localStorage.getItem("jwt_token");

    if (!token) {
      alert("Usuário não autenticado. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    const newRecord = {
      data: selectedDate.toISOString(),
      maquina,
      tipoTecido: fabricType,
      tipoSaida: outputType,
      numeroTarefa: parseInt(numeroTarefa) || 0,
      tempoSetup: parseInt(tempoSetup) || 0,
      tempoProducao: parseInt(tempoProducao) || 0,
      quantidadeCarreiras: parseInt(quantidadeCarreiras) || 0,
      metrosProduzidos: parseInt(metrosProduzidos) || 0,
      observacoes,
      tarefaCompleta,
      sobrasRolo
    };

    try {
      const response = await fetch("http://localhost:3000/api/cadastroDados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRecord),
      });

      if (response.status === 401 || response.status === 403) {
        alert("Sessão expirada ou sem permissão. Faça login novamente.");
        localStorage.removeItem("jwt_token");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        console.error("Erro do servidor:", text);
        throw new Error("Erro ao enviar dados para o servidor");
      }

      const data = await response.json();
      alert("Registro adicionado com sucesso! ID: " + data.id);

      // Recarregar o histórico após adicionar
      await loadHistoryData();
      handleClearForm();
    } catch (error) {
      console.error("Erro ao enviar registro:", error);
      alert("Não foi possível adicionar o registro. Veja o console para detalhes.");
    }
  };

  // Função para editar registro
  const handleEditRecord = () => {
    if (!editingItem) return;

    const updatedData = historyData.map((item) =>
      item.id === editingItem.id ? editingItem : item
    );

    setHistoryData(updatedData);
    setEditingItem(null);
  };

  // Função para deletar registro
  const handleDeleteRecord = () => {
    if (!deletingItem) return;

    const filteredData = historyData.filter((item) => item.id !== deletingItem.id);
    setHistoryData(filteredData);
    setDeletingItem(null);
  };

  // Função para abrir modal de edição
  const openEditModal = (item: HistoryItem) => {
    setEditingItem({ ...item });
  };

  // Função para abrir modal de visualização
  const openViewModal = (item: HistoryItem) => {
    setViewingItem(item);
  };

  // Função para abrir modal de deleção
  const openDeleteModal = (item: HistoryItem) => {
    setDeletingItem(item);
  };

  // Função para limpar formulário
  const handleClearForm = () => {
    setMaquina("");
    setFabricType("0");
    setOutputType("0");
    setNumeroTarefa("");
    setTempoSetup("");
    setTempoProducao("");
    setQuantidadeCarreiras("");
    setMetrosProduzidos("");
    setObservacoes("");
    setTarefaCompleta(false);
    setSobrasRolo(false);
    setSelectedDate(new Date());
  };

  return (
    <main className="flex flex-col min-h-screen ml-[80px] bg-[var(--surface)] text-[var(--text)]">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)]">{t("malweeGroup")}</h1>
        <p className="text-[var(--text-muted)] text-lg">{t("dataVisualizationSewing")}</p>
        <p className="mt-3 text-[18px] font-semibold text-[var(--text)]">
          {t("dataRegistration")}
        </p>
      </header>

      {/* FORMULÁRIO */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 mb-8 shadow-md">
        <h2 className="text-lg font-semibold mb-6 text-[var(--text)]">
          {t("addProductionRecord")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* DateTime */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("dateTime")}
            </LabelBase>
            <DateTimePicker date={selectedDate} onChange={setSelectedDate} />
          </div>

          {/* Máquina */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("machine")}
            </LabelBase>
            <InputBase
              placeholder={t("machineExample")}
              value={maquina}
              onChange={(e) => setMaquina(e.target.value)}
            />
          </div>

          {/* Tipo de Tecido */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("fabricType")}
            </LabelBase>
            <Combobox
              items={fabricOptions}
              selected={fabricType}
              onChange={(v) => v !== null && setFabricType(v)}
              label=""
              placeholder={t("selectOption")}
              searchPlaceholder={t("searchPlaceholder")}
            />
          </div>

          {/* Tipo de Saída */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("outputType")}
            </LabelBase>
            <Combobox
              items={outputOptions}
              selected={outputType}
              onChange={(v) => v !== null && setOutputType(v)}
              label=""
              placeholder={t("selectOption")}
              searchPlaceholder={t("searchPlaceholder")}
            />
          </div>

          {/* Nº da Tarefa */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("taskNumber")}
            </LabelBase>
            <InputBase
              type="number"
              placeholder={t("taskNumberPlaceholder")}
              value={numeroTarefa}
              onChange={(e) => setNumeroTarefa(e.target.value)}
            />
          </div>

          {/* Tempo Setup */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("setupTime")}
            </LabelBase>
            <InputBase
              type="number"
              placeholder={t("minutes")}
              value={tempoSetup}
              onChange={(e) => setTempoSetup(e.target.value)}
            />
          </div>

          {/* Tempo Produção */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("productionTime")}
            </LabelBase>
            <InputBase
              type="number"
              placeholder={t("minutes")}
              value={tempoProducao}
              onChange={(e) => setTempoProducao(e.target.value)}
            />
          </div>

          {/* Quantidade de Carreiras */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("rowQuantity")}
            </LabelBase>
            <InputBase
              type="number"
              placeholder={t("quantity")}
              value={quantidadeCarreiras}
              onChange={(e) => setQuantidadeCarreiras(e.target.value)}
            />
          </div>

          {/* Metros Produzidos */}
          <div>
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("metersProduced")}
            </LabelBase>
            <InputBase
              type="number"
              placeholder={t("meters")}
              value={metrosProduzidos}
              onChange={(e) => setMetrosProduzidos(e.target.value)}
            />
          </div>

          {/* Observações */}
          <div className="lg:col-span-2">
            <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
              {t("observations")}
            </LabelBase>
            <InputBase
              placeholder={t("optionalObservations")}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>

        {/* CHECKBOXES */}
        <div className="flex items-center gap-6 mt-4">
          <LabelBase className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
            <CheckboxBase checked={tarefaCompleta} onCheckedChange={setTarefaCompleta} />
            {t("taskComplete")}
          </LabelBase>

          <LabelBase className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
            <CheckboxBase checked={sobrasRolo} onCheckedChange={setSobrasRolo} />
            {t("rollWaste")}
          </LabelBase>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--border)]">
          <ButtonBase variant="outline" onClick={handleClearForm}>
            {t("clear")}
          </ButtonBase>
          <ButtonBase onClick={handleAddRecord}>{t("addRecord")}</ButtonBase>
        </div>
      </section>

      {/* HISTÓRICO DE PRODUÇÃO */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[var(--text)]">
            {t("productionHistory")}
          </h1>
          <ButtonBase
            variant="outline"
            onClick={loadHistoryData}
            disabled={loading}
          >
            {loading ? "Carregando..." : "Atualizar"}
          </ButtonBase>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--surface)] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t("date")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("machine")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("fabricType")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("outputType")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("taskNumber")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("setupTimeShort")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("productionTimeShort")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("rows")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("metersProduced")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("observationsShort")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("complete")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("rollWasteHeader")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="border-t border-[var(--border)]">
                  <td colSpan={14} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    Carregando dados...
                  </td>
                </tr>
              ) : historyData.length === 0 ? (
                <tr className="border-t border-[var(--border)]">
                  <td colSpan={14} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    {t("noRecordsFound")}
                  </td>
                </tr>
              ) : (
                historyData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-[var(--border)] hover:bg-[var(--surface)]"
                  >
                    {/* Dados da Linha */}
                    <td className="px-4 py-3 text-[var(--text)] whitespace-nowrap">
                      {item.data.toLocaleString(language)}
                    </td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.maquina}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.tipoTecido}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.tipoSaida}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.numeroTarefa}</td>
                    <td className="px-4 py-3 text-[var(--text)]">
                      {item.tempoSetup} {t("unitMin")}
                    </td>
                    <td className="px-4 py-3 text-[var(--text)]">
                      {item.tempoProducao} {t("unitMin")}
                    </td>
                    <td className="px-4 py-3 text-[var(--text)]">
                      {item.quantidadeCarreiras}
                    </td>
                    <td className="px-4 py-3 text-[var(--text)]">
                      {item.metrosProduzidos}
                      {t("unitMeters")}
                    </td>
                    <td
                      className="px-4 py-3 text-[var(--text)] max-w-[200px] truncate"
                      title={item.observacoes}
                    >
                      {item.observacoes || "-"}
                    </td>
                    <td className="px-4 py-3 text-[var(--text)]">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${item.tarefaCompleta
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {item.tarefaCompleta ? t("yes") : t("no")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text)]">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${item.sobrasRolo
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {item.sobrasRolo ? t("yes") : t("no")}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-[var(--text)]">
                      <div className="flex gap-2">
                        {/* VISUALIZAÇÃO */}
                        <ModalBase
                          open={!!viewingItem && viewingItem.id === item.id}
                          onOpenChange={(open) => !open && setViewingItem(null)}
                        >
                          <ModalTriggerBase asChild>
                            <VisibilityButton
                              className="p-2 rounded-lg hover:bg-[var(--hover)] text-[var(--text-muted)] transition"
                              title={t("view")}
                              onClick={() => openViewModal(item)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-eye"
                              >
                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </VisibilityButton>
                          </ModalTriggerBase>

                          <ModalContentBase>
                            <ModalTitleBase>{t("viewRecord")}</ModalTitleBase>
                            <ModalDescriptionBase asChild>
                              <div className="space-y-2 text-sm text-[var(--text)]">
                                <p>
                                  <strong>{t("labelDate")}:</strong>{" "}
                                  {viewingItem?.data.toLocaleString(language)}
                                </p>
                                <p>
                                  <strong>{t("labelMachine")}:</strong> {viewingItem?.maquina}
                                </p>
                                <p>
                                  <strong>{t("labelFabricType")}:</strong>{" "}
                                  {viewingItem?.tipoTecido}
                                </p>
                                <p>
                                  <strong>{t("labelOutputType")}:</strong>{" "}
                                  {viewingItem?.tipoSaida}
                                </p>
                                <p>
                                  <strong>{t("labeltaskNumber")}:</strong>{" "}
                                  {viewingItem?.numeroTarefa}
                                </p>
                                <p>
                                  <strong>{t("labelSetupTime")}:</strong>{" "}
                                  {viewingItem?.tempoSetup} {t("unitMin")}
                                </p>
                                <p>
                                  <strong>{t("labelProductionTime")}:</strong>{" "}
                                  {viewingItem?.tempoProducao} {t("unitMin")}
                                </p>
                                <p>
                                  <strong>{t("labelRows")}:</strong>{" "}
                                  {viewingItem?.quantidadeCarreiras}
                                </p>
                                <p>
                                  <strong>{t("labelMetersProduced")}:</strong>{" "}
                                  {viewingItem?.metrosProduzidos}
                                  {t("unitMeters")}
                                </p>
                                <p>
                                  <strong>{t("labelObservations")}:</strong>{" "}
                                  {viewingItem?.observacoes || t("none")}
                                </p>
                                <p>
                                  <strong>{t("labelTaskComplete")}:</strong>{" "}
                                  {viewingItem?.tarefaCompleta ? t("yes") : t("no")}
                                </p>
                                <p>
                                  <strong>{t("labelRollWaste")}:</strong>{" "}
                                  {viewingItem?.sobrasRolo ? t("yes") : t("no")}
                                </p>
                              </div>
                            </ModalDescriptionBase>
                            <ModalFooterBase>
                              <ButtonBase
                                variant="outline"
                                onClick={() => setViewingItem(null)}
                              >
                                {t("close")}
                              </ButtonBase>
                            </ModalFooterBase>
                          </ModalContentBase>
                        </ModalBase>

                        {/* EDIÇÃO */}
                        <ModalBase
                          open={!!editingItem && editingItem.id === item.id}
                          onOpenChange={(open) => !open && setEditingItem(null)}
                        >
                          <ModalTriggerBase asChild>
                            <EditButton
                              className="p-2 rounded-lg hover:bg-[var(--hover)] text-[var(--text-muted)] transition"
                              title={t("edit")}
                              onClick={() => openEditModal(item)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-pencil"
                              >
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7 21l-4 1 1-4L17 3z" />
                              </svg>
                            </EditButton>
                          </ModalTriggerBase>

                          <ModalContentBase>
                            <ModalTitleBase>{t("editRecord")}</ModalTitleBase>
                            <ModalDescriptionBase asChild>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <LabelBase>{t("labelMachine")}</LabelBase>
                                    <InputBase
                                      value={editingItem?.maquina || ""}
                                      onChange={(e) =>
                                        setEditingItem((prev) =>
                                          prev ? { ...prev, maquina: e.target.value } : null
                                        )
                                      }
                                    />
                                  </div>

                                  <div>
                                    <LabelBase>{t("labeltaskNumber")}</LabelBase>
                                    <InputBase
                                      type="number"
                                      value={editingItem?.numeroTarefa || 0}
                                      onChange={(e) =>
                                        setEditingItem((prev) =>
                                          prev
                                            ? {
                                              ...prev,
                                              numeroTarefa: parseInt(e.target.value) || 0,
                                            }
                                            : null
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <LabelBase>{t("labelSetupTime")}</LabelBase>
                                    <InputBase
                                      type="number"
                                      value={editingItem?.tempoSetup || 0}
                                      onChange={(e) =>
                                        setEditingItem((prev) =>
                                          prev
                                            ? {
                                              ...prev,
                                              tempoSetup: parseInt(e.target.value) || 0,
                                            }
                                            : null
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <LabelBase>{t("labelProductionTime")}</LabelBase>
                                    <InputBase
                                      type="number"
                                      value={editingItem?.tempoProducao || 0}
                                      onChange={(e) =>
                                        setEditingItem((prev) =>
                                          prev
                                            ? {
                                              ...prev,
                                              tempoProducao: parseInt(e.target.value) || 0,
                                            }
                                            : null
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <LabelBase>{t("labelRows")}</LabelBase>
                                    <InputBase
                                      type="number"
                                      value={editingItem?.quantidadeCarreiras || 0}
                                      onChange={(e) =>
                                        setEditingItem((prev) =>
                                          prev
                                            ? {
                                              ...prev,
                                              quantidadeCarreiras:
                                                parseInt(e.target.value) || 0,
                                            }
                                            : null
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <LabelBase>{t("labelMetersProduced")}</LabelBase>
                                    <InputBase
                                      type="number"
                                      value={editingItem?.metrosProduzidos || 0}
                                      onChange={(e) =>
                                        setEditingItem((prev) =>
                                          prev
                                            ? {
                                              ...prev,
                                              metrosProduzidos:
                                                parseInt(e.target.value) || 0,
                                            }
                                            : null
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                <div>
                                  <LabelBase>{t("labelObservations")}</LabelBase>
                                  <InputBase
                                    value={editingItem?.observacoes || ""}
                                    onChange={(e) =>
                                      setEditingItem((prev) =>
                                        prev
                                          ? { ...prev, observacoes: e.target.value }
                                          : null
                                      )
                                    }
                                  />
                                </div>
                                <div className="flex gap-4">
                                  <LabelBase className="flex items-center gap-2">
                                    <CheckboxBase
                                      checked={editingItem?.tarefaCompleta || false}
                                      onCheckedChange={(checked) =>
                                        setEditingItem((prev) =>
                                          prev
                                            ? { ...prev, tarefaCompleta: !!checked }
                                            : null
                                        )
                                      }
                                    />
                                    {t("labelTaskComplete")}
                                  </LabelBase>
                                  <LabelBase className="flex items-center gap-2">
                                    <CheckboxBase
                                      checked={editingItem?.sobrasRolo || false}
                                      onCheckedChange={(checked) =>
                                        setEditingItem((prev) =>
                                          prev ? { ...prev, sobrasRolo: !!checked } : null
                                        )
                                      }
                                    />
                                    {t("labelRollWaste")}
                                  </LabelBase>
                                </div>
                              </div>
                            </ModalDescriptionBase>
                            <ModalFooterBase>
                              <ButtonBase
                                variant="outline"
                                onClick={() => setEditingItem(null)}
                              >
                                {t("cancel")}
                              </ButtonBase>
                              <ButtonBase onClick={handleEditRecord}>{t("save")}</ButtonBase>
                            </ModalFooterBase>
                          </ModalContentBase>
                        </ModalBase>

                        {/* EXCLUSÃO */}
                        <ModalBase
                          open={!!deletingItem && deletingItem.id === item.id}
                          onOpenChange={(open) => !open && setDeletingItem(null)}
                        >
                          <ModalTriggerBase asChild>
                            <CloseButton
                              className="p-2 rounded-lg hover:bg-red-600/20 text-red-500 transition"
                              title={t("delete")}
                              onClick={() => openDeleteModal(item)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-trash2"
                              >
                                <path d="M3 6h18" />
                                <path d="M8 6V4h8v2" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M5 6l1 14h12l1-14" />
                              </svg>
                            </CloseButton>
                          </ModalTriggerBase>

                          <ModalContentBase>
                            <ModalTitleBase>{t("deleteRecord")}</ModalTitleBase>
                            <ModalDescriptionBase>
                              {t("deleteRecordDesc")} (ID: {deletingItem?.id})
                              <br />
                              <strong>Máquina:</strong> {deletingItem?.maquina} |
                              <strong> Data:</strong>{" "}
                              {deletingItem?.data.toLocaleString(language)}
                            </ModalDescriptionBase>
                            <ModalFooterBase>
                              <ButtonBase
                                variant="outline"
                                onClick={() => setDeletingItem(null)}
                              >
                                {t("cancel")}
                              </ButtonBase>
                              <ButtonBase
                                variant="destructive"
                                onClick={handleDeleteRecord}
                              >
                                {t("delete")}
                              </ButtonBase>
                            </ModalFooterBase>
                          </ModalContentBase>
                        </ModalBase>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Footer />
    </main>
  );
};