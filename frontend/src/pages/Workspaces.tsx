import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { WorkspacesResponse } from "../types";
import Pagination from "../components/Pagination";

export default function Workspaces() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspacesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchWorkspaces(currentPage);
  }, [currentPage]);

  const fetchWorkspaces = async (page: number) => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = { page, perPage: 10 };

      const { data } = await api.get<WorkspacesResponse>("/workspaces", {
        params,
      });
      setWorkspaces(data);
    } catch (error) {
      console.error("Failed to fetch workspaces", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                All Workspaces
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : workspaces && workspaces.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.data.map((workspace) => (
                <div
                  key={workspace.id}
                  onClick={() => navigate(`/workspaces/${workspace.id}/notes`)}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span>📁</span>
                      <span className="line-clamp-2">{workspace.name}</span>
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {workspace.notesCount}{" "}
                      {workspace.notesCount === 1 ? "note" : "notes"}
                    </span>
                    <span className="text-blue-600 hover:text-blue-700">
                      View →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={workspaces.meta.currentPage}
              lastPage={workspaces.meta.lastPage}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">{"No workspaces available"}</p>
          </div>
        )}
      </main>
    </div>
  );
}
