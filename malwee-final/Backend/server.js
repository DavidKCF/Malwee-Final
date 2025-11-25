// Bibliotecas
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config();

const app = express();
const saltRounds = 10;
const apiRouter = express.Router();

app.use(cors());
app.use(express.json());

//

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

function getWhereClause(ano, mes) {
    let whereClause = '';
    let params = [];

    if (ano && mes) {
        whereClause = `
            WHERE YEAR(STR_TO_DATE(\`Data (AAAA-MM-DD HH:MM:SS)\`, '%Y-%m-%dT%H:%i:%s')) = ?
            AND MONTH(STR_TO_DATE(\`Data (AAAA-MM-DD HH:MM:SS)\`, '%Y-%m-%dT%H:%i:%s')) = ?`;
        params = [ano, mes];
    }
    return { whereClause, params };
}

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ erro: 'Token necessário' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ erro: 'Token necessário' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado' });
    }
}

apiRouter.use(authMiddleware);

// Gráfico 'Eficiência da máquina (%)'
apiRouter.get('/chart-data', async (req, res) => {
    try {
        const { ano, mes } = req.query;
        const { whereClause, params } = getWhereClause(ano, mes);

        const sqlQuery = `
            SELECT
            Maquina,
            AVG(\`Metros Produzidos\`) AS media_metros
            FROM data
            ${whereClause}
            GROUP BY Maquina
            ORDER BY Maquina;
        `;
        const [results] = await pool.query(sqlQuery, params);
        const labels = results.map(row => `Máquina ${row.Maquina}`);
        const data = results.map(row => parseFloat(row.media_metros).toFixed(2));
        res.json({ labels, data });
    } catch (erro) {
        console.error('ERRO ao buscar dados para o gráfico (Eficiência):', erro);
        res.status(500).json({ error: 'Erro ao buscar dados do gráfico.' });
    }
});

// Gráfico 'Produção por Tecido'
apiRouter.get('/chart-producao-tecido', async (req, res) => {
    try {
        const { ano, mes } = req.query;
        const { whereClause, params } = getWhereClause(ano, mes);

        const query = `
            SELECT \`Tipo Tecido\`, SUM(\`Metros Produzidos\`) as total_produzido
            FROM data
            ${whereClause}
            GROUP BY \`Tipo Tecido\`;
        `;
        const [results] = await pool.query(query, params);
        const labels = results.map(item => `Tecido Tipo ${item['Tipo Tecido']}`);
        const data = results.map(item => item.total_produzido);
        res.json({ labels, data });
    } catch (erro) {
        console.error('ERRO ao buscar dados de produção por tecido:', erro.message);
        res.status(500).json({ error: 'Erro ao buscar dados de produção por tecido.' });
    }
});

// Gráfico 'Produção ao Longo do Tempo' 
apiRouter.get('/chart-producao-tempo', async (req, res) => {
    try {
        const { ano, mes } = req.query;
        let { whereClause, params } = getWhereClause(ano, mes);

        // Adiciona filtro para datas nulas
        const nullFilter = "`Data (AAAA-MM-DD HH:MM:SS)` IS NOT NULL";
        if (whereClause) {
            whereClause += ` AND ${nullFilter}`;
        } else {
            whereClause = `WHERE ${nullFilter}`;
        }

        // Query reescrita para evitar caracteres inválidos
        const query = `
    SELECT
        T.turno,
        IFNULL(SUM(T.\`Tempo de Produção\`), 0) as total_por_turno
    FROM (
        SELECT
            \`Tempo de Produção\`,
            CASE
                WHEN TIME(\`Data (AAAA-MM-DD HH:MM:SS)\`) >= '05:00:00' AND TIME(\`Data (AAAA-MM-DD HH:MM:SS)\`) <= '14:18:59'
                    THEN '1º Turno (05:00 - 14:18)'
                WHEN TIME(\`Data (AAAA-MM-DD HH:MM:SS)\`) >= '14:19:00' AND TIME(\`Data (AAAA-MM-DD HH:MM:SS)\`) <= '23:24:59'
                    THEN '2º Turno (14:19 - 23:24)'
                WHEN TIME(\`Data (AAAA-MM-DD HH:MM:SS)\`) >= '23:25:00' OR TIME(\`Data (AAAA-MM-DD HH:MM:SS)\`) <= '04:59:59'
                    THEN '3º Turno (23:25 - 04:59)'
                ELSE 'Fora do Turno'
            END as turno
        FROM data
        ${whereClause}
    ) AS T
    GROUP BY T.turno
    ORDER BY
        CASE
            WHEN T.turno = '1º Turno (05:00 - 14:18)' THEN 1
            WHEN T.turno = '2º Turno (14:19 - 23:24)' THEN 2
            WHEN T.turno = '3º Turno (23:25 - 04:59)' THEN 3
            ELSE 4
        END;
    `;

        const [results] = await pool.query(query, params);

        const filteredResults = results.filter(item => item.turno !== 'Fora do Turno');
        const labels = filteredResults.map(item => item.turno);
        const data = filteredResults.map(item => item.total_por_turno);

        res.json({ labels, data });
    } catch (erro) {
        console.error('ERRO DETALHADO (BACKEND):', erro);
        res.status(500).json({ error: 'Erro ao buscar dados de produção ao longo do tempo.' });
    }
});

