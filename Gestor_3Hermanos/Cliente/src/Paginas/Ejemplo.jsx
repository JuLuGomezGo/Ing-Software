import React from "react";
import styled from "styled-components";
import Button from "../Componentes/Button";
import Icon from "../Componentes/Icon";
import DropBox from "../Componentes/DropBox";
import { TextBox } from "../Componentes/TextComponent";



import addIcon from '../Componentes/Iconos/add.png';
import details from '../Componentes/Iconos/details.png';
import idIcon from '../Componentes/Iconos/id.png';
import productoIcon from '../Componentes/Iconos/productoIcon.png';
import stockIcon from '../Componentes/Iconos/stock.png';
import priceIcon from '../Componentes/Iconos/priceIcon.png';
import proveedorIcon from '../Componentes/Iconos/proveedorIcon.png';
import newIcon from '../Componentes/Iconos/preparando.png';


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
  Border: 4px dashed #b3815d;
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

<div>
    <Button size="medium" variant="secondary">Filtros</Button>
    <Button size="medium" variant="primary" onClick={() => setShowModal(true)}>
        <Icon src={addIcon} /> Nuevo Producto
    </Button>


    {
        showModal && (
            <ModalOverlay>
                <ModalContent>
                    <Section>
                        <VolverBtn > <Icon onClick={handleCloseModal} src={backIcon} /> Volver </VolverBtn>

                    </Section>
                    <Label> <Icon src={idIcon} /> Codigo de Producto <TextBox /></Label>
                    <Label> <Icon src={productoIcon} /> Producto <TextBox /></Label>
                    <Label> <Icon src={details} /> Descripcion <TextBox /></Label>
                    <Label> <Icon src={priceIcon} /> Precio <TextBox /></Label>
                    <Label> <Icon src={stockIcon} /> Stock <TextBox /></Label>

                    {/* Cargar proveedores desde la base de datos */}
                    <Label>
                        <Icon src={proveedorIcon} />
                        Proveedor
                        <DropBox name="Proveedor">
                            <option value="Default">Seleccionar</option>
                        </DropBox>
                    </Label>
                    <Button onClick={handleCloseModal} > <Icon src={newIcon} /> Guardar</Button>
                    <Section>

                    </Section>

                </ModalContent>
            </ModalOverlay>
        )
    }
</div>