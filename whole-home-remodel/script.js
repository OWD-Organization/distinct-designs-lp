/* =================================================================
   DISTINCT DESIGNS CONSTRUCTION: SITE INTERACTIONS
   Vanilla JS only. No dependencies.
   ================================================================= */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     Footer year
     --------------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------
     Sticky nav shadow/border on scroll
     --------------------------------------------------------------- */
  var siteNav = document.getElementById("site-nav");
  var stickyCta = document.getElementById("sticky-cta");
  var hero = document.querySelector(".hero");

  function handleScrollState() {
    var scrolled = window.scrollY > 12;
    if (siteNav) siteNav.classList.toggle("is-scrolled", scrolled);

    if (stickyCta && hero) {
      var heroBottom = hero.getBoundingClientRect().bottom;
      stickyCta.classList.toggle("is-visible", heroBottom < 0);
    }
  }

  window.addEventListener("scroll", handleScrollState, { passive: true });
  handleScrollState();

  /* ---------------------------------------------------------------
     Mobile nav toggle
     --------------------------------------------------------------- */
  var navToggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("site-nav__mobile");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
      mobileNav.classList.toggle("is-open", !isOpen);
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        mobileNav.classList.remove("is-open");
      });
    });
  }

  /* ---------------------------------------------------------------
     Scroll-triggered reveal animations
     --------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      // threshold 0 so elements taller than the viewport still trigger
      { threshold: 0, rootMargin: "0px 0px -80px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------------------------------------------
     FAQ accordion (multi-open, accessible)
     --------------------------------------------------------------- */
  var accordionTriggers = document.querySelectorAll(".accordion__trigger");

  accordionTriggers.forEach(function (trigger) {
    var panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;

    trigger.addEventListener("click", function () {
      var isOpen = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!isOpen));

      if (isOpen) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* ---------------------------------------------------------------
     Project lightbox
     Tiles are <button>s; clicking one opens the photograph in a native
     <dialog>. showModal() gives focus trapping, Esc-to-close and an inert
     background for free, so none of that is hand-rolled here.
     --------------------------------------------------------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxClose = document.getElementById("lightbox-close");
  var tiles = document.querySelectorAll(".project-tile");

  if (lightbox && lightboxImg && typeof lightbox.showModal === "function") {
    tiles.forEach(function (tile) {
      tile.addEventListener("click", function () {
        var img = tile.querySelector("img");
        var label = tile.querySelector(".project-tile__label");
        if (!img) return;

        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt;
        if (lightboxCaption) lightboxCaption.innerHTML = label ? label.innerHTML : "";
        lightbox.showModal();
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener("click", function () { lightbox.close(); });
    }

    // Click outside the figure closes it. The dialog fills the backdrop area,
    // so compare against the figure's box rather than the event target.
    lightbox.addEventListener("click", function (event) {
      var fig = lightbox.querySelector(".lightbox__figure");
      if (!fig) return;
      var r = fig.getBoundingClientRect();
      var inside = event.clientX >= r.left && event.clientX <= r.right &&
                   event.clientY >= r.top && event.clientY <= r.bottom;
      if (!inside && event.target !== lightboxClose) lightbox.close();
    });

    // Release the (potentially large) image once closed
    lightbox.addEventListener("close", function () {
      lightboxImg.removeAttribute("src");
      lightboxImg.alt = "";
    });
  } else if (lightbox) {
    // No <dialog> support: leave the tiles inert rather than half-working.
    tiles.forEach(function (tile) { tile.disabled = true; tile.style.cursor = "default"; });
  }

  /* ---------------------------------------------------------------
     Lead form handling: posts to a GoHighLevel inbound webhook
     --------------------------------------------------------------- */

  /* ------------------------------------------------------------------
     GoHighLevel inbound webhook, from the Workflow's Inbound Webhook
     trigger. The last path segment is the webhook id, which GHL only
     generates once the trigger has been saved: copying the URL before
     saving yields one ending in the literal "undefined", which silently
     accepts every POST and delivers none of them.

     Never verify this URL by its response. The endpoint answers
     {"status":"Success: test request received"} with HTTP 200 for ANY
     id, including ones that do not exist. The only real check is that
     the request shows up in GHL.
     ------------------------------------------------------------------ */
  var LEAD_WEBHOOK_URL =
    "https://services.leadconnectorhq.com/hooks/M0maz1S3Bhkgiw0ntdG7/webhook-trigger/odpteyVuzrrOynCMfVXw";

  /* Where a successful submit hands off. Root-relative, so it follows
     whatever domain the page is served from.

     NOTE for the GoHighLevel copies: this resolves against the GHL domain,
     so a /thank-you/ page has to exist there too, or this URL has to be
     changed to an absolute one before those pages go live. */
  var THANK_YOU_URL = "/thank-you/";

  var leadForm = document.getElementById("lead-form");
  var leadFormNote = document.getElementById("lead-form-note");

  if (leadForm && leadFormNote) {
    var submitBtn = leadForm.querySelector('button[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.textContent : "";

    // Which page and which A/B variant this lead came from. Read from the
    // document so this file stays identical across every page.
    var article = document.querySelector("article[id]");
    var pageId = article ? article.id : "unknown";
    var variant = document.querySelector(".hero--form") ? "hero-form" : "standard";

    leadForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!leadForm.checkValidity()) {
        leadFormNote.textContent = "Please complete all required fields before submitting.";
        leadForm.reportValidity();
        return;
      }

      // Bots fill every field they find; a real person never sees this one.
      var trap = leadForm.querySelector('input[name="company_website"]');
      if (trap && trap.value) return;

      var budget = leadForm.budget;
      var payload = {
        name: leadForm.name.value.trim(),
        email: leadForm.email.value.trim(),
        phone: leadForm.phone.value.trim(),
        budget: budget.options[budget.selectedIndex].text,
        budget_value: budget.value,
        message: leadForm.message.value.trim(),
        page: pageId,
        variant: variant,
        page_url: window.location.href,
        submitted_at: new Date().toISOString()
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }
      leadFormNote.textContent = "";

      fetch(LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);

          // Only the hero-form variants hand off to the thank-you page. The
          // standard pages keep their inline confirmation, because their form
          // sits at the foot of a long page that the visitor chose to read.
          // Branching on the variant at runtime, rather than shipping two
          // different files, keeps all six copies of this script identical.
          if (variant === "hero-form") {
            window.location.assign(THANK_YOU_URL);
            return;
          }

          leadFormNote.textContent =
            "Thank you. Nick's team will reach out within one business day.";
          leadForm.reset();
        })
        .catch(function () {
          // Keep what they typed: making someone retype a long message is the
          // fastest way to lose the lead.
          leadFormNote.textContent =
            "Something went wrong sending your message. Please call (760) 221-4290 and we will take care of it.";
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitLabel;
          }
        });
    });
  }
})();
