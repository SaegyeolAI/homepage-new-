function App() {
  const [theme, setTheme] = useTheme();
  const [route, setRoute] = useState(() => {
    const hash = (location.hash || "").replace("#", "");
    if (["home", "team", "product", "privacy", "terms", "feature-shadow", "feature-pii", "feature-report"].includes(hash)) return hash;
    return "home";
  });

  useEffect(() => { location.hash = route; }, [route]);

  return (
    <React.Fragment>
      <Nav route={route} setRoute={setRoute} theme={theme} setTheme={setTheme} />
      {route === "home" && <HomePage setRoute={setRoute} />}
      {route === "team" && <TeamPage setRoute={setRoute} />}
      {route === "product" && <ProductPage setRoute={setRoute} />}
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
