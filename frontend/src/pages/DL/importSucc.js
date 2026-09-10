import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChartLine, faSave, faBrain, faDatabase,faHistory,faFileAlt } from '@fortawesome/free-solid-svg-icons';
import '../../assets/DLcss/importSucc.css';
import axios from 'axios';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { faRocket } from '@fortawesome/free-solid-svg-icons';
const ImportSuccessDL = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [imageUrls, setImageUrls] = useState([]);
  const [patientImageCounts, setPatientImageCounts] = useState();

  const fetchImages = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(`http://localhost:5000/dl_routes/projects/${id}/imported-files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true,
      });
      const counts = {};
      const urls = response.data;
      console.log(urls)
      setPatientImageCounts(urls.length)
      
      const fullImageUrls = urls.map(image => `http://localhost:5000${image.url}`);
      setImageUrls(fullImageUrls);
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers importés :', error);
    }
  };

  useEffect(() => {
    console.log(patientImageCounts)
    fetchImages();
  }, [id]);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleGraphsClick = () => {
    navigate(`/graphsDL/${id}/${patientImageCounts}`);
  };

  const handleProcessingClick = () => {
    navigate(`/processingDL/${id}/${patientImageCounts}`);
  };

  const handleModelsClick = () => {
    navigate(`/modelsDL/${id}/${patientImageCounts}`);
  };


  const handleHistorique = () => {
    navigate(`/historyDL/${id}/${patientImageCounts}`);
};
  const handleDBClick = () => {
    navigate(`/importSuccDL/${id}`);
  };
  const handleDepClick = () => {
    navigate(`/readMe/${id}`);
  };

  return (
    <>
      <div className="menu-bar">
        <div className="app-name2">
          <img src="/lg.png" alt="App Icon" className="app-icon" />
          <span>MedicalVision</span>
        </div>
        <div className="menu-item" onClick={handleProfileClick}>
          <FontAwesomeIcon icon={faUser} className="menu-icon" /> Profile
        </div>
        <div className="menu-item" onClick={handleDBClick}>
          <FontAwesomeIcon icon={faDatabase} className="menu-icon" /> Database
        </div>
        <div className="menu-item" onClick={handleHistorique}>
                    <FontAwesomeIcon icon={faHistory} className="menu-icon" /> History
                </div>
        <div className="menu-item" onClick={handleGraphsClick}>
          <FontAwesomeIcon icon={faFileAlt} className="menu-icon" /> Description
        </div>
        <div className="menu-item" onClick={handleProcessingClick}>
          <FontAwesomeIcon icon={faCog} className="menu-icon" /> Processing
        </div>
        <div className="menu-item" onClick={handleDepClick}>
          <FontAwesomeIcon icon={faRocket} className="menu-icon" /> ReadMe
        </div>            
        <div className="menu-item" onClick={handleModelsClick}>
          <FontAwesomeIcon icon={faBrain} className="menu-icon" /> Deployment
        </div>
       
      </div>

      <div className="content1">
        <h2>Imported Images</h2>
        {imageUrls.length > 0 ? (
          <div className="images-gallery">
            {imageUrls.map((url, index) => (
              <img key={index} src={url} alt={`Imported ${index + 1}`} className="imported-image" />
            ))}
          </div>
        ) : (
          <p>No images imported yet.</p>
        )}
      </div>
    </>
  );
};

export default ImportSuccessDL;
