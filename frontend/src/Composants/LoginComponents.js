// src/LoginComponents.js
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  height: 100vh;
`;

export const LeftColumn = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  color: white;
`;

export const RightColumn = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
`;

export const Image = styled.img`
  max-width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;
