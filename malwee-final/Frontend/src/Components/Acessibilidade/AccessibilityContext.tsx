// @ts-nocheck
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";

// --- TRADUÇÕES ---
const translations = {
  "pt-BR": {
    filter: "Filtrar",
    dateTime: "Data/Hora",
    machine: "Máquina",
    fabricType: "Tipo de Tecido", 
    taskComplete: "Tarefa Completa?",
    taskNumber: "Nº Tarefa",
    setupTime: "T. Setup (s)",
    productionTime: "T. Produção (s)",
    metersProduced: "Metros Prod.",
    complete: "Completa?",
    all: "Todos",
    yes: "Sim",
    no: "Não",
    clear: "Limpar",
    copy: "Copiar",
    searchTable: "Pesquisar na tabela...",
    loadingData: "Carregando dados...",
    error: "Erro",
    noResults: "Nenhum resultado encontrado para os filtros aplicados.",
    showing: "Mostrando",
    of: "de",
    records: "registros",
    page: "Página",
    previous: "Anterior",
    next: "Próxima",
    csvHeaderError: "Erro ao ler o cabeçalho do arquivo CSV. Verifique o console.",
    csvProcessingError: "Não foi possível processar o arquivo CSV.",
    unknownError: "Erro desconhecido ao processar dados.",
    copiedToClipboard: "Copiado para a área de transferência!",
    copiedFallback: "Copiado (fallback)!",
    copyFailedFallback: "Falha ao copiar (fallback):",
    copyFailed: "Falha ao copiar.",
    date: "Data",
    footerCopyright: "© 2025 Grupo Malwee. Todos os direitos reservados.",
    dataVisualizationSewing: "Visualização dos Dados e Demandas - Corte",
    productionReport: "Relatório de Produção",
    searchFilter: "Filtro de Pesquisa",
    searchResults: "Resultado da Pesquisa",
    startDate: "Data Início",
    endDate: "Data Fim",
    rollWaste: "Sobra de Rolo",
    tomatoNumber: "Nº Tomate",
    tomatoNumberPlaceholder: "Número do tomate",
    setupTimeShort: "Tempo Setup",
    productionTimeShort: "Tempo Produção",
    rows: "Carreiras",
    rollWasteHeader: "Sobras Rolo",
    actions: "Ações",
    noRecordsFound: "Nenhum registro encontrado",
    unitMin: "min",
    unitMeters: "m",
    none: "Nenhuma",
    // Para o modal de visualização
    labelDate: "Data",
    labelMachine: "Máquina",
    labelTomatoNumber: "Nº Tomato",
    labelFabricType: "Tipo de Tecido",
    labelOutputType: "Tipo de Saída",
    labelBarrelNumber: "Nº Barril",
    labelSetupTime: "Tempo Setup",
    labelProductionTime: "Tempo Produção",
    labelRows: "Carreiras",
    labelMetersProduced: "Metros Produzidos",
    labelObservations: "Observações",
    labelTaskComplete: "Tarefa Completa",
    labelRollWaste: "Sobras de Rolo",
    footerCopyright: "© 2025 - Grupo Malwee Ltda - Todos os Direitos Reservados",
    selectOption: "Selecione uma opção",
    searchPlaceholder: "Buscar opção...",
    productionHistory: "Histórico de Produção",
    view: "Visualizar",
    viewRecord: "Visualizar Registro",
    viewRecordDesc: "Aqui você pode visualizar os detalhes deste registro.",
    edit: "Editar",
    editRecord: "Editar Registro",
    editRecordDesc: "Edite os campos necessários e salve as alterações.",
    delete: "Excluir",
    deleteRecord: "Excluir Registro",
    deleteRecordDesc: "Tem certeza que deseja excluir este registro? Esta ação não poderá ser desfeita.",
    close: "Fechar",
    productionOverTime: "Produção ao Longo do Tempo (m)",
    productionMeters: "Produção (m)",
    productionByFabric: "Produção por Tecido (m)",
    productionByLocation: "Produção por Localidade (Máquina)",
    stripQuantityDistribution: "Distribuição da Quantidade de Tiras",
    stripQuantity: "Quantidade de Tiras",
    setupTimeMinutes: "Tempo de Setup (min)",
    selectDate: "Selecione uma data",
    myProfile: "Meu Perfil",
    userData: "Dados do Usuário",
    userPhotoAlt: "Foto do usuário",
    changePassword: "Alterar senha",
    currentPassword: "Senha Atual",
    newPassword: "Nova Senha",
    confirmNewPassword: "Confirmar Nova Senha",
    saveNewPassword: "Salvar Nova Senha",
    cancel: "Cancelar",
    fillAllFields: "Por favor, preencha todos os campos.",
    passwordsDontMatch: "As novas senhas não coincidem.",
    passwordMinLength: "A nova senha deve ter pelo menos 6 caracteres.",
    dataSavedSuccess: "Dados salvos com sucesso! (Recarregue a página para ver)",
    saveError: "Erro ao salvar os dados.",
    passwordChangedSuccess: "Senha alterada com sucesso! (Simulação)",
    login: "Login",
    birthDate: "Data de Nascimento",
    name: "Nome",
    cellphone: "Celular",
    phone: "Telefone",
    provider: "Prestador",
    notProvider: "Não é prestador",
    isProvider: "É prestador",
    save: "Salvar",
    addProductionRecord: "Adicionar Registro de Produção",
    dateTime: "Data/Hora",
    machineExample: "Ex: C01",
    outputType: "Tipo Saída",
    barrelNumber: "Nº Tonela",
    barrelNumberPlaceholder: "Número da tonela",
    setupTime: "Tempo Setup (min)",
    productionTime: "Tempo Produção (min)",
    minutes: "Minutos",
    rowQuantity: "Qtd Filas",
    quantity: "Quantidade",
    metersProduced: "Metros Produzidos",
    meters: "Metros",
    optionalObservations: "Observações opcionais",
    taskComplete: "Tarefa Completa",
    rollWaste: "Sobra de Rolo",
    addRecord: "Adicionar Registro",
    productionData: "Dados de Produção",
    import: "Importar",
    exportCSV: "Exportar CSV",
    averageProductionTime: "Tempo Médio Produção (min)",
    averageSetupTime: "Tempo Médio Setup (min)",
    totalRecords: "Total de Registros",
    resultsPerPage: "10 resultados por página",
    showingFrom: "Mostrando de",
    to: "até",
    production: "Produção",
    productionInput: "Entrada de Produção",
    fillParameters: "Preencha os parâmetros abaixo para gerar o resumo de produção.",
    thickness: "Espessura (mm)",
    stripWidth: "Largura da tira (mm)",
    fabricType: "Tipo de malha",
    meterage: "Metragem (m)",
    output: "Saída (peças)",
    density: "Densidade (kg/m³)",
    observations: "Observações (opcional)",
    productionNotes: "Notas sobre a produção",
    calculateSummary: "Calcular Resumo",
    exportCSV: "Exportar CSV",
    summary: "Resumo",
    quickOverview: "Visão rápida dos principais indicadores",
    areaPerMeter: "Área por metro (m²/m)",
    areaPerMeterDetail: "(largura × 1m)",
    totalVolume: "Volume total (m³)",
    totalVolumeDetail: "(metragem × largura × espess.)",
    estimatedCost: "Gasto estimado (kg)",
    estimatedCostDetail: "(volume × densidade)",
    yieldPerPiece: "Rendimento por peça (m)",
    yieldPerPieceDetail: "(metragem / saída)",
    selectedFabricType: "Tipo de malha selecionado",
    calculatedValues: "Valores calculados automaticamente. Ajuste a densidade se desejar outra estimativa.",
    wovenFabric: "Malha Tecida",
    cottonFabric: "Malha de Algodão",
    syntheticFabric: "Malha Sintética",
    dataVisualizationSewing: "Visualização dos Dados e Demandas - Corte",
    productionReport: "Relatório de Produção",
    searchFilter: "Filtro de Pesquisa",
    searchResults: "Resultado da Pesquisa",
    startDate: "Data Início",
    endDate: "Data Fim",
    machine: "Máquina",
    fabricType: "Tipo de Tecido",
    taskComplete: "Tarefa Completa?",
    taskNumber: "Nº Tarefa",
    setupTime: "T. Setup (s)",
    productionTime: "T. Produção (s)",
    metersProduced: "Metros Prod.",
    complete: "Completa?",
    all: "Todos",
    yes: "Sim",
    no: "Não",
    clear: "Limpar",
    copy: "Copiar",
    searchTable: "Pesquisar na tabela...",
    loadingData: "Carregando dados...",
    error: "Erro",
    noResults: "Nenhum resultado encontrado para os filtros aplicados.",
    showing: "Mostrando",
    of: "de",
    records: "registros",
    page: "Página",
    previous: "Anterior",
    next: "Próxima",
    csvHeaderError: "Erro ao ler o cabeçalho do arquivo CSV. Verifique o console.",
    csvProcessingError: "Não foi possível processar o arquivo CSV.",
    unknownError: "Erro desconhecido ao processar dados.",
    copiedToClipboard: "Copiado para a área de transferência!",
    copiedFallback: "Copiado (fallback)!",
    copyFailedFallback: "Falha ao copiar (fallback):",
    copyFailed: "Falha ao copiar.",
    date: "Data",
    footerCopyright: "© 2025 Grupo Malwee. Todos os direitos reservados.",
    dataVisualizationCutting: "Visualização dos Dados e Demandas - Corte",
    productionOverview: "VISÃO GERAL DE PRODUÇÃO",
    machineEfficiency: "Eficiência da Máquina",
    goalAchievement: "Atingimento de Metas",
    totalProduction: "Produção Total",
    stoppagesSetup: "Paradas (Setup)",
    productionTime: "Produção (Tempo)",
    productionFabric: "Produção/Tecido",
    productionLocation: "Produção/Localidade",
    rollWaste: "Sobra de Rolo",
    setupTime: "Tempo Setup",
    stripQuantity: "Quantidade de Tiras",
    averageMeters: "Média de Metros",
    totalProduced: "Total Produzido",
    averageTime: "Tempo Médio (min)",
    occurrences: "Ocorrências",
    title: "Ajustes de Acessibilidade do Sistema",
    subtitle: "Acessibilidade",
    toolsTitle: "Ferramentas de Acessibilidade",
    tool1: "Leitor de Tela",
    tool2: "Navegação por Teclado",
    tool3: "Navegação Inteligente",
    tool4: "Bloqueio de Piscar",
    tool6: "Comando de Voz",
    colorsTitle: "Ajuste de Cores",
    customContrast: "Personalizar Contraste",
    btnFunds: "Fundos",
    btnTitles: "Títulos",
    btnTexts: "Textos",
    btnResetColors: "Resetar Cores",
    contrast1: "Alto Contraste Claro",
    contrast2: "Alto Contraste Escuro",
    contrast3: "Monocromático",
    contentTitle: "Ajuste de Conteúdo",
    fontSize: "Tamanho da Fonte",
    cursor: "Cursor",
    cursorLight: "Claro",
    cursorDark: "Escuro",
    btnDisable: "Desativar Acessibilidade",
    btnDeclaration: "Declaração de Acessibilidade",
    btnFeedback: "Enviar Feedback",
    resetTooltip: "Resetar configurações",
    hideTooltip: "Esconder menu",
    cmdIncreaseFont: "aumentar fonte",
    cmdDecreaseFont: "diminuir fonte",
    cmdReset: "resetar",
    cmdContrastDark: "contraste escuro",
    cmdContrastLight: "contraste claro",
    cmdMonochrome: "monocromático",
    smartNavHelp: "Navegação Inteligente Ativada. Use:",
    smartNavH: "'H' para Títulos",
    smartNavL: "'L' para Links",
    smartNavB: "'B' para Botões",
    smartNavF: "'F' para Campos",
    modalClose: "Fechar",
    modalDeclarationTitle: "Declaração de Acessibilidade",
    modalDeclarationText: "Estamos comprometidos em fornecer um site acessível para o maior público possível, independentemente da tecnologia ou habilidade. Estamos trabalhando ativamente para aumentar a acessibilidade e a usabilidade de nosso site e, ao fazê-lo, aderimos a muitos dos padrões e diretrizes disponíveis.",
    modalFeedbackTitle: "Enviar Feedback",
    modalFeedbackText: "Encontrou algum problema de acessibilidade? Por favor, nos avise!",
    modalFeedbackPlaceholder: "Descreva o problema que você encontrou...",
    modalFeedbackSubmit: "Enviar",
    

    // NOVAS TRADUÇÕES ADICIONADAS
    home: "Início",
    dashboard: "Dashboard",
    reports: "Relatórios",
    productions: "Produção",
    dataRegistration: "Cadastro de Dados",
    user: "Usuário",
    settings: "Configurações",
    logout: "Sair",
    toggleTheme: "Alternar Tema",
    // TRADUÇÕES CORRIGIDAS PARA HOME
    malweeGroup: "Grupo Malwee",
    dataVisualization: "Visualização dos Dados e Demandas - Corte",
    production: "Produção",
    malweeLogoAlt: "Logo do Grupo Malwee",
  },
  "en-US": {
    selectDate: "Select Date",
    filter: "Filter",
    dateTime: "Date/Time",
    machine: "Machine",
    fabricType: "Fabric Type",
    taskComplete: "Task Complete?",
    taskNumber: "Task Number", 
    setupTime: "Setup Time (s)",
    productionTime: "Production Time (s)",
    metersProduced: "Meters Produced",
    complete: "Complete?",
    all: "All",
    yes: "Yes",
    no: "No",
    clear: "Clear",
    copy: "Copy",
    searchTable: "Search in table...",
    loadingData: "Loading data...",
    error: "Error",
    noResults: "No results found for the applied filters.",
    showing: "Showing",
    of: "of",
    records: "records",
    page: "Page",
    previous: "Previous",
    next: "Next",
    csvHeaderError: "Error reading CSV file header. Check the console.",
    csvProcessingError: "Could not process the CSV file.",
    unknownError: "Unknown error processing data.",
    copiedToClipboard: "Copied to clipboard!",
    copiedFallback: "Copied (fallback)!",
    copyFailedFallback: "Failed to copy (fallback):",
    copyFailed: "Failed to copy.",
    date: "Date",
    footerCopyright: "© 2025 Malwee Group. All rights reserved.",
    dataVisualizationSewing: "Data and Demands Visualization - Court",
    productionReport: "Production Report",
    searchFilter: "Search Filter",
    searchResults: "Search Results",
    startDate: "Start Date",
    endDate: "End Date",
    rollWaste: "Roll Waste",
    tomatoNumber: "Tomato No.",
    tomatoNumberPlaceholder: "Tomato number",
    setupTimeShort: "Setup Time",
    productionTimeShort: "Prod. Time",
    rows: "Rows",
    rollWasteHeader: "Roll Waste",
    actions: "Actions",
    noRecordsFound: "No records found",
    unitMin: "min",
    unitMeters: "m",
    none: "None",
    // Para o modal de visualização
    labelDate: "Date",
    labelMachine: "Machine",
    labelTomatoNumber: "Tomato No.",
    labelFabricType: "Fabric Type",
    labelOutputType: "Output Type",
    labelBarrelNumber: "Barrel No.",
    labelSetupTime: "Setup Time",
    labelProductionTime: "Production Time",
    labelRows: "Rows",
    labelMetersProduced: "Meters Produced",
    labelObservations: "Observations",
    labelTaskComplete: "Task Complete",
    labelRollWaste: "Roll Waste",
    footerCopyright: "© 2025 - Malwee Group Ltd - All Rights Reserved",
    selectOption: "Select an option",
    searchPlaceholder: "Search option...",
    productionHistory: "Production History",
    view: "View",
    viewRecord: "View Record",
    viewRecordDesc: "Here you can view the details of this record.",
    edit: "Edit",
    editRecord: "Edit Record",
    editRecordDesc: "Edit the necessary fields and save changes.",
    delete: "Delete",
    deleteRecord: "Delete Record",
    deleteRecordDesc: "Are you sure you want to delete this record? This action cannot be undone.",
    close: "Close",
    productionOverTime: "Production Over Time (m)",
    productionMeters: "Production (m)",
    productionByFabric: "Production by Fabric (m)",
    productionByLocation: "Production by Location (Machine)",
    stripQuantityDistribution: "Strip Quantity Distribution",
    stripQuantity: "Strip Quantity",
    setupTimeMinutes: "Setup Time (min)",
    selectDate: "Select a date",
    myProfile: "My Profile",
    userData: "User Data",
    userPhotoAlt: "User photo",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    saveNewPassword: "Save New Password",
    cancel: "Cancel",
    fillAllFields: "Please fill in all fields.",
    passwordsDontMatch: "The new passwords do not match.",
    passwordMinLength: "The new password must be at least 6 characters long.",
    dataSavedSuccess: "Data saved successfully! (Reload the page to see)",
    saveError: "Error saving data.",
    passwordChangedSuccess: "Password changed successfully! (Simulation)",
    login: "Login",
    birthDate: "Birth Date",
    name: "Name",
    cellphone: "Cellphone",
    phone: "Phone",
    provider: "Provider",
    notProvider: "Not a provider",
    isProvider: "Is provider",
    save: "Save",
    addProductionRecord: "Add Production Record",
    dateTime: "Date/Time",
    machineExample: "Ex: C01",
    outputType: "Output Type",
    barrelNumber: "Barrel Number",
    barrelNumberPlaceholder: "Barrel number",
    setupTime: "Setup Time (min)",
    productionTime: "Production Time (min)",
    minutes: "Minutes",
    rowQuantity: "Row Quantity",
    quantity: "Quantity",
    metersProduced: "Meters Produced",
    meters: "Meters",
    optionalObservations: "Optional observations",
    taskComplete: "Task Complete",
    rollWaste: "Roll Waste",
    addRecord: "Add Record",
    productionData: "Production Data",
    import: "Import",
    exportCSV: "Export CSV",
    averageProductionTime: "Average Production Time (min)",
    averageSetupTime: "Average Setup Time (min)",
    totalRecords: "Total Records",
    resultsPerPage: "10 results per page",
    showingFrom: "Showing from",
    to: "to",
    production: "Production",
    productionInput: "Production Input",
    fillParameters: "Fill in the parameters below to generate the production summary.",
    thickness: "Thickness (mm)",
    stripWidth: "Strip Width (mm)",
    fabricType: "Fabric Type",
    meterage: "Meterage (m)",
    output: "Output (pieces)",
    density: "Density (kg/m³)",
    observations: "Observations (optional)",
    productionNotes: "Notes about production",
    calculateSummary: "Calculate Summary",
    exportCSV: "Export CSV",
    summary: "Summary",
    quickOverview: "Quick overview of main indicators",
    areaPerMeter: "Area per meter (m²/m)",
    areaPerMeterDetail: "(width × 1m)",
    totalVolume: "Total volume (m³)",
    totalVolumeDetail: "(meterage × width × thickness)",
    estimatedCost: "Estimated cost (kg)",
    estimatedCostDetail: "(volume × density)",
    yieldPerPiece: "Yield per piece (m)",
    yieldPerPieceDetail: "(meterage / output)",
    selectedFabricType: "Selected fabric type",
    calculatedValues: "Values calculated automatically. Adjust density if you want another estimate.",
    wovenFabric: "Woven Fabric",
    cottonFabric: "Cotton Fabric",
    syntheticFabric: "Synthetic Fabric",
    dataVisualizationSewing: "Data and Demands Visualization - Court",
    productionReport: "Production Report",
    searchFilter: "Search Filter",
    searchResults: "Search Results",
    startDate: "Start Date",
    endDate: "End Date",
    machine: "Machine",
    fabricType: "Fabric Type",
    taskComplete: "Task Complete?",
    taskNumber: "Task Number",
    setupTime: "Setup Time (s)",
    productionTime: "Production Time (s)",
    metersProduced: "Meters Produced",
    complete: "Complete?",
    all: "All",
    yes: "Yes",
    no: "No",
    clear: "Clear",
    copy: "Copy",
    searchTable: "Search in table...",
    loadingData: "Loading data...",
    error: "Error",
    noResults: "No results found for the applied filters.",
    showing: "Showing",
    of: "of",
    records: "records",
    page: "Page",
    previous: "Previous",
    next: "Next",
    csvHeaderError: "Error reading CSV file header. Check the console.",
    csvProcessingError: "Could not process the CSV file.",
    unknownError: "Unknown error processing data.",
    copiedToClipboard: "Copied to clipboard!",
    copiedFallback: "Copied (fallback)!",
    copyFailedFallback: "Failed to copy (fallback):",
    copyFailed: "Failed to copy.",
    date: "Date",
    footerCopyright: "© 2025 Malwee Group. All rights reserved.",
    dataVisualizationCutting: "Data and Demands Visualization - Court",
    productionOverview: "PRODUCTION OVERVIEW",
    machineEfficiency: "Machine Efficiency",
    goalAchievement: "Goal Achievement",
    totalProduction: "Total Production",
    stoppagesSetup: "Stoppages (Setup)",
    productionTime: "Production (Time)",
    productionFabric: "Production/Fabric",
    productionLocation: "Production/Location",
    rollWaste: "Roll Waste",
    setupTime: "Setup Time",
    stripQuantity: "Strip Quantity",
    averageMeters: "Average Meters",
    totalProduced: "Total Produced",
    averageTime: "Average Time (min)",
    occurrences: "Occurrences",
    title: "System Accessibility Settings",
    subtitle: "Accessibility",
    toolsTitle: "Accessibility Tools",
    tool1: "Screen Reader",
    tool2: "Keyboard Navigation",
    tool3: "Smart Navigation",
    tool4: "Block Flashing",
    tool6: "Voice Command",
    colorsTitle: "Color Adjustment",
    customContrast: "Customize Contrast",
    btnFunds: "Backgrounds",
    btnTitles: "Titles",
    btnTexts: "Texts",
    btnResetColors: "Reset Colors",
    contrast1: "High Contrast Light",
    contrast2: "High Contrast Dark",
    contrast3: "Monochrome",
    contentTitle: "Content Adjustment",
    fontSize: "Font Size",
    cursor: "Cursor",
    cursorLight: "Light",
    cursorDark: "Dark",
    btnDisable: "Disable Accessibility",
    btnDeclaration: "Accessibility Statement",
    btnFeedback: "Send Feedback",
    resetTooltip: "Reset settings",
    hideTooltip: "Hide menu",
    cmdIncreaseFont: "increase font",
    cmdDecreaseFont: "decrease font",
    cmdReset: "reset",
    cmdContrastDark: "dark contrast",
    cmdContrastLight: "light contrast",
    cmdMonochrome: "monochrome",
    smartNavHelp: "Smart Navigation Enabled. Use:",
    smartNavH: "'H' for Headings",
    smartNavL: "'L' for Links",
    smartNavB: "'B' for Buttons",
    smartNavF: "'F' for Fields",
    modalClose: "Close",
    modalDeclarationTitle: "Accessibility Statement",
    modalDeclarationText: "We are committed to providing an accessible website to the widest possible audience, regardless of technology or ability. We are actively working to increase the accessibility and usability of our website and in doing so, adhere to many of the available standards and guidelines.",
    modalFeedbackTitle: "Send Feedback",
    modalFeedbackText: "Encountered an accessibility issue? Please let us know!",
    modalFeedbackPlaceholder: "Describe the issue you encountered...",
    modalFeedbackSubmit: "Submit",

    // NOVAS TRADUÇÕES ADICIONADAS
    home: "Home",
    dashboard: "Dashboard",
    reports: "Reports",
    productions: "Production",
    dataRegistration: "Data Registration",
    user: "User",
    settings: "Settings",
    logout: "Logout",
    toggleTheme: "Toggle Theme",

    // TRADUÇÕES CORRIGIDAS PARA HOME
    malweeGroup: "Malwee Group",
    dataVisualization: "Data and Demands Visualization - Court",
    production: "Production",
    malweeLogoAlt: "Malwee Group Logo",
  },
};

