// ===== CORREÇÃO DA IA DE DAMAS =====

// Função simplificada da IA
function fazerJogadaIADamas() {
    console.log('=== IA TENTANDO JOGAR ===');
    console.log('Jogo ativo:', jogoAtivoDamas);
    console.log('Jogador atual:', jogadorAtualDamas);
    console.log('Modo jogo:', modoJogoDamas);
    
    if (!jogoAtivoDamas || jogadorAtualDamas !== 'branco') {
        console.log('IA não pode jogar');
        return;
    }
    
    // Procura por qualquer peça branca que possa se mover
    for (let linha = 0; linha < 8; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            const peca = damasTabuleiro[linha][coluna];
            if (peca && peca.cor === 'branco') {
                const movimentos = obterMovimentosPossiveis(linha, coluna);
                if (movimentos.length > 0) {
                    const movimento = movimentos[0];
                    console.log('IA encontrou movimento:', movimento);
                    
                    // Executa o movimento
                    damasTabuleiro[movimento.linha][movimento.coluna] = peca;
                    damasTabuleiro[linha][coluna] = null;
                    
                    // Verifica se virou dama
                    if (movimento.linha === 0) {
                        peca.dama = true;
                        console.log('Peça virou dama!');
                    }
                    
                    // Atualiza interface
                    renderizarTabuleiroDamas();
                    jogadorAtualDamas = 'preto';
                    atualizarStatusDamas();
                    
                    adicionarAoHistoricoDamas(`IA moveu peça para (${movimento.linha + 1}, ${movimento.coluna + 1})`);
                    return;
                }
            }
        }
    }
    
    console.log('IA não encontrou movimentos válidos');
}

// Função para forçar a IA a jogar (para teste)
function forcarIAJogar() {
    console.log('Forçando IA a jogar...');
    if (modoJogoDamas === 'ia') {
        jogadorAtualDamas = 'branco';
        fazerJogadaIADamas();
    } else {
        alert('Mude para modo IA primeiro');
    }
}

// Adiciona botão de teste global
window.forcarIAJogar = forcarIAJogar;
