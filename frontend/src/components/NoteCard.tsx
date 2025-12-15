import type { RecentNote } from "../types/index";

interface NoteCardProps {
  note: RecentNote;
}

export default function NoteCard({ note }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const statusColor =
    note.status === "draft"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-green-100 text-green-800";
  const visibilityIcon = note.visibility === "public" ? "🌐" : "🔒";

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {note.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{note.workspace.name}</p>
        </div>
        <span className="ml-2">{visibilityIcon}</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
        >
          {note.status}
        </span>
        <span className="text-sm text-gray-500">
          {formatDate(note.updatedAt)}
        </span>
      </div>
    </div>
  );
}
