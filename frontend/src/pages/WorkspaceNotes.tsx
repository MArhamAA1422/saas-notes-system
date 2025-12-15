import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { WorkspaceNotesResponse, SortOption } from "../types";
import PublicNoteCard from "../components/PublicNoteCard";
import Pagination from "../components/Pagination";

export default function WorkspaceNotes() {
  const { id: workspaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<WorkspaceNotesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    if (workspaceId) {
      fetchNotes(currentPage, search, sort);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, currentPage, search, sort]);

  const fetchNotes = async (
    page: number,
    searchQuery: string,
    sortOption: SortOption
  ) => {
    setLoading(true);
    setError("");
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = { page, perPage: 10, sort: sortOption };
      if (searchQuery) params.search = searchQuery;

      const { data: response } = await api.get<WorkspaceNotesResponse>(
        `/workspaces/${workspaceId}/notes`,
        { params }
      );
      setData(response);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch notes";
      setError(message);
      console.error("Failed to fetch notes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/workspaces")}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                ← <span className="hidden sm:inline">Back to Workspaces</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {data ? data.workspace.name : "Loading..."}
                </h1>
                {data && (
                  <p className="text-sm text-gray-600 mt-1">
                    {data.pagination.total}{" "}
                    {data.pagination.total === 1 ? "note" : "notes"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Sort Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search notes by title..."
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
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Clear
              </button>
            )}
          </form>

          {/* Sort Options */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleSortChange("newest")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sort === "newest"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => handleSortChange("oldest")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sort === "oldest"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Oldest
              </button>
              <button
                onClick={() => handleSortChange("most_upvoted")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sort === "most_upvoted"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                👍 Most Upvoted
              </button>
              <button
                onClick={() => handleSortChange("most_downvoted")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sort === "most_downvoted"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                👎 Most Downvoted
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(search || sort !== "newest") && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <span className="font-medium text-blue-900">
                  Active filters:
                </span>
                {search && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                    Search: "{search}"
                  </span>
                )}
                {sort !== "newest" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                    Sort: {sort.replace("_", " ")}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setSort("newest");
                  setCurrentPage(1);
                }}
                className="text-sm text-blue-700 hover:text-blue-800 font-medium"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => fetchNotes(currentPage, search, sort)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : data && data.notes.length > 0 ? (
          <>
            <div className="space-y-6">
              {data.notes.map((note) => (
                <PublicNoteCard
                  key={note.id}
                  note={note}
                  workspaceName={data.workspace.name}
                  onVoteChange={() => fetchNotes(currentPage, search, sort)}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.lastPage > 1 && (
              <Pagination
                currentPage={data.pagination.currentPage}
                lastPage={data.pagination.lastPage}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-gray-500 font-medium">
              {search
                ? "No notes found matching your search"
                : "No notes available in this workspace"}
            </p>
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setCurrentPage(1);
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
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
