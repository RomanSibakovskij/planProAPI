import styled from "styled-components";
import editIcon from "../assets/icons/edit.svg";
import deleteIcon from "../assets/icons/delete.svg";
import { getStatusSvgUrl, getTaskIcons } from "../mainFunctions";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../utils/AuthContext";

const ColumnContainer = styled.div`
  flex: 1;
  border-radius: 5px;
  margin: 1.25rem auto 0;
  width: 100%;
`;

const ColumnTitle = styled.div`
  font-size: 20px;
  margin-bottom: 10px;
  text-align: center;
  font-family: "Poppins", sans-serif;
`;

const TaskList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const TaskItem = styled.li`
  background-color: white;
  border-radius: 3px;
  padding: 0rem 2.25rem 1rem;
  margin-bottom: 10px;
  font-family: "Poppins", sans-serif;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  border-bottom: 1px solid #eee;
`;

const TaskContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #000000;
  cursor: pointer;
  font-size: 1rem;
  font-family: "Poppins", sans-serif;
  word-break: break-word;
  user-select: none;
  margin-right: 1rem;
`;

const TaskDate = styled.span`
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
`;

const ImageContainer = styled.p`
  display: flex;
  gap: 0.5rem;
`;
const StyledIcon = styled.img`
  &:hover {
    filter: brightness(0.5);
    transform: scale(0.9);
  }
`;

const Header = styled.div`
  display: flex;
  gap: 0.625rem;
  justify-content: center;
  padding-bottom: 2rem;
`;

const StatusBubble = styled.img`
  height: 1.375rem;
  width: 1.375rem;
`;

function TaskColumn({ tasks, title, mainStatus, onDeleteModalOpen }) {
  const { isAdmin } = useContext(AuthContext);

  const onDeleteClick = async (projectId) => {
    onDeleteModalOpen(projectId);
  };

  return (
    <ColumnContainer>
      <Header>
        <StatusBubble
          src={getStatusSvgUrl(mainStatus)}
          alt="Task status bubble"
        />
        <ColumnTitle>{title}</ColumnTitle>
      </Header>
      <TaskList>
        {tasks.map((task) => (
          <TaskItem key={task.id}>
            <TaskContent>
              <TaskDate>{task.date}</TaskDate>
              <StyledLink to={`/projects/${task.project_id}/tasks/${task.id}`}>
                {task.name}
              </StyledLink>
            </TaskContent>
            <ImageContainer>
              <img src={getTaskIcons(task.priority)} alt="Priority Icon" />
              {mainStatus !== "done" && (
                <>
                  <Link
                    to={`/projects/${task.project_id}/tasks/${task.id}/edit`}
                  >
                    <StyledIcon src={editIcon} />
                  </Link>
                  {isAdmin && (
                  <StyledIcon
                    src={deleteIcon}
                    onClick={() => {
                      onDeleteClick(task.id);
                    }}
                  />
                  )}
                </>
              )}
            </ImageContainer>
          </TaskItem>
        ))}
      </TaskList>
    </ColumnContainer>
  );
}

export default TaskColumn;