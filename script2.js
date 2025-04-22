// Configuração inicial e constantes globais

// URL's da nossa API (Backend)

const ENDPOINT_CHARADAS = 'https://charadas-ashen.vercel.app/charadas';
const ENDPOINT_LISTA_TODAS = "https://charadas-ashen.vercel.app/charadas/lista"

// Ligando com os elementos HTML

// Ligando os formulários

// Formulário de criação
let formularioCriacao = document.getElementById('create-form');
let inputPerguntaCriacao = document.getElementById('create-name');
let inputRespostaCriacao = document.getElementById('create-description');

// Formulário de Atualização (edição)
let formularioAtualizacao = document.getElementById('update-form');
let inputAtualizacaoId = document.getElementById('update-id');
let inputPerguntaAtualizacao = document.getElementById('update-name');
let inputRespostaAtualizacao = document.getElementById('update-description');
let botaoCancelarAtualizacao = document.getElementById('cancel-update');

// Lista (elementos <div>) onde as charadas serão exibidas
let listaCharadasElemento = document.getElementById('item-list');

// ===========================================================
// FUNÇÕES PARA INTERAGIR COM API 
// ===========================================================

// READ (Listar as charadas no elemento lista)

async function buscarListarCharadas() {
    console.log("Buscando charadas na API....");
    listaCharadasElemento.innerHTML = '<p>Carregando charadas...</p>';

    try {
        const respostaHttp = await fetch(ENDPOINT_LISTA_TODAS);

        if(!respostaHttp){
            throw new Error(`Erro na API: ${respostaHttp.status} ${respostaHttp.statusText}`);
        }

        const charadas = await respostaHttp.json();

        console.log("Charadas recebidas: ",charadas)
        
        exibirCharadasNaTela(charadas);

    } catch (erro) {
        console.error(`Falha ao buscar charadas: ${erro}`);
        listaCharadasElemento.innerHTML = `
        <p style="color: red;">Erro ao carregar charadas: ${erro.message}</p>`
    }
}

// --- CREATE (Criar uma nova charada) ---
async function criarCharada(evento) {
    evento.preventDefault(); // Previne o comportamento padrão do formulário (que é recarregar a página)
    console.log("Tentando criar nova charada...");

    const pergunta = inputPerguntaCriacao.value;
    const respostaCharada = inputRespostaCriacao.value;

    if (!pergunta || !respostaCharada) {
        alert("Por favor, preencha a pergunta e a resposta.");
        return;
    }

    const novaCharada = {
        pergunta: pergunta,
        resposta: respostaCharada
    };

    try {
        const respostaHttp = await fetch(ENDPOINT_CHARADAS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(novaCharada)
        });

        const resultadoApi = await respostaHttp.json();

        if (!respostaHttp.ok) {
            throw new Error(resultadoApi.mensagem || `Erro ao criar charada: ${respostaHttp.status}`);
        }

        console.log("Charada criada com sucesso!", resultadoApi);
        alert(resultadoApi.mensagem);

        inputPerguntaCriacao.value = '';
        inputRespostaCriacao.value = '';

        await buscarListarCharadas();

    } catch (erro) {
        console.error("Falha ao criar charada:", erro);
        alert(`Erro ao criar charada: ${erro.message}`);
    }
}