// Gráfico 'Produção por Localidade (Máquina)'
apiRouter.get('/chart-localidades', async (req, res) => {
    try {
        const { ano, mes } = req.query;
        const { whereClause, params } = getWhereClause(ano, mes);

        const query = `
            SELECT Maquina, SUM(\`Metros Produzidos\`) as total_produzido
            FROM data
            ${whereClause}
            GROUP BY Maquina
            ORDER BY Maquina;
        `;
        const [results] = await pool.query(query, params);
        const labels = results.map(item => `Localidade ${item.Maquina}`);
        const data = results.map(item => item.total_produzido);
        res.json({ labels, data });
    } catch (erro) {
        console.error('ERRO ao buscar dados de produção por localidade:', erro.message);
        res.status(500).json({ error: 'Erro ao buscar dados de produção por localidade.' });
    }
});

// Gráfico 'Sobras de Rolo'
apiRouter.get('/chart-sobras', async (req, res) => {
    try {
        const { ano, mes } = req.query;
        const { whereClause, params } = getWhereClause(ano, mes);

        const query = `
            SELECT \`Sobra de Rolo?\` as valor_original, COUNT(*) as total
            FROM data
            ${whereClause}
            GROUP BY \`Sobra de Rolo?\`;
        `;
        const [results] = await pool.query(query, params);
        const labelMap = { 'TRUE': 'Com Sobra', 'FALSE': 'Sem Sobra', '1': 'Com Sobra', '0': 'Sem Sobra' };
        const labels = results.map(item => labelMap[item.valor_original?.toString()] || 'Indefinido');
        const data = results.map(item => item.total);
        res.json({ labels, data });
    } catch (erro) {
        console.error('ERRO ao buscar dados de sobras de rolo:', erro.message);
        res.status(500).json({ error: 'Erro ao buscar dados de sobras de rolo.' });
    }
});

// Gráfico 'Tempo Médio de Setup por Máquina'
apiRouter.get('/chart-setup', async (req, res) => {
    try {
        const { ano, mes } = req.query;
        const { whereClause, params } = getWhereClause(ano, mes);

        const sqlQuery = `
            SELECT Maquina, AVG(\`Tempo de Setup\`) AS media_setup
            FROM data
            ${whereClause}
            GROUP BY Maquina
            ORDER BY Maquina;
        `;
        const [results] = await pool.query(sqlQuery, params);
        const labels = results.map(row => `Máquina ${row.Maquina}`);
        const data = results.map(row => parseFloat(row.media_setup).toFixed(2));
        res.json({ labels, data });
    } catch (erro) {
        console.error('ERRO ao buscar dados de setup:', erro.message);
        res.status(500).json({ error: 'Erro ao buscar dados de setup.' });
    }
});

// Gráfico 'Distribuição da Quantidade de Tiras'
apiRouter.get('/chart-tiras', async (req, res) => {
    try {
        const { ano, mes } = req.query;
        const { whereClause, params } = getWhereClause(ano, mes);

        const query = `
            SELECT \`Quantidade de Tiras\`, COUNT(*) as total_ocorrencias
            FROM data
            ${whereClause}
            GROUP BY \`Quantidade de Tiras\`
            ORDER BY \`Quantidade de Tiras\`;
        `;
        const [results] = await pool.query(query, params);
        const labels = results.map(item => `${item['Quantidade de Tiras']} Tira(s)`);
        const data = results.map(item => item.total_ocorrencias);
        res.json({ labels, data });
    } catch (erro) {
        console.error('ERRO ao buscar dados de quantidade de tiras:', erro.message);
        res.status(500).json({ error: 'Erro ao buscar dados de quantidade de tiras.' });
    }
});

