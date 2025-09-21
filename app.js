// app.js — FULL DEBUG-ENABLED VERSION
// VERSION: 2.0 — paste/replace whole file and save

console.log("app.js v2.0 initializing — looking good ✨");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded fired — wiring UI");

  /* -------------------------
     Header, mobile nav & pills
     ------------------------- */
  const headerWrap = document.getElementById("header");
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".nav-list ul.mobile");
  const desktopLinks = document.querySelectorAll(".nav-list ul.desktop li a");
  const mobileLinks = document.querySelectorAll(".nav-list ul.mobile li a");

  if (headerWrap) console.log("Header found");
  else
    console.warn(
      "Header element (#header) NOT found — header behavior will skip"
    );

  // header scroll visuals
  if (headerWrap) {
    if (window.scrollY < 24) headerWrap.classList.add("at-top");
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            if (window.scrollY > 40) headerWrap.classList.add("scrolled");
            else headerWrap.classList.remove("scrolled");
            if (window.scrollY < 24) headerWrap.classList.add("at-top");
            else headerWrap.classList.remove("at-top");
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
    console.log("Header scroll listener attached");
  }

  // mobile nav toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      const active = mobileMenu.classList.toggle("active");
      hamburger.classList.toggle("active", active);
      hamburger.setAttribute("aria-expanded", String(active));
      mobileMenu.setAttribute("aria-hidden", String(!active));
      document.body.style.overflow = active ? "hidden" : "";
      console.log("Mobile menu toggled:", active);
    });

    mobileLinks.forEach((l) =>
      l.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      })
    );
    console.log("Mobile nav listeners attached");
  } else {
    if (!hamburger) console.warn("hamburger element not found");
    if (!mobileMenu) console.warn("mobileMenu element not found");
  }

  function initPills(links) {
    links.forEach((a) => {
      if (!a) return;
      a.classList.add("nav-pill");
      a.addEventListener("click", () => {
        document
          .querySelectorAll(".nav-pill.active")
          .forEach((x) => x.classList.remove("active"));
        a.classList.add("active");
      });
    });
  }
  initPills(Array.from(desktopLinks || []));
  initPills(Array.from(mobileLinks || []));
  console.log("Nav pills initialized");

  /* -------------------------
     Reveal on scroll (IntersectionObserver)
     ------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("show");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.18 }
      );
      revealEls.forEach((el) => io.observe(el));
      console.log(`Reveal observer attached to ${revealEls.length} elements`);
    } else {
      revealEls.forEach((el) => el.classList.add("show"));
      console.log("Reveal fallback applied (no IntersectionObserver)");
    }
  } else {
    console.log("No .reveal elements found");
  }

  /* -------------------------
     Scroll-spy
     ------------------------- */
  try {
    const navAnchors = Array.from(
      document.querySelectorAll(
        ".nav-list ul.desktop li a, .nav-list ul.mobile li a"
      )
    );

    const navItems = navAnchors
      .map((a) => {
        const href = a.getAttribute("href") || "";
        if (!href.startsWith("#")) return null;
        const section = document.querySelector(href);
        return section ? { link: a, section } : null;
      })
      .filter(Boolean);

    if (navItems.length && "IntersectionObserver" in window) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const match = navItems.find((x) => x.section === entry.target);
            if (!match) return;
            if (entry.isIntersecting) {
              document
                .querySelectorAll(".nav-pill.active")
                .forEach((x) => x.classList.remove("active"));
              match.link.classList.add("active");
            }
          });
        },
        { threshold: 0.52 }
      );
      navItems.forEach((x) => spy.observe(x.section));
      console.log("Scroll-spy active for", navItems.length, "sections");
    } else {
      console.log("No scroll-spy items or IntersectionObserver missing");
    }
  } catch (err) {
    console.warn("scroll-spy init failed:", err);
  }

  /* -------------------------
     Projects modal + persistence
     ------------------------- */
  const addBtn = document.getElementById("addProjectBtn");
  const modal = document.getElementById("projectModal");
  const closeModalBtn = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const projectForm = document.getElementById("projectForm");
  const allProjects = document.getElementById("allProjects");

  const hasModal = modal && projectForm && allProjects;
  if (!hasModal)
    console.warn(
      "Project modal / form / container not found — add project feature disabled"
    );

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createProjectNode({ name, url, img, desc }) {
    const article = document.createElement("article");
    article.className = "project-item reveal show";
    article.innerHTML = `
      <div class="project-info">
        <h3><a href="${escapeHtml(
          url
        )}" target="_blank" rel="noopener">${escapeHtml(name)}</a></h3>
        <h4></h4>
        <p>${escapeHtml(desc)}</p>
      </div>
      <div class="project-img">
        <img src="${escapeHtml(img)}" alt="${escapeHtml(name)}">
      </div>
    `;
    return article;
  }

  const STORAGE_KEY = "userProjects_v1";

  function loadSavedProjects() {
    if (!allProjects) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        console.log("No saved projects in localStorage");
        return;
      }
      const projects = JSON.parse(raw);
      if (!Array.isArray(projects)) {
        console.warn("Saved projects data invalid");
        return;
      }
      projects.forEach((p) => {
        const node = createProjectNode(p);
        allProjects.appendChild(node);
      });
      console.log("Loaded", projects.length, "saved projects");
    } catch (e) {
      console.warn("Could not load saved projects", e);
    }
  }

  function saveProjectToStorage(project) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(project);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      console.log("Saved project to localStorage:", project.name);
    } catch (e) {
      console.warn("Could not save project", e);
    }
  }

  function openModal() {
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      const first = modal.querySelector("#projName");
      if (first) first.focus();
    }, 120);
    console.log("Project modal opened");
  }

  function closeModal() {
    if (!modal || !projectForm) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    projectForm.reset();
    console.log("Project modal closed");
  }

  if (hasModal) {
    if (addBtn) addBtn.addEventListener("click", openModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (cancelBtn)
      cancelBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closeModal();
      });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    projectForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameEl = document.getElementById("projName");
      const urlEl = document.getElementById("projUrl");
      const imgEl = document.getElementById("projImg");
      const descEl = document.getElementById("projDesc");

      const name = nameEl ? nameEl.value.trim() : "";
      const url = urlEl ? urlEl.value.trim() : "";
      const img = imgEl ? imgEl.value.trim() : "";
      const desc = descEl ? descEl.value.trim() : "";

      if (!name || !url || !img || !desc) {
        alert("Please fill all fields before saving.");
        return;
      }

      const project = { name, url, img, desc };
      const node = createProjectNode(project);
      allProjects.appendChild(node);
      saveProjectToStorage(project);
      closeModal();

      setTimeout(() => {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
        node.style.transition = "box-shadow .6s, transform .6s";
        node.style.boxShadow = "0 30px 70px rgba(0,0,0,0.6)";
        setTimeout(() => (node.style.boxShadow = ""), 1200);
      }, 200);
    });

    loadSavedProjects();
  }

  // Escape key: global close behaviors
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modal && modal.classList.contains("active")) closeModal();
      if (mobileMenu && mobileMenu.classList.contains("active")) {
        mobileMenu.classList.remove("active");
        hamburger && hamburger.classList.remove("active");
        hamburger && hamburger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    }
  });

  /* -------------------------
     Service page loader (service.html?service=slug)
     ------------------------- */
  const servicePageEl = document.getElementById("servicePage");
  if (servicePageEl) {
    console.log("Service page detected — populating content");
    const contentMap = {
      "web-development": {
        title: "Web Development",
        desc: "I build modern, responsive, and user-friendly websites using React, Next.js and performance-first strategies.",
        benefits: [
          "Responsive layouts for mobile & desktop",
          "SEO-optimized websites",
          "High performance and accessibility",
          "Integration with APIs and databases",
          "Deployment support (Vercel/Netlify)",
        ],
      },
      "ai-ml": {
        title: "AI & Machine Learning",
        desc: "I create intelligent ML solutions and integrate AI into real-world applications (NLP, CV, recommendations).",
        benefits: [
          "Custom ML model development",
          "Data preprocessing & pipelines",
          "Model deployment (Flask, FastAPI)",
          "LLM integrations (OpenAI/Gemini)",
          "Monitoring & evaluation",
        ],
      },
      "full-stack": {
        title: "Full-Stack Development",
        desc: "End-to-end development for web apps covering frontend, backend, DB and deployment.",
        benefits: [
          "Frontend with React/Next.js",
          "Backend with Node.js/Express or Python",
          "Database design & integration",
          "Auth & security",
          "Cloud deployment (AWS/Vercel)",
        ],
      },
      "ui-ux": {
        title: "UI / UX Design",
        desc: "User-centered interfaces: wireframes, hi-fi mockups and clickable prototypes.",
        benefits: [
          "Wireframing & prototyping",
          "Pixel-perfect UI",
          "Design systems & components",
          "User testing & iteration",
          "Developer handoff assets",
        ],
      },
    };

    function populateServicePage() {
      const params = new URLSearchParams(window.location.search);
      const slug = (params.get("service") || "").toLowerCase();
      const data = contentMap[slug] || null;

      const titleEl = document.getElementById("serviceTitle");
      const descEl = document.getElementById("serviceDesc");
      const benefitsEl = document.getElementById("serviceBenefits");

      if (!titleEl || !descEl || !benefitsEl) {
        console.warn(
          "Service page DOM missing required elements (title/desc/benefits)"
        );
        return;
      }

      const d = data || {
        title: "Custom Service",
        desc: "Tell me what you need — I'll propose a tailored plan and estimate.",
        benefits: ["Discovery call", "Prototype & plan", "Delivery & handover"],
      };

      titleEl.textContent = d.title;
      descEl.textContent = d.desc;
      benefitsEl.innerHTML = "";
      (d.benefits || []).forEach((b) => {
        const li = document.createElement("li");
        li.textContent = b;
        benefitsEl.appendChild(li);
      });

      document.title = d.title + " — Shreya Pandey";
      console.log("Service page populated:", d.title);
    }

    populateServicePage();
  } // end servicePageEl
}); // end DOMContentLoaded
