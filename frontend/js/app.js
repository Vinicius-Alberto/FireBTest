const API_URL = '/api/news';

let currentEditingId = null;

const isEditorPage = window.location.pathname.includes('editor.html');

// ========== FUNÇÕES ==========

// Upload e preview de imagem
function renderPreviewImage(inputId, imgId) {
  const file = document.getElementById(inputId).files[0];
  const previewImage = document.getElementById(imgId);
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      previewImage.src = event.target.result;
      previewImage.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    previewImage.style.display = 'none';
  }
}

// Limpa o formulário
function clearForm(formId, previewId) {
  document.getElementById(formId).reset();
  document.getElementById(previewId).style.display = 'none';
}

// CRUD usando API
async function loadNews() {
  const res = await fetch(API_URL);
  return res.json();
}

async function saveNews(news) {
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(news),
  });
}

async function deleteNews(id) {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
}

async function updateNews(id, updatedFields) {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedFields),
  });
}

// ========== FORM EVENTOS ==========
function bindFormEvents() {
  document.getElementById('image').addEventListener('change', () => renderPreviewImage('image', 'previewImage'));
  document.getElementById('clearForm').addEventListener('click', () => clearForm('newsForm', 'previewImage'));

  document.getElementById('newsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('image').files[0];
    let imageBase64 = '';

    if (file) {
      imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    const news = {
      title: document.getElementById('title').value,
      content: document.getElementById('content').value,
      image: imageBase64,
      date: new Date().toISOString(),
    };

    await saveNews(news);
    clearForm('newsForm', 'previewImage');
    loadEditorNewsList();
  });

  document.getElementById('cancelEditBtn').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
    currentEditingId = null;
  });

  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
    currentEditingId = null;
  });

  document.getElementById('saveEditBtn').addEventListener('click', async () => {
    const title = document.getElementById('editTitle').value;
    const content = document.getElementById('editContent').value;
    const file = document.getElementById('editImage').files[0];
    let image = null;

    if (file) {
      image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    const updatedFields = { title, content };
    if (image) updatedFields.image = image;

    await updateNews(currentEditingId, updatedFields);
    document.getElementById('editModal').style.display = 'none';
    currentEditingId = null;
    loadEditorNewsList();
  });
}

// ========== RENDERIZAÇÃO ==========
async function loadEditorNewsList() {
  const container = document.getElementById('newsList');
  container.innerHTML = '';
  const news = await loadNews();

  if (news.length === 0) {
    container.innerHTML = '<p>Nenhuma notícia cadastrada.</p>';
    return;
  }

  news.forEach(item => {
    const id = item.id;
    const wrapper = document.createElement('div');
    wrapper.className = 'news-list-item';

    const img = document.createElement('img');
    img.src = item.image || '';
    img.className = 'mini-thumbnail';
    img.alt = 'Miniatura';

    const content = document.createElement('div');
    content.className = 'news-content';

    const title = document.createElement('h3');
    title.textContent = item.title;

    const snippet = document.createElement('p');
    snippet.textContent = item.content;

    content.appendChild(title);
    content.appendChild(snippet);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const editBtn = document.createElement('a');
    editBtn.textContent = 'Editar';
    editBtn.href = '#';
    editBtn.className = 'edit-news';
    editBtn.onclick = (e) => {
      e.preventDefault();
      currentEditingId = id;
      document.getElementById('editTitle').value = item.title;
      document.getElementById('editContent').value = item.content;
      document.getElementById('editModal').style.display = 'flex';
    };

    const deleteBtn = document.createElement('a');
    deleteBtn.textContent = 'Excluir';
    deleteBtn.href = '#';
    deleteBtn.className = 'delete-news';
    deleteBtn.onclick = async (e) => {
      e.preventDefault();
      if (confirm('Deseja excluir esta notícia?')) {
        await deleteNews(id);
        loadEditorNewsList();
      }
    };

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    wrapper.appendChild(img);
    wrapper.appendChild(content);
    wrapper.appendChild(actions);

    container.appendChild(wrapper);
  });
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
  if (isEditorPage) {
    loadEditorNewsList();
    bindFormEvents();
  }
});