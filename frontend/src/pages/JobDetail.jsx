import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/jobs/${id}`);
      setJob(res.data.job);
      setRelatedJobs(res.data.related_jobs);
    } catch (error) {
      console.error("Job detail error:", error);
      alert("İlan detayları alınamadı. Sayfa bulunamadı veya bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/apply/${job._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Başvurunuz başarıyla alındı!");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("access_token");
        alert("⚠️ Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        navigate("/login");
      } else {
        alert("❌ Başvuru sırasında hata oluştu.");
      }
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Yükleniyor...</div>;
  if (!job) return <div className="p-4 text-red-500">İlan bulunamadı.</div>;

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Sol taraf - ilan detayları */}
      <div className="md:col-span-2">
        <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
        <p className="text-gray-600">📍 {job.city}</p>
        <p className="text-sm text-gray-500">
          Güncellenme: {new Date(job.updated_at).toLocaleDateString("tr-TR")}
        </p>
        <p className="mt-4 whitespace-pre-line">{job.description}</p>
        <p className="mt-2 text-sm text-gray-500">
          Başvuru Sayısı: {job.application_count || 0}
        </p>
        <button
          onClick={handleApply}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Başvur
        </button>
      </div>

      {/* Sağ taraf - ilgili ilanlar */}
      <div>
        <h2 className="text-lg font-semibold mb-2">İlgini çekebilecek ilanlar</h2>
        {relatedJobs.length > 0 ? (
          relatedJobs.map((related) => (
            <div
              key={related._id}
              className="p-3 border rounded mb-2 cursor-pointer hover:bg-gray-100"
              onClick={() => navigate(`/job/${related._id}`)}
            >
              <h3 className="font-bold">{related.title}</h3>
              <p className="text-sm text-gray-600">{related.city}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">Benzer ilan bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
