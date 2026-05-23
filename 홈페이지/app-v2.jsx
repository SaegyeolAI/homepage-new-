function App() {
  const [theme, setTheme] = useTheme();
  const [route, setRoute] = useState(() => {
    const hash = (location.hash || "").replace("#", "");
    if (["home", "team", "product", "privacy", "terms"].includes(hash)) return hash;
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
      <Footer setRoute={setRoute} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