export const toolKeys = ["tool1", "tool2", "tool3", "tool4", "tool6"];

// --- HOOK DE ESTADO PERSISTENTE ---
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? (JSON.parse(storedValue) as T) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

// --- TIPOS DO CONTEXTO ---
type ModalType = "declaration" | "feedback" | null;

interface AccessibilityContextState {
  language: "pt-BR" | "en-US";
  setLanguage: React.Dispatch<React.SetStateAction<"pt-BR" | "en-US">>;
  t: (key: keyof typeof translations["pt-BR"]) => string;

  activeTools: string[];
  setActiveTools: React.Dispatch<React.SetStateAction<string[]>>;
  customContrast: number;
  setCustomContrast: React.Dispatch<React.SetStateAction<number>>;
  contrastMode: string | null;
  setContrastMode: React.Dispatch<React.SetStateAction<string | null>>;
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  cursorType: "claro" | "escuro" | null;
  setCursorType: React.Dispatch<React.SetStateAction<"claro" | "escuro" | null>>;

  isWidgetVisible: boolean;
  setIsWidgetVisible: React.Dispatch<React.SetStateAction<boolean>>;
  modalContent: ModalType;
  setModalContent: React.Dispatch<React.SetStateAction<ModalType>>;

  // Handlers
  handleToggleTool: (toolKey: string) => void;
  handleContrastMode: (modeName: string) => void;
  handleResetColors: () => void;
  handleFontSizeIncrease: () => void;
  handleFontSizeDecrease: () => void;
  handleResetAll: () => void;
  handleHideMenu: () => void;
  handleDisableAcessibility: () => void;
  handleShowDeclaration: () => void;
  handleSendFeedback: () => void;
  handleColorButtonWarning: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextState | undefined>(
  undefined
);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility deve ser usado dentro de um AccessibilityProvider"
    );
  }
  return context;
}

