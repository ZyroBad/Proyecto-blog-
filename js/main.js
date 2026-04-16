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
    setupNavigation();
    await loadAndRenderPosts();
}

// Configurar navegación
function setupNavigation() {
    document.getElementById('nav-home').addEventListener('click', () => navigateToHome());
    document.getElementById('nav-create').addEventListener('click', () => navigateToCreate());
}

// Cargar todos los posts (para filtros)
async function loadAllPostsForFilters() {
    try {
        allPosts = await getAllPosts();
        applyFilters();
    } catch (error) {
        console.error('Error loading posts:', error);
        const app = document.getElementById('app');
        showError(app, 'No se pudieron cargar las publicaciones. Intenta más tarde.');
    }
}

// Aplicar filtros a los posts
function applyFilters() {
    let filtered = [...allPosts];

    // Filtro por búsqueda (título o contenido)
    if (currentSearch) {
        const searchLower = currentSearch.toLowerCase();
        filtered = filtered.filter(post =>
            post.title.toLowerCase().includes(searchLower) ||
            post.body.toLowerCase().includes(searchLower)
        );
    }

    // Filtro por autor (userId)
    if (currentAuthorFilter) {
        filtered = filtered.filter(post => post.userId === parseInt(currentAuthorFilter));
    }

    // Filtro por categoría/tag (simulado)
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

    renderCurrentPage();
}

// Renderizar página actual de posts
function renderCurrentPage() {
    if (!postsContainer) return;

    const start = (currentPage - 1) * POSTS_PER_PAGE;
    const pagePosts = filteredPosts.slice(start, start + POSTS_PER_PAGE);

    renderPosts(pagePosts, postsContainer, (id) => navigateToDetail(id));

    // Actualizar paginación
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
    showLoading(app);

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
        showError(app, 'Error al cargar las publicaciones');
    }
}

// Cargar y renderizar detalle
async function loadAndRenderDetail(postId) {
    const app = document.getElementById('app');
    showLoading(app);

    try {
        const post = await getPostById(postId);
        renderPostDetail(app, post,
            (postData) => navigateToEdit(postData),
            async(id) => {
                if (confirm('¿Estás seguro de que querés eliminar esta publicación?')) {
                    try {
                        await deletePost(id);
                        showSuccess('Publicación eliminada correctamente');
                        navigateToHome();
                    } catch (error) {
                        showError(app, 'Error al eliminar la publicación');
                    }
                }
            },
            () => navigateToHome()
        );
    } catch (error) {
        showError(app, 'No se pudo cargar el detalle de la publicación');
    }
}

// Renderizar formulario de creación
function renderCreateForm() {
    const app = document.getElementById('app');
    renderPostForm(null, app, async(formData) => {
        const validation = validatePostForm(formData.title, formData.body, formData.userId);
        if (!validation.valid) {
            displayFormErrors(validation.errors, app.querySelector('.form-container'));
            return;
        }

        try {
            const newPost = await createPost({
                title: formData.title,
                body: formData.body,
                userId: formData.userId,
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
    renderPostForm(post, app, async(formData) => {
        const validation = validatePostForm(formData.title, formData.body, formData.userId);
        if (!validation.valid) {
            displayFormErrors(validation.errors, app.querySelector('.form-container'));
            return;
        }

        try {
            const updatedPost = await updatePost(post.id, {
                title: formData.title,
                body: formData.body,
                userId: formData.userId,
            });
            showSuccess('¡Publicación actualizada exitosamente!');
            navigateToHome();
        } catch (error) {
            showError(app, 'Error al actualizar la publicación');
        }
    }, () => navigateToHome());
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);