//Cards(Dashboard)
apiRouter.get('/kpi-data', async (req, res) => {
    try {
        const kpiQuery = `
            SELECT
                (SUM(\`Tempo de Produção\`) / NULLIF((SUM(\`Tempo de Produção\`) + SUM(\`Tempo de Setup\`)), 0)) * 100 AS eficiencia,
                (SUM(CASE WHEN \`Tarefa Completa?\` IN ('TRUE','1',1,TRUE) THEN 1 ELSE 0 END) 
                    / NULLIF(COUNT(*),0)) * 100 AS atingimento,
                SUM(\`Metros Produzidos\`) AS producao,
                SUM(\`Tempo de Setup\`) AS paradas_setup_min
            FROM data
        `;

        const [rows] = await pool.query(kpiQuery);
        const currentData = rows[0] || {};

        const formatKpi = (currentVal, unit, decimals, lowerIsBetter = false) => {
            const c = parseFloat(currentVal);
            let valor = isNaN(c) ? 0 : c;

            if (unit === ' h') {
                valor = (valor / 60).toFixed(1) + ' h';
            } else {
                valor = valor.toFixed(decimals) + unit;
            }

            return { valor };
        };

        const kpiData = {
            eficiencia: formatKpi(currentData.eficiencia, '%', 1),
            atingimento: formatKpi(currentData.atingimento, '%', 1),
            producao: formatKpi(currentData.producao, ' m', 0),
            paradas: formatKpi(currentData.paradas_setup_min, ' h', 0)
        };

        res.json(kpiData);
    } catch (erro) {
        console.error('ERRO ao buscar dados para os KPIs:', erro);
        res.status(500).json({ error: 'Erro ao buscar dados dos KPIs.' });
    }
});

apiRouter.get('/usuario', async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await pool.query(
            'SELECT nome, email from usuario where id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado!' });
        }

        const usuario = rows[0];
        res.json({
            nome: usuario.nome,
            email: usuario.email
        })
    } catch (erro) {
        console.error('ERRO ao buscar perfil do usuário: ', erro);
        res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
});

//Histórico de cadastro
apiRouter.get('/historico', async (req, res) => {
    try {
        const query = `
        SELECT * FROM \`data\`
        ORDER BY \`Data (AAAA-MM-DD HH:MM:SS)\` DESC
        LIMIT 3
      `;

        console.log('🔍 Executando query para histórico...');
        console.log('📋 Query:', query);

        const [results] = await pool.query(query);

        console.log(`✅ Encontrados ${results.length} registros no histórico`);

        if (results.length > 0) {
            console.log('📄 Primeiro registro:', JSON.stringify(results[0], null, 2));
            console.log('🏷️ Colunas do primeiro registro:', Object.keys(results[0]));
        } else {
            console.log('📭 Nenhum registro encontrado na tabela data');
        }

        res.json(results);
    } catch (erro) {
        console.error('❌ ERRO ao buscar histórico:', erro);
        res.status(500).json({
            error: 'Erro ao buscar histórico de produção',
            detalhes: erro.message,
            sql: erro.sql
        });
    }
});

