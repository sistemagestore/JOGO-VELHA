// ===== CAMPO MINADO =====

// 1. Variáveis de Estado do Campo Minado
let minadoTabuleiro = [];
let tabuleiroRevelado = [];
let tabuleiroBandeiras = [];
let jogoIniciado = false;
let jogoTerminado = false;
let tempoInicio = 0;
let cronometro = null;
let dificuldadeMinado = 'facil';
let estatisticasMinado = {
    jogos: 0,
    vitorias: 0,
    melhorTempo: null
};

// 2. Configurações de Dificuldade
const configuracoesDificuldade = {
    facil: { linhas: 9, colunas: 9, minas: 10 },
    medio: { linhas: 16, colunas: 16, minas: 40 },
    dificil: { linhas: 16, colunas: 30, minas: 99 }
};

// 3. Inicializar Tabuleiro
function inicializarTabuleiroMinado() {
    const config = configuracoesDificuldade[dificuldadeMinado];
    minadoTabuleiro = [];
    tabuleiroRevelado = [];
    tabuleiroBandeiras = [];
    
    for (let linha = 0; linha < config.linhas; linha++) {
        minadoTabuleiro[linha] = [];
        tabuleiroRevelado[linha] = [];
        tabuleiroBandeiras[linha] = [];
        
        for (let coluna = 0; coluna < config.colunas; coluna++) {
            minadoTabuleiro[linha][coluna] = 0;
            tabuleiroRevelado[linha][coluna] = false;
            tabuleiroBandeiras[linha][coluna] = false;
        }
    }
    
    jogoIniciado = false;
    jogoTerminado = false;
    tempoInicio = 0;
    
    if (cronometro) {
        clearInterval(cronometro);
        cronometro = null;
    }
    
    atualizarTempo(0);
    atualizarBandeiras();
}

// 4. Colocar Minas
function colocarMinas(primeiraLinha, primeiraColuna) {
    const config = configuracoesDificuldade[dificuldadeMinado];
    let minasColocadas = 0;
    
    while (minasColocadas < config.minas) {
        const linha = Math.floor(Math.random() * config.linhas);
        const coluna = Math.floor(Math.random() * config.colunas);
        
        // Não coloca mina na primeira casa clicada nem em casas adjacentes
        if (minadoTabuleiro[linha][coluna] !== -1 && 
            !(linha === primeiraLinha && coluna === primeiraColuna) &&
            !saoAdjacentes(linha, coluna, primeiraLinha, primeiraColuna)) {
            
            minadoTabuleiro[linha][coluna] = -1;
            minasColocadas++;
        }
    }
    
    // Calcula números para casas sem mina
    for (let linha = 0; linha < config.linhas; linha++) {
        for (let coluna = 0; coluna < config.colunas; coluna++) {
            if (minadoTabuleiro[linha][coluna] !== -1) {
                minadoTabuleiro[linha][coluna] = contarMinasAdjacentes(linha, coluna);
            }
        }
    }
}

// 5. Verificar se são Adjacentes
function saoAdjacentes(linha1, coluna1, linha2, coluna2) {
    return Math.abs(linha1 - linha2) <= 1 && Math.abs(coluna1 - coluna2) <= 1;
}

// 6. Contar Minas Adjacentes
function contarMinasAdjacentes(linha, coluna) {
    const config = configuracoesDificuldade[dificuldadeMinado];
    let count = 0;
    
    for (let dLinha = -1; dLinha <= 1; dLinha++) {
        for (let dColuna = -1; dColuna <= 1; dColuna++) {
            const novaLinha = linha + dLinha;
            const novaColuna = coluna + dColuna;
            
            if (novaLinha >= 0 && novaLinha < config.linhas && 
                novaColuna >= 0 && novaColuna < config.colunas &&
                minadoTabuleiro[novaLinha][novaColuna] === -1) {
                count++;
            }
        }
    }
    
    return count;
}

