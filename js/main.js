// ----------------------------------------
// INICIALIZACIÓN DE LA APLICACIÓN
// ----------------------------------------

// Estado global
let allPosts = [];
let filteredPosts = [];
let currentPage = 1;
let totalPages = 1;
let currentSearch = '';
let currentAuthorFilter = '';
let currentTagFilter = '';
let postsContainer = null;

// Inicializar la aplicación
async function init() {
    console.log('=== INICIANDO APLICACIÓN ===');
    setupNavigation();
    await loadAndRenderPosts();
}

// Configurar navegación
function setupNavigation() {
    const homeBtn = document.getElementById('nav-home');
    const createBtn = document.getElementById('nav-create');
    if (homeBtn) homeBtn.addEventListener('click', () => navigateToHome());
    if (createBtn) createBtn.addEventListener('click', () => navigateToCreate());
}

// Cargar todos los posts (para filtros)
async function loadAllPostsForFilters() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        allPosts = await response.json();
        console.log('Posts cargados desde API:', allPosts.length);
        applyFilters();
    } catch (error) {
        console.error('Error loading posts:', error);
        const app = document.getElementById('app');
        if (app) showError(app, 'No se pudieron cargar las publicaciones. Intenta más tarde.');
    }
}

// Aplicar filtros a los posts
function applyFilters() {
    let filtered = [...allPosts];

    if (currentSearch) {
        const searchLower = currentSearch.toLowerCase();
        filtered = filtered.filter(post =>
            post.title.toLowerCase().includes(searchLower) ||
            post.body.toLowerCase().includes(searchLower)
        );
    }

    if (currentAuthorFilter) {
        filtered = filtered.filter(post => post.userId === parseInt(currentAuthorFilter));
    }

    if (currentTagFilter) {
        const tag = parseInt(currentTagFilter);
        if (tag === 1) {
            filtered = filtered.filter(post => post.userId % 2 === 1);
        } else if (tag === 2) {
            filtered = filtered.filter(post => post.userId % 2 === 0);
        } else if (tag === 3) {
            filtered = filtered.filter(post => post.userId % 3 === 0);
        }
    }

    filteredPosts = filtered;
    totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    if (currentPage > totalPages) currentPage = 1;
    if (totalPages === 0) totalPages = 1;

    renderCurrentPage();
}

// Renderizar página actual de posts
function renderCurrentPage() {
    if (!postsContainer) return;

    const start = (currentPage - 1) * POSTS_PER_PAGE;
    const pagePosts = filteredPosts.slice(start, start + POSTS_PER_PAGE);

    renderPosts(pagePosts, postsContainer, (id) => navigateToDetail(id));

    const paginationDiv = document.getElementById('pagination');
    if (paginationDiv) {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const pageSpan = paginationDiv.querySelector('span');
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages;
        if (pageSpan) pageSpan.textContent = `Página ${currentPage} de ${totalPages}`;
    }
}

// Cargar y renderizar posts con filtros
async function loadAndRenderPosts() {
    const app = document.getElementById('app');
    if (app) showLoading(app);

    try {
        await loadAllPostsForFilters();

        postsContainer = renderFiltersAndPagination(
            totalPages, currentPage,
            (type, value) => {
                if (type === 'author') {
                    currentAuthorFilter = value;
                    currentPage = 1;
                    applyFilters();
                } else if (type === 'tag') {
                    currentTagFilter = value;
                    currentPage = 1;
                    applyFilters();
                }
            },
            (newPage) => {
                currentPage = newPage;
                renderCurrentPage();
            },
            (searchTerm) => {
                currentSearch = searchTerm;
                currentPage = 1;
                applyFilters();
            }
        );

        renderCurrentPage();
    } catch (error) {
        console.error('Error:', error);
        if (app) showError(app, 'Error al cargar las publicaciones');
    }
}

// Cargar y renderizar detalle
async function loadAndRenderDetail(postId) {
    console.log('loadAndRenderDetail llamado con ID:', postId);
    const app = document.getElementById('app');
    if (!app) return;

    showLoading(app);

    try {
        const url = `https://jsonplaceholder.typicode.com/posts/${postId}`;
        console.log('Fetching URL:', url);

        const response = await fetch(url);
        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: No se encontró el post ${postId}`);
        }

        const post = await response.json();
        console.log('Post cargado:', post);

        renderPostDetail(app, post,
            (postData) => navigateToEdit(postData),
            async(id) => {
                if (confirm('¿Estás seguro de que querés eliminar esta publicación?')) {
                    try {
                        const deleteResponse = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
                            method: 'DELETE'
                        });

                        if (deleteResponse.ok) {
                            showSuccess('Publicación eliminada correctamente');
                            navigateToHome();
                        } else {
                            throw new Error('Error al eliminar');
                        }
                    } catch (error) {
                        showError(app, 'Error al eliminar la publicación');
                    }
                }
            },
            () => navigateToHome()
        );
    } catch (error) {
        console.error('Error detallado en loadAndRenderDetail:', error);
        showError(app, `No se pudo cargar el detalle del post ${postId}. Error: ${error.message}`);
        setTimeout(() => navigateToHome(), 2000);
    }
}

// Renderizar formulario de creación
function renderCreateForm() {
    const app = document.getElementById('app');
    if (!app) return;

    renderPostForm(null, app, async(formData) => {
        const validation = validatePostForm(formData.title, formData.body, formData.userId);
        if (!validation.valid) {
            displayFormErrors(validation.errors, app.querySelector('.form-container'));
            return;
        }

        try {
            await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    body: formData.body,
                    userId: formData.userId
                })
            });

            showSuccess('¡Publicación creada exitosamente!');
            navigateToHome();
        } catch (error) {
            showError(app, 'Error al crear la publicación');
        }
    }, () => navigateToHome());
}

// Renderizar formulario de edición
function renderEditForm(post) {
    const app = document.getElementById('app');
    if (!app) return;

    renderPostForm(post, app, async(formData) => {
        const validation = validatePostForm(formData.title, formData.body, formData.userId);
        if (!validation.valid) {
            displayFormErrors(validation.errors, app.querySelector('.form-container'));
            return;
        }

        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${post.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: post.id,
                    title: formData.title,
                    body: formData.body,
                    userId: formData.userId
                })
            });

            if (response.ok) {
                showSuccess('¡Publicación actualizada exitosamente!');
                navigateToHome();
            } else {
                throw new Error('Error al actualizar');
            }
        } catch (error) {
            showError(app, 'Error al actualizar la publicación');
        }
    }, () => navigateToHome());
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);