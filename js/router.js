// ----------------------------------------
// ESTADO DE LA APLICACIÓN Y NAVEGACIÓN
// ----------------------------------------

// Estado de la aplicación
let currentView = 'home'; // home, detail, create, edit
let currentPostId = null;
let currentPostData = null;

// Navegar a la vista de listado
function navigateToHome() {
    currentView = 'home';
    currentPostId = null;
    currentPostData = null;
    loadAndRenderPosts();
}

// Navegar a la vista de detalle
function navigateToDetail(postId) {
    currentView = 'detail';
    currentPostId = postId;
    loadAndRenderDetail(postId);
}

// Navegar a la vista de creación
function navigateToCreate() {
    currentView = 'create';
    renderCreateForm();
}

// Navegar a la vista de edición
function navigateToEdit(post) {
    currentView = 'edit';
    currentPostData = post;
    renderEditForm(post);
}