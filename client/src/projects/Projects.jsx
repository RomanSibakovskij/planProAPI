import { useState, useContext, useMemo } from "react";
import { ProjectCard } from "./ProjectCard";
import { styled } from "styled-components";
import { useFetch } from "../fetching-data/UseFetch";
import SyncLoader from "react-spinners/SyncLoader";
import Search from "../components/Search";
import CreateButton from "../components/CreateButton";
import Filter from "../components/Filter";
import { AuthContext } from "../utils/AuthContext";
import { DeleteModal } from "../components/DeleteModal";
import axios from "axios";
import downloadIcon from "../assets/download.svg";
import { CSVLink } from "react-csv";
import { useNavigate } from "react-router-dom";

const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  max-width: 77.5rem;
  margin: 1.875rem auto 0;
  justify-content: center;
`;

const Title = styled.p`
  font-size: 2rem;
  font-weight: 500;
  text-align: center;
  padding: 4rem 0 1.25rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  max-width: 77.5rem;
  margin: 0 auto;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const PaginationButton = styled.button`
  width: 150px;
  height: 50px;
  padding: 10px;
  background-color: #ffc107;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: 0 0.5rem;

  &:hover {
    background-color: #b38600;
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

export const Projects = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [deleteModalItemId, setDeleteModalItemId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: projectsData,
    loading: projectsLoading,
    refetch: refetchAllProjects,
  } = useFetch(`http://localhost:3000/api/v1/planpro/projects`, "projects");

  const filteredProjectsData = useMemo(() => {
    let filteredData = projectsData;
    if (selectedStatus) {
      filteredData = filteredData.filter(
        (project) => project.status === selectedStatus,
      );
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filteredData = filteredData.filter(
        (project) =>
          project.name.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower),
      );
    }

    return filteredData;
  }, [projectsData, selectedStatus, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjectsData.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const handleFilterChange = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setCurrentPage(1);
  };

  const handlePaginate = (direction) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    } else if (
      direction === "next" &&
      indexOfLastItem < filteredProjectsData.length
    ) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/planpro/projects/${projectId}`,
      );
      refetchAllProjects();
      setCurrentPage(1);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const headers = [
    { label: "Project ID", key: "id" },
    { label: "Project Name", key: "name" },
    { label: "Description", key: "description" },
    { label: "Status", key: "status" },
  ];

  return (
    <>
      <Title>Projects</Title>
      <ButtonsContainer>
        <CreateButton
          buttonTitle="Add project"
          onClick={() => navigate("/create-project")}
        />
        <Search onSearch={setSearchQuery} />
        <Filter filterElement="projects" onFilterChange={handleFilterChange} />
        <CSVLink
          data={filteredProjectsData}
          headers={headers}
          filename="projects.csv"
        >
          <DownloadIcon src={downloadIcon} alt="Download" />
        </CSVLink>
      </ButtonsContainer>

      <CardsContainer>
        {projectsLoading ? (
          <LoadingContainer>
            <SyncLoader color={"#FFC107"} loading={projectsLoading} size={20} />
          </LoadingContainer>
        ) : (
          currentProjects.map((project) => (
            <ProjectCard
              key={`project-${project.id}`}
              {...project}
              isVisibleDelete={user.role === "admin"}
              onDeleteModalOpen={() => setDeleteModalItemId(project.id)}
            />
          ))
        )}
      </CardsContainer>

      {filteredProjectsData.length > itemsPerPage && (
        <PaginationContainer>
          {currentPage !== 1 && (
            <PaginationButton onClick={() => handlePaginate("prev")}>
              Previous
            </PaginationButton>
          )}
          {!(indexOfLastItem >= filteredProjectsData.length) && (
            <PaginationButton onClick={() => handlePaginate("next")}>
              Next
            </PaginationButton>
          )}
        </PaginationContainer>
      )}

      {deleteModalItemId && (
        <DeleteModal
          projectId={deleteModalItemId}
          onClose={() => setDeleteModalItemId(null)}
          onDelete={() => {
            deleteProject(deleteModalItemId);
            setDeleteModalItemId(null);
          }}
        />
      )}
    </>
  );
};
