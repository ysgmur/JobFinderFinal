import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CreateAlert = () => {
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Giriş yapmalısınız.");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/alerts`,  // Sadece burayı değiştirdim
        { keyword, city },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("🔔 İş alarmınız oluşturuldu.");
      navigate("/notifications");
    } catch (error) {
      console.error("Alert creation failed:", error);
      alert("❌ İş alarmı eklenemedi.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2>İş Alarmı Oluştur</h2>
      <p>Yeni bir ilan çıktığında haberdar olmak için bir alarm ekleyin.</p>
      <input
        type="text"
        placeholder="Anahtar Kelime (Örn: Yazılım)"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem" }}
      />
      <input
        type="text"
        placeholder="Şehir (isteğe bağlı)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem" }}
      />
      <button
        onClick={handleCreate}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "8px"
        }}
      >
        Alarm Ekle
      </button>
    </div>
  );
};

export default CreateAlert;
