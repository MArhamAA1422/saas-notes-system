import { useState, useEffect } from "react";
import type { Note, VoteStatus } from "../types";
import api from "../api/axios";
import { formatDate } from "../utils/index";

interface PublicNoteCardProps {
   note: Note;
   workspaceName?: string;
   onVoteChange?: () => void;
   fromWorkspace?: boolean;
   initialVoteStatus?: VoteStatus | null;
}

export default function PublicNoteCard({
   note,
   workspaceName,
   onVoteChange,
   fromWorkspace,
   initialVoteStatus,
}: PublicNoteCardProps) {
   const [voteStatus, setVoteStatus] = useState<VoteStatus>({
      hasVoted: initialVoteStatus?.hasVoted || false,
      voteType: initialVoteStatus?.voteType || null,
      voteCount: initialVoteStatus?.voteCount || 0,
   });
   const [loading, setLoading] = useState(false);

   // Fetch vote status on mount
   useEffect(() => {
      if (initialVoteStatus) {
         setVoteStatus(initialVoteStatus);
      }
   }, [note.id, initialVoteStatus]);

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

   return (
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
         {/* Header */}
         <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
               <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {note.title}
               </h3>
               <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                  {workspaceName && (
                     <>
                        <span className="flex items-center gap-1">
                           <span>📁</span>
                           <span>{workspaceName}</span>
                        </span>
                        <span>•</span>
                     </>
                  )}
                  <span>by {note.user.fullName}</span>
                  <span>•</span>
                  <span className="text-gray-500">
                     {formatDate(note.createdAt)}
                  </span>
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
                     #{tag.name}
                  </span>
               ))}
            </div>
         )}

         <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {/* Status Badges */}
            <div className="flex items-center gap-2">
               <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                     note.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
               >
                  {note.status}
               </span>
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {note.visibility === "public" ? "Public" : "🔒 Private"}
               </span>
            </div>

            {/* Voting */}
            <div className="flex items-center gap-2">
               {!fromWorkspace && (
                  <>
                     <button
                        onClick={() => handleVote("up")}
                        disabled={loading}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                           voteStatus.voteType === "up"
                              ? "bg-green-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                     >
                        👍
                     </button>

                     <span className="text-base font-bold text-gray-900 min-w-[2.5rem] text-center">
                        {voteStatus.voteCount}
                     </span>

                     <button
                        onClick={() => handleVote("down")}
                        disabled={loading}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                           voteStatus.voteType === "down"
                              ? "bg-red-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                     >
                        👎
                     </button>
                  </>
               )}
            </div>
         </div>
      </div>
   );
}
