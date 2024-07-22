import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../utils/AuthContext';
import { styled } from 'styled-components';
import { useFetch } from '../fetching-data/UseFetch';
import FolderIcon from '../assets/icons/folder.svg';
import CheckmarkIcon from '../assets/icons/checkmark.svg';
import Prioritymark from '../assets/icons/priority-mark.svg';
import { getStatusSvgUrl, getTaskIcons } from '../mainFunctions';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DashboardContainer = styled.div`
  display: flex;
  justify-content: center;
  max-width: 77.5rem;
  margin: 0 auto;
  padding: 5rem;
`;

const WelcomeMessage = styled.h2`
  font-size: 1.3rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const UserInfo = styled.p`
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const RightColumn = styled.div`
  margin-left: 2rem;
`;

const InfoBox = styled.div`
  width: 90%;
  max-width: 200px;
  height: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #dddddd;
  border-radius: 0.25rem;
  box-sizing: border-box;
  margin-bottom: 0.7rem;
`;

const StyledInfoTitle = styled.div`
  font-size: 1rem;
  margin-bottom: 0.7rem;
`;

const StyledIcon = styled.img`
  width: 1.3rem;
  height: 1.3rem;
  margin-right: 0.5rem;
  vertical-align: middle;
`;

const PriorityIcon = styled.img`
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
`;

const StyledInfoContent = styled.div`
  font-size: 1rem;
  margin-top: 0.5rem;
`;

const Label = styled(StyledInfoContent)`
  color: #000000;
  flex: 1;
  margin-top: 0;
`;

const TotalInfo = styled(StyledInfoContent)`
  color: #818181;
`;

const ActiveInfo = styled(StyledInfoContent)`
  color: #ff89c4;
`;
const InProgressInfo = styled(StyledInfoContent)`
  color: #ffc107;
`;

const DoneInfo = styled(StyledInfoContent)`
  color: #92e044;
`;

const ManageLink = styled.a`
  font-size: 0.85rem;
  margin-top: 1.5rem;
  color: #c7c6c6;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
`;
const StyledInfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 0.5rem;
  width: 100%;
`;

const ProjectItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.8rem;
  border: 1px solid #dddddd;
  border-radius: 5px;
  margin-bottom: 0.7rem;

  img {
    width: 20px;
    height: 20px;
    margin-right: 1rem;
  }
`;
const StyledLink = styled(Link)`
  text-decoration: none;
  color: #000000;
`;

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  
  const { data: projectsData, loading: projectsLoading } = useFetch(`http://192.168.1.100:3000/api/v1/planpro/projects`, 'projects');
  const { data: tasksCountData, loading: tasksCountLoading } = useFetch(`http://192.168.1.100:3000/api/v1/planpro/projects/tasks/count`, 'tasksCount');

  const [projectsInfo, setProjectsInfo] = useState({ total: 0, active: 0, done: 0 });
  const [tasksCount, setTasksCount] = useState(null);

  useEffect(() => {
    if (!projectsLoading && projectsData) {
      let totalProjects = projectsData.length;
      let activeProjects = projectsData.filter((project) => project.status === 'in-progress').length;
      let doneProjects = projectsData.filter((project) => project.status === 'done').length;

      setProjectsInfo({
        total: totalProjects,
        active: activeProjects,
        done: doneProjects,
      });
    }
  }, [projectsData, projectsLoading]);

  useEffect(() => {
    console.log("Tasks Count Data:", tasksCountData);
    if (!tasksCountLoading && tasksCountData) {
      setTasksCount(tasksCountData);
    }
  }, [tasksCountData, tasksCountLoading]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'projects' || event.key === 'tasksCount') {
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const fetchTasksCount = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/planpro/projects/tasks/count');
        setTasksCount(response.data);
      } catch (error) {
        console.error('Error fetching tasks count:', error);
      }
    };
  
    fetchTasksCount();
  }, []);


  return (
    <DashboardContainer>
      <div>
        <WelcomeMessage>Dashboard</WelcomeMessage>
        {user && (
          <UserInfo>
            Welcome, {user.name}! You are logged in as {user.role}. Here you can
            manage your projects, tasks, and more.
          </UserInfo>
        )}
        {projectsData && (
          <div>
            {projectsData.map((project) => (
              <StyledLink to={`/projects/${project.id}`} key={project.id}>
                <ProjectItem>
                  <img src={getStatusSvgUrl(project.status)} alt={project.status} />
                  <span>{project.name}</span>
                </ProjectItem>
              </StyledLink>
            ))}
          </div>
        )}
      </div>
      <RightColumn>
        <InfoBox>
          <StyledInfoTitle>
            <StyledIcon src={FolderIcon} alt="Folder Icon" />
            Projects
          </StyledInfoTitle>
          <StyledInfoItem>
            <Label>Total</Label>
            <TotalInfo>{projectsInfo.total}</TotalInfo>
          </StyledInfoItem>
          <StyledInfoItem>
            <Label>Active</Label>
            <ActiveInfo>{projectsInfo.active}</ActiveInfo>
          </StyledInfoItem>
          <StyledInfoItem>
            <Label>Done</Label>
            <DoneInfo>{projectsInfo.done}</DoneInfo>
          </StyledInfoItem>
          <StyledInfoItem>
            <ManageLink href="/projects">Manage your projects</ManageLink>
          </StyledInfoItem>
        </InfoBox>
        <InfoBox>
          <StyledInfoTitle>
            <StyledIcon src={CheckmarkIcon} alt="Checkmark Icon" />
            Tasks
          </StyledInfoTitle>
          <StyledInfoItem>
            <Label>Total</Label>
            <TotalInfo>{tasksCount && tasksCount.total_tasks}</TotalInfo>
          </StyledInfoItem>
          <StyledInfoItem>
            <Label>To do</Label>
            <ActiveInfo>{tasksCount && tasksCount.to_do}</ActiveInfo>
          </StyledInfoItem>
          <StyledInfoItem>
            <Label>In progress</Label>
            <InProgressInfo>{tasksCount && tasksCount.in_progress}</InProgressInfo>
          </StyledInfoItem>
          <StyledInfoItem>
            <Label>Done</Label>
            <DoneInfo>{tasksCount && tasksCount.done}</DoneInfo>
          </StyledInfoItem>
        </InfoBox>

        <InfoBox>
          <StyledInfoTitle>
            <StyledIcon src={Prioritymark} alt="Priority Icon" />
            Tasks priority
          </StyledInfoTitle>
          <StyledInfoItem>
            <PriorityIcon src={getTaskIcons('high')} alt="High priority" />
            <Label>High</Label>
            <TotalInfo>{tasksCount && tasksCount.high_priority}</TotalInfo>
          </StyledInfoItem>
          <StyledInfoItem>
            <PriorityIcon src={getTaskIcons('medium')} alt="Medium priority" />
            <Label>Medium</Label>
            <TotalInfo>{tasksCount && tasksCount.medium_priority}</TotalInfo>
          </StyledInfoItem>
          <StyledInfoItem>
            <PriorityIcon src={getTaskIcons('low')} alt="Low priority" />
            <Label>Low</Label>
            <TotalInfo>{tasksCount && tasksCount.low_priority}</TotalInfo>
          </StyledInfoItem>
        </InfoBox>
      </RightColumn>
    </DashboardContainer>
  );
};
