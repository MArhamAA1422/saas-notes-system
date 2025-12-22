import { type Dispatch, type SetStateAction } from "react";

interface NoteCreateProps {
   setShowCreateModal: Dispatch<SetStateAction<boolean>>;
   createTitle: string;
   setCreateTitle: Dispatch<SetStateAction<string>>;
   createContent: string;
   setCreateContent: Dispatch<SetStateAction<string>>;
   createVisibility: "private" | "public";
   setCreateVisibility: Dispatch<SetStateAction<"private" | "public">>;
   createTags: string[];
   setCreateTags: Dispatch<SetStateAction<string[]>>;
   createTagInput: string;
   setCreateTagInput: Dispatch<SetStateAction<string>>;
   creating: boolean;
   handleAddCreateTag: (e: React.FormEvent<Element>) => void;
   handleRemoveCreateTag: (tagToRemove: string) => void;
   handleCreateNote: () => Promise<void>;
   createError: string;
   setCreateError: Dispatch<SetStateAction<string>>;
   createValidationErrors: Record<string, string>;
   setCreateValidationErrors: Dispatch<SetStateAction<Record<string, string>>>;
}

export function NoteCreate({
   setShowCreateModal,
   createTitle,
   setCreateTitle,
   createContent,
   setCreateContent,
   createVisibility,
   setCreateVisibility,
   createTags,
   setCreateTags,
   createTagInput,
   setCreateTagInput,
   creating,
   handleAddCreateTag,
   handleRemoveCreateTag,
   handleCreateNote,
   createError,
   setCreateError,
   createValidationErrors,
   setCreateValidationErrors,
}: NoteCreateProps) {
   return (
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
                        onChange={(e) => setCreateTagInput(e.target.value)}
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
   );
}
