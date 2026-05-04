const registerForm = document.getElementById('registerForm');
const feedback = document.getElementById('feedback');
const mainPanel = document.getElementById('mainPanel');
const authStatus = document.getElementById('authStatus');
const actionPanel = document.getElementById('actionPanel');
const actionTitle = document.getElementById('actionTitle');
const actionSubtitle = document.getElementById('actionSubtitle');
const actionForms = document.getElementById('actionForms');
const resultOutput = document.getElementById('resultOutput');
const logoutButton = document.getElementById('logoutButton');
const toggleLogin = document.getElementById('toggleLogin');

let authToken = null;
let isLoginMode = false;

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('registerEmail').value.trim();
  const senha = document.getElementById('registerPassword').value.trim();
  const endpoint = isLoginMode ? '/logar' : '/cadastro';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro inesperado');

    if (data.token) {
      authToken = data.token;
      showMainPanel(`Bem-vindo, ${email}!`);
      setStatus('success', isLoginMode ? 'Login realizado' : 'Cadastro concluído');
      appendResult(data);
      return;
    }

    if (data.requiresTwoFA) {
      setStatus('waiting', 'Aguardando 2FA');
      showTwoFAForm(email);
      appendResult(data);
      return;
    }

    setStatus('success', 'Cadastro concluído');
    showMainPanel(`Bem-vindo, ${email}!`);
    appendResult(data);
  } catch (error) {
    setStatus('error', error.message);
    appendResult({ error: error.message });
  }
});

logoutButton.addEventListener('click', () => {
  authToken = null;
  showAuthCard();
  setStatus('waiting', 'Faça cadastro ou login para acessar os recursos.');
  appendResult('Sessão encerrada.');
});

toggleLogin.addEventListener('click', () => {
  isLoginMode = !isLoginMode;
  const title = isLoginMode ? 'Entrar' : 'Cadastro';
  toggleLogin.textContent = isLoginMode ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Fazer login';
  document.querySelector('.auth-card h2').textContent = title;
});

function setStatus(type, message) {
  authStatus.textContent = message;
  authStatus.className = `status-pill status-${type}`;
}

function showMainPanel(message) {
  mainPanel.classList.remove('hidden');
  document.querySelector('.hero-copy p').textContent = message;
  feedback.textContent = '';
}

function showAuthCard() {
  mainPanel.classList.add('hidden');
  document.querySelector('.hero-copy p').textContent = 'Cadastre-se primeiro para liberar os recursos da API e gerenciar livros em tempo real.';
}

function appendResult(data) {
  if (typeof data === 'string') {
    resultOutput.textContent = data;
    return;
  }
  resultOutput.textContent = JSON.stringify(data, null, 2);
}

