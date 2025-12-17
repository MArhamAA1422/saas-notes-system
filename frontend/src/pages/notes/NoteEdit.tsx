/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import type { Note } from "../../types";

export default function NoteEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [successMessage, setSuccessMessage] = useState("");

  // Auto-save timer
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-save every 30 seconds when content changes
  useEffect(() => {
    if (note && hasUnsavedChanges) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);

      const timer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // 30 seconds

      setAutoSaveTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, hasUnsavedChanges]);

  // Track unsaved changes
  useEffect(() => {
    if (note) {
      const changed =
        title !== note.title ||
        content !== (note.content || "") ||
        status !== note.status ||
        visibility !== note.visibility ||
        JSON.stringify(tags.sort()) !==
          JSON.stringify(note.tags.map((t) => t.name).sort());

      setHasUnsavedChanges(changed);
    }
  }, [title, content, status, visibility, tags, note]);

  const fetchNote = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/notes/${id}`);
      setNote(data.note);
      setTitle(data.note.title);
      setContent(data.note.content || "");
      setStatus(data.note.status);
      setVisibility(data.note.visibility);
      setTags(data.note.tags.map((t: any) => t.name));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load note");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!id || !hasUnsavedChanges) return;

    try {
      await api.patch(`/notes/${id}/autosave`, { title, content });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Auto-save failed", err);
    }
  };

  const handleSave = async () => {
    if (!id || !note) return;

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Title is required";
    if (!content.trim()) errors.content = "Content is required";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSaving(true);
    setError("");
    setValidationErrors({});
    setSuccessMessage("");

    try {
      await api.put(`/notes/${id}`, {
        title: title.trim(),
        content: content.trim(),
        status,
        visibility,
        tags,
      });

      setSuccessMessage("Note saved successfully!");
      setHasUnsavedChanges(false);
      await fetchNote(); // Refresh to get updated data

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      const apiError = err.response?.data;

      if (apiError?.errors) {
        // Handle validation errors from backend
        const errors: Record<string, string> = {};
        apiError.errors.forEach((e: any) => {
          errors[e.field] = e.message;
        });
        setValidationErrors(errors);
      } else {
        setError(apiError?.message || "Failed to save note");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!id) return;

    try {
      if (status === "draft") {
        await api.post(`/notes/${id}/publish`);
        setStatus("published");
        setSuccessMessage("Note published successfully!");
      } else {
        await api.post(`/notes/${id}/unpublish`);
        setStatus("draft");
        setSuccessMessage("Note unpublished successfully!");
      }

      await fetchNote();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change status");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
      navigate("/my-notes/draft");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete note");
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Note not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (
                    hasUnsavedChanges &&
                    !confirm(
                      "You have unsaved changes. Are you sure you want to leave?"
                    )
                  ) {
                    return;
                  }
                  navigate("/my-notes/published");
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to My Notes
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Note</h1>
                <div className="flex items-center gap-2 mt-1">
                  {lastSaved && (
                    <p className="text-xs text-gray-500">
                      Auto-saved at {lastSaved.toLocaleTimeString()}
                    </p>
                  )}
                  {hasUnsavedChanges && (
                    <span className="text-xs text-orange-600 font-medium">
                      • Unsaved changes
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStatusToggle}
                className={`px-4 py-2 rounded-lg font-medium ${
                  status === "draft"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-yellow-600 text-white hover:bg-yellow-700"
                }`}
              >
                {status === "draft" ? "Publish" : "Unpublish"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => navigate(`/notes/${id}/history`)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                History
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">
              {successMessage}
            </p>
          </div>
        )}

        {/* Note Editor */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {/* Status & Visibility Badges */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  status === "published"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {status === "published" ? "Published" : "Draft"}
              </span>
              {/* <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  visibility === "public"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {visibility === "public" ? "Public" : "Private"}
              </span> */}
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Note Visibility
                </span>
                <p className="text-xs text-gray-600 mt-1">
                  {visibility === "public"
                    ? "Everyone in your company can see this note"
                    : "Only you can see this note"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility("private")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    visibility === "private"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Private
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility("public")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    visibility === "public"
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-lg font-medium ${
                validationErrors.title
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter note title..."
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.title}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${
                validationErrors.content
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Write your note content here..."
            />
            {validationErrors.content && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.content}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {content.length} characters
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <form onSubmit={handleAddTag} className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag and press enter..."
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Tag
              </button>
            </form>
            {validationErrors.tags && (
              <p className="mb-2 text-sm text-red-600">
                {validationErrors.tags}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No tags added yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your work is auto-saved every 30 seconds</li>
            <li>• Click "Save" to manually save your changes</li>
            <li>• Use "Publish" to make your draft visible to others</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
