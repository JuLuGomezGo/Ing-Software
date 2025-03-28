import React from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";

import Icon from "./Icon";
import logoIcon from '../Componentes/Iconos/LogoTexto.png';
import homeicon from '../Componentes/Iconos/home.png';
import logOutIcon from '../Componentes/Iconos/logOut.png';


const HeaderContainer = styled.header`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #8b4513;
`;


const Nav = styled.nav`
  padding-right: 10%;
  ul {
    font-size: 1.5rem;
    display: flex;
    list-style: none;
    gap: 40px;


    li a {

      text-decoration: none;
      color: white;
      font-weight: bold;
      transition: color 0.3s;
      


      &:hover {
        color: #f9f4ee;
        cursor: pointer;
        padding-bottom: 10px;
        border-bottom: 3px solid #f9f4ee;
      }
    }
  }
`;


const LogOutBtn = styled.a`
background-color: #8b4513;
color: #f9f4ee;
padding: 10px 20px;
border-radius: 5px;
text-decoration: none;
// font-weight: bold;
display: flex;
align-items: center;
gap: 10px;
`;


const Logo = styled.img`
  height: 100px;
`;



const Header = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const rolUsuario = usuario?.rol; // Obtiene el rol del usuario

  const handleLogout = () => {
    localStorage.removeItem("usuario"); // Elimina el usuario del localStorage
    navigate("/login"); // Redirige al login
  };

  return (
    <HeaderContainer>
      <Link to="/">
        <Logo src={logoIcon} alt="3Hermanos" />
      </Link>
      <Nav>
        <ul>
          <li><Link to="/"><Icon src={homeicon} alt="Home" /></Link></li>
          <li><Link to="/gestion-pedidos">Pedidos</Link></li>
          <li><Link to="/caja">Caja</Link></li>
          <li><Link to="/inventario">Inventario</Link></li>
          {/* Mostrar "Usuarios" solo si el rol NO es "Empleado" */}
          {rolUsuario !== "Empleado" && <li><Link to="/gestion-usuarios">Usuarios</Link></li>}
          <li>
            <LogOutBtn onClick={handleLogout}>
              <Icon src={logOutIcon} alt="Logout" />Cerrar Sesión
            </LogOutBtn>
          </li>
        </ul>
      </Nav>
    </HeaderContainer>
  );
};


export default Header;