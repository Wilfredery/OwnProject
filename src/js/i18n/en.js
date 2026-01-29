export default {
  //Acc&sett
  account_settings: "Account & Settings",
  theme: "Theme:",
  language: "Language:",
  spanish: "Spanish 🇪🇸",
  english: "English 🇬🇧",
  UserNotVerfied: "User not verified(Guest)",
  guest: "Guest",
  tittleCloseSession: "Log Out?",
  textCloseSession: "Your current session will be closed",
  confirmCloseSession: "Yes, log out",
  cancerlCloseSession: "Cancel",
  

  //HOME
  create_note: "Create a note!",
  search_notes: "Search your notes!",
  check_notes: "Check the notes you’ve already made!",
  footer_text: " All rights reserved",
  titleplsverifyemail: "Email not verified",
  plsverifyemail: "Please verify your email to create and search notes.",
  confirmplsverifyemail: "Understood",

  //PAGES
  page_accountSettings: "Account & Settings",
  page_searchNotes: "Search Notes",
  askguide: "How to use this page?",

  //CREATE NOTE
  crear__titulo: "Create note",
  crear__btnSave: "Save",
  crear__inputTitulo: "Title",
  crear__inputContenido: "Write your note here...",
  crearNota: "Create note",

  //SEARCH
  search_placeholder: "Search notes...",
  findlist: "No notes found",
  buscarSearch: "Search",
  filters: "Filters",
  order_by: "Sort by",
  newest_first: "Newest first",
  oldest_first: "Oldest first",
  a_z: "A - Z",
  z_a: "Z - A",

  //ACTIONS
  editar: "✏ Edit",
  eliminar: "🗑 Delete",

  //UTH / LOGIN
  login: "Log In",
  register: "Sign Up",
  google: "Log In with Google",
  googleCreate: "Sign Up with Google",
  logintitulo: "Log In",
  emailLogin: "Email",
  passwordLogin: "Password",
  forgotPassowrd: "I forgot my password",
  createAcc: "Don't have an account? Create one",
  submitLogin: "Log In",


  //REGISTER
  registerTitle: "Create Account",
  nameRegister: "Full name",
  emailRegister: "Email",
  passwordRegister: "Password",
  submitRegister: "Sign Up",
  backToLogin: "Back to login",
  nickname: "Nickname / Username",
  createExist: "Never mind, I already have an account",

  //FORGOT PASSWORD
  forgotTitle: "Recover password",
  emailForgot: "Email",
  submitForgot: "Send link",

  //RESET PASSWORD
  resetTitle: "Reset password",
  newPassword: "New password",
  confirmPassword: "Confirm password",
  submitReset: "Reset password",

  //CONFIRMATION
  confirmTitle: "Thank you for registering!",
  confirmText: "You can click the link to sign up. Enjoy our app!",

  //traduction bottons of account&settings.ejs
    logout: "Log Out",
    change_password: "Change Password",

    //Validations for login.js
    errorCamposEmpty: "Complete all fields",
    errorLoginExist: "Error logging in",
    errorUserNotFound: "User does not exist",
    errorLoginPassW: "Incorrect password",
    tituloEmailNotVerified: "Email not verified",
    textEmailNotVerified: "This account has not been verified yet. Check your email to activate it. In the meantime, you will enter as a guest user.",
    confirmEmailNotVerified: "Understood",

    //Validations for olvidar.js
      requiredEmail: "Email required",
      writeEmail: "Please enter your email address",
      emailSent: "Email sent 📩",
      checkSpam: "Check your email to reset your password. If you don't see it, check the spam folder.",
      errorForgot: "An error occurred, please try again",
      noAccount: "There is no account with that email",

   //validation for password.js & register.js
      requireFilds: "Required fields",
      shortPassW: "Password too short",
      amountPassW: "Must be at least 6 characters",
      fillboth: "Fill in both fields",
      notMatch: "Do not match",
      notMatchPassW: "Passwords do not match",
      passUpdated: "Password updated 🔐",
      passProcessed: "You can now log in with your new password",
      passWCantBeChanged: "The password cannot be changed",
      linkExpired: "The link has expired",
      linkUnvalid: "The link is not valid",

      //validation for register.js
      requiredNickname: "Nickname required",
      enterNickname: "Please enter a nickname",
      shortNickname: "Nickname too short",
      nicknameMinChars: "Must be at least 3 characters",
      invalidEmail: "Invalid email",
      enterValidEmail: "Please enter a valid email",
      enterPassword: "Please enter a password",
      accCreated: "Account created 🎉",
      verifyEmailSent: "We sent you an email to verify your account",
      errorSignUp: "An error occurred during registration",
      AccAlreadyExists: "The account already exists",

      //Validation for google.js
      errorGoogleSignIn: "Could not sign in with Google",

      //validation for crear.js
      completeFields: "Please complete all fields",
      errorSave: "There was an error saving the note",
      savedNote: "Note saved successfully",
      ask: "What would you like to do now?",
      createAgain: "📝 Create another note",
      goList: "📋 Go to the list",

      //dark.js
      darkmodeEnabled: "Dark mode enabled 🌙",
      lightmodeEnabled: "Light mode enabled 🌞",

      //validation for editar.js
      notewasntFound: "Note not found",
      //denied: "Access denied",
      //noteNotNote: "This note does not belong to you",
      updatedNote: "Note updated ✔",
      updatedError: "Error updating 😞",
      askDelete: "Are you sure you want to delete?", //From here down search.js
      textAskDelete: "This action cannot be undone.",
      confirmDelete: "Yes, delete",
      cancelDelete: "Cancel",
      alreadyDeleted: "Deleted",
      errorDelete: "Could not delete",

      //validation linkconfirm.js
      textlinkUnvalid: "The verification link is not valid or has expired.",
      emailVerified: "Email verified ✅",
      textEmailVerified: "Your email has been successfully verified",
      errorlink: "The link is invalid or has already been used",

      //validation for search.js
      askEditNote: "Edit note?",
      textAskEditNote: "You will proceed to edit this note",
      confirmEditNote: "Yes, edit",
      cancelEditNote: "Cancel",
};

