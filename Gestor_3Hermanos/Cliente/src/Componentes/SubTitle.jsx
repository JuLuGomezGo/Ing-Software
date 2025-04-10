import styled from "styled-components";

import Icon from "./Icon";

const SubTitle_Container = styled.div`
border-bottom: 3px solid black;
width: ${({ ancho }) => {
        if (ancho === "completo") return "100%";
        if (ancho === "justo") return "fit-content";
        return ancho || "100%";
    }};
height: 50px;
display: flex;
align-items: center;
justify-content: space-between;
`;
const SubTitle = styled.h2`
font-size: 1.5rem;
display: flex;
align-items: center;
font-weight: 600;
padding-left: 15px;
padding-bottom:0;
margin: 0;
`;

const SubButton = styled.a`
font-size: 1rem;
background-color: transparent;
border: none;
width: fit-content;
display: flex;
align-items: center;
text-decoration: none;
color: black;
cursor: pointer;
`;

const SubTitulo = ({ancho, stitle, icono, size, setButton, btnIcon, onClick, buttonText}) => {
    return (
        <SubTitle_Container ancho={ancho}>
            <SubTitle>{stitle}<Icon src={icono} /></SubTitle>

            {setButton && (

                <SubButton onClick={onClick}>
                    <Icon src={btnIcon} tamaño={size} />
                    {buttonText}
                </SubButton>
            )}
        </SubTitle_Container>
    );
};

//PARAMETROS QUE RECIBE EL COMPONENTE
//ancho: Anchura del componente - "*manual*" "justo"(se ajusta al contenido) o "completo"(todo el espacio disponible)
//stitle: Título de la sección
//icono: Ícono de la sección
//size: Tamaño del icono
//setButton: Indica si se debe mostrar el botón
//btnIcon: Ícono del botón
//onClickEevnt: Evento que se ejecuta al hacer clic en el botón
//buttonText: Texto del botón


export default SubTitulo;