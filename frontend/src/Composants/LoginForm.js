import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaExclamationCircle } from 'react-icons/fa';

const FormContainer = styled.div`
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  margin: auto;
  background-color: #f0f2f5;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #0056b3;
  font-family: 'Arial', sans-serif;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  padding-left: 2rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 90%;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #0056b3;
    outline: none;
  }
`;

const Icon = styled.div`
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  color: #0056b3;
`;

const Button = styled.button`
  margin-top: 1rem;
  padding: 0.75rem;
  font-size: 1rem;
  color: white;
  background-color: #0056b3;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #003d80;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Image = styled.img`
  max-width: 50%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 2rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const StyledLink = styled(Link)`
  color: #0056b3;
  text-decoration: none;
  margin-top: 1rem;
  display: block;

  &:hover {
    color: #003d80;
  }
`;

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        email,
        password,
      });

      console.log('Response:', response.data); // Log la réponse de l'API

      const { access_token } = response.data;

      if (access_token) {
        // Stocker le token dans localStorage
        localStorage.setItem('token', access_token);
        console.log('Token stored:', access_token); // Log le token stocké
        // Redirection vers la page de profil
        navigate('/profile');
      } else {
        setError('No token received');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Invalid email or password');
    }
  };

  return (
    <FormContainer>
      <Image src="/image/logo2.png" alt="Logo Image" />
      <Form onSubmit={handleSubmit}>
        <Title>Login</Title>
        <InputContainer>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
          />
          <Icon><FaEnvelope /></Icon>
        </InputContainer>
        <InputContainer>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
          />
          <Icon><FaLock /></Icon>
        </InputContainer>
        {error && (
          <ErrorMessage>
            <FaExclamationCircle style={{ marginRight: '5px' }} />
            {error}
          </ErrorMessage>
        )}
        <Button type="submit">Login</Button>
        <StyledLink to="/signup">Don't have an account? <b>Sign Up</b></StyledLink>
      </Form>
    </FormContainer>
  );
}

export default LoginForm;
