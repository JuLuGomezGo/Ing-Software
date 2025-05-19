import React, { useState, useRef, useEffect } from "react";
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
  position: relative;
`;

const Nav = styled.nav`
  padding-right: 10%;
  
  @media (max-width: 768px) {
    padding-right: 5%;
  }
  
  ul {
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    list-style: none;
    gap: 40px;
    margin: 0;
    padding: 0;

    @media (max-width: 1024px) {
      gap: 20px;
      font-size: 1.2rem;
    }
  }
`;

const NavItem = styled.li`
  position: relative;
  

`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: white;
  font-weight: bold;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 0;

  &:hover, &:focus {
    color: #f9f4ee;
    cursor: pointer;
    padding-bottom: 5px;
    border-bottom: 3px solid #f9f4ee;
    outline: none;
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
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.3s;

  &:hover, &:focus {
    background-color: rgba(255, 255, 255, 0.1);
    outline: none;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: rgb(161, 128, 88);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  z-index: 100;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;


const MenuItem = styled(Link)`
  color: #f9f4ee;
  font-size: 1.1rem;
  padding: 8px 12px;
  border-radius: 3px;
  text-decoration: none;
  display: block;
  transition: background-color 0.2s;

  &:hover, &:focus {
    background-color: rgba(255, 255, 255, 0.2);
    color: #f9f4ee;
    outline: none;
  }

  & + & {
    margin-top: 5px;
  }
`;

const LogOutBtn = styled.button`
  color: #f9f4ee;
  font-size: 1.1rem;
  padding: 8px 12px;
  border-radius: 3px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover, &:focus {
    background-color: rgba(255, 255, 255, 0.2);
    outline: none;
  }
`;



const UserDropdown = ({ usuario, onLogout, isOpen, onClose, onMouseEnter, onMouseLeave }) => {
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <DropdownMenu
      ref={ref}
      $isOpen={isOpen}
      role="menu"
      aria-hidden={!isOpen}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <LogOutBtn onClick={onLogout} role="menuitem">
        <Icon src={logOutIcon} alt="Logout" /> Cerrar Sesión
      </LogOutBtn>
    </DropdownMenu>
  );
};



const InventoryDropdown = ({ isOpen, onClose }) => {
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <DropdownMenu
      ref={ref}
      $isOpen={isOpen}
      role="menu"
      aria-hidden={!isOpen}
    >
      <MenuItem to="/inventario" role="menuitem">Productos</MenuItem>
      <MenuItem to="/gestion-proveedores" role="menuitem">Proveedores</MenuItem>
      <MenuItem to="/solicitudProducto" role="menuitem">Solicitudes Productos</MenuItem>
    </DropdownMenu>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const rolUsuario = usuario?.rol;

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [inventoryMenuOpen, setInventoryMenuOpen] = useState(false);
  const userMenuTimeout = useRef(null);


  const toggleUserMenu = () => {
    setUserMenuOpen(prev => !prev);
    if (inventoryMenuOpen) setInventoryMenuOpen(false);
  };

  const toggleInventoryMenu = () => {
    setInventoryMenuOpen(prev => !prev);
    if (userMenuOpen) setUserMenuOpen(false);
  };

  const closeAllMenus = () => {
    setUserMenuOpen(false);
    setInventoryMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
    closeAllMenus();
  };

  return (
    <HeaderContainer>
      <Link to="/">
        <Logo src={logoIcon} alt="3Hermanos" />
      </Link>
      <Nav>
        <ul>
          <NavItem>
            <NavLink to="/">
              <Icon src={homeicon} alt="Home" />
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/gestion-pedidos">Pedidos</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/caja">Caja</NavLink>
          </NavItem>
          <NavItem
            onMouseEnter={() => setInventoryMenuOpen(true)}
            onMouseLeave={() => setInventoryMenuOpen(false)}
            onClick={toggleInventoryMenu}
          >
            <NavLink to="/inventario" aria-haspopup="true" aria-expanded={inventoryMenuOpen}>
              Inventario
            </NavLink>
            <InventoryDropdown
              isOpen={inventoryMenuOpen}
              onClose={closeAllMenus}
            />
          </NavItem>

          {rolUsuario !== "Empleado" && (
            <NavItem>
              <NavLink to="/gestion-usuarios">Usuarios</NavLink>
            </NavItem>
          )}

          <NavItem>
            <UserCont
              onClick={toggleUserMenu}
              onMouseEnter={() => {
                clearTimeout(userMenuTimeout.current);
                setUserMenuOpen(true);
              }}
              onMouseLeave={() => {
                userMenuTimeout.current = setTimeout(() => {
                  setUserMenuOpen(false);
                }, 200); // Retardo de 200ms
              }}
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
            >
              {usuario?.rol} <br />
              {usuario?.nombre} {rolUsuario === "Gerente" ? (
                <Icon tamaño="2.5rem" src={gerenteIcon} />
              ) : (
                <Icon tamaño="2.5rem" src={empIcon} />
              )}
            </UserCont>
            <UserDropdown
              usuario={usuario}
              onLogout={handleLogout}
              isOpen={userMenuOpen}
              onClose={() => {
                clearTimeout(userMenuTimeout.current);
                setUserMenuOpen(false);
              }}
              onMouseEnter={() => clearTimeout(userMenuTimeout.current)}
              onMouseLeave={() => {
                userMenuTimeout.current = setTimeout(() => {
                  setUserMenuOpen(false);
                }, 200);
              }}
            />
          </NavItem>
        </ul>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;