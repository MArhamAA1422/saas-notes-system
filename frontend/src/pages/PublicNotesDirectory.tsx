/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { Note, SortOption, PaginationMeta } from "../types";
import PublicNoteCard from "../components/PublicNoteCard";
import Pagination from "../components/Pagination";

interface PublicNotesResponse {
  notes: Note[];
  meta: PaginationMeta;
}

export default function PublicNotesDirectory() {
  const navigate = useNavigate();

  const [data, setData] = useState<PublicNotesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<
    Array<{ id: number; name: string }>
  >([]);

  useEffect(() => {
    fetchNotes(currentPage, search, sort, selectedTags);
  }, [currentPage, search, sort, selectedTags]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data } = await api.get("/public/tags");
      setAvailableTags(data.tags || []);
    } catch (err) {
      console.error("Failed to fetch tags", err);
    }
  };

  const fetchNotes = async (
    page: number,
    searchQuery: string,
    sortOption: SortOption,
    tags: string[]
  ) => {
    setLoading(true);
    setError("");
    try {
      const params: any = { page, perPage: 10, sort: sortOption };
      if (searchQuery) params.search = searchQuery;
      if (tags.length > 0) params.tags = tags;

      const { data: response } = await api.get<PublicNotesResponse>(
        "/public/notes",
        { params }
      );
      setData(response);
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

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setSort("newest");
    setSelectedTags([]);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Public Notes Directory
                </h1>
                {data && (
                  <p className="text-sm text-gray-600 mt-1">
                    {data.meta.total.toLocaleString()} public notes
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
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
                Most Upvoted
              </button>
              <button
                onClick={() => handleSortChange("most_downvoted")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sort === "most_downvoted"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Most Downvoted
              </button>
            </div>
          </div>

          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                Filter by tags:
              </span>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 20).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.name)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag.name)
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(search || sort !== "newest" || selectedTags.length > 0) && (
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
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <button
                onClick={clearFilters}
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
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() =>
                fetchNotes(currentPage, search, sort, selectedTags)
              }
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
                  workspaceName={note.workspace?.name}
                  onVoteChange={() =>
                    fetchNotes(currentPage, search, sort, selectedTags)
                  }
                />
              ))}
            </div>

            {/* Pagination */}
            {data.meta.lastPage > 1 && (
              <Pagination
                currentPage={data.meta.currentPage}
                lastPage={data.meta.lastPage}
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
              {search || selectedTags.length > 0
                ? "No notes found matching your filters"
                : "No public notes available yet"}
            </p>
            {(search || selectedTags.length > 0) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
