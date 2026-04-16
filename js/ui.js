// ----------------------------------------
// MANIPULACIÓN DEL DOM Y RENDERIZADO
// ----------------------------------------

// Mostrar loading
function showLoading(container) {
    if (!container) return;
    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando publicaciones...</p></div>';
}

// Mostrar error
function showError(container, message) {
    if (!container) return;
    container.innerHTML = `<div class="alert alert-error">❌ ${message}</div>`;
}

// Mostrar mensaje de éxito (temporal)
function showSuccess(message, duration = 3000) {
    const app = document.getElementById('app');
    if (!app) return;
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success';
    alertDiv.textContent = `✅ ${message}`;
    app.insertBefore(alertDiv, app.firstChild);
    setTimeout(() => alertDiv.remove(), duration);
}

// Renderizar listado de posts
function renderPosts(posts, container, onViewDetail) {
    if (!container) return;

    if (!posts || posts.length === 0) {
        container.innerHTML = '<div class="alert alert-info">📭 No hay publicaciones disponibles</div>';
        return;
    }

    const postsHTML = `
        <div class="posts-grid">
            ${posts.map(post => `
                <div class="card" data-id="${post.id}">
                    <h3 class="card-title">${escapeHtml(post.title)}</h3>
                    <p class="card-excerpt">${escapeHtml(post.body.substring(0, 100))}...</p>
                    <div class="card-meta">📌 Usuario ID: ${post.userId}</div>
                    <button class="btn btn-primary btn-sm view-detail" data-id="${post.id}">Ver más</button>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = postsHTML;
    
    // Agregar event listeners a los botones "Ver más"
    container.querySelectorAll('.view-detail').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            onViewDetail(id);
        });
    });
}

// Renderizar detalle de un post (VERSIÓN CORREGIDA)
function renderPostDetail(container, post, onEdit, onDelete, onBack) {
    // Verificar que container sea un elemento válido
    if (!container || typeof container.querySelector !== 'function') {
        console.error('renderPostDetail: container no válido', container);
        return;
    }
    
    container.innerHTML = `
        <div class="detail-view">
            <button class="btn btn-outline btn-back">← Volver al listado</button>
            <h2>${escapeHtml(post.title)}</h2>
            <div class="meta">📌 Usuario ID: ${post.userId} | 🆔 Post ID: ${post.id}</div>
            <div class="body">${escapeHtml(post.body)}</div>
            <div class="detail-actions">
                <button class="btn btn-primary edit-post" data-id="${post.id}">✏️ Editar</button>
                <button class="btn btn-danger delete-post" data-id="${post.id}">🗑️ Eliminar</button>
            </div>
        </div>
    `;
    
    const backBtn = container.querySelector('.btn-back');
    const editBtn = container.querySelector('.edit-post');
    const deleteBtn = container.querySelector('.delete-post');
    
    if (backBtn) backBtn.addEventListener('click', onBack);
    if (editBtn) editBtn.addEventListener('click', () => onEdit(post));
    if (deleteBtn) deleteBtn.addEventListener('click', () => onDelete(post.id));
}

// Renderizar formulario de creación/edición
function renderPostForm(post = null, container, onSave, onCancel) {
    if (!container) return;
    
    const isEditing = post !== null;
    const title = isEditing ? post.title : '';
    const body = isEditing ? post.body : '';
    const userId = isEditing ? post.userId : '';
    
    container.innerHTML = `
        <div class="form-container">
            <h2>${isEditing ? '✏️ Editar Publicación' : '📝 Crear Nueva Publicación'}</h2>
            <form id="post-form">
                <div class="form-group">
                    <label for="title">Título *</label>
                    <input type="text" id="title" name="title" value="${escapeHtml(title)}" placeholder="Mínimo 5 caracteres">
                </div>
                <div class="form-group">
                    <label for="body">Contenido *</label>
                    <textarea id="body" name="body" rows="6" placeholder="Mínimo 20 caracteres">${escapeHtml(body)}</textarea>
                </div>
                <div class="form-group">
                    <label for="userId">Autor (ID de usuario) *</label>
                    <input type="number" id="userId" name="userId" value="${userId}" placeholder="ID entre 1 y 10" min="1" max="10">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">💾 Guardar</button>
                    <button type="button" class="btn btn-outline btn-cancel">❌ Cancelar</button>
                </div>
            </form>
        </div>
    `;
    
    const form = document.getElementById('post-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                title: document.getElementById('title').value,
                body: document.getElementById('body').value,
                userId: parseInt(document.getElementById('userId').value),
            };
            onSave(formData);
        });
    }
    
    const cancelBtn = container.querySelector('.btn-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', onCancel);
}

// Renderizar barra de filtros y paginación
function renderFiltersAndPagination(totalPages, currentPage, onFilterChange, onPageChange, onSearch) {
    const app = document.getElementById('app');
    if (!app) return null;
    
    const filtersHTML = `
        <div class="filters-bar">
            <input type="text" id="search-input" placeholder="🔍 Buscar por título o contenido..." autocomplete="off">
            <select id="author-filter">
                <option value="">Todos los autores</option>
                <option value="1">Usuario 1</option>
                <option value="2">Usuario 2</option>
                <option value="3">Usuario 3</option>
                <option value="4">Usuario 4</option>
                <option value="5">Usuario 5</option>
                <option value="6">Usuario 6</option>
                <option value="7">Usuario 7</option>
                <option value="8">Usuario 8</option>
                <option value="9">Usuario 9</option>
                <option value="10">Usuario 10</option>
            </select>
            <select id="tag-filter">
                <option value="">Todas las categorías</option>
                <option value="1">Categoría A (Impares)</option>
                <option value="2">Categoría B (Pares)</option>
                <option value="3">Categoría C (Múltiplos de 3)</option>
            </select>
        </div>
        <div id="posts-container"></div>
        <div class="pagination" id="pagination">
            <button id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>← Anterior</button>
            <span>Página ${currentPage} de ${totalPages}</span>
            <button id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente →</button>
        </div>
    `;
    
    app.innerHTML = filtersHTML;
    
    // Event listeners
    const searchInput = document.getElementById('search-input');
    const authorFilter = document.getElementById('author-filter');
    const tagFilter = document.getElementById('tag-filter');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (searchInput) searchInput.addEventListener('input', (e) => onSearch(e.target.value));
    if (authorFilter) authorFilter.addEventListener('change', (e) => onFilterChange('author', e.target.value));
    if (tagFilter) tagFilter.addEventListener('change', (e) => onFilterChange('tag', e.target.value));
    if (prevBtn) prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
    
    return document.getElementById('posts-container');
}

// Helper: escapar HTML para prevenir XSS
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}