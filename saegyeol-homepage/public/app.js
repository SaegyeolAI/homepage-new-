/* 이 파일은 build.js가 src/*.jsx에서 생성합니다. 직접 수정하지 마세요. */
/* ---- src/components/chrome.jsx ---- */
const { useState, useEffect, useRef } = React;
const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;
const MAX_UPLOAD_LABEL = "4.5MB";
const SNAP_ROUTES = /* @__PURE__ */ new Set([
  "home",
  "team",
  "product",
  "pricing",
  "feature-shadow",
  "feature-pii",
  "feature-report"
]);
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SNAP_MIN_WIDTH = 801;
const snapActive = (route) => SNAP_ROUTES.has(route) && window.innerWidth >= SNAP_MIN_WIDTH && !prefersReducedMotion();
function markSnapSections() {
  const page = document.querySelector("[data-screen-label]");
  if (!page) return [];
  const sections = [...page.children].filter((el) => el.tagName === "SECTION");
  sections.forEach((el, i) => {
    el.classList.add("snap-section");
    if (!el.dataset.sectionLabel) {
      const source = el.querySelector(".section-label")?.textContent || el.querySelector("h1, h2")?.textContent || `\uC139\uC158 ${i + 1}`;
      const clean = source.replace(/\s+/g, " ").trim();
      const MAX = 40;
      el.dataset.sectionLabel = clean.length <= MAX ? clean : `${clean.slice(0, MAX).replace(/\s+\S*$/, "")}\u2026`;
    }
  });
  return sections;
}
const SCROLL_KEYS = { ArrowDown: 1, ArrowUp: -1, PageDown: 1, PageUp: -1 };
function isTextEntry(el) {
  if (!el) return false;
  if (el.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}
function isActivatable(el) {
  if (!el) return false;
  return ["BUTTON", "A", "SUMMARY", "DETAILS", "LABEL"].includes(el.tagName);
}
function useFullScroll(route) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    return () => cancelAnimationFrame(frame);
  }, [route]);
  useEffect(() => {
    const root = document.documentElement;
    if (SNAP_ROUTES.has(route)) root.dataset.snap = "on";
    else delete root.dataset.snap;
    const t = setTimeout(markSnapSections, 60);
    return () => {
      clearTimeout(t);
      delete root.dataset.snap;
    };
  }, [route]);
  useEffect(() => {
    if (!SNAP_ROUTES.has(route)) return void 0;
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (!snapActive(route)) return;
      const target = e.target;
      const isSpace = e.key === " " || e.code === "Space";
      if (isTextEntry(target)) return;
      if (isSpace && isActivatable(target)) return;
      const direction = isSpace ? e.shiftKey ? -1 : 1 : SCROLL_KEYS[e.key];
      if (!direction) return;
      const sections = [...document.querySelectorAll(".snap-section")];
      if (sections.length < 2) return;
      const viewport = window.innerHeight;
      const current = window.scrollY;
      const tops = sections.map((el) => el.offsetTop);
      let next;
      if (direction > 0) {
        next = tops.find((top) => top > current + 4);
        if (next === void 0) next = document.body.scrollHeight - viewport;
      } else {
        const earlier = tops.filter((top) => top < current - 4);
        next = earlier.length ? earlier[earlier.length - 1] : 0;
      }
      if (Math.abs(next - current) > viewport) next = current + direction * viewport;
      e.preventDefault();
      window.scrollTo({ top: Math.max(0, next), behavior: "smooth" });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [route]);
}
function SectionDots({ route }) {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(0);
  const sectionsRef = useRef([]);
  useEffect(() => {
    if (!SNAP_ROUTES.has(route)) {
      sectionsRef.current = [];
      setItems([]);
      return void 0;
    }
    let frame = 0;
    const sync = () => {
      const sections = sectionsRef.current;
      if (!sections.length) return;
      const middle = window.scrollY + window.innerHeight / 2;
      let index = 0;
      sections.forEach((el, i) => {
        if (el.offsetTop <= middle) index = i;
      });
      setActive(index);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };
    const t = setTimeout(() => {
      sectionsRef.current = markSnapSections();
      setItems(sectionsRef.current.map((el, i) => ({
        key: i,
        label: el.dataset.sectionLabel || `\uC139\uC158 ${i + 1}`
      })));
      sync();
    }, 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [route]);
  if (items.length < 2) return null;
  const goTo = (index) => {
    const el = sectionsRef.current[index];
    if (!el) return;
    window.scrollTo({
      top: el.offsetTop,
      behavior: prefersReducedMotion() ? "auto" : "smooth"
    });
  };
  return /* @__PURE__ */ React.createElement("nav", { className: "section-dots", "aria-label": "\uC139\uC158 \uBC14\uB85C\uAC00\uAE30" }, /* @__PURE__ */ React.createElement("ul", null, items.map((item, i) => /* @__PURE__ */ React.createElement("li", { key: item.key }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "section-dot" + (i === active ? " is-active" : ""),
      "aria-label": `${item.label} \uC139\uC158\uC73C\uB85C \uC774\uB3D9`,
      "aria-current": i === active ? "true" : void 0,
      onClick: () => goTo(i)
    },
    /* @__PURE__ */ React.createElement("span", { className: "section-dot-mark", "aria-hidden": "true" }),
    /* @__PURE__ */ React.createElement("span", { className: "section-dot-tip", "aria-hidden": "true" }, item.label)
  )))));
}
const BackArrow = () => /* @__PURE__ */ React.createElement(
  "svg",
  {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    focusable: "false",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  },
  /* @__PURE__ */ React.createElement("path", { d: "M15 5l-7 7 7 7" })
);
function BackButton({ onBack }) {
  return /* @__PURE__ */ React.createElement("button", { type: "button", className: "back-link", "aria-label": "\uC774\uC804 \uD398\uC774\uC9C0\uB85C \uB3CC\uC544\uAC00\uAE30", onClick: onBack }, /* @__PURE__ */ React.createElement(BackArrow, null), /* @__PURE__ */ React.createElement("span", null, "\uB4A4\uB85C"));
}
const BACK_FLOAT_SHOW_AT = 480;
const BACK_FLOAT_FOOTER_GAP = 180;
function FloatingBackButton({ onBack }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const y = window.scrollY;
      const atBottom = y + window.innerHeight > document.documentElement.scrollHeight - BACK_FLOAT_FOOTER_GAP;
      setVisible(y > BACK_FLOAT_SHOW_AT && !atBottom);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: `back-float${visible ? " is-visible" : ""}`,
      "aria-label": "\uC774\uC804 \uD398\uC774\uC9C0\uB85C \uB3CC\uC544\uAC00\uAE30",
      onClick: onBack
    },
    /* @__PURE__ */ React.createElement(BackArrow, null),
    /* @__PURE__ */ React.createElement("span", null, "\uB4A4\uB85C")
  );
}
function useReveal(route) {
  useEffect(() => {
    const SELECTORS = [
      "section.block .section-head",
      "section.block .cards > article",
      "section.block .stats",
      "section.block .flow-step",
      "section.block .banner",
      "section.block .contact-grid > div",
      "section.block .team-grid",
      "section.block .recruit",
      ".closing-cta-inner",
      ".privacy-header",
      ".privacy-section"
    ].join(",");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        if (e.target.classList.contains("sr")) {
          e.target.classList.add("sr-in");
        } else {
          e.target.classList.add("line-in");
        }
        observer.unobserve(e.target);
      }),
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    const t = setTimeout(() => {
      document.querySelectorAll(SELECTORS).forEach((el) => {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) return;
        el.classList.add("sr");
        const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains("sr")) : [];
        const idx = siblings.indexOf(el);
        if (idx > 0) el.classList.add(`sr-d${Math.min(idx, 3)}`);
        observer.observe(el);
      });
      document.querySelectorAll("section.block").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add("line-in");
        } else {
          observer.observe(el);
        }
      });
    }, 60);
    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, [route]);
}
const THEME_KEY = "saegyeol-theme-v3";
const DEFAULT_THEME = "dark";
function readStoredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" || saved === "dark" ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}
document.documentElement.setAttribute("data-theme", readStoredTheme());
function useTheme() {
  const [theme, setTheme] = useState(readStoredTheme);
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    const bg = getComputedStyle(root).getPropertyValue("--bg").trim();
    if (meta && bg) meta.setAttribute("content", bg);
  }, [theme]);
  return [theme, setTheme];
}
function Brand({ onClick, showSub }) {
  return /* @__PURE__ */ React.createElement("a", { className: "brand", href: "#", onClick: (e) => {
    e.preventDefault();
    onClick && onClick();
  } }, /* @__PURE__ */ React.createElement("img", { src: "logo.png", alt: "Saegyeol", className: "brand-logo" }), showSub && /* @__PURE__ */ React.createElement("span", { className: "brand-sub" }, "\uC0C8\uACB0"));
}
const Icon = {
  shadow: () => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "9", r: "4" }), /* @__PURE__ */ React.createElement("circle", { cx: "15", cy: "15", r: "4", strokeDasharray: "2 2" }), /* @__PURE__ */ React.createElement("path", { d: "M3 21c0-3 3-5 6-5" })),
  pii: () => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }), /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "11", r: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M5 16c1-1.5 3-2 4-2s3 .5 4 2" }), /* @__PURE__ */ React.createElement("path", { d: "M15 9h4M15 13h3" })),
  report: () => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("rect", { x: "5", y: "3", width: "14", height: "18", rx: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M9 8h6M9 12h6M9 16h3" }), /* @__PURE__ */ React.createElement("path", { d: "M16.5 17l2 2 3-3.5", stroke: "var(--accent-ink, currentColor)" })),
  inject: () => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M4 12h10" }), /* @__PURE__ */ React.createElement("path", { d: "M14 8l4 4-4 4" }), /* @__PURE__ */ React.createElement("circle", { cx: "20", cy: "12", r: "1.2", fill: "currentColor" })),
  shield: () => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z" }), /* @__PURE__ */ React.createElement("path", { d: "M9 12l2 2 4-4" })),
  graph: () => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M4 18V8M10 18V4M16 18v-7M22 18H2" }))
};
function Nav({ route, setRoute, theme, setTheme }) {
  const [open, setOpen] = useState(null);
  const closeTimer = useRef(null);
  const enter = (id) => {
    clearTimeout(closeTimer.current);
    setOpen(id);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  };
  const goContact = createContactNav(setRoute);
  const go = (id, hash) => {
    setOpen(null);
    if (id === "contact") {
      goContact();
    } else {
      setRoute(id);
      window.scrollTo({ top: 0, behavior: "instant" });
      if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), CONTACT_SCROLL_DELAY);
    }
  };
  return /* @__PURE__ */ React.createElement("nav", { className: "nav" }, /* @__PURE__ */ React.createElement("div", { className: "container nav-inner" }, /* @__PURE__ */ React.createElement(Brand, { onClick: () => go("home"), showSub: true }), /* @__PURE__ */ React.createElement("div", { className: "nav-links" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "nav-item" + (open === "products" ? " open" : ""),
      onMouseEnter: () => enter("products"),
      onMouseLeave: leave
    },
    /* @__PURE__ */ React.createElement("button", { className: "nav-link" + (["product", "pricing", "feature-shadow", "feature-pii", "feature-report"].includes(route) ? " active" : ""), onClick: () => go("product") }, "\uC81C\uD488 ", /* @__PURE__ */ React.createElement("span", { className: "chev" }, "\u25BE")),
    /* @__PURE__ */ React.createElement("div", { className: "mega", role: "menu" }, /* @__PURE__ */ React.createElement("div", { className: "mega-col" }, /* @__PURE__ */ React.createElement("h5", null, "\uC81C\uD488"), /* @__PURE__ */ React.createElement(
      "a",
      {
        className: "mega-item",
        role: "menuitem",
        tabIndex: 0,
        onClick: () => go("product"),
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") go("product");
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "t", style: { display: "flex", alignItems: "center", gap: 8 } }, "\uC5EC\uC6B8"),
      /* @__PURE__ */ React.createElement("div", { className: "d" }, "\uD55C\uAD6D\uC5B4 AI \uC5D0\uC774\uC804\uD2B8 \uC790\uB3D9 \uCE68\uD22C \uD14C\uC2A4\uD2B8 \uC11C\uBE44\uC2A4")
    ), /* @__PURE__ */ React.createElement(
      "a",
      {
        className: "mega-item",
        role: "menuitem",
        tabIndex: 0,
        onClick: () => go("pricing"),
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") go("pricing");
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "t" }, "\uC5EC\uC6B8 \uC694\uAE08 \uC548\uB0B4"),
      /* @__PURE__ */ React.createElement("div", { className: "d" }, "\uBB34\uB8CC \xB7 \uD504\uB85C \xB7 \uD504\uB79C\uCC28\uC774\uC988 \uD50C\uB79C \uBE44\uAD50")
    )), /* @__PURE__ */ React.createElement("div", { className: "mega-col" }, /* @__PURE__ */ React.createElement("h5", null, "\uC5EC\uC6B8 \uAE30\uB2A5"), /* @__PURE__ */ React.createElement("a", { className: "mega-item", role: "menuitem", tabIndex: 0, onClick: () => go("feature-shadow"), onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") go("feature-shadow");
    } }, /* @__PURE__ */ React.createElement("div", { className: "t" }, "Shadow Agent \uD0D0\uC9C0"), /* @__PURE__ */ React.createElement("div", { className: "d" }, "\uC0AC\uAC01\uC9C0\uB300\uC758 \uAC1C\uC778 AI \uC5D0\uC774\uC804\uD2B8 \uBC1C\uACAC")), /* @__PURE__ */ React.createElement("a", { className: "mega-item", role: "menuitem", tabIndex: 0, onClick: () => go("feature-pii"), onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") go("feature-pii");
    } }, /* @__PURE__ */ React.createElement("div", { className: "t" }, "K-PII \uCC28\uB2E8"), /* @__PURE__ */ React.createElement("div", { className: "d" }, "\uD55C\uAD6D\uC2DD \uAC1C\uC778\uC815\uBCF4 14\uC885 \uC804\uC6A9 \uD0D0\uC9C0")), /* @__PURE__ */ React.createElement("a", { className: "mega-item", role: "menuitem", tabIndex: 0, onClick: () => go("feature-report"), onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") go("feature-report");
    } }, /* @__PURE__ */ React.createElement("div", { className: "t" }, "\uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4 \uB9AC\uD3EC\uD2B8"), /* @__PURE__ */ React.createElement("div", { className: "d" }, "ISMS-P \xB7 \uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uBC95 \uC790\uB3D9 \uB9E4\uD551"))), /* @__PURE__ */ React.createElement("div", { className: "mega-col" }, /* @__PURE__ */ React.createElement("h5", null, "RESOURCES"), /* @__PURE__ */ React.createElement("a", { className: "mega-item", role: "menuitem", tabIndex: 0, onClick: () => go("contact"), onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") go("contact");
    } }, /* @__PURE__ */ React.createElement("div", { className: "t" }, "\uB3C4\uC785 \uC0C1\uB2F4"), /* @__PURE__ */ React.createElement("div", { className: "d" }, "\uC11C\uBE44\uC2A4 \uC801\uC6A9 \uBC94\uC704\uC640 \uB3C4\uC785 \uC808\uCC28\uB97C \uC548\uB0B4\uD569\uB2C8\uB2E4")), /* @__PURE__ */ React.createElement("a", { className: "mega-item", role: "menuitem", tabIndex: 0, onClick: () => go("team"), onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") go("team");
    } }, /* @__PURE__ */ React.createElement("div", { className: "t" }, "\uD300 \uB9CC\uB098\uAE30"), /* @__PURE__ */ React.createElement("div", { className: "d" }, "\uC0C8\uACB0\uC744 \uB9CC\uB4DC\uB294 \uC0AC\uB78C\uB4E4"))))
  ), /* @__PURE__ */ React.createElement("button", { className: "nav-link" + (route === "pricing" ? " active" : ""), onClick: () => go("pricing") }, "\uC694\uAE08\uC81C"), /* @__PURE__ */ React.createElement("button", { className: "nav-link" + (route === "team" ? " active" : ""), onClick: () => go("team") }, "\uD300 \uC18C\uAC1C"), /* @__PURE__ */ React.createElement("button", { className: "nav-link", onClick: () => go("contact") }, "\uBB38\uC758"), /* @__PURE__ */ React.createElement("button", { className: "theme-toggle", "aria-label": "\uBAA8\uB4DC \uBCC0\uACBD", onClick: () => setTheme(theme === "light" ? "dark" : "light") }, theme === "light" ? /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8" }, /* @__PURE__ */ React.createElement("path", { d: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z", strokeLinejoin: "round" })) : /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8" }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "4" }), /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" }))))));
}
const CONTACT_SCROLL_DELAY = 100;
const CONTACT_PREFILL_EVENT = "saegyeol:contact-prefill";
let pendingContactPrefill = "";
function takeContactPrefill() {
  const value = pendingContactPrefill;
  pendingContactPrefill = "";
  return value;
}
function createContactNav(setRoute) {
  return (prefillMessage) => {
    setRoute("home");
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (prefillMessage) {
        pendingContactPrefill = prefillMessage;
        window.dispatchEvent(new CustomEvent(CONTACT_PREFILL_EVENT));
      }
    }, CONTACT_SCROLL_DELAY);
  };
}
function ContactButton({ onContact, prefill, variant = "accent", onDark = false }) {
  const className = [
    "btn",
    variant === "accent" ? "btn-accent" : "btn-ghost",
    onDark ? "on-dark" : ""
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ React.createElement("button", { type: "button", className, onClick: () => onContact(prefill) }, "\uBB38\uC758\uD558\uAE30 ", /* @__PURE__ */ React.createElement("span", { className: "arrow" }, "\u2192"));
}
function ClosingCTA({ onContact, prefill }) {
  return /* @__PURE__ */ React.createElement("section", { className: "closing-cta", "data-section-label": "\uBB38\uC758\uD558\uAE30" }, /* @__PURE__ */ React.createElement("div", { className: "closing-cta-inner" }, /* @__PURE__ */ React.createElement("span", { className: "label" }, "JOIN US"), /* @__PURE__ */ React.createElement("h2", null, "\uC9C0\uAE08 \uC0C8\uACB0\uACFC", /* @__PURE__ */ React.createElement("br", null), "\uD568\uAED8\uD558\uC138\uC694."), /* @__PURE__ */ React.createElement("p", null, "AI \uC5D0\uC774\uC804\uD2B8\uB97C \uB0B4\uBCF4\uB0B4\uAE30 \uC804\uC5D0 \uD55C\uAD6D\uC5B4 \uACF5\uACA9 \uAD00\uC810\uC73C\uB85C \uD55C \uBC88 \uC810\uAC80\uD574 \uBCF4\uC138\uC694. \uC5B4\uB514\uAE4C\uC9C0 \uD655\uC778\uD588\uACE0 \uBB34\uC5C7\uC774 \uB0A8\uC558\uB294\uC9C0 \uD568\uAED8 \uC815\uB9AC\uD574 \uB4DC\uB9BD\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "hero-cta" }, /* @__PURE__ */ React.createElement(ContactButton, { onContact, prefill }))));
}
function Footer({ setRoute }) {
  const goContact = createContactNav(setRoute);
  const go = (id, hash) => {
    if (id === "contact") {
      goContact();
    } else {
      setRoute(id);
      window.scrollTo({ top: 0 });
      if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), CONTACT_SCROLL_DELAY);
    }
  };
  return /* @__PURE__ */ React.createElement("footer", { className: "site-footer" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "footer-grid" }, /* @__PURE__ */ React.createElement("div", { className: "footer-left" }, /* @__PURE__ */ React.createElement(Brand, { onClick: () => go("home") }), /* @__PURE__ */ React.createElement("div", { className: "footer-legal" }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "\uD68C\uC0AC\uBA85"), /* @__PURE__ */ React.createElement("span", null, "\uC0C8\uACB0 (Saegyeol)")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "\uB300\uD45C\uC790"), /* @__PURE__ */ React.createElement("span", null, "\uD669\uC9C0\uD6C4")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "\uC0AC\uC5C5\uC790\uBC88\uD638"), /* @__PURE__ */ React.createElement("span", null, "101-30-53151")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "\uC8FC\uC18C"), /* @__PURE__ */ React.createElement("span", null, "\uBD80\uC0B0\uAD11\uC5ED\uC2DC \uD574\uC6B4\uB300\uAD6C \uC88C\uB3D9\uC21C\uD658\uB85C8\uBC88\uAE38 78, 103\uB3D9 801\uD638(\uC911\uB3D9, \uD574\uC6B4\uB300\uBA54\uD2B8\uB85C\uD558\uC774\uCE20)")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "\uC774\uBA54\uC77C"), /* @__PURE__ */ React.createElement("span", null, "contact@saegyeol.ai.kr")))), /* @__PURE__ */ React.createElement("div", { className: "footer-right" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", null, "PRODUCT"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", { onClick: () => go("product") }, "\uC5EC\uC6B8"), /* @__PURE__ */ React.createElement("li", { onClick: () => go("pricing") }, "\uC694\uAE08\uC81C"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", null, "COMPANY"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", { onClick: () => go("team") }, "\uD300 \uC18C\uAC1C"), /* @__PURE__ */ React.createElement("li", { onClick: () => go("team", "recruit") }, "\uCC44\uC6A9"), /* @__PURE__ */ React.createElement("li", { onClick: () => go("contact") }, "\uBB38\uC758"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", null, "FOLLOW"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "https://www.instagram.com/saegyeol_official", target: "_blank", rel: "noreferrer", style: { color: "inherit", textDecoration: "none" } }, "Instagram")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "mailto:contact@saegyeol.ai.kr", style: { color: "inherit", textDecoration: "none" } }, "Email")))))), /* @__PURE__ */ React.createElement("div", { className: "footer-bottom" }, /* @__PURE__ */ React.createElement("span", null, "\xA9 2026 Saegyeol. All rights reserved."), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("a", { href: "#", style: { marginRight: 24 }, onClick: (e) => {
    e.preventDefault();
    go("privacy");
  } }, "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68"), /* @__PURE__ */ React.createElement("a", { href: "#", onClick: (e) => {
    e.preventDefault();
    go("terms");
  } }, "\uC774\uC6A9\uC57D\uAD00")))));
}
const UPLOAD_ACCEPT = ".pdf,.docx,.pptx,.png,.jpg,.jpeg";
const UPLOAD_TYPES_LABEL = "PDF \xB7 DOCX \xB7 PPTX \xB7 PNG \xB7 JPG";
const CONTACT_MAIL = "contact@saegyeol.ai.kr";
function mailtoHref(subject, body) {
  const trimmed = (body || "").slice(0, 1500);
  return `mailto:${CONTACT_MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(trimmed)}`;
}
function formatSeconds(total) {
  if (total <= 0) return "\uACE7";
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}\uBD84 ${String(s).padStart(2, "0")}\uCD08` : `${s}\uCD08`;
}
function useCountdown(until) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!until) return void 0;
    const id = setInterval(() => tick((n) => n + 1), 1e3);
    return () => clearInterval(id);
  }, [until]);
  if (!until) return null;
  return Math.max(0, Math.ceil((until - Date.now()) / 1e3));
}
function FormStatus({ sent, successText }) {
  if (!sent) return null;
  return /* @__PURE__ */ React.createElement("div", { className: "form-success", role: "status" }, successText);
}
function FormBlocked({ reason, retryText, retryAt, mailSubject, mailBody }) {
  const left = useCountdown(retryAt);
  return /* @__PURE__ */ React.createElement("div", { className: "form-blocked" }, /* @__PURE__ */ React.createElement("div", { role: "alert" }, /* @__PURE__ */ React.createElement("p", { className: "form-blocked-reason" }, reason), retryText && /* @__PURE__ */ React.createElement("p", { className: "form-blocked-retry" }, retryText), /* @__PURE__ */ React.createElement("p", { className: "form-blocked-fallback" }, "\uAE09\uD558\uC2DC\uBA74 ", /* @__PURE__ */ React.createElement("a", { href: mailtoHref(mailSubject, mailBody) }, CONTACT_MAIL), "\uB85C \uC9C1\uC811 \uBCF4\uB0B4\uC8FC\uC138\uC694. \uC801\uC5B4\uC8FC\uC2E0 \uB0B4\uC6A9\uC740 \uADF8\uB300\uB85C \uB0A8\uC544 \uC788\uC2B5\uB2C8\uB2E4.")), left !== null && left > 0 && /* @__PURE__ */ React.createElement("p", { className: "form-blocked-countdown", "aria-hidden": "true" }, formatSeconds(left), " \uB0A8\uC74C"));
}
function Honeypot({ startedAt }) {
  return /* @__PURE__ */ React.createElement("div", { className: "hp-field", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "company_site" }, "\uD68C\uC0AC \uD648\uD398\uC774\uC9C0"), /* @__PURE__ */ React.createElement("input", { id: "company_site", name: "company_site", type: "text", tabIndex: -1, autoComplete: "off", defaultValue: "" }), /* @__PURE__ */ React.createElement("input", { type: "hidden", name: "form_ts", value: startedAt, readOnly: true }));
}
function FormField({ id, label, optional, error, children }) {
  const describedBy = error ? `${id}-error` : void 0;
  return /* @__PURE__ */ React.createElement("div", { className: `row${error ? " row-invalid" : ""}` }, /* @__PURE__ */ React.createElement("label", { htmlFor: id }, label, optional ? /* @__PURE__ */ React.createElement("span", { className: "field-optional" }, " (\uC120\uD0DD)") : /* @__PURE__ */ React.createElement("span", { className: "field-required", "aria-hidden": "true" }, " *")), children({ describedBy, invalid: !!error, required: !optional }), error && /* @__PURE__ */ React.createElement("p", { className: "field-error", id: `${id}-error` }, error));
}
function TextField({ id, label, type = "text", placeholder, value, onChange, autoComplete, error }) {
  return /* @__PURE__ */ React.createElement(FormField, { id, label, error }, ({ describedBy, invalid, required }) => /* @__PURE__ */ React.createElement(
    "input",
    {
      id,
      name: id,
      type,
      placeholder,
      value,
      autoComplete,
      "aria-required": required || void 0,
      "aria-invalid": invalid || void 0,
      "aria-describedby": describedBy,
      onChange: (e) => onChange(e.target.value)
    }
  ));
}
function FileField({ id, label, optional, file, fileRef, onSelect, note, error }) {
  return /* @__PURE__ */ React.createElement(FormField, { id, label, optional, error }, ({ describedBy, invalid, required }) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "input",
    {
      ref: fileRef,
      id,
      type: "file",
      accept: UPLOAD_ACCEPT,
      style: { display: "none" },
      onChange: (e) => onSelect(e.target.files?.[0] || null)
    }
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `file-drop${invalid ? " file-drop-invalid" : ""}`,
      role: "button",
      tabIndex: 0,
      "aria-label": file ? `\uCCA8\uBD80\uD30C\uC77C \uC120\uD0DD\uB428: ${file.name}. \uB2E4\uC2DC \uC120\uD0DD\uD558\uB824\uBA74 \uB204\uB974\uC138\uC694` : "\uCCA8\uBD80\uD30C\uC77C \uC120\uD0DD",
      "aria-required": required || void 0,
      "aria-describedby": describedBy,
      onClick: () => fileRef.current?.click(),
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
      },
      onDragOver: (e) => e.preventDefault(),
      onDrop: (e) => {
        e.preventDefault();
        onSelect(e.dataTransfer.files?.[0] || null);
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "icon" }, file ? "\u2713" : "\u2191"),
    /* @__PURE__ */ React.createElement("div", { className: "meta" }, /* @__PURE__ */ React.createElement("div", { className: "name" }, file ? file.name : "\uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uAC70\uB098 \uC5EC\uAE30\uB85C \uB04C\uC5B4\uB2E4 \uB193\uC73C\uC138\uC694"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, file ? `${(file.size / 1024).toFixed(1)} KB` : `${UPLOAD_TYPES_LABEL} (\uCD5C\uB300 ${MAX_UPLOAD_LABEL}, \uD55C \uAC1C)`))
  ), /* @__PURE__ */ React.createElement("p", { className: "field-note" }, note)));
}
function FormActions({ sending, label, hint }) {
  return /* @__PURE__ */ React.createElement("div", { className: "actions" }, /* @__PURE__ */ React.createElement("span", { className: "hint" }, hint), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-accent", disabled: sending }, sending ? "\uC804\uC1A1 \uC911\u2026" : /* @__PURE__ */ React.createElement(React.Fragment, null, label, " ", /* @__PURE__ */ React.createElement("span", { className: "arrow" }, "\u2192"))));
}
function useFileSelect() {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef(null);
  const selectFile = (nextFile) => {
    if (!nextFile) return;
    if (nextFile.size > MAX_UPLOAD_BYTES) {
      setFileError(`\uD30C\uC77C\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4. ${MAX_UPLOAD_LABEL} \uC774\uD558\uB85C \uC904\uC774\uAC70\uB098, \uB9C1\uD06C\uB85C \uBCF4\uB0B4\uC8FC\uC138\uC694.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setFileError("");
    setFile(nextFile);
  };
  const clearFile = () => {
    setFile(null);
    setFileError("");
    if (fileRef.current) fileRef.current.value = "";
  };
  return { file, fileRef, fileError, setFileError, selectFile, clearFile };
}
function describeFailure(status, payload) {
  const fromServer = payload && typeof payload.error === "string" ? payload.error : "";
  const retryAfter = payload && Number(payload.retryAfter);
  const retryAt = Number.isFinite(retryAfter) && retryAfter > 0 ? Date.now() + retryAfter * 1e3 : null;
  if (status === 429) {
    return {
      reason: fromServer || "\uC9E7\uC740 \uC2DC\uAC04\uC5D0 \uB108\uBB34 \uB9CE\uC774 \uBCF4\uB0B4\uC168\uC2B5\uB2C8\uB2E4.",
      retryText: retryAt ? `\uC57D ${formatSeconds(Math.ceil((retryAt - Date.now()) / 1e3))} \uB4A4\uC5D0 \uB2E4\uC2DC \uBCF4\uB0BC \uC218 \uC788\uC2B5\uB2C8\uB2E4.` : "\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.",
      retryAt
    };
  }
  if (status === 503) {
    return {
      reason: fromServer || "\uBB38\uC758 \uC811\uC218\uAC00 \uC77C\uC2DC\uC801\uC73C\uB85C \uC911\uB2E8\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.",
      retryText: "\uBCF5\uAD6C\uB418\uB294 \uB300\uB85C \uB2E4\uC2DC \uBC1B\uC2B5\uB2C8\uB2E4. \uADF8\uC804\uAE4C\uC9C0\uB294 \uC544\uB798 \uC8FC\uC18C\uB85C \uBCF4\uB0B4\uC8FC\uC138\uC694."
    };
  }
  if (status === 403) {
    return {
      reason: fromServer || "\uC9C0\uAE08 \uC774 \uD398\uC774\uC9C0\uC5D0\uC11C\uB294 \uBB38\uC758\uB97C \uBCF4\uB0BC \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
      retryText: "\uD398\uC774\uC9C0\uB97C \uC0C8\uB85C\uACE0\uCE68\uD55C \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694."
    };
  }
  if (status === 413) {
    return {
      reason: "\uCCA8\uBD80\uD30C\uC77C\uC774 \uB108\uBB34 \uCEE4\uC11C \uBCF4\uB0B4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
      retryText: `\uD30C\uC77C\uC744 \uBE7C\uAC70\uB098 ${MAX_UPLOAD_LABEL} \uC774\uD558\uB85C \uC904\uC5EC \uB2E4\uC2DC \uBCF4\uB0B4\uC8FC\uC138\uC694.`
    };
  }
  if (status >= 500) {
    return {
      reason: fromServer || "\uC11C\uBC84\uC5D0\uC11C \uBB38\uC81C\uAC00 \uC0DD\uACA8 \uBCF4\uB0B4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
      retryText: "\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694."
    };
  }
  if (status === 0) {
    return {
      reason: "\uB124\uD2B8\uC6CC\uD06C\uC5D0 \uC5F0\uACB0\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
      retryText: "\uC778\uD130\uB137 \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694."
    };
  }
  return {
    reason: fromServer || "\uBCF4\uB0B4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
    retryText: "\uB0B4\uC6A9\uC744 \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694."
  };
}
async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
const SUBMIT_COOLDOWN_MS = 6e4;
const lastSubmitKey = "saegyeol-last-submit";
function validateContact(data) {
  const errors = {};
  if (!data.name.trim()) errors["cfv2-name"] = "\uC774\uB984\uC744 \uC801\uC5B4\uC8FC\uC138\uC694.";
  if (!data.email.trim()) errors["cfv2-email"] = "\uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC801\uC5B4\uC8FC\uC138\uC694.";
  else if (!/\S+@\S+\.\S+/.test(data.email)) errors["cfv2-email"] = "\uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694. (\uC608: you@company.kr)";
  if (!data.message.trim()) errors["cfv2-msg"] = "\uBB38\uC758 \uB0B4\uC6A9\uC744 \uC801\uC5B4\uC8FC\uC138\uC694.";
  else if (data.message.trim().length < 4) errors["cfv2-msg"] = "\uC870\uAE08\uB9CC \uB354 \uC790\uC138\uD788 \uC801\uC5B4\uC8FC\uC138\uC694. (\uB124 \uAE00\uC790 \uC774\uC0C1)";
  return errors;
}
function focusFirstError(errors, order) {
  const firstId = order.find((id) => errors[id]);
  if (!firstId) return;
  const el = document.getElementById(firstId);
  if (!el) return;
  el.focus({ preventScroll: true });
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
}
function ContactForm() {
  const [data, setData] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [blocked, setBlocked] = useState(null);
  const startedAt = useRef(Date.now()).current;
  const { file, fileRef, fileError, setFileError, selectFile, clearFile } = useFileSelect();
  useEffect(() => {
    const apply = () => {
      const message = takeContactPrefill();
      if (!message) return;
      setData((prev) => prev.message.trim() ? prev : { ...prev, message });
    };
    apply();
    window.addEventListener(CONTACT_PREFILL_EVENT, apply);
    return () => window.removeEventListener(CONTACT_PREFILL_EVENT, apply);
  }, []);
  const update = (key, id) => (value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => prev[id] ? { ...prev, [id]: "" } : prev);
  };
  const submit = async (e) => {
    e.preventDefault();
    const found = validateContact(data);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setBlocked(null);
      focusFirstError(found, ["cfv2-name", "cfv2-email", "cfv2-msg"]);
      return;
    }
    let lastSubmit = 0;
    try {
      lastSubmit = parseInt(localStorage.getItem(lastSubmitKey) || "0", 10) || 0;
    } catch {
      lastSubmit = 0;
    }
    const waited = Date.now() - lastSubmit;
    if (waited < SUBMIT_COOLDOWN_MS) {
      const retryAt = lastSubmit + SUBMIT_COOLDOWN_MS;
      setBlocked({
        reason: "\uBC29\uAE08 \uBCF4\uB0B4\uC2E0 \uBB38\uC758\uAC00 \uC811\uC218\uB410\uC2B5\uB2C8\uB2E4. \uC5F0\uB2EC\uC544 \uBCF4\uB0B4\uB294 \uAC83\uB9CC \uC7A0\uAE50 \uB9C9\uACE0 \uC788\uC2B5\uB2C8\uB2E4.",
        retryText: `\uC57D ${formatSeconds(Math.ceil((retryAt - Date.now()) / 1e3))} \uB4A4\uC5D0 \uB2E4\uC2DC \uBCF4\uB0BC \uC218 \uC788\uC2B5\uB2C8\uB2E4.`,
        retryAt
      });
      return;
    }
    setSending(true);
    setBlocked(null);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("message", data.message);
      formData.append("company_site", document.getElementById("company_site")?.value || "");
      formData.append("form_ts", String(startedAt));
      if (file) formData.append("file", file);
      const res = await fetch("/api/contact", { method: "POST", body: formData });
      const payload = await readJson(res);
      if (!res.ok) {
        setBlocked(describeFailure(res.status, payload));
        return;
      }
      try {
        localStorage.setItem(lastSubmitKey, String(Date.now()));
      } catch {
      }
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setData({ name: "", email: "", message: "" });
        clearFile();
        setErrors({});
      }, 5e3);
    } catch {
      setBlocked(describeFailure(0, null));
    } finally {
      setSending(false);
    }
  };
  return /* @__PURE__ */ React.createElement("form", { className: "form", onSubmit: submit, noValidate: true }, /* @__PURE__ */ React.createElement(FormStatus, { sent, successText: "\uBB38\uC758\uAC00 \uC804\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC601\uC5C5\uC77C \uAE30\uC900 1\uC77C \uB0B4 \uD68C\uC2E0\uB4DC\uB9BD\uB2C8\uB2E4." }), blocked && /* @__PURE__ */ React.createElement(
    FormBlocked,
    {
      ...blocked,
      mailSubject: `[\uC0C8\uACB0 \uBB38\uC758] ${data.name || ""}`.trim(),
      mailBody: data.message
    }
  ), /* @__PURE__ */ React.createElement(Honeypot, { startedAt }), /* @__PURE__ */ React.createElement(
    TextField,
    {
      id: "cfv2-name",
      label: "\uC774\uB984 / NAME",
      placeholder: "\uD64D\uAE38\uB3D9",
      autoComplete: "name",
      value: data.name,
      onChange: update("name", "cfv2-name"),
      error: errors["cfv2-name"]
    }
  ), /* @__PURE__ */ React.createElement(
    TextField,
    {
      id: "cfv2-email",
      label: "\uC774\uBA54\uC77C / EMAIL",
      type: "email",
      placeholder: "you@company.kr",
      autoComplete: "email",
      value: data.email,
      onChange: update("email", "cfv2-email"),
      error: errors["cfv2-email"]
    }
  ), /* @__PURE__ */ React.createElement(FormField, { id: "cfv2-msg", label: "\uBB38\uC758 \uB0B4\uC6A9 / MESSAGE", error: errors["cfv2-msg"] }, ({ describedBy, invalid, required }) => /* @__PURE__ */ React.createElement(
    "textarea",
    {
      id: "cfv2-msg",
      name: "cfv2-msg",
      placeholder: "\uC790\uC138\uD55C \uBB38\uC758 \uB0B4\uC6A9\uC744 \uC801\uC5B4\uC8FC\uC138\uC694.",
      "aria-required": required || void 0,
      "aria-invalid": invalid || void 0,
      "aria-describedby": describedBy,
      value: data.message,
      onChange: (e) => update("message", "cfv2-msg")(e.target.value)
    }
  )), /* @__PURE__ */ React.createElement(
    FileField,
    {
      id: "cfv2-file",
      label: "\uCCA8\uBD80\uD30C\uC77C / ATTACHMENT",
      optional: true,
      file,
      fileRef,
      onSelect: selectFile,
      error: fileError,
      note: `\uD55C \uAC1C\uB9CC \uCCA8\uBD80\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC5EC\uB7EC \uAC1C\uC774\uAC70\uB098 ${MAX_UPLOAD_LABEL}\uB97C \uB118\uC73C\uBA74 \uB4DC\uB77C\uC774\uBE0C \uB4F1\uC5D0 \uC62C\uB9B0 \uB9C1\uD06C\uB97C \uBB38\uC758 \uB0B4\uC6A9\uC5D0 \uC801\uC5B4\uC8FC\uC138\uC694.`
    }
  ), /* @__PURE__ */ React.createElement(FormActions, { sending, label: "\uBB38\uC758 \uBCF4\uB0B4\uAE30", hint: `\u2192 ${CONTACT_MAIL} \uB85C \uC804\uC1A1\uB429\uB2C8\uB2E4` }));
}
Object.assign(window, {
  useTheme,
  useFullScroll,
  useReveal,
  Nav,
  Footer,
  Brand,
  ContactForm,
  ClosingCTA,
  Icon,
  SectionDots,
  BackButton,
  FloatingBackButton,
  ContactButton,
  createContactNav,
  SNAP_ROUTES,
  FormStatus,
  FormField,
  TextField,
  FileField,
  FormActions,
  useFileSelect,
  FormBlocked,
  Honeypot,
  describeFailure,
  readJson,
  focusFirstError,
  formatSeconds,
  CONTACT_MAIL
});

