const API = 'http://localhost:3000/api';
let emailEnviado = 0;

// ================= INICIALIZAÇÃO =================
document.addEventListener('DOMContentLoaded', () => {
  // Definir data atual
  document.getElementById('data').valueAsDate = new Date();
  
  // Carregar dados iniciais
  carregarPdvs();
  carregarRegistros();
  
  // Preview de imagens
  document.getElementById('imagens').addEventListener('change', previewImagens);
});

// ================= TOGGLE EMAIL =================
function toggleEmail() {
  const btn = document.getElementById('btnEmail');
  emailEnviado = emailEnviado ? 0 : 1;
  
  if (emailEnviado) {
    btn.className = 'btn-toggle btn-verde';
    btn.innerHTML = '✅ Email Enviado';
  } else {
    btn.className = 'btn-toggle btn-vermelho';
    btn.innerHTML = '❌ Email NÃO Enviado';
  }
}

// ================= PDVS =================
async function carregarPdvs() {
  try {
    const res = await fetch(`${API}/pdvs`);
    const dados = await res.json();

    const lista = document.getElementById('listaPdvs');
    const reg = document.getElementById('listaPdvsRegistro');
    const filtro = document.getElementById('filtroPdv');

    lista.innerHTML = '';
    reg.innerHTML = '';
    filtro.innerHTML = '<option value="">Todos os PDVs</option>';

    if (dados.length === 0) {
      lista.innerHTML = '<li class="vazio">Nenhum PDV cadastrado</li>';
      reg.innerHTML = '<p class="aviso">⚠️ Cadastre PDVs antes de criar registros</p>';
      return;
    }

    dados.forEach(pdv => {
      // Lista de PDVs cadastrados
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${pdv.nome}</span>
        <button onclick="deletarPDV(${pdv.id})" class="btn-delete" title="Deletar PDV">
          🗑️
        </button>
      `;
      lista.appendChild(li);

      // Checkboxes no formulário
      const label = document.createElement('label');
      label.className = 'checkbox-label';
      label.innerHTML = `
        <input type="checkbox" value="${pdv.id}" class="pdv-checkbox">
        <span>${pdv.nome}</span>
      `;
      reg.appendChild(label);

      // Filtro
      const option = document.createElement('option');
      option.value = pdv.id;
      option.textContent = pdv.nome;
      filtro.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar PDVs:', error);
    mostrarNotificacao('Erro ao carregar PDVs', 'erro');
  }
}

async function adicionarPDV() {
  const input = document.getElementById('pdvNome');
  const nome = input.value.trim();

  if (!nome) {
    mostrarNotificacao('Informe o nome do PDV', 'aviso');
    input.focus();
    return;
  }

  try {
    const res = await fetch(`${API}/pdvs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome })
    });

    const json = await res.json();

    if (json.sucesso) {
      input.value = '';
      carregarPdvs();
      mostrarNotificacao('PDV adicionado com sucesso!', 'sucesso');
    } else {
      mostrarNotificacao(json.erro || 'Erro ao adicionar PDV', 'erro');
    }
  } catch (error) {
    console.error('Erro:', error);
    mostrarNotificacao('Erro ao adicionar PDV', 'erro');
  }
}

async function deletarPDV(id) {
  if (!confirm('Tem certeza que deseja deletar este PDV?')) {
    return;
  }

  try {
    const res = await fetch(`${API}/pdvs/${id}`, {
      method: 'DELETE'
    });

    const json = await res.json();

    if (json.sucesso) {
      carregarPdvs();
      mostrarNotificacao('PDV deletado com sucesso!', 'sucesso');
    }
  } catch (error) {
    console.error('Erro:', error);
    mostrarNotificacao('Erro ao deletar PDV', 'erro');
  }
}

function marcarTodos() {
  document.querySelectorAll('#listaPdvsRegistro input').forEach(c => c.checked = true);
}

function desmarcarTodos() {
  document.querySelectorAll('#listaPdvsRegistro input').forEach(c => c.checked = false);
}

