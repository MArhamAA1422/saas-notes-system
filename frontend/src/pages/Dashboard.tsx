import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import type { DashboardData } from "../types/index";
import StatCard from "../components/StatCard";
import NoteCard from "../components/NoteCard";
import { useNavigate } from "react-router-dom";
import WorkspaceCard from "../components/WorkspaceCard";

export default function Dashboard() {
  const { logout } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get<DashboardData>("/");
      setDashboard(data);
    } catch (err) {
      setError("Failed to load dashboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">
          {error || "Failed to load dashboard"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {dashboard.user.fullName}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Company: {dashboard.user.company.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="My Notes"
            value={dashboard.stats.totalNotes}
            icon=""
          />
          <StatCard title="Drafts" value={dashboard.stats.draftNotes} icon="" />
          <StatCard
            title="Public Notes"
            value={dashboard.stats.publicNotes}
            icon=""
          />
          <StatCard
            title="Workspaces"
            value={dashboard.stats.totalWorkspaces}
            icon=""
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/my-notes/drafts")}
              className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    My Draft Notes
                  </h3>
                  <p className="text-sm text-gray-600">
                    {dashboard.stats.draftNotes} drafts
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/my-notes/published")}
              className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    My Published Notes
                  </h3>
                  <p className="text-sm text-gray-600">
                    {dashboard.stats.publicNotes} published
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/workspaces")}
              className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📁</span>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    All Workspaces
                  </h3>
                  <p className="text-sm text-gray-600">
                    {dashboard.stats.totalWorkspaces} workspaces
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Notes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Notes
              </h2>
            </div>
            <div className="space-y-4">
              {dashboard.recentNotes.length > 0 ? (
                dashboard.recentNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No recent notes
                </p>
              )}
            </div>
          </div>

          {/* Workspaces list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Top Workspaces
              </h2>
              <button
                onClick={() => navigate("/workspaces")}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                View all →
              </button>
            </div>
            <div className="space-y-4">
              {dashboard.workspaces?.length > 0 ? (
                dashboard.workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    onClick={() =>
                      navigate(`/workspaces/${workspace.id}/notes`)
                    }
                  >
                    <WorkspaceCard workspace={workspace} />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No workspaces</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
