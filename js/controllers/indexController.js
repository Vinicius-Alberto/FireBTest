class IndexController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        console.log('IndexController inicializado - Model:', this.model);
        console.log('Método getNews disponível:', typeof this.model.getNews === 'function');
        this.init();
    }

    async init() {
        await this.loadNews();
        this.view.bindSelectNews(this.handleSelectNews.bind(this));
    }

    async loadNews() {
        try {
            let news = await this.model.getNews();
            news = news.sort((a, b) => new Date(b.date) - new Date(a.date));
            console.log('Notícias carregadas no IndexController:', news);
            this.view.renderNews(news);
            if (news.length > 0) {
                this.view.displaySelectedNews(news[0]); // Exibe a primeira notícia por padrão
            }
        } catch (error) {
            console.error('Erro ao carregar notícias no IndexController:', error);
        }
    }

    async handleSelectNews(newsId) {
        try {
            const newsList = await this.model.getNews();
            const news = newsList.find(item => item.id === newsId);
            if (!news) {
                console.error(`Notícia não encontrada com ID ${newsId}`);
                return;
            }
            console.log('Selecionada notícia:', news);
            this.view.displaySelectedNews(news);
        } catch (error) {
            console.error('Erro ao selecionar notícia:', error);
        }
    }
}

export default IndexController;