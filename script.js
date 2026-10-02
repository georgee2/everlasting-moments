/* ═══════════════════════════════════════════════════════════════
   EVERLASTING MOMENTS — Static Script
   Petals, countdown, RSVP, gallery lightbox, scroll reveals
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var WEDDING_DATE = new Date("2026-11-10T17:00:00").getTime();

  // ── Floating petals ──
  var petalsContainer = document.getElementById("petals");
  if (petalsContainer) {
    for (var i = 0; i < 14; i++) {
      var petal = document.createElement("span");
      petal.className = "petal";
      var left = (i * 37) % 100;
      var top = (i * 23) % 100;
      var size = 6 + (i % 4) * 3;
      var delay = (i % 7) * 1.1;
      petal.style.left = left + "%";
      petal.style.top = top + "%";
      petal.style.width = size + "px";
      petal.style.height = size + "px";
      petal.style.animationDelay = delay + "s";
      petalsContainer.appendChild(petal);
    }
  }

  // ── Open invitation ──
  var openBtn = document.getElementById("open-btn");
  var heroClosed = document.getElementById("hero-closed");
  var heroOpened = document.getElementById("hero-opened");
  var invitationBody = document.getElementById("invitation-body");

  if (openBtn) {
    openBtn.addEventListener("click", function () {
      heroClosed.classList.add("hidden");
      heroOpened.classList.remove("hidden");
      heroOpened.style.animation = "fade-in 1.4s ease-out";
      invitationBody.classList.remove("hidden");
      invitationBody.style.animation = "fade-in 1s ease-out";
      // Setup observers once content is visible
      setTimeout(setupObservers, 100);
    });
  }

  // ── Countdown ──
  function updateCountdown() {
    var ms = Math.max(0, WEDDING_DATE - Date.now());
    var s = Math.floor(ms / 1000);
    var days = Math.floor(s / 86400);
    var hours = Math.floor((s % 86400) / 3600);
    var minutes = Math.floor((s % 3600) / 60);
    var seconds = s % 60;

    var dEl = document.getElementById("cd-days");
    var hEl = document.getElementById("cd-hours");
    var mEl = document.getElementById("cd-minutes");
    var sEl = document.getElementById("cd-seconds");

    if (dEl) dEl.textContent = String(days).padStart(3, "0");
    if (hEl) hEl.textContent = String(hours).padStart(2, "0");
    if (mEl) mEl.textContent = String(minutes).padStart(2, "0");
    if (sEl) sEl.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ── Scroll reveal ──
  function setupObservers() {
    var reveals = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("revealed"); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -80px 0px" });

    reveals.forEach(function (el) { obs.observe(el); });
  }

  // ── RSVP ──
  var rsvpStatus = null;
  var rsvpExtra = document.getElementById("rsvp-extra");
  var rsvpSubmit = document.getElementById("rsvp-submit");
  var rsvpThanks = document.getElementById("rsvp-thanks");

  document.querySelectorAll(".rsvp-choice").forEach(function (btn) {
    btn.addEventListener("click", function () {
      rsvpStatus = btn.getAttribute("data-value");
      document.querySelectorAll(".rsvp-choice").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      if (rsvpExtra) {
        if (rsvpStatus === "accepted") rsvpExtra.classList.remove("hidden");
        else rsvpExtra.classList.add("hidden");
      }
      if (rsvpSubmit) rsvpSubmit.disabled = false;
    });
  });

  if (rsvpSubmit) {
    rsvpSubmit.addEventListener("click", function () {
      if (!rsvpStatus) return;
      var card = document.querySelector(".rsvp-card");
      // Hide form controls, show thanks
      card.querySelectorAll(".rsvp-buttons, .rsvp-choice, label, input, textarea, .rsvp-submit, .rsvp-extra").forEach(function (el) {
        el.style.display = "none";
      });
      if (rsvpThanks) rsvpThanks.classList.remove("hidden");
    });
  }

  // ── Gallery lightbox ──
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");

  document.querySelectorAll(".gallery-item img").forEach(function (img) {
    img.addEventListener("click", function () {
      if (lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightbox.classList.remove("hidden");
        lightbox.setAttribute("aria-hidden", "false");
      }
    });
  });

  if (lightbox) {
    lightbox.addEventListener("click", function () {
      lightbox.classList.add("hidden");
      lightbox.setAttribute("aria-hidden", "true");
    });
  }
})();
