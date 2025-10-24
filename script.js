// ===== JOGO DA VELHA MELHORADO =====

// 1. Variáveis de Estado Globais
let tabuleiro = ["", "", "", "", "", "", "", "", ""];
let jogadorAtual = "X";
let jogoAtivo = true;
let modoJogo = "2jogadores"; // "2jogadores" ou "ia"
let dificuldadeIA = "facil"; // "facil", "medio", "dificil"
let placar = { X: 0, O: 0 };
let historicoJogadas = [];
let historicoTabuleiros = [];
let nomesJogadores = { X: "X", O: "O" };
let nomesConfirmadosFlag = false;

// 2. Condições de Vitória
const condicoesVitoria = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]              // Diagonais
];

// 3. Referências do DOM
const celulas = document.querySelectorAll('.celula');
const statusDisplay = document.getElementById('status');
const botaoReiniciar = document.getElementById('reiniciar');
const botaoDesfazer = document.getElementById('desfazer');
const botaoModoJogo = document.getElementById('modoJogo');
const botaoDificuldade = document.getElementById('dificuldade');
const botaoZerarPlacar = document.getElementById('zerarPlacar');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const historico = document.getElementById('historico');
const playerXName = document.getElementById('playerXName');
const playerOName = document.getElementById('playerOName');

// ===== FUNÇÕES PRINCIPAIS =====

// Ação de Clique
function lidarComClique(evento) {
    const celulaClicada = evento.target;
    const indexClicado = parseInt(celulaClicada.getAttribute('data-index'));

    if (tabuleiro[indexClicado] !== "" || !jogoAtivo) {
        return;
    }

    // Salva estado para desfazer
    salvarEstado();
    
    fazerJogada(celulaClicada, indexClicado);
    adicionarAoHistorico(`${nomesJogadores[jogadorAtual]} jogou na posição ${indexClicado + 1}`);
    
    verificarResultado();
    
    // Se for modo IA e não acabou o jogo, faz jogada da IA
    if (modoJogo === "ia" && jogoAtivo && jogadorAtual === "O") {
        setTimeout(() => {
            fazerJogadaIA();
        }, 500);
    }
}

// Atualiza o DOM e o array
function fazerJogada(celula, index) {
    tabuleiro[index] = jogadorAtual;
    celula.textContent = jogadorAtual;
    celula.classList.add(jogadorAtual);
    
    // Efeito sonoro (se suportado)
    tocarSom('jogada');
}

// Verifica resultado do jogo
function verificarResultado() {
    const resultado = verificarVitoria();
    
    if (resultado.venceu) {
        finalizarJogo(resultado.vencedor, resultado.combinacao);
        return;
    }

    if (verificarEmpate()) {
        finalizarJogo("empate");
        return;
    }

    trocarJogador();
}

// Verifica se há vitória
function verificarVitoria() {
    for (let i = 0; i < condicoesVitoria.length; i++) {
        const [a, b, c] = condicoesVitoria[i];
        if (tabuleiro[a] && tabuleiro[a] === tabuleiro[b] && tabuleiro[a] === tabuleiro[c]) {
            return {
                venceu: true,
                vencedor: tabuleiro[a],
                combinacao: [a, b, c]
            };
        }
    }
    return { venceu: false };
}

// Verifica empate
function verificarEmpate() {
    return !tabuleiro.includes("");
}

// Finaliza o jogo
function finalizarJogo(resultado, combinacao = null) {
    jogoAtivo = false;
    
    if (combinacao) {
        destacarCombinacaoVencedora(combinacao);
    }
    
    if (resultado === "empate") {
        statusDisplay.textContent = "🤝 Empate!";
        adicionarAoHistorico("Jogo terminou em empate!");
        tocarSom('empate');
    } else {
        placar[resultado]++;
        atualizarPlacar();
        statusDisplay.textContent = `🎉 ${nomesJogadores[resultado]} Venceu!`;
        adicionarAoHistorico(`🎉 ${nomesJogadores[resultado]} venceu!`);
        tocarSom('vitoria');
    }
}

// Destaca células vencedoras
function destacarCombinacaoVencedora(combinacao) {
    combinacao.forEach(index => {
        celulas[index].classList.add('winning');
    });
}

// Alterna jogador
function trocarJogador() {
    jogadorAtual = jogadorAtual === "X" ? "O" : "X";
    statusDisplay.textContent = `Vez do ${nomesJogadores[jogadorAtual]}`;
}