// --- O PROVIDER PRINCIPAL ---
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  // --- Estados ---
  const [language, setLanguage] = usePersistentState<"pt-BR" | "en-US">("acess-lang", "pt-BR");
  const [activeTools, setActiveTools] = usePersistentState<string[]>("acess-tools", []);
  const [customContrast, setCustomContrast] = usePersistentState("acess-custom-contrast", 50);
  const [contrastMode, setContrastMode] = usePersistentState<string | null>("acess-contrast-mode", null);
  const [fontSize, setFontSize] = usePersistentState("acess-font-size", 16);
  const [cursorType, setCursorType] = usePersistentState<"claro" | "escuro" | null>("acess-cursor", null);

  const [isWidgetVisible, setIsWidgetVisible] = usePersistentState("acess-widget-visible", true);
  const [modalContent, setModalContent] = useState<ModalType>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const smartNavIndices = useRef({ h: 0, l: 0, b: 0, f: 0 });
  const lastSmartNavKey = useRef<string | null>(null);

  // --- Função de Tradução ---
  const t = useCallback(
    (key: keyof typeof translations["pt-BR"]) => {
      return translations[language][key] || key;
    },
    [language]
  );

  // --- Handlers ---
  const handleToggleTool = useCallback((toolKey: string) => {
    setActiveTools((prevTools) =>
      prevTools.includes(toolKey)
        ? prevTools.filter((t) => t !== toolKey)
        : [...prevTools, toolKey]
    );
  }, [setActiveTools]);

  const handleContrastMode = useCallback((modeName: string) => {
    setContrastMode((prevMode) => (prevMode === modeName ? null : modeName));
  }, [setContrastMode]);

  const handleResetColors = useCallback(() => {
    setCustomContrast(50);
    setContrastMode(null);
  }, [setCustomContrast, setContrastMode]);

  const handleFontSizeIncrease = useCallback(() => setFontSize((prev) => prev + 1), [setFontSize]);
  const handleFontSizeDecrease = useCallback(() => setFontSize((prev) => (prev > 10 ? prev - 1 : prev)), [setFontSize]);

  const handleResetAll = useCallback(() => {
    setLanguage("pt-BR");
    setActiveTools([]);
    setCustomContrast(50);
    setContrastMode(null);
    setFontSize(16);
    setCursorType(null);
    setIsWidgetVisible(true);
    setModalContent(null);
  }, [setLanguage, setActiveTools, setCustomContrast, setContrastMode, setFontSize, setCursorType, setIsWidgetVisible]);

  const handleHideMenu = useCallback(() => {
    console.log("Funcionalidade 'Esconder Menu' foi removida");
  }, []);

  const handleDisableAcessibility = useCallback(() => {
    console.log("Funcionalidade 'Desativar Acessibilidade' foi removida");
  }, []);

  const handleShowDeclaration = () => setModalContent("declaration");
  const handleSendFeedback = () => setModalContent("feedback");

  const handleColorButtonWarning = () => {
    console.warn("Funcionalidade 'Personalizar Cores' não implementada. Requer uma UI de seletor de cores.");
  };

  // --- Efeitos (UseEffects) ---

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [fontSize]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove("high-contrast-light", "high-contrast-dark", "monochrome");

    if (contrastMode === t("contrast1")) {
      body.classList.add("high-contrast-light");
    } else if (contrastMode === t("contrast2")) {
      body.classList.add("high-contrast-dark");
    } else if (contrastMode === t("contrast3")) {
      body.classList.add("monochrome");
    }

    if (contrastMode) setCustomContrast(50);

    return () => {
      body.classList.remove("high-contrast-light", "high-contrast-dark", "monochrome");
    };
  }, [contrastMode, t, setCustomContrast]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove("cursor-dark", "cursor-light");

    if (cursorType === "escuro") {
      body.classList.add("cursor-dark");
    } else if (cursorType === "claro") {
      body.classList.add("cursor-light");
    }
    return () => {
      body.classList.remove("cursor-dark", "cursor-light");
    };
  }, [cursorType]);

  useEffect(() => {
    if (customContrast !== 50 && !contrastMode) {
      const brightnessValue = customContrast / 50;
      document.documentElement.style.filter = `brightness(${brightnessValue})`;
    } else {
      document.documentElement.style.filter = "none";
    }
    return () => {
      document.documentElement.style.filter = "none";
    };
  }, [customContrast, contrastMode]);

  useEffect(() => {
    const isReduceMotionActive = activeTools.includes("tool4");
    if (isReduceMotionActive) {
      document.body.classList.add("reduce-motion");
    } else {
      document.body.classList.remove("reduce-motion");
    }
    return () => {
      document.body.classList.remove("reduce-motion");
    };
  }, [activeTools]);

  useEffect(() => {
    const isVoiceCommandActive = activeTools.includes("tool6");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (isVoiceCommandActive && SpeechRecognition) {
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
      }

      const recognition = recognitionRef.current;
      recognition.lang = language;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        console.log("Comando recebido:", command);

        if (command.includes(t("cmdIncreaseFont"))) {
          handleFontSizeIncrease();
        } else if (command.includes(t("cmdDecreaseFont"))) {
          handleFontSizeDecrease();
        } else if (command.includes(t("cmdReset"))) {
          handleResetAll();
        } else if (command.includes(t("cmdContrastDark"))) {
          handleContrastMode(t("contrast2"));
        } else if (command.includes(t("cmdContrastLight"))) {
          handleContrastMode(t("contrast1"));
        } else if (command.includes(t("cmdMonochrome"))) {
          handleContrastMode(t("contrast3"));
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Erro no reconhecimento de voz:", event.error);
        if (['no-speech', 'audio-capture', 'not-allowed', 'service-not-allowed', 'network'].includes(event.error)) {
          setActiveTools(prev => prev.filter(tool => tool !== "tool6"));
        }
      };

      recognition.onend = () => {
        setActiveTools(currentActiveTools => {
          if (currentActiveTools.includes("tool6")) {
            try {
              recognition.start();
            } catch (e) {
              console.error("Não foi possível reiniciar o recognition.", e);
            }
          }
          return currentActiveTools;
        });
      };

      try {
        recognition.start();
        console.log("Ouvindo comandos de voz...");
      } catch (e) {
        console.error("Comando de voz já iniciado.", e);
      }

    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.onend = null;
      console.log("Comando de voz parado.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.onend = null;
      }
    };
  }, [
    activeTools, language, t, setActiveTools,
    handleFontSizeIncrease, handleFontSizeDecrease, handleResetAll, handleContrastMode
  ]);

  useEffect(() => {
    const isKeyboardNavActive = activeTools.includes("tool2");
    if (isKeyboardNavActive) {
      document.body.classList.add("keyboard-nav-active");
    } else {
      document.body.classList.remove("keyboard-nav-active");
    }
    return () => {
      document.body.classList.remove("keyboard-nav-active");
    };
  }, [activeTools]);

  useEffect(() => {
    const isSmartNavActive = activeTools.includes("tool3");
    if (!isSmartNavActive) return;

    // Remove foco anterior
    const removeFocus = () => {
      const focused = document.querySelector(".smart-nav-focus");
      focused?.classList.remove("smart-nav-focus");
    };

    const handleSmartNav = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA" ||
        (e.target as HTMLElement).tagName === "SELECT" ||
        (e.target as HTMLElement).closest(".acessibility-modal-overlay")
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      let selector = "";
      let indexKey: keyof typeof smartNavIndices.current | null = null;

      switch (key) {
        case "h":
          selector = "h1, h2, h3, h4, h5, h6";
          indexKey = "h";
          break;
        case "l":
          selector = "a[href]";
          indexKey = "l";
          break;
        case "b":
          selector = "button, [role='button']";
          indexKey = "b";
          break;
        case "f":
          selector = "input, textarea, select, [role='textbox']";
          indexKey = "f";
          break;
        default:
          return;
      }

      e.preventDefault();
      removeFocus();

      if (lastSmartNavKey.current !== key) {
        smartNavIndices.current = { h: 0, l: 0, b: 0, f: 0 };
      }
      lastSmartNavKey.current = key;

      const elements = Array.from(document.querySelectorAll<HTMLElement>(selector))
        .filter(el => !el.closest(".acessibility-card"));

      if (elements.length === 0) return;

      let currentIndex = smartNavIndices.current[indexKey!];

      if (e.shiftKey) {
        currentIndex = (currentIndex - 1 + elements.length) % elements.length;
      } else {
        currentIndex = (currentIndex + 1) % elements.length;
      }

      smartNavIndices.current[indexKey!] = currentIndex;

      const targetElement = elements[currentIndex];
      if (targetElement) {
        targetElement.focus();
        targetElement.classList.add("smart-nav-focus");
      }
    };

    document.addEventListener("keydown", handleSmartNav);

    return () => {
      document.removeEventListener("keydown", handleSmartNav);
      removeFocus();
    };
  }, [activeTools]);

  // --- EXPOR VALORES ---
  const value: AccessibilityContextState = {
    language,
    setLanguage,
    t,
    activeTools,
    setActiveTools,
    customContrast,
    setCustomContrast,
    contrastMode,
    setContrastMode,
    fontSize,
    setFontSize,
    cursorType,
    setCursorType,
    isWidgetVisible,
    setIsWidgetVisible,
    modalContent,
    setModalContent,

    // Handlers
    handleToggleTool,
    handleContrastMode,
    handleResetColors,
    handleFontSizeIncrease,
    handleFontSizeDecrease,
    handleResetAll,
    handleHideMenu,
    handleDisableAcessibility,
    handleShowDeclaration,
    handleSendFeedback,
    handleColorButtonWarning,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export type TranslationKey = keyof typeof translations['pt-BR'];
export type Language = 'pt-BR' | 'en-US';