/* ---- src/pages/home.jsx ---- */
function HomePage({ setRoute }) {
  const goContact = createContactNav(setRoute);
  const openRoute = (route) => {
    setRoute(route);
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const cardKey = (event, route) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openRoute(route);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { "data-screen-label": "01 Home" }, /* @__PURE__ */ React.createElement("section", { className: "hero", "data-section-label": "\uC778\uD2B8\uB85C" }, /* @__PURE__ */ React.createElement("div", { className: "hero-bg" }), /* @__PURE__ */ React.createElement("div", { className: "hero-glow" }), /* @__PURE__ */ React.createElement("div", { className: "hero-inner" }, /* @__PURE__ */ React.createElement("span", { className: "hero-tag" }, /* @__PURE__ */ React.createElement("span", { className: "blink" }), "KOREAN AI AGENT SECURITY \xB7 SINCE 2026"), /* @__PURE__ */ React.createElement("h1", null, "Securing the Future", /* @__PURE__ */ React.createElement("br", null), "of ", /* @__PURE__ */ React.createElement("span", { className: "accent-w" }, "Korean AI Agents.")), /* @__PURE__ */ React.createElement("p", { className: "hero-sub" }, "AI \uC5D0\uC774\uC804\uD2B8, \uB0B4\uBCF4\uB0B4\uB3C4 \uAD1C\uCC2E\uC740 \uC0C1\uD0DC\uC778\uC9C0 \uBA3C\uC800 \uD655\uC778\uD558\uC138\uC694.", /* @__PURE__ */ React.createElement("br", null), "\uC5EC\uC6B8\uC740 \uCD9C\uC2DC \uC9C1\uC804\uC758 \uD55C\uAD6D\uC5B4 AI \uC5D0\uC774\uC804\uD2B8\uC5D0 \uC2E4\uC81C \uACF5\uACA9\uC744 \uB123\uC5B4\uBCF4\uACE0 \uBC30\uD3EC \uC5EC\uBD80\uB97C \uD310\uC815\uD569\uB2C8\uB2E4.", /* @__PURE__ */ React.createElement("br", null)), /* @__PURE__ */ React.createElement("div", { className: "hero-cta" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-accent", onClick: () => {
    setRoute("product");
    window.scrollTo({ top: 0 });
  } }, "\uC11C\uBE44\uC2A4 \uC54C\uC544\uBCF4\uAE30 ", /* @__PURE__ */ React.createElement("span", { className: "arrow" }, "\u2192")), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost", onClick: () => {
    setRoute("team");
    window.scrollTo({ top: 0 });
  } }, "\uD300 \uC18C\uAC1C \uBCF4\uAE30 ", /* @__PURE__ */ React.createElement("span", { className: "arrow" }, "\u2192"))))), /* @__PURE__ */ React.createElement("section", { className: "block", id: "what-we-do", "data-section-label": "\uD558\uB294 \uC77C" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "WHAT WE DO"), /* @__PURE__ */ React.createElement("h2", null, "\uD55C\uAD6D\uC5B4\uB85C \uACF5\uACA9\uD574\uC57C", /* @__PURE__ */ React.createElement("br", null), "\uBCF4\uC774\uB294 \uAD6C\uBA4D\uC774 \uC788\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", null, "\uD55C\uAD6D\uC5B4\uB294 \uC870\uC0AC\uC640 \uC5B4\uBBF8\uAC00 \uBD99\uC5B4 \uAC19\uC740 \uB73B\uC744 \uC218\uC5C6\uC774 \uB2E4\uB974\uAC8C \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC601\uC5B4\uB97C \uAE30\uC900\uC73C\uB85C \uB9CC\uB4E0 \uD544\uD130\uB294 \uC774 \uBCC0\uD615\uC744 \uB300\uBD80\uBD84 \uB193\uCE69\uB2C8\uB2E4. \uC5EC\uC6B8\uC740 \uADF8 \uD615\uD0DC \uBCC0\uD615\uC744 \uACF5\uACA9 \uBC29\uBC95\uC73C\uB85C \uC0BC\uC544 \uC5D0\uC774\uC804\uD2B8\uB97C \uB450\uB4DC\uB824 \uBD05\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("div", { className: "cards" }, /* @__PURE__ */ React.createElement(
    "article",
    {
      className: "card card-link",
      role: "link",
      tabIndex: 0,
      onClick: () => openRoute("feature-shadow"),
      onKeyDown: (e) => cardKey(e, "feature-shadow")
    },
    /* @__PURE__ */ React.createElement("span", { className: "num" }, "01"),
    /* @__PURE__ */ React.createElement("div", { className: "ico" }, /* @__PURE__ */ React.createElement(Icon.shadow, null)),
    /* @__PURE__ */ React.createElement("h3", null, "Shadow Agent \uD0D0\uC9C0"),
    /* @__PURE__ */ React.createElement("p", null, "\uC784\uC9C1\uC6D0\uC774 \uC0AC\uB0B4 \uB370\uC774\uD130\uB85C \uB9CC\uB4E0 \uAC1C\uC778 AI \uC5D0\uC774\uC804\uD2B8\uAC00 \uB9CC\uB4DC\uB294 \uBCF4\uC548 \uC0AC\uAC01\uC9C0\uB300\uB97C \uC790\uB3D9\uC73C\uB85C \uBC1C\uACAC\uD558\uACE0 \uC704\uD5D8\uB3C4\uB97C \uD3C9\uAC00\uD569\uB2C8\uB2E4."),
    /* @__PURE__ */ React.createElement("span", { className: "more" }, "\uC790\uC138\uD788 \uBCF4\uAE30")
  ), /* @__PURE__ */ React.createElement(
    "article",
    {
      className: "card card-link",
      role: "link",
      tabIndex: 0,
      onClick: () => openRoute("feature-pii"),
      onKeyDown: (e) => cardKey(e, "feature-pii")
    },
    /* @__PURE__ */ React.createElement("span", { className: "num" }, "02"),
    /* @__PURE__ */ React.createElement("div", { className: "ico" }, /* @__PURE__ */ React.createElement(Icon.pii, null)),
    /* @__PURE__ */ React.createElement("h3", null, "K-PII \uCC28\uB2E8"),
    /* @__PURE__ */ React.createElement("p", null, "\uC8FC\uBBFC\uBC88\uD638\xB7\uC0AC\uC5C5\uC790\uBC88\uD638\xB7\uD55C\uAD6D\uC2DD \uC8FC\uC18C\xB7\uACC4\uC88C\xB7\uC6B4\uC804\uBA74\uD5C8 \uB4F1 \uD55C\uAD6D\uC2DD PII 14\uC885\uC744 \uC804\uC6A9 \uD0D0\uC9C0\uAE30\uB85C \uC2DD\uBCC4\uD558\uACE0 \uCC28\uB2E8\uD569\uB2C8\uB2E4."),
    /* @__PURE__ */ React.createElement("span", { className: "more" }, "\uC790\uC138\uD788 \uBCF4\uAE30")
  ), /* @__PURE__ */ React.createElement(
    "article",
    {
      className: "card card-link",
      role: "link",
      tabIndex: 0,
      onClick: () => openRoute("feature-report"),
      onKeyDown: (e) => cardKey(e, "feature-report")
    },
    /* @__PURE__ */ React.createElement("span", { className: "num" }, "03"),
    /* @__PURE__ */ React.createElement("div", { className: "ico" }, /* @__PURE__ */ React.createElement(Icon.report, null)),
    /* @__PURE__ */ React.createElement("h3", null, "\uC99D\uAC70 \uAE30\uBC18 \uB9AC\uD3EC\uD2B8"),
    /* @__PURE__ */ React.createElement("p", null, "\uCDE8\uC57D\uC810\uB9C8\uB2E4 \uC7AC\uD604\uD560 \uC218 \uC788\uB294 \uCD5C\uC18C\uD55C\uC758 \uC99D\uAC70\uB97C \uB2F4\uC740 PDF \uB9AC\uD3EC\uD2B8\uB97C \uB4DC\uB9BD\uB2C8\uB2E4. \uD45C\uC9C0\uC5D0\uB294 \uC774\uBC88 \uAC80\uC0AC\uAC00 \uC5B4\uB514\uAE4C\uC9C0 \uB2E4\uB918\uB294\uC9C0 \uC801\uC2B5\uB2C8\uB2E4."),
    /* @__PURE__ */ React.createElement("span", { className: "more" }, "\uC790\uC138\uD788 \uBCF4\uAE30")
  )), /* @__PURE__ */ React.createElement("div", { className: "stats", style: { marginTop: 64 } }, /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "154", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "\uC885")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uD615\uD0DC \uBCC0\uD615 \uACF5\uACA9 \uC720\uD615")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "97.4", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "%")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uD0D0\uC9C0\uC728 (recall)")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "5.3", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "%")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uC624\uD0D0\uB960")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "4", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "\uB2E8\uACC4")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uD310\uC815 \uAD6C\uBD84 (\uD655\uC815\xB7\uC758\uC2EC\xB7\uD1B5\uACFC\xB7\uBBF8\uAC80\uC0AC)"))), /* @__PURE__ */ React.createElement("p", { className: "stats-note" }, "\uB0B4\uBD80 \uD68C\uADC0 \uBCA4\uCE58\uB9C8\uD06C \uAE30\uC900\uC785\uB2C8\uB2E4."))), /* @__PURE__ */ React.createElement("section", { className: "block", "data-section-label": "\uD300", style: { paddingTop: 0, borderTop: "none" } }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "banner",
      role: "button",
      tabIndex: 0,
      onClick: () => {
        setRoute("team");
        window.scrollTo({ top: 0 });
      },
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          setRoute("team");
          window.scrollTo({ top: 0 });
        }
      }
    },
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "TEAM \xB7 \uC0C8\uACB0\uC744 \uB9CC\uB4DC\uB294 \uC0AC\uB78C\uB4E4"), /* @__PURE__ */ React.createElement("h3", null, "\uD55C\uAD6D AI \uBCF4\uC548\uC744 \uAC00\uC7A5 \uAC00\uAE4C\uC774\uC11C", /* @__PURE__ */ React.createElement("br", null), "\uB2E4\uB904\uC628 \uC0AC\uB78C\uB4E4."), /* @__PURE__ */ React.createElement("p", null, "\uC624\uD39C\uC2DC\uBE0C \uC2DC\uD050\uB9AC\uD2F0, LLM \uD3C9\uAC00, \uD55C\uAD6D\uD615 \uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4. \uC774 \uC138 \uC601\uC5ED\uC744 \uB2E4\uB904\uC628 \uC0AC\uB78C\uB4E4\uC774 \uC0C8\uACB0\uC758 \uAE30\uC220\uC744 \uB9CC\uB4ED\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "av-stack" }, /* @__PURE__ */ React.createElement("span", { className: "av" }, "JH"), /* @__PURE__ */ React.createElement("span", { className: "av" }, "YS"))),
    /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn btn-accent",
        onClick: (e) => {
          e.stopPropagation();
          setRoute("team");
          window.scrollTo({ top: 0 });
        }
      },
      "\uBC14\uB85C\uAC00\uAE30 ",
      /* @__PURE__ */ React.createElement("span", { className: "arrow" }, "\u2192")
    )
  ))), /* @__PURE__ */ React.createElement("section", { className: "block", id: "contact", "data-section-label": "\uBB38\uC758" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "contact-grid" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "CONTACT \xB7 INLINE"), /* @__PURE__ */ React.createElement("h2", { style: {
    margin: "16px 0 18px",
    fontSize: "clamp(32px, 4vw, 52px)",
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    fontWeight: 700
  } }, "\uC0C8\uACB0 \uD300\uC5D0", /* @__PURE__ */ React.createElement("br", null), "\uC9C1\uC811 \uBB38\uC758\uD574 \uC8FC\uC138\uC694."), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, color: "var(--text-2)", fontSize: 17, lineHeight: 1.7, maxWidth: 480 } }, "\uCD9C\uC2DC\uB97C \uC55E\uB454 \uC5D0\uC774\uC804\uD2B8\uB97C \uC810\uAC80\uD558\uACE0 \uC2F6\uC73C\uC2DC\uAC70\uB098 \uC5EC\uC6B8\uC774 \uC5B4\uB5A4 \uBC94\uC704\uB97C \uAC80\uC0AC\uD558\uB294\uC9C0 \uAD81\uAE08\uD558\uC2DC\uBA74 \uC544\uB798 \uC591\uC2DD\uC73C\uB85C \uBCF4\uB0B4\uC8FC\uC138\uC694. \uC601\uC5C5\uC77C \uAE30\uC900 1\uC77C \uB0B4 \uD68C\uC2E0\uB4DC\uB9BD\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "contact-meta" }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "EMAIL"), /* @__PURE__ */ React.createElement("span", { className: "mono" }, "contact@saegyeol.ai.kr")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "RESPONSE"), /* @__PURE__ */ React.createElement("span", { className: "mono" }, "24\uC2DC\uAC04 \uC774\uB0B4 (\uC5F0\uC911\uBB34\uD734)")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "FOR"), /* @__PURE__ */ React.createElement("span", null, "\uB3C4\uC785 \uBB38\uC758 \xB7 \uBCF4\uC548 \uAC80\uC99D \xB7 \uBCF4\uC548 \uC790\uBB38 \xB7 \uCC44\uC6A9 \uBB38\uC758")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "NDA"), /* @__PURE__ */ React.createElement("span", null, "\uC694\uCCAD \uC2DC \uCCB4\uACB0 \uAC00\uB2A5")))), /* @__PURE__ */ React.createElement(ContactForm, null)))), /* @__PURE__ */ React.createElement(ClosingCTA, { onContact: goContact }));
}
window.HomePage = HomePage;

