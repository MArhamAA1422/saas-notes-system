import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import type { DashboardData, Note } from "../types/index";
import { useNavigate } from "react-router-dom";
import PublicNoteCard from "../components/PublicNoteCard";

export default function Dashboard() {
  const { logout } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [publicNotes, setPublicNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPublicNotes, setLoadingPublicNotes] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    fetchPublicNotesPreview();
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

  const fetchPublicNotesPreview = async () => {
    setLoadingPublicNotes(true);
    try {
      const { data } = await api.get("/public/notes", {
        params: { page: 1, perPage: 10, sort: "newest" },
      });
      setPublicNotes(data.notes);
    } catch (err) {
      console.error("Failed to load public notes preview", err);
    } finally {
      setLoadingPublicNotes(false);
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
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/my-notes/published")}
              className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">My Notes</h3>
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

        {/* Public Notes Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Public Notes from {dashboard.user.company.name}
            </h2>
            <button
              onClick={() => navigate("/public/notes")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </button>
          </div>

          {loadingPublicNotes ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : publicNotes.length > 0 ? (
            <div className="space-y-4">
              {publicNotes.map((note) => (
                <PublicNoteCard
                  key={note.id}
                  workspaceName={note.workspace?.name}
                  note={note}
                  onVoteChange={fetchPublicNotesPreview}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No public notes available yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
