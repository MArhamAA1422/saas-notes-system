import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Workspaces from "./pages/workspaces/Workspaces";
import WorkspaceNotes from "./pages/workspaces/WorkspaceNotes";
import MyNotes from "./pages/notes/MyNotes";
import NoteEdit from "./pages/notes/NoteEdit";
import PublicNoteDirectory from "./pages/notes/PublicNotesDirectory";
import NoteHistory from "./pages/notes/NoteHistory";
import NotFound from "./pages/NotFound";

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
               <Route path="*" element={<NotFound />} />
            </Routes>
         </BrowserRouter>
      </AuthProvider>
   );
}

export default App;