/* ---- src/pages/team.jsx ---- */
const TEAM_MEMBERS_V2 = [
  { initials: "JH", name: "\uD669\uC9C0\uD6C4", role: "CEO / Founder", bio: "\uC18C\uD504\uD2B8\uC6E8\uC5B4\uB85C \uC138\uC0C1\uC744 \uBC14\uAFB8\uB294, \uB354 \uB098\uC740 \uC138\uC0C1\uC744 \uAFC8\uAFB8\uB2E4.", link: "https://www.notion.so/saegyeol/Hwang-Jihoo-31cb75833d178043a85ec6c11a1b2af8?source=copy_link" },
  { initials: "YS", name: "\uC2E0\uC720\uC2B9", role: "Full-Stack Engineer", bio: "\uC138\uC0C1\uC758 \uBB38\uC81C\uB97C \uCF54\uB4DC\uB85C \uD480\uACE0, \uC18C\uD504\uD2B8\uC6E8\uC5B4\uB85C \uB2F5\uC744 \uCC3E\uB2E4.", link: "https://app.notion.com/p/PoRTfoLio-9831ecbe58c883fca2aa81f08c64f30a?source=copy_link" }
];
function TeamPage({ setRoute }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [blocked, setBlocked] = useState(null);
  const startedAt = useRef(Date.now()).current;
  const { file, fileRef, fileError, setFileError, selectFile, clearFile } = useFileSelect();
  const validate = () => {
    const found = {};
    if (!name.trim()) found["rcv2-name"] = "\uC774\uB984\uC744 \uC801\uC5B4\uC8FC\uC138\uC694.";
    if (!email.trim()) found["rcv2-email"] = "\uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC801\uC5B4\uC8FC\uC138\uC694.";
    else if (!/\S+@\S+\.\S+/.test(email)) found["rcv2-email"] = "\uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694. (\uC608: you@mail.kr)";
    return found;
  };
  const submit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (!file) setFileError("\uD3EC\uD2B8\uD3F4\uB9AC\uC624 \uD30C\uC77C\uC744 \uCCA8\uBD80\uD574 \uC8FC\uC138\uC694.");
    if (Object.keys(found).length > 0 || !file) {
      setBlocked(null);
      if (Object.keys(found).length > 0) focusFirstError(found, ["rcv2-name", "rcv2-email"]);
      else document.getElementById("rcv2-file")?.parentElement?.querySelector(".file-drop")?.focus();
      return;
    }
    setSending(true);
    setBlocked(null);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("file", file);
      formData.append("company_site", document.getElementById("company_site")?.value || "");
      formData.append("form_ts", String(startedAt));
      const res = await fetch("/api/recruit", { method: "POST", body: formData });
      const payload = await readJson(res);
      if (!res.ok) {
        setBlocked(describeFailure(res.status, payload));
        return;
      }
      setSent(true);
      setTimeout(() => {
        setSent(false);
        clearFile();
        setName("");
        setEmail("");
        setErrors({});
      }, 4e3);
    } catch {
      setBlocked(describeFailure(0, null));
    } finally {
      setSending(false);
    }
  };
  const goContact = createContactNav(setRoute);
  return /* @__PURE__ */ React.createElement("div", { "data-screen-label": "02 Team" }, /* @__PURE__ */ React.createElement("section", { className: "page-hero", "data-section-label": "\uD300 \uC18C\uAC1C" }, /* @__PURE__ */ React.createElement("div", { className: "hero-bg" }), /* @__PURE__ */ React.createElement("div", { className: "container", style: { position: "relative" } }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "TEAM \xB7 \uC0C8\uACB0\uC744 \uB9CC\uB4DC\uB294 \uC0AC\uB78C\uB4E4"), /* @__PURE__ */ React.createElement("h1", null, "AI \uBCF4\uC548\uC744", /* @__PURE__ */ React.createElement("br", null), "\uBBFF\uACE0 \uB9E1\uAE38 \uC218 \uC788\uB294 \uD300"), /* @__PURE__ */ React.createElement("p", null, "\uC624\uD39C\uC2DC\uBE0C \uC2DC\uD050\uB9AC\uD2F0, LLM \uC5F0\uAD6C, \uD55C\uAD6D\uD615 \uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4. \uD55C\uAD6D AI \uC5D0\uC774\uC804\uD2B8 \uD658\uACBD\uC744 \uC624\uB798 \uB4E4\uC5EC\uB2E4\uBCF8 \uC0AC\uB78C\uB4E4\uC774 \uBAA8\uC600\uC2B5\uB2C8\uB2E4."))), /* @__PURE__ */ React.createElement("section", { className: "block", "data-section-label": "\uAD6C\uC131\uC6D0" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "team-grid" }, TEAM_MEMBERS_V2.map((m) => {
    const content = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "photo" }, m.initials), /* @__PURE__ */ React.createElement("div", { className: "role" }, m.role), /* @__PURE__ */ React.createElement("h3", null, m.name), /* @__PURE__ */ React.createElement("p", { className: "bio" }, m.bio), m.link && /* @__PURE__ */ React.createElement("div", { className: "visit" }, "VIEW PORTFOLIO"));
    return m.link ? /* @__PURE__ */ React.createElement("a", { key: m.initials, className: "member", href: m.link, target: "_blank", rel: "noreferrer" }, content) : /* @__PURE__ */ React.createElement("article", { key: m.initials, className: "member" }, content);
  })))), /* @__PURE__ */ React.createElement("section", { className: "block", id: "recruit", "data-section-label": "\uCC44\uC6A9" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "recruit" }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", zIndex: 1 } }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "JOIN US \xB7 \uCC44\uC6A9"), /* @__PURE__ */ React.createElement("h2", null, "\uD568\uAED8\uD560 \uC0AC\uB78C\uC744", /* @__PURE__ */ React.createElement("br", null), "\uCC3E\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", null, "\uC774\uB825\uC11C\uB4E0 \uD504\uB85C\uC81D\uD2B8\uB4E0, \uC368\uB454 \uAE00\uC774\uB098 \uBC1C\uD45C \uC601\uC0C1\uC774\uB4E0 \uD615\uC2DD\uC740 \uC790\uC720\uC785\uB2C8\uB2E4. \uC0C8\uACB0\uC774 \uD478\uB294 \uBB38\uC81C\uC5D0 \uD765\uBBF8\uAC00 \uC788\uB2E4\uBA74 \uAC00\uBCCD\uAC8C\uB77C\uB3C4 \uBCF4\uB0B4\uC8FC\uC138\uC694. contact@saegyeol.ai.kr \uB85C \uC804\uB2EC\uB429\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "tags" }, /* @__PURE__ */ React.createElement("span", { className: "tag" }, "Offensive Eng."), /* @__PURE__ */ React.createElement("span", { className: "tag" }, "LLM Researcher"), /* @__PURE__ */ React.createElement("span", { className: "tag" }, "Compliance"), /* @__PURE__ */ React.createElement("span", { className: "tag" }, "Product Design"), /* @__PURE__ */ React.createElement("span", { className: "tag" }, "Open Application"))), /* @__PURE__ */ React.createElement("form", { className: "form", onSubmit: submit, noValidate: true, style: { position: "relative", zIndex: 1 } }, /* @__PURE__ */ React.createElement(FormStatus, { sent, successText: "\uC9C0\uC6D0\uC11C\uAC00 \uC804\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4." }), blocked && /* @__PURE__ */ React.createElement(
    FormBlocked,
    {
      ...blocked,
      mailSubject: `[Saegyeol \uC9C0\uC6D0] ${name || ""}`.trim(),
      mailBody: `\uC9C0\uC6D0\uC790: ${name}
\uC774\uBA54\uC77C: ${email}

\uD3EC\uD2B8\uD3F4\uB9AC\uC624 \uD30C\uC77C\uC744 \uCCA8\uBD80\uD574 \uC8FC\uC138\uC694.`
    }
  ), /* @__PURE__ */ React.createElement(Honeypot, { startedAt }), /* @__PURE__ */ React.createElement(
    TextField,
    {
      id: "rcv2-name",
      label: "\uC774\uB984 / NAME",
      placeholder: "\uD64D\uAE38\uB3D9",
      autoComplete: "name",
      value: name,
      error: errors["rcv2-name"],
      onChange: (v) => {
        setName(v);
        setErrors((p) => p["rcv2-name"] ? { ...p, "rcv2-name": "" } : p);
      }
    }
  ), /* @__PURE__ */ React.createElement(
    TextField,
    {
      id: "rcv2-email",
      label: "\uC774\uBA54\uC77C / EMAIL",
      type: "email",
      placeholder: "you@mail.kr",
      autoComplete: "email",
      value: email,
      error: errors["rcv2-email"],
      onChange: (v) => {
        setEmail(v);
        setErrors((p) => p["rcv2-email"] ? { ...p, "rcv2-email": "" } : p);
      }
    }
  ), /* @__PURE__ */ React.createElement(
    FileField,
    {
      id: "rcv2-file",
      label: "\uD3EC\uD2B8\uD3F4\uB9AC\uC624 / FREE FORMAT",
      file,
      fileRef,
      onSelect: selectFile,
      error: fileError,
      note: `\uD55C \uAC1C\uB9CC \uCCA8\uBD80\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC601\uC0C1\uC774\uAC70\uB098 ${MAX_UPLOAD_LABEL}\uB97C \uB118\uC73C\uBA74 \uB4DC\uB77C\uC774\uBE0C \uB4F1\uC5D0 \uC62C\uB9B0 \uB9C1\uD06C\uB97C ${CONTACT_MAIL}\uB85C \uBCF4\uB0B4\uC8FC\uC138\uC694.`
    }
  ), /* @__PURE__ */ React.createElement(FormActions, { sending, label: "\uC9C0\uC6D0\uD558\uAE30", hint: `\u2192 ${CONTACT_MAIL} \uB85C \uC804\uC1A1\uB429\uB2C8\uB2E4` }))))), /* @__PURE__ */ React.createElement(ClosingCTA, { onContact: goContact, prefill: "\uC0C8\uACB0 \uD300\uC5D0 \uBB38\uC758\uD569\uB2C8\uB2E4." }));
}
window.TeamPage = TeamPage;

/* ---- src/pages/product.jsx ---- */
function ProductPage({ setRoute }) {
  const goContact = createContactNav(setRoute);
  const openRoute = (route) => {
    setRoute(route);
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const cardKey = (event, route) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openRoute(route);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { "data-screen-label": "03 Product \xB7 \uC5EC\uC6B8" }, /* @__PURE__ */ React.createElement("section", { className: "page-hero", "data-section-label": "\uC5EC\uC6B8 \uC18C\uAC1C" }, /* @__PURE__ */ React.createElement("div", { className: "hero-bg" }), /* @__PURE__ */ React.createElement("div", { className: "container", style: { position: "relative" } }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "PRODUCT \xB7 \uC5EC\uC6B8"), /* @__PURE__ */ React.createElement("h1", null, "\uB0B4\uBCF4\uB0B4\uB3C4 \uB418\uB294\uC9C0,", /* @__PURE__ */ React.createElement("br", null), "\uB0B4\uBCF4\uB0B4\uAE30 \uC804\uC5D0", /* @__PURE__ */ React.createElement("br", null), "\uD655\uC778\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", null, "\uC5EC\uC6B8\uC740 \uD55C\uAD6D\uC5B4 AI \uC5D0\uC774\uC804\uD2B8 \uCE68\uD22C \uD14C\uC2A4\uD2B8 \uC11C\uBE44\uC2A4\uC785\uB2C8\uB2E4. \uCD9C\uC2DC\uB97C \uC55E\uB454 \uC5D0\uC774\uC804\uD2B8\uC5D0 \uD55C\uAD6D\uC5B4 \uACF5\uACA9\uC744 \uB123\uC5B4\uBCF4\uACE0 \uBC30\uD3EC\uD574\uB3C4 \uB418\uB294\uC9C0 \uD310\uC815\uD569\uB2C8\uB2E4. \uC9C0\uAE08\uC740 \uCD9C\uC2DC\uB97C \uC900\uBE44\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "hero-cta", style: { marginTop: 36 } }, /* @__PURE__ */ React.createElement(ContactButton, { onContact: goContact, prefill: "\uC5EC\uC6B8 \uB3C4\uC785\uC744 \uBB38\uC758\uD569\uB2C8\uB2E4." }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost", onClick: () => openRoute("pricing") }, "\uC694\uAE08\uC81C \uBCF4\uAE30 ", /* @__PURE__ */ React.createElement("span", { className: "arrow" }, "\u2192"))))), /* @__PURE__ */ React.createElement("section", { className: "block", "data-section-label": "WHY \uC5EC\uC6B8", style: { paddingBottom: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "WHY \uC5EC\uC6B8"), /* @__PURE__ */ React.createElement("h2", null, "\uC870\uC0AC \uD558\uB098\uB9CC \uBC14\uAFD4\uB3C4", /* @__PURE__ */ React.createElement("br", null), "\uD544\uD130\uB294 \uADF8\uB0E5 \uC9C0\uB098\uAC11\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", null, "\uD55C\uAD6D\uC5B4\uB294 \uC870\uC0AC\uC640 \uC5B4\uBBF8\uAC00 \uBD99\uC5B4 \uAC19\uC740 \uC694\uAD6C\uB97C \uC218\uC5C6\uC774 \uB2E4\uB974\uAC8C \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC5EC\uC6B8\uC740 \uC774 \uAD50\uCC29\uC5B4 \uD615\uD0DC\uB860\uC744 \uACF5\uACA9 \uBC29\uBC95\uB860\uC73C\uB85C \uC0BC\uC544, \uC870\uC0AC\xB7\uC5B4\uBBF8\xB7\uB3D9\uC758\uC5B4\uB97C \uBC14\uAFD4\uAC00\uBA70 \uAC19\uC740 \uACF5\uACA9\uC744 \uB2E4\uC2DC \uC2DC\uB3C4\uD569\uB2C8\uB2E4. \uC601\uC5B4 \uAE30\uC900\uC73C\uB85C \uB9CC\uB4E0 \uD544\uD130\uAC00 \uB193\uCE58\uB294 \uAD6C\uC870\uC801 \uCDE8\uC57D\uC810\uC774 \uC5EC\uAE30\uC11C \uB4DC\uB7EC\uB0A9\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("div", { className: "stats" }, /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "154", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "\uC885")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uD615\uD0DC \uBCC0\uD615 \uACF5\uACA9 \uC720\uD615")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "97.4", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "%")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uD0D0\uC9C0\uC728 (recall)")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "5.3", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "%")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uC624\uD0D0\uB960")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "4", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "\uB2E8\uACC4")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uD310\uC815 \uAD6C\uBD84 (\uD655\uC815\xB7\uC758\uC2EC\xB7\uD1B5\uACFC\xB7\uBBF8\uAC80\uC0AC)"))), /* @__PURE__ */ React.createElement("p", { className: "stats-note" }, "\uB0B4\uBD80 \uD68C\uADC0 \uBCA4\uCE58\uB9C8\uD06C \uAE30\uC900\uC785\uB2C8\uB2E4. \uAD00\uB828 \uC5F0\uAD6C\uB294 ACK2026 \uD559\uC220\uB300\uD68C\uC5D0 \uB17C\uBB38\uC73C\uB85C \uC81C\uCD9C\uD588\uC2B5\uB2C8\uB2E4."))), /* @__PURE__ */ React.createElement("section", { className: "block", id: "features", "data-section-label": "\uD575\uC2EC \uAE30\uB2A5" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "CORE CAPABILITIES \xB7 03"), /* @__PURE__ */ React.createElement("h2", null, "\uD575\uC2EC \uAE30\uB2A5 \uC138 \uAC00\uC9C0."), /* @__PURE__ */ React.createElement("p", null, "\uD55C\uAD6D \uAE30\uC5C5 \uD658\uACBD\uC5D0\uC11C \uAC00\uC7A5 \uC790\uC8FC \uBC1C\uACAC\uB418\uB294 \uBCF4\uC548 \uC0AC\uAC01\uC9C0\uB300\uB97C \uC815\uBA74\uC73C\uB85C \uB2E4\uB8E8\uB294 \uC138 \uAC00\uC9C0 \uAE30\uB2A5\uC785\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("div", { className: "cards" }, /* @__PURE__ */ React.createElement(
    "article",
    {
      className: "card card-link",
      role: "link",
      tabIndex: 0,
      onClick: () => openRoute("feature-shadow"),
      onKeyDown: (e) => cardKey(e, "feature-shadow")
    },
    /* @__PURE__ */ React.createElement("span", { className: "num" }, "01"),
    /* @__PURE__ */ React.createElement("div", { className: "ico" }, /* @__PURE__ */ React.createElement(Icon.shadow, null)),
    /* @__PURE__ */ React.createElement("h3", null, "Shadow Agent \uD0D0\uC9C0"),
    /* @__PURE__ */ React.createElement("p", null, "\uC784\uC9C1\uC6D0\uC774 \uC0AC\uB0B4 \uB370\uC774\uD130\uB85C \uB9CC\uB4E0 \uAC1C\uC778 AI \uC5D0\uC774\uC804\uD2B8(ChatGPT GPTs, MCP \uD074\uB77C\uC774\uC5B8\uD2B8 \uB4F1)\uAC00 \uB9CC\uB4DC\uB294 \uBCF4\uC548 \uC0AC\uAC01\uC9C0\uB300\uB97C \uC790\uB3D9\uC73C\uB85C \uBC1C\uACAC\uD558\uACE0, \uB370\uC774\uD130 \uB178\uCD9C \uC704\uD5D8\uB3C4\uB97C \uD3C9\uAC00\uD569\uB2C8\uB2E4."),
    /* @__PURE__ */ React.createElement("span", { className: "more" }, "\uC790\uC138\uD788 \uBCF4\uAE30")
  ), /* @__PURE__ */ React.createElement(
    "article",
    {
      className: "card card-link",
      role: "link",
      tabIndex: 0,
      onClick: () => openRoute("feature-pii"),
      onKeyDown: (e) => cardKey(e, "feature-pii")
    },
    /* @__PURE__ */ React.createElement("span", { className: "num" }, "02"),
    /* @__PURE__ */ React.createElement("div", { className: "ico" }, /* @__PURE__ */ React.createElement(Icon.pii, null)),
    /* @__PURE__ */ React.createElement("h3", null, "K-PII \uCC28\uB2E8"),
    /* @__PURE__ */ React.createElement("p", null, "\uC8FC\uBBFC\uBC88\uD638\xB7\uC0AC\uC5C5\uC790\uBC88\uD638\xB7\uD55C\uAD6D\uC2DD \uC8FC\uC18C\xB7\uACC4\uC88C\xB7\uC6B4\uC804\uBA74\uD5C8 \uB4F1 \uD55C\uAD6D\uC2DD PII 14\uC885\uC744 \uC804\uC6A9 \uD0D0\uC9C0\uAE30\uB85C \uC2DD\uBCC4\uD558\uACE0, \uC5D0\uC774\uC804\uD2B8\uAC00 \uC678\uBD80\uB85C \uC720\uCD9C\uD558\uAE30 \uC804\uC5D0 \uCC28\uB2E8\uD569\uB2C8\uB2E4."),
    /* @__PURE__ */ React.createElement("span", { className: "more" }, "\uC790\uC138\uD788 \uBCF4\uAE30")
  ), /* @__PURE__ */ React.createElement(
    "article",
    {
      className: "card card-link",
      role: "link",
      tabIndex: 0,
      onClick: () => openRoute("feature-report"),
      onKeyDown: (e) => cardKey(e, "feature-report")
    },
    /* @__PURE__ */ React.createElement("span", { className: "num" }, "03"),
    /* @__PURE__ */ React.createElement("div", { className: "ico" }, /* @__PURE__ */ React.createElement(Icon.report, null)),
    /* @__PURE__ */ React.createElement("h3", null, "\uC99D\uAC70 \uAE30\uBC18 \uB9AC\uD3EC\uD2B8"),
    /* @__PURE__ */ React.createElement("p", null, "\uCDE8\uC57D\uC810\uB9C8\uB2E4 \uC7AC\uD604\uD560 \uC218 \uC788\uB294 \uCD5C\uC18C\uD55C\uC758 \uC99D\uAC70\uB97C \uB2F4\uC740 PDF \uB9AC\uD3EC\uD2B8\uB97C \uB4DC\uB9BD\uB2C8\uB2E4. \uD45C\uC9C0\uC5D0\uB294 \uC774\uBC88 \uAC80\uC0AC\uAC00 \uC5B4\uB514\uAE4C\uC9C0 \uB2E4\uB918\uB294\uC9C0 \uC801\uC2B5\uB2C8\uB2E4."),
    /* @__PURE__ */ React.createElement("span", { className: "more" }, "\uC790\uC138\uD788 \uBCF4\uAE30")
  )))), /* @__PURE__ */ React.createElement("section", { className: "block", id: "how-it-works", "data-section-label": "\uAC80\uC0AC \uC808\uCC28" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "HOW IT WORKS \xB7 03 STEPS"), /* @__PURE__ */ React.createElement("h2", null, "\uB0A8\uC758 \uC11C\uBE44\uC2A4\uB97C", /* @__PURE__ */ React.createElement("br", null), "\uD568\uBD80\uB85C \uB450\uB4DC\uB9AC\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", null, "\uCE68\uD22C \uD14C\uC2A4\uD2B8\uB294 \uC2E4\uC81C \uACF5\uACA9\uC744 \uBCF4\uB0B4\uB294 \uC77C\uC785\uB2C8\uB2E4. \uC5EC\uC6B8\uC740 \uAC80\uC0AC\uD560 \uAD8C\uD55C\uC774 \uC788\uB294\uC9C0 \uBA3C\uC800 \uD655\uC778\uD558\uACE0, \uAC80\uC0AC \uC9C1\uC804\uC5D0 \uB2E4\uC2DC \uD55C\uBC88 \uC2B9\uB099\uC744 \uBC1B\uC740 \uB4A4\uC5D0\uB9CC \uC2DC\uC791\uD569\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("div", { className: "flow" }, /* @__PURE__ */ React.createElement("div", { className: "flow-step" }, /* @__PURE__ */ React.createElement("span", { className: "step-num" }, "STEP 01"), /* @__PURE__ */ React.createElement("h4", null, "\uAD8C\uD55C \uD655\uC778"), /* @__PURE__ */ React.createElement("p", null, "\uB3C4\uBA54\uC778 \uC18C\uC720\uAD8C\uC744 \uAC80\uC99D\uD55C \uB4A4\uC5D0\uB9CC \uAC80\uC0AC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uAC80\uC0AC\uB97C \uC2DC\uC791\uD558\uAE30 \uC9C1\uC804\uC5D0 \uD55C \uBC88 \uB354 \uAC1C\uBCC4 \uC2B9\uB099\uC744 \uBC1B\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "terminal" }, "verify domain \xB7 confirm consent")), /* @__PURE__ */ React.createElement("div", { className: "flow-step" }, /* @__PURE__ */ React.createElement("span", { className: "step-num" }, "STEP 02"), /* @__PURE__ */ React.createElement("h4", null, "\uD615\uD0DC \uBCC0\uD615 \uACF5\uACA9"), /* @__PURE__ */ React.createElement("p", null, "\uC870\uC0AC\xB7\uC5B4\uBBF8\xB7\uB3D9\uC758\uC5B4\uB97C \uBC14\uAFD4\uAC00\uBA70 \uAC19\uC740 \uACF5\uACA9\uC744 \uB2E4\uC2DC \uC2DC\uB3C4\uD569\uB2C8\uB2E4. \uC9C4\uD589 \uC911 \uC5B8\uC81C\uB4E0 \uC989\uC2DC \uC911\uB2E8(Kill Switch)\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "terminal" }, "mutate josa \xB7 eomi \xB7 synonym")), /* @__PURE__ */ React.createElement("div", { className: "flow-step" }, /* @__PURE__ */ React.createElement("span", { className: "step-num" }, "STEP 03"), /* @__PURE__ */ React.createElement("h4", null, "\uD310\uC815\uACFC \uB9AC\uD3EC\uD2B8"), /* @__PURE__ */ React.createElement("p", null, "\uACB0\uACFC\uB97C \uD655\uC815\xB7\uC758\uC2EC\xB7\uD1B5\uACFC\xB7\uBBF8\uAC80\uC0AC \uB124 \uB2E8\uACC4\uB85C \uB098\uB220 \uC54C\uB824\uB4DC\uB9BD\uB2C8\uB2E4. \uC800\uC7A5 \uC804 \uAC1C\uC778\uC815\uBCF4\uB294 \uB9C8\uC2A4\uD0B9\uD558\uACE0, \uB370\uC774\uD130 \uC720\uD615\uBCC4\uB85C \uC790\uB3D9 \uD30C\uAE30\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "terminal" }, "CONFIRMED \xB7 SUSPECTED \xB7 CLEAN \xB7 UNTESTED"))), /* @__PURE__ */ React.createElement("div", { className: "honesty-note", style: { marginTop: 48 } }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "WHAT WE DO NOT SAY"), /* @__PURE__ */ React.createElement("h3", null, '"100% \uC548\uC804"\uC774\uB77C\uACE0 \uB9D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.'), /* @__PURE__ */ React.createElement("p", null, "\uC5EC\uC6B8\uC774 \uD655\uC778\uD574 \uB4DC\uB9AC\uB294 \uAC83\uC740 \uC54C\uB824\uC9C4 \uACF5\uACA9 \uBC94\uC704 \uC548\uC5D0\uC11C \uD1B5\uACFC\uD588\uB2E4\uB294 \uC0AC\uC2E4\uC785\uB2C8\uB2E4. \uAC80\uC0AC\uD558\uC9C0 \uBABB\uD55C \uBC94\uC704\uB294 \uB9AC\uD3EC\uD2B8\uC5D0 \uBBF8\uAC80\uC0AC(UNTESTED)\uB85C \uB0A8\uAE30\uACE0 \uD45C\uC9C0\uC5D0 \uADF8\uB300\uB85C \uC801\uC2B5\uB2C8\uB2E4. \uBB34\uC5C7\uC744 \uD655\uC778\uD588\uB294\uC9C0\uB9CC\uD07C \uBB34\uC5C7\uC744 \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uB294\uC9C0\uB3C4 \uC54C\uC544\uC57C \uD310\uB2E8\uD560 \uC218 \uC788\uAE30 \uB54C\uBB38\uC785\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 56, display: "flex", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(ContactButton, { onContact: goContact, prefill: "\uC5EC\uC6B8 \uAC80\uC0AC \uC808\uCC28\uC5D0 \uB300\uD574 \uBB38\uC758\uD569\uB2C8\uB2E4." })))), /* @__PURE__ */ React.createElement(ClosingCTA, { onContact: goContact, prefill: "\uC5EC\uC6B8 \uB3C4\uC785\uC744 \uBB38\uC758\uD569\uB2C8\uB2E4." }));
}
window.ProductPage = ProductPage;

