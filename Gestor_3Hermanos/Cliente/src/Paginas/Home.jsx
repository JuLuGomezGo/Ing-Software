import React, { useState, useEffect} from "react";
import styled from "styled-components";

import Header from "../Componentes/Header";
import MainContainer from "../Componentes/MainContainer";

function Home() {
    return (
        <MainContainer>
            <Header />
            <h2>HOME</h2>
        </MainContainer>
    
    );
}
export default Home;