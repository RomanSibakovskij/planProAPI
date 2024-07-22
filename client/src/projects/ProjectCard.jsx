import { styled } from "styled-components";
import { useContext } from "react";
import { getStatusSvgUrl } from "../mainFunctions";
import deleteIcon from "../assets/icons/delete.svg";
import editIcon from "../assets/icons/edit.svg";
import { AuthContext } from "../utils/AuthContext";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  border: 1px solid #dddddd;
  border-radius: 0.25rem;
  max-width: 25rem;
  height: 17.5rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  @media (max-width: 48em) {
  }
`;
const StatusBubble = styled.img`
  height: 1.375rem;
  width: 1.375rem;
`;

const Header = styled.div`
  display: flex;
  gap: 0.625rem;
`;

const Title = styled.p`
  font-weight: 500;
  font-size: 1.25rem;
  word-break: break-word;
  user-select: none;
  cursor: pointer;
`;

const DescriptionTitle = styled.p`
  font-weight: 500;
  font-size: 1rem;
  user-select: none;
  cursor: pointer;
`;

const Description = styled.p`
  font-size: 0.9rem;
  line-height: 1.25rem;
  word-break: break-word;
  user-select: none;
  cursor: pointer;
`;

const DescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.313rem;
  max-height: 9.375rem;
  height: 100%;
`;

const TaskInfo = styled.p`
  font-size: 1rem;
  color: #c7c6c6;
  user-select: none;
  cursor: pointer;
`;

const TaskContainer = styled.p`
  display: flex;
  align-items: center;
  justify-content: space-between;
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

export const ProjectCard = ({
  id,
  name,
  description,
  status,
  closed_tasks,
  total_tasks,
  isVisibleDelete,
  onDeleteModalOpen,
}) => {
  const url = getStatusSvgUrl(status);
  const navigate = useNavigate();
  const onDeleteClick = async (projectId) => {
    onDeleteModalOpen(projectId);
  };

  const truncateDescription = (description) => {
    if (description?.length <= 255) {
      return description;
    } else {
      const lastSpaceIndex = description.lastIndexOf(" ", 255);
      return description.substring(0, lastSpaceIndex).trim() + "...";
    }
  };
  return (
    <>
      <Container onClick={() => navigate(`/projects/${id}`)}>
        <Header>
          <StatusBubble src={url} alt="Project status bubble" />
          <Title>{name}</Title>
        </Header>
        <DescriptionContainer>
          <DescriptionTitle>Description</DescriptionTitle>
          <Description>{truncateDescription(description)}</Description>
        </DescriptionContainer>
        <TaskContainer>
          <TaskInfo>
            Tasks done: {closed_tasks}/{total_tasks}
          </TaskInfo>
          <ImageContainer>
            <StyledIcon
              src={editIcon}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${id}/edit`)
              }}
            />
            {isVisibleDelete && (
              <StyledIcon
                src={deleteIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(id);
                }}
              />
            )}
          </ImageContainer>
        </TaskContainer>
      </Container>
    </>
  );
};
