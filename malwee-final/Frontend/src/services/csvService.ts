// Frontend/src/services/csvService.ts
import Papa from 'papaparse';

export interface ProducaoData {
  Data: string;
  Maquina: string;
  TipoTecido: number;
  TipoSaida: number;
  NumeroTarefa: number;
  TempoSetup: number;
  TempoProducao: number;
  QuantidadeTiras: number;
  MetrosProduzidos: number;
  TarefaCompleta: boolean;
  SobraRolo: boolean;
  Comentarios?: string;
}

// Helper function to normalize column names and handle different CSV formats
const normalizeRow = (row: any, headers: string[]): ProducaoData => {
  console.log('Raw row data:', row);
  console.log('Available headers:', headers);

  // Se não temos headers definidos, tentar inferir pelas chaves do row
  const availableHeaders = headers && headers.length > 0 ? headers : Object.keys(row);
  
  // Criar um objeto com mapeamento mais flexível
  const rowData: any = {};
  
  // Mapear baseado na posição das colunas se os nomes não forem reconhecidos
  availableHeaders.forEach((header, index) => {
    if (header && header.trim()) {
      const normalizedKey = header
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .replace(/_/g, '');
      
      rowData[normalizedKey] = row[header];
    }
  });

  console.log('Processed row data:', rowData);

  // Se não conseguimos mapear pelos nomes, tentar pela posição das colunas
  const values = Object.values(row);
  
  // Mapeamento por posição (baseado na estrutura comum de CSVs)
  const data = String(values[0] || ''); // Primeira coluna - Data
  const maquina = String(values[1] || ''); // Segunda coluna - Máquina
  const tipoTecido = parseNumber(values[2]); // Terceira coluna - Tipo Tecido
  const tipoSaida = parseNumber(values[3]); // Quarta coluna - Tipo Saída
  const numeroTarefa = parseNumber(values[4]); // Quinta coluna - Número Tarefa
  const tempoSetup = parseNumber(values[5]); // Sexta coluna - Tempo Setup
  const tempoProducao = parseNumber(values[6]); // Sétima coluna - Tempo Produção
  const quantidadeTiras = parseNumber(values[7]); // Oitava coluna - Quantidade Tiras
  const metrosProduzidos = parseNumber(values[8]); // Nona coluna - Metros Produzidos
  
  // Últimas colunas - Booleanos
  const tarefaCompleta = parseBoolean(values[9]); // Décima coluna - Tarefa Completa
  const sobraRolo = parseBoolean(values[10]); // Décima primeira coluna - Sobra Rolo
  const comentarios = String(values[11] || ''); // Décima segunda coluna - Comentários

  // Também tentar pelos nomes normalizados (fallback)
  const result = {
    Data: data || rowData.data || rowData.datahora || rowData.date || '',
    Maquina: maquina || rowData.maquina || rowData.machine || rowData.maq || '',
    TipoTecido: tipoTecido || parseNumber(rowData.tipotecido) || parseNumber(rowData.tecido) || 0,
    TipoSaida: tipoSaida || parseNumber(rowData.tiposaida) || parseNumber(rowData.saida) || 0,
    NumeroTarefa: numeroTarefa || parseNumber(rowData.numerotarefa) || parseNumber(rowData.tarefa) || 0,
    TempoSetup: tempoSetup || parseNumber(rowData.temposetup) || parseNumber(rowData.setup) || 0,
    TempoProducao: tempoProducao || parseNumber(rowData.tempoproducao) || parseNumber(rowData.producao) || 0,
    QuantidadeTiras: quantidadeTiras || parseNumber(rowData.quantidadetiras) || parseNumber(rowData.tiras) || 0,
    MetrosProduzidos: metrosProduzidos || parseNumber(rowData.metrosproduzidos) || parseNumber(rowData.metros) || 0,
    TarefaCompleta: tarefaCompleta || parseBoolean(rowData.tarefacompleta) || false,
    SobraRolo: sobraRolo || parseBoolean(rowData.sobrarolo) || false,
    Comentarios: comentarios || rowData.comentarios || rowData.obs || ''
  };

  console.log('Final normalized row:', result);
  return result;
};

// Função auxiliar para parse seguro de números
const parseNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  
  // Tratar células vazias representadas por ○ ou outros caracteres
  if (typeof value === 'string') {
    const cleaned = value.trim()
      .replace('○', '')
      .replace('○', '')
      .replace('−', '-')
      .replace(',', '.');
    
    if (cleaned === '' || cleaned === '○') return 0;
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Função auxiliar para parse seguro de booleanos
const parseBoolean = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  
  if (typeof value === 'string') {
    const str = value.toLowerCase().trim();
    return str === 'true' || str === '1' || str === 'sim' || str === 'yes' || 
           str === 'verdadeiro' || str === 'completo' || str === 'completa';
  }
  
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'boolean') return value;
  
  return false;
};

export const loadProducaoData = async (filePath: string): Promise<ProducaoData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(filePath, {
      download: true,
      header: true,
      complete: (results) => {
        console.log('CSV Parsing Results - Raw:', results.data);
        console.log('CSV Parsing Results - Meta:', results.meta);
        console.log('CSV Headers:', results.meta.fields);
        
        if (results.errors.length > 0) {
          console.warn('CSV Parsing Warnings:', results.errors);
        }

        const data = results.data
          .filter((row: any) => {
            // Filtro mais permissivo para pegar todas as linhas com dados
            const hasData = Object.values(row).some(value => 
              value !== null && value !== undefined && value !== '' && String(value).trim() !== ''
            );
            return hasData;
          })
          .map((row: any) => normalizeRow(row, results.meta.fields || []));
        
        console.log('Processed Data (all fields):', data);
        
        if (data.length > 0) {
          console.log('First row fields:', Object.keys(data[0]));
          console.log('First row values:', data[0]);
          
          // Log detalhado de cada campo do primeiro registro
          const first = data[0];
          Object.keys(first).forEach(key => {
            console.log(`Campo ${key}:`, first[key], `(tipo: ${typeof first[key]})`);
          });
        }
        
        resolve(data as ProducaoData[]);
      },
      error: (error) => {
        console.error('CSV Parsing Error:', error);
        reject(error);
      }
    });
  });
};

export const loadLocalProducaoCsv = async (file: File): Promise<ProducaoData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        console.log('Local CSV Parsing Results - Raw:', results.data);
        console.log('Local CSV Parsing Results - Meta:', results.meta);
        console.log('Local CSV Headers:', results.meta.fields);
        
        if (results.errors.length > 0) {
          console.warn('Local CSV Parsing Warnings:', results.errors);
        }

        const data = results.data
          .filter((row: any) => {
            const hasData = Object.values(row).some(value => 
              value !== null && value !== undefined && value !== '' && String(value).trim() !== ''
            );
            return hasData;
          })
          .map((row: any) => normalizeRow(row, results.meta.fields || []));
        
        console.log('Processed Local Data (all fields):', data);
        
        if (data.length > 0) {
          console.log('First local row fields:', Object.keys(data[0]));
          console.log('First local row values:', data[0]);
          
          // Log detalhado de cada campo do primeiro registro
          const first = data[0];
          Object.keys(first).forEach(key => {
            console.log(`Campo local ${key}:`, first[key], `(tipo: ${typeof first[key]})`);
          });
        }
        
        resolve(data as ProducaoData[]);
      },
      error: (error) => {
        console.error('Local CSV Parsing Error:', error);
        reject(error);
      }
    });
  });
};