import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
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

const CreateProjectForm = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validation function to check form data
  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (
      !formData.name ||
      formData.name.length < 2 ||
      formData.name.length > 50
    ) {
      valid = false;
      newErrors.name = "Name must be between 2 and 50 characters long.";
    }

    if (
      !formData.description ||
      formData.description.length < 2 ||
      formData.description.length > 10000
    ) {
      valid = false;
      newErrors.description =
        "Description must be between 2 and 10000 characters long.";
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Do not proceed if the form is invalid
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/planpro/projects",
        formData,
      );

      const newProject = response.data;
      newProject.total_tasks = "0";
      newProject.closed_tasks = "0";

      const storedProjects =
        JSON.parse(sessionStorage.getItem("projects")) || [];

      const updatedProjects = [...storedProjects, newProject];

      sessionStorage.setItem("projects", JSON.stringify(updatedProjects));

      navigate("/projects");
    } catch (error) {
      setErrors({ api: "Error creating project: " + error.message });
      console.error("Error creating project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationContainer>
      <FormTitle>Create new project</FormTitle>
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
            minLength={3}
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
        {errors && <p style={{ color: "red" }}>{errors.api}</p>}
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

export default CreateProjectForm;