//Cadastro de dados
apiRouter.post('/cadastroDados', async (req, res) => {
    try {
        const {
            data,
            maquina,
            tipoTecido,     // "1 - Cotton" → vai extrair o número
            tipoSaida,      // "0 - Rolinho" → vai extrair o número
            numeroTarefa,
            tempoSetup,
            tempoProducao,
            quantidadeCarreiras,  // Mapear para "Quantidade de Trass"
            metrosProduzidos,
            observacoes,    // Campo novo
            tarefaCompleta,
            sobrasRolo
        } = req.body;

        if (!maquina || !tipoTecido || !tipoSaida || numeroTarefa == null) {
            return res.status(400).json({ erro: 'Campos obrigatórios faltando.' });
        }

        const extractNumber = (str) => {
            if (str === null || str === undefined) return 0;
            const match = str.toString().match(/^(\d+)/);
            return match ? parseInt(match[1]) : 0;
        };

        const tipoTecidoNumero = extractNumber(tipoTecido);
        const tipoSaidaNumero = extractNumber(tipoSaida);

        // Formatação da Data
        let dataFormatada = null;
        if (data) {
            dataFormatada = new Date(data).toISOString().slice(0, 19).replace('T', ' ');
        }

        const sql = `
            INSERT INTO \`data\` (
                \`Data (AAAA-MM-DD HH:MM:SS)\`,
                \`Maquina\`,
                \`Tipo Tecido\`,
                \`Tipo de Saida\`,
                \`Numero da tarefa\`,
                \`Tempo de setup\`,
                \`Tempo de Produção\`,
                \`Quantidade de Tiras\`,
                \`Metros Produzidos\`,
                \`Tarefa completa?\`,
                \`Sobra de Rolo?\`
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [
            dataFormatada,
            maquina,
            tipoTecidoNumero,      // Número extraído (ex: 1)
            tipoSaidaNumero,       // Número extraído (ex: 0)
            numeroTarefa,
            tempoSetup || 0,
            tempoProducao || 0,
            quantidadeCarreiras || 0,  // Mapeado para "Quantidade de Trass"
            metrosProduzidos || 0,
            tarefaCompleta ? 'TRUE' : 'FALSE',
            sobrasRolo ? 'TRUE' : 'FALSE'
        ]);

        res.status(201).json({
            mensagem: 'Registro de produção adicionado com sucesso!',
            id: result.insertId
        });

    } catch (erro) {
        console.error('ERRO NO CADASTRO:', erro);
        res.status(500).json({
            erro: 'Erro ao salvar no banco.',
            detalhes: erro.message,
            sql: erro.sql
        });
    }
});


//Cadastro 
app.post('/registro', (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' })
    }

    bcrypt.hash(senha, saltRounds)
        .then(senhaHash => {
            return pool.execute(
                'INSERT INTO usuario (nome, email, senha) VALUES (?,?,?)',
                [nome, email, senhaHash]
            );
        }).then(([result]) => {
            res.status(201).json({ mensagem: 'Usuário registrado com sucesso!', id: result.insertId })
        }).catch(error => {
            if (error.errno === 1062) {
                return res.status(409).json({ erro: 'Este e-mail já está em uso.' })
            }
            console.error('ERRO ao registrar usuário: ', error);
            res.status(500).json({ erro: 'Erro interno no servidor.' })
        });
});

//Login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' })
    }

    let usuarioEncontrado;

    // pool.query é usado para SELECTs simples
    pool.query('SELECT id, nome, senha FROM usuario where email = ?', [email])

        .then(([rows]) => {
            usuarioEncontrado = rows[0];

            if (!usuarioEncontrado) {
                return Promise.reject({ status: 401, message: 'E-mail ou senha inválidos.' });
            }

            return bcrypt.compare(senha, usuarioEncontrado.senha);
        })
        .then(match => {
            if (!match) {
                return Promise.reject({ status: 401, message: 'E-mail ou senha inválidos.' });
            }

            const token = jwt.sign(
                { id: usuarioEncontrado.id, nome: usuarioEncontrado.nome },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.status(200).json({
                mensagem: 'Login realizado com sucesso!',
                token: token,
                usuario: { id: usuarioEncontrado.id, nome: usuarioEncontrado.nome }
            });
        })
        .catch(error => {
            const status = error.status || 500;
            const message = error.message || 'Erro interno no servidor durante o login.';

            if (status === 500) {
                console.error('ERRO interno no login: ', error);
            }

            res.status(status).json({ erro: message })
        });
});

app.put('/alterar-senha', (req, res) => {
    const { email, senhaAtual, novaSenha } = req.body;

    // Validações
    if (!email || !senhaAtual || !novaSenha) {
        return res.status(400).json({ erro: 'E-mail, senha atual e nova senha são obrigatórios' });
    }

    if (novaSenha.length < 6) {
        return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres' });
    }

    let usuarioEncontrado;

    pool.query('SELECT id, nome, senha FROM usuario WHERE email = ?', [email])
        .then(([rows]) => {
            usuarioEncontrado = rows[0];

            if (!usuarioEncontrado) {
                return Promise.reject({ status: 404, message: 'Usuário não encontrado.' });
            }

            // Verificar se a senha atual está correta
            return bcrypt.compare(senhaAtual, usuarioEncontrado.senha);
        })
        .then(match => {
            if (!match) {
                return Promise.reject({ status: 401, message: 'Senha atual incorreta.' });
            }

            // Criptografar a nova senha
            return bcrypt.hash(novaSenha, 10);
        })
        .then(hashedNovaSenha => {
            // Atualizar a senha no banco de dados
            return pool.query('UPDATE usuario SET senha = ? WHERE email = ?', [hashedNovaSenha, email]);
        })
        .then(([result]) => {
            if (result.affectedRows === 0) {
                return Promise.reject({ status: 500, message: 'Erro ao atualizar senha.' });
            }

            res.status(200).json({
                mensagem: 'Senha alterada com sucesso!'
            });
        })
        .catch(error => {
            const status = error.status || 500;
            const message = error.message || 'Erro interno no servidor durante a alteração de senha.';

            if (status === 500) {
                console.error('ERRO interno na alteração de senha: ', error);
            }

            res.status(status).json({ erro: message });
        });
});

app.use('/api', apiRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});