/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import type { Note } from "../../types";
import { formatDate } from "../../utils/index";

type NoteType = "draft" | "published";

interface NotesResponse {
   notes: Note[];
   pagination: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      firstPage: number;
   };
}

export default function MyNotes() {
   const { type } = useParams<{ type: NoteType }>();
   const navigate = useNavigate();

   const [data, setData] = useState<NotesResponse | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const [search, setSearch] = useState("");
   const [searchInput, setSearchInput] = useState("");

   useEffect(() => {
      if (type) {
         fetchMyNotes(currentPage, search);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [type, currentPage, search]);

   const fetchMyNotes = async (page: number, searchQuery: string) => {
      setLoading(true);
      setError("");
      try {
         const params: any = { page, perPage: 20 };
         if (searchQuery) params.search = searchQuery;

         const { data: response } = await api.get<NotesResponse>(
            `/notes/type/${type}`,
            { params }
         );
         setData(response);
      } catch (err) {
         setError("Failed to load notes");
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
      setCurrentPage(1);
   };

   return (
      <div className="min-h-screen bg-gray-50">
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
                           My {type === "draft" ? "Draft" : "Published"} Notes
                        </h1>
                        {data && (
                           <p className="text-sm text-gray-600 mt-1">
                              {data.pagination.total}{" "}
                              {data.pagination.total === 1 ? "note" : "notes"}
                           </p>
                        )}
                     </div>
                  </div>

                  {/* Toggle between drafts and published */}
                  <div className="flex gap-2">
                     <button
                        onClick={() => navigate("/my-notes/draft")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                           type === "draft"
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                     >
                        Drafts
                     </button>
                     <button
                        onClick={() => navigate("/my-notes/published")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                           type === "published"
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                     >
                        Published
                     </button>
                  </div>
               </div>
            </div>
         </header>

         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6 flex gap-2">
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

            {loading ? (
               <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
               </div>
            ) : error ? (
               <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
               </div>
            ) : data && data.notes.length > 0 ? (
               <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {data.notes.map((note) => (
                        <div
                           key={note.id}
                           onClick={() => navigate(`/notes/${note.id}/edit`)}
                           className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                        >
                           <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                              {note.title}
                           </h3>
                           <p className="text-sm text-gray-600 mb-3">
                              📁 {note.workspace?.name}
                           </p>
                           {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                 {note.tags.slice(0, 3).map((tag) => (
                                    <span
                                       key={tag.id}
                                       className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                       #{tag.name}
                                    </span>
                                 ))}
                                 {note.tags.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                       +{note.tags.length - 3}
                                    </span>
                                 )}
                              </div>
                           )}
                           <div className="flex items-center justify-between text-sm">
                              <span
                                 className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    note.status === "published"
                                       ? "bg-green-100 text-green-800"
                                       : "bg-yellow-100 text-yellow-800"
                                 }`}
                              >
                                 {note.status}
                              </span>
                              <span className="text-gray-500">
                                 {formatDate(note.updatedAt)}
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Pagination */}
                  {data.pagination.lastPage > 1 && (
                     <div className="mt-6 flex justify-center">
                        <nav className="flex items-center gap-2">
                           <button
                              onClick={() =>
                                 setCurrentPage((p) => Math.max(1, p - 1))
                              }
                              disabled={currentPage === 1}
                              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                           >
                              Previous
                           </button>
                           <span className="px-4 py-1">
                              Page {currentPage} of {data.pagination.lastPage}
                           </span>
                           <button
                              onClick={() =>
                                 setCurrentPage((p) =>
                                    Math.min(data.pagination.lastPage, p + 1)
                                 )
                              }
                              disabled={
                                 currentPage === data.pagination.lastPage
                              }
                              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                           >
                              Next
                           </button>
                        </nav>
                     </div>
                  )}
               </>
            ) : (
               <div className="text-center py-12">
                  <p className="text-gray-500 font-medium mb-4">
                     No {type === "draft" ? "draft" : "published"} notes yet
                  </p>
               </div>
            )}
         </main>
      </div>
   );
}
