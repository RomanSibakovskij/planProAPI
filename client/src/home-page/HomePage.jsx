import styled from "styled-components";
import LoginForm from "../loginForm/LoginForm";

const HomePageContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 130px 16px 300px 16px;
  max-width: 1180px;
  margin: 0 auto;
`;

const LeftColumn = styled.div`
  flex: 1;
  padding-right: 20px;
`;

const RightColumn = styled.div`
  flex: 1;
  padding-left: 20px;
`;

const Title = styled.h1`
  font-size: 30px;
  margin-bottom: 20px;
  font-family: "Poppins", sans-serif;
  line-height: 36px;
`;

const Text = styled.p`
  font-size: 20px;
  margin-bottom: 20px;
  font-family: "Poppins", sans-serif;
  line-height: 24px;
`;

function HomePage() {
  return (
    <HomePageContainer>
      <LeftColumn>
        <Title>Streamline Your Projects with PlanPro!</Title>
        <Text>
          Effortlessly manage tasks, deadlines, and resources with our intuitive
          project management system. Boost productivity and stay organized from
          start to finish.
        </Text>
      </LeftColumn>
      <RightColumn>
        <LoginForm />
      </RightColumn>
    </HomePageContainer>
  );
}

export default HomePage;
