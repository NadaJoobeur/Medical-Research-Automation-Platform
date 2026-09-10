import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

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
  padding-left: 2rem; /* Pour faire de la place pour l'icône */
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
  font-size: 1.2rem;
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
  transition: color 0.3s ease;

  &:hover {
    color: #003d80;
  }
`;

function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      const response = await axios.post('http://localhost:5000/auth/signup', {
        name,
        email,
        password,
      });

      console.log('Signed up successfully');
      navigate('/login');
    } catch (error) {
      setError('Error creating account');
    }
  };

  return (
    <FormContainer>
      <Image src="/image/logo2.png" alt="Logo Image" />
      <Form onSubmit={handleSubmit}>
        <Title>Sign Up</Title>
        <InputContainer>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
          />
          <Icon><FaUser /></Icon>
        </InputContainer>
        <InputContainer>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
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
          />
          <Icon><FaLock /></Icon>
        </InputContainer>
        <InputContainer>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />
          <Icon><FaLock /></Icon>
        </InputContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit">Sign Up</Button>
        <StyledLink to="/login">Already have an account?<b>Login</b></StyledLink>
      </Form>
    </FormContainer>
  );
}

export default SignupForm;
