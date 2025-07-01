import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AIAgentChat from "./components/AIAgentChat.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [jobs, setJobs] = useState([]);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({ country: "", city: "", work_type: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const navigate = useNavigate();

  const fetchAIResults = async () => {
    if (!title || !city) {
      alert("Lütfen pozisyon ve şehir giriniz.");
      return;
    }
    try {
      const prompt = `${title} in ${city}`;
      const res = await axios.post(`${API_BASE_URL}/ai/search`, { prompt });
      setJobs(res.data);

      const token = localStorage.getItem("access_token");
      if (token) {
        await axios.post(
          `${API_BASE_URL}/search`,
          { keyword: title, city: city },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchSearchHistory();
      }
    } catch (err) {
      console.error("AI search error:", err);
    }
  };

  const fetchSearchHistory = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/search/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (err) {
      console.error("History error:", err);
    }
  };

  const fetchAutocomplete = async (field, value) => {
    if (value.length < 2) return;
    const res = await axios.get(`${API_BASE_URL}/autocomplete?field=${field}&query=${value}`);
    console.log("Suggestions:", res.data);
  };

  const removeFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const applyFilters = async () => {
    const params = new URLSearchParams(filters).toString();
    const res = await axios.get(`${API_BASE_URL}/jobs?${params}`);
    setJobs(res.data);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    fetchSearchHistory();
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const cityName = res.data.address.city || res.data.address.town;
          setCity(cityName);
        } catch (err) {
          console.error("Şehir bilgisi alınamadı:", err);
        }
      },
      (err) => {
        console.warn("Konum alınamadı:", err);
      }
    );
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", position: "relative" }}>
      {/* Üst menü */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2 style={{ color: "#4f46e5" }}>İşBul</h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {isLoggedIn && (
            <>
              <button onClick={() => navigate("/notifications")} style={buttonStyleOutline}>
                Bildirimlerim
              </button>
              <button onClick={() => navigate("/create-alert")} style={buttonStyleOutline}>
                İş Alarmı Ekle
              </button>
              <button onClick={() => navigate("/post-job")} style={buttonStyleOutline}>
                İş İlanı Ekle
              </button>
            </>
          )}
          {isLoggedIn ? (
            <button onClick={logout} style={buttonStyleDanger}>Çıkış Yap</button>
          ) : (
            <>
              <button onClick={() => navigate("/register")} style={buttonStyleOutline}>Kayıt Ol</button>
              <button onClick={() => navigate("/login")} style={buttonStylePrimary}>Giriş Yap</button>
            </>
          )}
        </div>
      </div>

      {/* Başlık */}
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#444" }}>
        Hayalinizdeki <span style={{ color: "#7b2cbf" }}>İşi Bulun</span>
      </h1>
      <p style={{ fontSize: "1.1rem", marginTop: "0.5rem", marginBottom: "2rem", color: "#555" }}>
        Türkiye'nin en büyük iş arama platformunda binlerce iş fırsatını keşfedin.
      </p>

      {/* Arama kutuları */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            fetchAutocomplete("title", e.target.value);
          }}
          placeholder="Pozisyon"
          style={inputStyle}
        />
        <input
          type="text"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            fetchAutocomplete("city", e.target.value);
          }}
          placeholder="Şehir"
          style={inputStyle}
        />
        <button onClick={fetchAIResults} style={buttonStylePrimary}>Ara</button>
      </div>

      {/* Filtreler */}
      <div style={{ marginBottom: "1rem" }}>
        <h4>Filtreler</h4>
        <input placeholder="Ülke" value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value })} />
        <input placeholder="Şehir" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
        <select value={filters.work_type} onChange={(e) => setFilters({ ...filters, work_type: e.target.value })}>
          <option value="">Çalışma Şekli</option>
          <option value="Remote">Uzaktan</option>
          <option value="Fulltime">Tam Zamanlı</option>
          <option value="Part-time">Yarı Zamanlı</option>
        </select>
        <button onClick={applyFilters}>Uygula</button>
      </div>

      {/* Seçili filtreler */}
      <div style={{ marginBottom: "1rem" }}>
        {Object.entries(filters).map(([key, value]) =>
          value ? (
            <span key={key} style={{ background: "#eee", padding: "0.3rem 0.8rem", marginRight: "0.5rem", borderRadius: "12px" }}>
              {key}: {value} <button onClick={() => removeFilter(key)}>x</button>
            </span>
          ) : null
        )}
      </div>

      {/* Arama geçmişi */}
      {history.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Son Aramalarım</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {history.map((item) => (
              <span key={item._id} style={{ backgroundColor: "#f0f0f0", padding: "0.5rem 1rem", borderRadius: "16px" }}>
                {item.keyword} {item.city && `(${item.city})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* İş ilanları listesi */}
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {jobs.map((job) => (
          <div
            key={job._id}
            onClick={() => navigate(`/job/${job._id}`)}
            style={{ border: "1px solid #ddd", padding: "1.25rem", borderRadius: "12px", cursor: "pointer", transition: "0.2s" }}
          >
            <h3 style={{ marginBottom: "0.25rem", color: "#333" }}>{job.title}</h3>
            <p style={{ margin: 0, color: "#666" }}>{job.company}</p>
            <p style={{ margin: "0.5rem 0 0", color: "#888" }}>{job.city}, {job.country}</p>
            <p style={{ marginTop: "0.5rem", color: "#555" }}>{job.description}</p>
          </div>
        ))}
      </div>

      {/* AI Agent Chat */}
      <div style={{ position: "fixed", bottom: "1rem", right: "1rem", zIndex: 999 }}>
        <AIAgentChat />
      </div>
    </div>
  );
}

const inputStyle = {
  flex: 1,
  padding: "0.75rem",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const buttonStylePrimary = {
  padding: "0.75rem 1.25rem",
  backgroundColor: "#4f46e5",
  color: "white",
  borderRadius: "8px",
  border: "none"
};

const buttonStyleOutline = {
  padding: "0.5rem 1rem",
  borderRadius: "6px",
  border: "1px solid #4f46e5",
  background: "white",
  color: "#4f46e5"
};

const buttonStyleDanger = {
  padding: "0.5rem 1rem",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#e11d48",
  color: "white"
};

export default App;
