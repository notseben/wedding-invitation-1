/* ============================================================
   YASYFI & RIFA — Pure Vanilla JS
   ============================================================ */
(function () {
  "use strict";

  var WEDDING_DATE = new Date("2026-12-12T08:00:00+07:00").getTime();

  /* ============ 1. LOADER: counter + slideshow ============ */
  var loader = document.getElementById("loader");
  var loadNum = document.getElementById("loadNum");
  var slides = document.querySelectorAll(".loader-slide");
  var slideIdx = 0;

  if (slides.length) {
    slides[0].classList.add("active");
    setInterval(function () {
      slides[slideIdx].classList.remove("active");
      slideIdx = (slideIdx + 1) % slides.length;
      slides[slideIdx].classList.add("active");
    }, 1400);
  }

  var start = null;
  var DURATION = 2600;
  function tick(ts) {
    if (!start) start = ts;
    var p = Math.min((ts - start) / DURATION, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    loadNum.textContent = Math.round(eased * 100);
    if (p < 1) {
      requestAnimationFrame(tick);
    } else {
      loader.classList.add("done");
      document.getElementById("cover").setAttribute("aria-hidden", "false");
    }
  }
  requestAnimationFrame(tick);

  /* ============ 2. COVER: guest name + open envelope ============ */
  var params = new URLSearchParams(window.location.search);
  var guest = params.get("to");
  if (guest && guest.trim()) {
    document.getElementById("guestName").textContent = guest.trim();
  }

  var cover = document.getElementById("cover");
  var opened = false;
  document.getElementById("openBtn").addEventListener("click", function () {
    if (opened) return;
    opened = true;
    cover.classList.add("open");
    setTimeout(function () {
      cover.classList.add("gone");
      document.body.classList.remove("locked");
      document.body.classList.add("opened");
      startCountdown();
    }, 950);
  });

  /* ============ 3. HERO PARALLAX (rAF) ============ */
  var layers = document.querySelectorAll("[data-parallax]");
  var ticking = false;
  function parallax() {
    var y = window.scrollY;
    layers.forEach(function (el) {
      var speed = parseFloat(el.getAttribute("data-parallax"));
      el.style.transform = "translate3d(0," + y * speed + "px,0)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(parallax);
      ticking = true;
    }
  }, { passive: true });

  /* ============ SCROLL REVEALS ============ */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ============ 5. COUNTDOWN ============ */
  var cdD = document.getElementById("cdDays");
  var cdH = document.getElementById("cdHours");
  var cdM = document.getElementById("cdMins");
  var cdS = document.getElementById("cdSecs");
  var cdTimer = null;

  function pad(n) { return String(n).padStart(2, "0"); }

  function updateCountdown() {
    var diff = WEDDING_DATE - Date.now();
    if (diff <= 0) {
      cdD.textContent = cdH.textContent = cdM.textContent = cdS.textContent = "00";
      clearInterval(cdTimer);
      return;
    }
    cdD.textContent = pad(Math.floor(diff / 86400000));
    cdH.textContent = pad(Math.floor(diff / 3600000) % 24);
    cdM.textContent = pad(Math.floor(diff / 60000) % 60);
    cdS.textContent = pad(Math.floor(diff / 1000) % 60);
  }

  function startCountdown() {
    updateCountdown();
    cdTimer = setInterval(updateCountdown, 1000);
  }

  /* ============ 6. RSVP & GUEST BOOK ============ */
  var form = document.getElementById("rsvpForm");
  var wishList = document.getElementById("wishList");
  var STORE_KEY = "yr-wishes";

  function makeWishCard(name, attendance, wish) {
    var li = document.createElement("li");
    li.className = "wish-card";
    var text = document.createElement("p");
    text.className = "wish-text";
    text.textContent = wish ? "\u201C" + wish + "\u201D" : "\u201CSee you at the celebration!\u201D";
    var meta = document.createElement("p");
    meta.className = "wish-meta";
    var strong = document.createElement("strong");
    strong.textContent = name;
    meta.appendChild(strong);
    meta.appendChild(document.createTextNode(" \u00B7 " + attendance));
    li.appendChild(text);
    li.appendChild(meta);
    return li;
  }

  function savedWishes() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch (e) { return []; }
  }

  savedWishes().forEach(function (w) {
    wishList.prepend(makeWishCard(w.name, w.attendance, w.wish));
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("fName").value.trim();
    var attendance = document.getElementById("fAttend").value;
    var wish = document.getElementById("fWish").value.trim();
    if (!name) return;

    wishList.prepend(makeWishCard(name, attendance, wish));
    wishList.scrollTop = 0;

    var all = savedWishes();
    all.unshift({ name: name, attendance: attendance, wish: wish });
    try { localStorage.setItem(STORE_KEY, JSON.stringify(all.slice(0, 50))); } catch (err) {}

    form.reset();
    var btn = form.querySelector(".btn-solid");
    btn.textContent = "Thank You";
    setTimeout(function () { btn.textContent = "Submit"; }, 2200);
  });

  /* ============ 7. COPY ACCOUNT NUMBER ============ */
  var copyBtn = document.getElementById("copyBtn");
  var copyLabel = document.getElementById("copyLabel");
  copyBtn.addEventListener("click", function () {
    var number = document.getElementById("accNumber").textContent.trim();
    function feedback() {
      copyBtn.classList.add("copied");
      copyLabel.textContent = "Copied!";
      setTimeout(function () {
        copyBtn.classList.remove("copied");
        copyLabel.textContent = "Copy Number";
      }, 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(number).then(feedback).catch(feedback);
    } else {
      var ta = document.createElement("textarea");
      ta.value = number;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (err) {}
      document.body.removeChild(ta);
      feedback();
    }
  });

  /* ============ MUSIC TOGGLE ============ */
  var musicBtn = document.getElementById("musicBtn");
  var audio = document.getElementById("bgMusic");
  musicBtn.addEventListener("click", function () {
    if (audio.paused) {
      audio.volume = 0.5;
      audio.play().then(function () {
        musicBtn.classList.add("playing");
      }).catch(function () {});
    } else {
      audio.pause();
      musicBtn.classList.remove("playing");
    }
  });
})();