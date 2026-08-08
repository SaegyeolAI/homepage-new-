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
    if (location.hash !== nextHash) location.hash = route;
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

  return (
    <React.Fragment>
      <Nav route={route} setRoute={setRoute} theme={theme} setTheme={setTheme} />
      {route === "home" && <HomePage setRoute={setRoute} />}
      {route === "team" && <TeamPage setRoute={setRoute} />}
      {route === "product" && <ProductPage setRoute={setRoute} />}
      {route === "pricing" && <PricingPage setRoute={setRoute} />}
      {route === "privacy" && <PrivacyPage />}
      {route === "terms" && <TermsPage />}
      {route === "feature-shadow" && <FeatureShadowPage setRoute={setRoute} />}
      {route === "feature-pii" && <FeaturePiiPage setRoute={setRoute} />}
      {route === "feature-report" && <FeatureReportPage setRoute={setRoute} />}
      <Footer setRoute={setRoute} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
