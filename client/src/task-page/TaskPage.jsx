import { Link, useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getTaskIcons, getStatusSvgUrl } from "../mainFunctions";
import editIcon from "../assets/icons/edit.svg";
import deleteIcon from "../assets/icons/delete.svg";
import SyncLoader from "react-spinners/SyncLoader";
import { useFetch } from "../fetching-data/UseFetch";
import axios from "axios";
import { DeleteModal } from "../components/DeleteModal";
import { useContext, useState } from "react";
import { AuthContext } from "../utils/AuthContext";

const TaskPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60%;
  margin: 6.25rem auto;
  padding: 20px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
`;

const DetailItem = styled.div`
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;

  h2 {
    font-size: 0.85rem;
    color: #818181;
    margin-bottom: 0.5rem;
    font-weight: normal;
  }

  p {
    font-size: 1.1rem;
    margin: 10px 0;
  }
`;

const TaskDetails = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const TaskActions = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  button {
    margin-right: 10px;
    background-color: #4caf50;
    border: none;
    color: white;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
  }
`;
const TaskActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 20px;
`;

const ImageContainer = styled.p`
  display: flex;
  gap: 0.5rem;
`;
const StyledIcon = styled.img`
  cursor: pointer;
  &:hover {
    filter: brightness(0.5);
    transform: scale(0.9);
  }
`;

const StatusandPriorityContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StatusandPriorityIcon = styled.img`
  margin-right: 10px;
`;

const TaskStatusandPriority = styled.p`
  font-size: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const TaskPage = () => {
  const { projectId, taskId } = useParams();
  const [deleteModalItemId, setDeleteModalItemId] = useState(null);
  const navigate = useNavigate();
  const { isAdmin } = useContext(AuthContext);

  const onDeleteClick = async (taskId) => {
    setDeleteModalItemId(taskId);
  };

  const getStatusDisplayText = (status) => {
    const statusMap = {
      "to-do": "To do",
      "in-progress": "In Progress",
      done: "Done",
    };
    return statusMap[status] || status;
  };

  const getPriorityDisplayText = (priority) => {
    const priorityMap = {
      high: "High",
      medium: "Medium",
      low: "Low",
    };
    return priorityMap[priority] || priority;
  };

  const { data: tasksData, loading: tasksLoading } = useFetch(
    `http://localhost:3000/api/v1/planpro/projects`,
    `project-id${projectId}_tasks`,
  );

  const task = tasksData.find((task) => task.id === Number(taskId));

  const deleteTask = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/planpro/projects/${projectId}/tasks/${task.id}`,
      );

      const tasksKey = `project-id${projectId}_tasks`;
      let tasks = JSON.parse(sessionStorage.getItem(tasksKey)) || [];

      tasks = tasks.filter((t) => t.id !== task.id);
      sessionStorage.setItem(tasksKey, JSON.stringify(tasks));

      let projectsData = JSON.parse(sessionStorage.getItem("projects"));
      if (projectsData) {
        const updatedProjectsData = projectsData.map((project) => {
          if (project.id === parseInt(projectId)) {
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
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <>
      {task && (
        <TaskPageWrapper>
          {task.status !== "done" && (
            <TaskActionsContainer>
              <TaskActions>
                <ImageContainer>
                  <Link to={`/projects/${projectId}/tasks/${taskId}/edit`}>
                    <StyledIcon src={editIcon} />
                  </Link>
                  {isAdmin && (
                  <StyledIcon
                    src={deleteIcon}
                    onClick={() => {
                      console.log("Icon clicked");
                      onDeleteClick(task?.id);
                    }}
                  />
                  )}
                </ImageContainer>
              </TaskActions>
            </TaskActionsContainer>
          )}
          {task && (
            <TaskDetails>
              <DetailItem>
                <h2>Title:</h2>
                <p>{task.name}</p>
              </DetailItem>
              <DetailItem>
                <h2>Task ID:</h2>
                <p>{task.id}</p>
              </DetailItem>
              <DetailItem>
                <h2>Description:</h2>
                <p>{task.description}</p>
              </DetailItem>
              <DetailItem>
                <h2>Status:</h2>
                <StatusandPriorityContainer>
                  <StatusandPriorityIcon
                    src={getStatusSvgUrl(task?.status)}
                    alt="Status Icon"
                  />
                  <TaskStatusandPriority>
                    {getStatusDisplayText(task.status)}
                  </TaskStatusandPriority>
                </StatusandPriorityContainer>
              </DetailItem>
              <DetailItem>
                <h2>Priority:</h2>
                <StatusandPriorityContainer>
                  <StatusandPriorityIcon
                    src={getTaskIcons(task?.priority)}
                    alt="Priority Icon"
                  />
                  <TaskStatusandPriority>
                    {getPriorityDisplayText(task.priority)}
                  </TaskStatusandPriority>
                </StatusandPriorityContainer>
              </DetailItem>
              <DetailItem>
                <h2>Create date:</h2>
                <p>{task.created_on.split("T")[0]}</p>
              </DetailItem>
              <DetailItem>
                <h2>Edit date:</h2>
                <p>{task.updated_on.split("T")[0]}</p>
              </DetailItem>
            </TaskDetails>
          )}
          {!task && <p>Loading...</p>}
        </TaskPageWrapper>
      )}
      {tasksLoading && (
        <LoadingContainer>
          <SyncLoader color={"#FFC107"} loading={tasksLoading} size={20} />
        </LoadingContainer>
      )}
      {deleteModalItemId && (
        <DeleteModal
          projectId={deleteModalItemId}
          onClose={() => setDeleteModalItemId(null)}
          onDelete={() => {
            deleteTask();
            setDeleteModalItemId(null);
          }}
        />
      )}
    </>
  );
};

export default TaskPage;
