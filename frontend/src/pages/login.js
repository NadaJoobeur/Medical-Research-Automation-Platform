// src/Login.js
import React from 'react';
import LoginForm from '../Composants/LoginForm';
import { Container, LeftColumn, RightColumn, Image } from '../Composants/LoginComponents';

function Login() {
  return (
    <Container>
      <LeftColumn>
        <LoginForm />
       
      </LeftColumn>
      <RightColumn>
        <Image src="/image/log.jpg" alt="Background Image" />
      </RightColumn>
    </Container>
  );
}

export default Login;
