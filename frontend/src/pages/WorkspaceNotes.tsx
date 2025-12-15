import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { Note, SortOption } from "../types";
import PublicNoteCard from "../components/PublicNoteCard";
import Pagination from "../components/Pagination";

export default function WorkspaceNotes() {
  const { id: workspaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notes, setNotes] = useState<{ notes: Note[]; meta: any } | null>(null);
  const [loading, setLoading] = useState(true);
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
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = { page, perPage: 10, sort: sortOption };
      if (searchQuery) params.search = searchQuery;

      // Using public notes endpoint filtered by workspace
      const { data } = await api.get("/public/notes", { params });

      // Filter by workspace on frontend (or modify backend to accept workspace filter)
      const filteredNotes = data.notes.filter(
        (note: Note) => note.workspaceId === Number(workspaceId)
      );

      setNotes({ notes: filteredNotes, meta: data.meta });
    } catch (error) {
      console.error("Failed to fetch notes", error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/workspaces")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Workspaces
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Public Notes</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Sort */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Search notes by title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_upvoted">Most Upvoted</option>
            <option value="most_downvoted">Most Downvoted</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : notes && notes.notes.length > 0 ? (
          <>
            <div className="space-y-6">
              {notes.notes.map((note) => (
                <PublicNoteCard
                  key={note.id}
                  note={note}
                  onVoteChange={() => fetchNotes(currentPage, search, sort)}
                />
              ))}
            </div>

            {notes.meta && (
              <Pagination
                currentPage={notes.meta.currentPage}
                lastPage={notes.meta.lastPage}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {search
                ? "No notes found matching your search"
                : "No public notes available in this workspace"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
