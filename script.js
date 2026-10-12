
/*
 * ANA Mentorat Informatique
 * Envoi du questionnaire vers Google Sheets
 *
 * Remplace cette valeur par l'URL réelle de ton application Web Apps Script.
 */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwwTzE3ubVfU-dZusrYaFDKsh65U_r6uqTF--LBAJD_AKluCaPdqBfhJ8lsjzUCcLRB/exec";

const form = document.getElementById("survey-form");
const sections = [...document.querySelectorAll(".form-section")];

const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const submitBtn = document.getElementById("submit-btn");

const progressText = document.getElementById("progress-text");
const progressPercent = document.getElementById("progress-percent");
const progressBar = document.getElementById("progress-bar");

const errorMessage = document.getElementById("error-message");
const successMessage = document.getElementById("success-message");
const actions = document.getElementById("form-actions");

const contactSelect = document.getElementById("contact");
const contactFields = document.getElementById("contact-fields");

let currentSection = 0;

document.getElementById("year").textContent =
  new Date().getFullYear();

// Afficher une partie du questionnaire.
function showSection(index) {
  currentSection = index;

  sections.forEach((section, i) => {
    section.classList.toggle("active", i === index);
  });

  prevBtn.disabled = index === 0;
  nextBtn.classList.toggle("hidden", index === sections.length - 1);
  submitBtn.classList.toggle("hidden", index !== sections.length - 1);

  progressText.textContent =
    `Partie ${index + 1} sur ${sections.length}`;

  const percent = Math.round(
    ((index + 1) / sections.length) * 100
  );

  progressPercent.textContent = `${percent} %`;
  progressBar.style.width = `${percent}%`;

  errorMessage.classList.add("hidden");

  document.querySelector(".progress-wrap").scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

// Vérifier les champs obligatoires de la partie active.
function validateCurrentSection() {
  errorMessage.classList.add("hidden");

  const visibleSection = sections[currentSection];
  const requiredFields = [
    ...visibleSection.querySelectorAll("[required]")
  ];

  for (const field of requiredFields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }

  // Ces deux groupes doivent contenir au moins une réponse.
  if (currentSection === 1) {
    const groups = ["Difficultés", "Domaines souhaités"];

    for (const group of groups) {
      const selected = visibleSection.querySelector(
        `input[name="${group}"]:checked`
      );

      if (!selected) {
        errorMessage.textContent =
          group === "Difficultés"
            ? "Choisissez au moins une difficulté."
            : "Choisissez au moins un domaine dans lequel vous souhaitez progresser.";

        errorMessage.classList.remove("hidden");
        return false;
      }
    }
  }

  return true;
}

// Navigation entre les parties.
nextBtn.addEventListener("click", () => {
  if (validateCurrentSection()) {
    showSection(
      Math.min(currentSection + 1, sections.length - 1)
    );
  }
});

prevBtn.addEventListener("click", () => {
  showSection(Math.max(currentSection - 1, 0));
});

// Afficher ou masquer les coordonnées de contact.
contactSelect.addEventListener("change", () => {
  contactFields.classList.toggle(
    "hidden",
    contactSelect.value !== "Oui"
  );
});

// Préparer les réponses du formulaire.
function buildPayload() {
  const payload = {};

  for (const [key, value] of new FormData(form).entries()) {
    // Les coordonnées ne sont envoyées que si la personne
    // souhaite être contactée.
    if (
      [
        "Nom",
        "E-mail",
        "Téléphone de contact supplémentaire",
        "Consentement de contact"
      ].includes(key) &&
      contactSelect.value !== "Oui"
    ) {
      continue;
    }

    // Sans consentement de contact, ne pas transmettre
    // les coordonnées facultatives.
    if (
      [
        "Nom",
        "E-mail",
        "Téléphone de contact supplémentaire"
      ].includes(key) &&
      !document.getElementById("consent").checked
    ) {
      continue;
    }

    // Regrouper les cases à choix multiples.
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      if (!Array.isArray(payload[key])) {
        payload[key] = [payload[key]];
      }

      payload[key].push(value);
    } else {
      payload[key] = value;
    }
  }

  payload["Date de réponse"] = new Date().toISOString();
  payload["Source"] = "Formulaire ANA";

  return payload;
}

// Envoi des réponses.
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateCurrentSection()) {
    return;
  }

  if (
    !GOOGLE_SCRIPT_URL.startsWith(
      "https://script.google.com/macros/s/"
    ) ||
    !GOOGLE_SCRIPT_URL.endsWith("/exec")
  ) {
    errorMessage.textContent =
      "Configuration manquante : ajoute l'URL de ton application Web Apps Script dans script.js.";

    errorMessage.classList.remove("hidden");
    return;
  }

  submitBtn.disabled = true;
  prevBtn.disabled = true;
  nextBtn.disabled = true;
  submitBtn.textContent = "Envoi en cours…";
  errorMessage.classList.add("hidden");

  const payload = buildPayload();

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    // IMPORTANT :
    // En mode no-cors, le navigateur ne peut pas lire la réponse
    // d'Apps Script. On ne peut donc pas confirmer l'écriture
    // dans Google Sheets depuis cette requête.

    form.reset();

    form.querySelectorAll("input, select, textarea").forEach((el) => {
      el.disabled = true;
    });

    sections.forEach((section) => {
      section.classList.remove("active");
    });

    actions.classList.add("hidden");
    document.querySelector(".progress-wrap").classList.add("hidden");

    contactFields.classList.add("hidden");

    successMessage.querySelector("p").textContent =
      "La demande d'envoi a été transmise.";

    successMessage.classList.remove("hidden");

    successMessage.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  } catch (error) {
    console.error("Erreur lors de l'envoi :", error);

    errorMessage.textContent =
      "Impossible de transmettre les réponses. Vérifiez votre connexion et réessayez.";

    errorMessage.classList.remove("hidden");

  } finally {
    submitBtn.disabled = false;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    submitBtn.textContent = "Envoyer mes réponses";
  }
});

// Initialiser le questionnaire.
showSection(0);