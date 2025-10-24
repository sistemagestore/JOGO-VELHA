// ===== JOGO DE DAMAS =====

// 1. Variáveis de Estado do Jogo de Damas
let damasTabuleiro = [];
let jogadorAtualDamas = 'preto';
let jogoAtivoDamas = true;
let pecaSelecionada = null;
let movimentosPossiveis = [];
let capturasObrigatorias = [];
let placarDamas = { preto: 0, branco: 0 };
let historicoDamas = [];
let modoJogoDamas = '2jogadores'; // "2jogadores" ou "ia"
let dificuldadeIADamas = 'facil'; // "facil", "medio", "dificil"

// 2. Inicialização do Tabuleiro de Damas
function inicializarTabuleiroDamas() {
    damasTabuleiro = [];
    
    // Cria tabuleiro 8x8
    for (let linha = 0; linha < 8; linha++) {
        damasTabuleiro[linha] = [];
        for (let coluna = 0; coluna < 8; coluna++) {
            damasTabuleiro[linha][coluna] = null;
        }
    }
    
    // Posiciona peças pretas (linhas 0, 1, 2)
    for (let linha = 0; linha < 3; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            if ((linha + coluna) % 2 === 1) {
                damasTabuleiro[linha][coluna] = {
                    tipo: 'peao',
                    cor: 'preto',
                    dama: false
                };
            }
        }
    }
    
    // Posiciona peças brancas (linhas 5, 6, 7)
    for (let linha = 5; linha < 8; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            if ((linha + coluna) % 2 === 1) {
                damasTabuleiro[linha][coluna] = {
                    tipo: 'peao',
                    cor: 'branco',
                    dama: false
                };
            }
        }
    }
    
    console.log('Tabuleiro de Damas inicializado');
    console.log('Modo atual:', modoJogoDamas);
}

// 3. Renderização do Tabuleiro
function renderizarTabuleiroDamas() {
    const tabuleiroDiv = document.getElementById('damas-tabuleiro');
    if (!tabuleiroDiv) {
        console.error('Elemento damas-tabuleiro não encontrado');
        return;
    }
    
    tabuleiroDiv.innerHTML = '';
    
    for (let linha = 0; linha < 8; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            const casa = document.createElement('div');
            casa.className = 'casa-damas';
            casa.dataset.linha = linha;
            casa.dataset.coluna = coluna;
            
            // Alterna cores das casas
            if ((linha + coluna) % 2 === 0) {
                casa.classList.add('casa-branca');
            } else {
                casa.classList.add('casa-preta');
            }
            
            // Adiciona peça se existir
            const peca = damasTabuleiro[linha][coluna];
            if (peca) {
                const pecaElement = document.createElement('div');
                pecaElement.className = `peca-damas ${peca.cor}`;
                if (peca.dama) {
                    pecaElement.classList.add('dama');
                }
                pecaElement.textContent = peca.dama ? '♛' : '♟';
                casa.appendChild(pecaElement);
            }
            
            // Destaca movimentos possíveis
            if (movimentosPossiveis.some(mov => mov.linha === linha && mov.coluna === coluna)) {
                casa.classList.add('movimento-possivel');
            }
            
            // Destaca peça selecionada
            if (pecaSelecionada && pecaSelecionada.linha === linha && pecaSelecionada.coluna === coluna) {
                casa.classList.add('peca-selecionada');
            }
            
            casa.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                lidarComCliqueDamas(linha, coluna);
            });
            
            tabuleiroDiv.appendChild(casa);
        }
    }
}

// 4. Lógica de Clique no Tabuleiro
function lidarComCliqueDamas(linha, coluna) {
    if (!jogoAtivoDamas) return;
    
    // Se for modo IA e for vez do branco, não permite clique
    if (modoJogoDamas === 'ia' && jogadorAtualDamas === 'branco') {
        return;
    }
    
    const peca = damasTabuleiro[linha][coluna];
    
    // Se clicou em uma peça do jogador atual
    if (peca && peca.cor === jogadorAtualDamas) {
        selecionarPeca(linha, coluna);
    }
    // Se clicou em um movimento possível
    else if (movimentosPossiveis.some(mov => mov.linha === linha && mov.coluna === coluna)) {
        fazerMovimento(linha, coluna);
    }
    // Se clicou em casa vazia, deseleciona
    else {
        deselecionarPeca();
    }
}

