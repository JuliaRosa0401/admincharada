// Configuração inicial e constantes globais
const ENDPOINT_CHARADAS = 'https://charadas-ashen.vercel.app/charadas';
const ENDPOINT_LISTA_TODAS = "https://charadas-ashen.vercel.app/charadas/lista";

// Paginação
const porPagina = 5;
let paginaAtual = 1;
let charadas = [];

// Ligando com os elementos HTML
let formularioCriacao = document.getElementById('create-form');
let inputPerguntaCriacao = document.getElementById('create-name');
let inputRespostaCriacao = document.getElementById('create-description');

let formularioAtualizacao = document.getElementById('update-form');
let inputAtualizacaoId = document.getElementById('update-id');
let inputPerguntaAtualizacao = document.getElementById('update-name');
let inputRespostaAtualizacao = document.getElementById('update-description');
let botaoCancelarAtualizacao = document.getElementById('cancel-update');

let listaCharadasElemento = document.getElementById('lista-charadas');

// ===========================================================
// FUNÇÕES PARA INTERAGIR COM API 
// ===========================================================

async function buscarListarCharadas() {
    console.log("Buscando charadas na API....");
    listaCharadasElemento.innerHTML = '<p>Carregando charadas...</p>';

    try {
        const respostaHttp = await fetch(ENDPOINT_LISTA_TODAS);

        if (!respostaHttp.ok) {
            throw new Error(`Erro na API: ${respostaHttp.status} ${respostaHttp.statusText}`);
        }

        const charadas = await respostaHttp.json();

        console.log("Charadas recebidas: ",charadas)

        exibirCharadasNaTela(charadas);

    } catch (erro) {
        console.error(`Falha ao buscar charadas: ${erro}`);
        listaCharadasElemento.innerHTML = `<p style="color: red;">Erro ao carregar charadas: ${erro.message}</p>`;
    }
}
//criar

async function criarCharada(evento) {
    evento.preventDefault();
    console.log("Tentando criar nova charada...");

    const pergunta = inputPerguntaCriacao.value.trim();
    const respostaCharada = inputRespostaCriacao.value.trim();

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
                'Content-Type': 'application/json' 
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
        console.error("Falha ao criar charada:", erro)
        alert(`Erro ao criar charada: ${erro.message}`);
    }
}

//atualizar
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
            headers: { 'Content-Type': 'application/json'
                
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

//delete

async function excluirCharada(id) {
    console.log(`Tentando excluir charada com ID: ${id}`);

    if (!confirm(`Tem certeza que deseja excluir a charada com ID ${id}? Esta ação não pode ser desfeita.`)) {
        console.log("Exclusão cancelada pelo usuário.");
        return;
    }

    try {
        const respostaHttp = await fetch(`${ENDPOINT_CHARADAS}/${id}`, { method: 'DELETE' });

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
            <div class:"items-center-safe" >
                
                <button class="edit-btn bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 sm:items-center px-2 rounded text-sm ml-5 ">Editar 🖊</button>
                <button class="delete-btn bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-2 mt-5 rounded sm:items-center text-sm ml-5"> Excluir 🗑</button>
                
            </div>
        `;

        const botaoEditar = elementoCharadaDiv.querySelector('.edit-btn');
        botaoEditar.addEventListener('click', function() {
            exibirFormularioAtualizacao(charada.id, charada.pergunta, charada.resposta);
        });

        const botaoExcluir = elementoCharadaDiv.querySelector('.delete-btn');
        botaoExcluir.addEventListener('click', function() {
            excluirCharada(charada.id);
        });

        listaCharadasElemento.appendChild(elementoCharadaDiv);
    }
}

function exibirFormularioAtualizacao(id, pergunta, resposta) {
    inputAtualizacaoId.value = id;
    inputPerguntaAtualizacao.value = pergunta;
    inputRespostaAtualizacao.value = resposta;

    formularioAtualizacao.classList.remove('hidden');
    formularioCriacao.classList.add('hidden');

    formularioAtualizacao.scrollIntoView({ behavior: 'smooth' });
}

function esconderFormularioAtualizacao() {
    console.log("Escondendo formulário de atualização.");

    formularioAtualizacao.classList.add('hidden');
    formularioCriacao.classList.remove('hidden');

    inputAtualizacaoId.value = '';
    inputPerguntaAtualizacao.value = '';
    inputRespostaAtualizacao.value = '';
}

// ============================================================
// EVENT LISTENERS GLOBAIS (Campainhas principais da página)
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM completamente carregado. Iniciando busca de charadas...");
    buscarListarCharadas();

    // Adicionando eventos após o DOM estar carregado
    const botaoCriar = document.getElementById('criar-charada-button');
    if (botaoCriar) {
        botaoCriar.addEventListener('click', criarCharada);
    }
    const formularioAtualizacao = document.getElementById('update-form');
    if (formularioAtualizacao) {
        formularioAtualizacao.addEventListener('submit', atualizarCharada);
    }
    const botaoCancelarAtualizacao = document.getElementById('cancel-update');
    if (botaoCancelarAtualizacao) {
        botaoCancelarAtualizacao.addEventListener('click', esconderFormularioAtualizacao);
    }
});

function atualizarTemaVisual() {
      const emoji = document.getElementById('emoji-tema');
      const texto = document.getElementById('texto-tema');
      const escuro = document.documentElement.classList.contains('dark');
      emoji.textContent = escuro ? '🌞' : '🌙';
      texto.textContent = escuro ? 'Claro' : 'Escuro';
    }

    function alternarModo() {
      document.documentElement.classList.toggle('dark');
      const tema = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      localStorage.setItem('temaPreferido', tema);
      atualizarTemaVisual();
    }
