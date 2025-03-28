import React, { useState, useEffect } from "react";
import styled from "styled-components";

import Header from "../Componentes/Header";
import MainContainer from "../Componentes/MainContainer";

import Icon from "../Componentes/Icon";
import { Table, Th, Td } from "../Componentes/Table";
import Button from "../Componentes/Button";
import SubTitle from "../Componentes/SubTitle";
import { DateBox, TimeBox } from '../Componentes/Date-TimePicker';
import { TextBox, TextArea } from '../Componentes/TextComponent';
// import DropBox from "../components/DropBox";

import backIcon from "../Componentes/Iconos/back.png";
import nuevPedido from "../Componentes/Iconos/nuevoPedido.png";




const Emergente = styled.div`
    background-color: #f9f4ee;
    min-width: 50%;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: left;
    border: 3px dashed #8B572A;
    border-radius: 10px;
`;

const Title1 = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 10px;

    SubTitle {
        width: 70%;
    }
    
    VolverBtn {
        width: 30%;
    }
`;
const Title2 = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: space-between;
    padding: 10px;
`;

const VolverBtn = styled.a`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    text-decoration: none;
    color: #8B572A;
`;

const Segment1 = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: space-between;
    padding: 10px;
`;

const Segment2 = styled.div`
    display: flex;
    flex-direction: row;
    align-items: start;
    justify-content: space-between;
    padding: 10px;
`;


const Container_Descripcion = styled.div`
display: flex;
flex-direction: column;
align-items: start;
justify-content: space-between;
// align-items: center;
// justify-content: space-between;
padding: 10px;
margin: 10px;
// background-color: black;
gap: 20px;

`;


const Container_direccion = styled.div`
    display: grid;
    flex-direction: column;
    align-items: center;
    grid-template:  repeat(3, 1fr)  / repeat(2, auto);
    grid-template-areas:
        "cliente telefono"
        "direccion "
        "fecha hora";
    justify-content: space-around;
    gap: 1px; 
    width: 100%;
    padding: 10px;
`;

const Label = styled.label`
    font-weight: bold;
    width: 100%;
    gridArea: ${props => props.gridArea};
    display: flex;
    align-items: center;
    gap: 10px;
    
`;


function GestionPedidos() {
    return (
        <MainContainer>
            <Header />
            <Emergente>
                <Title1>
                    <SubTitle stitle="Detalles del Pedido" />
                    <VolverBtn href=""> <Icon src={backIcon} /> Volver </VolverBtn>
                </Title1>
                <Segment1>

                    <Label># Pedido:  <TextBox /></Label>

                    <Table>
                        <thead>
                            <tr>
                                <Th>Carne</Th>
                                <Th>Cantidad</Th>
                                <Th>Precio</Th>
                                <Th>Costo/Kg</Th>
                                <Th>SubTotal</Th>
                            </tr>
                        </thead>
                        <tbody>
                            
                            <tr>
                                
                            <Th>Total</Th>
                            <td>$ ---</td>
                            </tr>
                        </tbody>

                    </Table>

                </Segment1>

                <Segment2>

                    <Container_Descripcion>
                        {/* <Label>Descripción:</Label>
                        <TextArea /> */}
                        <Button size="large" variant="secondary" ><Icon src={nuevPedido} />Generar Pedido</Button>
                    </Container_Descripcion>

                    <Title2>
                        <SubTitle stitle="Detalles de Entrega" />

                        <Container_direccion>
                            <Label $gridArea="cliente">Cliente:  <TextBox /></Label>
                            <Label $gridArea="telefono">Telefono:  <TextBox placeholder="XXX-XXXX-XXX" /></Label>
                            <Label $gridArea="direccion">Direccion:  <TextBox /></Label>
                            <Label $gridArea="fecha">Fecha:  < DateBox /></Label>
                            <Label $gridArea="hora">Hora:  <TimeBox /></Label>

                        </Container_direccion>

                    </Title2>

                </Segment2>

            </Emergente>
            <div>
                <Table>
                    <thead>
                        <tr>
                            <Th># Pedido</Th>
                            <Th>Estado</Th>
                            <Th>Productos</Th>
                            <Th>Fecha y Hora</Th>
                            <Th>Total $</Th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        </tr>
                    </tbody>

                </Table>
            </div>
        </MainContainer>
    )

}
export default GestionPedidos;