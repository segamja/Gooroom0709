(function () {
  "use strict";

  var LANG_KEY = "pixel-grug-lang";
  var THEME_KEY = "pixel-grug-theme";
  var i18n = window.PixelGrugI18n;

  var currentLang = "ko";
  var currentTheme = "light";
  var friends = [];
  var idx = 0;
  var menuOpen = false;

  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  var nav = document.getElementById("nav");
  var langSwitch = document.getElementById("langSwitch");
  var themeToggle = document.getElementById("themeToggle");
  var dailyImg = document.getElementById("dailyImg");
  var dailyName = document.getElementById("dailyName");
  var dailyQuote = document.getElementById("dailyQuote");
  var shuffleBtn = document.getElementById("shuffleBtn");
  var metaDescription = document.getElementById("metaDescription");

  function t(key) {
    return i18n.get(i18n.LOCALES[currentLang], key);
  }

  function applyLocale(lang) {
    if (!i18n.LOCALES[lang]) return;
    currentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var value = t(key);
      if (value == null) return;
      if (el.hasAttribute("data-i18n-html")) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts.length !== 2) return;
        var attr = parts[0].trim();
        var key = parts[1].trim();
        var value = t(key);
        if (value != null) el.setAttribute(attr, value);
      });
    });

    document.title = t("meta.title");
    if (metaDescription) metaDescription.setAttribute("content", t("meta.description"));

    if (langSwitch) {
      langSwitch.querySelectorAll("[data-lang]").forEach(function (btn) {
        var active = btn.getAttribute("data-lang") === lang;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-current", active ? "true" : "false");
      });
    }

    friends = i18n.LOCALES[lang].dailyFriends.slice();
    updateDailyFriend(false);
    updateNavToggleLabel();
    updateThemeToggleLabel();

    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) { /* ignore */ }
  }

  function applyTheme(theme) {
    currentTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    if (themeToggle) {
      themeToggle.classList.toggle("is-dark", currentTheme === "dark");
    }
    updateThemeToggleLabel();
    try {
      localStorage.setItem(THEME_KEY, currentTheme);
    } catch (e) { /* ignore */ }
  }

  function updateThemeToggleLabel() {
    if (!themeToggle) return;
    var key = currentTheme === "dark" ? "a11y.themeToLight" : "a11y.themeToDark";
    themeToggle.setAttribute("aria-label", t(key));
  }

  function updateNavToggleLabel() {
    if (!toggle) return;
    var key = menuOpen ? "a11y.menuClose" : "a11y.menuOpen";
    toggle.setAttribute("aria-label", t(key));
  }

  function updateDailyFriend(animate) {
    if (!dailyImg || !dailyName || !dailyQuote || !friends.length) return;
    var f = friends[idx];

    function setContent() {
      dailyImg.src = f.img;
      dailyImg.alt = t("hero.dailyAltPrefix") + f.alt;
      dailyName.textContent = f.name;
      dailyQuote.textContent = f.quote;
      if (animate) {
        dailyImg.style.opacity = "1";
        dailyImg.style.transform = "scale(1)";
      }
    }

    if (animate) {
      dailyImg.style.opacity = "0";
      dailyImg.style.transform = "scale(0.92)";
      window.setTimeout(setContent, 220);
    } else {
      setContent();
    }
  }

  function preloadFriends() {
    i18n.LOCALES.ko.dailyFriends.forEach(function (f) {
      var im = new Image();
      im.src = f.img;
    });
  }

  /* ===== Mobile menu toggle ===== */
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      menuOpen = links.classList.toggle("is-open");
      toggle.classList.toggle("is-open", menuOpen);
      toggle.setAttribute("aria-expanded", String(menuOpen));
      updateNavToggleLabel();
    });

    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menuOpen = false;
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        updateNavToggleLabel();
      });
    });
  }

  /* ===== Nav background on scroll ===== */
  var onScroll = function () {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 20);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ===== Scroll reveal ===== */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ===== Daily Pixel demo ===== */
  preloadFriends();

  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", function () {
      idx = (idx + 1) % friends.length;
      updateDailyFriend(true);
    });
  }

  /* ===== Language switch ===== */
  if (langSwitch) {
    langSwitch.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLocale(btn.getAttribute("data-lang"));
      });
    });
  }

  /* ===== Theme toggle ===== */
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }

  /* ===== Init preferences ===== */
  var savedLang = null;
  var savedTheme = null;
  try {
    savedLang = localStorage.getItem(LANG_KEY);
    savedTheme = localStorage.getItem(THEME_KEY);
  } catch (e) { /* ignore */ }

  applyTheme(savedTheme === "dark" ? "dark" : "light");
  applyLocale(savedLang && i18n.LOCALES[savedLang] ? savedLang : i18n.DEFAULT_LANG);
})();
