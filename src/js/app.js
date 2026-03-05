/* ==========================================================
   (Frontend Application Entry Point)
   ==========================================================

   Description:
   Central entry file responsible for loading and initializing
   all frontend modules of the application.

   This file imports each feature module so that they are
   bundled together and executed when the application starts.

   Architecture:
   - Modular ES6 structure
   - Feature-based file organization
   - Side-effect imports for automatic initialization
   - Bundled using Webpack

   Responsibilities:
   - Initialize authentication system (login, register, Google)
   - Manage authentication state handling
   - Load UI interaction modules (header, menu, theme, language)
   - Enable search functionality
   - Handle CRUD operations (create, edit)
   - Manage account & settings features
   - Handle password recovery and confirmation flows

   Notes:
   - This file does not contain direct business logic.
   - Each imported module encapsulates its own logic.
   - Execution order may matter when modules depend on
     Firebase initialization or authentication state.

   ========================================================== */

import './lang-auto.js';
import './header.js';
import './auth.js';
import './authState.js';
import './login.js';
import './firebase.js';
import './auth-ui.js';
import './register.js';
import './google.js';
import './main.js';
import './menuHamburguesa.js';
import './theme&lang.js';
import './search.js';
import './acc&sett.js';
import './dark.js';
import './crear.js';
import './editar.js';
import './password.js';
import './olvidar.js';
import './linkconfirm.js';