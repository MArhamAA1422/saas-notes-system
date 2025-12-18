/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { calculateTimeAgo } from "../../utils/index";

interface HistoryEntry {
  id: number;
  noteId: number;
  userId: number;
  title: string;
  content: string;
  status: "draft" | "published";
  visibility: "private" | "public";
  tags: Array<{ id: number; name: string }>;
  createdAt: string;
  user: {
    id: number;
    fullName: string;
  };
}

interface HistoryResponse {
  histories: HistoryEntry[];
  current: {
    title: string;
    content: string;
    status: "draft" | "published";
    visibility: "private" | "public";
    tags: Array<{ id: number; name: string }>;
  };
}

export default function NoteHistory() {
  const { id: noteId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restoring, setRestoring] = useState<number | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<HistoryEntry | null>(
    null
  );

  useEffect(() => {
    if (noteId) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: response } = await api.get<HistoryResponse>(
        `/notes/${noteId}/history`
      );
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (historyId: number) => {
    if (!confirm("Are you sure you want to restore this version?")) {
      return;
    }

    setRestoring(historyId);
    try {
      await api.post(`/notes/${noteId}/history/${historyId}/restore`);
      alert("Note restored successfully!");
      navigate(`/notes/${noteId}/edit`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to restore note");
    } finally {
      setRestoring(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
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

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/notes/${noteId}/edit`)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Version History
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {data.histories.length}{" "}
                  {data.histories.length === 1 ? "version" : "versions"} saved
                  (7-day retention)
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* History Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Timeline
              </h2>

              {/* Current Version */}
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600 font-semibold">
                    Current Version
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {formatDate(new Date().toISOString())}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      data.current.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {data.current.status}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      data.current.visibility === "public"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {data.current.visibility}
                  </span>
                </div>
              </div>

              {/* History List */}
              {data.histories.length > 0 ? (
                <div className="space-y-3">
                  {data.histories.map((history, index) => (
                    <div
                      key={history.id}
                      onClick={() => setSelectedHistory(history)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedHistory?.id === history.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          Version #{data.histories.length - index}
                        </span>
                        <span className="text-xs text-gray-500">
                          {calculateTimeAgo(history.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {formatDate(history.createdAt)}
                      </p>
                      <p className="text-xs text-gray-600">
                        By {history.user.fullName}
                      </p>
                      <div className="mt-2 flex items-center gap-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            history.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {history.status}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            history.visibility === "public"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {history.visibility}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No history available yet
                </p>
              )}
            </div>
          </div>

          {/* Preview Pane */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              {selectedHistory ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Version Preview
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(selectedHistory.createdAt)} by{" "}
                        {selectedHistory.user.fullName}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestore(selectedHistory.id)}
                      disabled={restoring === selectedHistory.id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      {restoring === selectedHistory.id
                        ? "Restoring..."
                        : "Restore This Version"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900">{selectedHistory.title}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content
                      </label>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                          {selectedHistory.content}
                        </pre>
                      </div>
                    </div>

                    {/* Tags */}
                    {selectedHistory.tags &&
                      selectedHistory.tags.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {selectedHistory.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                              >
                                #{tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Visibility
                        </label>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            selectedHistory.visibility === "public"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedHistory.visibility}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Select a version from the timeline to preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