// 7. Renderizar Tabuleiro
function renderizarTabuleiroMinado() {
    const tabuleiroDiv = document.getElementById('minado-tabuleiro');
    if (!tabuleiroDiv) {
        console.error('Elemento minado-tabuleiro não encontrado');
        return;
    }
    
    tabuleiroDiv.innerHTML = '';
    
    const config = configuracoesDificuldade[dificuldadeMinado];
    tabuleiroDiv.style.gridTemplateColumns = `repeat(${config.colunas}, 1fr)`;
    tabuleiroDiv.style.display = 'grid';
    tabuleiroDiv.style.gap = '2px';
    
    for (let linha = 0; linha < config.linhas; linha++) {
        for (let coluna = 0; coluna < config.colunas; coluna++) {
            const casa = document.createElement('div');
            casa.className = 'casa-minado';
            casa.dataset.linha = linha;
            casa.dataset.coluna = coluna;
            
            if (tabuleiroRevelado[linha][coluna]) {
                casa.classList.add('revelada');
                const valor = minadoTabuleiro[linha][coluna];
                if (valor === -1) {
                    casa.textContent = '💣';
                    casa.classList.add('mina');
                } else if (valor > 0) {
                    casa.textContent = valor;
                    casa.classList.add(`numero-${valor}`);
                }
            } else if (tabuleiroBandeiras[linha][coluna]) {
                casa.textContent = '🚩';
                casa.classList.add('bandeira');
            }
            
            casa.addEventListener('click', (e) => {
                e.preventDefault();
                lidarComCliqueMinado(linha, coluna, e);
            });
            casa.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                lidarComCliqueDireitoMinado(linha, coluna, e);
            });
            
            tabuleiroDiv.appendChild(casa);
        }
    }
    
    console.log(`Tabuleiro renderizado: ${config.linhas}x${config.colunas}`);
}

// 8. Lidar com Clique Esquerdo
function lidarComCliqueMinado(linha, coluna, evento) {
    if (jogoTerminado) return;
    
    evento.preventDefault();
    
    if (!jogoIniciado) {
        iniciarJogoMinado(linha, coluna);
        return;
    }
    
    if (tabuleiroRevelado[linha][coluna] || tabuleiroBandeiras[linha][coluna]) {
        return;
    }
    
    revelarCasa(linha, coluna);
    renderizarTabuleiroMinado();
    verificarFimJogoMinado();
}

// 9. Lidar com Clique Direito (Bandeira)
function lidarComCliqueDireitoMinado(linha, coluna, evento) {
    if (jogoTerminado) return;
    
    evento.preventDefault();
    
    if (tabuleiroRevelado[linha][coluna]) {
        return;
    }
    
    tabuleiroBandeiras[linha][coluna] = !tabuleiroBandeiras[linha][coluna];
    atualizarBandeiras();
    renderizarTabuleiroMinado();
}

// 10. Iniciar Jogo
function iniciarJogoMinado(primeiraLinha, primeiraColuna) {
    jogoIniciado = true;
    tempoInicio = Date.now();
    
    colocarMinas(primeiraLinha, primeiraColuna);
    revelarCasa(primeiraLinha, primeiraColuna);
    
    iniciarCronometro();
    adicionarAoHistoricoMinado('Jogo iniciado!');
}

// 11. Revelar Casa
function revelarCasa(linha, coluna) {
    if (tabuleiroRevelado[linha][coluna]) return;
    
    tabuleiroRevelado[linha][coluna] = true;
    
    // Se a casa está vazia, revela casas adjacentes
    if (minadoTabuleiro[linha][coluna] === 0) {
        const config = configuracoesDificuldade[dificuldadeMinado];
        
        for (let dLinha = -1; dLinha <= 1; dLinha++) {
            for (let dColuna = -1; dColuna <= 1; dColuna++) {
                const novaLinha = linha + dLinha;
                const novaColuna = coluna + dColuna;
                
                if (novaLinha >= 0 && novaLinha < config.linhas && 
                    novaColuna >= 0 && novaColuna < config.colunas &&
                    !tabuleiroRevelado[novaLinha][novaColuna]) {
                    revelarCasa(novaLinha, novaColuna);
                }
            }
        }
    }
}

