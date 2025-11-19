// csvService.ts - VOLTE PARA ESSA VERSÃO
import Papa from 'papaparse';

export interface ProducaoData {
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

export const loadProducaoData = async (filePath: string): Promise<ProducaoData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(filePath, {
      download: true,
      header: true,
      complete: (results) => {
        const data = results.data.map((row: any) => ({
          Data: row.Data || '',
          Maquina: row.Maquina || '',
          TipoTecido: Number(row.TipoTecido) || 0,
          TipoSaida: Number(row.TipoSaida) || 0,
          NumeroTarefa: Number(row.NumeroTarefa) || 0,
          TempoSetup: Number(row.TempoSetup) || 0,
          TempoProducao: Number(row.TempoProducao) || 0,
          QuantidadeTiras: Number(row.QuantidadeTiras) || 0,
          MetrosProduzidos: Number(row.MetrosProduzidos) || 0,
          TarefaCompleta: row.TarefaCompleta === 'true',
          SobraRolo: row.SobraRolo === 'true',
          Comentarios: row.Comentarios || ''
        }));
        resolve(data as ProducaoData[]);
      },
      error: reject
    });
  });
};

export const loadLocalProducaoCsv = async (file: File): Promise<ProducaoData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const data = results.data.map((row: any) => ({
          Data: row.Data || '',
          Maquina: row.Maquina || '',
          TipoTecido: Number(row.TipoTecido) || 0,
          TipoSaida: Number(row.TipoSaida) || 0,
          NumeroTarefa: Number(row.NumeroTarefa) || 0,
          TempoSetup: Number(row.TempoSetup) || 0,
          TempoProducao: Number(row.TempoProducao) || 0,
          QuantidadeTiras: Number(row.QuantidadeTiras) || 0,
          MetrosProduzidos: Number(row.MetrosProduzidos) || 0,
          TarefaCompleta: row.TarefaCompleta === 'true',
          SobraRolo: row.SobraRolo === 'true',
          Comentarios: row.Comentarios || ''
        }));
        resolve(data as ProducaoData[]);
      },
      error: reject
    });
  });
};