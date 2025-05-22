import EditorController from './controllers/editorControllerFirebase.js';
import EditorView from './views/editorView.js';

let currentEditingId = null;

const isEditorPage = window.location.pathname.includes('editor.html');
const editorController = new EditorController();
const editorView = new EditorView();

//  FUNÇÕES AUXILIARES 
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

function clearForm(formId, previewId) {
  document.getElementById(formId).reset();
  document.getElementById(previewId).style.display = 'none';
}

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
    await editorController.saveNews(news);
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

    await editorController.updateNews(currentEditingId, updatedFields);
    document.getElementById('editModal').style.display = 'none';
    currentEditingId = null;
    loadEditorNewsList();
  });
}

// ========== RENDERIZAÇÃO ==========
async function loadEditorNewsList() {
  const container = document.getElementById('newsList');
  container.innerHTML = '';
  const news = await editorController.loadNews();

  if (news.length === 0) {
    container.innerHTML = '<p style="color: #1A1A1A;">Nenhuma notícia cadastrada.</p>';
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
      editorController.getNewsById(id).then(newsItem => {
        editorView.fillEditModal(newsItem);
        document.getElementById('editModal').style.display = 'flex';
      });
    };

    const deleteBtn = document.createElement('a');
    deleteBtn.textContent = 'Excluir';
    deleteBtn.href = '#';
    deleteBtn.className = 'delete-news';
    deleteBtn.onclick = (e) => {
      e.preventDefault();
      if (confirm('Deseja excluir esta notícia?')) {
        editorController.deleteNews(id).then(loadEditorNewsList);
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
  } else {
  import('./views/indexView.js').then(({ default: IndexView }) => {
    const indexView = new IndexView();

    editorController.loadNews().then((news) => {
      if (news.length > 0) {
        indexView.renderNews(news);
        indexView.displaySelectedNews(news[0]);

        indexView.bindSelectNews((id) => {
          const selected = news.find(n => n.id === id);
          if (selected) {
            indexView.displaySelectedNews(selected);
          }
        });
      } else {
        const display = document.querySelector('.main-display');
        if (display) {
          display.innerHTML = '<p style="text-align: center;">Nenhuma notícia disponível.</p>';
        }
      }
    });
  });
  }
});
