/**
 * description:
 * Handles user authentication via Google OAuth using Firebase.
 * Ensures proper confirmation of the selected account before proceeding.
 * Supports guest session cleanup and user document creation/updating.
 *
 * Responsibilities:
 * 1. Attach click listener to Google sign-in button.
 * 2. Prevent multiple sign-in attempts simultaneously.
 * 3. Trigger Firebase Google sign-in.
 * 4. Show a confirmation modal with the detected email.
 * 5. Allow the user to cancel, switch accounts, or continue.
 * 6. Create or update the user document in Firestore after confirmation.
 * 7. Clean up any guest session stored in localStorage.
 * 8. Redirect the user to the home page on successful login.
 * 9. Handle and display errors using SweetAlert2 with proper localization.
 *
 * Dependencies:
 * - SweetAlert2 for modal dialogs (Swal)
 * - auth.js (signInWithGoogle, createOrUpdateUserDoc)
 * - firebase.js (auth)
 * - i18n/index.js for translations (t)
 *
 * Notes:
 * - Uses `isSigning` flag to prevent double submission.
 * - Supports fallback for email retrieval from multiple sources.
 * - All UI text is localized using `t()` for i18n support.
 */

import Swal from "sweetalert2";
import { signInWithGoogle, createOrUpdateUserDoc } from "./auth.js";
import { auth } from "./firebase.js";
import { t } from "./i18n/index.js";

document.addEventListener("DOMContentLoaded", () => {
  const googleBtn = document.getElementById("google-btn");
  if (!googleBtn) return;

  let isSigning = false; // 🔐 Prevent double sign-in

  // Function to handle Google login flow
  const handleGoogleLogin = async () => {
    if (isSigning) return;
    isSigning = true;

    try {
      // Trigger Google OAuth sign-in
      const result = await signInWithGoogle();
      const user = result.user;

      // Retrieve user's email safely with fallbacks
      const email =
        user.email ||
        result._tokenResponse?.email ||
        user.providerData?.[0]?.email ||
        t("emailUnable");

      // Ask user to confirm selected email/account
      const confirm = await Swal.fire({
        title: t("confirmAcc"),
        html: `
          <p>${t("infoSelectAcc")}</p>
          <strong>${email}</strong>
        `,
        icon: "question",
        showCancelButton: true,
        showDenyButton: true,
        denyButtonText: t("cancel"),
        confirmButtonText: t("continue"),
        cancelButtonText: t("changeAcc"), // 🔁 Change account
        customClass: { popup: "minimal-alert" }
      });

      // User clicked "Change Account"
      if (confirm.isDismissed && confirm.dismiss === Swal.DismissReason.cancel) {
        await auth.signOut(); // clean up previous session
        isSigning = false;

        // 🔄 Call login again to trigger Google account selector
        handleGoogleLogin();
        return;
      }

      // User canceled completely
      if (confirm.isDenied) {
        await auth.signOut();
        isSigning = false;
        return;
      }

      // ✅ Create or update user document in Firestore
      await createOrUpdateUserDoc(user);

      // Remove guest session if exists
      localStorage.removeItem("guest_session");

      // Redirect to home
      window.location.href = "/";

    } catch (err) {
      // console.error(err);

      // Show error message
      Swal.fire({
        title: "Error",
        text: t("errorGoogleSignIn"),
        icon: "error",
        customClass: { popup: "minimal-alert" }
      });

      isSigning = false;
    }
  };

  // Attach click event to the button
  googleBtn.addEventListener("click", handleGoogleLogin);
});