// --- UPDATE (Atualizar uma charada existente) ---
async function atualizarCharada(evento) {
    evento.preventDefault();
    console.log("Tentando atualizar charada...");

    const id = inputAtualizacaoId.value;
    const pergunta = inputPerguntaAtualizacao.value;
    const respostaCharada = inputRespostaAtualizacao.value;

    const dadosCharadaAtualizada = {
        pergunta: pergunta,
        resposta: respostaCharada
    };

    if (!id) {
        console.error("ID da charada para atualização não encontrado!");
        alert("Erro interno: ID da charada não encontrado para atualizar.");
        return;
    }

    if (!pergunta || !respostaCharada) {
        alert("Por favor, preencha a pergunta e a resposta para atualizar.");
        return;
    }

    try {
        const respostaHttp = await fetch(`${ENDPOINT_CHARADAS}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosCharadaAtualizada)
        });

        const resultadoApi = await respostaHttp.json();

        if (!respostaHttp.ok) {
            throw new Error(resultadoApi.mensagem || `Erro ao atualizar charada: ${respostaHttp.status}`);
        }

        console.log("Charada atualizada com sucesso! ID:", id);
        alert(resultadoApi.mensagem);

        esconderFormularioAtualizacao();
        await buscarListarCharadas();

    } catch (erro) {
        console.error("Falha ao atualizar charada:", erro);
        alert(`Erro ao atualizar charada: ${erro.message}`);
    }
}

// --- DELETE (Excluir uma charada) ---
async function excluirCharada(id) {
    console.log(`Tentando excluir charada com ID: ${id}`);

    if (!confirm(`Tem certeza que deseja excluir a charada com ID ${id}? Esta ação não pode ser desfeita.`)) {
        console.log("Exclusão cancelada pelo usuário.");
        return;
    }

    try {
        const respostaHttp = await fetch(`${ENDPOINT_CHARADAS}/${id}`, {
            method: 'DELETE'
        });

        const resultadoApi = await respostaHttp.json();

        if (!respostaHttp.ok) {
            throw new Error(resultadoApi.mensagem || `Erro ao excluir charada: ${respostaHttp.status}`);
        }

        console.log("Charada excluída com sucesso!", id);
        alert(resultadoApi.mensagem);

        await buscarListarCharadas();

    } catch (erro) {
        console.error("Falha ao excluir charada:", erro);
        alert(`Erro ao excluir charada: ${erro.message}`);
    }
}

// ============================================================
// FUNÇÕES PARA MANIPULAR O HTML (Atualizar a Página)
// ============================================================

// --- Mostrar as charadas na lista ---
function exibirCharadasNaTela(charadas) {
    console.log("Atualizando a lista de charadas na tela...");
    listaCharadasElemento.innerHTML = '';

    if (!charadas || charadas.length === 0) {
        listaCharadasElemento.innerHTML = '<p>Nenhuma charada cadastrada ainda.</p>';
        return;
    }

    for (const charada of charadas) {
        const elementoCharadaDiv = document.createElement('div');
        elementoCharadaDiv.classList.add('border', 'border-gray-300', 'p-2', 'mb-3', 'rounded', 'flex', 'justify-between', 'items-center');
        elementoCharadaDiv.id = `charada-${charada.id}`;
    
        elementoCharadaDiv.innerHTML = `
            <div class="flex-grow mr-3">
                <strong>${charada.pergunta}</strong>
                <p><small>Resposta: ${charada.resposta || 'Não definida'}</small></p>
                <p><small>ID: ${charada.id}</small></p>
            </div>
            <div>
                <button class="edit-btn bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-1 px-2 rounded text-sm ml-1">Editar</button>
                <button class="delete-btn bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm ml-1">Excluir</button>
            </div>
        `;
    
        const botaoEditar = elementoCharadaDiv.querySelector('.edit-btn');
        botaoEditar.addEventListener('click', function() {
            console.log(`Botão Editar clicado para a charada ID: ${charada.id}`);
            exibirFormularioAtualizacao(charada.id, charada.pergunta, charada.resposta);
        });
    
        const botaoExcluir = elementoCharadaDiv.querySelector('.delete-btn');
        botaoExcluir.addEventListener('click', function() {
            console.log(`Botão Excluir clicado para a charada ID: ${charada.id}`);
            excluirCharada(charada.id);
        });
    
        listaCharadasElemento.appendChild(elementoCharadaDiv);
    }
}

// --- Mostrar o formulário de atualização (edição) ---
function exibirFormularioAtualizacao(id, pergunta, resposta) {
    console.log("Mostrando formulário de atualização para a charada ID:", id);
    inputAtualizacaoId.value = id;
    inputPerguntaAtualizacao.value = pergunta;
    inputRespostaAtualizacao.value = resposta;

    formularioAtualizacao.classList.remove('hidden');
    formularioCriacao.classList.add('hidden');

    formularioAtualizacao.scrollIntoView({ behavior: 'smooth' });
}

// --- Esconder o formulário de atualização ---
function esconderFormularioAtualizacao() {
    console.log("Escondendo formulário de atualização.");
    formularioAtualizacao.classList.add('hidden');
    formularioCriacao.classList.remove('hidden');

    inputAtualizacaoId.value = '';
    inputPerguntaAtualizacao.value = '';
    inputRespostaAtualizacao.value = '';
}


// ==============================================================
// EVENT LISTENERS GLOBAIS (Campainhas principais da página)
// ==============================================================

formularioCriacao.addEventListener('submit',criarCharada);
formularioAtualizacao.addEventListener('submit', atualizarCharada);
botaoCancelarAtualizacao.addEventListener('click', esconderFormularioAtualizacao);

// INICIALIZAÇÃO DA PÁGINA

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM completamente carregado. Iniciando busca de charadas...");
    buscarListarCharadas();
});