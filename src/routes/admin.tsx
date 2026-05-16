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
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

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
    <main className="min-h-screen" style={{ background: "#fcfcfd", color: "#1a1a1a", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Sticky Nav ── */}
      <nav style={{ borderBottom: "1px solid #eef0f3", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 400, letterSpacing: "0.25em", color: "#b08f26" }}>ALDO</span>
            <span className="text-[0.65rem] tracking-[0.2em] text-[#8a94a6] uppercase font-medium">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[0.7rem] text-[#8a94a6] tracking-[0.05em]">
              Refreshed: {lastRefreshed.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="px-4 py-2 rounded-md text-[0.7rem] font-semibold uppercase tracking-[0.1em] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#1a1a1a", color: "#fff", border: "none" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#b08f26"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#1a1a1a"; }}
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 sm:py-10">

        {/* Stat Cards — responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-10">
          <StatCard label="Total Visits" value={stats?.total_visits ?? 0} sub="All time" accent="#b08f26" loading={loading} />
          <StatCard label="Unique Visitors" value={stats?.unique_visits ?? 0} sub="By IP address" accent="#c2a336" loading={loading} />
          <StatCard label="Registrations" value={stats?.total_registered ?? 0} sub="All time" accent="#b08f26" loading={loading} />
          <StatCard label="Today's Visits" value={stats?.today_visits ?? 0} sub="Since midnight" accent="#8e731d" loading={loading} />
          <StatCard label="Today's Sign-ups" value={stats?.today_registered ?? 0} sub="Since midnight" accent="#b08f26" loading={loading} />
        </div>

        {/* Charts — stack on mobile, side by side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
          {/* Visits bar chart */}
          <div className="bg-white border border-[#eef0f3] rounded-xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#8a94a6] mb-5 font-semibold">Visits — Last 7 Days</p>
            <div className="flex items-end gap-2 sm:gap-3" style={{ height: 140, paddingBottom: 5 }}>
              {days.map((d) => {
                const v = getCount(stats?.visits_per_day ?? [], d);
                const h = maxVisits > 0 ? Math.max(4, (v / maxVisits) * 100) : 4;
                return (
                  <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[0.6rem] sm:text-[0.65rem] text-[#6b7280] font-medium">{v}</span>
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
                    <span className="text-[0.5rem] sm:text-[0.6rem] text-[#9ca3af] uppercase mt-0.5">
                      {new Date(d).toLocaleDateString("en", { weekday: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sign-ups horizontal bars */}
          <div className="bg-white border border-[#eef0f3] rounded-xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#8a94a6] mb-5 font-semibold">Sign-ups — Last 7 Days</p>
            <div className="flex flex-col gap-2.5">
              {days.map((d) => {
                const v = getCount(stats?.registrations_per_day ?? [], d);
                const maxReg = Math.max(1, ...days.map((dd) => getCount(stats?.registrations_per_day ?? [], dd)));
                const w = Math.max(2, (v / maxReg) * 100);
                return (
                  <div key={d} className="flex items-center gap-3">
                    <span className="text-[0.6rem] text-[#9ca3af] w-8 uppercase">{new Date(d).toLocaleDateString("en", { weekday: "short" })}</span>
                    <div className="flex-1 bg-[#f3f4f6] rounded-md h-2 overflow-hidden">
                      <div style={{ width: `${w}%`, height: "100%", background: "linear-gradient(to right, #b08f26, #e7d28e)", borderRadius: 6, transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }} />
                    </div>
                    <span className="text-[0.65rem] text-[#4b5563] w-5 text-right font-medium">{v}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Registrations Table ── */}
        <div className="bg-white border border-[#eef0f3] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="px-5 sm:px-7 py-5 border-b border-[#eef0f3]">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#8a94a6] font-semibold">Recent Registrations</p>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="border-b border-[#eef0f3] bg-[#fdfdfe]">
                  {["#", "Full Name", "Email", "Instagram", "Country", "Joined"].map((h) => (
                    <th key={h} className="px-7 py-4 text-left text-[0.65rem] tracking-[0.15em] uppercase text-[#8a94a6] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && !stats ? (
                  <tr><td colSpan={6} className="p-12 text-center text-[#9ca3af] text-sm">Loading records…</td></tr>
                ) : stats?.recent_registrations.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-[#9ca3af] text-sm">No registrations recorded yet.</td></tr>
                ) : (
                  stats?.recent_registrations.map((r, i) => (
                    <tr
                      key={r.id}
                      className="border-b border-[#f3f4f6] transition-colors duration-150 hover:bg-[#f9fafb]"
                    >
                      <td className="px-7 py-4 text-[0.75rem] text-[#9ca3af]">{i + 1}</td>
                      <td className="px-7 py-4 text-[0.85rem] font-medium text-[#111827]">{r.fullname}</td>
                      <td className="px-7 py-4 text-[0.8rem] text-[#4b5563]">{r.email}</td>
                      <td className="px-7 py-4 text-[0.8rem] text-[#b08f26] font-medium">{r.instagram_username ? `@${r.instagram_username}` : "—"}</td>
                      <td className="px-7 py-4 text-[0.8rem] text-[#4b5563]">{r.country_region}</td>
                      <td className="px-7 py-4 text-[0.75rem] text-[#6b7280]">{new Date(r.created_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden">
            {loading && !stats ? (
              <p className="p-8 text-center text-[#9ca3af] text-sm">Loading records…</p>
            ) : stats?.recent_registrations.length === 0 ? (
              <p className="p-8 text-center text-[#9ca3af] text-sm">No registrations recorded yet.</p>
            ) : (
              stats?.recent_registrations.map((r, i) => (
                <div key={r.id} className="border-b border-[#f3f4f6] px-5 py-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-[#111827]">{r.fullname}</span>
                    <span className="text-[0.65rem] text-[#9ca3af]">#{i + 1}</span>
                  </div>
                  <p className="text-[0.8rem] text-[#4b5563] mb-1">{r.email}</p>
                  <div className="flex items-center gap-4 text-[0.75rem]">
                    <span className="text-[#b08f26] font-medium">{r.instagram_username ? `@${r.instagram_username}` : "—"}</span>
                    <span className="text-[#9ca3af]">{r.country_region}</span>
                    <span className="text-[#9ca3af] ml-auto">{new Date(r.created_at).toLocaleDateString("en", { day: "numeric", month: "short" })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, sub, accent, loading }: { label: string; value: number; sub: string; accent: string; loading: boolean }) {
  return (
    <div className="bg-white border border-[#eef0f3] rounded-xl p-4 sm:p-5 relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
      <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <p className="text-[0.6rem] sm:text-[0.65rem] tracking-[0.15em] uppercase text-[#8a94a6] mb-2 sm:mb-3 font-semibold">{label}</p>
      <p className="text-2xl sm:text-4xl font-bold tabular-nums transition-colors duration-300" style={{ color: loading ? "#e5e7eb" : "#111827", lineHeight: 1 }}>
        {loading ? "···" : value.toLocaleString()}
      </p>
      <p className="text-[0.6rem] sm:text-[0.65rem] text-[#9ca3af] mt-2">{sub}</p>
    </div>
  );
}