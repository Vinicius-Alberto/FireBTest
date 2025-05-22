class IndexView {
  constructor() {
    this.newsShelf = document.getElementById('thumbnails');
    this.mainDisplay = document.getElementById('mainDisplay');
    this.selectedNewsId = null;
    this.newsData = [];
  }

  renderNews(news) {
    if (!this.newsShelf) return;
    this.newsData = news;
    this.newsShelf.innerHTML = '';

    news.forEach((item) => {
      const newsItem = document.createElement('div');
      newsItem.classList.add('thumbnail-item');
      newsItem.setAttribute('data-id', item.id);
      if (item.id === this.selectedNewsId) {
        newsItem.classList.add('selected');
      }

      newsItem.innerHTML = `
        <div class="thumbnail-image-container">
          ${item.image ? `<img src="${item.image}" alt="Miniatura da notícia">` : '<div class="no-image">Sem Imagem</div>'}
        </div>
        <h5>${item.title}</h5>
      `;

      newsItem.addEventListener('click', () => this.onSelectNews(item.id));
      this.newsShelf.appendChild(newsItem);
    });
  }

  displaySelectedNews(news) {
    if (!this.mainDisplay) return;
    this.selectedNewsId = news.id;
    this.mainDisplay.innerHTML = `
      <div class="selected-news">
        ${news.image ? `<img src="${news.image}" alt="Notícia expandida">` : '<div class="no-image">Sem Imagem</div>'}
        <h3>${news.title || 'Sem Título'}</h3>
        <p><strong>Data:</strong> ${news.date ? new Date(news.date).toLocaleDateString('pt-BR') : 'Sem Data'}</p>
        <p>${news.content || 'Sem Conteúdo'}</p>
      </div>
    `;
    this.renderNews(this.newsData);
  }

  bindSelectNews(handler) {
    this.onSelectNews = handler;
  }
}

export default IndexView;
