// ----------------------------------------
// VALIDACIONES DE FORMULARIOS
// ----------------------------------------

// Validar título (mínimo 5 caracteres)
function validateTitle(title) {
    if (!title || title.trim().length === 0) {
        return { valid: false, message: 'El título es obligatorio' };
    }
    if (title.trim().length < 5) {
        return { valid: false, message: 'El título debe tener al menos 5 caracteres' };
    }
    return { valid: true, message: '' };
}

// Validar contenido/body (mínimo 20 caracteres)
function validateBody(body) {
    if (!body || body.trim().length === 0) {
        return { valid: false, message: 'El contenido es obligatorio' };
    }
    if (body.trim().length < 20) {
        return { valid: false, message: 'El contenido debe tener al menos 20 caracteres' };
    }
    return { valid: true, message: '' };
}

// Validar usuario (userId entre 1 y 10)
function validateUserId(userId) {
    const id = parseInt(userId);
    if (isNaN(id)) {
        return { valid: false, message: 'Debe seleccionar un autor válido' };
    }
    if (id < 1 || id > 10) {
        return { valid: false, message: 'El autor debe tener ID entre 1 y 10' };
    }
    return { valid: true, message: '' };
}

// Validar formulario completo
function validatePostForm(title, body, userId) {
    const titleValidation = validateTitle(title);
    const bodyValidation = validateBody(body);
    const userValidation = validateUserId(userId);

    return {
        valid: titleValidation.valid && bodyValidation.valid && userValidation.valid,
        errors: {
            title: titleValidation.message,
            body: bodyValidation.message,
            userId: userValidation.message,
        },
    };
}

// Mostrar errores en el formulario
function displayFormErrors(errors, formContainer) {
    // Limpiar errores anteriores
    formContainer.querySelectorAll('.error-message').forEach(el => el.remove());

    // Agregar errores nuevos
    for (const [field, message] of Object.entries(errors)) {
        if (message) {
            const fieldElement = formContainer.querySelector(`[name="${field}"], #${field}`);
            if (fieldElement) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = message;
                fieldElement.parentNode.appendChild(errorDiv);
            }
        }
    }
}