import type { Workspace } from "../types/index";

interface WorkspaceCardProps {
  workspace: Workspace;
}

export default function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            📁 {workspace.name}
          </h3>
        </div>
      </div>
      <div className="mt-3">
        <span className="text-sm text-gray-600">
          {workspace.notesCount} {workspace.notesCount === 1 ? "note" : "notes"}
        </span>
      </div>
    </div>
  );
}