// Função para lidar com clique (wrapper)
function lidarComCliqueDamasWrapper(evento) {
    const linha = parseInt(evento.target.dataset.linha);
    const coluna = parseInt(evento.target.dataset.coluna);
    if (!isNaN(linha) && !isNaN(coluna)) {
        lidarComCliqueDamas(linha, coluna);
    }
}

// 5. Seleção de Peça
function selecionarPeca(linha, coluna) {
    deselecionarPeca();
    
    pecaSelecionada = { linha, coluna };
    movimentosPossiveis = obterMovimentosPossiveis(linha, coluna);
    
    // Verifica se há capturas obrigatórias
    const capturas = obterCapturasPossiveis(linha, coluna);
    if (capturas.length > 0) {
        movimentosPossiveis = capturas;
    }
    
    renderizarTabuleiroDamas();
}

// 6. Deseleção de Peça
function deselecionarPeca() {
    pecaSelecionada = null;
    movimentosPossiveis = [];
    renderizarTabuleiroDamas();
}

// 7. Obter Movimentos Possíveis
function obterMovimentosPossiveis(linha, coluna) {
    const peca = damasTabuleiro[linha][coluna];
    if (!peca) return [];
    
    const movimentos = [];
    const direcoes = peca.dama ? 
        [[-1, -1], [-1, 1], [1, -1], [1, 1]] : // Dama pode ir em todas as direções
        (peca.cor === 'preto' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]]); // Peão só para frente
    
    for (const [dLinha, dColuna] of direcoes) {
        const novaLinha = linha + dLinha;
        const novaColuna = coluna + dColuna;
        
        if (novaLinha >= 0 && novaLinha < 8 && novaColuna >= 0 && novaColuna < 8) {
            if (!damasTabuleiro[novaLinha][novaColuna]) {
                movimentos.push({ linha: novaLinha, coluna: novaColuna });
            }
        }
    }
    
    return movimentos;
}

// 8. Obter Capturas Possíveis
function obterCapturasPossiveis(linha, coluna) {
    const peca = damasTabuleiro[linha][coluna];
    if (!peca) return [];
    
    const capturas = [];
    const direcoes = peca.dama ? 
        [[-1, -1], [-1, 1], [1, -1], [1, 1]] :
        (peca.cor === 'preto' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]]);
    
    for (const [dLinha, dColuna] of direcoes) {
        const linhaIntermedia = linha + dLinha;
        const colunaIntermedia = coluna + dColuna;
        const linhaDestino = linha + (dLinha * 2);
        const colunaDestino = coluna + (dColuna * 2);
        
        if (linhaDestino >= 0 && linhaDestino < 8 && colunaDestino >= 0 && colunaDestino < 8) {
            const pecaIntermedia = damasTabuleiro[linhaIntermedia][colunaIntermedia];
            const casaDestino = damasTabuleiro[linhaDestino][colunaDestino];
            
            if (pecaIntermedia && pecaIntermedia.cor !== peca.cor && !casaDestino) {
                capturas.push({ 
                    linha: linhaDestino, 
                    coluna: colunaDestino,
                    captura: { linha: linhaIntermedia, coluna: colunaIntermedia }
                });
            }
        }
    }
    
    return capturas;
}

