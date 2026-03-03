import Swal from "sweetalert2";
import { signInWithGoogle, createOrUpdateUserDoc } from "./auth.js";
import { auth } from "./firebase.js";
import { t } from "./i18n/index.js";

document.addEventListener("DOMContentLoaded", () => {
  const googleBtn = document.getElementById("google-btn");
  if (!googleBtn) return;

  let isSigning = false;

  googleBtn.addEventListener("click", async () => {
    if (isSigning) return;
    isSigning = true;

    try {
      const result = await signInWithGoogle();
      const user = result.user;

      const email =
      user.email ||
      result._tokenResponse?.email ||
      user.providerData?.[0]?.email ||
      "Correo no disponible";

      const confirm = await Swal.fire({
        title: "Confirmar cuenta",
        html: `
          <p>Vas a iniciar sesión con:</p>
          <strong>${email}</strong>
        `,
        icon: "question",
        showCancelButton: true,
        showDenyButton: true,
        denyButtonText: t("cancel"),
        confirmButtonText: "Continuar",
        cancelButtonText: "Cambiar cuenta",
        customClass: { popup: "minimal-alert" }
      });

      if (!confirm.isConfirmed) {
        await auth.signOut(); // cancelamos sesión limpia
        isSigning = false;
        return;
      }

      // ✅ Ahora sí hacemos side effects
      await createOrUpdateUserDoc(user);
      localStorage.removeItem("guest_session");

      window.location.href = "/";

    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: t("errorGoogleSignIn"),
        icon: "error",
        customClass: { popup: "minimal-alert" }
      });
      isSigning = false;
    }
  });
});