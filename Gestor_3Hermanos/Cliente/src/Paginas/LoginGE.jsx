

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../Componentes/Iconos/LogoTexto.png';
import Button from '../Componentes/Button';
import { TextBox, Label } from '../Componentes/TextComponent';
import MainContainer from '../Componentes/MainContainer';

const Container = styled.div`
  display: flex;
  margin-top: 2%;
  width: 90%;
  max-width: 1200px;
  height: 600px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  border-radius: 15px;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

const Sidebar = styled.div`
  width: 35%;
  background: #733c10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  @media (max-width: 768px) {
    width: 100%;
    padding: 1.5rem;
  }
`;

const LogoImage = styled.img`
  width: 250px;
  height: auto;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    width: 180px;
  }
`;

const LoginForm = styled.div`
  width: 65%;
  background: #fdf7e5;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;

  @media (max-width: 768px) {
    width: 100%;
    padding: 2rem;
  }
`;


const Title = styled.h2`
  color: #5d4a36;
  font-size: 2rem;
  margin-bottom: 2rem;
  font-family: 'Arial Black', sans-serif;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const InputGroup = styled.div`
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
`;

function Login() {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('usuario', JSON.stringify(data.data));
        setError('');

        // Redirigir según el rol
        if (data.data.rol === 'Repartidor') {
          navigate('/pedidos'); // Ruta para el repartidor
        } else {
          navigate('/Home'); // Ruta normal
        }


      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <MainContainer>
      <Container>
        <Sidebar>
          <LogoImage src={logo} alt="Gestor 3 Hermanos" />
        </Sidebar>
        <LoginForm>
          <Title>Inicio de Sesión</Title>

          <InputGroup>
            <Label>Correo:</Label>
            <TextBox
              type="text"
              placeholder="Ingrese su correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <Label>Contraseña:</Label>
            <TextBox
              type="password"
              placeholder="Ingrese su contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
            />
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button onClick={handleLogin}>Ingresar</Button>
        </LoginForm>
      </Container>
    </MainContainer>
  );
}

export default Login;
