import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './auth'; // Assurez-vous que le chemin est correct

const PrivateRoute = () => {
  const isAuthenticated = useAuth(); // Utilise le hook d'authentification pour vérifier l'état de l'utilisateur

  console.log('Is Authenticated:', isAuthenticated); // Log pour vérifier si l'utilisateur est authentifié

  // Si l'utilisateur n'est pas authentifié, redirige vers la page de connexion
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
