// ----------------------------------------
// API CONFIGURACIÓN Y FUNCIONES FETCH
// ----------------------------------------

const API_BASE = 'https://jsonplaceholder.typicode.com';
const POSTS_PER_PAGE = 10;

// Función genérica para peticiones fetch
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const finalOptions = {...defaultOptions, ...options };

    try {
        const response = await fetch(url, finalOptions);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// GET - Listar posts (con paginación opcional)
async function getPosts(page = 1, limit = POSTS_PER_PAGE) {
    const start = (page - 1) * limit;
    return await fetchAPI(`/posts?_start=${start}&_limit=${limit}`);
}

// GET - Obtener todas las publicaciones (para filtros locales)
async function getAllPosts() {
    return await fetchAPI('/posts');
}

// GET - Detalle de un post por ID
async function getPostById(id) {
    return await fetchAPI(`/posts/${id}`);
}

// POST - Crear un nuevo post
async function createPost(postData) {
    return await fetchAPI('/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
    });
}

// PUT - Actualizar un post existente
async function updatePost(id, postData) {
    return await fetchAPI(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...postData }),
    });
}

// DELETE - Eliminar un post
async function deletePost(id) {
    return await fetchAPI(`/posts/${id}`, {
        method: 'DELETE',
    });
}