/* ---- src/pages/pricing.jsx ---- */
function PricingPage({ setRoute }) {
  const goContact = createContactNav(setRoute);
  const askAbout = (subject) => goContact(`${subject} \uC694\uAE08\uC81C \uB3C4\uC785\uC744 \uBB38\uC758\uD569\uB2C8\uB2E4.`);
  const plans = [
    {
      id: "free",
      name: "\uBB34\uB8CC",
      caption: "\uCC98\uC74C \uD55C \uBC88 \uAC80\uC0AC\uD574 \uBCFC \uB54C",
      features: [
        "\uC804\uCCB4 \uD0D0\uC9C0 + \uD615\uD0DC \uBCC0\uD615 \uACF5\uACA9",
        "\uC7AC\uD604 \uAC00\uB2A5\uD55C \uC99D\uAC70\uAC00 \uB2F4\uAE34 \uB9AC\uD3EC\uD2B8",
        "\uBC1C\uACAC\uB41C \uBB38\uC81C\uC758 \uC870\uCE58 \uAC00\uC774\uB4DC",
        "\uC7AC\uAC80\uC0AC 24\uC2DC\uAC04\uB2F9 1\uD68C",
        "\uD1B5\uACFC \uC778\uC99D \uC5C6\uC74C"
      ]
    },
    {
      id: "pro",
      name: "\uD504\uB85C",
      caption: "\uACE0\uCE5C \uB4A4 \uB2E4\uC2DC \uAC80\uC0AC\uD558\uB294 \uC77C\uC774 \uC7A6\uC744 \uB54C",
      featured: true,
      features: [
        "\uBB34\uB8CC \uAE30\uB2A5 \uC804\uBD80 \uD3EC\uD568",
        "\uC7AC\uAC80\uC0AC \uBB34\uC81C\uD55C (\uCFE8\uB2E4\uC6B4 \uC5C6\uC74C)",
        "\uD1B5\uACFC \uC778\uC99D\uC11C \uBC1C\uAE09",
        "\uAD00\uB828 \uAE30\uC900 \uCC38\uACE0 \uC790\uB8CC \uC635\uC158",
        "\uC7AC\uAC80\uC0AC \uC774\uB825 \uAD00\uB9AC"
      ]
    },
    {
      id: "franchise",
      name: "\uD504\uB79C\uCC28\uC774\uC988",
      caption: "\uC5D0\uC774\uC804\uD2B8\uAC00 \uC5EC\uB7FF\uC774\uAC70\uB098 \uB0B4\uBD80\uB9DD\uC5D0 \uB46C\uC57C \uD560 \uB54C",
      features: [
        "\uD504\uB85C \uAE30\uB2A5 \uC804\uBD80 \uD3EC\uD568",
        "\uC5EC\uB7EC \uC5D0\uC774\uC804\uD2B8 \uC790\uC0B0 \uB2E8\uC704",
        "\uC628\uD504\uB808\uBBF8\uC2A4 \uBC30\uD3EC",
        "\uC804\uC6A9 \uC9C0\uC6D0",
        "\uAC10\uC0AC \uB300\uC751\uC6A9 \uB9AC\uD3EC\uD2B8"
      ]
    }
  ];
  const rows = [
    ["\uD0D0\uC9C0 \uC5D4\uC9C4", "\uB3D9\uC77C", "\uB3D9\uC77C", "\uB3D9\uC77C"],
    ["\uC99D\uAC70 \uAE30\uBC18 \uB9AC\uD3EC\uD2B8", "\uD3EC\uD568", "\uD3EC\uD568", "\uD3EC\uD568"],
    ["\uC7AC\uAC80\uC0AC", "24\uC2DC\uAC04\uB2F9 1\uD68C", "\uBB34\uC81C\uD55C", "\uBB34\uC81C\uD55C"],
    ["\uD1B5\uACFC \uC778\uC99D\uC11C", "\uBBF8\uC81C\uACF5", "\uC81C\uACF5", "\uC81C\uACF5"],
    ["\uAD00\uB828 \uAE30\uC900 \uCC38\uACE0 \uC790\uB8CC", "\uBBF8\uC81C\uACF5", "\uC635\uC158", "\uAC10\uC0AC \uB300\uC751\uD615"],
    ["\uC7AC\uAC80\uC0AC \uC774\uB825", "\uBBF8\uC81C\uACF5", "\uAD00\uB9AC", "\uC790\uC0B0 \uB2E8\uC704 \uAD00\uB9AC"],
    ["\uBC30\uD3EC \uBC29\uC2DD", "\uD074\uB77C\uC6B0\uB4DC", "\uD074\uB77C\uC6B0\uB4DC", "\uC628\uD504\uB808\uBBF8\uC2A4 \uC9C0\uC6D0"],
    ["\uC9C0\uC6D0", "\uAE30\uBCF8", "\uAE30\uBCF8", "\uC804\uC6A9 \uC9C0\uC6D0"]
  ];
  return /* @__PURE__ */ React.createElement("div", { "data-screen-label": "Pricing \xB7 \uC5EC\uC6B8" }, /* @__PURE__ */ React.createElement("section", { className: "page-hero pricing-hero", "data-section-label": "\uC694\uAE08 \uC548\uB0B4" }, /* @__PURE__ */ React.createElement("div", { className: "hero-bg" }), /* @__PURE__ */ React.createElement("div", { className: "container", style: { position: "relative" } }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "PRODUCT \xB7 \uC5EC\uC6B8 \xB7 PRICING"), /* @__PURE__ */ React.createElement("h1", null, "\uB6AB\uB294 \uB2A5\uB825\uC740 \uAC19\uACE0,", /* @__PURE__ */ React.createElement("br", null), "\uB2E4\uC2DC \uAC80\uC0AC\uD558\uB294 \uD69F\uC218\uAC00 \uB2E4\uB985\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", null, "\uBE44\uC2FC \uD50C\uB79C\uC774\uB77C\uACE0 \uB354 \uC798 \uCC3E\uC544\uB0B4\uC9C0\uB294 \uC54A\uC2B5\uB2C8\uB2E4. \uC5B4\uB290 \uD50C\uB79C\uC774\uB4E0 \uAC19\uC740 \uC5D4\uC9C4\uC73C\uB85C \uAC80\uC0AC\uD569\uB2C8\uB2E4. \uAC08\uB9AC\uB294 \uAC74 \uBA87 \uBC88\uC774\uB098 \uB2E4\uC2DC \uAC80\uC0AC\uD560 \uC218 \uC788\uB294\uC9C0, \uC778\uC99D\uC11C\uB97C \uBC1B\uB294\uC9C0, \uC5B4\uB514\uC5D0 \uC124\uCE58\uD558\uB294\uC9C0\uC785\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", { className: "pricing-pending" }, "\uC694\uAE08\uC81C\uB294 \uCD9C\uC2DC\uC640 \uD568\uAED8 \uACF5\uAC1C\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "hero-cta", style: { marginTop: 36 } }, /* @__PURE__ */ React.createElement("a", { className: "btn btn-accent", href: "#plans", onClick: (e) => {
    e.preventDefault();
    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" });
  } }, "\uD50C\uB79C \uBE44\uAD50 ", /* @__PURE__ */ React.createElement("span", { className: "arrow" }, "\u2193")), /* @__PURE__ */ React.createElement(ContactButton, { onContact: goContact, prefill: "\uC5EC\uC6B8 \uB3C4\uC785\uC744 \uBB38\uC758\uD569\uB2C8\uB2E4.", variant: "ghost" })))), /* @__PURE__ */ React.createElement("section", { className: "block", id: "plans", "data-section-label": "\uD50C\uB79C" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "PLANS \xB7 03"), /* @__PURE__ */ React.createElement("h2", null, "\uC138 \uD50C\uB79C, \uD55C\uB208\uC5D0."), /* @__PURE__ */ React.createElement("p", null, "\uC6B0\uC120 \uBB34\uB8CC\uB85C \uD55C \uBC88 \uAC80\uC0AC\uD574 \uBCF4\uC138\uC694. \uACE0\uCE58\uACE0 \uB2E4\uC2DC \uD655\uC778\uD558\uB294 \uC77C\uC774 \uC7A6\uC544\uC9C0\uBA74 \uD504\uB85C\uC785\uB2C8\uB2E4. \uC5D0\uC774\uC804\uD2B8\uAC00 \uC5EC\uB7FF\uC774\uAC70\uB098 \uB0B4\uBD80\uB9DD\uC5D0 \uB46C\uC57C \uD55C\uB2E4\uBA74 \uD504\uB79C\uCC28\uC774\uC988\uB97C \uBCF4\uC2DC\uBA74 \uB429\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", { className: "pricing-pending" }, "\uAE08\uC561\uC740 \uC544\uC9C1 \uC815\uD558\uB294 \uC911\uC785\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("div", { className: "pricing-grid" }, plans.map((plan) => /* @__PURE__ */ React.createElement("article", { key: plan.id, className: `pricing-card${plan.featured ? " featured" : ""}` }, plan.featured && /* @__PURE__ */ React.createElement("span", { className: "pricing-recommend" }, "RECOMMENDED"), /* @__PURE__ */ React.createElement("div", { className: "pricing-card-head" }, /* @__PURE__ */ React.createElement("h3", null, plan.name), /* @__PURE__ */ React.createElement("p", null, plan.caption)), /* @__PURE__ */ React.createElement("ul", null, plan.features.map((feature) => /* @__PURE__ */ React.createElement("li", { key: feature }, feature))), /* @__PURE__ */ React.createElement(
    ContactButton,
    {
      onContact: () => askAbout(plan.name),
      variant: plan.featured ? "accent" : "ghost"
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "honesty-note" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "HONESTY PRINCIPLE"), /* @__PURE__ */ React.createElement("h3", null, "\uD0D0\uC9C0 \uC815\uD655\uB3C4\uB85C \uB4F1\uAE09\uC744 \uB098\uB204\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", null, "\uC138 \uD50C\uB79C\uC758 \uCC28\uC774\uB294 \uB2E4\uC2DC \uAC80\uC0AC\uD560 \uC218 \uC788\uB294 \uD69F\uC218\uC640 \uC124\uCE58 \uC704\uCE58\uBFD0\uC785\uB2C8\uB2E4. \uB9AC\uD3EC\uD2B8\uB3C4 \uC548\uC804\uC744 \uBCF4\uC99D\uD558\uB294 \uBB38\uC11C\uAC00 \uC544\uB2D9\uB2C8\uB2E4. \uBB34\uC5C7\uC744 \uC5B4\uB514\uAE4C\uC9C0, \uC5B8\uC81C \uAE30\uC900\uC73C\uB85C \uAC80\uC0AC\uD588\uB294\uC9C0 \uC801\uC5B4 \uB454 \uC131\uC801\uC11C\uC5D0 \uAC00\uAE5D\uC2B5\uB2C8\uB2E4.")))), /* @__PURE__ */ React.createElement("section", { className: "block pricing-compare-section", "data-section-label": "\uBE44\uAD50" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "COMPARE"), /* @__PURE__ */ React.createElement("h2", null, "\uC5B4\uB5BB\uAC8C \uC6B4\uC601\uD560\uC9C0\uC5D0 \uB9DE\uCDB0 \uACE0\uB974\uC138\uC694."), /* @__PURE__ */ React.createElement("p", null, "\uAC80\uC0AC \uC131\uB2A5\uC740 \uC138 \uD50C\uB79C\uC774 \uAC19\uC2B5\uB2C8\uB2E4. \uD45C\uC5D0\uC11C \uAC08\uB9AC\uB294 \uAC74 \uD69F\uC218\uC640 \uC778\uC99D\uC11C, \uC124\uCE58 \uC704\uCE58\uC785\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", { className: "only-mobile" }, "\uD45C\uB97C \uC88C\uC6B0\uB85C \uBC00\uC5B4\uC11C \uBCF4\uC138\uC694.")), /* @__PURE__ */ React.createElement("div", { className: "pricing-table-wrap", role: "region", "aria-label": "\uC5EC\uC6B8 \uC694\uAE08\uC81C \uBE44\uAD50\uD45C", tabIndex: 0 }, /* @__PURE__ */ React.createElement("table", { className: "pricing-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "\uAD6C\uBD84"), /* @__PURE__ */ React.createElement("th", null, "\uBB34\uB8CC"), /* @__PURE__ */ React.createElement("th", null, "\uD504\uB85C"), /* @__PURE__ */ React.createElement("th", null, "\uD504\uB79C\uCC28\uC774\uC988"))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((row) => /* @__PURE__ */ React.createElement("tr", { key: row[0] }, row.map((cell, index) => index === 0 ? /* @__PURE__ */ React.createElement("th", { key: cell, scope: "row" }, cell) : /* @__PURE__ */ React.createElement("td", { key: `${row[0]}-${cell}` }, cell))))))))), /* @__PURE__ */ React.createElement("section", { className: "block", "data-section-label": "\uC790\uC8FC \uBB3B\uB294 \uB0B4\uC6A9" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "FAQ"), /* @__PURE__ */ React.createElement("h2", null, "\uC694\uAE08\uC81C\uC5D0\uC11C \uC790\uC8FC \uBB3B\uB294 \uB0B4\uC6A9.")), /* @__PURE__ */ React.createElement("div", { className: "faq-list" }, /* @__PURE__ */ React.createElement("details", { open: true }, /* @__PURE__ */ React.createElement("summary", null, "\uBB34\uB8CC \uD50C\uB79C\uACFC \uD504\uB85C \uD50C\uB79C\uC758 \uD0D0\uC9C0 \uC131\uB2A5\uC774 \uB2E4\uB978\uAC00\uC694?"), /* @__PURE__ */ React.createElement("p", null, "\uC544\uB2D9\uB2C8\uB2E4. \uC5B4\uB290 \uD50C\uB79C\uC774\uB4E0 \uAC19\uC740 \uC5D4\uC9C4\uC73C\uB85C, \uAC19\uC740 \uD615\uD0DC \uBCC0\uD615 \uACF5\uACA9\uC744 \uB123\uC2B5\uB2C8\uB2E4. \uB2EC\uB77C\uC9C0\uB294 \uAC74 \uB2E4\uC2DC \uAC80\uC0AC\uD560 \uC218 \uC788\uB294 \uD69F\uC218\uC640 \uC778\uC99D\uC11C, \uC774\uB825 \uAD00\uB9AC \uAC19\uC740 \uC6B4\uC601 \uCABD\uC785\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("details", null, /* @__PURE__ */ React.createElement("summary", null, "\uBB34\uB8CC \uD50C\uB79C\uC5D0\uC11C\uB3C4 \uC99D\uAC70\uC640 \uC870\uCE58 \uBC29\uBC95\uC744 \uBC1B\uC744 \uC218 \uC788\uB098\uC694?"), /* @__PURE__ */ React.createElement("p", null, "\uB124. \uC7AC\uD604\uD560 \uC218 \uC788\uB294 \uC99D\uAC70\uAC00 \uB2F4\uAE34 \uB9AC\uD3EC\uD2B8\uC640, \uBC1C\uACAC\uB41C \uBB38\uC81C\uB97C \uC5B4\uB5BB\uAC8C \uACE0\uCE58\uBA74 \uB418\uB294\uC9C0\uAC00 \uD568\uAED8 \uB4E4\uC5B4\uAC11\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("details", null, /* @__PURE__ */ React.createElement("summary", null, "\uD504\uB85C \uD50C\uB79C\uC740 \uBA87 \uBC88\uAE4C\uC9C0 \uB2E4\uC2DC \uAC80\uC0AC\uD560 \uC218 \uC788\uB098\uC694?"), /* @__PURE__ */ React.createElement("p", null, "\uD69F\uC218 \uC81C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uCFE8\uB2E4\uC6B4 \uC5C6\uC774 \uB2E4\uC2DC \uAC80\uC0AC\uD560 \uC218 \uC788\uACE0, \uAC80\uC0AC \uC774\uB825\uC774 \uB0A8\uC2B5\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("details", null, /* @__PURE__ */ React.createElement("summary", null, "\uB0B4\uBD80\uB9DD\uC5D0 \uC124\uCE58\uD574\uC57C \uD558\uBA74 \uC5B4\uB5A4 \uD50C\uB79C\uC778\uAC00\uC694?"), /* @__PURE__ */ React.createElement("p", null, "\uD504\uB79C\uCC28\uC774\uC988\uC785\uB2C8\uB2E4. \uAD00\uB9AC\uD560 \uC5D0\uC774\uC804\uD2B8\uAC00 \uC5EC\uB7FF\uC774\uAC70\uB098 \uAC10\uC0AC \uB300\uC751\uC6A9 \uB9AC\uD3EC\uD2B8\uAC00 \uD544\uC694\uD55C \uACBD\uC6B0\uB3C4 \uC5EC\uAE30\uC5D0 \uD574\uB2F9\uD569\uB2C8\uB2E4."))))), /* @__PURE__ */ React.createElement(ClosingCTA, { onContact: goContact, prefill: "\uC5EC\uC6B8 \uB3C4\uC785\uC744 \uBB38\uC758\uD569\uB2C8\uB2E4." }));
}
window.PricingPage = PricingPage;

