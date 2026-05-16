import { createRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const API = "http://127.0.0.1:8000/api";

type Stats = {
  total_visits: number;
  unique_visits: number;
  total_registered: number;
  today_visits: number;
  today_registered: number;
  visits_per_day: { date: string; count: number }[];
  registrations_per_day: { date: string; count: number }[];
  recent_registrations: {
    id: number;
    fullname: string;
    email: string;
    instagram_username: string;
    country_region: string;
    created_at: string;
  }[];
};

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/stats`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      setStats(await res.json());
      setLastRefreshed(new Date());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Build last 7 days labels
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  function getCount(data: { date: string; count: number }[], date: string) {
    return data?.find((d) => d.date === date)?.count ?? 0;
  }

  const maxVisits = Math.max(1, ...days.map((d) => getCount(stats?.visits_per_day ?? [], d)));

  return (
    <main
      className="min-h-screen"
      style={{ background: "#fcfcfd", color: "#1a1a1a", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Top nav */}
      <nav
        style={{
          borderBottom: "1px solid #eef0f3",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justify: "space-between",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem" }}>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.8rem",
                fontWeight: 400,
                letterSpacing: "0.25em",
                color: "#b08f26", // Slightly deeper gold for crisp legibility on white
              }}
            >
              ALDO
            </span>
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: "#8a94a6", textTransform: "uppercase", fontWeight: 500 }}>
              Admin Dashboard
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <span style={{ fontSize: "0.7rem", color: "#8a94a6", letterSpacing: "0.05em" }}>
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchStats}
              disabled={loading}
              style={{
                background: "#1a1a1a",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "0.5rem 1.2rem",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { if(!loading) e.currentTarget.style.background = "#b08f26" }}
              onMouseLeave={(e) => { if(!loading) e.currentTarget.style.background = "#1a1a1a" }}
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.25rem",
            marginBottom: "2.5rem",
          }}
        >
          <StatCard
            label="Total Visits"
            value={stats?.total_visits ?? 0}
            sub="All time"
            accent="#b08f26"
            loading={loading}
          />
          <StatCard
            label="Unique Visitors"
            value={stats?.unique_visits ?? 0}
            sub="By IP address"
            accent="#c2a336"
            loading={loading}
          />
          <StatCard
            label="Registrations"
            value={stats?.total_registered ?? 0}
            sub="All time"
            accent="#b08f26"
            loading={loading}
          />
          <StatCard
            label="Today's Visits"
            value={stats?.today_visits ?? 0}
            sub="Since midnight"
            accent="#8e731d"
            loading={loading}
          />
          <StatCard
            label="Today's Sign-ups"
            value={stats?.today_registered ?? 0}
            sub="Since midnight"
            accent="#b08f26"
            loading={loading}
          />
        </div>

        {/* Chart + table row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2.5rem" }}>
          {/* Visits bar chart */}
          <div style={{ background: "#ffffff", border: "1px solid #eef0f3", borderRadius: "12px", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a94a6", marginBottom: "1.5rem", fontWeight: 600 }}>
              Visits — Last 7 Days
            </p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "140px", paddingBottom: "5px" }}>
              {days.map((d) => {
                const v = getCount(stats?.visits_per_day ?? [], d);
                const h = maxVisits > 0 ? Math.max(4, (v / maxVisits) * 100) : 4;
                return (
                  <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.65rem", color: "#6b7280", fontWeight: 500 }}>{v}</span>
                    <div
                      style={{
                        width: "100%",
                        height: `${h}%`,
                        background: "linear-gradient(to top, #b08f26, #dfc46c)",
                        borderRadius: "4px 4px 0 0",
                        transition: "height 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                        minHeight: 4,
                      }}
                    />
                    <span style={{ fontSize: "0.6rem", color: "#9ca3af", textTransform: "uppercase", marginTop: "2px" }}>
                      {new Date(d).toLocaleDateString("en", { weekday: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Registrations mini chart */}
          <div style={{ background: "#ffffff", border: "1px solid #eef0f3", borderRadius: "12px", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a94a6", marginBottom: "1.5rem", fontWeight: 600 }}>
              Sign-ups — Last 7 Days
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {days.map((d) => {
                const v = getCount(stats?.registrations_per_day ?? [], d);
                const maxReg = Math.max(1, ...days.map((dd) => getCount(stats?.registrations_per_day ?? [], dd)));
                const w = Math.max(2, (v / maxReg) * 100);
                return (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "0.6rem", color: "#9ca3af", width: 32, textTransform: "uppercase" }}>
                      {new Date(d).toLocaleDateString("en", { weekday: "short" })}
                    </span>
                    <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 6, height: 8, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${w}%`,
                          height: "100%",
                          background: "linear-gradient(to right, #b08f26, #e7d28e)",
                          borderRadius: 6,
                          transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "0.65rem", color: "#4b5563", width: 20, textAlign: "right", fontWeight: 500 }}>{v}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent registrations table */}
        <div style={{ background: "#ffffff", border: "1px solid #eef0f3", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ padding: "1.5rem 1.75rem", borderBottom: "1px solid #eef0f3" }}>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a94a6", fontWeight: 600 }}>
              Recent Registrations
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eef0f3", background: "#fdfdfe" }}>
                  {["#", "Full Name", "Email", "Instagram", "Country", "Joined"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "1rem 1.75rem",
                        textAlign: "left",
                        fontSize: "0.65rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#8a94a6",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && !stats ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>
                      Loading records…
                    </td>
                  </tr>
                ) : stats?.recent_registrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>
                      No registrations recorded yet.
                    </td>
                  </tr>
                ) : (
                  stats?.recent_registrations.map((r, i) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#f9fafb")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                    >
                      <td style={{ padding: "1.1rem 1.75rem", fontSize: "0.75rem", color: "#9ca3af" }}>{i + 1}</td>
                      <td style={{ padding: "1.1rem 1.75rem", fontSize: "0.85rem", fontWeight: 500, color: "#111827" }}>{r.fullname}</td>
                      <td style={{ padding: "1.1rem 1.75rem", fontSize: "0.8rem", color: "#4b5563" }}>{r.email}</td>
                      <td style={{ padding: "1.1rem 1.75rem", fontSize: "0.8rem", color: "#b08f26", fontWeight: 500 }}>
                        {r.instagram_username ? `@${r.instagram_username}` : "—"}
                      </td>
                      <td style={{ padding: "1.1rem 1.75rem", fontSize: "0.8rem", color: "#4b5563" }}>{r.country_region}</td>
                      <td style={{ padding: "1.1rem 1.75rem", fontSize: "0.75rem", color: "#6b7280" }}>
                        {new Date(r.created_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
  loading,
}: {
  label: string;
  value: number;
  sub: string;
  accent: string;
  loading: boolean;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #eef0f3",
        borderRadius: "12px",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.01)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "3px",
          background: `linear-gradient(90deg, ${accent}, transparent)`,
        }}
      />
      <p style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a94a6", marginBottom: "0.75rem", fontWeight: 600 }}>
        {label}
      </p>
      <p
        style={{
          fontSize: "2.25rem",
          fontWeight: 700,
          color: loading ? "#e5e7eb" : "#111827",
          lineHeight: 1,
          transition: "color 0.3s ease",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {loading ? "···" : value.toLocaleString()}
      </p>
      <p style={{ fontSize: "0.65rem", color: "#9ca3af", marginTop: "0.6rem" }}>{sub}</p>
    </div>
  );
}