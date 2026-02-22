/**
 * @file toast.js
 * @description Hanterar In-App Toasts (små notifikationsrutor) som fall-back 
 * eller komplement till systemets Push-notiser.
 */

/**
 * Visar en toast-notis i övre högra hörnet.
 * @param {string} title - Rubriken på notisen.
 * @param {string} body - Brödtext/Meddelande.
 * @param {number} [duration=4000] - Hur länge notisen ska visas i ms.
 */
export function showToast(title, body, duration = 4000) {
    const container = document.getElementById("toast-container");
    if (!container) {
        console.warn("Lianer: #toast-container saknas i index.html");
        return;
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    const titleEl = document.createElement("div");
    titleEl.className = "toast-title";
    titleEl.textContent = title;

    const bodyEl = document.createElement("div");
    bodyEl.className = "toast-body";
    bodyEl.textContent = body;

    toast.append(titleEl, bodyEl);
    container.append(toast);

    // Trigger animation next frame
    requestAnimationFrame(() => {
        toast.classList.add("toast-visible");
    });

    // Remove after duration
    setTimeout(() => {
        toast.classList.remove("toast-visible");
        // Wait for transition to finish
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

/**
 * Skickar en riktig Push Notis via Service Worker om tillåtet.
 * Om webbläsaren blockerar (t.ex. pga lokal server) så visas istället en In-App Toast.
 * 
 * @param {string} title 
 * @param {string} body 
 */
export async function sendPushNotification(title, body) {
    // Alltid visa In-App Toast för säkerhets skull oavsett Push-status
    showToast(title, body);

    // 1. Om inte notiser är tillåtna, stanna här.
    if (!("Notification" in window) || Notification.permission !== "granted") {
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
            await registration.showNotification(title, {
                body: body,
                icon: "/icons/icon-192.png",
                badge: "/icons/icon-192.png",
                vibrate: [100, 50, 100]
            });
        } else {
            // Service worker saknar Push-stöd
            throw new Error("No SW Push support");
        }
    } catch (err) {
        // Fallback: Webbläsare (ofta Chrome på HTTP) blockerade native push.
        // Då visar vi vår snygga UI-Toast istället så användaren ändå får infon!
        console.warn("Lianer: Native Push misslyckades/blockerades, använder Toast istället.", err);
        showToast(title, body);
    }
}