/* ---- src/pages/privacy.jsx ---- */
function PrivacyPage({ onBack }) {
  return /* @__PURE__ */ React.createElement("main", { className: "privacy-page" }, /* @__PURE__ */ React.createElement(FloatingBackButton, { onBack }), /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement(BackButton, { onBack }), /* @__PURE__ */ React.createElement("div", { className: "privacy-header" }, /* @__PURE__ */ React.createElement("span", { className: "label" }, "LEGAL"), /* @__PURE__ */ React.createElement("h1", null, "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68"), /* @__PURE__ */ React.createElement("p", { className: "privacy-meta" }, "\uC2DC\uD589\uC77C: 2026\uB144 5\uC6D4 24\uC77C")), /* @__PURE__ */ React.createElement("div", { className: "privacy-body" }, /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("p", null, '\uC0C8\uACB0(Saegyeol, \uC774\uD558 "\uD68C\uC0AC")\uC740 \u300C\uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638\uBC95\u300D \uC81C30\uC870\uC5D0 \uB530\uB77C \uC815\uBCF4\uC8FC\uCCB4\uC758 \uAC1C\uC778\uC815\uBCF4\uB97C \uBCF4\uD638\uD558\uACE0 \uC774\uC640 \uAD00\uB828\uD55C \uACE0\uCDA9\uC744 \uC2E0\uC18D\uD558\uAC8C \uCC98\uB9AC\uD560 \uC218 \uC788\uB3C4\uB85D \uB2E4\uC74C\uACFC \uAC19\uC774 \uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68\uC744 \uC218\uB9BD\xB7\uACF5\uAC1C\uD569\uB2C8\uB2E4.')), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C1\uC870 \uAC1C\uC778\uC815\uBCF4\uC758 \uCC98\uB9AC \uBAA9\uC801"), /* @__PURE__ */ React.createElement("p", null, "\uD68C\uC0AC\uB294 \uB2E4\uC74C\uC758 \uBAA9\uC801\uC744 \uC704\uD558\uC5EC \uAC1C\uC778\uC815\uBCF4\uB97C \uCC98\uB9AC\uD569\uB2C8\uB2E4. \uCC98\uB9AC\uD55C \uAC1C\uC778\uC815\uBCF4\uB294 \uB2E4\uC74C\uC758 \uBAA9\uC801 \uC774\uC678\uC758 \uC6A9\uB3C4\uB85C\uB294 \uC774\uC6A9\uB418\uC9C0 \uC54A\uC73C\uBA70, \uC774\uC6A9 \uBAA9\uC801\uC774 \uBCC0\uACBD\uB418\uB294 \uACBD\uC6B0\uC5D0\uB294 \uBCC4\uB3C4\uC758 \uB3D9\uC758\uB97C \uBC1B\uB294 \uB4F1 \uD544\uC694\uD55C \uC870\uCE58\uB97C \uC774\uD589\uD560 \uC608\uC815\uC785\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, "\uC11C\uBE44\uC2A4 \uB3C4\uC785 \uBB38\uC758 \uC811\uC218 \uBC0F CS \uC751\uB300"), /* @__PURE__ */ React.createElement("li", null, "\uCC44\uC6A9 \uC9C0\uC6D0\uC790 \uC804\uD615 \uC9C4\uD589 \uBC0F \uACB0\uACFC \uC548\uB0B4"))), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C2\uC870 \uCC98\uB9AC\uD558\uB294 \uAC1C\uC778\uC815\uBCF4\uC758 \uD56D\uBAA9"), /* @__PURE__ */ React.createElement("p", null, "\uD68C\uC0AC\uB294 \uB2E4\uC74C\uC758 \uAC1C\uC778\uC815\uBCF4 \uD56D\uBAA9\uC744 \uCC98\uB9AC\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("table", { className: "privacy-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "\uC218\uC9D1 \uACBD\uB85C"), /* @__PURE__ */ React.createElement("th", null, "\uC218\uC9D1 \uD56D\uBAA9"), /* @__PURE__ */ React.createElement("th", null, "\uC218\uC9D1 \uBC29\uBC95"))), /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "\uBB38\uC758 \uD3FC"), /* @__PURE__ */ React.createElement("td", null, "\uC774\uB984, \uC774\uBA54\uC77C \uC8FC\uC18C, \uBB38\uC758 \uB0B4\uC6A9"), /* @__PURE__ */ React.createElement("td", null, "\uD648\uD398\uC774\uC9C0 \uB0B4 \uC9C1\uC811 \uC785\uB825")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "\uCC44\uC6A9 \uC9C0\uC6D0 \uD3FC"), /* @__PURE__ */ React.createElement("td", null, "\uC774\uB984, \uC774\uBA54\uC77C \uC8FC\uC18C, \uD3EC\uD2B8\uD3F4\uB9AC\uC624 \uD30C\uC77C"), /* @__PURE__ */ React.createElement("td", null, "\uD648\uD398\uC774\uC9C0 \uB0B4 \uC9C1\uC811 \uC785\uB825 \uBC0F \uD30C\uC77C \uC5C5\uB85C\uB4DC")))), /* @__PURE__ */ React.createElement("p", { style: { marginTop: 12 } }, "\uD68C\uC0AC\uB294 \uC11C\uBE44\uC2A4 \uC81C\uACF5\uC5D0 \uD544\uC694\uD55C \uCD5C\uC18C\uD55C\uC758 \uAC1C\uC778\uC815\uBCF4\uB9CC \uC218\uC9D1\uD569\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C3\uC870 \uAC1C\uC778\uC815\uBCF4\uC758 \uCC98\uB9AC \uBC0F \uBCF4\uC720 \uAE30\uAC04"), /* @__PURE__ */ React.createElement("p", null, "\uD68C\uC0AC\uB294 \uBC95\uB839\uC5D0 \uB530\uB978 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uC720\xB7\uC774\uC6A9 \uAE30\uAC04 \uB610\uB294 \uC815\uBCF4\uC8FC\uCCB4\uB85C\uBD80\uD130 \uAC1C\uC778\uC815\uBCF4\uB97C \uC218\uC9D1 \uC2DC\uC5D0 \uB3D9\uC758\uBC1B\uC740 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uC720\xB7\uC774\uC6A9 \uAE30\uAC04 \uB0B4\uC5D0\uC11C \uAC1C\uC778\uC815\uBCF4\uB97C \uCC98\uB9AC\xB7\uBCF4\uC720\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uBB38\uC758 \uC811\uC218 \uBC0F CS \uC751\uB300 \uBAA9\uC801:"), " \uC218\uC9D1\uC77C\uB85C\uBD80\uD130 3\uB144"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uCC44\uC6A9 \uC9C0\uC6D0 \uBAA9\uC801:"), " \uCC44\uC6A9 \uC804\uD615 \uC885\uB8CC \uD6C4 3\uB144")), /* @__PURE__ */ React.createElement("p", { style: { marginTop: 12 } }, "\uB2E8, \uAD00\uACC4 \uBC95\uB839\uC5D0 \uB530\uB77C \uBCF4\uC874\uC774 \uD544\uC694\uD55C \uACBD\uC6B0 \uD574\uB2F9 \uAE30\uAC04 \uB3D9\uC548 \uBCF4\uAD00\uD569\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C4\uC870 \uAC1C\uC778\uC815\uBCF4\uC758 \uD30C\uAE30 \uC808\uCC28 \uBC0F \uBC29\uBC95"), /* @__PURE__ */ React.createElement("p", null, "\uD68C\uC0AC\uB294 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uC720 \uAE30\uAC04\uC774 \uACBD\uACFC\uD558\uAC70\uB098 \uCC98\uB9AC \uBAA9\uC801\uC774 \uB2EC\uC131\uB41C \uACBD\uC6B0 \uC9C0\uCCB4 \uC5C6\uC774 \uD574\uB2F9 \uAC1C\uC778\uC815\uBCF4\uB97C \uD30C\uAE30\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uC804\uC790\uC801 \uD30C\uC77C \uD615\uD0DC:"), " \uBCF5\uAD6C \uBC0F \uC7AC\uC0DD\uC774 \uBD88\uAC00\uB2A5\uD55C \uBC29\uBC95\uC73C\uB85C \uC601\uAD6C \uC0AD\uC81C"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uC11C\uBA74, \uCD9C\uB825\uBB3C \uB4F1:"), " \uBD84\uC1C4 \uB610\uB294 \uC18C\uAC01"))), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C5\uC870 \uAC1C\uC778\uC815\uBCF4\uC758 \uC81C3\uC790 \uC81C\uACF5"), /* @__PURE__ */ React.createElement("p", null, "\uD68C\uC0AC\uB294 \uC815\uBCF4\uC8FC\uCCB4\uC758 \uAC1C\uC778\uC815\uBCF4\uB97C \uC81C1\uC870\uC5D0\uC11C \uBA85\uC2DC\uD55C \uBAA9\uC801 \uBC94\uC704 \uB0B4\uC5D0\uC11C\uB9CC \uCC98\uB9AC\uD558\uBA70, \uC815\uBCF4\uC8FC\uCCB4\uC758 \uB3D9\uC758, \uBC95\uB960\uC758 \uD2B9\uBCC4\uD55C \uADDC\uC815 \uB4F1 \u300C\uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638\uBC95\u300D \uC81C17\uC870 \uBC0F \uC81C18\uC870\uC5D0 \uD574\uB2F9\uD558\uB294 \uACBD\uC6B0\uC5D0\uB9CC \uAC1C\uC778\uC815\uBCF4\uB97C \uC81C3\uC790\uC5D0\uAC8C \uC81C\uACF5\uD569\uB2C8\uB2E4. \uD604\uC7AC \uC81C3\uC790 \uC81C\uACF5\uC740 \uC5C6\uC2B5\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C6\uC870 \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uC5C5\uBB34\uC758 \uC704\uD0C1"), /* @__PURE__ */ React.createElement("p", null, "\uD68C\uC0AC\uB294 \uD604\uC7AC \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uC5C5\uBB34\uB97C \uC678\uBD80\uC5D0 \uC704\uD0C1\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uD5A5\uD6C4 \uC704\uD0C1\uC774 \uBC1C\uC0DD\uD558\uB294 \uACBD\uC6B0 \uC704\uD0C1\uBC1B\uB294 \uC790, \uC704\uD0C1\uD558\uB294 \uC5C5\uBB34\uC758 \uB0B4\uC6A9\uC744 \uBCF8 \uBC29\uCE68\uC744 \uD1B5\uD574 \uC0AC\uC804 \uACF5\uAC1C\uD569\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C7\uC870 \uAC1C\uC778\uC815\uBCF4\uC758 \uC548\uC804\uC131 \uD655\uBCF4\uC870\uCE58"), /* @__PURE__ */ React.createElement("p", null, "\uD68C\uC0AC\uB294 \uAC1C\uC778\uC815\uBCF4\uC758 \uC548\uC804\uC131 \uD655\uBCF4\uB97C \uC704\uD574 \uB2E4\uC74C\uACFC \uAC19\uC740 \uC870\uCE58\uB97C \uCDE8\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uAD00\uB9AC\uC801 \uC870\uCE58:"), " \uB0B4\uBD80\uAD00\uB9AC\uACC4\uD68D \uC218\uB9BD\xB7\uC2DC\uD589, \uAC1C\uC778\uC815\uBCF4 \uCDE8\uAE09 \uC9C1\uC6D0 \uCD5C\uC18C\uD654 \uBC0F \uAD50\uC721"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uAE30\uC220\uC801 \uC870\uCE58:"), " \uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uC2DC\uC2A4\uD15C \uC811\uADFC\uAD8C\uD55C \uAD00\uB9AC, \uC811\uADFC\uD1B5\uC81C\uC2DC\uC2A4\uD15C \uC124\uCE58, \uAC1C\uC778\uC815\uBCF4\uC758 \uC554\uD638\uD654"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uBB3C\uB9AC\uC801 \uC870\uCE58:"), " \uC790\uB8CC\uBCF4\uAD00\uC2E4 \uC811\uADFC\uD1B5\uC81C"))), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C8\uC870 \uAC1C\uC778\uC815\uBCF4 \uC790\uB3D9 \uC218\uC9D1 \uC7A5\uCE58\uC758 \uC124\uCE58\xB7\uC6B4\uC601 \uBC0F \uAC70\uBD80"), /* @__PURE__ */ React.createElement("p", null, "\uD68C\uC0AC\uB294 \uC11C\uBE44\uC2A4 \uC774\uC6A9 \uACFC\uC815\uC5D0\uC11C \uCFE0\uD0A4(Cookie)\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uCFE0\uD0A4\uB294 \uC6F9\uC0AC\uC774\uD2B8 \uC6B4\uC601\uC5D0 \uC774\uC6A9\uB418\uB294 \uC11C\uBC84\uAC00 \uC774\uC6A9\uC790\uC758 \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uBCF4\uB0B4\uB294 \uC18C\uB7C9\uC758 \uC815\uBCF4\uC774\uBA70 \uC774\uC6A9\uC790 \uCEF4\uD4E8\uD130\uC758 \uD558\uB4DC\uB514\uC2A4\uD06C\uC5D0 \uC800\uC7A5\uB429\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uC0AC\uC6A9 \uBAA9\uC801:"), " \uC774\uC6A9\uC790\uC758 \uC811\uC18D \uBE48\uB3C4, \uBC29\uBB38 \uC2DC\uAC04 \uBD84\uC11D \uBC0F \uC11C\uBE44\uC2A4 \uAC1C\uC120"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uAC70\uBD80 \uBC29\uBC95:"), " \uC6F9 \uBE0C\uB77C\uC6B0\uC800 \uC124\uC815\uC5D0\uC11C \uCFE0\uD0A4 \uC800\uC7A5\uC744 \uAC70\uBD80\uD560 \uC218 \uC788\uC73C\uB098, \uC77C\uBD80 \uC11C\uBE44\uC2A4 \uC774\uC6A9\uC774 \uC81C\uD55C\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("p", { style: { marginTop: 12 } }, "\u203B \uAD6C\uAE00 \uD06C\uB86C \uAE30\uC900: \uC124\uC815 \u2192 \uAC1C\uC778\uC815\uBCF4 \uBC0F \uBCF4\uC548 \u2192 \uCFE0\uD0A4 \uBC0F \uAE30\uD0C0 \uC0AC\uC774\uD2B8 \uB370\uC774\uD130")), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C9\uC870 \uC815\uBCF4\uC8FC\uCCB4\uC640 \uBC95\uC815\uB300\uB9AC\uC778\uC758 \uAD8C\uB9AC\xB7\uC758\uBB34 \uBC0F \uD589\uC0AC\uBC29\uBC95"), /* @__PURE__ */ React.createElement("p", null, "\uC815\uBCF4\uC8FC\uCCB4\uB294 \uD68C\uC0AC\uC5D0 \uB300\uD574 \uC5B8\uC81C\uB4E0\uC9C0 \uB2E4\uC74C \uAC01 \uD638\uC758 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638 \uAD00\uB828 \uAD8C\uB9AC\uB97C \uD589\uC0AC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, "\uAC1C\uC778\uC815\uBCF4 \uC5F4\uB78C \uC694\uCCAD"), /* @__PURE__ */ React.createElement("li", null, "\uAC1C\uC778\uC815\uBCF4 \uC815\uC815\xB7\uC0AD\uC81C \uC694\uCCAD"), /* @__PURE__ */ React.createElement("li", null, "\uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uC815\uC9C0 \uC694\uCCAD"), /* @__PURE__ */ React.createElement("li", null, "\uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uC5D0 \uB300\uD55C \uB3D9\uC758 \uCCA0\uD68C")), /* @__PURE__ */ React.createElement("p", { style: { marginTop: 12 } }, "\uAD8C\uB9AC \uD589\uC0AC\uB294 \uC544\uB798 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638\uCC45\uC784\uC790\uC5D0\uAC8C \uC774\uBA54\uC77C\uB85C \uC694\uCCAD\uD558\uC2DC\uBA74 \uC9C0\uCCB4 \uC5C6\uC774 \uCC98\uB9AC\uD569\uB2C8\uB2E4. \uD68C\uC0AC\uB294 \uC815\uBCF4\uC8FC\uCCB4\uC758 \uAD8C\uB9AC\uC5D0 \uB530\uB978 \uC5F4\uB78C, \uC815\uC815\xB7\uC0AD\uC81C, \uCC98\uB9AC\uC815\uC9C0 \uC694\uCCAD \uC2DC \uC5F4\uB78C \uB4F1\uC744 \uC81C\uD55C\uD558\uAC70\uB098 \uAC70\uC808\uD560 \uC218 \uC788\uB294 \uACBD\uC6B0\uC5D0\uB294 \uADF8 \uC0AC\uC720\uB97C \uD1B5\uBCF4\uD569\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C10\uC870 \uC790\uB3D9\uD654\uB41C \uACB0\uC815\uC5D0 \uAD00\uD55C \uC0AC\uD56D"), /* @__PURE__ */ React.createElement("p", null, "\uD68C\uC0AC\uC758 \uC5EC\uC6B8 \uC11C\uBE44\uC2A4\uB294 AI \uAE30\uBC18 \uC790\uB3D9\uD654\uB41C \uBD84\uC11D\uC744 \uD65C\uC6A9\uD569\uB2C8\uB2E4. \uB2E4\uB9CC \uBCF8 \uD648\uD398\uC774\uC9C0\uB97C \uD1B5\uD574 \uC218\uC9D1\uB418\uB294 \uBB38\uC758\xB7\uCC44\uC6A9 \uC9C0\uC6D0 \uC815\uBCF4\uC5D0 \uB300\uD574\uC11C\uB294 \uC790\uB3D9\uD654\uB41C \uACB0\uC815\uC744 \uC801\uC6A9\uD558\uC9C0 \uC54A\uC73C\uBA70, \uB2F4\uB2F9\uC790\uAC00 \uC9C1\uC811 \uAC80\uD1A0\uD558\uC5EC \uC751\uB300\uD569\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C11\uC870 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638\uCC45\uC784\uC790"), /* @__PURE__ */ React.createElement("div", { className: "privacy-contact-box" }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "\uC131\uBA85"), /* @__PURE__ */ React.createElement("span", null, "\uD669\uC9C0\uD6C4")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "\uC9C1\uCC45"), /* @__PURE__ */ React.createElement("span", null, "\uB300\uD45C")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "k" }, "\uC774\uBA54\uC77C"), /* @__PURE__ */ React.createElement("span", null, "watson@saegyeol.ai.kr"))), /* @__PURE__ */ React.createElement("p", { style: { marginTop: 12 } }, "\uC815\uBCF4\uC8FC\uCCB4\uB294 \uD68C\uC0AC\uC758 \uC11C\uBE44\uC2A4\uB97C \uC774\uC6A9\uD558\uC2DC\uBA74\uC11C \uBC1C\uC0DD\uD55C \uBAA8\uB4E0 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638 \uAD00\uB828 \uBB38\uC758, \uBD88\uB9CC\uCC98\uB9AC, \uD53C\uD574\uAD6C\uC81C \uB4F1\uC5D0 \uAD00\uD55C \uC0AC\uD56D\uC744 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638\uCC45\uC784\uC790\uC5D0\uAC8C \uBB38\uC758\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C12\uC870 \uC815\uBCF4\uC8FC\uCCB4\uC758 \uAD8C\uC775\uCE68\uD574\uC5D0 \uB300\uD55C \uAD6C\uC81C\uBC29\uBC95"), /* @__PURE__ */ React.createElement("p", null, "\uC815\uBCF4\uC8FC\uCCB4\uB294 \uAC1C\uC778\uC815\uBCF4\uCE68\uD574\uB85C \uC778\uD55C \uAD6C\uC81C\uB97C \uBC1B\uAE30 \uC704\uD558\uC5EC \uAC1C\uC778\uC815\uBCF4\uBD84\uC7C1\uC870\uC815\uC704\uC6D0\uD68C, \uD55C\uAD6D\uC778\uD130\uB137\uC9C4\uD765\uC6D0 \uAC1C\uC778\uC815\uBCF4\uCE68\uD574\uC2E0\uACE0\uC13C\uD130 \uB4F1\uC5D0 \uBD84\uC7C1\uD574\uACB0\uC774\uB098 \uC0C1\uB2F4 \uB4F1\uC744 \uC2E0\uCCAD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uAC1C\uC778\uC815\uBCF4\uCE68\uD574\uC2E0\uACE0\uC13C\uD130:"), " (\uAD6D\uBC88\uC5C6\uC774) 118 / privacy.kisa.or.kr"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uAC1C\uC778\uC815\uBCF4\uBD84\uC7C1\uC870\uC815\uC704\uC6D0\uD68C:"), " 1833-6972 / www.kopico.go.kr"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uB300\uAC80\uCC30\uCCAD \uC0AC\uC774\uBC84\uBC94\uC8C4\uC218\uC0AC\uB2E8:"), " 02-3480-3573 / www.spo.go.kr"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uACBD\uCC30\uCCAD \uC0AC\uC774\uBC84\uC548\uC804\uAD6D:"), " (\uAD6D\uBC88\uC5C6\uC774) 182 / cyberbureau.police.go.kr"))), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C13\uC870 \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68\uC758 \uBCC0\uACBD"), /* @__PURE__ */ React.createElement("p", null, "\uBCF8 \uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68\uC740 \uC2DC\uD589\uC77C\uB85C\uBD80\uD130 \uC801\uC6A9\uB418\uBA70, \uBC95\uB839 \uBC0F \uBC29\uCE68\uC5D0 \uB530\uB978 \uBCC0\uACBD \uB0B4\uC6A9\uC758 \uCD94\uAC00, \uC0AD\uC81C \uBC0F \uC815\uC815\uC774 \uC788\uB294 \uACBD\uC6B0\uC5D0\uB294 \uBCC0\uACBD\uC0AC\uD56D \uC2DC\uD589 7\uC77C \uC804\uBD80\uD130 \uD648\uD398\uC774\uC9C0 \uACF5\uC9C0\uC0AC\uD56D\uC744 \uD1B5\uD558\uC5EC \uACE0\uC9C0\uD569\uB2C8\uB2E4.")))));
}

