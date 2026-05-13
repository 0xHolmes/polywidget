import React, { useState, useEffect } from "react";

function formatOdds(price) {
  const p = parseFloat(price);
  if (isNaN(p)) return "50%";
  return (p * 100).toFixed(0) + "%";
}

function formatVolume(vol) {
  const v = parseFloat(vol) || 0;
  if (v >= 1000000) return "$" + (v / 1000000).toFixed(1) + "M";
  if (v >= 1000) return "$" + (v / 1000).toFixed(0) + "K";
  return "$" + v.toFixed(0);
}

function Widget({ market }) {
  const m = market.markets ? market.markets[0] : {};
  const prices = m.outcomePrices || ["0.5", "0.5"];
  const yesPrice = parseFloat(prices[0]) || 0.5;
  const noPrice = parseFloat(prices[1]) || 0.5;
  const volume = market.volume || m.volume || 0;
  const slug = market.slug || "";

  return (
    <div style={{ background: "#0a0f1e", border: "1px solid #1a2a4a", borderRadius: 14, padding: "18px 20px", fontFamily: "'Inter', system-ui, sans-serif", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,102,255,0.1)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00e676", boxShadow: "0 0 6px #00e676" }} />
          <span style={{ fontSize: 11, color: "#4a7aaa", letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>Live · Polymarket</span>
        </div>
        <span style={{ fontSize: 11, color: "#2a4a6a" }}>Vol: {formatVolume(volume)}</span>
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: "#e8edf5", lineHeight: 1.4, marginBottom: 16 }}>
        {market.title || market.question || "Loading..."}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#00e676" }}>YES</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#00e676" }}>{formatOdds(yesPrice)}</span>
          </div>
          <div style={{ background: "#0d1f35", borderRadius: 4, height: 8, overflow: "hidden" }}>
            <div style={{ width: (yesPrice * 100) + "%", height: "100%", background: "linear-gradient(90deg, #00e676, #00b359)", borderRadius: 4 }} />
          </div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#ff6b6b" }}>NO</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#ff6b6b" }}>{formatOdds(noPrice)}</span>
          </div>
          <div style={{ background: "#0d1f35", borderRadius: 4, height: 8, overflow: "hidden" }}>
            <div style={{ width: (noPrice * 100) + "%", height: "100%", background: "linear-gradient(90deg, #ff6b6b, #cc3333)", borderRadius: 4 }} />
          </div>
        </div>
      </div>

      <a href={"https://polymarket.com/event/" + slug} target="_blank" rel="noreferrer"
        style={{ display: "block", background: "linear-gradient(135deg, #0055ff, #0033cc)", color: "#fff", textAlign: "center", padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", letterSpacing: 0.5 }}>
        Trade on Polymarket
      </a>

      <div style={{ marginTop: 10, textAlign: "center", fontSize: 10, color: "#1e3050" }}>
        Powered by PolyWidget · Not financial advice
      </div>
    </div>
  );
}

function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      setLoading(true);
      fetch("/.netlify/functions/market?query=" + encodeURIComponent(query))
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (Array.isArray(data)) setResults(data.slice(0, 5));
          setLoading(false);
        })
        .catch(function() { setLoading(false); });
    }, 400);
    return function() { clearTimeout(t); };
  }, [query]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        value={query}
        onChange={function(e) { setQuery(e.target.value); }}
        placeholder="Search any market... e.g. Champions League, Bitcoin, Election"
        style={{ width: "100%", background: "#0d1f35", border: "1px solid #1a3a5a", borderRadius: 10, padding: "13px 16px", color: "#e8edf5", fontSize: 14, fontFamily: "inherit", outline: "none" }}
      />
      {loading && (
        <div style={{ position: "absolute", right: 14, top: 14, color: "#4a7aaa", fontSize: 12 }}>Searching...</div>
      )}
      {results.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#0a1628", border: "1px solid #1a2a4a", borderRadius: 10, marginTop: 4, zIndex: 100, overflow: "hidden" }}>
          {results.map(function(r, i) {
            return (
              <div key={i}
                onClick={function() { onSelect(r); setQuery(""); setResults([]); }}
                style={{ padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #0d1f35", color: "#e8edf5", fontSize: 13 }}>
                {r.title || r.slug}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [tab, setTab] = useState("demo");

  useEffect(function() {
    fetch("/.netlify/functions/market")
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (Array.isArray(data)) setMarkets(data.slice(0, 6));
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }, []);

  function addMarket(market) {
    setMarkets(function(prev) {
      return [market].concat(prev.filter(function(m) { return m.slug !== market.slug; })).slice(0, 6);
    });
  }

  function getEmbedCode(slug) {
    return '<iframe src="https://polywidget.netlify.app/embed/' + slug + '" width="440" height="200" frameborder="0" style="border-radius:14px"></iframe>';
  }

  function copyEmbed(slug) {
    navigator.clipboard.writeText(getEmbedCode(slug));
    setCopied(slug);
    setTimeout(function() { setCopied(null); }, 2000);
  }

  var TABS = [["demo", "Live Demo"], ["how", "How It Works"], ["why", "Why It Matters"]];

  var HOW_STEPS = [
    { step: "01", title: "Find a market", desc: "Search for any Polymarket event — elections, sports, crypto, geopolitics." },
    { step: "02", title: "Copy the embed code", desc: "One click copies a single line of HTML. No API keys. No signup required." },
    { step: "03", title: "Paste on your site", desc: "Drop the code into any article, blog, or webpage. Widget appears instantly." },
    { step: "04", title: "Odds update live", desc: "The widget fetches real-time data from Polymarket automatically." },
  ];

  var WHY_ITEMS = [
    { icon: "📰", title: "For journalists", desc: "Add live prediction odds to your articles. Show what the market really thinks." },
    { icon: "⚽", title: "For sports blogs", desc: "Embed live match odds directly in match previews and analysis." },
    { icon: "📊", title: "For analysts", desc: "Show your audience what prediction markets are pricing in on any topic." },
    { icon: "🌍", title: "For everyone", desc: "Any website, any topic, any language. If Polymarket has it, you can embed it." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#060a14", color: "#e8edf5", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{"\
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');\
        * { box-sizing: border-box; margin: 0; padding: 0; }\
        ::placeholder { color: #2a4a6a; }\
        ::-webkit-scrollbar { width: 4px; }\
        ::-webkit-scrollbar-thumb { background: #1a2a4a; border-radius: 2px; }\
        .fade { animation: fadeIn 0.4s ease; }\
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }\
      "}</style>

      <div style={{ background: "#080d1a", borderBottom: "1px solid #0e1e36", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
            Poly<span style={{ color: "#0066ff" }}>Widget</span>
          </div>
          <div style={{ fontSize: 11, color: "#2a4a6a", marginTop: 2, letterSpacing: 1, textTransform: "uppercase" }}>
            Embed Live Polymarket Odds Anywhere
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#1a2a4a", letterSpacing: 1 }}>BY POLYTOOLS</div>
      </div>

      <div style={{ background: "linear-gradient(180deg, #080d1a 0%, #060a14 100%)", padding: "48px 32px", textAlign: "center", borderBottom: "1px solid #0e1e36" }}>
        <div style={{ fontSize: 38, fontWeight: 800, color: "#fff", letterSpacing: -1, marginBottom: 16, lineHeight: 1.2 }}>
          Put Live Prediction Odds
          <br />
          <span style={{ color: "#0066ff" }}>On Any Website</span>
        </div>
        <div style={{ fontSize: 16, color: "#4a6a8a", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.6 }}>
          One line of code. Any market. Live odds from Polymarket embedded directly in your articles, blogs, or social posts.
        </div>
        <div style={{ background: "#0a1628", border: "1px solid #1a2a4a", borderRadius: 12, padding: "16px 24px", maxWidth: 600, margin: "0 auto", textAlign: "left" }}>
          <div style={{ fontSize: 11, color: "#2a4a6a", marginBottom: 8, letterSpacing: 1 }}>EMBED CODE</div>
          <code style={{ fontSize: 13, color: "#0066ff", fontFamily: "monospace" }}>
            {"<iframe src=\"https://polywidget.netlify.app/embed/"}
            <span style={{ color: "#00e676" }}>your-market-slug</span>
            {"\" width=\"440\" height=\"200\" frameborder=\"0\"></iframe>"}
          </code>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>

        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {TABS.map(function(t) {
            return (
              <button key={t[0]} onClick={function() { setTab(t[0]); }}
                style={{ background: tab === t[0] ? "#0066ff" : "#0a1628", color: tab === t[0] ? "#fff" : "#4a6a8a", border: "1px solid " + (tab === t[0] ? "#0066ff" : "#1a2a4a"), borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {t[1]}
              </button>
            );
          })}
        </div>

        {tab === "demo" && (
          <div className="fade">
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, color: "#4a6a8a", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>Search Any Market</div>
              <SearchBar onSelect={addMarket} />
            </div>
            <div style={{ fontSize: 13, color: "#4a6a8a", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>
              {loading ? "Loading live markets..." : markets.length + " Live Markets — Click Copy Embed to use on your site"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 24 }}>
              {markets.map(function(m, i) {
                return (
                  <div key={i} className="fade">
                    <Widget market={m} />
                    <button onClick={function() { copyEmbed(m.slug); }}
                      style={{ marginTop: 8, width: "100%", background: copied === m.slug ? "#003399" : "#0a1628", color: copied === m.slug ? "#fff" : "#4a6a8a", border: "1px solid #1a2a4a", borderRadius: 8, padding: "9px", fontSize: 12, cursor: "pointer", fontWeight: 600, letterSpacing: 0.5 }}>
                      {copied === m.slug ? "Copied!" : "Copy Embed Code"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "how" && (
          <div className="fade">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {HOW_STEPS.map(function(s, i) {
                return (
                  <div key={i} style={{ background: "#0a1628", border: "1px solid #1a2a4a", borderRadius: 14, padding: "24px" }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "#1a2a4a", marginBottom: 12 }}>{s.step}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: "#4a6a8a", lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "why" && (
          <div className="fade">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {WHY_ITEMS.map(function(s, i) {
                return (
                  <div key={i} style={{ background: "#0a1628", border: "1px solid #1a2a4a", borderRadius: 14, padding: "24px" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: "#4a6a8a", lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: 40, padding: "14px 18px", background: "#0a1628", border: "1px solid #1a2a4a", borderRadius: 8, fontSize: 11, color: "#1e3050", lineHeight: 1.7 }}>
          PolyWidget is an independent tool. Not affiliated with Polymarket. Not financial advice.
        </div>
      </div>
    </div>
  );
}
