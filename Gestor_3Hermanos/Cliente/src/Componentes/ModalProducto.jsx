import React from "react";
import styled from "styled-components";
import Button from "../Componentes/Button";
import Icon from "../Componentes/Icon";
import DropBox from "../Componentes/DropBox";
import { TextBox } from "../Componentes/TextComponent";
import SubTitulo from "./SubTitle";

import addIcon from "../Componentes/Iconos/new.png";
import details from "../Componentes/Iconos/details.png";
import idIcon from "../Componentes/Iconos/id.png";
import productoIcon from "../Componentes/Iconos/productoIcon.png";
import stockIcon from "../Componentes/Iconos/stock.png";
import priceIcon from "../Componentes/Iconos/priceIcon.png";
import proveedorIcon from "../Componentes/Iconos/proveedorIcon.png";
import newIcon from "../Componentes/Iconos/preparando.png";
import backIcon from "../Componentes/Iconos/back.png";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: #f9f4ee;
  border: 4px dashed #b3815d;
  padding: 1.5rem;
  gap: 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-bottom: 1px solid #b3815d;
  padding-bottom: 0.5rem;
`;

const VolverBtn = styled.a`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  margin: fit-content;
  padding: 10px;
  text-decoration: none;
  color: #8B572A;
  cursor: pointer;
`;

const Label = styled.label`
  font-weight: bold;
  color: #5d4037;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModalProducto = ({ showModal, handleCloseModal, mode }) => {
    if (!showModal) return null;

    // Definir título y botón según la acción
    const getModalConfig = () => {
        switch (mode) {
            case "nuevo":
                return { title: "Nuevo Producto", buttonText: "Guardar", icon: addIcon };
            case "editar":
                return { title: "Editar Producto", buttonText: "Actualizar", icon: details };
            case "agregarStock":
                return { title: "Agregar Stock", buttonText: "Añadir", icon: stockIcon };
            default:
                return { title: "Producto", buttonText: "Guardar", icon: newIcon };
        }
    };

    const { title, buttonText, icon } = getModalConfig();


    const campos = [
        { icon: idIcon, label: "Código de Producto", disabled: ["editar", "agregarStock"] },
        { icon: productoIcon, label: "Producto", disabled: ["editar", "agregarStock"] },
        { icon: details, label: "Descripción", disabled: ["agregarStock"] },
        { icon: priceIcon, label: "Precio", disabled: ["agregarStock"] },
        { icon: stockIcon, label: "Stock", disabled: [] },
    ];


    return (
        <ModalOverlay>
            <ModalContent>
                <Section>
                    <VolverBtn onClick={handleCloseModal}>
                        <Icon src={backIcon} /> Volver
                    </VolverBtn>
                </Section>

                <SubTitulo stitle={title} />

                {campos.map((campo) => (
                    <Label key={campo.label}>
                        <Icon src={campo.icon} /> {campo.label}
                        <TextBox disabled={campo.disabled.includes(mode)} />
                    </Label>
                ))}

                <Label>
                    <Icon src={proveedorIcon} /> Proveedor
                    <DropBox disabled={mode === "editar"} name="Proveedor">
                        <option value="Default">Seleccionar</option>
                    </DropBox>

                </Label>



                <Button onClick={handleCloseModal}>
                    <Icon src={icon} /> {buttonText}
                </Button>


            </ModalContent>
        </ModalOverlay>
    );
};

export default ModalProducto;
