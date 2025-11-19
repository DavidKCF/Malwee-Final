import React, { useState, useEffect } from "react";
import { Footer } from "../Footer/Footer";
import { ButtonBase, } from '@mlw-packages/react-components';
import { useAccessibility } from "../Acessibilidade/AccessibilityContext";
import UserAvatar from "../../image/logo.png";

// --- NOVO: Componente do Modal de Senha ---
interface PasswordModalProps {
  onClose: () => void;
  onSave: (password: string) => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ onClose, onSave }) => {
  const { t } = useAccessibility();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t('fillAllFields'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('passwordsDontMatch'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('passwordMinLength'));
      return;
    }

    console.log("Simulando troca de senha com a nova senha:", newPassword);
    setError("");
    onSave(newPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
          {t('changePassword')}
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-700 text-red-200 px-3 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">
              {t('currentPassword')}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">
              {t('newPassword')}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">
              {t('confirmNewPassword')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        </div>

        {/* Botões do Modal com ButtonBase */}
        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--border)]">
          <ButtonBase
            onClick={onClose}
            className="bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--text)] px-5 py-2 rounded-lg border border-[var(--border)] transition-colors"
          >
            {t('cancel')}
          </ButtonBase>
          <ButtonBase
            onClick={handleSubmit}
            className="bg-[var(--accent)] text-[var(--on-accent)] hover:opacity-90 px-5 py-2 rounded-lg transition-opacity"
          >
            {t('saveNewPassword')}
          </ButtonBase>
        </div>
      </div>
    </div>
  );
};

// Interface para os dados do usuário
interface UserData {
  login: string;
  dataNascimento: string;
  nome: string;
  celular: string;
  telefone: string;
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

  const initialData: UserData = {
    login: "",
    dataNascimento: "2019-09-04",
    nome: "",
    celular: "(21) 98664-8888",
    telefone: "(21) 3215-8788",
    prestador: "notProvider",
  };

  const [formData, setFormData] = useState<UserData>(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedData ? (JSON.parse(savedData) as UserData) : initialData;
  });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
              nome: data.nome,
              login: data.email
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
      alert(t('dataSavedSuccess'));
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
      alert(t('saveError'));
    }
  };

  const handleClear = () => {
    console.log("Limpando formulário e localStorage...");
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setFormData(initialData);
  };

  const handleChangePassword = () => {
    console.log("Abrindo modal de alteração de senha...");
    setIsPasswordModalOpen(true);
  };

  const handleSavePassword = (newPassword: string) => {
    alert(t('passwordChangedSuccess'));
    setIsPasswordModalOpen(false);
  };

  return (
    <>
      {isPasswordModalOpen && (
        <PasswordModal
          onClose={() => setIsPasswordModalOpen(false)}
          onSave={handleSavePassword}
        />
      )}

      <div className="flex flex-col min-h-screen ml-[80px] bg-[var(--surface)] text-[var(--text)]">
        <main className="flex flex-1 justify-center items-center px-6 py-10">
          <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 shadow-md w-full max-w-3xl">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--text)]">{t('myProfile')}</h1>
              <p className="mt-3 text-[18px] font-semibold text-[var(--text)]">
                {t('userData')}
              </p>
            </header>

            {/* Foto e botão com ButtonBase */}
            <div className="flex items-center gap-6 mb-6">
              <img
                src={UserAvatar}
                alt={t('userPhotoAlt')}
                className="w-24 h-24 rounded-full border border-[var(--border)] object-cover"
              />
              <ButtonBase
                onClick={handleChangePassword}
                className="ml-auto bg-[var(--accent)] text-[var(--on-accent)] hover:opacity-90 px-4 py-2 rounded-lg transition-opacity"
              >
                {t('changePassword')}
              </ButtonBase>
            </div>

            {/* Campos do formulário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  {t('login')}*
                </label>
                <input
                  type="email"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  readOnly={true} 
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  {t('birthDate')}
                </label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  {t('name')}*
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              {/* ... (Restante dos inputs: celular, telefone, prestador e botões permanecem iguais) ... */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  {t('cellphone')}
                </label>
                <input
                  type="text"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  {t('phone')}
                </label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  {t('provider')}
                </label>
                <select
                  name="prestador"
                  value={formData.prestador}
                  onChange={handleChange}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="notProvider">{t('notProvider')}</option>
                  <option value="provider">{t('provider')}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--border)]">
              <ButtonBase
                onClick={handleClear}
                className="bg-[var(--surface)] hover:bg-[var(--border)] text-[var(--text)] px-5 py-2 rounded-lg border border-[var(--border)] transition-colors"
              >
                {t('clear')}
              </ButtonBase>
              <ButtonBase
                onClick={handleSave}
                className="bg-[var(--accent)] text-[var(--on-accent)] hover:opacity-90 px-5 py-2 rounded-lg transition-opacity"
              >
                {t('save')}
              </ButtonBase>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};