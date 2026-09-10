// src/Signup.js
import React from 'react';
import { Container, LeftColumn, RightColumn, Image } from '../Composants/LoginComponents'; 
import SignupForm from '../Composants/SignupForm';


function Signup() {
  return (
    <Container>
      <LeftColumn>
      <Image src="/image/log.jpg" alt="Background Image" />
      </LeftColumn>
      <RightColumn>
        <SignupForm />
      </RightColumn>
    </Container>
  );
}

export default Signup;
