import React, {useEffect, useState, useRef} from "react";
import styled from "styled-components"; 
import { Link, useNavigate } from "react-router-dom";

import Icon from "./Icon";
import logoIcon from '../Componentes/Iconos/LogoTexto.png';
import homeicon from '../Componentes/Iconos/home.png';
import logOutIcon from '../Componentes/Iconos/logOut.png';
import gerenteIcon from '../Componentes/Iconos/gerente.png';
import empIcon from '../Componentes/Iconos/empleado.png';


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


const Logo = styled.img`
  height: 100px;
`;

const UserCont = styled.div`
  color: #f9f4ee;
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

const UserMenu = styled.div`
  position: absolute;
  top: 100px;
  right: 150px;
  background-color:rgb(161, 128, 88);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const LogOutBtn = styled.a`
color: #f9f4ee;
font-size: 1.2rem;
padding: 10px 20px;
border-radius: 5px;
text-decoration: none;
display: flex;
align-items: center;
gap: 10px;
`;
const MenuInventario = styled.div`
  position: absolute; 
  top: 100px;
  right: 350px;
  background-color:rgb(161, 128, 88);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;


const Header = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const rolUsuario = usuario?.rol; // Obtiene el rol del usuario

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuInventarioVisible, setMenuInventarioVisible] = useState(false);

  const mostrarMenu = () => {
    setMenuVisible(prev => !prev);
  };

  const mostrarMenuInventario = () => {
    setMenuInventarioVisible(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
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
          <li onMouseEnter={mostrarMenuInventario} >
            <Link to="/inventario">Inventario</Link>
          </li>
          {menuInventarioVisible && (
            <MenuInventario onMouseLeave={mostrarMenuInventario}>
              <li><Link to="/inventario">Productos</Link></li>
              <li><Link to="/gestion-proveedores">Proveedores</Link></li>
              <li><Link to="/solicitudProducto">Solicitudes Productos</Link></li>
            </MenuInventario>
            
          )}
          {/* Mostrar "Usuarios" solo si el rol NO es "Empleado" */}
          {rolUsuario !== "Empleado" && <li><Link to="/gestion-usuarios">Usuarios</Link></li>}
          <li>
            <UserCont onClick ={mostrarMenu}>
              {usuario?.rol} <br />
              {usuario?.nombre} {rolUsuario === "Gerente" ? <Icon tamaño="2.5rem" src={gerenteIcon} /> : <Icon tamaño="2.5rem" src={empIcon} />}
            </UserCont>
            {menuVisible && (
              <UserMenu>
                <LogOutBtn onClick={handleLogout}>
                  <Icon src={logOutIcon} alt="Logout" />Cerrar Sesión
                </LogOutBtn>
              </UserMenu>
            )}
          </li>
        </ul>
      </Nav>
    </HeaderContainer>
  );
};


export default Header;