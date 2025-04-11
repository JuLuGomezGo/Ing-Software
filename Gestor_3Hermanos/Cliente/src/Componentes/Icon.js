import styled from 'styled-components';


const Icon = styled.img`
width: ${({ tamaño }) => tamaño ? tamaño : '1.5rem' };
padding: 0 5px; 
`;

//Parametros que recibe el componente
//src: Ruta de la imagen
//tamaño: Tamaño de la imagen

export default Icon;