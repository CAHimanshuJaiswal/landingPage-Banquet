// ====== CONFIG ======
// Paste your n8n webhook (Production) URL here.
const WEBHOOK_URL = "https://n8n.srv1413130.hstgr.cloud/webhook/66121f76-f08d-485c-8adb-1c53b00be649";

const form = document.getElementById("n8n-form");
const submitBtn = document.getElementById("submit-btn");
const formError = document.getElementById("form-error");

function getCookie(name) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

// Everything the browser lets JS know about this visit.
function collectRequestInfo() {
  const params = new URLSearchParams(location.search);
  const utm = {};
  params.forEach((v, k) => { if (k.startsWith("utm_")) utm[k] = v; });

  return {
    page_url: location.href,
    referrer: document.referrer || null,
    fbclid: params.get("fbclid"),
    utm: utm,
    fbp: getCookie("_fbp"),
    fbc: getCookie("_fbc"),
    user_agent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages ? Array.from(navigator.languages) : [],
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: { width: screen.width, height: screen.height, pixel_ratio: window.devicePixelRatio },
    viewport: { width: innerWidth, height: innerHeight },
    submitted_at: new Date().toISOString()
  };
}

// Headers the page knows/sets (the browser's real headers also reach n8n on their own).
function collectHeaders() {
  return {
    "User-Agent": navigator.userAgent,
    "Accept-Language": (navigator.languages || [navigator.language]).join(","),
    "Referer": location.href,
    "Content-Type": "application/json"
  };
}

function setError(input, show) {
  const msg = form.querySelector(".error-" + input.name);
  if (msg) msg.classList.toggle("error-show", show);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.style.display = "none";

  let valid = true;
  form.querySelectorAll("[required]").forEach((input) => {
    const bad = !input.value.trim();
    setError(input, bad);
    if (bad) valid = false;
  });
  if (!valid) return;

  const payload = {
    form: {
      event_date: form.event_date.value,
      phone_number: form.phone_number.value.trim(),
      name: form.name.value.trim() || null
    },
    headers: collectHeaders(),
    request: collectRequestInfo()
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    form.style.display = "none";
    document.getElementById("submitted-form").style.display = "block";
  } catch (err) {
    console.error("Submit failed:", err);
    formError.style.display = "block";
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
  }
});

// Clear the error as soon as the user types
form.querySelectorAll("[required]").forEach((input) => {
  input.addEventListener("input", () => setError(input, false));
});
