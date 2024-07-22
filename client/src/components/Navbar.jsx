import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import logo from "../assets/logo.svg";
import projects_icon from "../assets/projects_icon.svg";
import tasks_icon from "../assets/tasks_icon.svg";
import account_icon from "../assets/account_icon.svg";
import { useContext, useState } from "react";
import { AuthContext } from "../utils/AuthContext";

const MainContainer = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
  flex-shrink: 0;
  // padding: 6px 20px;
`;

const NavbarContainer = styled.nav`
  background-color: black;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 20px;
  height: 50px;
`;

const LogoContainer = styled.div``;
const Logo = styled.img`
  height: 23px;
`;

const IconsContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  height: 100%;
`;

const Icon = styled(Link)`
  color: white;
  font-size: 24px;
  margin: 0 10px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    height: 38px;
    width: auto;
  }
`;

const DropdownMenu = styled.div`
  position: relative;
`;

const DropdownContent = styled.div`
  display: ${(props) => (props.isOpen ? "block" : "none")};
  position: absolute;
  background-color: white;
  border: 1px solid #ddd;
  padding: 8px 0;
  min-width: 120px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
  font-family: "Poppins", sans-serif;
`;

const DropdownItem = styled.div`
  padding: 10px 20px;
  color: black;
  display: block;
  cursor: pointer;
  width: 100%;
  a {
    text-decoration: none;
    color: black;
    font-family: "Poppins", sans-serif;
    &:hover {
      color: #a9a9a9;
    }
  }
`;

const LogoutLink = styled.p`
  text-decoration: none;
  color: black;
  font-family: "Poppins", sans-serif;

  &:hover {
    color: #a9a9a9;
  }
`;

function Navbar() {
  const { isAuthenticated, isAdmin, logoutUser } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logoutUser();
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
    <NavbarContainer>
      <MainContainer>
        <LogoContainer>
          <Link to="/">
            <Logo src={logo} alt="Logo" />
          </Link>
        </LogoContainer>
        <IconsContainer>
          {isAuthenticated && (
            <>
              <Icon to="/projects">
                <img src={projects_icon} alt="Projects icon" />
              </Icon>
              <DropdownMenu>
                <Icon to="#" onClick={toggleMenu}>
                  <img src={account_icon} alt="Account icon" />
                </Icon>
                <DropdownContent isOpen={isMenuOpen}>
                  {isAdmin && (
                    <DropdownItem>
                      <Link to="/logs">Logs</Link>
                    </DropdownItem>
                  )}
                  <DropdownItem onClick={handleLogout}>
                    <LogoutLink>Log out</LogoutLink>
                  </DropdownItem>
                </DropdownContent>
              </DropdownMenu>
            </>
          )}
        </IconsContainer>
      </MainContainer>
    </NavbarContainer>
  );
}

export default Navbar;