// 9. Fazer Movimento
function fazerMovimento(linha, coluna) {
    if (!pecaSelecionada) return;
    
    const peca = damasTabuleiro[pecaSelecionada.linha][pecaSelecionada.coluna];
    const movimento = movimentosPossiveis.find(mov => mov.linha === linha && mov.coluna === coluna);
    
    if (!movimento) return;
    
    // Salva estado para histórico
    salvarEstadoDamas();
    
    // Move a peça
    damasTabuleiro[linha][coluna] = peca;
    damasTabuleiro[pecaSelecionada.linha][pecaSelecionada.coluna] = null;
    
    // Se foi uma captura, remove a peça capturada
    if (movimento.captura) {
        damasTabuleiro[movimento.captura.linha][movimento.captura.coluna] = null;
        adicionarAoHistoricoDamas(`${peca.cor} capturou uma peça!`);
    }
    
    // Verifica se a peça virou dama
    if ((peca.cor === 'preto' && linha === 7) || (peca.cor === 'branco' && linha === 0)) {
        peca.dama = true;
        adicionarAoHistoricoDamas(`${peca.cor} virou dama!`);
    }
    
    // Verifica se há mais capturas obrigatórias
    const capturasAdicionais = obterCapturasPossiveis(linha, coluna);
    if (capturasAdicionais.length > 0 && movimento.captura) {
        // Continua o turno do mesmo jogador
        pecaSelecionada = { linha, coluna };
        movimentosPossiveis = capturasAdicionais;
        renderizarTabuleiroDamas();
        return;
    }
    
    // Finaliza o movimento
    deselecionarPeca();
    verificarFimJogoDamas();
    
    if (jogoAtivoDamas) {
        trocarJogadorDamas();
        
        // Se for modo IA e for vez do branco, faz jogada da IA
        if (modoJogoDamas === 'ia' && jogadorAtualDamas === 'branco') {
            console.log('IA vai jogar...');
            setTimeout(() => {
                if (jogoAtivoDamas && jogadorAtualDamas === 'branco') {
                    fazerJogadaIADamas();
                }
            }, 1500);
        }
    }
    
    renderizarTabuleiroDamas();
}

// 10. Trocar Jogador
function trocarJogadorDamas() {
    jogadorAtualDamas = jogadorAtualDamas === 'preto' ? 'branco' : 'preto';
    atualizarStatusDamas();
}

// 11. Atualizar Status
function atualizarStatusDamas() {
    const status = document.getElementById('damas-status');
    const corJogador = jogadorAtualDamas === 'preto' ? '♟️ Preto' : '♟️ Branco';
    status.textContent = `Vez do Jogador ${corJogador}`;
}

// 12. Verificar Fim do Jogo
function verificarFimJogoDamas() {
    const pecasPretas = contarPecas('preto');
    const pecasBrancas = contarPecas('branco');
    
    if (pecasPretas === 0) {
        finalizarJogoDamas('branco');
    } else if (pecasBrancas === 0) {
        finalizarJogoDamas('preto');
    } else if (!temMovimentosPossiveis()) {
        finalizarJogoDamas('empate');
    }
}

// 13. Contar Peças
function contarPecas(cor) {
    let count = 0;
    for (let linha = 0; linha < 8; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            const peca = damasTabuleiro[linha][coluna];
            if (peca && peca.cor === cor) {
                count++;
            }
        }
    }
    return count;
}

