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

  // 법적 고지 페이지의 뒤로가기 버튼이 쓸 "직전 라우트".
  // 해시 라우팅이라 history.length로는 사이트 내부 진입인지 알 수 없어 직접 추적한다.
  // 링크로 바로 들어온 경우 null로 남고, 그때는 홈으로 보낸다.
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
      home: ["새결 | 한국어 AI 에이전트 보안", "여울은 AI 에이전트를 내보내기 전에 한국어로 공격을 넣어보고, 배포해도 되는지 판정합니다. 확인한 범위와 확인하지 못한 범위를 함께 알려드립니다."],
      team: ["팀 소개 | 새결", "한국어 AI 에이전트 보안을 연구하고 만드는 새결 팀을 소개합니다."],
      product: ["여울 | 한국어 AI 에이전트 침투 테스트", "조사와 어미를 바꿔가며 한국어로 공격해, 영어 기준 필터가 놓치는 구멍을 찾습니다. 재현 가능한 증거와 검사 범위를 함께 담은 리포트를 드립니다."],
      pricing: ["여울 요금제 | 새결", "무료, 프로, 프랜차이즈 플랜의 기능과 도입 방식을 비교합니다."],
      privacy: ["개인정보처리방침 | 새결", "새결 개인정보처리방침입니다."],
      terms: ["이용약관 | 새결", "새결 홈페이지 이용약관입니다."],
      "feature-shadow": ["Shadow Agent 탐지 | 여울", "사내 데이터에 접근하는 비인가 AI 에이전트를 발견하고 위험도를 평가합니다."],
      "feature-pii": ["K-PII 차단 | 여울", "주민등록번호, 사업자등록번호, 계좌번호 등 한국식 개인정보를 탐지하고 차단합니다."],
      "feature-report": ["증거 기반 리포트 | 여울", "취약점마다 재현 가능한 최소 증거를 담고, 표지에 이번 검사가 다룬 범위를 적은 PDF 리포트를 드립니다."],
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
      {route === "privacy" && <PrivacyPage onBack={goBack} />}
      {route === "terms" && <TermsPage onBack={goBack} />}
      {route === "feature-shadow" && <FeatureShadowPage setRoute={setRoute} />}
      {route === "feature-pii" && <FeaturePiiPage setRoute={setRoute} />}
      {route === "feature-report" && <FeatureReportPage setRoute={setRoute} />}
      <SectionDots route={route} />
      <Footer setRoute={setRoute} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
