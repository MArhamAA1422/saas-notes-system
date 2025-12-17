import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Workspaces from "./pages/Workspaces";
import WorkspaceNotes from "./pages/WorkspaceNotes";
import MyNotes from "./pages/MyNotes";
import NoteEdit from "./pages/NoteEdit";
import PublicNoteDirectory from "./pages/PublicNotesDirectory";
import NoteHistory from "./pages/NoteHistory";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspaces"
            element={
              <ProtectedRoute>
                <Workspaces />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspaces/:id/notes"
            element={
              <ProtectedRoute>
                <WorkspaceNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-notes/:type"
            element={
              <ProtectedRoute>
                <MyNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/:id/edit"
            element={
              <ProtectedRoute>
                <NoteEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/:id/history"
            element={
              <ProtectedRoute>
                <NoteHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/public/notes"
            element={
              <ProtectedRoute>
                <PublicNoteDirectory />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
