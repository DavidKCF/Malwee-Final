import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import { Footer } from "../Footer/Footer";
import { ButtonBase, InputBase, LabelBase } from '@mlw-packages/react-components';
import { useAccessibility } from "../Acessibilidade/AccessibilityContext";
import UserAvatar from "../../image/logo.png";

// Interface para os dados do usuário
interface UserData {
  login: string;
  nome: string;
  celular?: string;
  telefone?: string;
  prestador: string;
}

// Chave para usar no localStorage
const LOCAL_STORAGE_KEY = "userData";
const API_URL = "http://localhost:3000";

const getToken = () => {
  return localStorage.getItem('jwt_token');
};

export const Usuario: React.FC = () => {
  const { t } = useAccessibility();
  const navigate = useNavigate(); // Hook para navegação

  const initialData: UserData = {
    login: "",
    nome: "",
    prestador: "notProvider",
  };

  const [formData, setFormData] = useState<UserData>(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedData ? (JSON.parse(savedData) as UserData) : initialData;
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = getToken();

      if (!token) {
        console.warn("Token não encontrado. Usuário pode não estar logado.");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/usuario`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();

          setFormData((prevData) => {
            const newData = {
              ...prevData,
              nome: data.nome || "",
              login: data.email || ""
            };

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));

            return newData;
          });
        } else {
          console.error("Erro ao buscar dados do usuário:", response.statusText);
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
      console.log("Salvando dados no localStorage:", formData);
      alert(t('dataSavedSuccess') || 'Dados salvos com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
      alert(t('saveError') || 'Erro ao salvar os dados.');
    }
  };

  const handleClear = () => {
    console.log("Limpando formulário e localStorage...");
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setFormData(initialData);
  };

  const handleChangePassword = () => {
    console.log("Redirecionando para página de alteração de senha...");
    navigate('/alterar-senha'); 
  };

  return (
    <div className="flex flex-col min-h-screen ml-[80px] bg-[var(--surface)] text-[var(--text)]">
      <main className="flex flex-1 justify-center items-center px-6 py-10">
        <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 shadow-md w-full max-w-3xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text)]">{t('myProfile') || 'Meu Perfil'}</h1>
            <p className="mt-3 text-[18px] font-semibold text-[var(--text)]">
              {t('userData') || 'Dados do Usuário'}
            </p>
          </header>

          <div className="flex items-center gap-6 mb-6">
            <img
              src={UserAvatar}
              alt={t('userPhotoAlt') || 'Foto do usuário'}
              className="w-24 h-24 rounded-full border border-[var(--border)] object-cover"
            />
          </div>

          {/* Campos do formulário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
                {t('login') || 'Login'}*
              </LabelBase>
              <InputBase
                type="email"
                name="login"
                value={formData.login}
                onChange={handleChange}
                readOnly={true}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <LabelBase className="block text-sm text-[var(--text-muted)] mb-2">
                {t('name') || 'Nome'}*
              </LabelBase>
              <InputBase
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* Botão Alterar Senha - AGORA REDIRECIONA PARA PÁGINA */}
          <div className="mt-6">
            <ButtonBase
              onClick={handleChangePassword}
              className="bg-[var(--accent)] text-[var(--on-accent)] hover:bg-[var(--accent)]/90 hover:shadow-lg px-4 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 font-medium"
            >
              {t('changePassword') || 'Alterar Senha'}
            </ButtonBase>
          </div>

          {/* Botões principais - HOVERS MELHORADOS */}
          <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--border)]">
            <ButtonBase
              onClick={handleClear}
              className="bg-[var(--surface)] hover:bg-[var(--accent)]/20 hover:border-[var(--accent)]/50 text-[var(--text)] px-5 py-2 rounded-lg border border-[var(--border)] transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md"
            >
              {t('clear') || 'Limpar'}
            </ButtonBase>
            <ButtonBase
              onClick={handleSave}
              className="bg-[var(--accent)] text-[var(--on-accent)] hover:bg-[var(--accent)]/90 hover:shadow-lg px-5 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 font-medium"
            >
              {t('save') || 'Salvar'}
            </ButtonBase>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};