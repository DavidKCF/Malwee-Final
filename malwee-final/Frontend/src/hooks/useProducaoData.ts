// Frontend/src/hooks/useProducaoData.ts
import { useState, useEffect } from 'react';
import { type ProducaoData, loadProducaoData, loadLocalProducaoCsv } from '../services/csvService';

export const useProducaoData = (csvUrl?: string) => {
    const [data, setData] = useState<ProducaoData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (url: string) => {
        setLoading(true);
        setError(null);
        try {
            const producaoData = await loadProducaoData(url);
            setData(producaoData);
        } catch (err) {
            setError('Erro ao carregar dados de produção');
            console.error('Erro detalhado:', err);
        } finally {
            setLoading(false);
        }
    };

    const uploadFile = async (file: File) => {
        setLoading(true);
        setError(null);
        try {
            const producaoData = await loadLocalProducaoCsv(file);
            setData(producaoData);
        } catch (err) {
            setError('Erro ao processar arquivo de produção');
            console.error('Erro detalhado:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (csvUrl) {
            loadData(csvUrl);
        }
    }, [csvUrl]);

    return {
        data,
        loading,
        error,
        uploadFile,
        reload: () => csvUrl && loadData(csvUrl)
    };
};