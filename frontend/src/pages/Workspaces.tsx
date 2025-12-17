/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchWorkspaces(currentPage, search);
  }, [currentPage, search]);

  const fetchWorkspaces = async (page: number, searchQuery: string) => {
    setLoading(true);
    try {
      const params: any = { page, perPage: 10 };
      if (searchQuery) params.search = searchQuery;

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchInput("");
    setCurrentPage(1);
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  All Workspaces
                </h1>
                {workspaces && (
                  <p className="text-sm text-gray-600 mt-1">
                    {workspaces.meta.total}{" "}
                    {workspaces.meta.total === 1 ? "workspace" : "workspaces"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search workspaces by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Active Search Badge */}
        {search && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-blue-900">
                  Searching for:
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                  "{search}"
                </span>
              </div>
              <button
                onClick={handleClearSearch}
                className="text-sm text-blue-700 hover:text-blue-800 font-medium"
              >
                Clear search
              </button>
            </div>
          </div>
        )}

        {/* Content */}
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

            {/* Pagination */}
            {workspaces.meta.lastPage > 1 && (
              <Pagination
                currentPage={workspaces.meta.currentPage}
                lastPage={workspaces.meta.lastPage}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <span className="text-3xl">📁</span>
            </div>
            <p className="text-gray-500 font-medium mb-4">
              {search
                ? "No workspaces found matching your search"
                : "No workspaces available"}
            </p>
            {search && (
              <button
                onClick={handleClearSearch}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
