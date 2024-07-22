import { useNavigate, useParams } from "react-router-dom";
import { styled } from "styled-components";
import SyncLoader from "react-spinners/SyncLoader";
import TaskColumn from "../components/TaskColumn";
import downloadIcon from "../assets/download.svg";
import Search from "../components/Search";
import CreateButton from "../components/CreateButton";
import { getStatusSvgUrl } from "../mainFunctions";
import { useMemo, useState, useEffect } from "react";
import { useFetch } from "../fetching-data/UseFetch";
import { CSVLink } from "react-csv";
import editIcon from "../assets/icons/edit.svg";
import { DeleteModal } from "../components/DeleteModal";
import axios from "axios";

const ProjectPageContainer = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 4.3rem 1rem 1.25rem;
`;

const ButtonContainer = styled.div`
  margin-bottom: 15px;
`;

const ButtonsContainer = styled.div`
    display: flex;
    align-items: center;
   gap: 0.625rem;
   max-width: 77.5rem;
   margin: 0 auto;
   padding: 4rem 0 0;
   @media (max-width: 48em){
        flex-direction: column;
        align-items: center
        padding: 0 1rem;
    }
`;

const DownloadIcon = styled.img`
  width: 30px;
  height: 30px;
  cursor: pointer;
  &:hover {
    filter: brightness(0.5);
    transform: scale(0.9);
  }
`;

const ColumnsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: "Poppins", sans-serif;
`;

const TaskColumnWrapper = styled.div`
  flex: 1;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 10px;
  margin-right: 15px;
  max-width: 385px;
  width: 100%;
`;

const StatusBubble = styled.img`
  height: 1.375rem;
  width: 1.375rem;
`;

const Title = styled.p`
  font-weight: 500;
  font-size: 1.25rem;
  font-family: "Poppins", sans-serif;
`;

const DescriptionTitle = styled.p`
  font-weight: 500;
  font-size: 1rem;
  font-family: "Poppins", sans-serif;
`;

const Description = styled.p`
  font-size: 1rem;
  line-height: 1.25rem;
  font-family: "Poppins", sans-serif;
`;

const DescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.313rem;
  max-height: 9.375rem;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  gap: 0.625rem;
  padding-bottom: 1.875rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const StyledIcon = styled.img`
  width: 45px;
  height: 45px;
  &:hover {
    filter: brightness(0.5);
    transform: scale(0.9);
  }
`;

function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasksToDo, setTasksToDo] = useState([]);
  const [tasksInProgress, setTasksInProgress] = useState([]);
  const [deleteModalItemId, setDeleteModalItemId] = useState(null);
  const [tasksDone, setTasksDone] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: tasksData,
    loading: tasksLoading,
    refetch: refetchAllProjects,
  } = useFetch(
    `http://localhost:3000/api/v1/planpro/projects/${id}/tasks`,
    `project-id${id}_tasks`,
  );

  useEffect(() => {
    if (tasksData) {
      const filteredTasks = tasksData.filter(
        (task) =>
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      const filteredTasksByStatus = filteredTasks.reduce(
        (acc, task) => {
          if (task.status === "to-do") acc.toDo.push(task);
          else if (task.status === "in-progress") acc.inProgress.push(task);
          else if (task.status === "done") acc.done.push(task);
          return acc;
        },
        { toDo: [], inProgress: [], done: [] },
      );

      setTasksToDo(filteredTasksByStatus.toDo);
      setTasksInProgress(filteredTasksByStatus.inProgress);
      setTasksDone(filteredTasksByStatus.done);
    }
  }, [tasksData, searchQuery]);

  const { data: projectsData, loading: projectsLoading } = useFetch(
    `http://localhost:3000/api/v1/planpro/projects`,
    "projects",
  );

  const projectData = projectsData.find(
    (project) => project.id === parseInt(id),
  );

  const url = getStatusSvgUrl(projectData?.status);

  const headers = [
    { label: "Task ID", key: "id" },
    { label: "Task Name", key: "name" },
    { label: "Description", key: "description" },
    { label: "Priority", key: "priority" },
    { label: "Status", key: "status" },
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/planpro/projects/${projectData?.id}/tasks/${taskId}`,
      );

      const tasksKey = `project-id${projectData?.id}_tasks`;

      let tasks = JSON.parse(sessionStorage.getItem(tasksKey)) || [];
      tasks = tasks.filter((t) => t.id !== taskId);
      sessionStorage.setItem(tasksKey, JSON.stringify(tasks));

      let projectsData = JSON.parse(sessionStorage.getItem("projects"));
      if (projectsData) {
        const updatedProjectsData = projectsData.map((project) => {
          if (project.id === parseInt(projectData?.id)) {
            const currentTotalTasks = Number(project.total_tasks) || 0;
            const closedTasks = currentTotalTasks - 1;

            return {
              ...project,
              total_tasks: closedTasks.toString(),
            };
          }
          return project;
        });
        sessionStorage.setItem("projects", JSON.stringify(updatedProjectsData));
      }
      refetchAllProjects();
      navigate(`/projects/${projectData?.id}`);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <>
      {projectsLoading ? (
        <LoadingContainer>
          <SyncLoader color={"#FFC107"} loading={tasksLoading} size={20} />
        </LoadingContainer>
      ) : (
        <ProjectPageContainer>
          <Header>
            <StatusBubble src={url} alt="Project status bubble" />
            <Title>{projectData?.name}</Title>
          </Header>
          {projectData?.description && (
            <DescriptionContainer>
              <DescriptionTitle>Description</DescriptionTitle>
              <Description>{projectData?.description}</Description>
            </DescriptionContainer>
          )}
          <ButtonContainer>
            <ButtonsContainer>
              <CreateButton
                buttonTitle="Add task"
                onClick={() => navigate(`/projects/${id}/create-task`)}
              />
              <Search onSearch={handleSearch} />
              <CSVLink data={tasksData} headers={headers} filename="tasks.csv">
                <DownloadIcon src={downloadIcon} alt="Download" />
              </CSVLink>
              <StyledIcon
                src={editIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/projects/${id}/edit`);
                }}
              />
            </ButtonsContainer>
          </ButtonContainer>
          {tasksLoading ? (
            <LoadingContainer>
              <SyncLoader color={"#FFC107"} loading={tasksLoading} size={20} />
            </LoadingContainer>
          ) : (
            <ColumnsContainer>
              <TaskColumnWrapper>
                <TaskColumn
                  title="To Do"
                  tasks={tasksToDo}
                  mainStatus="to-do"
                  onDeleteModalOpen={setDeleteModalItemId}
                />
              </TaskColumnWrapper>

              <TaskColumnWrapper>
                <TaskColumn
                  title="In progress"
                  tasks={tasksInProgress}
                  mainStatus="in-progress"
                  onDeleteModalOpen={setDeleteModalItemId}
                />
              </TaskColumnWrapper>

              <TaskColumnWrapper>
                <TaskColumn title="Done" tasks={tasksDone} mainStatus="done" />
              </TaskColumnWrapper>
            </ColumnsContainer>
          )}
        </ProjectPageContainer>
      )}
      {deleteModalItemId && (
        <DeleteModal
          projectId={deleteModalItemId}
          onClose={() => setDeleteModalItemId(null)}
          onDelete={() => {
            deleteTask(deleteModalItemId);
            setDeleteModalItemId(null);
          }}
        />
      )}
    </>
  );
}

export default ProjectPage;
