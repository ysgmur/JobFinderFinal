import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Her bildirimdeki iş ilanlarını tek tek getiriyoruz
        const detailedNotifs = await Promise.all(
          res.data.map(async (notif) => {
            const jobs = await Promise.all(
              notif.jobs.map(async (jobId) => {
                const jobRes = await axios.get(`${API_BASE_URL}/jobs/${jobId}`);
                return jobRes.data.job;
              })
            );
            return { ...notif, jobDetails: jobs };
          })
        );

        setNotifications(detailedNotifs);
      } catch (err) {
        console.error("Bildirim alınamadı:", err);
      }
    };

    fetchNotifications();
  }, [navigate]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>📬 Bildirimlerim</h2>
      {notifications.length === 0 ? (
        <p>Hiç bildiriminiz yok.</p>
      ) : (
        notifications.map((notif, index) => (
          <div key={index} style={{ marginBottom: "2rem" }}>
            <h4>
              🔔{" "}
              {notif.type === "alert"
                ? "Yeni iş alarmınıza uygun ilanlar"
                : "Benzer iş önerileri"}
            </h4>
            <p style={{ fontSize: "0.85rem", color: "#888" }}>
              {new Date(notif.timestamp).toLocaleString("tr-TR")}
            </p>
            {notif.jobDetails.map((job) => (
              <div
                key={job._id}
                onClick={() => navigate(`/job/${job._id}`)}
                style={{
                  border: "1px solid #ddd",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginTop: "0.5rem",
                  cursor: "pointer"
                }}
              >
                <strong>{job.title}</strong> - {job.city}, {job.country}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
