const prompt = require('prompt-sync')();
const db = require('./database1');

// -------------------------------------------
// FUNÇÕES AUXILIARES
// -------------------------------------------

function pausar() {
    // pausa a execucao e limpa a tela
    console.log("\n-------------------------------------------");
        prompt("Pressione ENTER para continuar...");
        console.clear();
}

function listarCompanhias() {
    // busca todas as companhias no banco e exibe no terminal
    // retorna o array de companhias
    const comp = db.prepare("SELECT * FROM Companhia").all()
    if (comp == undefined){
        console.log("Companhia não encontrada!")
    }
    else{
        for(let i = 0; i < comp.length; i++){
            console.log(comp[i].id,comp[i].nome,comp[i].anoFundacao)
        }
    }    
}

function validarOuCadastrarCompanhia(idInformado) {
    // busca a companhia pelo id informado
    // se nao existir, pergunta se o usuario quer cadastrar uma nova
    // se sim, pede nome e ano de fundacao e insere no banco
    // retorna o id valido ou null se o usuario optar por nao cadastrar
    const ecompanhia = db.prepare('SELECT * FROM Companhia WHERE id = ?').get(idInformado);

    if (!ecompanhia) {
        console.log('Companhia não encontrada.');
        console.log("Deseja cadastrar uma nova companhia?/n 0-não /n 1-sim")
        let resposta = parseInt(prompt())
        if (resposta == 0){
            console.log("Redirecionando!")
            return null;
        }
        else{
            let nome_companhias = prompt("Insira o nome da Companhia: ")
            let anoFundacao_companhias = prompt("Insira o ano de fundaçao da Companhia: ")
            const resultado = db.prepare(`
                INSERT INTO Companhia (nome,anoFundacao) VALUES (?,?)
            `).run(nome_companhias,anoFundacao_companhias)
            console.log("Sua companhia foi cadrastrada com sucesso!")
            return resultado.lastInsertRowid;
        }
    }
    return idInformado;
    
}

// -------------------------------------------
// FUNÇÕES DE TRECHOS
// -------------------------------------------

function cadastrarTrecho() {
    // lista as companhias, pede o id da companhia
    // valida ou cadastra a companhia
    // pede origem, destino, valor e numero de passagens
    // insere o trecho no banco
    
    listarCompanhias()
    let idCompanhia = parseInt(prompt("Qual das companhias será cadastrado o Trecho?/n digite o id: "))
    const idValido = validarOuCadastrarCompanhia(idCompanhia)

    if (idValido === null) {
        return ;
    }

    let origem_trecho = prompt("Insira a origem do seu Trecho:")
    let destino_trecho = prompt("Insira o destino do seu Trecho:")
    let valor_trecho = parseFloat(prompt("Insira o valor do seu Trecho:"))
    let numero_passagens = parseInt(prompt("Insira o numero de passagens disponiveis no seu Trecho:"))
    const resultado = db.prepare(`
        INSERT INTO Trecho (origem, destino, valor, numeroPassagens,idCompanhia) VALUES (?,?,?,?,?)
    `).run(origem_trecho, destino_trecho, valor_trecho, numero_passagens,idCompanhia)
    console.log("Seu Trecho foi cadrastrado com sucesso!")
    }


function listarTrechos() {
    // busca todos os trechos com JOIN na tabela Companhia
    // exibe os dados de cada trecho no terminal
    const trechos = db.prepare(`
        SELECT Trecho.*, Companhia.nome AS nomeCompanhia
        FROM Trecho
        JOIN Companhia ON Trecho.idCompanhia = Companhia.id
    `).all();

    if (trechos.length === 0) {
        console.log('\nNenhum trecho cadastrado.');
        return;
    }

    console.log('\n======= TRECHOS =======');
    for (let i = 0; i < trechos.length; i++) {
        const trecho = trechos[i];
        console.log(`\n[${trecho.id}] ${trecho.origem} -> ${trecho.destino}`);
        console.log(`   Companhia: ${trecho.nomeCompanhia}`);
        console.log(`   Valor: R$ ${trecho.valor.toFixed(2)}`);
        console.log(`   Passagens disponiveis: ${trecho.numeroPassagens}`);
        console.log('-------------------------------------------');
    }
}
function editarTrecho() {
    // lista os trechos, pede o id do trecho a editar
    // verifica se o trecho existe
    // pede os novos dados e atualiza no banco
    listarTrechos();
    const idTrecho = parseInt(prompt('\nID do trecho para editar: '));
    const trecho = db.prepare('SELECT * FROM Trecho WHERE id = ?').get(idTrecho);

    if (!trecho) {
        console.log('\nErro: Trecho nao encontrado.');
        return;
    }

    const novaOrigem = prompt('Nova origem: ');
    const novoDestino = prompt('Novo destino: ');
    const novoValor = parseFloat(prompt('Novo valor: R$ '));
    const novoNumeroPassagens = parseInt(prompt('Novo numero de passagens: '));

    db.prepare('UPDATE Trecho SET origem = ?, destino = ?, valor = ?, numeroPassagens = ? WHERE id = ?')
        .run(novaOrigem, novoDestino, novoValor, novoNumeroPassagens, idTrecho);

    console.log('\nTrecho atualizado com sucesso!');
}

function excluirTrecho() {
    // lista os trechos, pede o id do trecho a excluir
    // verifica se o trecho existe
    // remove do banco
    listarTrechos();
    const idTrecho = parseInt(prompt('\nID do trecho para excluir: '));
    const trecho = db.prepare('SELECT * FROM Trecho WHERE id = ?').get(idTrecho);

    if (!trecho) {
        console.log('\nErro: Trecho nao encontrado.');
        return;
    }

    db.prepare('DELETE FROM Trecho WHERE id = ?').run(idTrecho);
    console.log('\nTrecho removido com sucesso!');
}