function showBookForm(type) {
  actionTitle.textContent = {
    create: 'Criar novo livro',
    read: 'Buscar livro por código',
    update: 'Atualizar livro',
    delete: 'Excluir livro',
    upload: 'Enviar imagem do livro'
  }[type] || 'Ação';

  actionSubtitle.textContent = 'Preencha os campos abaixo para usar a API.';
  actionForms.innerHTML = '';

  const form = document.createElement('form');
  form.className = 'form-grid';

  form.appendChild(createInput('codigo', 'Código do livro', 'number'));

  if (type === 'create' || type === 'update') {
    form.appendChild(createInput('titulo', 'Título'));
    form.appendChild(createInput('autor', 'Autor'));
    form.appendChild(createInput('descricao', 'Descrição'));
    form.appendChild(createInput('resenha', 'Resenha'));
  }

  if (type === 'upload') {
    form.appendChild(createInput('image', 'Imagem do livro', 'file'));
  }

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'btn btn-primary';
  submit.textContent = 'Enviar';
  form.appendChild(submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const codigo = form.codigo?.value;
    try {
      let response;
      let body;

      if (type === 'create') {
        body = {
          codigo: Number(form.codigo.value),
          titulo: form.titulo.value,
          autor: form.autor.value,
          descricao: form.descricao.value,
          resenha: form.resenha.value
        };
        response = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }

      if (type === 'read') {
        response = await fetch(`/api/items/${codigo}`);
      }

      if (type === 'update') {
        body = {
          titulo: form.titulo.value,
          autor: form.autor.value,
          descricao: form.descricao.value,
          resenha: form.resenha.value
        };
        response = await fetch(`/api/items/${codigo}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }

      if (type === 'delete') {
        response = await fetch(`/api/items/${codigo}`, { method: 'DELETE' });
      }

      if (type === 'upload') {
        const file = form.image.files[0];
        if (!file) throw new Error('Selecione uma imagem');
        const formData = new FormData();
        formData.append('image', file);
        response = await fetch(`/api/items/${codigo}/image`, {
          method: 'POST',
          body: formData
        });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao executar requisição');
      appendResult(data);
      setStatus('success', 'Requisição realizada com sucesso');
    } catch (error) {
      appendResult({ error: error.message });
      setStatus('error', error.message);
    }
  });

  actionForms.appendChild(form);
}

function showDistanceForm() {
  actionTitle.textContent = 'Calcular distância geográfica';
  actionSubtitle.textContent = 'Use coordenadas para calcular a distância com a API.';
  actionForms.innerHTML = '';

  const form = document.createElement('form');
  form.className = 'form-grid';
  form.appendChild(createInput('lat1', 'Latitude 1', 'number'));
  form.appendChild(createInput('lon1', 'Longitude 1', 'number'));
  form.appendChild(createInput('lat2', 'Latitude 2', 'number'));
  form.appendChild(createInput('lon2', 'Longitude 2', 'number'));

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'btn btn-primary';
  submit.textContent = 'Calcular';
  form.appendChild(submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const body = {
        lat1: Number(form.lat1.value),
        lon1: Number(form.lon1.value),
        lat2: Number(form.lat2.value),
        lon2: Number(form.lon2.value)
      };
      const response = await fetch('/api/distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao calcular distância');
      appendResult(data);
      setStatus('success', 'Distância calculada');
    } catch (error) {
      appendResult({ error: error.message });
      setStatus('error', error.message);
    }
  });

  actionForms.appendChild(form);
}

function createInput(name, label, type = 'text') {
  const wrapper = document.createElement('label');
  wrapper.textContent = label;
  const input = document.createElement('input');
  input.name = name;
  input.type = type;
  if (type === 'number') input.step = 'any';
  if (type === 'file') input.accept = 'image/*';
  wrapper.appendChild(input);
  return wrapper;
}

async function fetchItems() {
  try {
    const response = await fetch('/api/items');
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao listar livros');
    appendResult(data);
    setStatus('success', 'Livros carregados');
  } catch (error) {
    appendResult({ error: error.message });
    setStatus('error', error.message);
  }
}

function openPdf() {
  window.open('/api/items/pdf', '_blank');
}

function showTwoFAForm(email) {
  actionTitle.textContent = 'Verificação 2FA';
  actionSubtitle.textContent = `Um código foi enviado para ${email}. Informe abaixo.`;
  actionForms.innerHTML = '';

  const form = document.createElement('form');
  form.className = 'form-grid';
  form.appendChild(createInput('code', 'Código 2FA', 'text'));

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'btn btn-primary';
  submit.textContent = 'Verificar';
  form.appendChild(submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const body = { email, code: form.code.value.trim() };
      const response = await fetch('/verificar-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao verificar 2FA');
      authToken = data.token;
      showMainPanel(`Bem-vindo, ${email}!`);
      appendResult(data);
      setStatus('success', '2FA concluído');
    } catch (error) {
      appendResult({ error: error.message });
      setStatus('error', error.message);
    }
  });

  actionForms.appendChild(form);
}

setStatus('waiting', 'Faça cadastro ou login para acessar os recursos.');
