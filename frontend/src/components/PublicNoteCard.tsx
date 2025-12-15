import { useState } from "react";
import type { Note, VoteStatus } from "../types";
import api from "../api/axios";

interface PublicNoteCardProps {
  note: Note;
  onVoteChange?: () => void;
}

export default function PublicNoteCard({
  note,
  onVoteChange,
}: PublicNoteCardProps) {
  const [voteStatus, setVoteStatus] = useState<VoteStatus>({
    hasVoted: false,
    voteType: null,
    voteCount: note.voteCount,
  });
  const [loading, setLoading] = useState(false);

  // Fetch vote status on mount
  useState(() => {
    fetchVoteStatus();
  });

  const fetchVoteStatus = async () => {
    try {
      const { data } = await api.get<VoteStatus>(`/notes/${note.id}/vote`);
      setVoteStatus(data);
    } catch (error) {
      console.error("Failed to fetch vote status", error);
    }
  };

  const handleVote = async (type: "up" | "down") => {
    if (loading) return;

    setLoading(true);
    try {
      if (voteStatus.hasVoted && voteStatus.voteType === type) {
        // Remove vote
        const { data } = await api.delete(`/notes/${note.id}/vote`);
        setVoteStatus({
          hasVoted: false,
          voteType: null,
          voteCount: data.voteCount,
        });
      } else {
        // Add or change vote
        const { data } = await api.post(`/notes/${note.id}/vote`, {
          voteType: type,
        });
        setVoteStatus({
          hasVoted: true,
          voteType: type,
          voteCount: data.vote.voteCount,
        });
      }
      onVoteChange?.();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to vote";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {note.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📁 {note.workspace?.name}</span>
            <span>•</span>
            <span>by {note.user.fullName}</span>
            {note.workspace?.company && (
              <>
                <span>•</span>
                <span className="text-blue-600">
                  {note.workspace.company.name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Preview */}
      {note.content && (
        <p className="text-gray-700 mb-4 line-clamp-3">{note.content}</p>
      )}

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {note.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-500">
          {formatDate(note.createdAt)}
        </span>

        {/* Voting */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote("up")}
            disabled={loading}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              voteStatus.voteType === "up"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } disabled:opacity-50`}
          >
            👍
          </button>
          <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
            {voteStatus.voteCount}
          </span>
          <button
            onClick={() => handleVote("down")}
            disabled={loading}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              voteStatus.voteType === "down"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } disabled:opacity-50`}
          >
            👎
          </button>
        </div>
      </div>
    </div>
  );
}