/* ---- src/pages/terms.jsx ---- */
function TermsPage({ onBack }) {
  return /* @__PURE__ */ React.createElement("main", { className: "privacy-page" }, /* @__PURE__ */ React.createElement(FloatingBackButton, { onBack }), /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement(BackButton, { onBack }), /* @__PURE__ */ React.createElement("div", { className: "privacy-header" }, /* @__PURE__ */ React.createElement("span", { className: "label" }, "LEGAL"), /* @__PURE__ */ React.createElement("h1", null, "\uC774\uC6A9\uC57D\uAD00"), /* @__PURE__ */ React.createElement("p", { className: "privacy-meta" }, "\uC2DC\uD589\uC77C: 2026\uB144 5\uC6D4 24\uC77C")), /* @__PURE__ */ React.createElement("div", { className: "privacy-body" }, /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("p", null, '\uBCF8 \uC57D\uAD00\uC740 \uC0C8\uACB0(Saegyeol, \uC774\uD558 "\uD68C\uC0AC")\uC774 \uC6B4\uC601\uD558\uB294 \uC6F9\uC0AC\uC774\uD2B8(\uC774\uD558 "\uC0AC\uC774\uD2B8")\uB97C \uC774\uC6A9\uD568\uC5D0 \uC788\uC5B4 \uD68C\uC0AC\uC640 \uC774\uC6A9\uC790 \uAC04\uC758 \uAD8C\uB9AC\xB7\uC758\uBB34 \uBC0F \uCC45\uC784\uC0AC\uD56D\uC744 \uADDC\uC815\uD568\uC744 \uBAA9\uC801\uC73C\uB85C \uD569\uB2C8\uB2E4.')), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C1\uC870 \uC6A9\uC5B4 \uC815\uC758"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uD68C\uC0AC:"), " \uC0C8\uACB0(Saegyeol)"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uC0AC\uC774\uD2B8:"), " \uD68C\uC0AC\uAC00 \uC6B4\uC601\uD558\uB294 \uD648\uD398\uC774\uC9C0"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uC774\uC6A9\uC790:"), " \uC0AC\uC774\uD2B8\uC5D0 \uC811\uC18D\uD558\uC5EC \uBCF8 \uC57D\uAD00\uC5D0 \uB530\uB77C \uC11C\uBE44\uC2A4\uB97C \uC774\uC6A9\uD558\uB294 \uBAA8\uB4E0 \uC790"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uC11C\uBE44\uC2A4:"), " \uD68C\uC0AC\uAC00 \uC0AC\uC774\uD2B8\uB97C \uD1B5\uD574 \uC81C\uACF5\uD558\uB294 \uC81C\uD488 \uC18C\uAC1C, \uBB38\uC758 \uC811\uC218, \uCC44\uC6A9 \uC9C0\uC6D0 \uB4F1 \uC77C\uCCB4\uC758 \uAE30\uB2A5"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uBB38\uC758\uC790:"), " \uC0AC\uC774\uD2B8 \uB0B4 \uBB38\uC758 \uD3FC\uC744 \uD1B5\uD574 \uC11C\uBE44\uC2A4 \uB3C4\uC785 \uBB38\uC758\uB97C \uC81C\uCD9C\uD55C \uC790"), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "\uC9C0\uC6D0\uC790:"), " \uC0AC\uC774\uD2B8 \uB0B4 \uCC44\uC6A9 \uC9C0\uC6D0 \uD3FC\uC744 \uD1B5\uD574 \uC9C0\uC6D0\uC11C\uB97C \uC81C\uCD9C\uD55C \uC790"))), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C2\uC870 \uC57D\uAD00\uC758 \uD6A8\uB825 \uBC0F \uBCC0\uACBD"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, "\uBCF8 \uC57D\uAD00\uC740 \uC0AC\uC774\uD2B8\uC5D0 \uAC8C\uC2DC\uD568\uC73C\uB85C\uC368 \uD6A8\uB825\uC774 \uBC1C\uC0DD\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("li", null, "\uC774\uC6A9\uC790\uAC00 \uC0AC\uC774\uD2B8\uB97C \uC774\uC6A9\uD568\uC73C\uB85C\uC368 \uBCF8 \uC57D\uAD00\uC5D0 \uB3D9\uC758\uD55C \uAC83\uC73C\uB85C \uAC04\uC8FC\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("li", null, "\uD68C\uC0AC\uB294 \u300C\uC57D\uAD00\uC758 \uADDC\uC81C\uC5D0 \uAD00\uD55C \uBC95\uB960\u300D \uB4F1 \uAD00\uB828 \uBC95\uB839\uC744 \uC704\uBC18\uD558\uC9C0 \uC54A\uB294 \uBC94\uC704\uC5D0\uC11C \uBCF8 \uC57D\uAD00\uC744 \uBCC0\uACBD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("li", null, "\uC57D\uAD00 \uBCC0\uACBD \uC2DC \uC2DC\uD589 7\uC77C \uC804 \uC0AC\uC774\uD2B8 \uACF5\uC9C0\uC0AC\uD56D\uC744 \uD1B5\uD574 \uACE0\uC9C0\uD558\uBA70, \uBCC0\uACBD \uD6C4 \uACC4\uC18D \uC774\uC6A9 \uC2DC \uBCC0\uACBD\uB41C \uC57D\uAD00\uC5D0 \uB3D9\uC758\uD55C \uAC83\uC73C\uB85C \uBD05\uB2C8\uB2E4."))), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C3\uC870 \uC11C\uBE44\uC2A4 \uC81C\uACF5"), /* @__PURE__ */ React.createElement("p", null, "\uD68C\uC0AC\uB294 \uB2E4\uC74C\uC758 \uC11C\uBE44\uC2A4\uB97C \uC81C\uACF5\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, "\uC5EC\uC6B8 \uC81C\uD488 \uC18C\uAC1C \uBC0F \uAD00\uB828 \uC815\uBCF4 \uC81C\uACF5"), /* @__PURE__ */ React.createElement("li", null, "\uC11C\uBE44\uC2A4 \uB3C4\uC785 \uBB38\uC758 \uC811\uC218 \uBC0F CS \uC751\uB300"), /* @__PURE__ */ React.createElement("li", null, "\uCC44\uC6A9 \uC9C0\uC6D0 \uC811\uC218 \uBC0F \uC804\uD615 \uC9C4\uD589")), /* @__PURE__ */ React.createElement("p", { style: { marginTop: 12 } }, "\uC11C\uBE44\uC2A4\uB294 \uC5F0\uC911\uBB34\uD734 24\uC2DC\uAC04 \uC81C\uACF5\uC744 \uC6D0\uCE59\uC73C\uB85C \uD558\uB098, \uC2DC\uC2A4\uD15C \uC810\uAC80\xB7\uC7A5\uC560\xB7\uCC9C\uC7AC\uC9C0\uBCC0 \uB4F1\uC758 \uC0AC\uC720\uB85C \uC77C\uC2DC \uC911\uB2E8\uB420 \uC218 \uC788\uC73C\uBA70, \uC774 \uACBD\uC6B0 \uC0AC\uC804 \uB610\uB294 \uC0AC\uD6C4\uC5D0 \uACF5\uC9C0\uD569\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C4\uC870 \uC774\uC6A9\uC790\uC758 \uC758\uBB34"), /* @__PURE__ */ React.createElement("p", null, "\uC774\uC6A9\uC790\uB294 \uB2E4\uC74C \uD589\uC704\uB97C \uD558\uC5EC\uC11C\uB294 \uC548 \uB429\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, "\uBB38\uC758 \uD3FC \uB610\uB294 \uCC44\uC6A9 \uC9C0\uC6D0 \uD3FC\uC5D0 \uD5C8\uC704 \uC815\uBCF4\uB97C \uC785\uB825\uD558\uB294 \uD589\uC704"), /* @__PURE__ */ React.createElement("li", null, "\uD68C\uC0AC \uB610\uB294 \uC81C3\uC790\uC758 \uC9C0\uC2DD\uC7AC\uC0B0\uAD8C\xB7\uBA85\uC608\xB7\uC2E0\uC6A9\uC744 \uCE68\uD574\uD558\uB294 \uD589\uC704"), /* @__PURE__ */ React.createElement("li", null, "\uC0AC\uC774\uD2B8\uC758 \uC815\uC0C1\uC801\uC778 \uC6B4\uC601\uC744 \uBC29\uD574\uD558\uAC70\uB098 \uC11C\uBC84\uC5D0 \uACFC\uBD80\uD558\uB97C \uC8FC\uB294 \uD589\uC704"), /* @__PURE__ */ React.createElement("li", null, "\uC545\uC131\uCF54\uB4DC\xB7\uBC14\uC774\uB7EC\uC2A4\uB97C \uC720\uD3EC\uD558\uAC70\uB098 \uD574\uD0B9\uC744 \uC2DC\uB3C4\uD558\uB294 \uD589\uC704"), /* @__PURE__ */ React.createElement("li", null, "\uAE30\uD0C0 \uAD00\uB828 \uBC95\uB839 \uB610\uB294 \uACF5\uACF5\uC9C8\uC11C\uB97C \uC704\uBC18\uD558\uB294 \uD589\uC704"))), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C5\uC870 \uD68C\uC0AC\uC758 \uC758\uBB34"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, "\uD68C\uC0AC\uB294 \uC548\uC815\uC801\uC778 \uC11C\uBE44\uC2A4 \uC81C\uACF5\uC744 \uC704\uD574 \uCD5C\uC120\uC744 \uB2E4\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("li", null, "\uD68C\uC0AC\uB294 \uC774\uC6A9\uC790\uC758 \uAC1C\uC778\uC815\uBCF4\uB97C \uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68\uC5D0 \uB530\uB77C \uBCF4\uD638\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("li", null, "\uD68C\uC0AC\uB294 \uC774\uC6A9\uC790\uB85C\uBD80\uD130 \uC81C\uAE30\uB41C \uC758\uACAC\uC774\uB098 \uBD88\uB9CC\uC774 \uC815\uB2F9\uD558\uB2E4\uACE0 \uC778\uC815\uB420 \uACBD\uC6B0 \uC774\uB97C \uCC98\uB9AC\uD558\uBA70, \uCC98\uB9AC \uACB0\uACFC\uB97C \uC774\uBA54\uC77C \uB4F1\uC744 \uD1B5\uD574 \uC548\uB0B4\uD569\uB2C8\uB2E4."))), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C6\uC870 \uC9C0\uC2DD\uC7AC\uC0B0\uAD8C"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, "\uC0AC\uC774\uD2B8\uC5D0 \uAC8C\uC2DC\uB41C \uBAA8\uB4E0 \uCF58\uD150\uCE20(\uD14D\uC2A4\uD2B8, \uC774\uBBF8\uC9C0, \uB85C\uACE0, \uB514\uC790\uC778, \uCF54\uB4DC \uB4F1)\uC758 \uC9C0\uC2DD\uC7AC\uC0B0\uAD8C\uC740 \uD68C\uC0AC\uC5D0 \uADC0\uC18D\uB429\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("li", null, "\uC774\uC6A9\uC790\uB294 \uD68C\uC0AC\uC758 \uC0AC\uC804 \uC11C\uBA74 \uB3D9\uC758 \uC5C6\uC774 \uC774\uB97C \uBCF5\uC81C\xB7\uBC30\uD3EC\xB7\uC218\uC815\xB7\uC804\uC1A1\uD558\uAC70\uB098 \uC0C1\uC5C5\uC801\uC73C\uB85C \uC774\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("li", null, "\uC774\uC6A9\uC790\uAC00 \uC0AC\uC774\uD2B8\uC5D0 \uC81C\uCD9C\uD55C \uBB38\uC758 \uB0B4\uC6A9 \uBC0F \uD3EC\uD2B8\uD3F4\uB9AC\uC624\uC758 \uC800\uC791\uAD8C\uC740 \uD574\uB2F9 \uC774\uC6A9\uC790\uC5D0\uAC8C \uADC0\uC18D\uB429\uB2C8\uB2E4. \uB2E4\uB9CC \uD68C\uC0AC\uB294 CS \uC751\uB300 \uBC0F \uCC44\uC6A9 \uC804\uD615 \uBAA9\uC801\uC73C\uB85C \uC774\uB97C \uC5F4\uB78C\xB7\uD65C\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."))), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C7\uC870 \uBA74\uCC45 \uC870\uD56D"), /* @__PURE__ */ React.createElement("p", null, "\uD68C\uC0AC\uB294 \uB2E4\uC74C\uC758 \uACBD\uC6B0 \uC11C\uBE44\uC2A4 \uC81C\uACF5\uC5D0 \uAD00\uD55C \uCC45\uC784\uC744 \uC9C0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, "\uCC9C\uC7AC\uC9C0\uBCC0, \uC804\uC7C1, \uD574\uD0B9 \uB4F1 \uBD88\uAC00\uD56D\uB825\uC801 \uC0AC\uC720\uB85C \uC778\uD55C \uC11C\uBE44\uC2A4 \uC911\uB2E8"), /* @__PURE__ */ React.createElement("li", null, "\uC774\uC6A9\uC790\uC758 \uADC0\uCC45\uC0AC\uC720\uB85C \uC778\uD55C \uC11C\uBE44\uC2A4 \uC774\uC6A9 \uC7A5\uC560"), /* @__PURE__ */ React.createElement("li", null, "\uC774\uC6A9\uC790\uAC00 \uC0AC\uC774\uD2B8\uB97C \uD1B5\uD574 \uCDE8\uB4DD\uD55C \uC815\uBCF4\uB97C \uAE30\uBC18\uC73C\uB85C \uD55C \uD22C\uC790\xB7\uACC4\uC57D \uB4F1\uC758 \uACB0\uACFC")), /* @__PURE__ */ React.createElement("ul", { style: { marginTop: 12 } }, /* @__PURE__ */ React.createElement("li", null, "\uD68C\uC0AC\uB294 \uC774\uC6A9\uC790\uAC00 \uC0AC\uC774\uD2B8\uC5D0 \uAC8C\uC2DC\uD55C \uC815\uBCF4\uC758 \uC815\uD655\uC131\uC5D0 \uB300\uD574 \uCC45\uC784\uC744 \uC9C0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("li", null, "\uD68C\uC0AC\uB294 \uC774\uC6A9\uC790 \uAC04 \uB610\uB294 \uC774\uC6A9\uC790\uC640 \uC81C3\uC790 \uAC04\uC5D0 \uC0AC\uC774\uD2B8\uB97C \uB9E4\uAC1C\uB85C \uBC1C\uC0DD\uD55C \uBD84\uC7C1\uC5D0 \uB300\uD574 \uAC1C\uC785\uD558\uAC70\uB098 \uCC45\uC784\uC744 \uC9C0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."))), /* @__PURE__ */ React.createElement("section", { className: "privacy-section" }, /* @__PURE__ */ React.createElement("h2", null, "\uC81C8\uC870 \uC900\uAC70\uBC95 \uBC0F \uAD00\uD560\uBC95\uC6D0"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, "\uBCF8 \uC57D\uAD00\uC740 \uB300\uD55C\uBBFC\uAD6D \uBC95\uB960\uC5D0 \uB530\uB77C \uD574\uC11D\uB429\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("li", null, "\uC11C\uBE44\uC2A4 \uC774\uC6A9\uACFC \uAD00\uB828\uD558\uC5EC \uBD84\uC7C1\uC774 \uBC1C\uC0DD\uD55C \uACBD\uC6B0 \uBD80\uC0B0\uC9C0\uBC29\uBC95\uC6D0 \uB3D9\uBD80\uC9C0\uC6D0\uC744 \uC804\uC18D \uAD00\uD560\uBC95\uC6D0\uC73C\uB85C \uD569\uB2C8\uB2E4."))))));
}

/* ---- src/pages/features.jsx ---- */
function FeatureShadowPage({ setRoute }) {
  const goContact = createContactNav(setRoute);
  return /* @__PURE__ */ React.createElement("div", { "data-screen-label": "Feature: Shadow Agent" }, /* @__PURE__ */ React.createElement("section", { className: "page-hero" }, /* @__PURE__ */ React.createElement("div", { className: "hero-bg" }), /* @__PURE__ */ React.createElement("div", { className: "container", style: { position: "relative" } }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "CAPABILITY 01 \xB7 SHADOW AGENT \uD0D0\uC9C0"), /* @__PURE__ */ React.createElement("h1", null, "\uBCF4\uC548\uD300\uB3C4 \uBAA8\uB974\uB294", /* @__PURE__ */ React.createElement("br", null), "AI \uC5D0\uC774\uC804\uD2B8\uB97C", /* @__PURE__ */ React.createElement("br", null), "\uBA3C\uC800 \uCC3E\uC544\uB0C5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", null, "\uC784\uC9C1\uC6D0\uC774 \uC0AC\uB0B4 \uB370\uC774\uD130\uB85C \uB9CC\uB4E0 \uAC1C\uC778 AI \uC5D0\uC774\uC804\uD2B8\uB294 IT\xB7\uBCF4\uC548\uD300\uC758 \uAC00\uC2DC\uAD8C \uBC16\uC5D0\uC11C \uC791\uB3D9\uD569\uB2C8\uB2E4. \uC5EC\uC6B8\uC740 \uB124\uD2B8\uC6CC\uD06C \uD2B8\uB798\uD53D\uACFC MCP \uC5F0\uACB0 \uD328\uD134\uC744 \uBD84\uC11D\uD574 Shadow Agent\uB97C \uC790\uB3D9\uC73C\uB85C \uC2DD\uBCC4\uD558\uACE0 \uB370\uC774\uD130 \uB178\uCD9C \uC704\uD5D8\uB3C4\uB97C \uD3C9\uAC00\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "hero-cta", style: { marginTop: 36 } }, /* @__PURE__ */ React.createElement(ContactButton, { onContact: goContact, prefill: "Shadow Agent \uD0D0\uC9C0 \uB3C4\uC785\uC744 \uBB38\uC758\uD569\uB2C8\uB2E4." }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost", onClick: () => {
    setRoute("product");
    window.scrollTo({ top: 0 });
  } }, "\uC5EC\uC6B8 \uC804\uCCB4 \uBCF4\uAE30 ", /* @__PURE__ */ React.createElement("span", { className: "arrow" }, "\u2192"))))), /* @__PURE__ */ React.createElement("section", { className: "block" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "THE PROBLEM"), /* @__PURE__ */ React.createElement("h2", null, "AI \uC5D0\uC774\uC804\uD2B8 \uC704\uD611\uC758", /* @__PURE__ */ React.createElement("br", null), "80%\uB294 \uB0B4\uBD80\uC5D0\uC11C \uC2DC\uC791\uB429\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", null, "\uC0DD\uC131\uD615 AI \uB3C4\uAD6C\uAC00 \uB300\uC911\uD654\uB418\uBA74\uC11C \uC784\uC9C1\uC6D0\uB4E4\uC740 \uBCF4\uC548 \uAC80\uD1A0 \uC5C6\uC774 \uC0AC\uB0B4 \uB370\uC774\uD130\uB97C \uC5F0\uACB0\uD55C \uAC1C\uC778 AI \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uAD6C\uCD95\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uC774 Shadow Agent\uB4E4\uC740 \uC2B9\uC778\uB418\uC9C0 \uC54A\uC740 \uACBD\uB85C\uB85C \uACE0\uAC1D \uC815\uBCF4, \uB0B4\uBD80 \uCF54\uB4DC, \uAE08\uC735 \uB370\uC774\uD130\uB97C \uCC98\uB9AC\uD558\uACE0 \uC678\uBD80 LLM \uC11C\uBE44\uC2A4\uB85C \uC804\uC1A1\uD569\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("div", { className: "stats" }, /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "73", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "%")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uC784\uC9C1\uC6D0\uC758 \uBE44\uC778\uAC00 AI \uB3C4\uAD6C \uC0AC\uC6A9\uB960")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "4.2", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "\uBC30")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "Shadow Agent \uACBD\uC720 \uB370\uC774\uD130 \uC720\uCD9C \uC704\uD5D8")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "3", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "\uC885")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uC8FC\uC694 Shadow Agent \uC720\uD615")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "18", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "\uC77C")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uD3C9\uADE0 \uD0D0\uC9C0 \uC9C0\uC5F0 (\uAE30\uC874 \uB3C4\uAD6C)"))))), /* @__PURE__ */ React.createElement("section", { className: "block", style: { paddingTop: 0, borderTop: "none" } }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "SHADOW AGENT TYPES"), /* @__PURE__ */ React.createElement("h2", null, "\uC5B4\uB5A4 \uD615\uD0DC\uB85C \uC228\uC5B4\uC788\uB294\uAC00."), /* @__PURE__ */ React.createElement("p", null, "Shadow Agent\uB294 \uC138 \uAC00\uC9C0 \uC720\uD615\uC73C\uB85C \uBD84\uB958\uB429\uB2C8\uB2E4. \uAC01 \uC720\uD615\uC740 \uC11C\uB85C \uB2E4\uB978 \uACF5\uACA9 \uD45C\uBA74\uACFC \uB370\uC774\uD130 \uB178\uCD9C \uACBD\uB85C\uB97C \uAC00\uC9D1\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("div", { className: "cards" }, /* @__PURE__ */ React.createElement("article", { className: "card" }, /* @__PURE__ */ React.createElement("span", { className: "num" }, "TYPE A"), /* @__PURE__ */ React.createElement("div", { className: "ico" }, /* @__PURE__ */ React.createElement(Icon.shadow, null)), /* @__PURE__ */ React.createElement("h3", null, "\uC678\uBD80 LLM \uC5F0\uACB0\uD615"), /* @__PURE__ */ React.createElement("p", null, "ChatGPT GPTs, Claude Projects, Gemini Gems \uB4F1\uC5D0 \uC0AC\uB0B4 \uBB38\uC11C\xB7\uCF54\uB4DC\xB7DB \uCFFC\uB9AC \uACB0\uACFC\uB97C \uC9C1\uC811 \uBD99\uC5EC\uB123\uAC70\uB098 API\uB85C \uC5F0\uACB0\uD558\uB294 \uD615\uD0DC. \uC0AC\uB0B4 IP\xB7\uAE30\uBC00 \uCF54\uB4DC\xB7\uACE0\uAC1D \uB370\uC774\uD130\uAC00 \uC678\uBD80 LLM \uD559\uC2B5 \uD30C\uC774\uD504\uB77C\uC778\uC5D0 \uC720\uC785\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("article", { className: "card" }, /* @__PURE__ */ React.createElement("span", { className: "num" }, "TYPE B"), /* @__PURE__ */ React.createElement("div", { className: "ico" }, /* @__PURE__ */ React.createElement(Icon.inject, null)), /* @__PURE__ */ React.createElement("h3", null, "MCP \uC790\uCCB4 \uC11C\uBC84\uD615"), /* @__PURE__ */ React.createElement("p", null, "\uC784\uC9C1\uC6D0\uC774 \uB85C\uCEEC \uB610\uB294 \uD300 \uC11C\uBC84\uC5D0 \uBE44\uC778\uAC00 MCP \uC11C\uBC84\uB97C \uAD6C\uCD95\uD574 \uC0AC\uB0B4 \uD30C\uC77C \uC2DC\uC2A4\uD15C\xB7Slack\xB7GitHub\xB7DB\uC5D0 \uC5D0\uC774\uC804\uD2B8 \uC811\uADFC \uAD8C\uD55C\uC744 \uBD80\uC5EC\uD558\uB294 \uD615\uD0DC. MCP \uD504\uB85C\uD1A0\uCF5C \uD2B9\uC131\uC0C1 \uAD8C\uD55C \uACBD\uACC4\uAC00 \uB290\uC2A8\uD574 \uCE21\uBA74 \uC774\uB3D9(Lateral Movement)\uC774 \uC6A9\uC774\uD569\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("article", { className: "card" }, /* @__PURE__ */ React.createElement("span", { className: "num" }, "TYPE C"), /* @__PURE__ */ React.createElement("div", { className: "ico" }, /* @__PURE__ */ React.createElement(Icon.graph, null)), /* @__PURE__ */ React.createElement("h3", null, "\uC790\uB3D9\uD654 \uD30C\uC774\uD504\uB77C\uC778\uD615"), /* @__PURE__ */ React.createElement("p", null, "n8n, Zapier AI, Make \uB4F1 \uB178\uCF54\uB4DC \uC790\uB3D9\uD654 \uD50C\uB7AB\uD3FC\uC5D0 LLM \uB178\uB4DC\uB97C \uC0BD\uC785\uD574 \uC0AC\uB0B4 \uB370\uC774\uD130\uB97C \uC815\uAE30\uC801\uC73C\uB85C \uCC98\uB9AC\xB7\uC694\uC57D\xB7\uC804\uC1A1\uD558\uB294 \uD615\uD0DC. \uBC18\uBCF5 \uC2E4\uD589\uB418\uB294 \uD2B9\uC131\uC0C1 \uC9C0\uC18D\uC801\uC778 \uB370\uC774\uD130 \uC720\uCD9C \uACBD\uB85C\uAC00 \uB429\uB2C8\uB2E4."))))), /* @__PURE__ */ React.createElement("section", { className: "block", id: "how-shadow-works" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "HOW WE DETECT \xB7 03 STEPS"), /* @__PURE__ */ React.createElement("h2", null, "\uC218\uB3D9 \uAC10\uC0AC \uC5C6\uC774", /* @__PURE__ */ React.createElement("br", null), "\uC790\uB3D9\uC73C\uB85C \uD0D0\uC9C0\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", null, "\uC5EC\uC6B8\uC740 \uC5D0\uC774\uC804\uD2B8 \uC5F0\uACB0\uC744 \uC218\uB3D9\uC73C\uB85C \uC2E0\uACE0\uBC1B\uB294 \uBC29\uC2DD \uB300\uC2E0, \uD2B8\uB798\uD53D \uD328\uD134\uACFC MCP \uD578\uB4DC\uC170\uC774\uD06C\uB97C \uC790\uB3D9 \uBD84\uC11D\uD574 Shadow Agent\uB97C \uC2DD\uBCC4\uD569\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("div", { className: "flow" }, /* @__PURE__ */ React.createElement("div", { className: "flow-step" }, /* @__PURE__ */ React.createElement("span", { className: "step-num" }, "STEP 01"), /* @__PURE__ */ React.createElement("h4", null, "\uD2B8\uB798\uD53D \uD551\uAC70\uD504\uB9B0\uD305"), /* @__PURE__ */ React.createElement("p", null, "\uC678\uBD80 LLM API \uC5D4\uB4DC\uD3EC\uC778\uD2B8(OpenAI, Anthropic, Google \uB4F1)\uB85C \uD5A5\uD558\uB294 \uBE44\uC778\uAC00 \uD2B8\uB798\uD53D \uD328\uD134\uACFC MCP SSE/WebSocket \uD578\uB4DC\uC170\uC774\uD06C\uB97C \uC218\uB3D9 \uAC1C\uC785 \uC5C6\uC774 \uD0D0\uC9C0\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "terminal" }, "detect llm_api \xB7 mcp_handshake \xB7 sse_stream")), /* @__PURE__ */ React.createElement("div", { className: "flow-step" }, /* @__PURE__ */ React.createElement("span", { className: "step-num" }, "STEP 02"), /* @__PURE__ */ React.createElement("h4", null, "\uD589\uB3D9 \uBD84\uB958 \uBC0F \uD398\uC774\uB85C\uB4DC \uBD84\uC11D"), /* @__PURE__ */ React.createElement("p", null, "\uD0D0\uC9C0\uB41C \uC5D0\uC774\uC804\uD2B8\uC758 \uB3C4\uAD6C \uD638\uCD9C \uD328\uD134(file_read, db_query, code_exec \uB4F1)\uACFC \uC804\uC1A1 \uD398\uC774\uB85C\uB4DC\uC5D0\uC11C \uBBFC\uAC10 \uB370\uC774\uD130 \uD3EC\uD568 \uC5EC\uBD80\uB97C \uBD84\uC11D\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "terminal" }, "classify tools \xB7 scan payload \xB7 tag pii")), /* @__PURE__ */ React.createElement("div", { className: "flow-step" }, /* @__PURE__ */ React.createElement("span", { className: "step-num" }, "STEP 03"), /* @__PURE__ */ React.createElement("h4", null, "\uC704\uD5D8\uB3C4 \uD3C9\uAC00 \uBC0F \uBCF4\uACE0"), /* @__PURE__ */ React.createElement("p", null, "\uB370\uC774\uD130 \uBBFC\uAC10\uB3C4 \xD7 \uB178\uCD9C \uD45C\uBA74 \xD7 \uC0AC\uC6A9 \uBE48\uB3C4\uB97C \uAE30\uBC18\uC73C\uB85C \uC704\uD5D8\uB3C4 \uC810\uC218\uB97C \uC0B0\uCD9C\uD558\uACE0, \uB2F4\uB2F9\uC790 \uC2DD\uBCC4\uACFC \uD568\uAED8 \uB9AC\uD3EC\uD2B8\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "terminal" }, "score risk \xB7 identify owner \xB7 report"))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 56, display: "flex", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(ContactButton, { onContact: goContact, prefill: "Shadow Agent \uC810\uAC80\uC744 \uBB38\uC758\uD569\uB2C8\uB2E4." })))), /* @__PURE__ */ React.createElement(ClosingCTA, { onContact: goContact, prefill: "\uC5EC\uC6B8 \uB3C4\uC785\uC744 \uBB38\uC758\uD569\uB2C8\uB2E4." }));
}
function FeaturePiiPage({ setRoute }) {
  const goContact = createContactNav(setRoute);
  const [selectedPii, setSelectedPii] = useState(null);
  const PII_LIST = [
    { num: "01", name: "\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638", desc: "\uC0DD\uB144\uC6D4\uC77C+\uC131\uBCC4+\uC9C0\uC5ED \uC870\uD569 \uD328\uD134, \uCCB4\uD06C\uC12C \uAC80\uC99D \uD3EC\uD568", method: "\uD615\uC2DD \uD328\uD134\uACFC \uCCB4\uD06C\uC12C\uC744 \uD568\uAED8 \uD655\uC778\uD558\uACE0 \uC8FC\uBCC0 \uBB38\uB9E5\uC5D0\uC11C \uC8FC\uBBFC\uBC88\uD638 \uC5EC\uBD80\uB97C \uC7AC\uAC80\uC99D\uD569\uB2C8\uB2E4.", action: "\uC678\uBD80 \uC804\uC1A1 \uC804\uC5D0 \uCC28\uB2E8\uD558\uAC70\uB098 900101-1****** \uD615\uD0DC\uB85C \uB9C8\uC2A4\uD0B9\uD558\uACE0 \uC0AC\uAC74 \uB85C\uADF8\uB97C \uB0A8\uAE41\uB2C8\uB2E4.", sample: "900101-1******" },
    { num: "02", name: "\uC678\uAD6D\uC778\uB4F1\uB85D\uBC88\uD638", desc: "A/B/C \uC720\uD615 \uC678\uAD6D\uC778 \uB4F1\uB85D \uBC88\uD638 \uD328\uD134 \uC804\uCCB4", method: "\uC678\uAD6D\uC778\uB4F1\uB85D\uBC88\uD638\uC758 \uC790\uB9AC \uAD6C\uC870\uC640 \uAC80\uC99D \uADDC\uCE59\uC744 \uC801\uC6A9\uD558\uACE0 \uAD6D\uC801\xB7\uCCB4\uB958 \uAD00\uB828 \uBB38\uB9E5\uC744 \uD568\uAED8 \uD655\uC778\uD569\uB2C8\uB2E4.", action: "\uD0D0\uC9C0\uB41C \uAC12\uC740 \uC815\uCC45\uC5D0 \uB530\uB77C \uCC28\uB2E8\xB7\uB9C8\uC2A4\uD0B9\uB418\uBA70 \uBC1C\uC0DD \uC704\uCE58\uC640 \uD638\uCD9C \uB3C4\uAD6C\uB97C \uAE30\uB85D\uD569\uB2C8\uB2E4.", sample: "900101-5******" },
    { num: "03", name: "\uC0AC\uC5C5\uC790\uB4F1\uB85D\uBC88\uD638", desc: "10\uC790\uB9AC \uACE0\uC720 \uD328\uD134, \uBC95\uC778\xB7\uAC1C\uC778\uC0AC\uC5C5\uC790 \uBAA8\uB450 \uC9C0\uC6D0", method: "10\uC790\uB9AC \uAD6C\uC870\uC640 \uAC80\uC99D \uADDC\uCE59, \uC0AC\uC5C5\uC790\xB7\uC138\uAE08\uACC4\uC0B0\uC11C \uB4F1 \uC8FC\uBCC0 \uD0A4\uC6CC\uB4DC\uB97C \uACB0\uD569\uD574 \uD310\uC815\uD569\uB2C8\uB2E4.", action: "\uD5C8\uC6A9 \uBAA9\uB85D\uC5D0 \uC5C6\uB294 \uC0AC\uC5C5\uC790\uBC88\uD638\uAC00 \uC678\uBD80\uB85C \uC804\uC1A1\uB418\uBA74 \uCC28\uB2E8\uD558\uAC70\uB098 \uBD80\uBD84 \uB9C8\uC2A4\uD0B9\uD569\uB2C8\uB2E4.", sample: "123-45-*****" },
    { num: "04", name: "\uBC95\uC778\uB4F1\uB85D\uBC88\uD638", desc: "13\uC790\uB9AC \uBC95\uC778 \uACE0\uC720 \uC2DD\uBCC4 \uBC88\uD638", method: "13\uC790\uB9AC \uBC95\uC778\uB4F1\uB85D\uBC88\uD638 \uD615\uC2DD\uACFC \uBC95\uC778\xB7\uB4F1\uAE30 \uAD00\uB828 \uBB38\uB9E5\uC744 \uD568\uAED8 \uD655\uC778\uD569\uB2C8\uB2E4.", action: "\uC751\uB2F5\uACFC \uB3C4\uAD6C \uD638\uCD9C \uC778\uC790\uC5D0\uC11C \uC2DD\uBCC4\uB418\uBA74 \uB178\uCD9C \uBC94\uC704\uB97C \uAE30\uB85D\uD558\uACE0 \uC815\uCC45\uC5D0 \uB530\uB77C \uC81C\uAC70\uD569\uB2C8\uB2E4.", sample: "110111-0******" },
    { num: "05", name: "\uC5EC\uAD8C\uBC88\uD638", desc: "\uD55C\uAD6D \uC804\uC790\uC5EC\uAD8C \uC54C\uD30C\uB274\uBA54\uB9AD \uD328\uD134", method: "\uC804\uC790\uC5EC\uAD8C\uC758 \uC601\uBB38\xB7\uC22B\uC790 \uC870\uD569 \uD615\uC2DD\uACFC \uC5EC\uAD8C\xB7\uCD9C\uC785\uAD6D \uBB38\uB9E5\uC744 \uACB0\uD569\uD574 \uC624\uD0D0\uC744 \uC904\uC785\uB2C8\uB2E4.", action: "\uC5EC\uAD8C\uBC88\uD638 \uC804\uCCB4\uAC00 \uB178\uCD9C\uB418\uC9C0 \uC54A\uB3C4\uB85D \uC77C\uBD80 \uBB38\uC790\uB9CC \uB0A8\uAE30\uACE0 \uB9C8\uC2A4\uD0B9\uD558\uAC70\uB098 \uC804\uC1A1\uC744 \uC911\uB2E8\uD569\uB2C8\uB2E4.", sample: "M12*****" },
    { num: "06", name: "\uC6B4\uC804\uBA74\uD5C8\uBC88\uD638", desc: "\uC9C0\uC5ED\uCF54\uB4DC+\uC0DD\uB144+\uACE0\uC720\uBC88\uD638 \uAD6C\uC870 \uD328\uD134", method: "\uC9C0\uC5ED \uCF54\uB4DC\uC640 \uC22B\uC790 \uAD6C\uBD84 \uAD6C\uC870\uB97C \uD655\uC778\uD558\uACE0 \uBA74\uD5C8\xB7\uC6B4\uC804\uC790 \uAD00\uB828 \uBB38\uB9E5\uC73C\uB85C \uBCF4\uAC15\uD569\uB2C8\uB2E4.", action: "\uD0D0\uC9C0 \uC2DC \uC678\uBD80 LLM \uB610\uB294 \uB3C4\uAD6C \uD638\uCD9C \uC9C1\uC804\uC5D0 \uB9C8\uC2A4\uD0B9\uD558\uACE0 \uAC10\uC0AC \uB85C\uADF8\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4.", sample: "11-12-******-**" },
    { num: "07", name: "\uAC74\uAC15\uBCF4\uD5D8\uC99D\uBC88\uD638", desc: "\uC694\uC591\uAE30\uAD00\uAE30\uD638 \uD3EC\uD568 \uBCF5\uD569 \uD328\uD134", method: "\uAC74\uAC15\uBCF4\uD5D8\xB7\uC694\uC591\uAE30\uAD00 \uBB38\uB9E5\uACFC \uBC88\uD638 \uAD6C\uC870\uB97C \uD568\uAED8 \uBD84\uC11D\uD574 \uC77C\uBC18 \uC22B\uC790\uC5F4\uACFC \uAD6C\uBD84\uD569\uB2C8\uB2E4.", action: "\uBBFC\uAC10 \uC758\uB8CC \uBB38\uB9E5\uACFC \uACB0\uD569\uB41C \uBC88\uD638\uB294 \uACE0\uC704\uD5D8 \uC774\uBCA4\uD2B8\uB85C \uBD84\uB958\uD574 \uCC28\uB2E8 \uBC0F \uC54C\uB9BC \uCC98\uB9AC\uD569\uB2C8\uB2E4.", sample: "***********" },
    { num: "08", name: "\uAE08\uC735\uACC4\uC88C\uBC88\uD638", desc: "18\uAC1C \uAD6D\uB0B4 \uC740\uD589 \uACC4\uC88C \uD615\uC2DD \uC804\uCCB4 \uC9C0\uC6D0", method: "\uC740\uD589\uBCC4 \uAE38\uC774\uC640 \uAD6C\uBD84\uC790 \uD328\uD134, \uC740\uD589\uBA85\xB7\uC785\uAE08\xB7\uC1A1\uAE08 \uBB38\uB9E5\uC744 \uD568\uAED8 \uBD84\uC11D\uD569\uB2C8\uB2E4.", action: "\uD5C8\uC6A9\uB41C \uC5C5\uBB34 \uD750\uB984\uC774 \uC544\uB2C8\uBA74 \uACC4\uC88C\uBC88\uD638\uB97C \uB9C8\uC2A4\uD0B9\uD558\uACE0 \uC5B4\uB5A4 \uC5D0\uC774\uC804\uD2B8\uAC00 \uC811\uADFC\uD588\uB294\uC9C0 \uB0A8\uAE41\uB2C8\uB2E4.", sample: "123-****-****-01" },
    { num: "09", name: "\uC2E0\uC6A9\xB7\uCCB4\uD06C\uCE74\uB4DC\uBC88\uD638", desc: "Luhn \uC54C\uACE0\uB9AC\uC998 + \uAD6D\uB0B4 \uCE74\uB4DC\uC0AC BIN \uD328\uD134", method: "\uCE74\uB4DC \uBC88\uD638 \uD615\uC2DD, Luhn \uAC80\uC99D, \uCE74\uB4DC\uC0AC BIN \uBC94\uC704\uB97C \uACB0\uD569\uD574 \uC720\uD6A8 \uAC00\uB2A5\uC131\uC744 \uD310\uB2E8\uD569\uB2C8\uB2E4.", action: "\uC55E\xB7\uB4A4 \uC77C\uBD80\uB9CC \uB0A8\uAE30\uACE0 \uB9C8\uC2A4\uD0B9\uD558\uBA70 CVC\xB7\uC720\uD6A8\uAE30\uAC04\uACFC \uD568\uAED8 \uBC1C\uACAC\uB418\uBA74 \uC989\uC2DC \uCC28\uB2E8\uD569\uB2C8\uB2E4.", sample: "1234-****-****-5678" },
    { num: "10", name: "\uD55C\uAD6D\uC2DD \uC804\uD654\uBC88\uD638", desc: "\uC9C0\uC5ED\uBC88\uD638\xB7\uD734\uB300\uD3F0\xB7\uC778\uD130\uB137\uC804\uD654 \uD3EC\uB9F7 \uBAA8\uB450 \uD3EC\uD568", method: "\uD558\uC774\uD508 \uC720\uBB34\uC640 \uAD6D\uAC00\uBC88\uD638, \uC9C0\uC5ED\uBC88\uD638\xB7\uD734\uB300\uC804\uD654\xB7\uC778\uD130\uB137\uC804\uD654 \uD615\uC2DD\uC744 \uC815\uADDC\uD654\uD574 \uD0D0\uC9C0\uD569\uB2C8\uB2E4.", action: "\uC5F0\uB77D\uCC98 \uC0AC\uC6A9 \uBAA9\uC801\uACFC \uC815\uCC45\uC5D0 \uB530\uB77C \uB9C8\uC2A4\uD0B9 \uB610\uB294 \uD1B5\uACFC\uC2DC\uD0A4\uACE0 \uCC98\uB9AC \uC774\uB825\uC744 \uB0A8\uAE41\uB2C8\uB2E4.", sample: "010-****-1234" },
    { num: "11", name: "\uD55C\uAD6D\uC2DD \uC8FC\uC18C", desc: "\uB3C4\uB85C\uBA85\xB7\uC9C0\uBC88 \uC8FC\uC18C NLP \uAE30\uBC18 \uCD94\uCD9C", method: "\uC2DC\xB7\uB3C4, \uC2DC\xB7\uAD70\xB7\uAD6C, \uB3C4\uB85C\uBA85\xB7\uC9C0\uBC88, \uAC74\uBB3C\xB7\uB3D9\uD638\uC218 \uD45C\uD604\uC744 \uBB38\uC7A5 \uB2E8\uC704\uB85C \uCD94\uCD9C\uD569\uB2C8\uB2E4.", action: "\uC0C1\uC138 \uC8FC\uC18C\uC758 \uB3D9\xB7\uD638\uC218 \uB4F1 \uC2DD\uBCC4\uC131\uC774 \uB192\uC740 \uBD80\uBD84\uC744 \uC6B0\uC120 \uB9C8\uC2A4\uD0B9\uD558\uACE0 \uC804\uC1A1 \uC815\uCC45\uC744 \uC801\uC6A9\uD569\uB2C8\uB2E4.", sample: "\uBD80\uC0B0\uAD11\uC5ED\uC2DC \uD574\uC6B4\uB300\uAD6C \u25CB\u25CB\uB85C **" },
    { num: "12", name: "\uC774\uBA54\uC77C \uC8FC\uC18C", desc: "RFC 5322 + \uD55C\uAD6D \uB3C4\uBA54\uC778 \uD2B9\uD654 \uD328\uD134", method: "\uC77C\uBC18 \uC774\uBA54\uC77C \uD615\uC2DD\uACFC \uD55C\uAE00 \uC11C\uBE44\uC2A4\uC5D0\uC11C \uC790\uC8FC \uC4F0\uC774\uB294 \uB3C4\uBA54\uC778\xB7\uBCC0\uD615 \uD45C\uAE30\uB97C \uD568\uAED8 \uC815\uADDC\uD654\uD569\uB2C8\uB2E4.", action: "\uAC1C\uC778 \uC774\uBA54\uC77C\uC740 \uC544\uC774\uB514 \uC77C\uBD80\uB97C \uAC00\uB9AC\uACE0, \uC5C5\uBB34\uC0C1 \uD5C8\uC6A9\uB41C \uB3C4\uBA54\uC778\uC740 \uC815\uCC45\uC5D0 \uB530\uB77C \uD1B5\uACFC\uC2DC\uD0AC \uC218 \uC788\uC2B5\uB2C8\uB2E4.", sample: "us***@company.kr" },
    { num: "13", name: "\uC758\uB8CC\xB7\uC9C4\uB2E8 \uC815\uBCF4", desc: "KCD \uCF54\uB4DC, \uCC98\uBC29\uC804 \uD328\uD134, \uC9C4\uB2E8\uC11C \uD0A4\uC6CC\uB4DC", method: "KCD \uCF54\uB4DC, \uC9C8\uD658\xB7\uCC98\uBC29\xB7\uAC80\uC0AC \uACB0\uACFC \uD45C\uD604\uC744 \uC8FC\uBCC0 \uD658\uC790 \uC2DD\uBCC4 \uC815\uBCF4\uC640 \uD568\uAED8 \uBD84\uC11D\uD569\uB2C8\uB2E4.", action: "\uC758\uB8CC \uC815\uBCF4\uB294 \uB192\uC740 \uBBFC\uAC10\uB3C4\uB85C \uBD84\uB958\uD574 \uAE30\uBCF8 \uCC28\uB2E8\uD558\uBA70, \uC2B9\uC778\uB41C \uC758\uB8CC \uC5C5\uBB34 \uD750\uB984\uB9CC \uC608\uC678 \uCC98\uB9AC\uD569\uB2C8\uB2E4.", sample: "\uC9C4\uB2E8 \uCF54\uB4DC \xB7 \uCC98\uBC29 \uC815\uBCF4 \xB7 \uAC80\uC0AC \uACB0\uACFC" },
    { num: "14", name: "\uC0DD\uCCB4 \uC2DD\uBCC4 \uC815\uBCF4", desc: "\uC5BC\uAD74 \uBCA1\uD130\xB7\uC9C0\uBB38 \uD574\uC2DC \uB4F1 \uBE44\uC815\uD615 \uC0DD\uCCB4\uC815\uBCF4 \uD0DC\uADF8", method: "\uD30C\uC77C\uBA85\xB7\uBA54\uD0C0\uB370\uC774\uD130\xB7\uB3C4\uAD6C \uC778\uC790\uC640 \uC0DD\uCCB4\uC815\uBCF4 \uAD00\uB828 \uD0DC\uADF8\uB97C \uBD84\uC11D\uD574 \uBE44\uC815\uD615 \uB370\uC774\uD130 \uD750\uB984\uC744 \uC2DD\uBCC4\uD569\uB2C8\uB2E4.", action: "\uC6D0\uBCF8 \uB610\uB294 \uD2B9\uC9D5\uAC12\uC758 \uC678\uBD80 \uC804\uC1A1\uC744 \uB9C9\uACE0 \uC811\uADFC \uC8FC\uCCB4\xB7\uB3C4\uAD6C\xB7\uB300\uC0C1 \uC5D4\uB4DC\uD3EC\uC778\uD2B8\uB97C \uAE30\uB85D\uD569\uB2C8\uB2E4.", sample: "face_embedding \xB7 fingerprint_hash" }
  ];
  useEffect(() => {
    if (!selectedPii) return;
    const onKey = (event) => {
      if (event.key === "Escape") setSelectedPii(null);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [selectedPii]);
  return /* @__PURE__ */ React.createElement("div", { "data-screen-label": "Feature: K-PII" }, /* @__PURE__ */ React.createElement("section", { className: "page-hero" }, /* @__PURE__ */ React.createElement("div", { className: "hero-bg" }), /* @__PURE__ */ React.createElement("div", { className: "container", style: { position: "relative" } }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "CAPABILITY 02 \xB7 K-PII \uCC28\uB2E8"), /* @__PURE__ */ React.createElement("h1", null, "\uD55C\uAD6D\uC2DD \uAC1C\uC778\uC815\uBCF4", /* @__PURE__ */ React.createElement("br", null), "14\uC885, \uC720\uCD9C \uC804\uC5D0", /* @__PURE__ */ React.createElement("br", null), "\uB9C9\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", null, "\uAD6D\uC81C LLM \uBCF4\uC548 \uB3C4\uAD6C\uB294 \uD55C\uAD6D\uC2DD \uC8FC\uBBFC\uBC88\uD638\xB7\uC0AC\uC5C5\uC790\uBC88\uD638\xB7\uC6B4\uC804\uBA74\uD5C8\uBC88\uD638\xB7\uD55C\uAD6D\uC2DD \uC8FC\uC18C\uB97C \uC81C\uB300\uB85C \uC2DD\uBCC4\uD558\uC9C0 \uBABB\uD569\uB2C8\uB2E4. \uC5EC\uC6B8\uC758 K-PII \uD0D0\uC9C0\uAE30\uB294 \uD55C\uAD6D \uAC1C\uC778\uC815\uBCF4 14\uC885\uC744 \uC804\uC6A9 \uD328\uD134\uACFC \uCEE8\uD14D\uC2A4\uD2B8 \uC778\uC2DD ML \uBAA8\uB378\uB85C \uC2E4\uC2DC\uAC04 \uD0D0\uC9C0\uD558\uACE0, \uC5D0\uC774\uC804\uD2B8\uAC00 \uC678\uBD80\uB85C \uC804\uC1A1\uD558\uAE30 \uC804\uC5D0 \uCC28\uB2E8\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "hero-cta", style: { marginTop: 36 } }, /* @__PURE__ */ React.createElement(ContactButton, { onContact: goContact, prefill: "K-PII \uCC28\uB2E8 \uB3C4\uC785\uC744 \uBB38\uC758\uD569\uB2C8\uB2E4." }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost", onClick: () => {
    setRoute("product");
    window.scrollTo({ top: 0 });
  } }, "\uC5EC\uC6B8 \uC804\uCCB4 \uBCF4\uAE30 ", /* @__PURE__ */ React.createElement("span", { className: "arrow" }, "\u2192"))))), /* @__PURE__ */ React.createElement("section", { className: "block" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "WHY KOREAN-SPECIFIC"), /* @__PURE__ */ React.createElement("h2", null, "\uAD6D\uC81C \uB3C4\uAD6C\uAC00 \uB193\uCE58\uB294", /* @__PURE__ */ React.createElement("br", null), "\uD55C\uAD6D \uAC1C\uC778\uC815\uBCF4\uC758 \uAD6C\uC870."), /* @__PURE__ */ React.createElement("p", null, "\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638\uB294 \uC0DD\uB144\uC6D4\uC77C\xB7\uC131\uBCC4\xB7\uC9C0\uC5ED\uCF54\uB4DC\uB97C \uC870\uD569\uD55C \uACE0\uC720 \uAD6C\uC870\uB97C \uAC00\uC9C0\uBA70, \uD55C\uAD6D\uC2DD \uC8FC\uC18C\uB294 \uB3C4\uB85C\uBA85\xB7\uC9C0\uBC88\xB7\uB3D9\uD638\uC218\uC758 \uBCF5\uD569 \uD45C\uD604\uC774 \uD63C\uC7AC\uD569\uB2C8\uB2E4. \uACC4\uC88C\uBC88\uD638\uB294 18\uAC1C \uC740\uD589\uBCC4 \uD615\uC2DD\uC774 \uB2E4\uB974\uACE0, \uC758\uB8CC \uC815\uBCF4\uB294 \uD55C\uAD6D\uD615 \uC9C4\uB2E8 \uCF54\uB4DC(KCD)\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4. \uC774\uB97C \uC815\uD655\uD788 \uD0D0\uC9C0\uD558\uB824\uBA74 \uD55C\uAD6D\uC5B4 \uC804\uC6A9 \uD328\uD134\uACFC \uBB38\uB9E5 \uC774\uD574\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("div", { className: "stats" }, /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "14", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "\uC885")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uD55C\uAD6D\uC2DD PII \uCE74\uD14C\uACE0\uB9AC")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "99.1", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "%")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uC8FC\uBBFC\uBC88\uD638 \uD0D0\uC9C0 \uC815\uD655\uB3C4")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "18", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "\uAC1C")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uC9C0\uC6D0 \uAD6D\uB0B4 \uC740\uD589 \uACC4\uC88C \uD328\uD134")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "<2", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "ms")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uC2E4\uC2DC\uAC04 \uD0D0\uC9C0 \uC9C0\uC5F0"))))), /* @__PURE__ */ React.createElement("section", { className: "block", style: { paddingTop: 0, borderTop: "none" } }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "COVERAGE \xB7 14 CATEGORIES"), /* @__PURE__ */ React.createElement("h2", null, "\uD0D0\uC9C0 \uB300\uC0C1 14\uC885.")), /* @__PURE__ */ React.createElement("div", { className: "info-card-grid" }, PII_LIST.map((p) => /* @__PURE__ */ React.createElement("button", { key: p.num, type: "button", className: "info-card", onClick: () => setSelectedPii(p), "aria-label": `${p.name} \uC0C1\uC138 \uC124\uBA85 \uBCF4\uAE30` }, /* @__PURE__ */ React.createElement("span", { className: "info-card-num" }, p.num), /* @__PURE__ */ React.createElement("strong", null, p.name), /* @__PURE__ */ React.createElement("span", { className: "info-card-desc" }, p.desc), /* @__PURE__ */ React.createElement("span", { className: "info-card-more" }, "\uC0C1\uC138 \uC124\uBA85 \uBCF4\uAE30 ", /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "\u2192"))))), /* @__PURE__ */ React.createElement("p", { className: "info-grid-hint" }, "\uAC01 \uD56D\uBAA9\uC744 \uD074\uB9AD\uD558\uBA74 \uD0D0\uC9C0 \uBC29\uC2DD\uACFC \uCC98\uB9AC \uC608\uC2DC\uB97C \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."))), selectedPii && /* @__PURE__ */ React.createElement("div", { className: "detail-modal-backdrop", role: "presentation", onMouseDown: (e) => {
    if (e.target === e.currentTarget) setSelectedPii(null);
  } }, /* @__PURE__ */ React.createElement("section", { className: "detail-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "pii-detail-title" }, /* @__PURE__ */ React.createElement("button", { className: "detail-modal-close", type: "button", onClick: () => setSelectedPii(null), "aria-label": "\uC0C1\uC138 \uC124\uBA85 \uB2EB\uAE30" }, "\xD7"), /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "K-PII CATEGORY \xB7 ", selectedPii.num), /* @__PURE__ */ React.createElement("h3", { id: "pii-detail-title" }, selectedPii.name), /* @__PURE__ */ React.createElement("p", { className: "detail-modal-lead" }, selectedPii.desc), /* @__PURE__ */ React.createElement("div", { className: "detail-modal-grid" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "\uD0D0\uC9C0 \uBC29\uC2DD"), /* @__PURE__ */ React.createElement("p", null, selectedPii.method)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "\uD0D0\uC9C0 \uD6C4 \uCC98\uB9AC"), /* @__PURE__ */ React.createElement("p", null, selectedPii.action))), /* @__PURE__ */ React.createElement("div", { className: "detail-sample" }, /* @__PURE__ */ React.createElement("span", null, "\uB9C8\uC2A4\uD0B9\xB7\uD45C\uAE30 \uC608\uC2DC"), /* @__PURE__ */ React.createElement("code", null, selectedPii.sample)), /* @__PURE__ */ React.createElement("div", { className: "detail-modal-actions" }, /* @__PURE__ */ React.createElement(ContactButton, { onContact: goContact, prefill: "K-PII \uCC28\uB2E8 \uAD00\uB828 \uC790\uB8CC\uB97C \uBB38\uC758\uD569\uB2C8\uB2E4." }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost", onClick: () => setSelectedPii(null) }, "\uB2EB\uAE30")))), /* @__PURE__ */ React.createElement("section", { className: "block", id: "how-pii-works" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "DETECTION APPROACH"), /* @__PURE__ */ React.createElement("h2", null, "\uD328\uD134 + ML + \uBB38\uB9E5 \uC778\uC2DD", /* @__PURE__ */ React.createElement("br", null), "3\uB2E8 \uBC29\uC5B4 \uAD6C\uC870."), /* @__PURE__ */ React.createElement("p", null, "\uB2E8\uC21C \uC815\uADDC\uC2DD \uB9E4\uCE6D\uC744 \uB118\uC5B4, LLM \uC751\uB2F5 \uBB38\uB9E5 \uC804\uCCB4\uB97C \uBD84\uC11D\uD574 \uC704\uC7A5\uB41C PII\uC640 \uC790\uC5F0\uC5B4\uB85C \uC11C\uC220\uB41C \uAC1C\uC778\uC815\uBCF4\uB3C4 \uC7A1\uC544\uB0C5\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("div", { className: "flow" }, /* @__PURE__ */ React.createElement("div", { className: "flow-step" }, /* @__PURE__ */ React.createElement("span", { className: "step-num" }, "LAYER 01"), /* @__PURE__ */ React.createElement("h4", null, "\uC815\uADDC\uC2DD \uD328\uD134 \uB9E4\uCE6D"), /* @__PURE__ */ React.createElement("p", null, "\uC8FC\uBBFC\uBC88\uD638 \uCCB4\uD06C\uC12C\xB7\uCE74\uB4DC Luhn \uC54C\uACE0\uB9AC\uC998\xB7\uACC4\uC88C\uBC88\uD638 \uD615\uC2DD \uB4F1 \uAD6C\uC870\uC801\uC73C\uB85C \uAC80\uC99D \uAC00\uB2A5\uD55C \uD328\uD134\uC744 0ms \uC9C0\uC5F0\uC73C\uB85C 1\uCC28 \uD544\uD130\uB9C1\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "terminal" }, "regex \xB7 checksum \xB7 luhn \xB7 bank_bin")), /* @__PURE__ */ React.createElement("div", { className: "flow-step" }, /* @__PURE__ */ React.createElement("span", { className: "step-num" }, "LAYER 02"), /* @__PURE__ */ React.createElement("h4", null, "ML \uBD84\uB958 \uBAA8\uB378"), /* @__PURE__ */ React.createElement("p", null, "\uBB38\uB9E5 \uC5C6\uC774 \uC22B\uC790 \uB098\uC5F4\uB9CC\uC73C\uB85C\uB294 \uAD6C\uBD84\uD558\uAE30 \uC5B4\uB824\uC6B4 \uD328\uD134\uC744 \uD55C\uAD6D\uC5B4 NER \uBAA8\uB378\uC774 \uC8FC\uBCC0 \uBB38\uC7A5\uACFC \uD568\uAED8 \uD310\uB2E8\uD569\uB2C8\uB2E4. \uC624\uD0D0\uB960 2% \uBBF8\uB9CC."), /* @__PURE__ */ React.createElement("div", { className: "terminal" }, "ner \xB7 context_window \xB7 false_positive_filter")), /* @__PURE__ */ React.createElement("div", { className: "flow-step" }, /* @__PURE__ */ React.createElement("span", { className: "step-num" }, "LAYER 03"), /* @__PURE__ */ React.createElement("h4", null, "\uC2E4\uC2DC\uAC04 \uCC28\uB2E8\xB7\uB9C8\uC2A4\uD0B9"), /* @__PURE__ */ React.createElement("p", null, "\uD0D0\uC9C0\uB41C PII\uB97C \uC5D0\uC774\uC804\uD2B8 \uC751\uB2F5\uC5D0\uC11C \uC989\uC2DC \uC81C\uAC70\uD558\uAC70\uB098 \uB9C8\uC2A4\uD0B9 \uCC98\uB9AC\uD558\uACE0, \uC0AC\uAC74 \uB85C\uADF8\uC640 \uD568\uAED8 \uB2F4\uB2F9\uC790\uC5D0\uAC8C \uC54C\uB9BC\uC744 \uC804\uC1A1\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "terminal" }, "redact \xB7 mask \xB7 alert \xB7 log_event"))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 56, display: "flex", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(ContactButton, { onContact: goContact, prefill: "K-PII \uCC28\uB2E8 \uB3C4\uC785\uC744 \uBB38\uC758\uD569\uB2C8\uB2E4." })))), /* @__PURE__ */ React.createElement(ClosingCTA, { onContact: goContact, prefill: "\uC5EC\uC6B8 \uB3C4\uC785\uC744 \uBB38\uC758\uD569\uB2C8\uB2E4." }));
}
function FeatureReportPage({ setRoute }) {
  const goContact = createContactNav(setRoute);
  const FRAMEWORKS = [
    { id: "01", name: "ISMS-P", full: "\uC815\uBCF4\uBCF4\uD638 \uBC0F \uAC1C\uC778\uC815\uBCF4\uBCF4\uD638 \uAD00\uB9AC\uCCB4\uACC4 \uC778\uC99D", scope: "\uC778\uC99D\uC2EC\uC0AC \uB300\uC751" },
    { id: "02", name: "\uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uBC95", full: "\uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638\uBC95 (2023\uB144 \uAC1C\uC815)", scope: "\uBC95\uC801 \uC758\uBB34" },
    { id: "03", name: "\uAE08\uC735\uBCF4\uC548\uC6D0 AI \uAC00\uC774\uB4DC", full: "\uAE08\uC735\uBD84\uC57C AI \uBCF4\uC548 \uAC00\uC774\uB4DC\uB77C\uC778", scope: "\uAE08\uC735\uAD8C \uD544\uC218" },
    { id: "04", name: "\uAE08\uC735\uC704 AI \uAC00\uC774\uB4DC", full: "\uAE08\uC735\uBD84\uC57C \uC778\uACF5\uC9C0\uB2A5(AI) \uD65C\uC6A9 \uAC00\uC774\uB4DC\uB77C\uC778", scope: "\uAE08\uC735\uAD8C \uD544\uC218" },
    { id: "05", name: "NIST AI RMF", full: "NIST AI Risk Management Framework 1.0", scope: "\uAE00\uB85C\uBC8C \uAE30\uC900" },
    { id: "06", name: "ISO/IEC 42001", full: "AI Management System Standard", scope: "\uAD6D\uC81C \uC778\uC99D" },
    { id: "07", name: "EU AI Act", full: "EU Artificial Intelligence Act", scope: "EU \uC11C\uBE44\uC2A4" },
    { id: "08", name: "K-ISMS", full: "\uAD6D\uB0B4 \uC815\uBCF4\uBCF4\uD638\uAD00\uB9AC\uCCB4\uACC4", scope: "\uACF5\uACF5\xB7\uC758\uBB34\uB300\uC0C1" }
  ];
  return /* @__PURE__ */ React.createElement("div", { "data-screen-label": "Feature: Compliance Report" }, /* @__PURE__ */ React.createElement("section", { className: "page-hero" }, /* @__PURE__ */ React.createElement("div", { className: "hero-bg" }), /* @__PURE__ */ React.createElement("div", { className: "container", style: { position: "relative" } }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "CAPABILITY 03 \xB7 \uC99D\uAC70 \uAE30\uBC18 \uB9AC\uD3EC\uD2B8"), /* @__PURE__ */ React.createElement("h1", null, "\uBB34\uC5C7\uC744 \uD655\uC778\uD588\uACE0", /* @__PURE__ */ React.createElement("br", null), "\uBB34\uC5C7\uC774 \uB0A8\uC558\uB294\uC9C0", /* @__PURE__ */ React.createElement("br", null), "\uC801\uC5B4 \uB4DC\uB9BD\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("p", null, "\uC5EC\uC6B8\uC758 \uB9AC\uD3EC\uD2B8\uB294 \uCDE8\uC57D\uC810\uB9C8\uB2E4 \uC7AC\uD604\uD560 \uC218 \uC788\uB294 \uCD5C\uC18C\uD55C\uC758 \uC99D\uAC70\uB97C \uB2F4\uC2B5\uB2C8\uB2E4. \uD45C\uC9C0\uC5D0\uB294 \uC774\uBC88 \uAC80\uC0AC\uAC00 \uB2E4\uB8EC \uBC94\uC704\uB97C \uC801\uACE0, \uD655\uC778\uD558\uC9C0 \uBABB\uD55C \uBD80\uBD84\uC740 \uBBF8\uAC80\uC0AC(UNTESTED)\uB85C \uB0A8\uAE41\uB2C8\uB2E4. \uAD00\uB828 \uAE30\uC900\uACFC\uC758 \uC5F0\uACB0\uC740 \uCC38\uACE0 \uC790\uB8CC\uB85C \uD568\uAED8 \uC815\uB9AC\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "hero-cta", style: { marginTop: 36 } }, /* @__PURE__ */ React.createElement(ContactButton, { onContact: goContact, prefill: "\uC99D\uAC70 \uAE30\uBC18 \uB9AC\uD3EC\uD2B8 \uB3C4\uC785\uC744 \uBB38\uC758\uD569\uB2C8\uB2E4." }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost", onClick: () => {
    setRoute("product");
    window.scrollTo({ top: 0 });
  } }, "\uC5EC\uC6B8 \uC804\uCCB4 \uBCF4\uAE30 ", /* @__PURE__ */ React.createElement("span", { className: "arrow" }, "\u2192"))))), /* @__PURE__ */ React.createElement("section", { className: "block" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "THE GAP"), /* @__PURE__ */ React.createElement("h2", null, "\uBCF4\uC548 \uACB0\uACFC\uBB3C\uC774", /* @__PURE__ */ React.createElement("br", null), "\uBC95\uBB34\uD300\uC5D0 \uB2FF\uC9C0 \uC54A\uB294 \uBB38\uC81C."), /* @__PURE__ */ React.createElement("p", null, "\uAE30\uC874 \uBAA8\uC758\uD574\uD0B9 \uB9AC\uD3EC\uD2B8\uB294 CVSS \uC810\uC218\uC640 \uAE30\uC220\uC801 \uC7AC\uD604 \uBC29\uBC95\uB9CC \uB2F4\uACA8\uC788\uC5B4, \uBC95\uBB34\xB7\uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4\uD300\uC774 \uC774\uB97C \uBC95\uC801 \uC758\uBB34 \uC774\uD589\uC5D0 \uD65C\uC6A9\uD558\uAE30 \uC5B4\uB835\uC2B5\uB2C8\uB2E4. \uC5EC\uC6B8\uC740 \uB3D9\uC77C\uD55C \uCDE8\uC57D\uC810 \uB370\uC774\uD130\uB97C \uAE30\uC220\uC801 PoC\uC640 \uBC95\uC801 \uB9E4\uD551 \uB450 \uD615\uD0DC\uB85C \uB3D9\uC2DC\uC5D0 \uC0B0\uCD9C\uD569\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("div", { className: "stats" }, /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "8", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "\uAC1C")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4 \uB9E4\uD551 \uAE30\uC900")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "100", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "%")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uD55C\uAD6D\uC5B4 \uB9AC\uD3EC\uD2B8 \uC81C\uACF5")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "2", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "\uD3EC\uB9F7")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "PDF + \uC6F9 \uB9AC\uD3EC\uD2B8 \uB3D9\uC2DC \uC0B0\uCD9C")), /* @__PURE__ */ React.createElement("div", { className: "item" }, /* @__PURE__ */ React.createElement("div", { className: "v" }, "36", /* @__PURE__ */ React.createElement("span", { className: "unit" }, "\uBD84")), /* @__PURE__ */ React.createElement("div", { className: "k" }, "\uD3C9\uADE0 \uB9AC\uD3EC\uD2B8 \uC0DD\uC131 \uC2DC\uAC04"))))), /* @__PURE__ */ React.createElement("section", { className: "block", style: { paddingTop: 0, borderTop: "none" } }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "SUPPORTED FRAMEWORKS \xB7 08"), /* @__PURE__ */ React.createElement("h2", null, "\uB9E4\uD551 \uC9C0\uC6D0 \uAE30\uC900 8\uC885.")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 } }, FRAMEWORKS.map((f) => /* @__PURE__ */ React.createElement("div", { key: f.id, style: {
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 6
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: '"JetBrains Mono",monospace', fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em" } }, f.id), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: '"JetBrains Mono",monospace', fontSize: 10, color: "var(--text-2)", letterSpacing: "0.05em", textTransform: "uppercase", padding: "3px 8px", border: "1px solid var(--border)", borderRadius: 999 } }, f.scope)), /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 15, color: "var(--text)", fontWeight: 600 } }, f.name), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 } }, f.full)))))), /* @__PURE__ */ React.createElement("section", { className: "block", id: "report-structure" }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { className: "section-head" }, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "REPORT STRUCTURE"), /* @__PURE__ */ React.createElement("h2", null, "\uB9AC\uD3EC\uD2B8 \uC548\uC5D0 \uB2F4\uAE30\uB294 \uAC83\uB4E4."), /* @__PURE__ */ React.createElement("p", null, "\uAE30\uC220\uD300\uACFC \uACBD\uC601\uC9C4\uC774 \uAC19\uC740 \uB9AC\uD3EC\uD2B8\uB85C \uC11C\uB85C \uB2E4\uB978 \uB9E5\uB77D\uC5D0\uC11C \uD544\uC694\uD55C \uC815\uBCF4\uB97C \uC5BB\uC744 \uC218 \uC788\uB3C4\uB85D \uAD6C\uC131\uB429\uB2C8\uB2E4.")), /* @__PURE__ */ React.createElement("div", { className: "flow" }, /* @__PURE__ */ React.createElement("div", { className: "flow-step" }, /* @__PURE__ */ React.createElement("span", { className: "step-num" }, "SECTION A"), /* @__PURE__ */ React.createElement("h4", null, "\uC7AC\uD604 \uAC00\uB2A5\uD55C \uC99D\uAC70"), /* @__PURE__ */ React.createElement("p", null, "\uBC1C\uACAC\uB41C \uCDE8\uC57D\uC810\uC744 \uADF8\uB300\uB85C \uC7AC\uD604\uD560 \uC218 \uC788\uB294 \uD504\uB86C\uD504\uD2B8\xB7API \uC694\uCCAD\xB7\uC7AC\uD604 \uC808\uCC28\uB97C \uB2F4\uC2B5\uB2C8\uB2E4. \uD310\uC815\uC740 \uD655\uC815\xB7\uC758\uC2EC\xB7\uD1B5\uACFC\xB7\uBBF8\uAC80\uC0AC \uB124 \uB2E8\uACC4\uB85C \uAD6C\uBD84\uD574 \uD45C\uC2DC\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "terminal" }, "poc_prompt \xB7 api_request \xB7 replay_steps")), /* @__PURE__ */ React.createElement("div", { className: "flow-step" }, /* @__PURE__ */ React.createElement("span", { className: "step-num" }, "SECTION B"), /* @__PURE__ */ React.createElement("h4", null, "\uAD00\uB828 \uAE30\uC900 \uCC38\uACE0 \uC790\uB8CC"), /* @__PURE__ */ React.createElement("p", null, "\uAC01 \uCDE8\uC57D\uC810\uC774 ISMS-P\xB7\uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uBC95 \uB4F1 \uC5B4\uB5A4 \uD56D\uBAA9\uACFC \uAD00\uB828\uB418\uB294\uC9C0 \uCC38\uACE0\uD560 \uC218 \uC788\uB3C4\uB85D \uC815\uB9AC\uD569\uB2C8\uB2E4. \uBC95\uC801 \uD310\uB2E8\uC774\uB098 \uC758\uBB34 \uC774\uD589 \uC5EC\uBD80\uB294 \uB2F4\uB2F9 \uBD80\uC11C\uC758 \uAC80\uD1A0\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "terminal" }, "isms_p_ctrl \xB7 pipa_article \xB7 penalty_ref")), /* @__PURE__ */ React.createElement("div", { className: "flow-step" }, /* @__PURE__ */ React.createElement("span", { className: "step-num" }, "SECTION C"), /* @__PURE__ */ React.createElement("h4", null, "\uC6B0\uC120\uC21C\uC704 \uC870\uCE58 \uB85C\uB4DC\uB9F5"), /* @__PURE__ */ React.createElement("p", null, "\uC704\uD5D8\uB3C4\xB7\uD53C\uD574 \uADDC\uBAA8\xB7\uC870\uCE58 \uB09C\uC774\uB3C4\uB97C \uAE30\uBC18\uC73C\uB85C \uB2E8\uAE30\xB7\uC911\uAE30\xB7\uC7A5\uAE30 \uC870\uCE58 \uD56D\uBAA9\uC744 \uC6B0\uC120\uC21C\uC704\uD654\uD558\uC5EC \uC2E4\uD589 \uAC00\uB2A5\uD55C \uCCB4\uD06C\uB9AC\uC2A4\uD2B8\uB85C \uC81C\uACF5\uD569\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("div", { className: "terminal" }, "priority_high \xB7 action_plan \xB7 timeline"))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 56, display: "flex", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(ContactButton, { onContact: goContact, prefill: "\uC99D\uAC70 \uAE30\uBC18 \uB9AC\uD3EC\uD2B8 \uC0C1\uC138 \uC790\uB8CC\uB97C \uBB38\uC758\uD569\uB2C8\uB2E4." })))), /* @__PURE__ */ React.createElement(ClosingCTA, { onContact: goContact, prefill: "\uC5EC\uC6B8 \uB3C4\uC785\uC744 \uBB38\uC758\uD569\uB2C8\uB2E4." }));
}
Object.assign(window, { FeatureShadowPage, FeaturePiiPage, FeatureReportPage });