// ================= PREVIEW DE IMAGENS =================
function previewImagens(e) {
  const preview = document.getElementById('preview-imagens');
  preview.innerHTML = '';
  
  const files = Array.from(e.target.files);
  
  if (files.length === 0) return;
  
  files.forEach((file, index) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${event.target.result}" alt="Preview ${index + 1}">
        <button type="button" onclick="removerImagem(${index})" class="btn-remove-img">×</button>
      `;
      preview.appendChild(div);
    };
    
    reader.readAsDataURL(file);
  });
}

function removerImagem(index) {
  const input = document.getElementById('imagens');
  const dt = new DataTransfer();
  const files = Array.from(input.files);
  
  files.forEach((file, i) => {
    if (i !== index) dt.items.add(file);
  });
  
  input.files = dt.files;
  previewImagens({ target: input });
}

// ================= REGISTROS =================
async function salvarRegistro(e) {
  e.preventDefault();
  
  const tipo = document.getElementById('tipo').value;
  const data = document.getElementById('data').value;
  const inicio = document.getElementById('inicio').value;
  const fim = document.getElementById('fim').value;
  const relatorio = document.getElementById('relatorio').value;
  const descricao = document.getElementById('descricaoOcorrencia').value;
  const imagens = document.getElementById('imagens').files;

  // Coletar PDVs selecionados
  const pdvs = [...document.querySelectorAll('#listaPdvsRegistro input:checked')]
    .map(i => i.value);

  if (pdvs.length === 0) {
    mostrarNotificacao('Selecione ao menos um PDV', 'aviso');
    return;
  }

  const tem_ocorrencia = descricao.trim() ? 1 : 0;

  // Criar FormData para enviar com imagens
  const formData = new FormData();
  formData.append('tipo', tipo);
  formData.append('data', data);
  formData.append('horario_inicio', inicio);
  formData.append('horario_fim', fim);
  formData.append('relatorio', relatorio);
  formData.append('tem_ocorrencia', tem_ocorrencia);
  formData.append('descricao_ocorrencia', descricao);
  formData.append('email_enviado', emailEnviado);
  formData.append('pdvs', JSON.stringify(pdvs));

  // Adicionar imagens
  for (let i = 0; i < imagens.length; i++) {
    formData.append('imagens', imagens[i]);
  }

  try {
    mostrarLoading(true);
    
    const res = await fetch(`${API}/registros`, {
      method: 'POST',
      body: formData
    });

    const json = await res.json();

    if (json.sucesso) {
      mostrarNotificacao('Registro salvo com sucesso!', 'sucesso');
      
      // Limpar formulário
      document.getElementById('formRegistro').reset();
      document.getElementById('preview-imagens').innerHTML = '';
      emailEnviado = 0;
      document.getElementById('btnEmail').className = 'btn-toggle btn-vermelho';
      document.getElementById('btnEmail').innerHTML = '❌ Email NÃO Enviado';
      document.getElementById('data').valueAsDate = new Date();
      desmarcarTodos();
      
      // Recarregar registros
      carregarRegistros();
    } else {
      mostrarNotificacao(json.erro || 'Erro ao salvar registro', 'erro');
    }
  } catch (error) {
    console.error('Erro:', error);
    mostrarNotificacao('Erro ao salvar registro', 'erro');
  } finally {
    mostrarLoading(false);
  }
}

async function carregarRegistros(filtros = {}) {
  try {
    mostrarLoading(true);
    
    let url = `${API}/registros`;
    const params = new URLSearchParams();
    
    if (filtros.data) params.append('data', filtros.data);
    if (filtros.pdv_id) params.append('pdv_id', filtros.pdv_id);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    const res = await fetch(url);
    const dados = await res.json();

    const lista = document.getElementById('listaRegistros');
    const mensagemVazia = document.getElementById('mensagemVazia');
    const totalRegistros = document.getElementById('totalRegistros');

    lista.innerHTML = '';

    if (dados.length === 0) {
      mensagemVazia.style.display = 'block';
      totalRegistros.textContent = '';
      return;
    }

    mensagemVazia.style.display = 'none';
    totalRegistros.textContent = `${dados.length} registro${dados.length > 1 ? 's' : ''}`;

    for (const r of dados) {
      const card = document.createElement('div');
      card.className = 'registro-card';
      
      const tipoIcon = r.tipo === 'abertura' ? '🔓' : '🔒';
      const emailIcon = r.email_enviado ? '✅' : '❌';
      const ocorrenciaClass = r.tem_ocorrencia ? 'tem-ocorrencia' : '';
      
      // Buscar imagens do registro
      let imagensHTML = '';
      try {
        const resImg = await fetch(`${API}/registros/${r.id}/imagens`);
        const imagens = await resImg.json();
        
        if (imagens.length > 0) {
          imagensHTML = `
            <div class="registro-imagens">
              <strong>📷 Imagens (${imagens.length}):</strong>
              <div class="imagens-grid">
                ${imagens.map(img => `
                  <img src="http://localhost:3000/uploads/${img.caminho_imagem}" 
                       alt="Imagem" 
                       onclick="abrirModal(${r.id})"
                       class="thumbnail">
                `).join('')}
              </div>
            </div>
          `;
        }
      } catch (error) {
        console.error('Erro ao carregar imagens:', error);
      }

      card.innerHTML = `
        <div class="registro-header ${ocorrenciaClass}">
          <div>
            <span class="tipo-badge ${r.tipo}">${tipoIcon} ${r.tipo.toUpperCase()}</span>
            <span class="data">${formatarData(r.data)}</span>
          </div>
          <button onclick="deletarRegistro(${r.id})" class="btn-delete" title="Deletar registro">
            🗑️
          </button>
        </div>
        
        <div class="registro-body">
          <div class="info-row">
            <strong>⏰ Horário:</strong> 
            ${formatarHorario(r.horario_inicio)} ${r.horario_fim ? '→ ' + formatarHorario(r.horario_fim) : ''}
          </div>
          
          <div class="info-row">
            <strong>📍 PDVs:</strong> ${r.pdvs || 'N/A'}
          </div>
          
          ${r.relatorio ? `
            <div class="info-row">
              <strong>📝 Relatório:</strong>
              <p>${r.relatorio}</p>
            </div>
          ` : ''}
          
          ${r.descricao_ocorrencia ? `
            <div class="info-row ocorrencia">
              <strong>⚠️ Ocorrência:</strong>
              <p>${r.descricao_ocorrencia}</p>
            </div>
          ` : ''}
          
          ${imagensHTML}
          
          <div class="info-row">
            <strong>📧 Email:</strong> ${emailIcon} ${r.email_enviado ? 'Enviado' : 'Não Enviado'}
          </div>
        </div>
      `;
      
      lista.appendChild(card);
    }
  } catch (error) {
    console.error('Erro ao carregar registros:', error);
    mostrarNotificacao('Erro ao carregar registros', 'erro');
  } finally {
    mostrarLoading(false);
  }
}

async function deletarRegistro(id) {
  if (!confirm('Tem certeza que deseja deletar este registro?')) {
    return;
  }

  try {
    const res = await fetch(`${API}/registros/${id}`, {
      method: 'DELETE'
    });

    const json = await res.json();

    if (json.sucesso) {
      mostrarNotificacao('Registro deletado com sucesso!', 'sucesso');
      carregarRegistros();
    }
  } catch (error) {
    console.error('Erro:', error);
    mostrarNotificacao('Erro ao deletar registro', 'erro');
  }
}

// ================= FILTROS =================
function filtrarRegistros() {
  const data = document.getElementById('filtroData').value;
  const pdv_id = document.getElementById('filtroPdv').value;
  
  carregarRegistros({ data, pdv_id });
}

function limparFiltros() {
  document.getElementById('filtroData').value = '';
  document.getElementById('filtroPdv').value = '';
  carregarRegistros();
}

// ================= MODAL DE IMAGENS =================
async function abrirModal(registroId) {
  const modal = document.getElementById('modalImagens');
  const content = document.getElementById('modalImagensContent');
  
  try {
    const res = await fetch(`${API}/registros/${registroId}/imagens`);
    const imagens = await res.json();
    
    content.innerHTML = imagens.map(img => `
      <img src="http://localhost:3000/uploads/${img.caminho_imagem}" alt="Imagem" class="modal-img">
    `).join('');
    
    modal.style.display = 'block';
  } catch (error) {
    console.error('Erro:', error);
  }
}

function fecharModal() {
  document.getElementById('modalImagens').style.display = 'none';
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
  const modal = document.getElementById('modalImagens');
  if (event.target === modal) {
    fecharModal();
  }
};

// ================= UTILITÁRIOS =================
function formatarData(data) {
  if (!data) return 'Data inválida';
  
  // Se já vier no formato YYYY-MM-DD do MySQL
  const partes = data.split('T')[0].split('-');
  if (partes.length === 3) {
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }
  
  // Fallback para conversão padrão
  const d = new Date(data + 'T12:00:00'); // Meio-dia para evitar problemas de timezone
  if (isNaN(d.getTime())) return 'Data inválida';
  
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatarHorario(horario) {
  if (!horario) return '--';
  
  // Se vier no formato HH:MM:SS, pegar só HH:MM
  if (horario.includes(':')) {
    const partes = horario.split(':');
    return `${partes[0]}:${partes[1]}`;
  }
  
  return horario;
}

function mostrarLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function mostrarNotificacao(mensagem, tipo = 'info') {
  const div = document.createElement('div');
  div.className = `notificacao ${tipo}`;
  div.textContent = mensagem;
  
  document.body.appendChild(div);
  
  setTimeout(() => {
    div.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    div.classList.remove('show');
    setTimeout(() => div.remove(), 300);
  }, 3000);
}