import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputBase } from '@mlw-packages/react-components';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      })

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        navigate('/home');
      } else {
        setErro(data.erro || "Login Falhou");
      }
    } catch (error) {
      setErro("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--surface)] text-[var(--text)]">
      <main className="flex flex-1">
        <div className="w-full md:w-1/2 flex justify-center items-center px-6 py-10">
          <section className="rounded-xl p-8 shadow-md w-full max-w-md">
            <header className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-[var(--text)]">Olá!</h1>
              <p className="mt-2 text-lg text-[var(--text)]">Grupo Malwee</p>
              <h2 className="mt-6 text-xl font-semibold text-[var(--text)]">
                Entrar na sua conta
              </h2>
            </header>

            {/* Mensagem de Erro Visual */}
            {erro && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm text-center">
                {erro}
              </div>
            )}

            {/* Envolvemos os inputs em um <form> para permitir envio com ENTER */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                {/* Input Email Conectado ao State */}
                <InputBase
                  id='email'
                  label='E-mail'
                  placeholder='seu@email.com'
                  required
                  value={email}
                  // Nota: Dependendo da versão do seu @mlw-packages, pode ser 'onChange' direto ou 'onChange={(e) => ...}'
                  onChange={(e: any) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Senha
                </label>
                {/* Input Senha Conectado ao State */}
                <input
                  type="password"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="Digite a sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              <div className="text-right">
                <a href="#" className="text-sm text-[var(--accent)] hover:underline">
                  Esqueceu Senha?
                </a>
              </div>

              <div className="mt-6 space-y-4">
                {/* 5. Botão Submit (Removemos o Link) */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg bg-[var(--accent)] text-white font-medium transition-all duration-200 
                    ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-[var(--accent)]/90 hover:scale-[1.02] shadow-md hover:shadow-lg'}
                  `}
                >
                  {loading ? "Carregando..." : "Login"}
                </button>

                <div className="text-center">
                  <a href="/Registro" className="text-[var(--accent)] hover:underline">
                    Criar conta
                  </a>
                </div>
              </div>
            </form>
          </section>
        </div>

        {/* Lado Direito (Imagem) - Sem alterações necessárias */}
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