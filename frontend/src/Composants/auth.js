import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Function to check if the token is about to expire
const isTokenExpiringSoon = (token) => {
  if (!token) return true;

  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiration = decodedToken.exp - currentTime;

    console.log('Decoded token:', decodedToken);
    console.log('Current time:', currentTime);
    console.log('Token expiration time:', decodedToken.exp);
    console.log('Time until expiration:', timeUntilExpiration, 'seconds');

    // Return true if the token expires in less than 60 seconds
    return timeUntilExpiration < 60;
  } catch (e) {
    console.error('Error decoding token:', e);
    return true;
  }
};

// Function to refresh the token
const refreshAccessToken = async (navigate, setIsAuthenticated) => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await axios.post('http://localhost:5000/auth/refresh-token', { token: refreshToken }, {
      withCredentials: true,
    });

    const newAccessToken = response.data.access_token;
    localStorage.setItem('token', newAccessToken);

    console.log('New access token received and stored');
    setIsAuthenticated(true); // Update authentication state
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      navigate('/login');
    }
  }
};

// Custom hook for managing authentication
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (isTokenExpiringSoon(token)) {
        await refreshAccessToken(navigate, setIsAuthenticated);
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();

    // Set an interval to regularly check token expiration
    const intervalId = setInterval(checkAuth, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [navigate]);

  return isAuthenticated;
};
