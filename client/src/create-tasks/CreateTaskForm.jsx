import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import SyncLoader from "react-spinners/SyncLoader";

const RegistrationContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 auto;
  align-items: center;
  width: 100%;
  max-width: 700px;
  line-height: 36px;
  font-size: 20px;
  color: #666666;
  padding: 50px 30px;
`;

const PrioritySelect = styled.select`
  height: 40px;
  padding: 5px;
  border: 1px solid rgba(221, 221, 221, 1);
  border-radius: 4px;
  outline: none;
  color: #333333;
  font-size: 16px;
  &:focus {
    border-color: #000;
    outline: none;
  }
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
  font-size: 16px;
  &:focus {
    border-color: #000;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  height: 200px;
  padding: 5px;
  border: 1px solid rgba(221, 221, 221, 1);
  border-radius: 4px;
  outline: none;
  color: #333333;
  font-size: 16px;
  resize: vertical;
  &:focus {
    border-color: #000;
    outline: none;
  }
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
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const CreateTaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [priority, setPriority] = useState("medium");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePriorityChange = (e) => {
    setPriority(e.target.value);
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/planpro/projects/${id}/tasks`,
        { ...formData, priority },
      );

      const newTask = response.data;

      // Update project task count only if the ID matches the project ID
      let projectsData = JSON.parse(sessionStorage.getItem("projects"));
      if (projectsData) {
        const updatedProjectsData = projectsData.map((project) => {
          if (project.id === parseInt(id)) {
            const currentTotalTasks = Number(project.total_tasks) || 0;
            const updatedTotalTasks = currentTotalTasks + 1;
            return {
              ...project,
              total_tasks: updatedTotalTasks.toString(),
            };
          }
          return project;
        });

        sessionStorage.setItem("projects", JSON.stringify(updatedProjectsData));
      }

      const storedTasks = sessionStorage.getItem(`project-id${id}_tasks`);
      let tasks = [];

      if (storedTasks) {
        tasks = JSON.parse(storedTasks);
      }

      tasks.push(newTask);

      const updatedTasksData = JSON.stringify(tasks);

      sessionStorage.setItem(`project-id${id}_tasks`, updatedTasksData);

      navigate(`/projects/${id}`);
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationContainer>
      <FormTitle>Create new task</FormTitle>
      <StyledForm onSubmit={handleSubmit}>
        <FormField>
          <Label htmlFor="name">Name:</Label>
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
          {formData.name && formData.name.length === 50 && (
            <span style={{ color: "red" }}>
              Name must be maximum 50 characters long.
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
        </FormField>
        <FormField>
          <Label htmlFor="priority">Priority:</Label>
          <PrioritySelect
            id="priority"
            name="priority"
            value={priority}
            onChange={handlePriorityChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </PrioritySelect>
        </FormField>
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
};

export default CreateTaskForm;