// 12. Verificar Fim do Jogo
function verificarFimJogoMinado() {
    const config = configuracoesDificuldade[dificuldadeMinado];
    let casasReveladas = 0;
    let minasReveladas = 0;
    
    for (let linha = 0; linha < config.linhas; linha++) {
        for (let coluna = 0; coluna < config.colunas; coluna++) {
            if (tabuleiroRevelado[linha][coluna]) {
                casasReveladas++;
                if (minadoTabuleiro[linha][coluna] === -1) {
                    minasReveladas++;
                }
            }
        }
    }
    
    // Verifica se clicou em uma mina
    if (minasReveladas > 0) {
        finalizarJogoMinado(false);
        return;
    }
    
    // Verifica se ganhou
    const totalCasas = config.linhas * config.colunas;
    const casasSemMina = totalCasas - config.minas;
    
    if (casasReveladas === casasSemMina) {
        finalizarJogoMinado(true);
    }
}

// 13. Finalizar Jogo
function finalizarJogoMinado(vitoria) {
    jogoTerminado = true;
    
    if (cronometro) {
        clearInterval(cronometro);
        cronometro = null;
    }
    
    // Revela todas as minas
    const config = configuracoesDificuldade[dificuldadeMinado];
    for (let linha = 0; linha < config.linhas; linha++) {
        for (let coluna = 0; coluna < config.colunas; coluna++) {
            if (minadoTabuleiro[linha][coluna] === -1) {
                tabuleiroRevelado[linha][coluna] = true;
            }
        }
    }
    
    renderizarTabuleiroMinado();
    
    if (vitoria) {
        const tempoDecorrido = Math.floor((Date.now() - tempoInicio) / 1000);
        estatisticasMinado.jogos++;
        estatisticasMinado.vitorias++;
        
        if (!estatisticasMinado.melhorTempo || tempoDecorrido < estatisticasMinado.melhorTempo) {
            estatisticasMinado.melhorTempo = tempoDecorrido;
        }
        
        atualizarPlacarMinado();
        adicionarAoHistoricoMinado(`🎉 Vitória! Tempo: ${formatarTempo(tempoDecorrido)}`);
        incrementGameStats('minado');
    } else {
        estatisticasMinado.jogos++;
        atualizarPlacarMinado();
        adicionarAoHistoricoMinado('💥 Você explodiu! Tente novamente.');
    }
    
    atualizarEstatisticasMinado();
}

// 14. Iniciar Cronômetro
function iniciarCronometro() {
    cronometro = setInterval(() => {
        if (jogoIniciado && !jogoTerminado) {
            const tempoDecorrido = Math.floor((Date.now() - tempoInicio) / 1000);
            atualizarTempo(tempoDecorrido);
        }
    }, 1000);
}

