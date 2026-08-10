import { gifts } from "./gifts.js";

const config = window.APP_CONFIG || {};
const list = document.querySelector("#gift-list");
const counter = document.querySelector("#counter");
const emptyState = document.querySelector("#empty-state");

const dialog = document.querySelector("#reserve-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector("#dialog-description");
const dialogStatus = document.querySelector("#dialog-status");
const reserveForm = document.querySelector("#reserve-form");
const confirmButton = document.querySelector("#confirm-button");
const cancelButton = document.querySelector("#cancel-button");
const closeButton = document.querySelector("#dialog-close");

let selectedGift = null;
let reservedIds = new Set();

function supabaseReady() {
  return Boolean(
    config.supabaseUrl &&
    config.supabaseAnonKey &&
    !config.supabaseUrl.includes("DEIN-PROJEKT")
  );
}

async function callReservationFunction(action, giftId) {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/rpc/reserve_gift`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": config.supabaseAnonKey,
      "Authorization": `Bearer ${config.supabaseAnonKey}`
    },
    body: JSON.stringify({
      p_gift_id: giftId,
      p_action: action
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Die Anfrage konnte nicht verarbeitet werden.");
  }

  return response.json();
}

async function loadReservations() {
  if (!supabaseReady()) return;

  try {
    const response = await fetch(
      `${config.supabaseUrl}/rest/v1/gift_reservations?select=gift_id`,
      {
        headers: {
          "apikey": config.supabaseAnonKey,
          "Authorization": `Bearer ${config.supabaseAnonKey}`
        }
      }
    );

    if (!response.ok) throw new Error("Reservierungen konnten nicht geladen werden.");

    const rows = await response.json();
    reservedIds = new Set(rows.map(row => row.gift_id));
  } catch (error) {
    console.error(error);
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  list.innerHTML = "";
  emptyState.hidden = gifts.length > 0;

  const count = gifts.length;
  counter.textContent = `${count} ${count === 1 ? "Wunsch" : "Wünsche"}`;

  for (const gift of gifts) {
    const reserved = reservedIds.has(gift.id);
    const card = document.createElement("article");
    card.className = `gift-card${reserved ? " is-reserved" : ""}`;

    const imageHtml = gift.image
      ? `<img src="${escapeHtml(gift.image)}" alt="" loading="lazy">`
      : `<span aria-hidden="true">✦</span>`;

    const shopButton = gift.url
      ? `<a class="button button-secondary" href="${escapeHtml(gift.url)}" target="_blank" rel="noopener noreferrer">Zum Wunsch ↗</a>`
      : "";

    const reserveButton = reserved
      ? `<button class="button button-primary" type="button" disabled>Bereits vergeben</button>`
      : `<button class="button button-primary reserve-button" type="button" data-id="${escapeHtml(gift.id)}">Das schenke ich dir ✦</button>`;

    card.innerHTML = `
      <div class="gift-image">${imageHtml}</div>
      <div class="gift-content">
        <h3 class="gift-title">${escapeHtml(gift.title)}</h3>
        ${gift.price ? `<div class="gift-meta">${escapeHtml(gift.price)}</div>` : ""}
        ${gift.description ? `<p class="gift-note">${escapeHtml(gift.description)}</p>` : ""}
        ${reserved ? `<div class="reserved-badge"><span class="lock">✓</span> Bereits von jemandem übernommen</div>` : ""}
        <div class="gift-actions">
          ${shopButton}
          ${reserveButton}
        </div>
      </div>
    `;

    list.appendChild(card);
  }

  document.querySelectorAll(".reserve-button").forEach(button => {
    button.addEventListener("click", () => openReserveDialog(button.dataset.id));
  });
}

function openReserveDialog(giftId) {
  selectedGift = gifts.find(gift => gift.id === giftId);
  if (!selectedGift) return;

  dialogTitle.textContent = selectedGift.title;
  dialogDescription.textContent =
    "Wenn du dieses Geschenk übernehmen möchtest, kannst du es hier anonym vormerken. " +
    "Dein Name wird nicht abgefragt und niemand sieht, wer es reserviert hat.";
  dialogStatus.textContent = "";
  dialogStatus.className = "dialog-status";
  confirmButton.disabled = false;
  confirmButton.textContent = "Das schenke ich dir ✦";

  dialog.showModal();
}

function closeDialog() {
  if (dialog.open) dialog.close();
  selectedGift = null;
}

reserveForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedGift) return;

  if (!supabaseReady()) {
    dialogStatus.textContent =
      "Die Reservierung ist noch nicht eingerichtet. Bitte zuerst Supabase konfigurieren.";
    dialogStatus.className = "dialog-status error";
    return;
  }

  confirmButton.disabled = true;
  confirmButton.textContent = "Einen Moment …";
  dialogStatus.textContent = "";

  try {
    const result = await callReservationFunction("reserve", selectedGift.id);

    if (result?.status === "already_reserved") {
      reservedIds.add(selectedGift.id);
      render();
      dialogStatus.textContent = "Dieses Geschenk wurde gerade schon von jemand anderem übernommen.";
      dialogStatus.className = "dialog-status error";
      confirmButton.textContent = "Schon vergeben";
      return;
    }

    reservedIds.add(selectedGift.id);
    render();
    dialogStatus.textContent = "Perfekt – das Geschenk ist anonym für dich vorgemerkt. 💙";
    dialogStatus.className = "dialog-status success";
    confirmButton.textContent = "Geschenk übernommen ✓";
  } catch (error) {
    console.error(error);
    dialogStatus.textContent =
      "Leider hat etwas nicht funktioniert. Bitte versuche es gleich noch einmal.";
    dialogStatus.className = "dialog-status error";
    confirmButton.disabled = false;
    confirmButton.textContent = "Nochmal versuchen";
  }
});

cancelButton.addEventListener("click", closeDialog);
closeButton.addEventListener("click", closeDialog);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeDialog();
});

async function init() {
  await loadReservations();
  render();
}

init();
