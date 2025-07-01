import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function PostJob() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    country: "",
    city: "",
    town: "",
    work_type: ""
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    try {
      const res = await axios.post(`${API_BASE_URL}/jobs`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("İlan başarıyla eklendi!");
    } catch (err) {
      console.error("İlan eklenemedi:", err);
      alert("İlan eklenemedi!");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Yeni İş İlanı Ekle</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", maxWidth: "500px" }}>
        <input name="title" placeholder="Pozisyon" value={formData.title} onChange={handleChange} />
        <input name="description" placeholder="Açıklama" value={formData.description} onChange={handleChange} />
        <input name="company" placeholder="Şirket" value={formData.company} onChange={handleChange} />
        <input name="country" placeholder="Ülke" value={formData.country} onChange={handleChange} />
        <input name="city" placeholder="Şehir" value={formData.city} onChange={handleChange} />
        <input name="town" placeholder="İlçe" value={formData.town} onChange={handleChange} />
        <select name="work_type" value={formData.work_type} onChange={handleChange}>
          <option value="">Çalışma Tipi</option>
          <option value="Remote">Uzaktan</option>
          <option value="Fulltime">Tam Zamanlı</option>
          <option value="Part-time">Yarı Zamanlı</option>
        </select>
        <button type="submit">İlanı Yayınla</button>
      </form>
    </div>
  );
}

export default PostJob;