// ===== FUNÇÕES DE IA =====

// Faz jogada da IA
function fazerJogadaIA() {
    if (!jogoAtivo) return;
    
    const melhorJogada = obterMelhorJogada();
    const celulaIA = celulas[melhorJogada];
    
    salvarEstado();
    fazerJogada(celulaIA, melhorJogada);
    adicionarAoHistorico(`IA jogou na posição ${melhorJogada + 1}`);
    
    verificarResultado();
}

// Obtém melhor jogada baseada na dificuldade
function obterMelhorJogada() {
    switch (dificuldadeIA) {
        case "facil":
            return obterJogadaFacil();
        case "medio":
            return Math.random() < 0.7 ? obterMelhorJogadaInteligente() : obterJogadaFacil();
        case "dificil":
            return obterMelhorJogadaInteligente();
        default:
            return obterJogadaFacil();
    }
}

// IA Fácil - jogada aleatória
function obterJogadaFacil() {
    const jogadasDisponiveis = tabuleiro.map((celula, index) => celula === "" ? index : null)
                                       .filter(index => index !== null);
    return jogadasDisponiveis[Math.floor(Math.random() * jogadasDisponiveis.length)];
}

// IA Inteligente - algoritmo minimax
function obterMelhorJogadaInteligente() {
    // Primeiro, verifica se pode ganhar
    for (let i = 0; i < 9; i++) {
        if (tabuleiro[i] === "") {
            tabuleiro[i] = "O";
            if (verificarVitoria().venceu) {
                tabuleiro[i] = "";
                return i;
            }
            tabuleiro[i] = "";
        }
    }
    
    // Depois, verifica se deve bloquear
    for (let i = 0; i < 9; i++) {
        if (tabuleiro[i] === "") {
            tabuleiro[i] = "X";
            if (verificarVitoria().venceu) {
                tabuleiro[i] = "";
                return i;
            }
            tabuleiro[i] = "";
        }
    }
    
    // Estratégia: centro, cantos, bordas
    const centro = 4;
    if (tabuleiro[centro] === "") return centro;
    
    const cantos = [0, 2, 6, 8];
    for (let canto of cantos) {
        if (tabuleiro[canto] === "") return canto;
    }
    
    const bordas = [1, 3, 5, 7];
    for (let borda of bordas) {
        if (tabuleiro[borda] === "") return borda;
    }
    
    return obterJogadaFacil();
}

// ===== FUNÇÕES DE CONTROLE =====

// Reinicia o jogo
function reiniciarJogo() {
    tabuleiro = ["", "", "", "", "", "", "", "", ""];
    jogadorAtual = "X";
    jogoAtivo = true;
    historicoJogadas = [];
    historicoTabuleiros = [];
    
    statusDisplay.textContent = `Vez do ${nomesJogadores.X}`;
    atualizarHistorico();
    
    celulas.forEach(celula => {
        celula.textContent = "";
        celula.classList.remove('X', 'O', 'winning');
    });
    
    tocarSom('reiniciar');
}

// Desfaz última jogada
function desfazerJogada() {
    if (historicoTabuleiros.length === 0) return;
    
    const estadoAnterior = historicoTabuleiros.pop();
    const jogadaAnterior = historicoJogadas.pop();
    
    tabuleiro = estadoAnterior.tabuleiro;
    jogadorAtual = estadoAnterior.jogadorAtual;
    jogoAtivo = estadoAnterior.jogoAtivo;
    
    // Atualiza visual
    celulas.forEach((celula, index) => {
        celula.textContent = tabuleiro[index];
        celula.classList.remove('X', 'O', 'winning');
        if (tabuleiro[index]) {
            celula.classList.add(tabuleiro[index]);
        }
    });
    
    statusDisplay.textContent = `Vez do ${nomesJogadores[jogadorAtual]}`;
    atualizarHistorico();
    tocarSom('desfazer');
}

// Salva estado para desfazer
function salvarEstado() {
    historicoTabuleiros.push({
        tabuleiro: [...tabuleiro],
        jogadorAtual: jogadorAtual,
        jogoAtivo: jogoAtivo
    });
    
    if (historicoTabuleiros.length > 10) {
        historicoTabuleiros.shift();
    }
}

// ===== FUNÇÕES DE INTERFACE =====

