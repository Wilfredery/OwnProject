// src/js/linkconfirm.js
import Swal from "sweetalert2";
import { auth } from "./firebase.js";
import { applyActionCode } from "firebase/auth";

const confirmTitle = document.querySelector(".confirm__title");

if (confirmTitle) {
  const oobCode = window.__OOB_CODE__;

  if (!oobCode) {
    Swal.fire({
      icon: "error",
      title: "Enlace inválido",
      text: "El enlace de verificación no es válido o ha expirado.",
      customClass: { popup: "minimal-alert" },
    });
  } else {
    (async () => {
      try {
        await applyActionCode(auth, oobCode);

        Swal.fire({
          icon: "success",
          title: "Correo verificado ✅",
          text: "Tu correo ha sido verificado correctamente",
          timer: 4000,
          showConfirmButton: false,
          customClass: { popup: "minimal-alert" },
        });

        setTimeout(() => {
          window.location.href = "/";
        }, 4000);
      } catch (error) {
        console.error(error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "El enlace es inválido o ya fue utilizado.",
          customClass: { popup: "minimal-alert" },
        });
      }
    })();
  }
}
