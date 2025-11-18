import React from "react";
import { Link } from "react-router-dom";

export const Login: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--surface)] text-[var(--text)]">
      <main className="flex flex-1">
        {/* Form Section */}
        <div className="w-full md:w-1/2 flex justify-center items-center px-6 py-10">
          <section className="rounded-xl p-8 shadow-md w-full max-w-md">
            <header className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-[var(--text)]">Olá!</h1>
              <p className="mt-2 text-lg text-[var(--text)]">Grupo Malwee</p>
              <h2 className="mt-6 text-xl font-semibold text-[var(--text)]">
                Entrar na sua conta
              </h2>
            </header>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Usuário
                </label>
                <input
                  type="text"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="Digite seu usuário"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="Digite a sua senha"
                />
              </div>

              <div className="text-right">
                <a
                  href="#"
                  className="text-sm text-[var(--accent)] hover:underline"
                >
                  Esqueceu Senha?
                </a>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Link
                to="/home"
                className="w-full py-3 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent)]/90 font-medium border border-transparent transition-all duration-200 ease-in-out transform hover:scale-[1.02] shadow-md hover:shadow-lg text-center block"
              >
                Login
              </Link>

              <div className="text-center">
                <a
                  href="Registro"
                  className="text-[var(--accent)] hover:underline"
                >
                  Criar conta
                </a>
              </div>
            </div>
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