import { Routes, Route, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./home-page/HomePage";
import Footer from "./components/Footer";
import ProjectPage from "./project-page/ProjectPage";
import { Dashboard } from "./dashboard/Dasboard";
import RegistrationPage from "./registration-page/RegistrationPage";
import { AuthContext } from "./utils/AuthContext";
import { Projects } from "./projects/Projects";
import CreateProjectForm from "./create-project/CreateProjectForm";
import CreateTaskForm from "./create-tasks/CreateTaskForm";
import TaskPage from "./task-page/TaskPage";
import LogPage from "./logPage/LogPage";
import EditProjectPage from "./edit-project-page/EditProjectPage";
import EditTaskPage from "./edit-task-page/EditTaskPage";
import ErrorPage from "./error-page/ErrorPage";
import PrivateRoute from "./routes/privateRoutes";

function App() {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    isAuthenticated;
  }, [isAuthenticated, navigate]);

  return (
    <>
      <Navbar />
      <Routes>
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectPage />} />
            <Route path="/create-project" element={<CreateProjectForm />} />
            <Route path="/projects/:id/create-task" element={<CreateTaskForm />} />
            <Route
              path="/logs"
              element={
                <PrivateRoute roles={['admin']}>
                  <LogPage />
                </PrivateRoute>
              }
            />
            <Route path="/projects/:projectId/tasks/:taskId" element={<TaskPage />} />
            <Route path="*" element={<ErrorPage />} />
            <Route path="/projects/:id/edit" element={<EditProjectPage />} />
            <Route path="/projects/:projectId/tasks/:taskId/edit" element={<EditTaskPage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/registration" element={<RegistrationPage />} />
          </>
        )}
      </Routes>
      <Footer />
    </>
  );
}

export default App;
