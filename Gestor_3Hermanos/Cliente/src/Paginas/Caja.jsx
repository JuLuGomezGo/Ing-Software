import React, { useState, useEffect } from "react";
import styled from "styled-components";

import Header from "../Componentes/Header";
import MainContainer from "../Componentes/MainContainer";

import Button from "../Componentes/Button";
import { Table, Th, Td } from "../Componentes/Table";
import DropBox from "../Componentes/DropBox";
import { TextBox } from "../Componentes/TextComponent";
import { DateBox, TimeBox } from '../Componentes/Date-TimePicker';




//                         <button
//                             
//                             className="w-full bg-[#D7A86E] text-white font-bold py-2 rounded-lg hover:bg-[#C48A5D]"
//                         >
//                             Registrar Movimiento
//                         </button>
//                     </div>

//                     <table className="w-full text-left border-collapse">
//                         <thead>
//                             <tr className="bg-[#D7A86E] text-white">
//                                 <th className="p-2">Usuario</th>
//                                 <th className="p-2">Monto</th>
//                                 <th className="p-2">Referencia</th>
//                                 <th className="p-2">Motivo</th>
//                                 <th className="p-2">Fecha y Hora</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {movements.map((movement, index) => (
//                                 <tr key={index} className="odd:bg-[#FAF3E0] even:bg-white">
//                                     <td className="p-2">{movement.user}</td>
//                                     <td className="p-2">${movement.amount}</td>
//                                     <td className="p-2">{movement.reference}</td>
//                                     <td className="p-2">{movement.reason}</td>
//                                     <td className="p-2">{movement.dateTime}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </MainContainer>
//     );
// };
// export default Caja;


const Container = styled.div`
  border: 2px solid #b3815d;
  padding: 0.5rem;
  border-radius: 20px;
  background: #f9f4ee;
  display: flex;
  flex-direction: column;
  align-items: space-between;
  gap: 1rem;
  width: fit-content;


`;


const Label = styled.label`
  font-weight: bold;
  color: #5d4037;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Cont_lbl = styled.div`
  display: flex;
  flex-direction: column;
`;

const Cont_inputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Caja = () => {

    
    const [movements, setMovements] = useState([]);
    const [formData, setFormData] = useState({
        amount: "",
        reason: "Cobro Pedido",
        reference: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRegister = () => {
        if (!formData.amount || !formData.reference) {
            alert("Por favor completa todos los campos.");
            return;
        }

        const newMovement = {
            user: "Usuario01",
            amount: formData.amount,
            reference: formData.reference,
            reason: formData.reason,
            dateTime: new Date().toLocaleString("es-MX", {
                dateStyle: "short",
                timeStyle: "short",
            }),
        };

        setMovements([...movements, newMovement]);
        setFormData({ amount: "", reason: "Cobro Pedido", reference: "" });
    };




    return (
        <MainContainer>

            <Header />

            <Container>

                <FlexRow>

                    <Button>📄 Generar Reporte</Button>

                    <Cont_lbl>

                        <Label>
                            📅 Fecha:
                            <DateBox />
                        </Label>
                        <Label>
                            ⏰ Hora:
                            <TimeBox />
                        </Label>
                    </Cont_lbl>
                </FlexRow>

                <Cont_inputs>
                    <Label>
                        Monto: $
                        <TextBox />
                    </Label>

                    <Label>
                        Motivo:
                        <DropBox >
                            <option value="Cobro Pedido">Seleccionar</option>
                            <option value="Cobro Pedido">Cobro Pedido</option>
                            <option value="Pago a Proveedor">Pago a Proveedor</option>

                        </DropBox>
                    </Label>

                    <Label>
                        Referencia:
                        <TextBox placeholder="# Pedido/Mov Inventario" />
                    </Label>
                </Cont_inputs>
                <Button variant="primary" onClick={handleRegister} >💾 Registrar Movimiento</Button>

                <Table>
                    <thead>
                        <tr>
                            <Th>Usuario</Th>
                            <Th>Monto $</Th>
                            <Th>Referencia #</Th>
                            <Th>Motivo</Th>
                            <Th>Fecha y Hora </Th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <Td>Usuario01</Td>
                            <Td>$150</Td>
                            <Td>Pedido #04</Td>
                            <Td>Cobro Pedido</Td>
                            <Td>11:00 AM - 18/03/2025</Td>
                        </tr>
                        <tr>
                            <Td>Usuario01</Td>
                            <Td>$5000</Td>
                            <Td>(Id de movimiento de historial)</Td>
                            <Td>Pago a Proveedor</Td>
                            <Td>6:30 AM - 18/03/2025</Td>
                        </tr>
                    </tbody>
                </Table>
            </Container>
        </MainContainer>
    );
};

export default Caja;