/* ---- src/app.jsx ---- */
const APP_ROUTES = [
  "home",
  "team",
  "product",
  "pricing",
  "privacy",
  "terms",
  "feature-shadow",
  "feature-pii",
  "feature-report"
];
function App() {
  const [theme, setTheme] = useTheme();
  const [route, setRoute] = useState(() => {
    const hash = (location.hash || "").replace("#", "");
    return APP_ROUTES.includes(hash) ? hash : "home";
  });
  const [prevRoute, setPrevRoute] = useState(null);
  const lastRoute = useRef(route);
  useEffect(() => {
    if (lastRoute.current !== route) {
      setPrevRoute(lastRoute.current);
      lastRoute.current = route;
    }
  }, [route]);
  const goBack = () => {
    setRoute(prevRoute && prevRoute !== route ? prevRoute : "home");
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  useEffect(() => {
    const onHashChange = () => {
      const hash = (location.hash || "").replace("#", "");
      setRoute(APP_ROUTES.includes(hash) ? hash : "home");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  useEffect(() => {
    const nextHash = `#${route}`;
    if (location.hash !== nextHash) location.hash = route;
  }, [route]);
  useFullScroll(route);
  useReveal(route);
  useEffect(() => {
    const meta = {
      home: ["\uC0C8\uACB0 | \uD55C\uAD6D\uC5B4 AI \uC5D0\uC774\uC804\uD2B8 \uBCF4\uC548", "\uC5EC\uC6B8\uC740 AI \uC5D0\uC774\uC804\uD2B8\uB97C \uB0B4\uBCF4\uB0B4\uAE30 \uC804\uC5D0 \uD55C\uAD6D\uC5B4\uB85C \uACF5\uACA9\uC744 \uB123\uC5B4\uBCF4\uACE0, \uBC30\uD3EC\uD574\uB3C4 \uB418\uB294\uC9C0 \uD310\uC815\uD569\uB2C8\uB2E4. \uD655\uC778\uD55C \uBC94\uC704\uC640 \uD655\uC778\uD558\uC9C0 \uBABB\uD55C \uBC94\uC704\uB97C \uD568\uAED8 \uC54C\uB824\uB4DC\uB9BD\uB2C8\uB2E4."],
      team: ["\uD300 \uC18C\uAC1C | \uC0C8\uACB0", "\uD55C\uAD6D\uC5B4 AI \uC5D0\uC774\uC804\uD2B8 \uBCF4\uC548\uC744 \uC5F0\uAD6C\uD558\uACE0 \uB9CC\uB4DC\uB294 \uC0C8\uACB0 \uD300\uC744 \uC18C\uAC1C\uD569\uB2C8\uB2E4."],
      product: ["\uC5EC\uC6B8 | \uD55C\uAD6D\uC5B4 AI \uC5D0\uC774\uC804\uD2B8 \uCE68\uD22C \uD14C\uC2A4\uD2B8", "\uC870\uC0AC\uC640 \uC5B4\uBBF8\uB97C \uBC14\uAFD4\uAC00\uBA70 \uD55C\uAD6D\uC5B4\uB85C \uACF5\uACA9\uD574, \uC601\uC5B4 \uAE30\uC900 \uD544\uD130\uAC00 \uB193\uCE58\uB294 \uAD6C\uBA4D\uC744 \uCC3E\uC2B5\uB2C8\uB2E4. \uC7AC\uD604 \uAC00\uB2A5\uD55C \uC99D\uAC70\uC640 \uAC80\uC0AC \uBC94\uC704\uB97C \uD568\uAED8 \uB2F4\uC740 \uB9AC\uD3EC\uD2B8\uB97C \uB4DC\uB9BD\uB2C8\uB2E4."],
      pricing: ["\uC5EC\uC6B8 \uC694\uAE08\uC81C | \uC0C8\uACB0", "\uBB34\uB8CC, \uD504\uB85C, \uD504\uB79C\uCC28\uC774\uC988 \uD50C\uB79C\uC758 \uAE30\uB2A5\uACFC \uB3C4\uC785 \uBC29\uC2DD\uC744 \uBE44\uAD50\uD569\uB2C8\uB2E4."],
      privacy: ["\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68 | \uC0C8\uACB0", "\uC0C8\uACB0 \uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68\uC785\uB2C8\uB2E4."],
      terms: ["\uC774\uC6A9\uC57D\uAD00 | \uC0C8\uACB0", "\uC0C8\uACB0 \uD648\uD398\uC774\uC9C0 \uC774\uC6A9\uC57D\uAD00\uC785\uB2C8\uB2E4."],
      "feature-shadow": ["Shadow Agent \uD0D0\uC9C0 | \uC5EC\uC6B8", "\uC0AC\uB0B4 \uB370\uC774\uD130\uC5D0 \uC811\uADFC\uD558\uB294 \uBE44\uC778\uAC00 AI \uC5D0\uC774\uC804\uD2B8\uB97C \uBC1C\uACAC\uD558\uACE0 \uC704\uD5D8\uB3C4\uB97C \uD3C9\uAC00\uD569\uB2C8\uB2E4."],
      "feature-pii": ["K-PII \uCC28\uB2E8 | \uC5EC\uC6B8", "\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638, \uC0AC\uC5C5\uC790\uB4F1\uB85D\uBC88\uD638, \uACC4\uC88C\uBC88\uD638 \uB4F1 \uD55C\uAD6D\uC2DD \uAC1C\uC778\uC815\uBCF4\uB97C \uD0D0\uC9C0\uD558\uACE0 \uCC28\uB2E8\uD569\uB2C8\uB2E4."],
      "feature-report": ["\uC99D\uAC70 \uAE30\uBC18 \uB9AC\uD3EC\uD2B8 | \uC5EC\uC6B8", "\uCDE8\uC57D\uC810\uB9C8\uB2E4 \uC7AC\uD604 \uAC00\uB2A5\uD55C \uCD5C\uC18C \uC99D\uAC70\uB97C \uB2F4\uACE0, \uD45C\uC9C0\uC5D0 \uC774\uBC88 \uAC80\uC0AC\uAC00 \uB2E4\uB8EC \uBC94\uC704\uB97C \uC801\uC740 PDF \uB9AC\uD3EC\uD2B8\uB97C \uB4DC\uB9BD\uB2C8\uB2E4."]
    };
    const [title, description] = meta[route] || meta.home;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [route]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Nav, { route, setRoute, theme, setTheme }), /* @__PURE__ */ React.createElement(SectionDots, { route }), route === "home" && /* @__PURE__ */ React.createElement(HomePage, { setRoute }), route === "team" && /* @__PURE__ */ React.createElement(TeamPage, { setRoute }), route === "product" && /* @__PURE__ */ React.createElement(ProductPage, { setRoute }), route === "pricing" && /* @__PURE__ */ React.createElement(PricingPage, { setRoute }), route === "privacy" && /* @__PURE__ */ React.createElement(PrivacyPage, { onBack: goBack }), route === "terms" && /* @__PURE__ */ React.createElement(TermsPage, { onBack: goBack }), route === "feature-shadow" && /* @__PURE__ */ React.createElement(FeatureShadowPage, { setRoute }), route === "feature-pii" && /* @__PURE__ */ React.createElement(FeaturePiiPage, { setRoute }), route === "feature-report" && /* @__PURE__ */ React.createElement(FeatureReportPage, { setRoute }), /* @__PURE__ */ React.createElement(Footer, { setRoute }));
}
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
