/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import type { WorkspaceNotesResponse, SortOption } from "../../types";
import PublicNoteCard from "../../components/PublicNoteCard";
import Pagination from "../../components/Pagination";

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

   // Create note modal
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [createTitle, setCreateTitle] = useState("");
   const [createContent, setCreateContent] = useState("");
   const [createVisibility, setCreateVisibility] = useState<
      "private" | "public"
   >("private");
   const [createTags, setCreateTags] = useState<string[]>([]);
   const [createTagInput, setCreateTagInput] = useState("");
   const [creating, setCreating] = useState(false);
   const [createError, setCreateError] = useState("");
   const [createValidationErrors, setCreateValidationErrors] = useState<
      Record<string, string>
   >({});

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
         const params: any = { page, perPage: 10, sort: sortOption };
         if (searchQuery) params.search = searchQuery;

         const { data: response } = await api.get<WorkspaceNotesResponse>(
            `/workspaces/${workspaceId}/notes`,
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

   const handleCreateNote = async () => {
      // Validate
      const errors: Record<string, string> = {};
      if (!createTitle.trim()) errors.title = "Title is required";
      if (!createContent.trim()) errors.content = "Content is required";

      if (Object.keys(errors).length > 0) {
         setCreateValidationErrors(errors);
         return;
      }

      setCreating(true);
      setCreateError("");
      setCreateValidationErrors({});

      try {
         await api.post(`/workspaces/${workspaceId}/notes`, {
            title: createTitle.trim(),
            content: createContent.trim(),
            status: "draft",
            visibility: createVisibility,
            tags: createTags,
         });

         // Reset form
         setCreateTitle("");
         setCreateContent("");
         setCreateVisibility("private");
         setCreateTags([]);
         setCreateTagInput("");
         setShowCreateModal(false);

         // Refresh notes list
         await fetchNotes(currentPage, search, sort);

         // Show success message or navigate
         alert("Note created successfully!");
      } catch (err: any) {
         const apiError = err.response?.data;

         if (apiError?.errors) {
            const errors: Record<string, string> = {};
            apiError.errors.forEach((e: any) => {
               errors[e.field] = e.message;
            });
            setCreateValidationErrors(errors);
         } else {
            setCreateError(apiError?.message || "Failed to create note");
         }
      } finally {
         setCreating(false);
      }
   };

   const handleAddCreateTag = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = createTagInput.trim().toLowerCase();
      if (trimmed && !createTags.includes(trimmed)) {
         setCreateTags([...createTags, trimmed]);
         setCreateTagInput("");
      }
   };

   const handleRemoveCreateTag = (tagToRemove: string) => {
      setCreateTags(createTags.filter((tag) => tag !== tagToRemove));
   };

   const handleNoteClick = (noteId: number) => {
      // Public notes are editable by anyone
      // Private notes are only editable by owner
      // For now, we'll navigate to edit page and let the backend handle permissions
      navigate(`/notes/${noteId}/edit`);
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
                        ←{" "}
                        <span className="hidden sm:inline">
                           Back to Workspaces
                        </span>
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

                  {/* Create Note Button */}
                  <button
                     onClick={() => setShowCreateModal(true)}
                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                  >
                     <span className="text-lg">+</span>
                     <span>Create Note</span>
                  </button>
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
                  <span className="text-sm font-medium text-gray-700">
                     Sort by:
                  </span>
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
                        <div
                           key={note.id}
                           onClick={() => handleNoteClick(note.id)}
                           className="cursor-pointer"
                        >
                           <PublicNoteCard
                              note={note}
                              workspaceName={data.workspace.name}
                              fromWorkspace={true}
                           />
                        </div>
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
                  <p className="text-gray-500 font-medium mb-4">
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
                        className="text-blue-600 hover:text-blue-700 font-medium"
                     >
                        Clear search
                     </button>
                  )}
               </div>
            )}
         </main>

         {/* Create Note Modal */}
         {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                     <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                           Create New Note (will be drafted)
                        </h2>
                        <button
                           onClick={() => {
                              setShowCreateModal(false);
                              setCreateTitle("");
                              setCreateContent("");
                              setCreateVisibility("private");
                              setCreateTags([]);
                              setCreateError("");
                              setCreateValidationErrors({});
                           }}
                           className="text-gray-400 hover:text-gray-600"
                        >
                           <span className="text-2xl">×</span>
                        </button>
                     </div>

                     {/* Error Message */}
                     {createError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                           <p className="text-red-800 text-sm">{createError}</p>
                        </div>
                     )}

                     {/* Visibility Toggle */}
                     <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <label className="flex items-center justify-between">
                           <div>
                              <span className="text-sm font-medium text-gray-900">
                                 Note Visibility
                              </span>
                              <p className="text-xs text-gray-600 mt-1">
                                 {createVisibility === "public"
                                    ? "Everyone in your company can see and edit this note"
                                    : "Only you can see and edit this note"}
                              </p>
                           </div>
                           <div className="flex items-center gap-2">
                              <button
                                 type="button"
                                 onClick={() => setCreateVisibility("private")}
                                 className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                    createVisibility === "private"
                                       ? "bg-gray-700 text-white"
                                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                 }`}
                              >
                                 🔒 Private
                              </button>
                              <button
                                 type="button"
                                 onClick={() => setCreateVisibility("public")}
                                 className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                    createVisibility === "public"
                                       ? "bg-blue-600 text-white"
                                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                 }`}
                              >
                                 Public
                              </button>
                           </div>
                        </label>
                     </div>

                     {/* Title */}
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Title <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="text"
                           value={createTitle}
                           onChange={(e) => setCreateTitle(e.target.value)}
                           className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                              createValidationErrors.title
                                 ? "border-red-300 focus:ring-red-500"
                                 : "border-gray-300 focus:ring-blue-500"
                           }`}
                           placeholder="Enter note title..."
                        />
                        {createValidationErrors.title && (
                           <p className="mt-1 text-sm text-red-600">
                              {createValidationErrors.title}
                           </p>
                        )}
                     </div>

                     {/* Content */}
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                           value={createContent}
                           onChange={(e) => setCreateContent(e.target.value)}
                           rows={10}
                           className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${
                              createValidationErrors.content
                                 ? "border-red-300 focus:ring-red-500"
                                 : "border-gray-300 focus:ring-blue-500"
                           }`}
                           placeholder="Write your note content..."
                        />
                        {createValidationErrors.content && (
                           <p className="mt-1 text-sm text-red-600">
                              {createValidationErrors.content}
                           </p>
                        )}
                     </div>

                     {/* Tags */}
                     <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Tags
                        </label>
                        <form
                           onSubmit={handleAddCreateTag}
                           className="flex gap-2 mb-2"
                        >
                           <input
                              type="text"
                              value={createTagInput}
                              onChange={(e) =>
                                 setCreateTagInput(e.target.value)
                              }
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Add a tag..."
                           />
                           <button
                              type="submit"
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                           >
                              Add
                           </button>
                        </form>
                        <div className="flex flex-wrap gap-2">
                           {createTags.map((tag) => (
                              <span
                                 key={tag}
                                 className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                              >
                                 #{tag}
                                 <button
                                    type="button"
                                    onClick={() => handleRemoveCreateTag(tag)}
                                    className="text-blue-600 hover:text-blue-800 font-bold"
                                 >
                                    ×
                                 </button>
                              </span>
                           ))}
                        </div>
                     </div>

                     {/* Actions */}
                     <div className="flex gap-3">
                        <button
                           onClick={handleCreateNote}
                           disabled={creating}
                           className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                        >
                           {creating ? "Creating..." : "Create Note"}
                        </button>
                        <button
                           onClick={() => {
                              setShowCreateModal(false);
                              setCreateTitle("");
                              setCreateContent("");
                              setCreateVisibility("private");
                              setCreateTags([]);
                              setCreateError("");
                              setCreateValidationErrors({});
                           }}
                           className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                           Cancel
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
