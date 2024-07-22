import { useState, useEffect, useMemo } from "react";
import { useFetch } from "../fetching-data/UseFetch";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import SyncLoader from "react-spinners/SyncLoader";

const RegistrationContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 auto;
  align-items: center;
  max-width: 700px;
  width: 100%;
  padding: 50px 30px;
  line-height: 36px;
  font-size: 20px;
  color: #666666;
`;

const FormTitle = styled.p`
  color: #333333;
  font-weight: 400;
  font-size: 1.5rem;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const FormField = styled.div`
  font-size: 16px;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 16px;
`;

const Label = styled.label`
  height: 24px;
  margin-bottom: 7px;
  font-size: 16px;
`;

const Input = styled.input`
  height: 40px;
  padding: 5px;
  border: 1px solid rgba(221, 221, 221, 1);
  border-radius: 4px;
  outline: none;
  color: #333333;

  &:focus {
    border-color: #000;
  }
`;

const TextArea = styled.textarea`
  height: 200px;
  padding: 5px;
  border: 1px solid rgba(221, 221, 221, 1);
  border-radius: 4px;
  color: #333333;

  &:focus {
    border-color: #000;
  }
`;
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 45px;
  padding: 10px;
  background-color: #ffc107;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 20px;

  &:hover {
    background-color: #b38600;
  }
`;

const Select = styled.select`
  height: 40px;
  padding: 5px;
  border: 1px solid rgba(221, 221, 221, 1);
  border-radius: 4px;
  outline: none;
  color: #333333;

  &:focus {
    border-color: #000;
  }
`;

function EditProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const { data: projectsData } = useFetch(
    `http://localhost:3000/api/v1/planpro/projects`,
    "projects",
  );

  // Keep track of the original project data
  const originalProject = useMemo(() => {
    return projectsData.find((project) => project.id === parseInt(id));
  }, [projectsData, id]);

  useEffect(() => {
    if (originalProject) {
      setFormData({
        name: originalProject.name || "",
        description: originalProject.description || "",
        status: originalProject.status || '',
      });
    }
  }, [originalProject]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (errors !== null) {
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:3000/api/v1/planpro/projects/${id}`,
        formData,
      );

      // Merge the updated fields with the original project data
      const updatedProject = {
        ...originalProject,
        ...response.data,
      };

      // Update session storage with the updated project data
      const updatedProjects = projectsData.map((project) =>
        project.id === parseInt(id) ? updatedProject : project,
      );
      sessionStorage.setItem("projects", JSON.stringify(updatedProjects));

      navigate(`/projects/${id}`);
    } catch (error) {
      setErrors(error);
      console.error("Error updating project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationContainer>
      <FormTitle>Edit Project</FormTitle>
      <StyledForm onSubmit={handleSubmit}>
        <FormField>
          <Label htmlFor="name">Project Name:</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            minLength={2}
            maxLength={50}
            required
          />
          {formData.name && formData.name.length === 0 && (
            <span style={{ color: "red" }}>Name is required.</span>
          )}
          {formData.name && formData.name.length < 2 && (
            <span style={{ color: "red" }}>
              Name must be at least 2 characters long.
            </span>
          )}
          {formData.name && formData.name.length > 50 && (
            <span style={{ color: "red" }}>
              Name must be at most 50 characters long.
            </span>
          )}
        </FormField>
        <FormField>
          <Label htmlFor="description">Description:</Label>
          <TextArea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            minLength={2}
            maxLength={10000}
            required
          />
          {formData.description && formData.description.length === 0 && (
            <span style={{ color: "red" }}>Description is required.</span>
          )}
          {formData.description && formData.description.length < 2 && (
            <span style={{ color: "red" }}>
              Description must be at least 2 characters long.
            </span>
          )}
          {formData.description && formData.description.length === 10000 && (
            <span style={{ color: "red" }}>
              Description must be at most 10000 characters long.
            </span>
          )}
        </FormField>
       {Number(originalProject?.total_tasks) === Number(originalProject?.closed_tasks) && <FormField>
          <Label htmlFor="status">Status:</Label>
          <Select id="status" name="status" value={formData.status} onChange={handleChange} required>
            {/* <option value="Select status">Select status</option> */}
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </Select>
        </FormField>}
        {loading ? (
          <LoadingContainer>
            <SyncLoader color={"#FFC107"} loading={loading} size={20} />
          </LoadingContainer>
        ) : (
          <SubmitButton type="submit">Submit</SubmitButton>
        )}
      </StyledForm>
    </RegistrationContainer>
  );
}

export default EditProjectPage;