// Alterna modo de jogo
function alternarModoJogo() {
    modoJogo = modoJogo === "2jogadores" ? "ia" : "2jogadores";
    botaoModoJogo.textContent = `Modo: ${modoJogo === "2jogadores" ? "2 Jogadores" : "vs IA"}`;
    botaoDificuldade.style.display = modoJogo === "ia" ? "block" : "none";
    
    // Atualiza nomes baseado no modo
    if (modoJogo === "ia") {
        nomesJogadores.O = "IA";
        adicionarAoHistorico("Modo alterado para vs IA");
    } else {
        nomesJogadores.O = "O";
        adicionarAoHistorico("Modo alterado para 2 jogadores");
    }
    
    // Atualiza display dos nomes
    playerXName.textContent = nomesJogadores.X;
    playerOName.textContent = nomesJogadores.O;
}

// Alterna dificuldade da IA
function alternarDificuldade() {
    const dificuldades = ["facil", "medio", "dificil"];
    const nomes = ["Fácil", "Médio", "Difícil"];
    const indexAtual = dificuldades.indexOf(dificuldadeIA);
    const proximoIndex = (indexAtual + 1) % dificuldades.length;
    
    dificuldadeIA = dificuldades[proximoIndex];
    botaoDificuldade.textContent = `Dificuldade: ${nomes[proximoIndex]}`;
    adicionarAoHistorico(`Dificuldade da IA alterada para ${nomes[proximoIndex]}`);
}

// Atualiza placar
function atualizarPlacar() {
    scoreX.textContent = placar.X;
    scoreO.textContent = placar.O;
}

// Inicializa nomes dos jogadores
function inicializarNomes() {
    nomesJogadores.X = "X";
    nomesJogadores.O = modoJogo === "ia" ? "IA" : "O";
    
    playerXName.textContent = nomesJogadores.X;
    playerOName.textContent = nomesJogadores.O;
}

// Zera o placar
function zerarPlacar() {
    if (confirm("Tem certeza que deseja zerar o placar?")) {
        placar = { X: 0, O: 0 };
        atualizarPlacar();
        adicionarAoHistorico("Placar zerado!");
        tocarSom('reiniciar');
    }
}

// Adiciona ao histórico
function adicionarAoHistorico(mensagem) {
    const timestamp = new Date().toLocaleTimeString();
    historicoJogadas.push(`[${timestamp}] ${mensagem}`);
    atualizarHistorico();
}

// Atualiza histórico na tela
function atualizarHistorico() {
    historico.innerHTML = historicoJogadas
        .slice(-10) // Mostra apenas as últimas 10
        .reverse()
        .map(jogada => `<div class="historia-item">${jogada}</div>`)
        .join('');
}

// ===== FUNÇÕES DE ÁUDIO =====

// Toca som (se suportado)
function tocarSom(tipo) {
    // Criação de sons usando Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    let frequencia, duracao;
    
    switch (tipo) {
        case 'jogada':
            frequencia = 800;
            duracao = 0.1;
            break;
        case 'vitoria':
            frequencia = 1000;
            duracao = 0.5;
            break;
        case 'empate':
            frequencia = 400;
            duracao = 0.3;
            break;
        case 'reiniciar':
            frequencia = 600;
            duracao = 0.2;
            break;
        case 'desfazer':
            frequencia = 300;
            duracao = 0.15;
            break;
        default:
            frequencia = 500;
            duracao = 0.1;
    }
    
    oscillator.frequency.setValueAtTime(frequencia, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duracao);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duracao);
}

// ===== CONFIGURAÇÃO DE EVENT LISTENERS =====

// Event listeners principais
celulas.forEach(celula => {
    celula.addEventListener('click', lidarComClique);
});

botaoReiniciar.addEventListener('click', reiniciarJogo);
botaoDesfazer.addEventListener('click', desfazerJogada);
botaoModoJogo.addEventListener('click', alternarModoJogo);
botaoDificuldade.addEventListener('click', alternarDificuldade);
botaoZerarPlacar.addEventListener('click', zerarPlacar);

// Event listeners para nomes dos jogadores (removido - agora só confirma com botão)

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    atualizarPlacar();
    inicializarNomes(); // Configura nomes iniciais
    
    adicionarAoHistorico("Jogo iniciado! Escolha o modo e comece a jogar.");
});