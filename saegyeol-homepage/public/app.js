const { useState, useEffect, useRef } = React;
const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;
const MAX_UPLOAD_LABEL = "4.5MB";
function useFullScroll(route) {
    useEffect(() => {
        const frame = requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
        return () => cancelAnimationFrame(frame);
    }, [route]);
}
function useReveal(route) {
    useEffect(() => {
        const SELECTORS = [
            'section.block .section-head',
            'section.block .cards > article',
            'section.block .stats',
            'section.block .flow-step',
            'section.block .banner',
            'section.block .contact-grid > div',
            'section.block .team-grid',
            'section.block .recruit',
            '.closing-cta-inner',
            '.privacy-header',
            '.privacy-section',
        ].join(',');
        const observer = new IntersectionObserver(entries => entries.forEach(e => {
            if (!e.isIntersecting)
                return;
            if (e.target.classList.contains('sr')) {
                e.target.classList.add('sr-in');
            }
            else {
                e.target.classList.add('line-in');
            }
            observer.unobserve(e.target);
        }), { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
        const t = setTimeout(() => {
            document.querySelectorAll(SELECTORS).forEach(el => {
                const rect = el.getBoundingClientRect();
                const inView = rect.top < window.innerHeight && rect.bottom > 0;
                if (inView)
                    return;
                el.classList.add('sr');
                const siblings = el.parentElement
                    ? [...el.parentElement.children].filter(c => c.classList.contains('sr'))
                    : [];
                const idx = siblings.indexOf(el);
                if (idx > 0)
                    el.classList.add(`sr-d${Math.min(idx, 3)}`);
                observer.observe(el);
            });
            document.querySelectorAll('section.block').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    el.classList.add('line-in');
                }
                else {
                    observer.observe(el);
                }
            });
        }, 60);
        return () => { clearTimeout(t); observer.disconnect(); };
    }, [route]);
}
function useTheme() {
    const [theme, setTheme] = useState(() => localStorage.getItem("saegyeol-theme-v3") || "light");
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("saegyeol-theme-v3", theme);
    }, [theme]);
    return [theme, setTheme];
}
function Brand({ onClick, showSub }) {
    return (React.createElement("a", { className: "brand", href: "#", onClick: (e) => { e.preventDefault(); onClick && onClick(); } },
        React.createElement("img", { src: "logo.png", alt: "Saegyeol", className: "brand-logo" }),
        showSub && React.createElement("span", { className: "brand-sub" }, "\uC0C8\uACB0")));
}
const Icon = {
    shadow: () => (React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("circle", { cx: "9", cy: "9", r: "4" }),
        React.createElement("circle", { cx: "15", cy: "15", r: "4", strokeDasharray: "2 2" }),
        React.createElement("path", { d: "M3 21c0-3 3-5 6-5" }))),
    pii: () => (React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }),
        React.createElement("circle", { cx: "9", cy: "11", r: "2" }),
        React.createElement("path", { d: "M5 16c1-1.5 3-2 4-2s3 .5 4 2" }),
        React.createElement("path", { d: "M15 9h4M15 13h3" }))),
    report: () => (React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("rect", { x: "5", y: "3", width: "14", height: "18", rx: "2" }),
        React.createElement("path", { d: "M9 8h6M9 12h6M9 16h3" }),
        React.createElement("path", { d: "M16.5 17l2 2 3-3.5", stroke: "var(--accent-ink, currentColor)" }))),
    inject: () => (React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("path", { d: "M4 12h10" }),
        React.createElement("path", { d: "M14 8l4 4-4 4" }),
        React.createElement("circle", { cx: "20", cy: "12", r: "1.2", fill: "currentColor" }))),
    shield: () => (React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("path", { d: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z" }),
        React.createElement("path", { d: "M9 12l2 2 4-4" }))),
    graph: () => (React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("path", { d: "M4 18V8M10 18V4M16 18v-7M22 18H2" }))),
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
    const go = (id, hash) => {
        setOpen(null);
        if (id === "contact") {
            setRoute("home");
            setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 60);
        }
        else {
            setRoute(id);
            window.scrollTo({ top: 0, behavior: "instant" });
            if (hash)
                setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 60);
        }
    };
    return (React.createElement("nav", { className: "nav" },
        React.createElement("div", { className: "container nav-inner" },
            React.createElement(Brand, { onClick: () => go("home"), showSub: true }),
            React.createElement("div", { className: "nav-links" },
                React.createElement("div", { className: "nav-item" + (open === "products" ? " open" : ""), onMouseEnter: () => enter("products"), onMouseLeave: leave },
                    React.createElement("button", { className: "nav-link" + (["product", "pricing", "feature-shadow", "feature-pii", "feature-report"].includes(route) ? " active" : ""), onClick: () => go("product") },
                        "\uC81C\uD488 ",
                        React.createElement("span", { className: "chev" }, "\u25BE")),
                    React.createElement("div", { className: "mega", role: "menu" },
                        React.createElement("div", { className: "mega-col" },
                            React.createElement("h5", null, "\uC81C\uD488"),
                            React.createElement("a", { className: "mega-item", role: "menuitem", tabIndex: 0, onClick: () => go("product"), onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ")
                                    go("product"); } },
                                React.createElement("div", { className: "t", style: { display: "flex", alignItems: "center", gap: 8 } }, "\uC5EC\uC6B8"),
                                React.createElement("div", { className: "d" }, "\uD55C\uAD6D\uC5B4 AI \uC5D0\uC774\uC804\uD2B8 \uC790\uB3D9 \uCE68\uD22C \uD14C\uC2A4\uD2B8 \uC11C\uBE44\uC2A4")),
                            React.createElement("a", { className: "mega-item", role: "menuitem", tabIndex: 0, onClick: () => go("pricing"), onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ")
                                    go("pricing"); } },
                                React.createElement("div", { className: "t" }, "\uC5EC\uC6B8 \uC694\uAE08 \uC548\uB0B4"),
                                React.createElement("div", { className: "d" }, "\uBB34\uB8CC \u00B7 \uD504\uB85C \u00B7 \uD504\uB79C\uCC28\uC774\uC988 \uD50C\uB79C \uBE44\uAD50"))),
                        React.createElement("div", { className: "mega-col" },
                            React.createElement("h5", null, "\uC5EC\uC6B8 \uAE30\uB2A5"),
                            React.createElement("a", { className: "mega-item", role: "menuitem", tabIndex: 0, onClick: () => go("feature-shadow"), onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ")
                                    go("feature-shadow"); } },
                                React.createElement("div", { className: "t" }, "Shadow Agent \uD0D0\uC9C0"),
                                React.createElement("div", { className: "d" }, "\uC0AC\uAC01\uC9C0\uB300\uC758 \uAC1C\uC778 AI \uC5D0\uC774\uC804\uD2B8 \uBC1C\uACAC")),
                            React.createElement("a", { className: "mega-item", role: "menuitem", tabIndex: 0, onClick: () => go("feature-pii"), onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ")
                                    go("feature-pii"); } },
                                React.createElement("div", { className: "t" }, "K-PII \uCC28\uB2E8"),
                                React.createElement("div", { className: "d" }, "\uD55C\uAD6D\uC2DD \uAC1C\uC778\uC815\uBCF4 14\uC885 \uC804\uC6A9 \uD0D0\uC9C0")),
                            React.createElement("a", { className: "mega-item", role: "menuitem", tabIndex: 0, onClick: () => go("feature-report"), onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ")
                                    go("feature-report"); } },
                                React.createElement("div", { className: "t" }, "\uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4 \uB9AC\uD3EC\uD2B8"),
                                React.createElement("div", { className: "d" }, "ISMS-P \u00B7 \uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uBC95 \uC790\uB3D9 \uB9E4\uD551"))),
                        React.createElement("div", { className: "mega-col" },
                            React.createElement("h5", null, "RESOURCES"),
                            React.createElement("a", { className: "mega-item", role: "menuitem", tabIndex: 0, onClick: () => go("contact"), onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ")
                                    go("contact"); } },
                                React.createElement("div", { className: "t" }, "\uB3C4\uC785 \uC0C1\uB2F4"),
                                React.createElement("div", { className: "d" }, "\uC11C\uBE44\uC2A4 \uC801\uC6A9 \uBC94\uC704\uC640 \uB3C4\uC785 \uC808\uCC28\uB97C \uC548\uB0B4\uD569\uB2C8\uB2E4")),
                            React.createElement("a", { className: "mega-item", role: "menuitem", tabIndex: 0, onClick: () => go("team"), onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ")
                                    go("team"); } },
                                React.createElement("div", { className: "t" }, "\uD300 \uB9CC\uB098\uAE30"),
                                React.createElement("div", { className: "d" }, "\uC0C8\uACB0\uC744 \uB9CC\uB4DC\uB294 \uC0AC\uB78C\uB4E4"))))),
                React.createElement("button", { className: "nav-link" + (route === "pricing" ? " active" : ""), onClick: () => go("pricing") }, "\uC694\uAE08\uC81C"),
                React.createElement("button", { className: "nav-link" + (route === "team" ? " active" : ""), onClick: () => go("team") }, "\uD300 \uC18C\uAC1C"),
                React.createElement("button", { className: "nav-link", onClick: () => go("contact") }, "\uBB38\uC758"),
                React.createElement("button", { className: "theme-toggle", "aria-label": "\uBAA8\uB4DC \uBCC0\uACBD", onClick: () => setTheme(theme === "light" ? "dark" : "light") }, theme === "light" ? (React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8" },
                    React.createElement("path", { d: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z", strokeLinejoin: "round" }))) : (React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8" },
                    React.createElement("circle", { cx: "12", cy: "12", r: "4" }),
                    React.createElement("path", { strokeLinecap: "round", d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" }))))))));
}
function ClosingCTA({ onContact }) {
    return (React.createElement("section", { className: "closing-cta" },
        React.createElement("div", { className: "closing-cta-inner" },
            React.createElement("span", { className: "label" }, "JOIN US"),
            React.createElement("h2", null,
                "\uC9C0\uAE08 \uC0C8\uACB0\uACFC",
                React.createElement("br", null),
                "\uD568\uAED8\uD558\uC138\uC694."),
            React.createElement("p", null, "AI \uC5D0\uC774\uC804\uD2B8 \uB3C4\uC785\uC740 \uB354 \uC774\uC0C1 \uBBF8\uB798\uC758 \uC774\uC57C\uAE30\uAC00 \uC544\uB2D9\uB2C8\uB2E4. \uC0C8\uACB0\uACFC \uD568\uAED8 \uD55C\uAD6D\uC5B4 \uC704\uD611 \uAD00\uC810\uC5D0\uC11C \uC810\uAC80\uD558\uACE0, \uC548\uC804\uD558\uAC8C \uCD9C\uC2DC\uD558\uC138\uC694."),
            React.createElement("div", { className: "hero-cta" },
                React.createElement("button", { className: "btn btn-accent", onClick: onContact },
                    "\uBB38\uC758\uD558\uAE30 ",
                    React.createElement("span", { className: "arrow" }, "\u2192")),
                React.createElement("button", { className: "btn btn-ghost on-dark", onClick: onContact },
                    "\uBCF4\uC548 \uAC80\uC99D \uC0C1\uB2F4 ",
                    React.createElement("span", { className: "arrow" }, "\u2192"))))));
}
function Footer({ setRoute }) {
    const go = (id, hash) => {
        if (id === "contact") {
            setRoute("home");
            setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 60);
        }
        else {
            setRoute(id);
            window.scrollTo({ top: 0 });
            if (hash)
                setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 60);
        }
    };
    return (React.createElement("footer", { className: "site-footer" },
        React.createElement("div", { className: "container" },
            React.createElement("div", { className: "footer-grid" },
                React.createElement("div", { className: "footer-left" },
                    React.createElement(Brand, { onClick: () => go("home") }),
                    React.createElement("div", { className: "footer-legal" },
                        React.createElement("div", { className: "row" },
                            React.createElement("span", { className: "k" }, "\uD68C\uC0AC\uBA85"),
                            React.createElement("span", null, "\uC0C8\uACB0 (Saegyeol)")),
                        React.createElement("div", { className: "row" },
                            React.createElement("span", { className: "k" }, "\uB300\uD45C\uC790"),
                            React.createElement("span", null, "\uD669\uC9C0\uD6C4")),
                        React.createElement("div", { className: "row" },
                            React.createElement("span", { className: "k" }, "\uC0AC\uC5C5\uC790\uBC88\uD638"),
                            React.createElement("span", null, "101-30-53151")),
                        React.createElement("div", { className: "row" },
                            React.createElement("span", { className: "k" }, "\uC8FC\uC18C"),
                            React.createElement("span", null, "\uBD80\uC0B0\uAD11\uC5ED\uC2DC \uD574\uC6B4\uB300\uAD6C \uC88C\uB3D9\uC21C\uD658\uB85C8\uBC88\uAE38 78, 103\uB3D9 801\uD638(\uC911\uB3D9, \uD574\uC6B4\uB300\uBA54\uD2B8\uB85C\uD558\uC774\uCE20)")),
                        React.createElement("div", { className: "row" },
                            React.createElement("span", { className: "k" }, "\uC774\uBA54\uC77C"),
                            React.createElement("span", null, "contact@saegyeol.ai.kr")))),
                React.createElement("div", { className: "footer-right" },
                    React.createElement("div", null,
                        React.createElement("h5", null, "PRODUCT"),
                        React.createElement("ul", null,
                            React.createElement("li", { onClick: () => go("product") }, "\uC5EC\uC6B8"),
                            React.createElement("li", { onClick: () => go("pricing") }, "\uC694\uAE08\uC81C"))),
                    React.createElement("div", null,
                        React.createElement("h5", null, "COMPANY"),
                        React.createElement("ul", null,
                            React.createElement("li", { onClick: () => go("team") }, "\uD300 \uC18C\uAC1C"),
                            React.createElement("li", { onClick: () => go("team", "recruit") }, "\uCC44\uC6A9"),
                            React.createElement("li", { onClick: () => go("contact") }, "\uBB38\uC758"))),
                    React.createElement("div", null,
                        React.createElement("h5", null, "FOLLOW"),
                        React.createElement("ul", null,
                            React.createElement("li", null,
                                React.createElement("a", { href: "https://www.instagram.com/saegyeol_official", target: "_blank", rel: "noreferrer", style: { color: "inherit", textDecoration: "none" } }, "Instagram")),
                            React.createElement("li", null,
                                React.createElement("a", { href: "mailto:contact@saegyeol.ai.kr", style: { color: "inherit", textDecoration: "none" } }, "Email")))))),
            React.createElement("div", { className: "footer-bottom" },
                React.createElement("span", null, "\u00A9 2026 Saegyeol. All rights reserved."),
                React.createElement("span", null,
                    React.createElement("a", { href: "#", style: { marginRight: 24 }, onClick: (e) => { e.preventDefault(); go("privacy"); } }, "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68"),
                    React.createElement("a", { href: "#", onClick: (e) => { e.preventDefault(); go("terms"); } }, "\uC774\uC6A9\uC57D\uAD00"))))));
}
const SUBMIT_COOLDOWN_MS = 60000;
const lastSubmitKey = "saegyeol-last-submit";
function ContactForm() {
    const [data, setData] = useState({ name: "", email: "", message: "" });
    const [file, setFile] = useState(null);
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [touched, setTouched] = useState(false);
    const fileRef = useRef(null);
    const selectFile = (nextFile) => {
        if (!nextFile)
            return;
        if (nextFile.size > MAX_UPLOAD_BYTES) {
            alert(`파일 크기는 ${MAX_UPLOAD_LABEL}를 초과할 수 없습니다.`);
            if (fileRef.current)
                fileRef.current.value = "";
            return;
        }
        setFile(nextFile);
    };
    const valid = data.name.trim() && /\S+@\S+\.\S+/.test(data.email) && data.message.trim().length > 3;
    const submit = async (e) => {
        e.preventDefault();
        setTouched(true);
        if (!valid)
            return;
        const lastSubmit = parseInt(localStorage.getItem(lastSubmitKey) || "0", 10);
        if (Date.now() - lastSubmit < SUBMIT_COOLDOWN_MS) {
            setError("잠시 후 다시 시도해 주세요. (1분 쿨다운)");
            return;
        }
        setSending(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("email", data.email);
            formData.append("message", data.message);
            if (file)
                formData.append("file", file);
            const res = await fetch("/api/contact", { method: "POST", body: formData });
            const json = await res.json();
            if (!res.ok)
                throw new Error(json.error || "전송 실패");
            localStorage.setItem(lastSubmitKey, String(Date.now()));
            setSent(true);
            setTimeout(() => { setSent(false); setData({ name: "", email: "", message: "" }); setFile(null); setTouched(false); }, 5000);
        }
        catch (err) {
            setError(err.message || "전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
        finally {
            setSending(false);
        }
    };
    return (React.createElement("form", { className: "form", onSubmit: submit, noValidate: true },
        sent && React.createElement("div", { className: "form-success" }, "\uBB38\uC758\uAC00 \uC804\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC601\uC5C5\uC77C \uAE30\uC900 1\uC77C \uB0B4 \uD68C\uC2E0\uB4DC\uB9BD\uB2C8\uB2E4."),
        error && React.createElement("div", { className: "form-error" }, error),
        React.createElement("div", { className: "row" },
            React.createElement("label", { htmlFor: "cfv2-name" }, "\uC774\uB984 / NAME"),
            React.createElement("input", { id: "cfv2-name", type: "text", placeholder: "\uD64D\uAE38\uB3D9", value: data.name, onChange: (e) => setData({ ...data, name: e.target.value }) })),
        React.createElement("div", { className: "row" },
            React.createElement("label", { htmlFor: "cfv2-email" }, "\uC774\uBA54\uC77C / EMAIL"),
            React.createElement("input", { id: "cfv2-email", type: "email", placeholder: "you@company.kr", value: data.email, onChange: (e) => setData({ ...data, email: e.target.value }) })),
        React.createElement("div", { className: "row" },
            React.createElement("label", { htmlFor: "cfv2-msg" }, "\uBB38\uC758 \uB0B4\uC6A9 / MESSAGE"),
            React.createElement("textarea", { id: "cfv2-msg", placeholder: "\uC790\uC138\uD55C \uBB38\uC758 \uB0B4\uC6A9\uC744 \uC801\uC5B4\uC8FC\uC138\uC694.", value: data.message, onChange: (e) => setData({ ...data, message: e.target.value }) })),
        React.createElement("div", { className: "row" },
            React.createElement("label", null,
                "\uCCA8\uBD80\uD30C\uC77C / ATTACHMENT ",
                React.createElement("span", { style: { fontWeight: 400, opacity: 0.5 } }, "(\uC120\uD0DD)")),
            React.createElement("input", { ref: fileRef, type: "file", accept: ".pdf,.ppt,.pptx,.doc,.docx,.zip,.png,.jpg,.jpeg", style: { display: "none" }, onChange: (e) => selectFile(e.target.files?.[0] || null) }),
            React.createElement("div", { className: "file-drop", role: "button", tabIndex: 0, onClick: () => fileRef.current?.click(), onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ")
                    fileRef.current?.click(); }, onDragOver: (e) => e.preventDefault(), onDrop: (e) => { e.preventDefault(); selectFile(e.dataTransfer.files?.[0] || null); } },
                React.createElement("div", { className: "icon" }, file ? "✓" : "↑"),
                React.createElement("div", { className: "meta" },
                    React.createElement("div", { className: "name" }, file ? file.name : "파일을 선택하거나 여기로 끌어다 놓으세요"),
                    React.createElement("div", { className: "sub" }, file ? `${(file.size / 1024).toFixed(1)} KB` : `PDF · PPT · DOC · ZIP · 이미지 등 (최대 ${MAX_UPLOAD_LABEL})`))),
            React.createElement("p", { style: { margin: "8px 0 0", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 } },
                MAX_UPLOAD_LABEL,
                "\uB97C \uCD08\uACFC\uD558\uB294 \uD30C\uC77C\uC740 ",
                React.createElement("span", { className: "mono", style: { fontSize: 12 } }, "contact@saegyeol.ai.kr"),
                "\uB85C \uC9C1\uC811 \uBCF4\uB0B4\uC8FC\uC138\uC694.")),
        React.createElement("div", { className: "actions" },
            React.createElement("span", { className: "hint" }, "\u2192 contact@saegyeol.ai.kr \uB85C \uC804\uC1A1\uB429\uB2C8\uB2E4"),
            React.createElement("button", { type: "submit", className: "btn btn-accent", disabled: (touched && !valid) || sending }, sending ? "전송 중…" : React.createElement(React.Fragment, null,
                "\uBB38\uC758 \uBCF4\uB0B4\uAE30 ",
                React.createElement("span", { className: "arrow" }, "\u2192"))))));
}
Object.assign(window, { useTheme, useFullScroll, useReveal, Nav, Footer, Brand, ContactForm, ClosingCTA, Icon });
function HomePage({ setRoute }) {
    const goContact = () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
    const openRoute = (route) => { setRoute(route); window.scrollTo({ top: 0, behavior: "auto" }); };
    const cardKey = (event, route) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openRoute(route);
        }
    };
    return (React.createElement("div", { "data-screen-label": "01 Home" },
        React.createElement("section", { className: "hero" },
            React.createElement("div", { className: "hero-bg" }),
            React.createElement("div", { className: "hero-glow" }),
            React.createElement("div", { className: "hero-inner" },
                React.createElement("span", { className: "hero-tag" },
                    React.createElement("span", { className: "blink" }),
                    "KOREAN AI AGENT SECURITY \u00B7 SINCE 2026"),
                React.createElement("h1", null,
                    "Securing the Future",
                    React.createElement("br", null),
                    "of ",
                    React.createElement("span", { className: "accent-w" }, "Korean AI Agents.")),
                React.createElement("p", { className: "hero-sub" },
                    "\uD55C\uAD6D\uC5B4 AI \uC5D0\uC774\uC804\uD2B8, \uD55C\uAD6D\uD615 \uC704\uD611 \uAD00\uC810\uC73C\uB85C \uBA3C\uC800 \uC810\uAC80\uD569\uB2C8\uB2E4.",
                    React.createElement("br", null),
                    "\uC0C8\uACB0\uC740 LLM\u00B7MCP\u00B7\uC0AC\uC6A9\uC790 \uD50C\uB85C\uC6B0 \uC804\uCCB4\uB97C \uC790\uB3D9\uC73C\uB85C \uACF5\uACA9\uD574 \uC775\uC2A4\uD50C\uB85C\uC787 PoC\uC640 \uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4 \uB9AC\uD3EC\uD2B8\uB97C \uC0B0\uCD9C\uD569\uB2C8\uB2E4.",
                    React.createElement("br", null)),
                React.createElement("div", { className: "hero-cta" },
                    React.createElement("button", { className: "btn btn-accent", onClick: () => { setRoute("product"); window.scrollTo({ top: 0 }); } },
                        "\uC11C\uBE44\uC2A4 \uC54C\uC544\uBCF4\uAE30 ",
                        React.createElement("span", { className: "arrow" }, "\u2192")),
                    React.createElement("button", { className: "btn btn-ghost", onClick: () => { setRoute("team"); window.scrollTo({ top: 0 }); } },
                        "\uD300 \uC18C\uAC1C \uBCF4\uAE30 ",
                        React.createElement("span", { className: "arrow" }, "\u2192"))),
                React.createElement("div", { className: "hero-scrollhint" },
                    React.createElement("span", null, "SCROLL"),
                    React.createElement("span", { className: "bar" })))),
        React.createElement("section", { className: "block", id: "what-we-do" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "WHAT WE DO"),
                    React.createElement("h2", null,
                        "\uD55C\uAD6D \uD658\uACBD\uC5D0\uC11C\uB9CC \uBCF4\uC774\uB294",
                        React.createElement("br", null),
                        "\uC704\uD611\uC744 \uC815\uBA74\uC73C\uB85C \uB2E4\uB8F9\uB2C8\uB2E4."),
                    React.createElement("p", null, "\uAD6D\uC81C LLM \uBCF4\uC548 \uB3C4\uAD6C\uB294 \uD55C\uAD6D\uC5B4 \uC778\uC81D\uC158, \uD55C\uAD6D\uC2DD PII, \uAD6D\uB0B4 \uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4\uB97C \uB2E4\uB8E8\uC9C0 \uBABB\uD569\uB2C8\uB2E4. \uC5EC\uC6B8\uC740 \uD55C\uAD6D\uC5B4 \uC704\uD611 \uBAA8\uB378\uC5D0 \uD2B9\uD654\uB41C \uC790\uB3D9 \uCE68\uD22C \uD14C\uC2A4\uD2B8\uC640 \uB9AC\uD3EC\uD2B8\uB97C \uC81C\uACF5\uD569\uB2C8\uB2E4.")),
                React.createElement("div", { className: "cards" },
                    React.createElement("article", { className: "card card-link", role: "link", tabIndex: 0, onClick: () => openRoute("feature-shadow"), onKeyDown: (e) => cardKey(e, "feature-shadow") },
                        React.createElement("span", { className: "num" }, "01"),
                        React.createElement("div", { className: "ico" },
                            React.createElement(Icon.shadow, null)),
                        React.createElement("h3", null, "Shadow Agent \uD0D0\uC9C0"),
                        React.createElement("p", null, "\uC784\uC9C1\uC6D0\uC774 \uC0AC\uB0B4 \uB370\uC774\uD130\uB85C \uB9CC\uB4E0 \uAC1C\uC778 AI \uC5D0\uC774\uC804\uD2B8\uAC00 \uB9CC\uB4DC\uB294 \uBCF4\uC548 \uC0AC\uAC01\uC9C0\uB300\uB97C \uC790\uB3D9\uC73C\uB85C \uBC1C\uACAC\uD558\uACE0 \uC704\uD5D8\uB3C4\uB97C \uD3C9\uAC00\uD569\uB2C8\uB2E4."),
                        React.createElement("span", { className: "more" }, "\uC790\uC138\uD788 \uBCF4\uAE30")),
                    React.createElement("article", { className: "card card-link", role: "link", tabIndex: 0, onClick: () => openRoute("feature-pii"), onKeyDown: (e) => cardKey(e, "feature-pii") },
                        React.createElement("span", { className: "num" }, "02"),
                        React.createElement("div", { className: "ico" },
                            React.createElement(Icon.pii, null)),
                        React.createElement("h3", null, "K-PII \uCC28\uB2E8"),
                        React.createElement("p", null, "\uC8FC\uBBFC\uBC88\uD638\u00B7\uC0AC\uC5C5\uC790\uBC88\uD638\u00B7\uD55C\uAD6D\uC2DD \uC8FC\uC18C\u00B7\uACC4\uC88C\u00B7\uC6B4\uC804\uBA74\uD5C8 \uB4F1 \uD55C\uAD6D\uC2DD PII 14\uC885\uC744 \uC804\uC6A9 \uD0D0\uC9C0\uAE30\uB85C \uC2DD\uBCC4\uD558\uACE0 \uCC28\uB2E8\uD569\uB2C8\uB2E4."),
                        React.createElement("span", { className: "more" }, "\uC790\uC138\uD788 \uBCF4\uAE30")),
                    React.createElement("article", { className: "card card-link", role: "link", tabIndex: 0, onClick: () => openRoute("feature-report"), onKeyDown: (e) => cardKey(e, "feature-report") },
                        React.createElement("span", { className: "num" }, "03"),
                        React.createElement("div", { className: "ico" },
                            React.createElement(Icon.report, null)),
                        React.createElement("h3", null, "\uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4 \uB9AC\uD3EC\uD2B8"),
                        React.createElement("p", null, "ISMS-P \u00B7 \uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uBC95 \u00B7 \uAE08\uC735 AI \uAC00\uC774\uB4DC\uB77C\uC778 \uB4F1 \uD55C\uAD6D\uD615 \uAE30\uC900\uC5D0 \uC790\uB3D9 \uB9E4\uD551\uB41C \uB9AC\uD3EC\uD2B8\uB97C PDF\u00B7\uC6F9\uC73C\uB85C \uC0DD\uC131\uD569\uB2C8\uB2E4."),
                        React.createElement("span", { className: "more" }, "\uC790\uC138\uD788 \uBCF4\uAE30"))),
                React.createElement("div", { className: "stats", style: { marginTop: 64 } },
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "2,400",
                            React.createElement("span", { className: "unit" }, "+")),
                        React.createElement("div", { className: "k" }, "\uD55C\uAD6D\uC5B4 \uACF5\uACA9 \uD398\uC774\uB85C\uB4DC")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "36",
                            React.createElement("span", { className: "unit" }, "\uBD84")),
                        React.createElement("div", { className: "k" }, "\uD3C9\uADE0 \uC810\uAC80 \uC2DC\uAC04")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "14",
                            React.createElement("span", { className: "unit" }, "\uC885")),
                        React.createElement("div", { className: "k" }, "\uD55C\uAD6D\uC2DD PII \uCE74\uD14C\uACE0\uB9AC")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "8",
                            React.createElement("span", { className: "unit" }, "\uAC1C")),
                        React.createElement("div", { className: "k" }, "\uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4 \uB9E4\uD551 \uAE30\uC900"))))),
        React.createElement("section", { className: "block", style: { paddingTop: 0, borderTop: "none" } },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "banner", role: "button", tabIndex: 0, onClick: () => { setRoute("team"); window.scrollTo({ top: 0 }); }, onKeyDown: (e) => { if (e.key === "Enter") {
                        setRoute("team");
                        window.scrollTo({ top: 0 });
                    } } },
                    React.createElement("div", null,
                        React.createElement("span", { className: "section-label" }, "TEAM \u00B7 \uC0C8\uACB0\uC744 \uB9CC\uB4DC\uB294 \uC0AC\uB78C\uB4E4"),
                        React.createElement("h3", null,
                            "\uD55C\uAD6D AI \uBCF4\uC548\uC744 \uAC00\uC7A5 \uAC00\uAE4C\uC774\uC11C",
                            React.createElement("br", null),
                            "\uB2E4\uB904\uC628 \uC0AC\uB78C\uB4E4."),
                        React.createElement("p", null, "\uC624\uD39C\uC2DC\uBE0C \uC2DC\uD050\uB9AC\uD2F0, LLM \uD3C9\uAC00, \uD55C\uAD6D\uD615 \uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4 \u2014 \uC138 \uC601\uC5ED\uC5D0\uC11C \uC804\uBB38\uC131\uC744 \uC313\uC740 \uD300\uC774 \uC0C8\uACB0\uC758 \uAE30\uC220\uC744 \uB9CC\uB4E4\uACE0 \uC788\uC2B5\uB2C8\uB2E4."),
                        React.createElement("div", { className: "av-stack" },
                            React.createElement("span", { className: "av" }, "JH"),
                            React.createElement("span", { className: "av" }, "YK"),
                            React.createElement("span", { className: "av" }, "YS"))),
                    React.createElement("button", { className: "btn btn-accent", onClick: (e) => { e.stopPropagation(); setRoute("team"); window.scrollTo({ top: 0 }); } },
                        "\uBC14\uB85C\uAC00\uAE30 ",
                        React.createElement("span", { className: "arrow" }, "\u2192"))))),
        React.createElement("section", { className: "block", id: "contact" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "contact-grid" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "section-label" }, "CONTACT \u00B7 INLINE"),
                        React.createElement("h2", { style: {
                                margin: "16px 0 18px",
                                fontSize: "clamp(32px, 4vw, 52px)",
                                lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700
                            } },
                            "\uC0C8\uACB0 \uD300\uC5D0",
                            React.createElement("br", null),
                            "\uC9C1\uC811 \uBB38\uC758\uD574 \uC8FC\uC138\uC694."),
                        React.createElement("p", { style: { margin: 0, color: "var(--text-2)", fontSize: 17, lineHeight: 1.7, maxWidth: 480 } }, "AI \uC5D0\uC774\uC804\uD2B8 \uBCF4\uC548 \uB3C4\uC785\uC744 \uAC80\uD1A0 \uC911\uC774\uC2DC\uAC70\uB098 \uC5EC\uC6B8\uC758 \uBCF4\uC548 \uAC80\uC99D\uC774 \uD544\uC694\uD558\uB2E4\uBA74 \uC544\uB798 \uC591\uC2DD\uC73C\uB85C \uC9C1\uC811 \uBB38\uC758\uD574 \uC8FC\uC138\uC694. \uC601\uC5C5\uC77C \uAE30\uC900 1\uC77C \uB0B4 \uD68C\uC2E0\uB4DC\uB9BD\uB2C8\uB2E4."),
                        React.createElement("div", { className: "contact-meta" },
                            React.createElement("div", { className: "row" },
                                React.createElement("span", { className: "k" }, "EMAIL"),
                                React.createElement("span", { className: "mono" }, "contact@saegyeol.ai.kr")),
                            React.createElement("div", { className: "row" },
                                React.createElement("span", { className: "k" }, "RESPONSE"),
                                React.createElement("span", { className: "mono" }, "24\uC2DC\uAC04 \uC774\uB0B4 (\uC5F0\uC911\uBB34\uD734)")),
                            React.createElement("div", { className: "row" },
                                React.createElement("span", { className: "k" }, "FOR"),
                                React.createElement("span", null, "\uB3C4\uC785 \uBB38\uC758 \u00B7 \uBCF4\uC548 \uAC80\uC99D \u00B7 \uBCF4\uC548 \uC790\uBB38 \u00B7 \uCC44\uC6A9 \uBB38\uC758")),
                            React.createElement("div", { className: "row" },
                                React.createElement("span", { className: "k" }, "NDA"),
                                React.createElement("span", null, "\uC694\uCCAD \uC2DC \uCCB4\uACB0 \uAC00\uB2A5")))),
                    React.createElement(ContactForm, null)))),
        React.createElement(ClosingCTA, { onContact: goContact })));
}
window.HomePage = HomePage;
const TEAM_MEMBERS_V2 = [
    { initials: "JH", name: "황지후", role: "CEO / Founder", bio: "소프트웨어로 세상을 바꾸는, 더 나은 세상을 꿈꾸다.", link: "https://www.notion.so/saegyeol/Hwang-Jihoo-31cb75833d178043a85ec6c11a1b2af8?source=copy_link" },
    { initials: "YJ", name: "김윤지", role: "CISO", bio: " 그 누구보다 반짝일 미래를 믿습니다. 더 나은 세상을 위하여.", link: "https://www.notion.so/YUNJI-S-PORTFOLIO-369bed12f7ec804385c6c6e4608ea371?source=copy_link" },
    { initials: "YS", name: "신유승", role: "Full-Stack Engineer", bio: "세상의 문제를 코드로 풀고, 소프트웨어로 답을 찾다.", link: null },
];
function TeamPage({ setRoute }) {
    const [file, setFile] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef(null);
    const selectFile = (nextFile) => {
        if (!nextFile)
            return;
        if (nextFile.size > MAX_UPLOAD_BYTES) {
            alert(`파일 크기는 ${MAX_UPLOAD_LABEL}를 초과할 수 없습니다.`);
            if (fileRef.current)
                fileRef.current.value = "";
            return;
        }
        setFile(nextFile);
    };
    const submit = async (e) => {
        e.preventDefault();
        if (!name || !email || !file)
            return;
        setSending(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);
            formData.append("file", file);
            const res = await fetch("/api/recruit", { method: "POST", body: formData });
            const json = await res.json();
            if (!res.ok)
                throw new Error(json.error || "전송 실패");
            setSent(true);
            setTimeout(() => { setSent(false); setFile(null); setName(""); setEmail(""); }, 4000);
        }
        catch (err) {
            setError(err.message || "전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
        finally {
            setSending(false);
        }
    };
    const goContact = () => {
        setRoute("home");
        setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 60);
    };
    return (React.createElement("div", { "data-screen-label": "02 Team" },
        React.createElement("section", { className: "page-hero" },
            React.createElement("div", { className: "hero-bg" }),
            React.createElement("div", { className: "container", style: { position: "relative" } },
                React.createElement("span", { className: "section-label" }, "TEAM \u00B7 \uC0C8\uACB0\uC744 \uB9CC\uB4DC\uB294 \uC0AC\uB78C\uB4E4"),
                React.createElement("h1", null,
                    "AI \uBCF4\uC548\uC744",
                    React.createElement("br", null),
                    "\uBBFF\uACE0 \uB9E1\uAE38 \uC218 \uC788\uB294 \uD300"),
                React.createElement("p", null, "\uC624\uD39C\uC2DC\uBE0C \uC2DC\uD050\uB9AC\uD2F0 \u00B7 LLM \uC5F0\uAD6C \u00B7 \uD55C\uAD6D\uD615 \uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4 \u2014 \uC0C8\uACB0\uC758 \uD300\uC740 \uD55C\uAD6D AI \uC5D0\uC774\uC804\uD2B8 \uD658\uACBD\uC744 \uAE4A\uC774 \uC5F0\uAD6C\uD574 \uC628 \uC0AC\uB78C\uB4E4\uB85C \uAD6C\uC131\uB429\uB2C8\uB2E4."))),
        React.createElement("section", { className: "block" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "team-grid" }, TEAM_MEMBERS_V2.map((m) => {
                    const content = (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "photo" }, m.initials),
                        React.createElement("div", { className: "role" }, m.role),
                        React.createElement("h3", null, m.name),
                        React.createElement("p", { className: "bio" }, m.bio),
                        m.link && React.createElement("div", { className: "visit" }, "VIEW PORTFOLIO")));
                    return m.link ? (React.createElement("a", { key: m.initials, className: "member", href: m.link, target: "_blank", rel: "noreferrer" }, content)) : (React.createElement("article", { key: m.initials, className: "member" }, content));
                })))),
        React.createElement("section", { className: "block", id: "recruit" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "recruit" },
                    React.createElement("div", { style: { position: "relative", zIndex: 1 } },
                        React.createElement("span", { className: "section-label" }, "JOIN US \u00B7 \uCC44\uC6A9"),
                        React.createElement("h2", null,
                            "\uD568\uAED8\uD560 \uC0AC\uB78C\uC744",
                            React.createElement("br", null),
                            "\uCC3E\uC2B5\uB2C8\uB2E4."),
                        React.createElement("p", null, "\uC774\uB825\uC11C, \uD504\uB85C\uC81D\uD2B8, \uAE00, \uBC1C\uD45C \uC601\uC0C1 \u2014 \uD615\uC2DD\uC740 \uC790\uC720\uC785\uB2C8\uB2E4. \uC0C8\uACB0\uC774 \uD480\uACE0 \uC788\uB294 \uBB38\uC81C\uC5D0 \uD765\uBBF8\uAC00 \uC788\uB2E4\uBA74 \uAC00\uBCCD\uAC8C\uB77C\uB3C4 \uBCF4\uB0B4\uC8FC\uC138\uC694. \uC790\uC720 \uD615\uC2DD\uC758 \uD3EC\uD2B8\uD3F4\uB9AC\uC624\uB97C contact@saegyeol.ai.kr \uB85C \uC804\uB2EC\uD569\uB2C8\uB2E4."),
                        React.createElement("div", { className: "tags" },
                            React.createElement("span", { className: "tag" }, "Offensive Eng."),
                            React.createElement("span", { className: "tag" }, "LLM Researcher"),
                            React.createElement("span", { className: "tag" }, "Compliance"),
                            React.createElement("span", { className: "tag" }, "Product Design"),
                            React.createElement("span", { className: "tag" }, "Open Application"))),
                    React.createElement("form", { className: "form", onSubmit: submit, style: { position: "relative", zIndex: 1 } },
                        sent && React.createElement("div", { className: "form-success" }, "\uC9C0\uC6D0\uC11C\uAC00 \uC804\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4."),
                        error && React.createElement("div", { className: "form-error" }, error),
                        React.createElement("div", { className: "row" },
                            React.createElement("label", null, "\uC774\uB984 / NAME"),
                            React.createElement("input", { type: "text", placeholder: "\uD64D\uAE38\uB3D9", value: name, onChange: (e) => setName(e.target.value) })),
                        React.createElement("div", { className: "row" },
                            React.createElement("label", null, "\uC774\uBA54\uC77C / EMAIL"),
                            React.createElement("input", { type: "email", placeholder: "you@mail.kr", value: email, onChange: (e) => setEmail(e.target.value) })),
                        React.createElement("div", { className: "row" },
                            React.createElement("label", null, "\uD3EC\uD2B8\uD3F4\uB9AC\uC624 / FREE FORMAT"),
                            React.createElement("input", { ref: fileRef, type: "file", accept: ".pdf,.ppt,.pptx,.doc,.docx,.zip,.png,.jpg,.jpeg", style: { display: "none" }, onChange: (e) => selectFile(e.target.files?.[0] || null) }),
                            React.createElement("div", { className: "file-drop", role: "button", tabIndex: 0, onClick: () => fileRef.current?.click(), onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ")
                                    fileRef.current?.click(); }, onDragOver: (e) => e.preventDefault(), onDrop: (e) => { e.preventDefault(); selectFile(e.dataTransfer.files?.[0] || null); } },
                                React.createElement("div", { className: "icon" }, file ? "✓" : "↑"),
                                React.createElement("div", { className: "meta" },
                                    React.createElement("div", { className: "name" }, file ? file.name : "파일을 선택하거나 여기로 끌어다 놓으세요"),
                                    React.createElement("div", { className: "sub" }, file ? `${(file.size / 1024).toFixed(1)} KB` : `PDF · PPT · DOC · ZIP · 이미지 등 (최대 ${MAX_UPLOAD_LABEL})`))),
                            React.createElement("p", { style: { margin: "8px 0 0", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 } },
                                "\uC601\uC0C1 \uD30C\uC77C\uC774\uB098 ",
                                MAX_UPLOAD_LABEL,
                                "\uB97C \uCD08\uACFC\uD558\uB294 \uD30C\uC77C\uC740 ",
                                React.createElement("span", { className: "mono", style: { fontSize: 12 } }, "contact@saegyeol.ai.kr"),
                                "\uB85C \uC9C1\uC811 \uBCF4\uB0B4\uC8FC\uC138\uC694.")),
                        React.createElement("div", { className: "actions" },
                            React.createElement("span", { className: "hint" }, "\u2192 contact@saegyeol.ai.kr \uB85C \uC804\uC1A1\uB429\uB2C8\uB2E4"),
                            React.createElement("button", { type: "submit", className: "btn btn-accent", disabled: sending || !name || !email || !file }, sending ? "전송 중…" : React.createElement(React.Fragment, null,
                                "\uC9C0\uC6D0\uD558\uAE30 ",
                                React.createElement("span", { className: "arrow" }, "\u2192")))))))),
        React.createElement(ClosingCTA, { onContact: goContact })));
}
window.TeamPage = TeamPage;
function ProductPage({ setRoute }) {
    const goContact = () => {
        setRoute("home");
        setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    };
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
    return (React.createElement("div", { "data-screen-label": "03 Product \u00B7 \uC5EC\uC6B8" },
        React.createElement("section", { className: "page-hero" },
            React.createElement("div", { className: "hero-bg" }),
            React.createElement("div", { className: "container", style: { position: "relative" } },
                React.createElement("span", { className: "section-label" }, "PRODUCT \u00B7 \uC5EC\uC6B8"),
                React.createElement("h1", null,
                    "\uD55C\uAD6D\uC5B4 AI \uC5D0\uC774\uC804\uD2B8",
                    React.createElement("br", null),
                    "\uC2DC\uC2A4\uD15C\uC744 \uC704\uD55C",
                    React.createElement("br", null),
                    "\uC790\uB3D9 \uCE68\uD22C \uD14C\uC2A4\uD2B8."),
                React.createElement("p", null, "\uD55C\uAD6D \uAE30\uC5C5\uC758 AI \uC5D0\uC774\uC804\uD2B8 \uC2DC\uC2A4\uD15C(LLM + MCP \uC11C\uBC84 + \uC0AC\uC6A9\uC790 \uD50C\uB85C\uC6B0)\uC744 \uD55C\uAD6D\uC5B4 \uC704\uD611 \uAD00\uC810\uC5D0\uC11C \uC790\uB3D9\uC73C\uB85C \uACF5\uACA9\uD558\uACE0, \uC775\uC2A4\uD50C\uB85C\uC787 PoC\uC640 \uD55C\uAD6D\uD615 \uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4 \uB9AC\uD3EC\uD2B8\uB97C \uC0B0\uCD9C\uD569\uB2C8\uB2E4."),
                React.createElement("div", { className: "hero-cta", style: { marginTop: 36 } },
                    React.createElement("button", { className: "btn btn-accent", onClick: goContact },
                        "\uB3C4\uC785 \uBB38\uC758\uD558\uAE30 ",
                        React.createElement("span", { className: "arrow" }, "\u2192")),
                    React.createElement("button", { className: "btn btn-ghost", onClick: () => openRoute("pricing") },
                        "\uC694\uAE08\uC81C \uBCF4\uAE30 ",
                        React.createElement("span", { className: "arrow" }, "\u2192"))))),
        React.createElement("section", { className: "block", style: { paddingBottom: 0 } },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "WHY \uC5EC\uC6B8"),
                    React.createElement("h2", null,
                        "\uAD6D\uC81C \uB3C4\uAD6C\uAC00 \uB2E4\uB8E8\uC9C0 \uBABB\uD558\uB294",
                        React.createElement("br", null),
                        "\uD55C\uAD6D \uD658\uACBD\uC758 \uC704\uD611\uC744 \uC815\uD655\uD788 \uC9DA\uC5B4\uB0C5\uB2C8\uB2E4."),
                    React.createElement("p", null, "\uC5EC\uC6B8\uC740 \uD55C\uAD6D\uC5B4 \uD504\uB86C\uD504\uD2B8 \uC778\uC81D\uC158 2,400+, MCP \uAD8C\uD55C \uC6B0\uD68C, K-PII \uCD94\uCD9C \uC2DC\uB098\uB9AC\uC624\uB97C \uC790\uB3D9\uC73C\uB85C \uC2E4\uD589\uD558\uACE0, ISMS-P/\uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uBC95 \uAE30\uC900\uC5D0 \uB9E4\uD551\uB41C \uD55C\uAD6D\uC5B4 \uB9AC\uD3EC\uD2B8\uB97C \uC0B0\uCD9C\uD569\uB2C8\uB2E4. PoC\uC640 \uD568\uAED8 \uC6B0\uC120\uC21C\uC704 \uBCF4\uC548 \uC870\uCE58\uB3C4 \uD568\uAED8 \uC81C\uC548\uD569\uB2C8\uB2E4.")),
                React.createElement("div", { className: "stats" },
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "2,400",
                            React.createElement("span", { className: "unit" }, "+")),
                        React.createElement("div", { className: "k" }, "\uD55C\uAD6D\uC5B4 \uACF5\uACA9 \uD398\uC774\uB85C\uB4DC")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "36",
                            React.createElement("span", { className: "unit" }, "\uBD84")),
                        React.createElement("div", { className: "k" }, "\uD3C9\uADE0 \uC810\uAC80 \uC2DC\uAC04")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "14",
                            React.createElement("span", { className: "unit" }, "\uC885")),
                        React.createElement("div", { className: "k" }, "\uD55C\uAD6D\uC2DD PII \uCE74\uD14C\uACE0\uB9AC")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "8",
                            React.createElement("span", { className: "unit" }, "\uAC1C")),
                        React.createElement("div", { className: "k" }, "\uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4 \uB9E4\uD551 \uAE30\uC900"))))),
        React.createElement("section", { className: "block", id: "features" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "CORE CAPABILITIES \u00B7 03"),
                    React.createElement("h2", null, "\uD575\uC2EC \uAE30\uB2A5 \uC138 \uAC00\uC9C0."),
                    React.createElement("p", null, "\uD55C\uAD6D \uAE30\uC5C5 \uD658\uACBD\uC5D0\uC11C \uAC00\uC7A5 \uC790\uC8FC \uBC1C\uACAC\uB418\uB294 \uBCF4\uC548 \uC0AC\uAC01\uC9C0\uB300\uB97C \uC815\uBA74\uC73C\uB85C \uB2E4\uB8E8\uB294 \uC138 \uAC00\uC9C0 \uAE30\uB2A5\uC785\uB2C8\uB2E4.")),
                React.createElement("div", { className: "cards" },
                    React.createElement("article", { className: "card card-link", role: "link", tabIndex: 0, onClick: () => openRoute("feature-shadow"), onKeyDown: (e) => cardKey(e, "feature-shadow") },
                        React.createElement("span", { className: "num" }, "01"),
                        React.createElement("div", { className: "ico" },
                            React.createElement(Icon.shadow, null)),
                        React.createElement("h3", null, "Shadow Agent \uD0D0\uC9C0"),
                        React.createElement("p", null, "\uC784\uC9C1\uC6D0\uC774 \uC0AC\uB0B4 \uB370\uC774\uD130\uB85C \uB9CC\uB4E0 \uAC1C\uC778 AI \uC5D0\uC774\uC804\uD2B8(ChatGPT GPTs, MCP \uD074\uB77C\uC774\uC5B8\uD2B8 \uB4F1)\uAC00 \uB9CC\uB4DC\uB294 \uBCF4\uC548 \uC0AC\uAC01\uC9C0\uB300\uB97C \uC790\uB3D9\uC73C\uB85C \uBC1C\uACAC\uD558\uACE0, \uB370\uC774\uD130 \uB178\uCD9C \uC704\uD5D8\uB3C4\uB97C \uD3C9\uAC00\uD569\uB2C8\uB2E4."),
                        React.createElement("span", { className: "more" }, "\uC790\uC138\uD788 \uBCF4\uAE30")),
                    React.createElement("article", { className: "card card-link", role: "link", tabIndex: 0, onClick: () => openRoute("feature-pii"), onKeyDown: (e) => cardKey(e, "feature-pii") },
                        React.createElement("span", { className: "num" }, "02"),
                        React.createElement("div", { className: "ico" },
                            React.createElement(Icon.pii, null)),
                        React.createElement("h3", null, "K-PII \uCC28\uB2E8"),
                        React.createElement("p", null, "\uC8FC\uBBFC\uBC88\uD638\u00B7\uC0AC\uC5C5\uC790\uBC88\uD638\u00B7\uD55C\uAD6D\uC2DD \uC8FC\uC18C\u00B7\uACC4\uC88C\u00B7\uC6B4\uC804\uBA74\uD5C8 \uB4F1 \uD55C\uAD6D\uC2DD PII 14\uC885\uC744 \uC804\uC6A9 \uD0D0\uC9C0\uAE30\uB85C \uC2DD\uBCC4\uD558\uACE0, \uC5D0\uC774\uC804\uD2B8\uAC00 \uC678\uBD80\uB85C \uC720\uCD9C\uD558\uAE30 \uC804\uC5D0 \uCC28\uB2E8\uD569\uB2C8\uB2E4."),
                        React.createElement("span", { className: "more" }, "\uC790\uC138\uD788 \uBCF4\uAE30")),
                    React.createElement("article", { className: "card card-link", role: "link", tabIndex: 0, onClick: () => openRoute("feature-report"), onKeyDown: (e) => cardKey(e, "feature-report") },
                        React.createElement("span", { className: "num" }, "03"),
                        React.createElement("div", { className: "ico" },
                            React.createElement(Icon.report, null)),
                        React.createElement("h3", null, "\uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4 \uB9AC\uD3EC\uD2B8"),
                        React.createElement("p", null, "ISMS-P \u00B7 \uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uBC95 \u00B7 \uAE08\uC735 AI \uAC00\uC774\uB4DC\uB77C\uC778 \uB4F1 \uD55C\uAD6D\uD615 \uAE30\uC900\uC5D0 \uC790\uB3D9 \uB9E4\uD551\uB41C \uB9AC\uD3EC\uD2B8\uB97C PDF\u00B7\uC6F9\uC73C\uB85C \uC0DD\uC131. \uC775\uC2A4\uD50C\uB85C\uC787 PoC\uC640 \uC6B0\uC120\uC21C\uC704 \uC870\uCE58\uB97C \uD568\uAED8 \uC81C\uACF5\uD569\uB2C8\uB2E4."),
                        React.createElement("span", { className: "more" }, "\uC790\uC138\uD788 \uBCF4\uAE30"))))),
        React.createElement("section", { className: "block", id: "how-it-works" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "HOW IT WORKS \u00B7 03 STEPS"),
                    React.createElement("h2", null,
                        "\uC5F0\uACB0\uB9CC \uD574\uC8FC\uC2DC\uBA74",
                        React.createElement("br", null),
                        "\uB098\uBA38\uC9C0\uB294 \uC790\uB3D9\uC785\uB2C8\uB2E4."),
                    React.createElement("p", null, "MCP \uC5D4\uB4DC\uD3EC\uC778\uD2B8 \uB610\uB294 \uC5D0\uC774\uC804\uD2B8 API\uB9CC \uC5F0\uACB0\uD558\uBA74, \uC0C8\uACB0\uC774 \uD55C\uAD6D\uC5B4 \uC704\uD611 \uC2DC\uB098\uB9AC\uC624\uB97C \uC790\uB3D9\uC73C\uB85C \uC2E4\uD589\uD558\uACE0 \uACB0\uACFC \uB9AC\uD3EC\uD2B8\uB97C \uBC1B\uC544\uBCF4\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")),
                React.createElement("div", { className: "flow" },
                    React.createElement("div", { className: "flow-step" },
                        React.createElement("span", { className: "step-num" }, "STEP 01"),
                        React.createElement("h4", null, "\uC5D0\uC774\uC804\uD2B8 \uD589\uB3D9 \uC218\uC9D1"),
                        React.createElement("p", null, "MCP \uC11C\uBC84 \u00B7 LLM \uC5D4\uB4DC\uD3EC\uC778\uD2B8 \u00B7 \uC0AC\uC6A9\uC790 \uD50C\uB85C\uC6B0 \uB85C\uADF8\uB97C \uC548\uC804\uD558\uAC8C \uC5F0\uACB0\uD574 \uC815\uC0C1 \uD589\uB3D9 \uBAA8\uB378\uC744 \uD559\uC2B5\uD569\uB2C8\uB2E4."),
                        React.createElement("div", { className: "terminal" }, "connect /agent \u00B7 /mcp \u00B7 /logs")),
                    React.createElement("div", { className: "flow-step" },
                        React.createElement("span", { className: "step-num" }, "STEP 02"),
                        React.createElement("h4", null, "\uC704\uD611 \uBD84\uC11D"),
                        React.createElement("p", null, "\uD55C\uAD6D\uC5B4 \uD504\uB86C\uD504\uD2B8 \uC778\uC81D\uC158 2,400+, MCP \uAD8C\uD55C \uC6B0\uD68C, K-PII \uCD94\uCD9C \uC2DC\uB098\uB9AC\uC624\uB97C \uC790\uB3D9 \uC2E4\uD589\uD569\uB2C8\uB2E4."),
                        React.createElement("div", { className: "terminal" }, "run inject \u00B7 pivot \u00B7 exfil")),
                    React.createElement("div", { className: "flow-step" },
                        React.createElement("span", { className: "step-num" }, "STEP 03"),
                        React.createElement("h4", null, "\uB9AC\uD3EC\uD2B8 \uC0B0\uCD9C"),
                        React.createElement("p", null, "\uC775\uC2A4\uD50C\uB85C\uC787 PoC\uC640 ISMS-P/\uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uBC95 \uB9E4\uD551\uC774 \uD3EC\uD568\uB41C \uD55C\uAD6D\uC5B4 \uB9AC\uD3EC\uD2B8\uB97C PDF\u00B7\uC6F9\uC73C\uB85C \uBC1B\uC544\uBCF4\uC138\uC694."),
                        React.createElement("div", { className: "terminal" }, "export ko_report.pdf"))),
                React.createElement("div", { style: { marginTop: 56, display: "flex", justifyContent: "center" } },
                    React.createElement("button", { className: "btn btn-accent", onClick: goContact },
                        "\uB3C4\uC785 \uBB38\uC758\uD558\uAE30 ",
                        React.createElement("span", { className: "arrow" }, "\u2192"))))),
        React.createElement(ClosingCTA, { onContact: goContact })));
}
window.ProductPage = ProductPage;
function PricingPage({ setRoute }) {
    const goContact = (subject) => {
        setRoute("home");
        setTimeout(() => {
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
            const message = document.getElementById("cfv2-msg");
            if (message && subject && !message.value) {
                const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
                setter?.call(message, `${subject} 요금제 도입을 문의합니다.`);
                message.dispatchEvent(new Event("input", { bubbles: true }));
            }
        }, 100);
    };
    const plans = [
        {
            id: "free",
            name: "무료",
            price: "0원",
            caption: "첫 점검과 결과 확인",
            features: [
                "전체 탐지 + 형태 변형",
                "Exploit PoC 리포트",
                "remediation 개선 방안",
                "재검사 24시간당 1회",
                "통과 인증 없음",
            ],
            cta: "무료 점검 문의",
        },
        {
            id: "pro",
            name: "프로",
            price: "월 9만원",
            caption: "지속적인 검증 루프",
            featured: true,
            features: [
                "무료 기능 전부 포함",
                "재검증 무제한 (쿨다운 없음)",
                "통과 인증서 발급",
                "컴플라이언스 매핑 옵션",
                "재검증 이력 관리",
            ],
            cta: "프로 도입 문의",
        },
        {
            id: "franchise",
            name: "프랜차이즈",
            price: "상담 후 결정",
            caption: "다중 자산·온프레미스",
            features: [
                "프로 기능 전부 포함",
                "여러 에이전트 자산 단위",
                "온프레미스 배포",
                "전용 지원",
                "규제 감사 통과용 리포트",
            ],
            cta: "기업 견적 문의",
        },
    ];
    const rows = [
        ["탐지 엔진", "동일", "동일", "동일"],
        ["Exploit PoC 리포트", "포함", "포함", "포함"],
        ["재검증", "24시간당 1회", "무제한", "무제한"],
        ["통과 인증서", "미제공", "제공", "제공"],
        ["컴플라이언스 매핑", "미제공", "옵션", "감사 대응형"],
        ["재검증 이력", "미제공", "관리", "자산 단위 관리"],
        ["배포 방식", "클라우드", "클라우드", "온프레미스 지원"],
        ["지원", "기본", "기본", "전용 지원"],
    ];
    return (React.createElement("div", { "data-screen-label": "Pricing \u00B7 \uC5EC\uC6B8" },
        React.createElement("section", { className: "page-hero pricing-hero" },
            React.createElement("div", { className: "hero-bg" }),
            React.createElement("div", { className: "container", style: { position: "relative" } },
                React.createElement("span", { className: "section-label" }, "PRODUCT \u00B7 \uC5EC\uC6B8 \u00B7 PRICING"),
                React.createElement("h1", null,
                    "\uB6AB\uB294 \uB2A5\uB825\uC740 \uAC19\uACE0,",
                    React.createElement("br", null),
                    "\uAC80\uC99D \uB8E8\uD504\uAC00 \uB2EC\uB77C\uC9D1\uB2C8\uB2E4."),
                React.createElement("p", null, "\uC5EC\uC6B8\uC740 \uD0D0\uC9C0 \uC815\uD655\uB3C4\uB85C \uC694\uAE08\uC81C\uB97C \uB098\uB204\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uBAA8\uB4E0 \uD50C\uB79C\uC5D0 \uB3D9\uC77C\uD55C \uD0D0\uC9C0 \uC5D4\uC9C4\uC744 \uC81C\uACF5\uD558\uACE0, \uC7AC\uAC80\uC99D \uC811\uADFC\uAD8C\u00B7\uC778\uC99D\u00B7\uBC30\uD3EC \uBC29\uC2DD\uC5D0 \uB530\uB77C \uAD6C\uBD84\uD569\uB2C8\uB2E4."),
                React.createElement("div", { className: "hero-cta", style: { marginTop: 36 } },
                    React.createElement("a", { className: "btn btn-accent", href: "#plans", onClick: (e) => { e.preventDefault(); document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" }); } },
                        "\uC694\uAE08\uC81C \uBE44\uAD50 ",
                        React.createElement("span", { className: "arrow" }, "\u2193")),
                    React.createElement("button", { className: "btn btn-ghost", onClick: () => goContact("여울") },
                        "\uB3C4\uC785 \uBB38\uC758\uD558\uAE30 ",
                        React.createElement("span", { className: "arrow" }, "\u2192"))))),
        React.createElement("section", { className: "block", id: "plans" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "PLANS \u00B7 03"),
                    React.createElement("h2", null, "\uC138 \uD50C\uB79C, \uD55C\uB208\uC5D0."),
                    React.createElement("p", null, "\uCCAB \uAC80\uC99D\uC740 \uBB34\uB8CC\uB85C \uC2DC\uC791\uD558\uACE0, \uBC18\uBCF5 \uAC80\uC99D\uC774\uB098 \uC778\uC99D\uC774 \uD544\uC694\uD558\uBA74 \uD504\uB85C, \uB2E4\uC911 \uC5D0\uC774\uC804\uD2B8\uC640 \uC628\uD504\uB808\uBBF8\uC2A4\uAC00 \uD544\uC694\uD558\uBA74 \uD504\uB79C\uCC28\uC774\uC988\uB97C \uC120\uD0DD\uD569\uB2C8\uB2E4.")),
                React.createElement("div", { className: "pricing-grid" }, plans.map((plan) => (React.createElement("article", { key: plan.id, className: `pricing-card${plan.featured ? " featured" : ""}` },
                    plan.featured && React.createElement("span", { className: "pricing-recommend" }, "RECOMMENDED"),
                    React.createElement("div", { className: "pricing-card-head" },
                        React.createElement("span", { className: "pricing-plan" }, plan.name),
                        React.createElement("h3", null, plan.price),
                        React.createElement("p", null, plan.caption)),
                    React.createElement("ul", null, plan.features.map((feature) => React.createElement("li", { key: feature }, feature))),
                    React.createElement("button", { className: `btn ${plan.featured ? "btn-accent" : "btn-ghost"}`, onClick: () => goContact(plan.name) },
                        plan.cta,
                        " ",
                        React.createElement("span", { className: "arrow" }, "\u2192")))))),
                React.createElement("div", { className: "honesty-note" },
                    React.createElement("span", { className: "section-label" }, "HONESTY PRINCIPLE"),
                    React.createElement("h3", null, "\uD0D0\uC9C0 \uC815\uD655\uB3C4\uB85C \uB4F1\uAE09\uC744 \uB098\uB204\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."),
                    React.createElement("p", null, "\uC138 \uD50C\uB79C\uC758 \uCC28\uC774\uB294 \uAC80\uC99D \uB8E8\uD504 \uC811\uADFC\uAD8C\uACFC \uBC30\uD3EC \uD615\uD0DC\uBFD0\uC785\uB2C8\uB2E4. \uC5EC\uC6B8\uC758 \uB9AC\uD3EC\uD2B8\uB294 \uC548\uC804 \uBCF4\uC99D\uC11C\uAC00 \uC544\uB2C8\uB77C, \uAC80\uC0AC \uBC94\uC704\u00B7DB \uBC84\uC804\u00B7\uAE30\uC900\uC77C\u00B7\uC99D\uAC70 \uC720\uD615\uC744 \uBA85\uC2DC\uD55C \uC131\uC801\uC11C\uC785\uB2C8\uB2E4.")))),
        React.createElement("section", { className: "block pricing-compare-section" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "COMPARE"),
                    React.createElement("h2", null, "\uD544\uC694\uD55C \uC6B4\uC601 \uBC29\uC2DD\uC73C\uB85C \uC120\uD0DD\uD558\uC138\uC694."),
                    React.createElement("p", null, "\uBAA8\uBC14\uC77C\uC5D0\uC11C\uB294 \uD45C\uB97C \uC88C\uC6B0\uB85C \uC6C0\uC9C1\uC5EC \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")),
                React.createElement("div", { className: "pricing-table-wrap", role: "region", "aria-label": "\uC5EC\uC6B8 \uC694\uAE08\uC81C \uBE44\uAD50\uD45C", tabIndex: 0 },
                    React.createElement("table", { className: "pricing-table" },
                        React.createElement("thead", null,
                            React.createElement("tr", null,
                                React.createElement("th", null, "\uAD6C\uBD84"),
                                React.createElement("th", null, "\uBB34\uB8CC"),
                                React.createElement("th", null, "\uD504\uB85C"),
                                React.createElement("th", null, "\uD504\uB79C\uCC28\uC774\uC988"))),
                        React.createElement("tbody", null, rows.map((row) => (React.createElement("tr", { key: row[0] }, row.map((cell, index) => index === 0 ? React.createElement("th", { key: cell, scope: "row" }, cell) : React.createElement("td", { key: `${row[0]}-${cell}` }, cell)))))))))),
        React.createElement("section", { className: "block" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "FAQ"),
                    React.createElement("h2", null, "\uC694\uAE08\uC81C\uC5D0\uC11C \uC790\uC8FC \uBB3B\uB294 \uB0B4\uC6A9.")),
                React.createElement("div", { className: "faq-list" },
                    React.createElement("details", { open: true },
                        React.createElement("summary", null, "\uBB34\uB8CC \uD50C\uB79C\uACFC \uD504\uB85C \uD50C\uB79C\uC758 \uD0D0\uC9C0 \uC131\uB2A5\uC774 \uB2E4\uB978\uAC00\uC694?"),
                        React.createElement("p", null, "\uC544\uB2D9\uB2C8\uB2E4. \uBAA8\uB4E0 \uD50C\uB79C\uC740 \uB3D9\uC77C\uD55C \uD0D0\uC9C0 \uC5D4\uC9C4\uACFC \uD615\uD0DC \uBCC0\uD615 \uACF5\uACA9 \uBC29\uC2DD\uC744 \uC0AC\uC6A9\uD569\uB2C8\uB2E4. \uCC28\uC774\uB294 \uC7AC\uAC80\uC99D \uD69F\uC218, \uC778\uC99D\uC11C, \uC774\uB825 \uAD00\uB9AC \uB4F1 \uC6B4\uC601 \uAE30\uB2A5\uC785\uB2C8\uB2E4.")),
                    React.createElement("details", null,
                        React.createElement("summary", null, "\uBB34\uB8CC \uD50C\uB79C\uC5D0\uC11C\uB3C4 Exploit PoC\uC640 \uAC1C\uC120 \uBC29\uC548\uC744 \uBC1B\uC744 \uC218 \uC788\uB098\uC694?"),
                        React.createElement("p", null, "\uB124. \uBB34\uB8CC \uD50C\uB79C\uC5D0\uB3C4 \uC804\uCCB4 \uD0D0\uC9C0, \uD615\uD0DC \uBCC0\uD615, Exploit PoC \uB9AC\uD3EC\uD2B8\uC640 remediation \uAC1C\uC120 \uBC29\uC548\uC774 \uD3EC\uD568\uB429\uB2C8\uB2E4.")),
                    React.createElement("details", null,
                        React.createElement("summary", null, "\uD504\uB85C \uD50C\uB79C\uC758 \uC7AC\uAC80\uC99D\uC740 \uD69F\uC218 \uC81C\uD55C\uC774 \uC788\uB098\uC694?"),
                        React.createElement("p", null, "\uD504\uB85C \uD50C\uB79C\uC740 \uCFE8\uB2E4\uC6B4 \uC5C6\uC774 \uC7AC\uAC80\uC99D\uD560 \uC218 \uC788\uC73C\uBA70, \uC7AC\uAC80\uC99D \uC774\uB825\uC744 \uAD00\uB9AC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")),
                    React.createElement("details", null,
                        React.createElement("summary", null, "\uC628\uD504\uB808\uBBF8\uC2A4 \uBC30\uD3EC\uAC00 \uD544\uC694\uD55C \uACBD\uC6B0 \uC5B4\uB5A4 \uD50C\uB79C\uC744 \uC120\uD0DD\uD558\uB098\uC694?"),
                        React.createElement("p", null, "\uC5EC\uB7EC \uC5D0\uC774\uC804\uD2B8 \uC790\uC0B0\uC744 \uAD00\uB9AC\uD558\uAC70\uB098 \uB0B4\uBD80\uB9DD \uC628\uD504\uB808\uBBF8\uC2A4 \uBC30\uD3EC, \uC804\uC6A9 \uC9C0\uC6D0, \uADDC\uC81C \uAC10\uC0AC \uB300\uC751 \uB9AC\uD3EC\uD2B8\uAC00 \uD544\uC694\uD558\uBA74 \uD504\uB79C\uCC28\uC774\uC988 \uD50C\uB79C\uC73C\uB85C \uC0C1\uB2F4\uD569\uB2C8\uB2E4."))))),
        React.createElement(ClosingCTA, { onContact: () => goContact("여울") })));
}
window.PricingPage = PricingPage;
function PrivacyPage() {
    return (React.createElement("main", { className: "privacy-page" },
        React.createElement("div", { className: "container" },
            React.createElement("div", { className: "privacy-header" },
                React.createElement("span", { className: "label" }, "LEGAL"),
                React.createElement("h1", null, "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68"),
                React.createElement("p", { className: "privacy-meta" }, "\uC2DC\uD589\uC77C: 2026\uB144 5\uC6D4 24\uC77C")),
            React.createElement("div", { className: "privacy-body" },
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("p", null, "\uC0C8\uACB0(Saegyeol, \uC774\uD558 \"\uD68C\uC0AC\")\uC740 \u300C\uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638\uBC95\u300D \uC81C30\uC870\uC5D0 \uB530\uB77C \uC815\uBCF4\uC8FC\uCCB4\uC758 \uAC1C\uC778\uC815\uBCF4\uB97C \uBCF4\uD638\uD558\uACE0 \uC774\uC640 \uAD00\uB828\uD55C \uACE0\uCDA9\uC744 \uC2E0\uC18D\uD558\uAC8C \uCC98\uB9AC\uD560 \uC218 \uC788\uB3C4\uB85D \uB2E4\uC74C\uACFC \uAC19\uC774 \uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68\uC744 \uC218\uB9BD\u00B7\uACF5\uAC1C\uD569\uB2C8\uB2E4.")),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C1\uC870 \uAC1C\uC778\uC815\uBCF4\uC758 \uCC98\uB9AC \uBAA9\uC801"),
                    React.createElement("p", null, "\uD68C\uC0AC\uB294 \uB2E4\uC74C\uC758 \uBAA9\uC801\uC744 \uC704\uD558\uC5EC \uAC1C\uC778\uC815\uBCF4\uB97C \uCC98\uB9AC\uD569\uB2C8\uB2E4. \uCC98\uB9AC\uD55C \uAC1C\uC778\uC815\uBCF4\uB294 \uB2E4\uC74C\uC758 \uBAA9\uC801 \uC774\uC678\uC758 \uC6A9\uB3C4\uB85C\uB294 \uC774\uC6A9\uB418\uC9C0 \uC54A\uC73C\uBA70, \uC774\uC6A9 \uBAA9\uC801\uC774 \uBCC0\uACBD\uB418\uB294 \uACBD\uC6B0\uC5D0\uB294 \uBCC4\uB3C4\uC758 \uB3D9\uC758\uB97C \uBC1B\uB294 \uB4F1 \uD544\uC694\uD55C \uC870\uCE58\uB97C \uC774\uD589\uD560 \uC608\uC815\uC785\uB2C8\uB2E4."),
                    React.createElement("ul", null,
                        React.createElement("li", null, "\uC11C\uBE44\uC2A4 \uB3C4\uC785 \uBB38\uC758 \uC811\uC218 \uBC0F CS \uC751\uB300"),
                        React.createElement("li", null, "\uCC44\uC6A9 \uC9C0\uC6D0\uC790 \uC804\uD615 \uC9C4\uD589 \uBC0F \uACB0\uACFC \uC548\uB0B4"))),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C2\uC870 \uCC98\uB9AC\uD558\uB294 \uAC1C\uC778\uC815\uBCF4\uC758 \uD56D\uBAA9"),
                    React.createElement("p", null, "\uD68C\uC0AC\uB294 \uB2E4\uC74C\uC758 \uAC1C\uC778\uC815\uBCF4 \uD56D\uBAA9\uC744 \uCC98\uB9AC\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4."),
                    React.createElement("table", { className: "privacy-table" },
                        React.createElement("thead", null,
                            React.createElement("tr", null,
                                React.createElement("th", null, "\uC218\uC9D1 \uACBD\uB85C"),
                                React.createElement("th", null, "\uC218\uC9D1 \uD56D\uBAA9"),
                                React.createElement("th", null, "\uC218\uC9D1 \uBC29\uBC95"))),
                        React.createElement("tbody", null,
                            React.createElement("tr", null,
                                React.createElement("td", null, "\uBB38\uC758 \uD3FC"),
                                React.createElement("td", null, "\uC774\uB984, \uC774\uBA54\uC77C \uC8FC\uC18C, \uBB38\uC758 \uB0B4\uC6A9"),
                                React.createElement("td", null, "\uD648\uD398\uC774\uC9C0 \uB0B4 \uC9C1\uC811 \uC785\uB825")),
                            React.createElement("tr", null,
                                React.createElement("td", null, "\uCC44\uC6A9 \uC9C0\uC6D0 \uD3FC"),
                                React.createElement("td", null, "\uC774\uB984, \uC774\uBA54\uC77C \uC8FC\uC18C, \uD3EC\uD2B8\uD3F4\uB9AC\uC624 \uD30C\uC77C"),
                                React.createElement("td", null, "\uD648\uD398\uC774\uC9C0 \uB0B4 \uC9C1\uC811 \uC785\uB825 \uBC0F \uD30C\uC77C \uC5C5\uB85C\uB4DC")))),
                    React.createElement("p", { style: { marginTop: 12 } }, "\uD68C\uC0AC\uB294 \uC11C\uBE44\uC2A4 \uC81C\uACF5\uC5D0 \uD544\uC694\uD55C \uCD5C\uC18C\uD55C\uC758 \uAC1C\uC778\uC815\uBCF4\uB9CC \uC218\uC9D1\uD569\uB2C8\uB2E4.")),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C3\uC870 \uAC1C\uC778\uC815\uBCF4\uC758 \uCC98\uB9AC \uBC0F \uBCF4\uC720 \uAE30\uAC04"),
                    React.createElement("p", null, "\uD68C\uC0AC\uB294 \uBC95\uB839\uC5D0 \uB530\uB978 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uC720\u00B7\uC774\uC6A9 \uAE30\uAC04 \uB610\uB294 \uC815\uBCF4\uC8FC\uCCB4\uB85C\uBD80\uD130 \uAC1C\uC778\uC815\uBCF4\uB97C \uC218\uC9D1 \uC2DC\uC5D0 \uB3D9\uC758\uBC1B\uC740 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uC720\u00B7\uC774\uC6A9 \uAE30\uAC04 \uB0B4\uC5D0\uC11C \uAC1C\uC778\uC815\uBCF4\uB97C \uCC98\uB9AC\u00B7\uBCF4\uC720\uD569\uB2C8\uB2E4."),
                    React.createElement("ul", null,
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uBB38\uC758 \uC811\uC218 \uBC0F CS \uC751\uB300 \uBAA9\uC801:"),
                            " \uC218\uC9D1\uC77C\uB85C\uBD80\uD130 3\uB144"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uCC44\uC6A9 \uC9C0\uC6D0 \uBAA9\uC801:"),
                            " \uCC44\uC6A9 \uC804\uD615 \uC885\uB8CC \uD6C4 3\uB144")),
                    React.createElement("p", { style: { marginTop: 12 } }, "\uB2E8, \uAD00\uACC4 \uBC95\uB839\uC5D0 \uB530\uB77C \uBCF4\uC874\uC774 \uD544\uC694\uD55C \uACBD\uC6B0 \uD574\uB2F9 \uAE30\uAC04 \uB3D9\uC548 \uBCF4\uAD00\uD569\uB2C8\uB2E4.")),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C4\uC870 \uAC1C\uC778\uC815\uBCF4\uC758 \uD30C\uAE30 \uC808\uCC28 \uBC0F \uBC29\uBC95"),
                    React.createElement("p", null, "\uD68C\uC0AC\uB294 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uC720 \uAE30\uAC04\uC774 \uACBD\uACFC\uD558\uAC70\uB098 \uCC98\uB9AC \uBAA9\uC801\uC774 \uB2EC\uC131\uB41C \uACBD\uC6B0 \uC9C0\uCCB4 \uC5C6\uC774 \uD574\uB2F9 \uAC1C\uC778\uC815\uBCF4\uB97C \uD30C\uAE30\uD569\uB2C8\uB2E4."),
                    React.createElement("ul", null,
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uC804\uC790\uC801 \uD30C\uC77C \uD615\uD0DC:"),
                            " \uBCF5\uAD6C \uBC0F \uC7AC\uC0DD\uC774 \uBD88\uAC00\uB2A5\uD55C \uBC29\uBC95\uC73C\uB85C \uC601\uAD6C \uC0AD\uC81C"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uC11C\uBA74, \uCD9C\uB825\uBB3C \uB4F1:"),
                            " \uBD84\uC1C4 \uB610\uB294 \uC18C\uAC01"))),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C5\uC870 \uAC1C\uC778\uC815\uBCF4\uC758 \uC81C3\uC790 \uC81C\uACF5"),
                    React.createElement("p", null, "\uD68C\uC0AC\uB294 \uC815\uBCF4\uC8FC\uCCB4\uC758 \uAC1C\uC778\uC815\uBCF4\uB97C \uC81C1\uC870\uC5D0\uC11C \uBA85\uC2DC\uD55C \uBAA9\uC801 \uBC94\uC704 \uB0B4\uC5D0\uC11C\uB9CC \uCC98\uB9AC\uD558\uBA70, \uC815\uBCF4\uC8FC\uCCB4\uC758 \uB3D9\uC758, \uBC95\uB960\uC758 \uD2B9\uBCC4\uD55C \uADDC\uC815 \uB4F1 \u300C\uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638\uBC95\u300D \uC81C17\uC870 \uBC0F \uC81C18\uC870\uC5D0 \uD574\uB2F9\uD558\uB294 \uACBD\uC6B0\uC5D0\uB9CC \uAC1C\uC778\uC815\uBCF4\uB97C \uC81C3\uC790\uC5D0\uAC8C \uC81C\uACF5\uD569\uB2C8\uB2E4. \uD604\uC7AC \uC81C3\uC790 \uC81C\uACF5\uC740 \uC5C6\uC2B5\uB2C8\uB2E4.")),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C6\uC870 \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uC5C5\uBB34\uC758 \uC704\uD0C1"),
                    React.createElement("p", null, "\uD68C\uC0AC\uB294 \uD604\uC7AC \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uC5C5\uBB34\uB97C \uC678\uBD80\uC5D0 \uC704\uD0C1\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uD5A5\uD6C4 \uC704\uD0C1\uC774 \uBC1C\uC0DD\uD558\uB294 \uACBD\uC6B0 \uC704\uD0C1\uBC1B\uB294 \uC790, \uC704\uD0C1\uD558\uB294 \uC5C5\uBB34\uC758 \uB0B4\uC6A9\uC744 \uBCF8 \uBC29\uCE68\uC744 \uD1B5\uD574 \uC0AC\uC804 \uACF5\uAC1C\uD569\uB2C8\uB2E4.")),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C7\uC870 \uAC1C\uC778\uC815\uBCF4\uC758 \uC548\uC804\uC131 \uD655\uBCF4\uC870\uCE58"),
                    React.createElement("p", null, "\uD68C\uC0AC\uB294 \uAC1C\uC778\uC815\uBCF4\uC758 \uC548\uC804\uC131 \uD655\uBCF4\uB97C \uC704\uD574 \uB2E4\uC74C\uACFC \uAC19\uC740 \uC870\uCE58\uB97C \uCDE8\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4."),
                    React.createElement("ul", null,
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uAD00\uB9AC\uC801 \uC870\uCE58:"),
                            " \uB0B4\uBD80\uAD00\uB9AC\uACC4\uD68D \uC218\uB9BD\u00B7\uC2DC\uD589, \uAC1C\uC778\uC815\uBCF4 \uCDE8\uAE09 \uC9C1\uC6D0 \uCD5C\uC18C\uD654 \uBC0F \uAD50\uC721"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uAE30\uC220\uC801 \uC870\uCE58:"),
                            " \uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uC2DC\uC2A4\uD15C \uC811\uADFC\uAD8C\uD55C \uAD00\uB9AC, \uC811\uADFC\uD1B5\uC81C\uC2DC\uC2A4\uD15C \uC124\uCE58, \uAC1C\uC778\uC815\uBCF4\uC758 \uC554\uD638\uD654"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uBB3C\uB9AC\uC801 \uC870\uCE58:"),
                            " \uC790\uB8CC\uBCF4\uAD00\uC2E4 \uC811\uADFC\uD1B5\uC81C"))),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C8\uC870 \uAC1C\uC778\uC815\uBCF4 \uC790\uB3D9 \uC218\uC9D1 \uC7A5\uCE58\uC758 \uC124\uCE58\u00B7\uC6B4\uC601 \uBC0F \uAC70\uBD80"),
                    React.createElement("p", null, "\uD68C\uC0AC\uB294 \uC11C\uBE44\uC2A4 \uC774\uC6A9 \uACFC\uC815\uC5D0\uC11C \uCFE0\uD0A4(Cookie)\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uCFE0\uD0A4\uB294 \uC6F9\uC0AC\uC774\uD2B8 \uC6B4\uC601\uC5D0 \uC774\uC6A9\uB418\uB294 \uC11C\uBC84\uAC00 \uC774\uC6A9\uC790\uC758 \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uBCF4\uB0B4\uB294 \uC18C\uB7C9\uC758 \uC815\uBCF4\uC774\uBA70 \uC774\uC6A9\uC790 \uCEF4\uD4E8\uD130\uC758 \uD558\uB4DC\uB514\uC2A4\uD06C\uC5D0 \uC800\uC7A5\uB429\uB2C8\uB2E4."),
                    React.createElement("ul", null,
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uC0AC\uC6A9 \uBAA9\uC801:"),
                            " \uC774\uC6A9\uC790\uC758 \uC811\uC18D \uBE48\uB3C4, \uBC29\uBB38 \uC2DC\uAC04 \uBD84\uC11D \uBC0F \uC11C\uBE44\uC2A4 \uAC1C\uC120"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uAC70\uBD80 \uBC29\uBC95:"),
                            " \uC6F9 \uBE0C\uB77C\uC6B0\uC800 \uC124\uC815\uC5D0\uC11C \uCFE0\uD0A4 \uC800\uC7A5\uC744 \uAC70\uBD80\uD560 \uC218 \uC788\uC73C\uB098, \uC77C\uBD80 \uC11C\uBE44\uC2A4 \uC774\uC6A9\uC774 \uC81C\uD55C\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")),
                    React.createElement("p", { style: { marginTop: 12 } }, "\u203B \uAD6C\uAE00 \uD06C\uB86C \uAE30\uC900: \uC124\uC815 \u2192 \uAC1C\uC778\uC815\uBCF4 \uBC0F \uBCF4\uC548 \u2192 \uCFE0\uD0A4 \uBC0F \uAE30\uD0C0 \uC0AC\uC774\uD2B8 \uB370\uC774\uD130")),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C9\uC870 \uC815\uBCF4\uC8FC\uCCB4\uC640 \uBC95\uC815\uB300\uB9AC\uC778\uC758 \uAD8C\uB9AC\u00B7\uC758\uBB34 \uBC0F \uD589\uC0AC\uBC29\uBC95"),
                    React.createElement("p", null, "\uC815\uBCF4\uC8FC\uCCB4\uB294 \uD68C\uC0AC\uC5D0 \uB300\uD574 \uC5B8\uC81C\uB4E0\uC9C0 \uB2E4\uC74C \uAC01 \uD638\uC758 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638 \uAD00\uB828 \uAD8C\uB9AC\uB97C \uD589\uC0AC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."),
                    React.createElement("ul", null,
                        React.createElement("li", null, "\uAC1C\uC778\uC815\uBCF4 \uC5F4\uB78C \uC694\uCCAD"),
                        React.createElement("li", null, "\uAC1C\uC778\uC815\uBCF4 \uC815\uC815\u00B7\uC0AD\uC81C \uC694\uCCAD"),
                        React.createElement("li", null, "\uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uC815\uC9C0 \uC694\uCCAD"),
                        React.createElement("li", null, "\uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uC5D0 \uB300\uD55C \uB3D9\uC758 \uCCA0\uD68C")),
                    React.createElement("p", { style: { marginTop: 12 } }, "\uAD8C\uB9AC \uD589\uC0AC\uB294 \uC544\uB798 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638\uCC45\uC784\uC790\uC5D0\uAC8C \uC774\uBA54\uC77C\uB85C \uC694\uCCAD\uD558\uC2DC\uBA74 \uC9C0\uCCB4 \uC5C6\uC774 \uCC98\uB9AC\uD569\uB2C8\uB2E4. \uD68C\uC0AC\uB294 \uC815\uBCF4\uC8FC\uCCB4\uC758 \uAD8C\uB9AC\uC5D0 \uB530\uB978 \uC5F4\uB78C, \uC815\uC815\u00B7\uC0AD\uC81C, \uCC98\uB9AC\uC815\uC9C0 \uC694\uCCAD \uC2DC \uC5F4\uB78C \uB4F1\uC744 \uC81C\uD55C\uD558\uAC70\uB098 \uAC70\uC808\uD560 \uC218 \uC788\uB294 \uACBD\uC6B0\uC5D0\uB294 \uADF8 \uC0AC\uC720\uB97C \uD1B5\uBCF4\uD569\uB2C8\uB2E4.")),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C10\uC870 \uC790\uB3D9\uD654\uB41C \uACB0\uC815\uC5D0 \uAD00\uD55C \uC0AC\uD56D"),
                    React.createElement("p", null, "\uD68C\uC0AC\uC758 \uC5EC\uC6B8 \uC11C\uBE44\uC2A4\uB294 AI \uAE30\uBC18 \uC790\uB3D9\uD654\uB41C \uBD84\uC11D\uC744 \uD65C\uC6A9\uD569\uB2C8\uB2E4. \uB2E4\uB9CC \uBCF8 \uD648\uD398\uC774\uC9C0\uB97C \uD1B5\uD574 \uC218\uC9D1\uB418\uB294 \uBB38\uC758\u00B7\uCC44\uC6A9 \uC9C0\uC6D0 \uC815\uBCF4\uC5D0 \uB300\uD574\uC11C\uB294 \uC790\uB3D9\uD654\uB41C \uACB0\uC815\uC744 \uC801\uC6A9\uD558\uC9C0 \uC54A\uC73C\uBA70, \uB2F4\uB2F9\uC790\uAC00 \uC9C1\uC811 \uAC80\uD1A0\uD558\uC5EC \uC751\uB300\uD569\uB2C8\uB2E4.")),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C11\uC870 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638\uCC45\uC784\uC790"),
                    React.createElement("div", { className: "privacy-contact-box" },
                        React.createElement("div", { className: "row" },
                            React.createElement("span", { className: "k" }, "\uC131\uBA85"),
                            React.createElement("span", null, "\uD669\uC9C0\uD6C4")),
                        React.createElement("div", { className: "row" },
                            React.createElement("span", { className: "k" }, "\uC9C1\uCC45"),
                            React.createElement("span", null, "\uB300\uD45C")),
                        React.createElement("div", { className: "row" },
                            React.createElement("span", { className: "k" }, "\uC774\uBA54\uC77C"),
                            React.createElement("span", null, "watson@saegyeol.ai.kr"))),
                    React.createElement("p", { style: { marginTop: 12 } }, "\uC815\uBCF4\uC8FC\uCCB4\uB294 \uD68C\uC0AC\uC758 \uC11C\uBE44\uC2A4\uB97C \uC774\uC6A9\uD558\uC2DC\uBA74\uC11C \uBC1C\uC0DD\uD55C \uBAA8\uB4E0 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638 \uAD00\uB828 \uBB38\uC758, \uBD88\uB9CC\uCC98\uB9AC, \uD53C\uD574\uAD6C\uC81C \uB4F1\uC5D0 \uAD00\uD55C \uC0AC\uD56D\uC744 \uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638\uCC45\uC784\uC790\uC5D0\uAC8C \uBB38\uC758\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C12\uC870 \uC815\uBCF4\uC8FC\uCCB4\uC758 \uAD8C\uC775\uCE68\uD574\uC5D0 \uB300\uD55C \uAD6C\uC81C\uBC29\uBC95"),
                    React.createElement("p", null, "\uC815\uBCF4\uC8FC\uCCB4\uB294 \uAC1C\uC778\uC815\uBCF4\uCE68\uD574\uB85C \uC778\uD55C \uAD6C\uC81C\uB97C \uBC1B\uAE30 \uC704\uD558\uC5EC \uAC1C\uC778\uC815\uBCF4\uBD84\uC7C1\uC870\uC815\uC704\uC6D0\uD68C, \uD55C\uAD6D\uC778\uD130\uB137\uC9C4\uD765\uC6D0 \uAC1C\uC778\uC815\uBCF4\uCE68\uD574\uC2E0\uACE0\uC13C\uD130 \uB4F1\uC5D0 \uBD84\uC7C1\uD574\uACB0\uC774\uB098 \uC0C1\uB2F4 \uB4F1\uC744 \uC2E0\uCCAD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."),
                    React.createElement("ul", null,
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uAC1C\uC778\uC815\uBCF4\uCE68\uD574\uC2E0\uACE0\uC13C\uD130:"),
                            " (\uAD6D\uBC88\uC5C6\uC774) 118 / privacy.kisa.or.kr"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uAC1C\uC778\uC815\uBCF4\uBD84\uC7C1\uC870\uC815\uC704\uC6D0\uD68C:"),
                            " 1833-6972 / www.kopico.go.kr"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uB300\uAC80\uCC30\uCCAD \uC0AC\uC774\uBC84\uBC94\uC8C4\uC218\uC0AC\uB2E8:"),
                            " 02-3480-3573 / www.spo.go.kr"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uACBD\uCC30\uCCAD \uC0AC\uC774\uBC84\uC548\uC804\uAD6D:"),
                            " (\uAD6D\uBC88\uC5C6\uC774) 182 / cyberbureau.police.go.kr"))),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C13\uC870 \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68\uC758 \uBCC0\uACBD"),
                    React.createElement("p", null, "\uBCF8 \uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68\uC740 \uC2DC\uD589\uC77C\uB85C\uBD80\uD130 \uC801\uC6A9\uB418\uBA70, \uBC95\uB839 \uBC0F \uBC29\uCE68\uC5D0 \uB530\uB978 \uBCC0\uACBD \uB0B4\uC6A9\uC758 \uCD94\uAC00, \uC0AD\uC81C \uBC0F \uC815\uC815\uC774 \uC788\uB294 \uACBD\uC6B0\uC5D0\uB294 \uBCC0\uACBD\uC0AC\uD56D \uC2DC\uD589 7\uC77C \uC804\uBD80\uD130 \uD648\uD398\uC774\uC9C0 \uACF5\uC9C0\uC0AC\uD56D\uC744 \uD1B5\uD558\uC5EC \uACE0\uC9C0\uD569\uB2C8\uB2E4."))))));
}
function TermsPage() {
    return (React.createElement("main", { className: "privacy-page" },
        React.createElement("div", { className: "container" },
            React.createElement("div", { className: "privacy-header" },
                React.createElement("span", { className: "label" }, "LEGAL"),
                React.createElement("h1", null, "\uC774\uC6A9\uC57D\uAD00"),
                React.createElement("p", { className: "privacy-meta" }, "\uC2DC\uD589\uC77C: 2026\uB144 5\uC6D4 24\uC77C")),
            React.createElement("div", { className: "privacy-body" },
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("p", null, "\uBCF8 \uC57D\uAD00\uC740 \uC0C8\uACB0(Saegyeol, \uC774\uD558 \"\uD68C\uC0AC\")\uC774 \uC6B4\uC601\uD558\uB294 \uC6F9\uC0AC\uC774\uD2B8(\uC774\uD558 \"\uC0AC\uC774\uD2B8\")\uB97C \uC774\uC6A9\uD568\uC5D0 \uC788\uC5B4 \uD68C\uC0AC\uC640 \uC774\uC6A9\uC790 \uAC04\uC758 \uAD8C\uB9AC\u00B7\uC758\uBB34 \uBC0F \uCC45\uC784\uC0AC\uD56D\uC744 \uADDC\uC815\uD568\uC744 \uBAA9\uC801\uC73C\uB85C \uD569\uB2C8\uB2E4.")),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C1\uC870 \uC6A9\uC5B4 \uC815\uC758"),
                    React.createElement("ul", null,
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uD68C\uC0AC:"),
                            " \uC0C8\uACB0(Saegyeol)"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uC0AC\uC774\uD2B8:"),
                            " \uD68C\uC0AC\uAC00 \uC6B4\uC601\uD558\uB294 \uD648\uD398\uC774\uC9C0"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uC774\uC6A9\uC790:"),
                            " \uC0AC\uC774\uD2B8\uC5D0 \uC811\uC18D\uD558\uC5EC \uBCF8 \uC57D\uAD00\uC5D0 \uB530\uB77C \uC11C\uBE44\uC2A4\uB97C \uC774\uC6A9\uD558\uB294 \uBAA8\uB4E0 \uC790"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uC11C\uBE44\uC2A4:"),
                            " \uD68C\uC0AC\uAC00 \uC0AC\uC774\uD2B8\uB97C \uD1B5\uD574 \uC81C\uACF5\uD558\uB294 \uC81C\uD488 \uC18C\uAC1C, \uBB38\uC758 \uC811\uC218, \uCC44\uC6A9 \uC9C0\uC6D0 \uB4F1 \uC77C\uCCB4\uC758 \uAE30\uB2A5"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uBB38\uC758\uC790:"),
                            " \uC0AC\uC774\uD2B8 \uB0B4 \uBB38\uC758 \uD3FC\uC744 \uD1B5\uD574 \uC11C\uBE44\uC2A4 \uB3C4\uC785 \uBB38\uC758\uB97C \uC81C\uCD9C\uD55C \uC790"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "\uC9C0\uC6D0\uC790:"),
                            " \uC0AC\uC774\uD2B8 \uB0B4 \uCC44\uC6A9 \uC9C0\uC6D0 \uD3FC\uC744 \uD1B5\uD574 \uC9C0\uC6D0\uC11C\uB97C \uC81C\uCD9C\uD55C \uC790"))),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C2\uC870 \uC57D\uAD00\uC758 \uD6A8\uB825 \uBC0F \uBCC0\uACBD"),
                    React.createElement("ul", null,
                        React.createElement("li", null, "\uBCF8 \uC57D\uAD00\uC740 \uC0AC\uC774\uD2B8\uC5D0 \uAC8C\uC2DC\uD568\uC73C\uB85C\uC368 \uD6A8\uB825\uC774 \uBC1C\uC0DD\uD569\uB2C8\uB2E4."),
                        React.createElement("li", null, "\uC774\uC6A9\uC790\uAC00 \uC0AC\uC774\uD2B8\uB97C \uC774\uC6A9\uD568\uC73C\uB85C\uC368 \uBCF8 \uC57D\uAD00\uC5D0 \uB3D9\uC758\uD55C \uAC83\uC73C\uB85C \uAC04\uC8FC\uD569\uB2C8\uB2E4."),
                        React.createElement("li", null, "\uD68C\uC0AC\uB294 \u300C\uC57D\uAD00\uC758 \uADDC\uC81C\uC5D0 \uAD00\uD55C \uBC95\uB960\u300D \uB4F1 \uAD00\uB828 \uBC95\uB839\uC744 \uC704\uBC18\uD558\uC9C0 \uC54A\uB294 \uBC94\uC704\uC5D0\uC11C \uBCF8 \uC57D\uAD00\uC744 \uBCC0\uACBD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."),
                        React.createElement("li", null, "\uC57D\uAD00 \uBCC0\uACBD \uC2DC \uC2DC\uD589 7\uC77C \uC804 \uC0AC\uC774\uD2B8 \uACF5\uC9C0\uC0AC\uD56D\uC744 \uD1B5\uD574 \uACE0\uC9C0\uD558\uBA70, \uBCC0\uACBD \uD6C4 \uACC4\uC18D \uC774\uC6A9 \uC2DC \uBCC0\uACBD\uB41C \uC57D\uAD00\uC5D0 \uB3D9\uC758\uD55C \uAC83\uC73C\uB85C \uBD05\uB2C8\uB2E4."))),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C3\uC870 \uC11C\uBE44\uC2A4 \uC81C\uACF5"),
                    React.createElement("p", null, "\uD68C\uC0AC\uB294 \uB2E4\uC74C\uC758 \uC11C\uBE44\uC2A4\uB97C \uC81C\uACF5\uD569\uB2C8\uB2E4."),
                    React.createElement("ul", null,
                        React.createElement("li", null, "\uC5EC\uC6B8 \uC81C\uD488 \uC18C\uAC1C \uBC0F \uAD00\uB828 \uC815\uBCF4 \uC81C\uACF5"),
                        React.createElement("li", null, "\uC11C\uBE44\uC2A4 \uB3C4\uC785 \uBB38\uC758 \uC811\uC218 \uBC0F CS \uC751\uB300"),
                        React.createElement("li", null, "\uCC44\uC6A9 \uC9C0\uC6D0 \uC811\uC218 \uBC0F \uC804\uD615 \uC9C4\uD589")),
                    React.createElement("p", { style: { marginTop: 12 } }, "\uC11C\uBE44\uC2A4\uB294 \uC5F0\uC911\uBB34\uD734 24\uC2DC\uAC04 \uC81C\uACF5\uC744 \uC6D0\uCE59\uC73C\uB85C \uD558\uB098, \uC2DC\uC2A4\uD15C \uC810\uAC80\u00B7\uC7A5\uC560\u00B7\uCC9C\uC7AC\uC9C0\uBCC0 \uB4F1\uC758 \uC0AC\uC720\uB85C \uC77C\uC2DC \uC911\uB2E8\uB420 \uC218 \uC788\uC73C\uBA70, \uC774 \uACBD\uC6B0 \uC0AC\uC804 \uB610\uB294 \uC0AC\uD6C4\uC5D0 \uACF5\uC9C0\uD569\uB2C8\uB2E4.")),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C4\uC870 \uC774\uC6A9\uC790\uC758 \uC758\uBB34"),
                    React.createElement("p", null, "\uC774\uC6A9\uC790\uB294 \uB2E4\uC74C \uD589\uC704\uB97C \uD558\uC5EC\uC11C\uB294 \uC548 \uB429\uB2C8\uB2E4."),
                    React.createElement("ul", null,
                        React.createElement("li", null, "\uBB38\uC758 \uD3FC \uB610\uB294 \uCC44\uC6A9 \uC9C0\uC6D0 \uD3FC\uC5D0 \uD5C8\uC704 \uC815\uBCF4\uB97C \uC785\uB825\uD558\uB294 \uD589\uC704"),
                        React.createElement("li", null, "\uD68C\uC0AC \uB610\uB294 \uC81C3\uC790\uC758 \uC9C0\uC2DD\uC7AC\uC0B0\uAD8C\u00B7\uBA85\uC608\u00B7\uC2E0\uC6A9\uC744 \uCE68\uD574\uD558\uB294 \uD589\uC704"),
                        React.createElement("li", null, "\uC0AC\uC774\uD2B8\uC758 \uC815\uC0C1\uC801\uC778 \uC6B4\uC601\uC744 \uBC29\uD574\uD558\uAC70\uB098 \uC11C\uBC84\uC5D0 \uACFC\uBD80\uD558\uB97C \uC8FC\uB294 \uD589\uC704"),
                        React.createElement("li", null, "\uC545\uC131\uCF54\uB4DC\u00B7\uBC14\uC774\uB7EC\uC2A4\uB97C \uC720\uD3EC\uD558\uAC70\uB098 \uD574\uD0B9\uC744 \uC2DC\uB3C4\uD558\uB294 \uD589\uC704"),
                        React.createElement("li", null, "\uAE30\uD0C0 \uAD00\uB828 \uBC95\uB839 \uB610\uB294 \uACF5\uACF5\uC9C8\uC11C\uB97C \uC704\uBC18\uD558\uB294 \uD589\uC704"))),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C5\uC870 \uD68C\uC0AC\uC758 \uC758\uBB34"),
                    React.createElement("ul", null,
                        React.createElement("li", null, "\uD68C\uC0AC\uB294 \uC548\uC815\uC801\uC778 \uC11C\uBE44\uC2A4 \uC81C\uACF5\uC744 \uC704\uD574 \uCD5C\uC120\uC744 \uB2E4\uD569\uB2C8\uB2E4."),
                        React.createElement("li", null, "\uD68C\uC0AC\uB294 \uC774\uC6A9\uC790\uC758 \uAC1C\uC778\uC815\uBCF4\uB97C \uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68\uC5D0 \uB530\uB77C \uBCF4\uD638\uD569\uB2C8\uB2E4."),
                        React.createElement("li", null, "\uD68C\uC0AC\uB294 \uC774\uC6A9\uC790\uB85C\uBD80\uD130 \uC81C\uAE30\uB41C \uC758\uACAC\uC774\uB098 \uBD88\uB9CC\uC774 \uC815\uB2F9\uD558\uB2E4\uACE0 \uC778\uC815\uB420 \uACBD\uC6B0 \uC774\uB97C \uCC98\uB9AC\uD558\uBA70, \uCC98\uB9AC \uACB0\uACFC\uB97C \uC774\uBA54\uC77C \uB4F1\uC744 \uD1B5\uD574 \uC548\uB0B4\uD569\uB2C8\uB2E4."))),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C6\uC870 \uC9C0\uC2DD\uC7AC\uC0B0\uAD8C"),
                    React.createElement("ul", null,
                        React.createElement("li", null, "\uC0AC\uC774\uD2B8\uC5D0 \uAC8C\uC2DC\uB41C \uBAA8\uB4E0 \uCF58\uD150\uCE20(\uD14D\uC2A4\uD2B8, \uC774\uBBF8\uC9C0, \uB85C\uACE0, \uB514\uC790\uC778, \uCF54\uB4DC \uB4F1)\uC758 \uC9C0\uC2DD\uC7AC\uC0B0\uAD8C\uC740 \uD68C\uC0AC\uC5D0 \uADC0\uC18D\uB429\uB2C8\uB2E4."),
                        React.createElement("li", null, "\uC774\uC6A9\uC790\uB294 \uD68C\uC0AC\uC758 \uC0AC\uC804 \uC11C\uBA74 \uB3D9\uC758 \uC5C6\uC774 \uC774\uB97C \uBCF5\uC81C\u00B7\uBC30\uD3EC\u00B7\uC218\uC815\u00B7\uC804\uC1A1\uD558\uAC70\uB098 \uC0C1\uC5C5\uC801\uC73C\uB85C \uC774\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."),
                        React.createElement("li", null, "\uC774\uC6A9\uC790\uAC00 \uC0AC\uC774\uD2B8\uC5D0 \uC81C\uCD9C\uD55C \uBB38\uC758 \uB0B4\uC6A9 \uBC0F \uD3EC\uD2B8\uD3F4\uB9AC\uC624\uC758 \uC800\uC791\uAD8C\uC740 \uD574\uB2F9 \uC774\uC6A9\uC790\uC5D0\uAC8C \uADC0\uC18D\uB429\uB2C8\uB2E4. \uB2E4\uB9CC \uD68C\uC0AC\uB294 CS \uC751\uB300 \uBC0F \uCC44\uC6A9 \uC804\uD615 \uBAA9\uC801\uC73C\uB85C \uC774\uB97C \uC5F4\uB78C\u00B7\uD65C\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."))),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C7\uC870 \uBA74\uCC45 \uC870\uD56D"),
                    React.createElement("p", null, "\uD68C\uC0AC\uB294 \uB2E4\uC74C\uC758 \uACBD\uC6B0 \uC11C\uBE44\uC2A4 \uC81C\uACF5\uC5D0 \uAD00\uD55C \uCC45\uC784\uC744 \uC9C0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."),
                    React.createElement("ul", null,
                        React.createElement("li", null, "\uCC9C\uC7AC\uC9C0\uBCC0, \uC804\uC7C1, \uD574\uD0B9 \uB4F1 \uBD88\uAC00\uD56D\uB825\uC801 \uC0AC\uC720\uB85C \uC778\uD55C \uC11C\uBE44\uC2A4 \uC911\uB2E8"),
                        React.createElement("li", null, "\uC774\uC6A9\uC790\uC758 \uADC0\uCC45\uC0AC\uC720\uB85C \uC778\uD55C \uC11C\uBE44\uC2A4 \uC774\uC6A9 \uC7A5\uC560"),
                        React.createElement("li", null, "\uC774\uC6A9\uC790\uAC00 \uC0AC\uC774\uD2B8\uB97C \uD1B5\uD574 \uCDE8\uB4DD\uD55C \uC815\uBCF4\uB97C \uAE30\uBC18\uC73C\uB85C \uD55C \uD22C\uC790\u00B7\uACC4\uC57D \uB4F1\uC758 \uACB0\uACFC")),
                    React.createElement("ul", { style: { marginTop: 12 } },
                        React.createElement("li", null, "\uD68C\uC0AC\uB294 \uC774\uC6A9\uC790\uAC00 \uC0AC\uC774\uD2B8\uC5D0 \uAC8C\uC2DC\uD55C \uC815\uBCF4\uC758 \uC815\uD655\uC131\uC5D0 \uB300\uD574 \uCC45\uC784\uC744 \uC9C0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."),
                        React.createElement("li", null, "\uD68C\uC0AC\uB294 \uC774\uC6A9\uC790 \uAC04 \uB610\uB294 \uC774\uC6A9\uC790\uC640 \uC81C3\uC790 \uAC04\uC5D0 \uC0AC\uC774\uD2B8\uB97C \uB9E4\uAC1C\uB85C \uBC1C\uC0DD\uD55C \uBD84\uC7C1\uC5D0 \uB300\uD574 \uAC1C\uC785\uD558\uAC70\uB098 \uCC45\uC784\uC744 \uC9C0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."))),
                React.createElement("section", { className: "privacy-section" },
                    React.createElement("h2", null, "\uC81C8\uC870 \uC900\uAC70\uBC95 \uBC0F \uAD00\uD560\uBC95\uC6D0"),
                    React.createElement("ul", null,
                        React.createElement("li", null, "\uBCF8 \uC57D\uAD00\uC740 \uB300\uD55C\uBBFC\uAD6D \uBC95\uB960\uC5D0 \uB530\uB77C \uD574\uC11D\uB429\uB2C8\uB2E4."),
                        React.createElement("li", null, "\uC11C\uBE44\uC2A4 \uC774\uC6A9\uACFC \uAD00\uB828\uD558\uC5EC \uBD84\uC7C1\uC774 \uBC1C\uC0DD\uD55C \uACBD\uC6B0 \uBD80\uC0B0\uC9C0\uBC29\uBC95\uC6D0 \uB3D9\uBD80\uC9C0\uC6D0\uC744 \uC804\uC18D \uAD00\uD560\uBC95\uC6D0\uC73C\uB85C \uD569\uB2C8\uB2E4.")))))));
}
function FeatureShadowPage({ setRoute }) {
    const goContact = () => {
        setRoute("home");
        setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 60);
    };
    return (React.createElement("div", { "data-screen-label": "Feature: Shadow Agent" },
        React.createElement("section", { className: "page-hero" },
            React.createElement("div", { className: "hero-bg" }),
            React.createElement("div", { className: "container", style: { position: "relative" } },
                React.createElement("span", { className: "section-label" }, "CAPABILITY 01 \u00B7 SHADOW AGENT \uD0D0\uC9C0"),
                React.createElement("h1", null,
                    "\uBCF4\uC548\uD300\uB3C4 \uBAA8\uB974\uB294",
                    React.createElement("br", null),
                    "AI \uC5D0\uC774\uC804\uD2B8\uB97C",
                    React.createElement("br", null),
                    "\uBA3C\uC800 \uCC3E\uC544\uB0C5\uB2C8\uB2E4."),
                React.createElement("p", null, "\uC784\uC9C1\uC6D0\uC774 \uC0AC\uB0B4 \uB370\uC774\uD130\uB85C \uB9CC\uB4E0 \uAC1C\uC778 AI \uC5D0\uC774\uC804\uD2B8\uB294 IT\u00B7\uBCF4\uC548\uD300\uC758 \uAC00\uC2DC\uAD8C \uBC16\uC5D0\uC11C \uC791\uB3D9\uD569\uB2C8\uB2E4. \uC5EC\uC6B8\uC740 \uB124\uD2B8\uC6CC\uD06C \uD2B8\uB798\uD53D\uACFC MCP \uC5F0\uACB0 \uD328\uD134\uC744 \uBD84\uC11D\uD574 Shadow Agent\uB97C \uC790\uB3D9\uC73C\uB85C \uC2DD\uBCC4\uD558\uACE0 \uB370\uC774\uD130 \uB178\uCD9C \uC704\uD5D8\uB3C4\uB97C \uD3C9\uAC00\uD569\uB2C8\uB2E4."),
                React.createElement("div", { className: "hero-cta", style: { marginTop: 36 } },
                    React.createElement("button", { className: "btn btn-accent", onClick: goContact },
                        "\uB3C4\uC785 \uBB38\uC758\uD558\uAE30 ",
                        React.createElement("span", { className: "arrow" }, "\u2192")),
                    React.createElement("button", { className: "btn btn-ghost", onClick: () => { setRoute("product"); window.scrollTo({ top: 0 }); } },
                        "\uC5EC\uC6B8 \uC804\uCCB4 \uBCF4\uAE30 ",
                        React.createElement("span", { className: "arrow" }, "\u2192"))))),
        React.createElement("section", { className: "block" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "THE PROBLEM"),
                    React.createElement("h2", null,
                        "AI \uC5D0\uC774\uC804\uD2B8 \uC704\uD611\uC758",
                        React.createElement("br", null),
                        "80%\uB294 \uB0B4\uBD80\uC5D0\uC11C \uC2DC\uC791\uB429\uB2C8\uB2E4."),
                    React.createElement("p", null, "\uC0DD\uC131\uD615 AI \uB3C4\uAD6C\uAC00 \uB300\uC911\uD654\uB418\uBA74\uC11C \uC784\uC9C1\uC6D0\uB4E4\uC740 \uBCF4\uC548 \uAC80\uD1A0 \uC5C6\uC774 \uC0AC\uB0B4 \uB370\uC774\uD130\uB97C \uC5F0\uACB0\uD55C \uAC1C\uC778 AI \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uAD6C\uCD95\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uC774 Shadow Agent\uB4E4\uC740 \uC2B9\uC778\uB418\uC9C0 \uC54A\uC740 \uACBD\uB85C\uB85C \uACE0\uAC1D \uC815\uBCF4, \uB0B4\uBD80 \uCF54\uB4DC, \uAE08\uC735 \uB370\uC774\uD130\uB97C \uCC98\uB9AC\uD558\uACE0 \uC678\uBD80 LLM \uC11C\uBE44\uC2A4\uB85C \uC804\uC1A1\uD569\uB2C8\uB2E4.")),
                React.createElement("div", { className: "stats" },
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "73",
                            React.createElement("span", { className: "unit" }, "%")),
                        React.createElement("div", { className: "k" }, "\uC784\uC9C1\uC6D0\uC758 \uBE44\uC778\uAC00 AI \uB3C4\uAD6C \uC0AC\uC6A9\uB960")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "4.2",
                            React.createElement("span", { className: "unit" }, "\uBC30")),
                        React.createElement("div", { className: "k" }, "Shadow Agent \uACBD\uC720 \uB370\uC774\uD130 \uC720\uCD9C \uC704\uD5D8")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "3",
                            React.createElement("span", { className: "unit" }, "\uC885")),
                        React.createElement("div", { className: "k" }, "\uC8FC\uC694 Shadow Agent \uC720\uD615")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "18",
                            React.createElement("span", { className: "unit" }, "\uC77C")),
                        React.createElement("div", { className: "k" }, "\uD3C9\uADE0 \uD0D0\uC9C0 \uC9C0\uC5F0 (\uAE30\uC874 \uB3C4\uAD6C)"))))),
        React.createElement("section", { className: "block", style: { paddingTop: 0, borderTop: "none" } },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "SHADOW AGENT TYPES"),
                    React.createElement("h2", null, "\uC5B4\uB5A4 \uD615\uD0DC\uB85C \uC228\uC5B4\uC788\uB294\uAC00."),
                    React.createElement("p", null, "Shadow Agent\uB294 \uC138 \uAC00\uC9C0 \uC720\uD615\uC73C\uB85C \uBD84\uB958\uB429\uB2C8\uB2E4. \uAC01 \uC720\uD615\uC740 \uC11C\uB85C \uB2E4\uB978 \uACF5\uACA9 \uD45C\uBA74\uACFC \uB370\uC774\uD130 \uB178\uCD9C \uACBD\uB85C\uB97C \uAC00\uC9D1\uB2C8\uB2E4.")),
                React.createElement("div", { className: "cards" },
                    React.createElement("article", { className: "card" },
                        React.createElement("span", { className: "num" }, "TYPE A"),
                        React.createElement("div", { className: "ico" },
                            React.createElement(Icon.shadow, null)),
                        React.createElement("h3", null, "\uC678\uBD80 LLM \uC5F0\uACB0\uD615"),
                        React.createElement("p", null, "ChatGPT GPTs, Claude Projects, Gemini Gems \uB4F1\uC5D0 \uC0AC\uB0B4 \uBB38\uC11C\u00B7\uCF54\uB4DC\u00B7DB \uCFFC\uB9AC \uACB0\uACFC\uB97C \uC9C1\uC811 \uBD99\uC5EC\uB123\uAC70\uB098 API\uB85C \uC5F0\uACB0\uD558\uB294 \uD615\uD0DC. \uC0AC\uB0B4 IP\u00B7\uAE30\uBC00 \uCF54\uB4DC\u00B7\uACE0\uAC1D \uB370\uC774\uD130\uAC00 \uC678\uBD80 LLM \uD559\uC2B5 \uD30C\uC774\uD504\uB77C\uC778\uC5D0 \uC720\uC785\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")),
                    React.createElement("article", { className: "card" },
                        React.createElement("span", { className: "num" }, "TYPE B"),
                        React.createElement("div", { className: "ico" },
                            React.createElement(Icon.inject, null)),
                        React.createElement("h3", null, "MCP \uC790\uCCB4 \uC11C\uBC84\uD615"),
                        React.createElement("p", null, "\uC784\uC9C1\uC6D0\uC774 \uB85C\uCEEC \uB610\uB294 \uD300 \uC11C\uBC84\uC5D0 \uBE44\uC778\uAC00 MCP \uC11C\uBC84\uB97C \uAD6C\uCD95\uD574 \uC0AC\uB0B4 \uD30C\uC77C \uC2DC\uC2A4\uD15C\u00B7Slack\u00B7GitHub\u00B7DB\uC5D0 \uC5D0\uC774\uC804\uD2B8 \uC811\uADFC \uAD8C\uD55C\uC744 \uBD80\uC5EC\uD558\uB294 \uD615\uD0DC. MCP \uD504\uB85C\uD1A0\uCF5C \uD2B9\uC131\uC0C1 \uAD8C\uD55C \uACBD\uACC4\uAC00 \uB290\uC2A8\uD574 \uCE21\uBA74 \uC774\uB3D9(Lateral Movement)\uC774 \uC6A9\uC774\uD569\uB2C8\uB2E4.")),
                    React.createElement("article", { className: "card" },
                        React.createElement("span", { className: "num" }, "TYPE C"),
                        React.createElement("div", { className: "ico" },
                            React.createElement(Icon.graph, null)),
                        React.createElement("h3", null, "\uC790\uB3D9\uD654 \uD30C\uC774\uD504\uB77C\uC778\uD615"),
                        React.createElement("p", null, "n8n, Zapier AI, Make \uB4F1 \uB178\uCF54\uB4DC \uC790\uB3D9\uD654 \uD50C\uB7AB\uD3FC\uC5D0 LLM \uB178\uB4DC\uB97C \uC0BD\uC785\uD574 \uC0AC\uB0B4 \uB370\uC774\uD130\uB97C \uC815\uAE30\uC801\uC73C\uB85C \uCC98\uB9AC\u00B7\uC694\uC57D\u00B7\uC804\uC1A1\uD558\uB294 \uD615\uD0DC. \uBC18\uBCF5 \uC2E4\uD589\uB418\uB294 \uD2B9\uC131\uC0C1 \uC9C0\uC18D\uC801\uC778 \uB370\uC774\uD130 \uC720\uCD9C \uACBD\uB85C\uAC00 \uB429\uB2C8\uB2E4."))))),
        React.createElement("section", { className: "block", id: "how-shadow-works" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "HOW WE DETECT \u00B7 03 STEPS"),
                    React.createElement("h2", null,
                        "\uC218\uB3D9 \uAC10\uC0AC \uC5C6\uC774",
                        React.createElement("br", null),
                        "\uC790\uB3D9\uC73C\uB85C \uD0D0\uC9C0\uD569\uB2C8\uB2E4."),
                    React.createElement("p", null, "\uC5EC\uC6B8\uC740 \uC5D0\uC774\uC804\uD2B8 \uC5F0\uACB0\uC744 \uC218\uB3D9\uC73C\uB85C \uC2E0\uACE0\uBC1B\uB294 \uBC29\uC2DD \uB300\uC2E0, \uD2B8\uB798\uD53D \uD328\uD134\uACFC MCP \uD578\uB4DC\uC170\uC774\uD06C\uB97C \uC790\uB3D9 \uBD84\uC11D\uD574 Shadow Agent\uB97C \uC2DD\uBCC4\uD569\uB2C8\uB2E4.")),
                React.createElement("div", { className: "flow" },
                    React.createElement("div", { className: "flow-step" },
                        React.createElement("span", { className: "step-num" }, "STEP 01"),
                        React.createElement("h4", null, "\uD2B8\uB798\uD53D \uD551\uAC70\uD504\uB9B0\uD305"),
                        React.createElement("p", null, "\uC678\uBD80 LLM API \uC5D4\uB4DC\uD3EC\uC778\uD2B8(OpenAI, Anthropic, Google \uB4F1)\uB85C \uD5A5\uD558\uB294 \uBE44\uC778\uAC00 \uD2B8\uB798\uD53D \uD328\uD134\uACFC MCP SSE/WebSocket \uD578\uB4DC\uC170\uC774\uD06C\uB97C \uC218\uB3D9 \uAC1C\uC785 \uC5C6\uC774 \uD0D0\uC9C0\uD569\uB2C8\uB2E4."),
                        React.createElement("div", { className: "terminal" }, "detect llm_api \u00B7 mcp_handshake \u00B7 sse_stream")),
                    React.createElement("div", { className: "flow-step" },
                        React.createElement("span", { className: "step-num" }, "STEP 02"),
                        React.createElement("h4", null, "\uD589\uB3D9 \uBD84\uB958 \uBC0F \uD398\uC774\uB85C\uB4DC \uBD84\uC11D"),
                        React.createElement("p", null, "\uD0D0\uC9C0\uB41C \uC5D0\uC774\uC804\uD2B8\uC758 \uB3C4\uAD6C \uD638\uCD9C \uD328\uD134(file_read, db_query, code_exec \uB4F1)\uACFC \uC804\uC1A1 \uD398\uC774\uB85C\uB4DC\uC5D0\uC11C \uBBFC\uAC10 \uB370\uC774\uD130 \uD3EC\uD568 \uC5EC\uBD80\uB97C \uBD84\uC11D\uD569\uB2C8\uB2E4."),
                        React.createElement("div", { className: "terminal" }, "classify tools \u00B7 scan payload \u00B7 tag pii")),
                    React.createElement("div", { className: "flow-step" },
                        React.createElement("span", { className: "step-num" }, "STEP 03"),
                        React.createElement("h4", null, "\uC704\uD5D8\uB3C4 \uD3C9\uAC00 \uBC0F \uBCF4\uACE0"),
                        React.createElement("p", null, "\uB370\uC774\uD130 \uBBFC\uAC10\uB3C4 \u00D7 \uB178\uCD9C \uD45C\uBA74 \u00D7 \uC0AC\uC6A9 \uBE48\uB3C4\uB97C \uAE30\uBC18\uC73C\uB85C \uC704\uD5D8\uB3C4 \uC810\uC218\uB97C \uC0B0\uCD9C\uD558\uACE0, \uB2F4\uB2F9\uC790 \uC2DD\uBCC4\uACFC \uD568\uAED8 \uB9AC\uD3EC\uD2B8\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4."),
                        React.createElement("div", { className: "terminal" }, "score risk \u00B7 identify owner \u00B7 report"))),
                React.createElement("div", { style: { marginTop: 56, display: "flex", justifyContent: "center" } },
                    React.createElement("button", { className: "btn btn-accent", onClick: goContact },
                        "Shadow Agent \uC810\uAC80 \uC694\uCCAD ",
                        React.createElement("span", { className: "arrow" }, "\u2192"))))),
        React.createElement(ClosingCTA, { onContact: goContact })));
}
function FeaturePiiPage({ setRoute }) {
    const goContact = () => {
        setRoute("home");
        setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 60);
    };
    const [selectedPii, setSelectedPii] = useState(null);
    const PII_LIST = [
        { num: "01", name: "주민등록번호", desc: "생년월일+성별+지역 조합 패턴, 체크섬 검증 포함", method: "형식 패턴과 체크섬을 함께 확인하고 주변 문맥에서 주민번호 여부를 재검증합니다.", action: "외부 전송 전에 차단하거나 900101-1****** 형태로 마스킹하고 사건 로그를 남깁니다.", sample: "900101-1******" },
        { num: "02", name: "외국인등록번호", desc: "A/B/C 유형 외국인 등록 번호 패턴 전체", method: "외국인등록번호의 자리 구조와 검증 규칙을 적용하고 국적·체류 관련 문맥을 함께 확인합니다.", action: "탐지된 값은 정책에 따라 차단·마스킹되며 발생 위치와 호출 도구를 기록합니다.", sample: "900101-5******" },
        { num: "03", name: "사업자등록번호", desc: "10자리 고유 패턴, 법인·개인사업자 모두 지원", method: "10자리 구조와 검증 규칙, 사업자·세금계산서 등 주변 키워드를 결합해 판정합니다.", action: "허용 목록에 없는 사업자번호가 외부로 전송되면 차단하거나 부분 마스킹합니다.", sample: "123-45-*****" },
        { num: "04", name: "법인등록번호", desc: "13자리 법인 고유 식별 번호", method: "13자리 법인등록번호 형식과 법인·등기 관련 문맥을 함께 확인합니다.", action: "응답과 도구 호출 인자에서 식별되면 노출 범위를 기록하고 정책에 따라 제거합니다.", sample: "110111-0******" },
        { num: "05", name: "여권번호", desc: "한국 전자여권 알파뉴메릭 패턴", method: "전자여권의 영문·숫자 조합 형식과 여권·출입국 문맥을 결합해 오탐을 줄입니다.", action: "여권번호 전체가 노출되지 않도록 일부 문자만 남기고 마스킹하거나 전송을 중단합니다.", sample: "M12*****" },
        { num: "06", name: "운전면허번호", desc: "지역코드+생년+고유번호 구조 패턴", method: "지역 코드와 숫자 구분 구조를 확인하고 면허·운전자 관련 문맥으로 보강합니다.", action: "탐지 시 외부 LLM 또는 도구 호출 직전에 마스킹하고 감사 로그를 생성합니다.", sample: "11-12-******-**" },
        { num: "07", name: "건강보험증번호", desc: "요양기관기호 포함 복합 패턴", method: "건강보험·요양기관 문맥과 번호 구조를 함께 분석해 일반 숫자열과 구분합니다.", action: "민감 의료 문맥과 결합된 번호는 고위험 이벤트로 분류해 차단 및 알림 처리합니다.", sample: "***********" },
        { num: "08", name: "금융계좌번호", desc: "18개 국내 은행 계좌 형식 전체 지원", method: "은행별 길이와 구분자 패턴, 은행명·입금·송금 문맥을 함께 분석합니다.", action: "허용된 업무 흐름이 아니면 계좌번호를 마스킹하고 어떤 에이전트가 접근했는지 남깁니다.", sample: "123-****-****-01" },
        { num: "09", name: "신용·체크카드번호", desc: "Luhn 알고리즘 + 국내 카드사 BIN 패턴", method: "카드 번호 형식, Luhn 검증, 카드사 BIN 범위를 결합해 유효 가능성을 판단합니다.", action: "앞·뒤 일부만 남기고 마스킹하며 CVC·유효기간과 함께 발견되면 즉시 차단합니다.", sample: "1234-****-****-5678" },
        { num: "10", name: "한국식 전화번호", desc: "지역번호·휴대폰·인터넷전화 포맷 모두 포함", method: "하이픈 유무와 국가번호, 지역번호·휴대전화·인터넷전화 형식을 정규화해 탐지합니다.", action: "연락처 사용 목적과 정책에 따라 마스킹 또는 통과시키고 처리 이력을 남깁니다.", sample: "010-****-1234" },
        { num: "11", name: "한국식 주소", desc: "도로명·지번 주소 NLP 기반 추출", method: "시·도, 시·군·구, 도로명·지번, 건물·동호수 표현을 문장 단위로 추출합니다.", action: "상세 주소의 동·호수 등 식별성이 높은 부분을 우선 마스킹하고 전송 정책을 적용합니다.", sample: "부산광역시 해운대구 ○○로 **" },
        { num: "12", name: "이메일 주소", desc: "RFC 5322 + 한국 도메인 특화 패턴", method: "일반 이메일 형식과 한글 서비스에서 자주 쓰이는 도메인·변형 표기를 함께 정규화합니다.", action: "개인 이메일은 아이디 일부를 가리고, 업무상 허용된 도메인은 정책에 따라 통과시킬 수 있습니다.", sample: "us***@company.kr" },
        { num: "13", name: "의료·진단 정보", desc: "KCD 코드, 처방전 패턴, 진단서 키워드", method: "KCD 코드, 질환·처방·검사 결과 표현을 주변 환자 식별 정보와 함께 분석합니다.", action: "의료 정보는 높은 민감도로 분류해 기본 차단하며, 승인된 의료 업무 흐름만 예외 처리합니다.", sample: "진단 코드 · 처방 정보 · 검사 결과" },
        { num: "14", name: "생체 식별 정보", desc: "얼굴 벡터·지문 해시 등 비정형 생체정보 태그", method: "파일명·메타데이터·도구 인자와 생체정보 관련 태그를 분석해 비정형 데이터 흐름을 식별합니다.", action: "원본 또는 특징값의 외부 전송을 막고 접근 주체·도구·대상 엔드포인트를 기록합니다.", sample: "face_embedding · fingerprint_hash" },
    ];
    useEffect(() => {
        if (!selectedPii)
            return;
        const onKey = (event) => { if (event.key === "Escape")
            setSelectedPii(null); };
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = previous;
        };
    }, [selectedPii]);
    return (React.createElement("div", { "data-screen-label": "Feature: K-PII" },
        React.createElement("section", { className: "page-hero" },
            React.createElement("div", { className: "hero-bg" }),
            React.createElement("div", { className: "container", style: { position: "relative" } },
                React.createElement("span", { className: "section-label" }, "CAPABILITY 02 \u00B7 K-PII \uCC28\uB2E8"),
                React.createElement("h1", null,
                    "\uD55C\uAD6D\uC2DD \uAC1C\uC778\uC815\uBCF4",
                    React.createElement("br", null),
                    "14\uC885, \uC720\uCD9C \uC804\uC5D0",
                    React.createElement("br", null),
                    "\uB9C9\uC2B5\uB2C8\uB2E4."),
                React.createElement("p", null, "\uAD6D\uC81C LLM \uBCF4\uC548 \uB3C4\uAD6C\uB294 \uD55C\uAD6D\uC2DD \uC8FC\uBBFC\uBC88\uD638\u00B7\uC0AC\uC5C5\uC790\uBC88\uD638\u00B7\uC6B4\uC804\uBA74\uD5C8\uBC88\uD638\u00B7\uD55C\uAD6D\uC2DD \uC8FC\uC18C\uB97C \uC81C\uB300\uB85C \uC2DD\uBCC4\uD558\uC9C0 \uBABB\uD569\uB2C8\uB2E4. \uC5EC\uC6B8\uC758 K-PII \uD0D0\uC9C0\uAE30\uB294 \uD55C\uAD6D \uAC1C\uC778\uC815\uBCF4 14\uC885\uC744 \uC804\uC6A9 \uD328\uD134\uACFC \uCEE8\uD14D\uC2A4\uD2B8 \uC778\uC2DD ML \uBAA8\uB378\uB85C \uC2E4\uC2DC\uAC04 \uD0D0\uC9C0\uD558\uACE0, \uC5D0\uC774\uC804\uD2B8\uAC00 \uC678\uBD80\uB85C \uC804\uC1A1\uD558\uAE30 \uC804\uC5D0 \uCC28\uB2E8\uD569\uB2C8\uB2E4."),
                React.createElement("div", { className: "hero-cta", style: { marginTop: 36 } },
                    React.createElement("button", { className: "btn btn-accent", onClick: goContact },
                        "\uB3C4\uC785 \uBB38\uC758\uD558\uAE30 ",
                        React.createElement("span", { className: "arrow" }, "\u2192")),
                    React.createElement("button", { className: "btn btn-ghost", onClick: () => { setRoute("product"); window.scrollTo({ top: 0 }); } },
                        "\uC5EC\uC6B8 \uC804\uCCB4 \uBCF4\uAE30 ",
                        React.createElement("span", { className: "arrow" }, "\u2192"))))),
        React.createElement("section", { className: "block" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "WHY KOREAN-SPECIFIC"),
                    React.createElement("h2", null,
                        "\uAD6D\uC81C \uB3C4\uAD6C\uAC00 \uB193\uCE58\uB294",
                        React.createElement("br", null),
                        "\uD55C\uAD6D \uAC1C\uC778\uC815\uBCF4\uC758 \uAD6C\uC870."),
                    React.createElement("p", null, "\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638\uB294 \uC0DD\uB144\uC6D4\uC77C\u00B7\uC131\uBCC4\u00B7\uC9C0\uC5ED\uCF54\uB4DC\uB97C \uC870\uD569\uD55C \uACE0\uC720 \uAD6C\uC870\uB97C \uAC00\uC9C0\uBA70, \uD55C\uAD6D\uC2DD \uC8FC\uC18C\uB294 \uB3C4\uB85C\uBA85\u00B7\uC9C0\uBC88\u00B7\uB3D9\uD638\uC218\uC758 \uBCF5\uD569 \uD45C\uD604\uC774 \uD63C\uC7AC\uD569\uB2C8\uB2E4. \uACC4\uC88C\uBC88\uD638\uB294 18\uAC1C \uC740\uD589\uBCC4 \uD615\uC2DD\uC774 \uB2E4\uB974\uACE0, \uC758\uB8CC \uC815\uBCF4\uB294 \uD55C\uAD6D\uD615 \uC9C4\uB2E8 \uCF54\uB4DC(KCD)\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4. \uC774\uB97C \uC815\uD655\uD788 \uD0D0\uC9C0\uD558\uB824\uBA74 \uD55C\uAD6D\uC5B4 \uC804\uC6A9 \uD328\uD134\uACFC \uBB38\uB9E5 \uC774\uD574\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.")),
                React.createElement("div", { className: "stats" },
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "14",
                            React.createElement("span", { className: "unit" }, "\uC885")),
                        React.createElement("div", { className: "k" }, "\uD55C\uAD6D\uC2DD PII \uCE74\uD14C\uACE0\uB9AC")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "99.1",
                            React.createElement("span", { className: "unit" }, "%")),
                        React.createElement("div", { className: "k" }, "\uC8FC\uBBFC\uBC88\uD638 \uD0D0\uC9C0 \uC815\uD655\uB3C4")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "18",
                            React.createElement("span", { className: "unit" }, "\uAC1C")),
                        React.createElement("div", { className: "k" }, "\uC9C0\uC6D0 \uAD6D\uB0B4 \uC740\uD589 \uACC4\uC88C \uD328\uD134")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "<2",
                            React.createElement("span", { className: "unit" }, "ms")),
                        React.createElement("div", { className: "k" }, "\uC2E4\uC2DC\uAC04 \uD0D0\uC9C0 \uC9C0\uC5F0"))))),
        React.createElement("section", { className: "block", style: { paddingTop: 0, borderTop: "none" } },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "COVERAGE \u00B7 14 CATEGORIES"),
                    React.createElement("h2", null, "\uD0D0\uC9C0 \uB300\uC0C1 14\uC885.")),
                React.createElement("div", { className: "info-card-grid" }, PII_LIST.map(p => (React.createElement("button", { key: p.num, type: "button", className: "info-card", onClick: () => setSelectedPii(p), "aria-label": `${p.name} 상세 설명 보기` },
                    React.createElement("span", { className: "info-card-num" }, p.num),
                    React.createElement("strong", null, p.name),
                    React.createElement("span", { className: "info-card-desc" }, p.desc),
                    React.createElement("span", { className: "info-card-more" },
                        "\uC0C1\uC138 \uC124\uBA85 \uBCF4\uAE30 ",
                        React.createElement("span", { "aria-hidden": "true" }, "\u2192")))))),
                React.createElement("p", { className: "info-grid-hint" }, "\uAC01 \uD56D\uBAA9\uC744 \uD074\uB9AD\uD558\uBA74 \uD0D0\uC9C0 \uBC29\uC2DD\uACFC \uCC98\uB9AC \uC608\uC2DC\uB97C \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."))),
        selectedPii && (React.createElement("div", { className: "detail-modal-backdrop", role: "presentation", onMouseDown: (e) => { if (e.target === e.currentTarget)
                setSelectedPii(null); } },
            React.createElement("section", { className: "detail-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "pii-detail-title" },
                React.createElement("button", { className: "detail-modal-close", type: "button", onClick: () => setSelectedPii(null), "aria-label": "\uC0C1\uC138 \uC124\uBA85 \uB2EB\uAE30" }, "\u00D7"),
                React.createElement("span", { className: "section-label" },
                    "K-PII CATEGORY \u00B7 ",
                    selectedPii.num),
                React.createElement("h3", { id: "pii-detail-title" }, selectedPii.name),
                React.createElement("p", { className: "detail-modal-lead" }, selectedPii.desc),
                React.createElement("div", { className: "detail-modal-grid" },
                    React.createElement("div", null,
                        React.createElement("span", null, "\uD0D0\uC9C0 \uBC29\uC2DD"),
                        React.createElement("p", null, selectedPii.method)),
                    React.createElement("div", null,
                        React.createElement("span", null, "\uD0D0\uC9C0 \uD6C4 \uCC98\uB9AC"),
                        React.createElement("p", null, selectedPii.action))),
                React.createElement("div", { className: "detail-sample" },
                    React.createElement("span", null, "\uB9C8\uC2A4\uD0B9\u00B7\uD45C\uAE30 \uC608\uC2DC"),
                    React.createElement("code", null, selectedPii.sample)),
                React.createElement("div", { className: "detail-modal-actions" },
                    React.createElement("button", { className: "btn btn-accent", onClick: goContact },
                        "\uAD00\uB828 \uC790\uB8CC \uBB38\uC758 ",
                        React.createElement("span", { className: "arrow" }, "\u2192")),
                    React.createElement("button", { className: "btn btn-ghost", onClick: () => setSelectedPii(null) }, "\uB2EB\uAE30"))))),
        React.createElement("section", { className: "block", id: "how-pii-works" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "DETECTION APPROACH"),
                    React.createElement("h2", null,
                        "\uD328\uD134 + ML + \uBB38\uB9E5 \uC778\uC2DD",
                        React.createElement("br", null),
                        "3\uB2E8 \uBC29\uC5B4 \uAD6C\uC870."),
                    React.createElement("p", null, "\uB2E8\uC21C \uC815\uADDC\uC2DD \uB9E4\uCE6D\uC744 \uB118\uC5B4, LLM \uC751\uB2F5 \uBB38\uB9E5 \uC804\uCCB4\uB97C \uBD84\uC11D\uD574 \uC704\uC7A5\uB41C PII\uC640 \uC790\uC5F0\uC5B4\uB85C \uC11C\uC220\uB41C \uAC1C\uC778\uC815\uBCF4\uB3C4 \uC7A1\uC544\uB0C5\uB2C8\uB2E4.")),
                React.createElement("div", { className: "flow" },
                    React.createElement("div", { className: "flow-step" },
                        React.createElement("span", { className: "step-num" }, "LAYER 01"),
                        React.createElement("h4", null, "\uC815\uADDC\uC2DD \uD328\uD134 \uB9E4\uCE6D"),
                        React.createElement("p", null, "\uC8FC\uBBFC\uBC88\uD638 \uCCB4\uD06C\uC12C\u00B7\uCE74\uB4DC Luhn \uC54C\uACE0\uB9AC\uC998\u00B7\uACC4\uC88C\uBC88\uD638 \uD615\uC2DD \uB4F1 \uAD6C\uC870\uC801\uC73C\uB85C \uAC80\uC99D \uAC00\uB2A5\uD55C \uD328\uD134\uC744 0ms \uC9C0\uC5F0\uC73C\uB85C 1\uCC28 \uD544\uD130\uB9C1\uD569\uB2C8\uB2E4."),
                        React.createElement("div", { className: "terminal" }, "regex \u00B7 checksum \u00B7 luhn \u00B7 bank_bin")),
                    React.createElement("div", { className: "flow-step" },
                        React.createElement("span", { className: "step-num" }, "LAYER 02"),
                        React.createElement("h4", null, "ML \uBD84\uB958 \uBAA8\uB378"),
                        React.createElement("p", null, "\uBB38\uB9E5 \uC5C6\uC774 \uC22B\uC790 \uB098\uC5F4\uB9CC\uC73C\uB85C\uB294 \uAD6C\uBD84\uD558\uAE30 \uC5B4\uB824\uC6B4 \uD328\uD134\uC744 \uD55C\uAD6D\uC5B4 NER \uBAA8\uB378\uC774 \uC8FC\uBCC0 \uBB38\uC7A5\uACFC \uD568\uAED8 \uD310\uB2E8\uD569\uB2C8\uB2E4. \uC624\uD0D0\uB960 2% \uBBF8\uB9CC."),
                        React.createElement("div", { className: "terminal" }, "ner \u00B7 context_window \u00B7 false_positive_filter")),
                    React.createElement("div", { className: "flow-step" },
                        React.createElement("span", { className: "step-num" }, "LAYER 03"),
                        React.createElement("h4", null, "\uC2E4\uC2DC\uAC04 \uCC28\uB2E8\u00B7\uB9C8\uC2A4\uD0B9"),
                        React.createElement("p", null, "\uD0D0\uC9C0\uB41C PII\uB97C \uC5D0\uC774\uC804\uD2B8 \uC751\uB2F5\uC5D0\uC11C \uC989\uC2DC \uC81C\uAC70\uD558\uAC70\uB098 \uB9C8\uC2A4\uD0B9 \uCC98\uB9AC\uD558\uACE0, \uC0AC\uAC74 \uB85C\uADF8\uC640 \uD568\uAED8 \uB2F4\uB2F9\uC790\uC5D0\uAC8C \uC54C\uB9BC\uC744 \uC804\uC1A1\uD569\uB2C8\uB2E4."),
                        React.createElement("div", { className: "terminal" }, "redact \u00B7 mask \u00B7 alert \u00B7 log_event"))),
                React.createElement("div", { style: { marginTop: 56, display: "flex", justifyContent: "center" } },
                    React.createElement("button", { className: "btn btn-accent", onClick: goContact },
                        "K-PII \uB3C4\uC785 \uBB38\uC758 ",
                        React.createElement("span", { className: "arrow" }, "\u2192"))))),
        React.createElement(ClosingCTA, { onContact: goContact })));
}
function FeatureReportPage({ setRoute }) {
    const goContact = () => {
        setRoute("home");
        setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 60);
    };
    const FRAMEWORKS = [
        { id: "01", name: "ISMS-P", full: "정보보호 및 개인정보보호 관리체계 인증", scope: "인증심사 대응" },
        { id: "02", name: "개인정보보호법", full: "개인정보 보호법 (2023년 개정)", scope: "법적 의무" },
        { id: "03", name: "금융보안원 AI 가이드", full: "금융분야 AI 보안 가이드라인", scope: "금융권 필수" },
        { id: "04", name: "금융위 AI 가이드", full: "금융분야 인공지능(AI) 활용 가이드라인", scope: "금융권 필수" },
        { id: "05", name: "NIST AI RMF", full: "NIST AI Risk Management Framework 1.0", scope: "글로벌 기준" },
        { id: "06", name: "ISO/IEC 42001", full: "AI Management System Standard", scope: "국제 인증" },
        { id: "07", name: "EU AI Act", full: "EU Artificial Intelligence Act", scope: "EU 서비스" },
        { id: "08", name: "K-ISMS", full: "국내 정보보호관리체계", scope: "공공·의무대상" },
    ];
    return (React.createElement("div", { "data-screen-label": "Feature: Compliance Report" },
        React.createElement("section", { className: "page-hero" },
            React.createElement("div", { className: "hero-bg" }),
            React.createElement("div", { className: "container", style: { position: "relative" } },
                React.createElement("span", { className: "section-label" }, "CAPABILITY 03 \u00B7 \uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4 \uB9AC\uD3EC\uD2B8"),
                React.createElement("h1", null,
                    "\uC775\uC2A4\uD50C\uB85C\uC787 PoC\uBD80\uD130",
                    React.createElement("br", null),
                    "\uBC95\uC801 \uADFC\uAC70\uAE4C\uC9C0,",
                    React.createElement("br", null),
                    "\uD55C \uBC88\uC5D0."),
                React.createElement("p", null, "\uC5EC\uC6B8\uC758 \uB9AC\uD3EC\uD2B8\uB294 \uBC1C\uACAC\uB41C \uCDE8\uC57D\uC810\uC744 ISMS-P\u00B7\uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uBC95\u00B7\uAE08\uC735 AI \uAC00\uC774\uB4DC\uB77C\uC778 \uB4F1 8\uAC1C \uAE30\uC900\uC5D0 \uC790\uB3D9 \uB9E4\uD551\uD569\uB2C8\uB2E4. \uBCF4\uC548\uD300\uC740 PoC\uB85C \uC7AC\uD604\uD558\uACE0, \uBC95\uBB34\u00B7\uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4\uD300\uC740 \uBC95\uC801 \uADFC\uAC70\uC640 \uC870\uCE58 \uAE30\uD55C\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."),
                React.createElement("div", { className: "hero-cta", style: { marginTop: 36 } },
                    React.createElement("button", { className: "btn btn-accent", onClick: goContact },
                        "\uB9AC\uD3EC\uD2B8 \uB3C4\uC785 \uBB38\uC758 ",
                        React.createElement("span", { className: "arrow" }, "\u2192")),
                    React.createElement("button", { className: "btn btn-ghost", onClick: () => { setRoute("product"); window.scrollTo({ top: 0 }); } },
                        "\uC5EC\uC6B8 \uC804\uCCB4 \uBCF4\uAE30 ",
                        React.createElement("span", { className: "arrow" }, "\u2192"))))),
        React.createElement("section", { className: "block" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "THE GAP"),
                    React.createElement("h2", null,
                        "\uBCF4\uC548 \uACB0\uACFC\uBB3C\uC774",
                        React.createElement("br", null),
                        "\uBC95\uBB34\uD300\uC5D0 \uB2FF\uC9C0 \uC54A\uB294 \uBB38\uC81C."),
                    React.createElement("p", null, "\uAE30\uC874 \uBAA8\uC758\uD574\uD0B9 \uB9AC\uD3EC\uD2B8\uB294 CVSS \uC810\uC218\uC640 \uAE30\uC220\uC801 \uC7AC\uD604 \uBC29\uBC95\uB9CC \uB2F4\uACA8\uC788\uC5B4, \uBC95\uBB34\u00B7\uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4\uD300\uC774 \uC774\uB97C \uBC95\uC801 \uC758\uBB34 \uC774\uD589\uC5D0 \uD65C\uC6A9\uD558\uAE30 \uC5B4\uB835\uC2B5\uB2C8\uB2E4. \uC5EC\uC6B8\uC740 \uB3D9\uC77C\uD55C \uCDE8\uC57D\uC810 \uB370\uC774\uD130\uB97C \uAE30\uC220\uC801 PoC\uC640 \uBC95\uC801 \uB9E4\uD551 \uB450 \uD615\uD0DC\uB85C \uB3D9\uC2DC\uC5D0 \uC0B0\uCD9C\uD569\uB2C8\uB2E4.")),
                React.createElement("div", { className: "stats" },
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "8",
                            React.createElement("span", { className: "unit" }, "\uAC1C")),
                        React.createElement("div", { className: "k" }, "\uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4 \uB9E4\uD551 \uAE30\uC900")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "100",
                            React.createElement("span", { className: "unit" }, "%")),
                        React.createElement("div", { className: "k" }, "\uD55C\uAD6D\uC5B4 \uB9AC\uD3EC\uD2B8 \uC81C\uACF5")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "2",
                            React.createElement("span", { className: "unit" }, "\uD3EC\uB9F7")),
                        React.createElement("div", { className: "k" }, "PDF + \uC6F9 \uB9AC\uD3EC\uD2B8 \uB3D9\uC2DC \uC0B0\uCD9C")),
                    React.createElement("div", { className: "item" },
                        React.createElement("div", { className: "v" },
                            "36",
                            React.createElement("span", { className: "unit" }, "\uBD84")),
                        React.createElement("div", { className: "k" }, "\uD3C9\uADE0 \uB9AC\uD3EC\uD2B8 \uC0DD\uC131 \uC2DC\uAC04"))))),
        React.createElement("section", { className: "block", style: { paddingTop: 0, borderTop: "none" } },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "SUPPORTED FRAMEWORKS \u00B7 08"),
                    React.createElement("h2", null, "\uB9E4\uD551 \uC9C0\uC6D0 \uAE30\uC900 8\uC885.")),
                React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 } }, FRAMEWORKS.map(f => (React.createElement("div", { key: f.id, style: {
                        background: "var(--card-bg)", border: "1px solid var(--border)",
                        borderRadius: 12, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 6
                    } },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                        React.createElement("span", { style: { fontFamily: '"JetBrains Mono",monospace', fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em" } }, f.id),
                        React.createElement("span", { style: { fontFamily: '"JetBrains Mono",monospace', fontSize: 10, color: "var(--text-2)", letterSpacing: "0.05em", textTransform: "uppercase", padding: "3px 8px", border: "1px solid var(--border)", borderRadius: 999 } }, f.scope)),
                    React.createElement("strong", { style: { fontSize: 15, color: "var(--text)", fontWeight: 600 } }, f.name),
                    React.createElement("span", { style: { fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 } }, f.full))))))),
        React.createElement("section", { className: "block", id: "report-structure" },
            React.createElement("div", { className: "container" },
                React.createElement("div", { className: "section-head" },
                    React.createElement("span", { className: "section-label" }, "REPORT STRUCTURE"),
                    React.createElement("h2", null, "\uB9AC\uD3EC\uD2B8 \uC548\uC5D0 \uB2F4\uAE30\uB294 \uAC83\uB4E4."),
                    React.createElement("p", null, "\uAE30\uC220\uD300\uACFC \uACBD\uC601\uC9C4\uC774 \uAC19\uC740 \uB9AC\uD3EC\uD2B8\uB85C \uC11C\uB85C \uB2E4\uB978 \uB9E5\uB77D\uC5D0\uC11C \uD544\uC694\uD55C \uC815\uBCF4\uB97C \uC5BB\uC744 \uC218 \uC788\uB3C4\uB85D \uAD6C\uC131\uB429\uB2C8\uB2E4.")),
                React.createElement("div", { className: "flow" },
                    React.createElement("div", { className: "flow-step" },
                        React.createElement("span", { className: "step-num" }, "SECTION A"),
                        React.createElement("h4", null, "\uC775\uC2A4\uD50C\uB85C\uC787 PoC"),
                        React.createElement("p", null, "\uBC1C\uACAC\uB41C \uCDE8\uC57D\uC810\uC744 \uC2E4\uC81C\uB85C \uC7AC\uD604\uD560 \uC218 \uC788\uB294 PoC \uCF54\uB4DC\u00B7\uD504\uB86C\uD504\uD2B8\u00B7API \uC694\uCCAD\uC744 \uC81C\uACF5\uD569\uB2C8\uB2E4. \uBCF4\uC548\uD300\uC774 \uACBD\uC601\uC9C4\uC5D0\uAC8C \uC704\uD5D8\uC744 \uC9C1\uC811 \uC2DC\uC5F0\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."),
                        React.createElement("div", { className: "terminal" }, "poc_prompt \u00B7 api_request \u00B7 replay_steps")),
                    React.createElement("div", { className: "flow-step" },
                        React.createElement("span", { className: "step-num" }, "SECTION B"),
                        React.createElement("h4", null, "\uBC95\uB839 \uB9E4\uD551 \uBC0F \uC704\uBC18 \uD56D\uBAA9"),
                        React.createElement("p", null, "\uAC01 \uCDE8\uC57D\uC810\uC774 ISMS-P\u00B7\uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uBC95 \uB4F1 \uC5B4\uB5A4 \uC870\uD56D\uC5D0 \uD574\uB2F9\uD558\uB294\uC9C0, \uACFC\uD0DC\uB8CC\u00B7\uD589\uC815\uCC98\uBD84 \uAE30\uC900\uACFC \uD568\uAED8 \uC815\uB9AC\uD569\uB2C8\uB2E4. \uBC95\uBB34\uD300\uC774 \uC989\uC2DC \uD65C\uC6A9 \uAC00\uB2A5\uD569\uB2C8\uB2E4."),
                        React.createElement("div", { className: "terminal" }, "isms_p_ctrl \u00B7 pipa_article \u00B7 penalty_ref")),
                    React.createElement("div", { className: "flow-step" },
                        React.createElement("span", { className: "step-num" }, "SECTION C"),
                        React.createElement("h4", null, "\uC6B0\uC120\uC21C\uC704 \uC870\uCE58 \uB85C\uB4DC\uB9F5"),
                        React.createElement("p", null, "\uC704\uD5D8\uB3C4\u00B7\uD53C\uD574 \uADDC\uBAA8\u00B7\uC870\uCE58 \uB09C\uC774\uB3C4\uB97C \uAE30\uBC18\uC73C\uB85C \uB2E8\uAE30\u00B7\uC911\uAE30\u00B7\uC7A5\uAE30 \uC870\uCE58 \uD56D\uBAA9\uC744 \uC6B0\uC120\uC21C\uC704\uD654\uD558\uC5EC \uC2E4\uD589 \uAC00\uB2A5\uD55C \uCCB4\uD06C\uB9AC\uC2A4\uD2B8\uB85C \uC81C\uACF5\uD569\uB2C8\uB2E4."),
                        React.createElement("div", { className: "terminal" }, "priority_high \u00B7 action_plan \u00B7 timeline"))),
                React.createElement("div", { style: { marginTop: 56, display: "flex", justifyContent: "center" } },
                    React.createElement("button", { className: "btn btn-accent", onClick: goContact },
                        "\uC0C1\uC138 \uC790\uB8CC \uBB38\uC758 ",
                        React.createElement("span", { className: "arrow" }, "\u2192"))))),
        React.createElement(ClosingCTA, { onContact: goContact })));
}
Object.assign(window, { FeatureShadowPage, FeaturePiiPage, FeatureReportPage });
const APP_ROUTES = [
    "home", "team", "product", "pricing", "privacy", "terms",
    "feature-shadow", "feature-pii", "feature-report"
];
function App() {
    const [theme, setTheme] = useTheme();
    const [route, setRoute] = useState(() => {
        const hash = (location.hash || "").replace("#", "");
        return APP_ROUTES.includes(hash) ? hash : "home";
    });
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
        if (location.hash !== nextHash)
            location.hash = route;
    }, [route]);
    useFullScroll(route);
    useReveal(route);
    useEffect(() => {
        const meta = {
            home: ["새결 | 한국어 AI 에이전트 보안", "한국어 AI 에이전트의 프롬프트 인젝션, MCP 권한, 개인정보 유출 위험을 점검하고 대응 리포트를 제공합니다."],
            team: ["팀 소개 | 새결", "한국어 AI 에이전트 보안을 연구하고 만드는 새결 팀을 소개합니다."],
            product: ["여울 | 한국어 AI 에이전트 침투 테스트", "한국어 AI 에이전트 시스템을 자동으로 점검하고 Exploit PoC와 컴플라이언스 리포트를 제공하는 여울을 소개합니다."],
            pricing: ["여울 요금제 | 새결", "무료, 프로, 프랜차이즈 플랜의 기능과 도입 방식을 비교합니다."],
            privacy: ["개인정보처리방침 | 새결", "새결 개인정보처리방침입니다."],
            terms: ["이용약관 | 새결", "새결 홈페이지 이용약관입니다."],
            "feature-shadow": ["Shadow Agent 탐지 | 여울", "사내 데이터에 접근하는 비인가 AI 에이전트를 발견하고 위험도를 평가합니다."],
            "feature-pii": ["K-PII 차단 | 여울", "주민등록번호, 사업자등록번호, 계좌번호 등 한국식 개인정보를 탐지하고 차단합니다."],
            "feature-report": ["컴플라이언스 리포트 | 여울", "발견된 취약점을 국내 보안 및 개인정보보호 기준에 매핑한 리포트를 제공합니다."],
        };
        const [title, description] = meta[route] || meta.home;
        document.title = title;
        document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    }, [route]);
    return (React.createElement(React.Fragment, null,
        React.createElement(Nav, { route: route, setRoute: setRoute, theme: theme, setTheme: setTheme }),
        route === "home" && React.createElement(HomePage, { setRoute: setRoute }),
        route === "team" && React.createElement(TeamPage, { setRoute: setRoute }),
        route === "product" && React.createElement(ProductPage, { setRoute: setRoute }),
        route === "pricing" && React.createElement(PricingPage, { setRoute: setRoute }),
        route === "privacy" && React.createElement(PrivacyPage, null),
        route === "terms" && React.createElement(TermsPage, null),
        route === "feature-shadow" && React.createElement(FeatureShadowPage, { setRoute: setRoute }),
        route === "feature-pii" && React.createElement(FeaturePiiPage, { setRoute: setRoute }),
        route === "feature-report" && React.createElement(FeatureReportPage, { setRoute: setRoute }),
        React.createElement(Footer, { setRoute: setRoute })));
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App, null));
