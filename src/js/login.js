// src/js/login.js
import Swal from "sweetalert2";
import {
  signInWithGoogle,
  signInWithEmail,
  sendPasswordReset
} from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById('login-form');
  const googleBtn = document.getElementById('google-btn');
  const forgotBtn = document.getElementById('forgot-btn');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    try {
      await signInWithEmail(email, pass);
      window.location.href = '/notes';
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  });

  googleBtn.addEventListener('click', async () => {
    try {
      await signInWithGoogle();
      window.location.href = '/notes';
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  });

  forgotBtn.addEventListener('click', async () => {
    const { value: email } = await Swal.fire({
      title: 'Restablecer contraseña',
      input: 'email',
      inputLabel: 'Ingresa tu correo',
      showCancelButton: true
    });

    if (!email) return;

    try {
      await sendPasswordReset(email);
      Swal.fire('Listo', 'Revisa tu correo', 'success');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  });

});
