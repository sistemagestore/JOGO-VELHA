// ===== DASHBOARD DE JOGOS - SISTEMA PRINCIPAL =====

// 1. Variáveis Globais
let currentGame = 'dashboard';
let gameStats = {
    velha: 0,
    damas: 0,
    minado: 0
};

// 2. Referências do DOM
const navButtons = document.querySelectorAll('.nav-btn');
const gameSections = document.querySelectorAll('.game-section');
const gameCards = document.querySelectorAll('.game-card');
const backButtons = document.querySelectorAll('.back-btn');
const statsElements = {
    velha: document.getElementById('velha-stats'),
    damas: document.getElementById('damas-stats'),
    minado: document.getElementById('minado-stats')
};

// 3. Sistema de Navegação
function showGame(gameId) {
    // Esconde todas as seções
    gameSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active de todos os botões de navegação
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostra a seção selecionada
    const targetSection = document.getElementById(gameId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Ativa o botão correspondente
    const targetBtn = document.querySelector(`[data-game="${gameId}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    currentGame = gameId;
    
    // Carrega o jogo específico se necessário
    loadGameContent(gameId);
}

// 4. Carregamento de Conteúdo dos Jogos
function loadGameContent(gameId) {
    const contentDiv = document.getElementById(`${gameId}-content`);
    
    switch (gameId) {
        case 'velha':
            loadVelhaGame();
            break;
        case 'damas':
            loadDamasGame();
            break;
        case 'minado':
            loadMinadoGame();
            break;
        case 'dashboard':
            updateStats();
            break;
    }
}

// 5. Carregamento do Jogo da Velha
function loadVelhaGame() {
    const contentDiv = document.getElementById('velha-content');
    
    contentDiv.innerHTML = `
        <div class="velha-container">
            <div class="game-info">
                <div id="status">Vez do Jogador X</div>
                <div class="scoreboard">
                    <div class="score">
                        <span class="player" id="playerXName">X</span>
                        <span id="scoreX">0</span>
                    </div>
                    <div class="score">
                        <span class="player" id="playerOName">O</span>
                        <span id="scoreO">0</span>
                    </div>
                </div>
            </div>

            <div class="player-settings">
                <h3>⚙️ Configurações do Jogo</h3>
                <div class="game-mode-info">
                    <p>🎮 Jogue contra um amigo ou teste suas habilidades contra a IA!</p>
                </div>
            </div>

            <div class="game-controls">
                <button id="modoJogo" class="btn-secondary">Modo: 2 Jogadores</button>
                <button id="dificuldade" class="btn-secondary" style="display: none;">Dificuldade: Fácil</button>
                <button id="zerarPlacar" class="btn-danger">🗑️ Zerar Placar</button>
            </div>

            <div class="game-area">
                <div class="game-board-container">
                    <div id="tabuleiro">
                        <div class="celula" data-index="0"></div>
                        <div class="celula" data-index="1"></div>
                        <div class="celula" data-index="2"></div>
                        <div class="celula" data-index="3"></div>
                        <div class="celula" data-index="4"></div>
                        <div class="celula" data-index="5"></div>
                        <div class="celula" data-index="6"></div>
                        <div class="celula" data-index="7"></div>
                        <div class="celula" data-index="8"></div>
                    </div>
                </div>

                <div class="game-actions">
                    <button id="reiniciar" class="btn-primary">🔄 Reiniciar Jogo</button>
                    <button id="desfazer" class="btn-secondary">↶ Desfazer</button>
                </div>
            </div>

            <div class="game-history">
                <h3>📋 Histórico de Jogadas</h3>
                <div id="historico"></div>
            </div>
        </div>
    `;
    
    // Carrega os estilos e scripts do Jogo da Velha
    loadStyles('styles.css').then(() => {
        loadScript('script.js').then(() => {
            // Aguarda um pouco para garantir que o script foi carregado
            setTimeout(() => {
                if (typeof inicializarNomes === 'function') {
                    inicializarNomes();
                }
            }, 100);
        });
    });
}

// 6. Carregamento do Jogo de Damas
function loadDamasGame() {
    const contentDiv = document.getElementById('damas-content');
    
    contentDiv.innerHTML = `
        <div class="damas-container">
            <div class="damas-info">
                <div id="damas-status">Vez do Jogador Preto</div>
                <div class="damas-scoreboard">
                    <div class="damas-score">
                        <span class="player">♟️ Preto</span>
                        <span id="damas-score-preto">0</span>
                    </div>
                    <div class="damas-score">
                        <span class="player">♟️ Branco</span>
                        <span id="damas-score-branco">0</span>
                    </div>
                </div>
            </div>

            <div class="damas-controls">
                <button id="damas-modo" class="btn-secondary">Modo: 2 Jogadores</button>
                <button id="damas-dificuldade" class="btn-secondary" style="display: none;">Dificuldade: Fácil</button>
                <button id="damas-reiniciar" class="btn-primary">🔄 Novo Jogo</button>
                <button id="damas-zerar" class="btn-danger">🗑️ Zerar Placar</button>
            </div>

            <div class="damas-board-container">
                <div id="damas-tabuleiro">
                    <!-- Tabuleiro 8x8 será gerado dinamicamente -->
                </div>
            </div>

            <div class="damas-history">
                <h3>📋 Histórico de Movimentos</h3>
                <div id="damas-historico"></div>
            </div>
        </div>
    `;
    
    // Carrega os estilos e scripts do Jogo de Damas
    loadStyles('damas-styles.css').then(() => {
        loadScript('damas-game.js').then(() => {
            // Aguarda um pouco para garantir que o script foi carregado
            setTimeout(() => {
                if (typeof initDamasGame === 'function') {
                    initDamasGame();
                }
            }, 100);
        });
    });
}

// 7. Carregamento do Campo Minado
function loadMinadoGame() {
    const contentDiv = document.getElementById('minado-content');
    
    contentDiv.innerHTML = `
        <div class="minado-container">
            <div class="minado-info">
                <div id="minado-status">💣 Campo Minado - Clique para começar!</div>
                <div class="minado-scoreboard">
                    <div class="minado-score">
                        <span class="player">🎮 Jogos</span>
                        <span id="minado-jogos">0</span>
                    </div>
                    <div class="minado-score">
                        <span class="player">🏆 Vitórias</span>
                        <span id="minado-vitorias">0</span>
                    </div>
                </div>
            </div>

            <div class="minado-stats">
                <div class="minado-stat">
                    <span>🚩 Bandeiras:</span>
                    <span id="bandeiras-restantes">10</span>
                </div>
                <div class="minado-stat">
                    <span>⏱️ Tempo:</span>
                    <span id="tempo">00:00</span>
                </div>
            </div>

            <div class="minado-controls">
                <button id="minado-novo" class="btn-primary">🆕 Novo Jogo</button>
                <button id="minado-dificuldade" class="btn-secondary">Dificuldade: Fácil</button>
                <button id="minado-zerar" class="btn-danger">🗑️ Zerar Estatísticas</button>
            </div>

            <div class="minado-board-container">
                <div id="minado-tabuleiro">
                    <!-- Tabuleiro será gerado dinamicamente -->
                </div>
            </div>

            <div class="minado-history">
                <h3>📋 Histórico de Jogos</h3>
                <div id="minado-historico"></div>
            </div>
        </div>
    `;
    
    // Carrega os estilos e scripts do Campo Minado
    loadStyles('minado-styles.css').then(() => {
        loadScript('minado-game.js').then(() => {
            // Aguarda um pouco para garantir que o script foi carregado
            setTimeout(() => {
                if (typeof initMinadoGame === 'function') {
                    initMinadoGame();
                }
            }, 100);
        });
    });
}

// 8. Sistema de Carregamento de Scripts e Estilos
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function loadStyles(src) {
    return new Promise((resolve, reject) => {
        // Verifica se o estilo já foi carregado
        if (document.querySelector(`link[href="${src}"]`)) {
            resolve();
            return;
        }
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = src;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

// 9. Atualização de Estatísticas
function updateStats() {
    statsElements.velha.textContent = `${gameStats.velha} jogos`;
    statsElements.damas.textContent = `${gameStats.damas} jogos`;
    statsElements.minado.textContent = `${gameStats.minado} jogos`;
}

// 10. Incrementar Estatísticas
function incrementGameStats(gameType) {
    if (gameStats.hasOwnProperty(gameType)) {
        gameStats[gameType]++;
        updateStats();
        
        // Salva no localStorage
        localStorage.setItem('gameStats', JSON.stringify(gameStats));
    }
}

// 11. Carregar Estatísticas do localStorage
function loadGameStats() {
    const savedStats = localStorage.getItem('gameStats');
    if (savedStats) {
        gameStats = JSON.parse(savedStats);
        updateStats();
    }
}

// 12. Event Listeners
function setupEventListeners() {
    // Navegação principal
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const gameId = btn.getAttribute('data-game');
            showGame(gameId);
        });
    });

    // Cards de jogos no dashboard
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const gameId = card.getAttribute('data-game');
            showGame(gameId);
        });
    });

    // Botões de voltar
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            showGame('dashboard');
        });
    });
}

// 13. Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadGameStats();
    showGame('dashboard');
});

// 14. Funções dos Jogos (serão implementadas nos arquivos específicos)

// Jogo de Damas
function initDamasGame() {
    // Implementação do jogo de Damas
    console.log('Inicializando jogo de Damas...');
    incrementGameStats('damas');
}

// Campo Minado
function initMinadoGame() {
    // Implementação do Campo Minado
    console.log('Inicializando Campo Minado...');
    incrementGameStats('minado');
}