// -------------------------------------------
// FUNÇÕES DE CUPONS
// -------------------------------------------

function cadastrarCupom() {
    // lista as companhias, pede o id da companhia
    // valida ou cadastra a companhia
    // pede codigo, percentual de desconto e numero de cupons
    // insere o cupom no banco
    listarCompanhias()
    const idCompanhia = parseInt(prompt('ID da companhia responsavel pelo cupom: '));
    const idValido = validarOuCadastrarCompanhia(idCompanhia);

    if (idValido == null) {
        return;
    }

    const codigo = prompt('Codigo do cupom (ex.: VIAGEM10): ').toUpperCase();
    const percentualDesconto = parseFloat(prompt('Percentual de desconto (ex.: 10 para 10%): '));
    const numeroCupons = parseInt(prompt('Numero de cupons disponiveis: '));

    db.prepare('INSERT INTO Cupom (idCompanhia, codigo, percentualDesconto, numeroCupons) VALUES (?, ?, ?, ?)')
        .run(idValido, codigo, percentualDesconto, numeroCupons);

    console.log('\nCupom cadastrado com sucesso!');

}

function listarCupons() {
    // busca todos os cupons com JOIN na tabela Companhia
    // exibe os dados de cada cupom no terminal
    const cupons = db.prepare(`
        SELECT Cupom.*, Companhia.nome AS nomeCompanhia
        FROM Cupom
        JOIN Companhia ON Cupom.idCompanhia = Companhia.id
    `).all();

    if (cupons.length === 0) {
        console.log('\nNenhum cupom cadastrado.');
        return;
    }

    console.log('\n======= CUPONS =======');
    for (let i = 0; i < cupons.length; i++) {
        const cupom = cupons[i];
        console.log(`\n[${cupom.id}] Codigo: ${cupom.codigo}`);
        console.log(`   Companhia: ${cupom.nomeCompanhia}`);
        console.log(`   Desconto: ${cupom.percentualDesconto}%`);
        console.log(`   Cupons disponiveis: ${cupom.numeroCupons}`);
        console.log('-------------------------------------------');
    }
}

function editarCupom() {
    // lista os cupons, pede o codigo do cupom a editar
    // verifica se o cupom existe
    // pede os novos dados e atualiza no banco
    listarCupons();
    const codigoCupom = prompt('\nCodigo do cupom para editar: ').toUpperCase();
    const cupom = db.prepare('SELECT * FROM Cupom WHERE codigo = ?').get(codigoCupom);

    if (!cupom) {
        console.log('\nErro: Cupom nao encontrado.');
        return;
    }

    const novoCodigo = prompt('Novo codigo: ').toUpperCase();
    const novoPercentual = parseFloat(prompt('Novo percentual de desconto: '));
    const novoNumeroCupons = parseInt(prompt('Novo numero de cupons disponiveis: '));

    db.prepare('UPDATE Cupom SET codigo = ?, percentualDesconto = ?, numeroCupons = ? WHERE id = ?')
        .run(novoCodigo, novoPercentual, novoNumeroCupons, cupom.id);

    console.log('\nCupom atualizado com sucesso!');
}

function excluirCupom() {
    // lista os cupons, pede o codigo do cupom a excluir
    // verifica se o cupom existe
    // remove do banco
    listarCupons();
    const codigoCupom = prompt('\nCodigo do cupom para excluir: ').toUpperCase();
    const cupom = db.prepare('SELECT * FROM Cupom WHERE codigo = ?').get(codigoCupom);

    if (!cupom) {
        console.log('\nErro: Cupom nao encontrado.');
        return;
    }

    db.prepare('DELETE FROM Cupom WHERE id = ?').run(cupom.id);
    console.log('\nCupom removido com sucesso!');
    
}

// -------------------------------------------
// MENU PRINCIPAL
// -------------------------------------------

listarCompanhias()

let opcao = -1;

console.clear();
console.log('\n===========================================');
console.log('   SISTEMA DE PASSAGENS - COMPANHIA        ');
console.log('===========================================');

while (opcao !== 0) {
    console.log('\n---- MENU ----');
    console.log('1 - Gerenciar Trechos');
    console.log('2 - Gerenciar Cupons');
    console.log('0 - Sair');
    console.log('-------------------------\n');

    opcao = parseInt(prompt('Escolha uma opcao: '));

    switch (opcao) {

        case 1:
            console.log('\n---- TRECHOS ----');
            console.log('1 - Cadastrar');
            console.log('2 - Listar');
            console.log('3 - Editar');
            console.log('4 - Excluir');
            const opcaoTrecho = parseInt(prompt('Escolha: '));

            switch (opcaoTrecho) {
                case 1: cadastrarTrecho(); break;
                case 2: listarTrechos(); break;
                case 3: editarTrecho(); break;
                case 4: excluirTrecho(); break;
                default: console.log('\nOpcao invalida.'); break;
            }
            pausar();
            break;

        case 2:
            console.log('\n---- CUPONS ----');
            console.log('1 - Cadastrar');
            console.log('2 - Listar');
            console.log('3 - Editar');
            console.log('4 - Excluir');
            const opcaoCupom = parseInt(prompt('Escolha: '));

            switch (opcaoCupom) {
                case 1: cadastrarCupom(); break;
                case 2: listarCupons(); break;
                case 3: editarCupom(); break;
                case 4: excluirCupom(); break;
                default: console.log('\nOpcao invalida.'); break;
            }
            pausar();
            break;

        case 0:
            console.log('\nFinalizando o sistema... Ate logo!\n');
            break;

        default:
            console.log('\nOpcao invalida! Tente novamente.');
            pausar();
            break;
    }
}