// 15. Atualizar Tempo
function atualizarTempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    const tempoFormatado = `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
    
    document.getElementById('tempo').textContent = tempoFormatado;
}

// 16. Formatar Tempo
function formatarTempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
}

// 17. Atualizar Bandeiras
function atualizarBandeiras() {
    const config = configuracoesDificuldade[dificuldadeMinado];
    let bandeirasUsadas = 0;
    
    for (let linha = 0; linha < config.linhas; linha++) {
        for (let coluna = 0; coluna < config.colunas; coluna++) {
            if (tabuleiroBandeiras[linha][coluna]) {
                bandeirasUsadas++;
            }
        }
    }
    
    const bandeirasRestantes = config.minas - bandeirasUsadas;
    document.getElementById('bandeiras-restantes').textContent = bandeirasRestantes;
}

// 18. Novo Jogo
function novoJogoMinado() {
    inicializarTabuleiroMinado();
    renderizarTabuleiroMinado();
    atualizarBandeiras();
    adicionarAoHistoricoMinado('Novo jogo iniciado!');
}

// 19. Alternar Dificuldade
function alternarDificuldadeMinado() {
    const dificuldades = ['facil', 'medio', 'dificil'];
    const nomes = ['Fácil', 'Médio', 'Difícil'];
    const indexAtual = dificuldades.indexOf(dificuldadeMinado);
    const proximoIndex = (indexAtual + 1) % dificuldades.length;
    
    dificuldadeMinado = dificuldades[proximoIndex];
    document.getElementById('minado-dificuldade').textContent = `Dificuldade: ${nomes[proximoIndex]}`;
    
    novoJogoMinado();
    adicionarAoHistoricoMinado(`Dificuldade alterada para ${nomes[proximoIndex]}`);
}

// 20. Zerar Estatísticas
function zerarEstatisticasMinado() {
    if (confirm('Tem certeza que deseja zerar as estatísticas?')) {
        estatisticasMinado = {
            jogos: 0,
            vitorias: 0,
            melhorTempo: null
        };
        atualizarEstatisticasMinado();
        adicionarAoHistoricoMinado('Estatísticas zeradas!');
    }
}

// 21. Atualizar Estatísticas
function atualizarEstatisticasMinado() {
    const percentualVitoria = estatisticasMinado.jogos > 0 ? 
        Math.round((estatisticasMinado.vitorias / estatisticasMinado.jogos) * 100) : 0;
    
    const melhorTempo = estatisticasMinado.melhorTempo ? 
        formatarTempo(estatisticasMinado.melhorTempo) : 'N/A';
    
    // Atualiza elementos se existirem
    const statsDiv = document.querySelector('.minado-stats');
    if (statsDiv) {
        statsDiv.innerHTML = `
            <div class="minado-stat">
                <span>🎮 Jogos:</span>
                <span>${estatisticasMinado.jogos}</span>
            </div>
            <div class="minado-stat">
                <span>🏆 Vitórias:</span>
                <span>${estatisticasMinado.vitorias}</span>
            </div>
            <div class="minado-stat">
                <span>📊 Taxa:</span>
                <span>${percentualVitoria}%</span>
            </div>
            <div class="minado-stat">
                <span>⚡ Melhor:</span>
                <span>${melhorTempo}</span>
            </div>
        `;
    }
}

// 22. Adicionar ao Histórico
function adicionarAoHistoricoMinado(mensagem) {
    const timestamp = new Date().toLocaleTimeString();
    const historico = document.getElementById('minado-historico');
    const item = document.createElement('div');
    item.className = 'historia-item';
    item.textContent = `[${timestamp}] ${mensagem}`;
    historico.insertBefore(item, historico.firstChild);
    
    // Mantém apenas os últimos 10 itens
    while (historico.children.length > 10) {
        historico.removeChild(historico.lastChild);
    }
}

// 23. Carregar Estatísticas
function carregarEstatisticasMinado() {
    const saved = localStorage.getItem('estatisticasMinado');
    if (saved) {
        estatisticasMinado = JSON.parse(saved);
        atualizarEstatisticasMinado();
    }
}

// 24. Salvar Estatísticas
function salvarEstatisticasMinado() {
    localStorage.setItem('estatisticasMinado', JSON.stringify(estatisticasMinado));
}

// 25. Atualizar Estatísticas no Placar
function atualizarPlacarMinado() {
    document.getElementById('minado-jogos').textContent = estatisticasMinado.jogos;
    document.getElementById('minado-vitorias').textContent = estatisticasMinado.vitorias;
}

// 26. Inicialização Completa
function initMinadoGame() {
    carregarEstatisticasMinado();
    inicializarTabuleiroMinado();
    renderizarTabuleiroMinado();
    atualizarEstatisticasMinado();
    atualizarPlacarMinado();
    
    // Remove event listeners existentes para evitar duplicação
    const botaoNovo = document.getElementById('minado-novo');
    const botaoDificuldade = document.getElementById('minado-dificuldade');
    const botaoZerar = document.getElementById('minado-zerar');
    
    if (botaoNovo) {
        botaoNovo.removeEventListener('click', novoJogoMinado);
        botaoNovo.addEventListener('click', novoJogoMinado);
    }
    
    if (botaoDificuldade) {
        botaoDificuldade.removeEventListener('click', alternarDificuldadeMinado);
        botaoDificuldade.addEventListener('click', alternarDificuldadeMinado);
    }
    
    if (botaoZerar) {
        botaoZerar.removeEventListener('click', zerarEstatisticasMinado);
        botaoZerar.addEventListener('click', zerarEstatisticasMinado);
    }
    
    adicionarAoHistoricoMinado('Campo Minado carregado!');
    
    // Salva estatísticas ao fechar
    window.addEventListener('beforeunload', salvarEstatisticasMinado);
}
