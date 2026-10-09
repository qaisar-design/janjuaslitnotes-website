/* ==========================================================================
   Janjua's English Lit Notes — shared site JavaScript
   Based on the house business-website-builder main.js.
   Handles: Amazon buy links (one place per book, below), sticky header,
   mobile menu, scroll-reveal, email forms, page-preview lightbox,
   and the "Report an error in this book" shortcut.
   No dependencies. Works on every page.
   ========================================================================== */

/* ==========================================================================
   AMAZON LINKS  —  THE ONE PLACE TO SWITCH EACH BOOK TO "BUY ON AMAZON"
   --------------------------------------------------------------------------
   While a link is "" the site shows "Coming soon on Amazon" and the
   "Tell me when it is out" form. Paste the full Amazon product page URL
   between the quotes and every buy box and status label for that book,
   on every page, switches to real "Buy on Amazon" buttons.
   ========================================================================== */
var AMAZON = {
  "general-prologue": {          /* The General Prologue: Exam Edition */
    paperback: "",               /* e.g. "https://www.amazon.com/dp/XXXXXXXXXX" */
    kindle:    ""
  },
  "hamlet": {                    /* Hamlet: Exam Edition */
    paperback: "",
    kindle:    ""
  },
  "macbeth": {                   /* Macbeth: Exam Edition */
    paperback: "",
    kindle:    ""
  }
};
/* ======================= end of AMAZON LINKS ============================ */

(function () {
  "use strict";

  /* ---- 1. Amazon buy boxes + status labels ---- */
  function isLive(book) {
    var c = AMAZON[book];
    return !!(c && (c.paperback || c.kindle));
  }
  document.querySelectorAll(".buy[data-book]").forEach(function (box) {
    var book = box.getAttribute("data-book");
    var c = AMAZON[book];
    if (!isLive(book)) return;
    box.querySelectorAll("a[data-format]").forEach(function (a) {
      var url = c[a.getAttribute("data-format")];
      if (url) { a.href = url; a.hidden = false; } else { a.hidden = true; }
    });
    box.classList.add("is-live");
  });
  document.querySelectorAll("[data-status]").forEach(function (el) {
    if (isLive(el.getAttribute("data-status"))) {
      el.textContent = "Available on Amazon";
      el.classList.add("live");
    }
  });

  /* ---- 2. Sticky header shadow on scroll ---- */
  var head = document.querySelector("header");
  if (head) {
    var onScroll = function () { head.classList.toggle("scrolled", window.scrollY > 10); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- 3. Mobile menu ---- */
  var hb = document.getElementById("hb");
  var mm = document.getElementById("mm");
  function closeMenu() {
    if (mm) mm.classList.remove("open");
    if (hb) { hb.classList.remove("open"); hb.setAttribute("aria-expanded", "false"); }
  }
  window.closeMenu = closeMenu;
  if (hb && mm) {
    hb.addEventListener("click", function () {
      var open = !mm.classList.contains("open");
      mm.classList.toggle("open", open);
      hb.classList.toggle("open", open);
      hb.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) { var first = mm.querySelector("a"); if (first) setTimeout(function () { first.focus(); }, 60); }
    });
    mm.addEventListener("click", function (e) { if (e.target === mm || e.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mm.classList.contains("open")) { closeMenu(); hb.focus(); }
    });
  }

  /* ---- 4. Scroll-reveal animations ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) {
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = (Math.min(sib, 5) * 60) + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- 5. Forms: email, no outside service ----
     Each form's action is "mailto:<the author's address>". On submit this
     writes the visitor's answers into an email (subject from the form's
     data-subject, where {name} is replaced by that field's value) and opens
     the visitor's own email app; the visitor presses Send there. Nothing is
     sent to any server. Without JavaScript the browser's own mailto form
     handling is the fallback. See README, "Forms". */
  window.handleForm = function (e) {
    e.preventDefault();
    var form = e.target;
    var to = (form.getAttribute("action") || "").replace(/^mailto:/i, "");
    var vals = {}, parts = [];
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === "submit") return;
      var v = (el.value || "").trim();
      vals[el.name] = v;
      if (!v) return;
      var lab = el.id ? form.querySelector('label[for="' + el.id + '"]') : null;
      var name = lab ? lab.firstChild.textContent.trim() : el.name;
      parts.push(el.tagName === "TEXTAREA" ? name + ":\n" + v : name + ": " + v);
    });
    var subject = (form.getAttribute("data-subject") || "Message from janjuaslitnotes.com")
      .replace(/\{(\w+)\}/g, function (m, k) { return vals[k] || ""; });
    var href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) +
               "&body=" + encodeURIComponent(parts.join("\n\n") + "\n");
    form.setAttribute("data-mailto", href);
    var st = form.querySelector(".form-status");
    if (st) {
      st.innerHTML = "<b>Your email app should now be open with this written out. Press Send there.</b> " +
        "If nothing opened, copy what you wrote and send it to <a href=\"mailto:" + to + "\">" + to + "</a>.";
      st.hidden = false;
    }
    window.location.href = href;
    return false;
  };

  /* ---- 6. Page-preview lightbox ---- */
  var lb = document.getElementById("lb");
  if (lb && typeof lb.showModal === "function") {
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("p");
    document.addEventListener("click", function (e) {
      var b = e.target.closest(".pv button");
      if (!b) return;
      var img = b.querySelector("img");
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = b.getAttribute("data-caption") || "";
      lb.showModal();
    });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.closest(".lb-close")) lb.close(); });
  }

  /* ---- 7. "Report an error in this book" -> preselect the book in the form ---- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-report]");
    if (!a) return;
    var sel = document.getElementById("rep-book");
    if (sel) sel.value = a.getAttribute("data-report");
  });
})();