// 14. Verificar Movimentos Possíveis
function temMovimentosPossiveis() {
    for (let linha = 0; linha < 8; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            const peca = damasTabuleiro[linha][coluna];
            if (peca && peca.cor === jogadorAtualDamas) {
                const movimentos = obterMovimentosPossiveis(linha, coluna);
                const capturas = obterCapturasPossiveis(linha, coluna);
                if (movimentos.length > 0 || capturas.length > 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

// 15. Finalizar Jogo
function finalizarJogoDamas(resultado) {
    jogoAtivoDamas = false;
    
    if (resultado === 'empate') {
        adicionarAoHistoricoDamas('Jogo terminou em empate!');
    } else {
        placarDamas[resultado]++;
        atualizarPlacarDamas();
        adicionarAoHistoricoDamas(`🎉 ${resultado} venceu!`);
    }
    
    incrementGameStats('damas');
}

// 16. Atualizar Placar
function atualizarPlacarDamas() {
    document.getElementById('damas-score-preto').textContent = placarDamas.preto;
    document.getElementById('damas-score-branco').textContent = placarDamas.branco;
}

// 17. Salvar Estado
function salvarEstadoDamas() {
    const estado = {
        tabuleiro: damasTabuleiro.map(linha => [...linha]),
        jogadorAtual: jogadorAtualDamas,
        jogoAtivo: jogoAtivoDamas
    };
    historicoDamas.push(estado);
    
    if (historicoDamas.length > 10) {
        historicoDamas.shift();
    }
}

// 18. Adicionar ao Histórico
function adicionarAoHistoricoDamas(mensagem) {
    const timestamp = new Date().toLocaleTimeString();
    const historico = document.getElementById('damas-historico');
    const item = document.createElement('div');
    item.className = 'historia-item';
    item.textContent = `[${timestamp}] ${mensagem}`;
    historico.insertBefore(item, historico.firstChild);
    
    // Mantém apenas os últimos 10 itens
    while (historico.children.length > 10) {
        historico.removeChild(historico.lastChild);
    }
}

// 19. Reiniciar Jogo de Damas
function reiniciarJogoDamas() {
    inicializarTabuleiroDamas();
    jogadorAtualDamas = 'preto';
    jogoAtivoDamas = true;
    pecaSelecionada = null;
    movimentosPossiveis = [];
    historicoDamas = [];
    
    atualizarStatusDamas();
    renderizarTabuleiroDamas();
    
    const historico = document.getElementById('damas-historico');
    historico.innerHTML = '';
    
    adicionarAoHistoricoDamas('Novo jogo iniciado!');
}

// 20. Zerar Placar de Damas
function zerarPlacarDamas() {
    if (confirm('Tem certeza que deseja zerar o placar?')) {
        placarDamas = { preto: 0, branco: 0 };
        atualizarPlacarDamas();
        adicionarAoHistoricoDamas('Placar zerado!');
    }
}

// 21. IA para Damas
function fazerJogadaIADamas() {
    console.log('=== IA TENTANDO JOGAR ===');
    console.log('Jogo ativo:', jogoAtivoDamas);
    console.log('Jogador atual:', jogadorAtualDamas);
    console.log('Modo jogo:', modoJogoDamas);
    
    if (!jogoAtivoDamas) {
        console.log('IA não pode jogar - jogo inativo');
        return;
    }
    
    if (jogadorAtualDamas !== 'branco') {
        console.log('IA não pode jogar - não é vez do branco');
        return;
    }
    
    console.log('IA está pensando...');
    const melhorJogada = obterMelhorJogadaDamas();
    if (melhorJogada) {
        console.log('IA fez jogada:', melhorJogada);
        // Chama diretamente a função de movimento sem passar pelo clique
        executarMovimentoIA(melhorJogada.linha, melhorJogada.coluna);
    } else {
        console.log('IA não encontrou jogada válida');
    }
}

// Função auxiliar para executar movimento da IA
function executarMovimentoIA(linha, coluna) {
    if (!jogoAtivoDamas) return;
    
    const peca = damasTabuleiro[linha][coluna];
    if (!peca || peca.cor !== 'branco') return;
    
    // Encontra a peça branca mais próxima para mover
    for (let l = 0; l < 8; l++) {
        for (let c = 0; c < 8; c++) {
            const pecaAtual = damasTabuleiro[l][c];
            if (pecaAtual && pecaAtual.cor === 'branco') {
                const movimentos = obterMovimentosPossiveis(l, c);
                if (movimentos.length > 0) {
                    const movimento = movimentos[0];
                    console.log('IA movendo peça de', l, c, 'para', movimento.linha, movimento.coluna);
                    
                    // Move a peça
                    damasTabuleiro[movimento.linha][movimento.coluna] = pecaAtual;
                    damasTabuleiro[l][c] = null;
                    
                    // Verifica se virou dama
                    if ((pecaAtual.cor === 'branco' && movimento.linha === 0)) {
                        pecaAtual.dama = true;
                        console.log('Peça branca virou dama!');
                    }
                    
                    // Atualiza o tabuleiro
                    renderizarTabuleiroDamas();
                    
                    // Troca para o jogador preto
                    jogadorAtualDamas = 'preto';
                    atualizarStatusDamas();
                    
                    adicionarAoHistoricoDamas(`IA moveu peça para (${movimento.linha + 1}, ${movimento.coluna + 1})`);
                    return;
                }
            }
        }
    }
}

function obterMelhorJogadaDamas() {
    const pecasBrancas = [];
    
    // Encontra todas as peças brancas
    for (let linha = 0; linha < 8; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            const peca = damasTabuleiro[linha][coluna];
            if (peca && peca.cor === 'branco') {
                pecasBrancas.push({ linha, coluna, peca });
            }
        }
    }
    
    console.log('Peças brancas encontradas:', pecasBrancas.length);
    
    // Verifica capturas obrigatórias primeiro
    for (const { linha, coluna } of pecasBrancas) {
        const capturas = obterCapturasPossiveis(linha, coluna);
        if (capturas.length > 0) {
            console.log('IA encontrou captura:', capturas[0]);
            return capturas[0];
        }
    }
    
    // Movimentos normais
    for (const { linha, coluna } of pecasBrancas) {
        const movimentos = obterMovimentosPossiveis(linha, coluna);
        if (movimentos.length > 0) {
            console.log('IA encontrou movimento:', movimentos[0]);
            return movimentos[0];
        }
    }
    
    console.log('IA não encontrou jogadas válidas');
    return null;
}

// 22. Alternar Modo de Jogo
function alternarModoJogoDamas() {
    modoJogoDamas = modoJogoDamas === '2jogadores' ? 'ia' : '2jogadores';
    const botaoModo = document.getElementById('damas-modo');
    const botaoDificuldade = document.getElementById('damas-dificuldade');
    
    botaoModo.textContent = `Modo: ${modoJogoDamas === '2jogadores' ? '2 Jogadores' : 'vs IA'}`;
    botaoDificuldade.style.display = modoJogoDamas === 'ia' ? 'block' : 'none';
    
    console.log('Modo alterado para:', modoJogoDamas);
    adicionarAoHistoricoDamas(`Modo alterado para ${modoJogoDamas === '2jogadores' ? '2 jogadores' : 'vs IA'}`);
}

// 23. Alternar Dificuldade da IA
function alternarDificuldadeIADamas() {
    const dificuldades = ['facil', 'medio', 'dificil'];
    const nomes = ['Fácil', 'Médio', 'Difícil'];
    const indexAtual = dificuldades.indexOf(dificuldadeIADamas);
    const proximoIndex = (indexAtual + 1) % dificuldades.length;
    
    dificuldadeIADamas = dificuldades[proximoIndex];
    document.getElementById('damas-dificuldade').textContent = `Dificuldade: ${nomes[proximoIndex]}`;
    adicionarAoHistoricoDamas(`Dificuldade da IA alterada para ${nomes[proximoIndex]}`);
}

// 24. Inicialização Completa
function initDamasGame() {
    console.log('Inicializando jogo de Damas...');
    inicializarTabuleiroDamas();
    atualizarStatusDamas();
    renderizarTabuleiroDamas();
    
    // Remove event listeners existentes para evitar duplicação
    const botaoReiniciar = document.getElementById('damas-reiniciar');
    const botaoZerar = document.getElementById('damas-zerar');
    const botaoModo = document.getElementById('damas-modo');
    const botaoDificuldade = document.getElementById('damas-dificuldade');
    
    if (botaoReiniciar) {
        botaoReiniciar.removeEventListener('click', reiniciarJogoDamas);
        botaoReiniciar.addEventListener('click', reiniciarJogoDamas);
    }
    
    if (botaoZerar) {
        botaoZerar.removeEventListener('click', zerarPlacarDamas);
        botaoZerar.addEventListener('click', zerarPlacarDamas);
    }
    
    if (botaoModo) {
        botaoModo.removeEventListener('click', alternarModoJogoDamas);
        botaoModo.addEventListener('click', alternarModoJogoDamas);
    }
    
    if (botaoDificuldade) {
        botaoDificuldade.removeEventListener('click', alternarDificuldadeIADamas);
        botaoDificuldade.addEventListener('click', alternarDificuldadeIADamas);
    }
    
    // Adiciona botão de teste da IA (temporário para debug)
    const testButton = document.createElement('button');
    testButton.textContent = '🧠 Testar IA';
    testButton.className = 'btn-secondary';
    testButton.style.marginLeft = '10px';
    testButton.addEventListener('click', () => {
        if (modoJogoDamas === 'ia' && jogadorAtualDamas === 'branco') {
            fazerJogadaIADamas();
        } else {
            alert('Mude para modo IA e aguarde a vez do branco');
        }
    });
    
    const controlsDiv = document.querySelector('.damas-controls');
    if (controlsDiv && !document.querySelector('.test-ia-btn')) {
        testButton.classList.add('test-ia-btn');
        controlsDiv.appendChild(testButton);
    }
    
    adicionarAoHistoricoDamas('Jogo de Damas iniciado!');
    console.log('Jogo de Damas inicializado com sucesso');
}
