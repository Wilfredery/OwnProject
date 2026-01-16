export default {
  // ===== GENERAL =====
  account_settings: "Cuenta y ajustes",
  theme: "Tema:",
  language: "Idioma:",
  spanish: "Español 🇪🇸",
  english: "Inglés 🇬🇧",
  footer_text: "Todos los derechos reservados",

  // ===== HOME =====
  create_noteFirst: "¡Crea tu primera nota!",
  create_note: "¡Crea una nota!",
  search_notes: "¡Busca tus notas!",
  check_notes: "¡Revisa las notas que ya has hecho!",

  // ===== NAV / PAGES =====
  page_accountSettings: "Cuenta y ajustes",
  page_searchNotes: "Buscar notas",
  askguide: "¿Cómo usar esta página?",

  // ===== CREATE =====
  crear__titulo: "Crear nota",
  crear__btnSave: "Guardar",
  crear__inputTitulo: "Título",
  crear__inputContenido: "Escribe tu nota aquí...",
  crearNota: "Crear nota",

  // ===== SEARCH =====
  search_placeholder: "Buscar notas...",
  findlist: "No se encontraron notas",
  editar: "✏ Editar",
  eliminar: "🗑 Eliminar",
  buscarSearch: "Buscar",
  filters: "Filtros",
  order_by: "Ordenar por",
  newest_first: "Más recientes primero",
  oldest_first: "Más antiguas primero",
  a_z: "A - Z",
  z_a: "Z - A",

  // ===== AUTH =====
  login: "Iniciar sesión",
  register: "Registrarse",
  google: "Iniciar sesión con Google",
  googleCreate: "Registrarse con Google",
  logintitulo: "Iniciar sesión",
  emailLogin: "Correo electrónico",
  passwordLogin: "Contraseña",
  forgotPassowrd: "Olvidé mi contraseña",
  createAcc: "¿No tienes cuenta? Crear cuenta",
  submitLogin: "Entrar",

  registerTitle: "Crear cuenta",
  nameRegister: "Nombre completo",
  emailRegister: "Correo electrónico",
  passwordRegister: "Contraseña",
  submitRegister: "Registrarse",
  backToLogin: "Volver al login",

  forgotTitle: "Recuperar contraseña",
  emailForgot: "Correo electrónico",
  submitForgot: "Enviar enlace",

  nickname: "Apodo/Nombre de usuario",
  createExist: "No importa, ya tengo una cuenta",

  resetTitle: "Restablecer contraseña",
  newPassword: "Nueva contraseña",
  confirmPassword: "Confirmar contraseña",
  submitReset: "Restablecer contraseña",

  confirmTitle: "¡Gracias por registrarte!",
  confirmText: "¡Puedes presionar el enlace para registrarte, disfruta de nuestra aplicación!",

  //Validaciones del login.js
  errorCamposEmpty: "Completa todos los campos",
  errorLoginExist: "Error al iniciar sesión",
  errorUserNotFound: "El usuario no existe",
  errorLoginPassW: "Contraseña incorrecta",

  //Validacion del olvidar.js
  requiredEmail: "Correo requerido",
  writeEmail: "Escribe tu correo electrónico",
  emailSent: "Correo enviado 📩",
  checkSpam: "Revisa tu correo para restablecer tu contraseña. Si no lo ves, revisa la carpeta de spam.",
  errorForgot: "Ocurrió un error, intenta nuevamente",
  noAccount: "No existe una cuenta con ese correo",

  //validacion del password.js, register.js
  requireFilds: "Campos requeridos",
  shortPassW: "Contraseña muy corta",
  amountPassW: "Debe tener al menos 6 caracteres",
  fillboth: "Completa ambos campos",
  notMatch: "No coinciden",
  notMatchPassW: "Las contraseñas no coinciden",
  passUpdated: "Contraseña actualizada 🔐",
  passProcessed: "Ahora puedes iniciar sesión con tu nueva contraseña",
  passWCantBeChanged: "La contraseña no se puede cambiar",
  linkExpired: "El enlace ha expirado",
  linkUnvalid: "El enlace no es válido", //linkconfirm.js

  //validaciones del register.js
  requiredNickname: "Apodo requerido",
  enterNickname: "Por favor ingresa un nombre de usuario",
  shortNickname: "Apodo muy corto",
  nicknameMinChars: "Debe tener al menos 3 caracteres",
  invalidEmail: "Correo inválido",
  enterValidEmail: "Ingresa un correo válido",
  enterPassword: "Por favor ingresa una contraseña",
  accCreated : "Cuenta creada 🎉",
  verifyEmailSent : "Te enviamos un correo para verificar tu cuenta",
  errorSignUp : "Ocurrió un error al registrar",
  AccAlreadyExists : "La cuenta ya existe",

  //Validacion de google.js
  errorGoogleSignIn: "No se pudo iniciar sesión con Google",

  //validacion de nota.js
  completeFields : "Debes de completar el título y el contenido",
  errorSave : "Hubo un error al guardar la nota",
  savedNote : "Nota guardada correctamente",
  ask : "¿Qué deseas hacer ahora?",
  createAgain : "📝 Crear otra nota",
  goList : "📋 Ir a la lista",

  //dark.js
  darkmodeEnabled: "Modo oscuro activado 🌙",
  lightmodeEnabled: "Modo claro activado 🌞",

  //validacion de editar.js
  notewasntFound: "No se encontró la nota",
  denied : "Acceso denegado a la nota",
  noteNotNote : "Esta nota no te pertenece",
  updatedNote : "Nota actualizada ✔",
  updatedError : "Error al actualizar la nota 😞",
  askDelete : "¿Seguro que deseas eliminar la nota?", //De aqui par aabajo search.js
  textAskDelete : "Esta acción no se puede deshacer.",
  confirmDelete : "Sí, eliminar",
  cancelDelete : "Cancelar",
  alreadyDeleted : "La nota ya fue eliminada",
  errorDelete : "No se pudo eliminar la nota",

  //validation linkconfirm.js
  textlinkUnvalid: "El enlace de verificación no es válido o ha expirado.",
  emailVerified: "Correo verificado ✅",
  textEmailVerified: "Tu correo ha sido verificado correctamente",
  errorlink : "El enlace es inválido o ya fue utilizado",

  //Validation de search.js
  askEditNote: "¿Editar nota?",
  textAskEditNote: "Procederas a editar esta nota",
  confirmEditNote: "Sí, editar",
  cancelEditNote: "Cancelar",
  
};
