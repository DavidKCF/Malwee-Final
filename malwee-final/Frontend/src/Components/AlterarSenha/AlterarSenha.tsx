import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputBase } from '@mlw-packages/react-components';

export const AlterarSenha: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);

    // Validações no frontend
    if (!email || !senhaAtual || !novaSenha || !confirmarSenha) {
      setErro("Todos os campos são obrigatórios.");
      setLoading(false);
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("A nova senha e a confirmação não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('jwt_token');
      
      const response = await fetch('http://localhost:3000/alterar-senha', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ email, senhaAtual, novaSenha }),
      });

      const data = await response.json();

      if (response.ok) {
        setSucesso(data.mensagem);
        // Limpar os campos
        setEmail("");
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmarSenha("");
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setErro(data.erro || "Falha ao alterar senha.");
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--surface)] text-[var(--text)]">
      <main className="flex flex-1">
        {/* Form Section */}
        <div className="w-full md:w-1/2 flex justify-center items-center px-6 py-10">
          <section className="rounded-xl p-8 shadow-md w-full max-w-md">
            <header className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-[var(--text)]">Alterar Senha</h1>
              <p className="mt-2 text-lg text-[var(--text)]">Grupo Malwee</p>
            </header>

            {/* Exibir mensagem de erro se houver */}
            {erro && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
                {erro}
              </div>
            )}

            {/* Exibir mensagem de sucesso se houver */}
            {sucesso && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm text-center">
                {sucesso}
              </div>
            )}

            <form onSubmit={handleAlterarSenha} className="space-y-4">
              <div>
                <InputBase
                  id='email'
                  label='E-mail'
                  placeholder='seu@email.com'
                  required
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Senha Atual
                </label>
                <InputBase
                  type="password"
                  placeholder="Digite sua senha atual"
                  value={senhaAtual}
                  onChange={(e: any) => setSenhaAtual(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Nova Senha
                </label>
                <InputBase
                  type="password"
                  placeholder="Digite a nova senha (mín. 6 caracteres)"
                  value={novaSenha}
                  onChange={(e: any) => setNovaSenha(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Confirmar Nova Senha
                </label>
                <InputBase
                  type="password"
                  placeholder="Confirme a nova senha"
                  value={confirmarSenha}
                  onChange={(e: any) => setConfirmarSenha(e.target.value)}
                  required
                />
              </div>

              <div className="mt-6 space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg bg-[var(--accent)] font-medium border border-transparent transition-all duration-200 ease-in-out shadow-md text-center block
                    ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[var(--accent)]/90 hover:scale-[1.02] hover:shadow-lg'}
                  `}
                >
                  {loading ? "Alterando..." : "Alterar Senha"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-[var(--accent)] hover:underline"
                  >
                    Voltar para Login
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>

 
        <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--surface)] via-[var(--surface)]/70 to-transparent z-10"></div>
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[var(--surface)] via-[var(--surface)]/50 to-transparent z-20"></div>
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://blog.malwee.com.br/wp-content/uploads/2024/06/grupo-malwee-1600x1067.jpg')"
            }}
          />
        </div>
      </main>
    </div>
  );
};