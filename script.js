/*
  CONFIGURATION GOOGLE SHEETS
  Collez ici l'URL de votre application Web Apps Script après le déploiement.
  Exemple : https://script.google.com/macros/s/AKfy.../exec
*/
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby7HQAm79YPl45uGqL-_t8xgVIa-w4wjCLFJkOUtBT3GsDIzLd27SG_mDXbXzLlY1HS/exec";

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
document.getElementById("year").textContent = new Date().getFullYear();

function showSection(index) {
  currentSection = index;
  sections.forEach((section, i) => section.classList.toggle("active", i === index));
  prevBtn.disabled = index === 0;
  nextBtn.classList.toggle("hidden", index === sections.length - 1);
  submitBtn.classList.toggle("hidden", index !== sections.length - 1);
  progressText.textContent = `Partie ${index + 1} sur ${sections.length}`;
  const percent = Math.round(((index + 1) / sections.length) * 100);
  progressPercent.textContent = `${percent} %`;
  progressBar.style.width = `${percent}%`;
  errorMessage.classList.add("hidden");
  document.querySelector(".progress-wrap").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function validateCurrentSection() {
  errorMessage.classList.add("hidden");
  const visibleSection = sections[currentSection];
  const requiredFields = [...visibleSection.querySelectorAll("[required]")];
  for (const field of requiredFields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }
  // Ces deux groupes doivent chacun contenir au moins une réponse.
  if (currentSection === 1) {
    const groups = ["Difficultés", "Domaines souhaités"];
    for (const group of groups) {
      if (!visibleSection.querySelector(`input[name="${group}"]:checked`)) {
        errorMessage.textContent = group === "Difficultés"
          ? "Choisissez au moins une difficulté."
          : "Choisissez au moins un domaine dans lequel vous souhaitez progresser.";
        errorMessage.classList.remove("hidden");
        return false;
      }
    }
  }
  return true;
}

nextBtn.addEventListener("click", () => {
  if (validateCurrentSection()) showSection(Math.min(currentSection + 1, sections.length - 1));
});
prevBtn.addEventListener("click", () => showSection(Math.max(currentSection - 1, 0)));

contactSelect.addEventListener("change", () => {
  contactFields.classList.toggle("hidden", contactSelect.value !== "Oui");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateCurrentSection()) return;

  if (!GOOGLE_SCRIPT_URL.startsWith("https://script.google.com/macros/s/") ||
      !GOOGLE_SCRIPT_URL.endsWith("/exec")) {
    errorMessage.textContent = "Le formulaire n'est pas encore configuré. Collez l'URL de l'application Web Apps Script dans la variable GOOGLE_SCRIPT_URL de script.js.";
    errorMessage.classList.remove("hidden");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Envoi en cours…";
  errorMessage.classList.add("hidden");

  const payload = {};
  for (const [key, value] of new FormData(form).entries()) {
    if (key === "Consentement de contact" && contactSelect.value !== "Oui") continue;
    if (["Nom", "E-mail", "Téléphone de contact supplémentaire", "Consentement de contact"].includes(key) &&
        contactSelect.value !== "Oui") continue;
    if (["Nom", "E-mail", "Téléphone de contact supplémentaire"].includes(key) &&
        contactSelect.value === "Oui" && !document.getElementById("consent").checked) continue;

    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      if (!Array.isArray(payload[key])) payload[key] = [payload[key]];
      payload[key].push(value);
    } else {
      payload[key] = value;
    }
  }

  payload["Date de réponse"] = new Date().toISOString();
  payload["Source"] = "Formulaire ANA";

  try {
    /*
      Apps Script ne permet pas toujours de lire sa réponse depuis un site
      hébergé sur une autre origine. Le mode no-cors évite le blocage CORS,
      mais le navigateur ne peut pas confirmer le résultat du script.
      Après un test, vérifiez qu'une nouvelle ligne apparaît dans Sheets.
    */
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    form.reset();
    form.querySelectorAll("input, select, textarea").forEach(el => el.disabled = true);
    sections.forEach(section => section.classList.remove("active"));
    actions.classList.add("hidden");
    document.querySelector(".progress-wrap").classList.add("hidden");
    successMessage.querySelector("p").textContent =
      "Merci ! La demande d'envoi a été transmise.";
    successMessage.classList.remove("hidden");
    successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    errorMessage.textContent = "Impossible de transmettre les réponses. Vérifiez votre connexion et réessayez.";
    errorMessage.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Envoyer mes réponses";
  }
});

showSection(0);
