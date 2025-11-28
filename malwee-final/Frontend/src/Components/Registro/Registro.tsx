import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Registro: React.FC = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [nome, setNome] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCriarConta = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro("");
        setSucesso("");

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:3000/registro", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    senha: senha
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSucesso("Conta criada com sucesso! Redirecionando para login...");
                setTimeout(() => {
                    navigate("/login")
                }, 1500);
            } else {
                setErro(data.erro || "Erro ao criar conta");
            }
        } catch (error) {
            setErro("Erro de conexão com o servidor");
            console.error(error);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-[var(--surface)] text-[var(--text)]">
            <main className="flex flex-1">
                <div className="w-full md:w-1/2 flex justify-center items-center px-6 py-10">
                    <section className="rounded-xl p-8 shadow-md w-full max-w-md">
                        <header className="mb-8 text-center">
                            <h1 className="text-2xl font-bold text-[var(--text)]">Olá!</h1>
                            <p className="mt-2 text-lg text-[var(--text)]">Grupo Malwee</p>
                            <h2 className="mt-6 text-xl font-semibold text-[var(--text)]">
                                Criar a sua nova conta
                            </h2>
                        </header>

                        {/* Exibição de Mensagens de Erro ou Sucesso */}
                        {erro && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm text-center">
                                {erro}
                            </div>
                        )}
                        {sucesso && (
                            <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-400 rounded text-sm text-center">
                                {sucesso}
                            </div>
                        )}

                        {/* Formulário */}
                        <form onSubmit={handleCriarConta} className="space-y-4">
                            <div>
                                <label className="block text-sm text-[var(--text-muted)] mb-2">
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                    placeholder="Digite seu Email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--text-muted)] mb-2">
                                    Nome de Usuário
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                    placeholder="Digite seu nome completo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--text-muted)] mb-2">
                                    Senha
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                    placeholder="Digite sua senha"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--text-muted)] mb-2">
                                    Confirmar Senha
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={confirmarSenha}
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                    placeholder="Confirme sua senha"
                                />
                            </div>

                            {/* Botões */}
                            <div className="mt-6 space-y-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3 rounded-lg bg-[var(--accent)] font-medium border border-transparent transition-all duration-200 ease-in-out shadow-md text-center block
                                        ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-[var(--accent)]/90 hover:scale-[1.02] hover:shadow-lg'}
                                    `}
                                >
                                    {loading ? "Criando conta..." : "Criar Conta"}
                                </button>

                                <div className="text-center">
                                    <Link
                                        to="/login"
                                        className="text-[var(--accent)] hover:underline"
                                    >
                                        Já tem uma conta? Fazer login
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </section>
                </div>

                {/* Seção da imagem (Mantida inalterada) */}
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
}