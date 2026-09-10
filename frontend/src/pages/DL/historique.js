import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { faUser, faChartLine, faCog, faBrain, faDatabase, faHistory, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { faRocket } from '@fortawesome/free-solid-svg-icons';
const HistoriqueDL = () => {
    const navigate = useNavigate();
    const { id, nbr } = useParams(); // To extract parameters from URL
    const [hist, setHist] = useState([]); // State to store history data
    const [selectedFile, setSelectedFile] = useState(''); // State for the selected file
    const [fileData, setFileData] = useState(null); // State to store file data
    const[url,seturl]=useState('');
    const [fileId, setFileId] = useState('');
    // Function to fetch history from an API
    const importhist = async () => {
        try {
            // Example of fetching history from an API endpoint, adjust the URL as needed
            const response = await axios.get(`http://localhost:5000/dl_routes/history/${id}`);
            setHist(response.data);
            console.log(response.data)
        } catch (error) {
            console.error("Error fetching history data:", error);
        }
    };
    const handleSelectChange = async (event) => {
        const fileId = event.target.value;
        setFileId(fileId);  // Mise à jour de fileId via useState
        setSelectedFile(fileId);
        console.log('file_id:', fileId);
        if (fileId) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/dl_routes/fichier/${fileId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    withCredentials: true,
                });

                console.log(response.data)
                setFileData(response.data)
                // Par exemple, si le 'fileId' se trouve dans 'response.data.fileId' :
                
                 // Accéder à la chaîne JSON (4ème élément de l'array 'data')
           // Vérifie le format de rawUrlData
           seturl(response.data.data[3]);
           
          
       } catch (error) {
           console.error('Error retrieving file data:', error);
       }
   }
};
    // On component mount or when 'id' changes, fetch history
    useEffect(() => {
        console.log("ID from params:", id);
        console.log("File_id après mise à jour:", fileId);
        if (url.length > 0) {
            console.log("URL mise à jour:", url);
        }
        importhist();
    }, [id, url, fileId]);

    // Handlers for menu clicks
    const handleProfileClick = () => {
        navigate(`/profile`);
    };
    const handleDepClick = () => {
        navigate(`/readMe/${id}`);
    };
    const handleDBClick = () => {
        navigate(`/importSuccDL/${id}`);
    };

    const handleHistorique = () => {
        navigate(`/historyDL/${id}/${nbr}`);
    };


    const handleGraphsClick = () => {
        navigate(`/graphsDL/${id}/${nbr}`);
    };

    const handleProcessingClick = () => {
        console.log('fileId avant navigation:', fileId);
        navigate(`/processingDL/${id}/${nbr}`);
        if (!fileId) {
            // Uncomment the line below for debugging, but avoid it in production
            // console.warn('Aucun fileId sélectionné. Vérifiez votre sélection.');
            return; // If fileId is not defined, do not navigate
        }
        
    };

    const handleModelsClick = () => {
        const encodedUrl = encodeURIComponent(JSON.stringify(url));
        
        navigate(`/modelsDL/${id}/${encodedUrl}`);
    };
    
    
    const goToModel= () => {
        const encodedUrl = encodeURIComponent(JSON.stringify(url));
        navigate(`/modelsDL/${id}/${encodedUrl}`);
    };
    const goToProcessing = () => {
        // Encodez l'URL
        const encodedUrl = encodeURIComponent(JSON.stringify(url));
        // Utilisez un séparateur moins problématique comme '_'
        navigate(`/processingDL/${id}/${nbr}/null/${encodedUrl}/${fileId}`);
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
                <h2>History</h2>
                <p className="header-subtitle">A Detailed Overview of Your File Modifications</p>
                {hist.length > 0 ? (
                    <select onChange={handleSelectChange} value={selectedFile}>
                        <option value="">Select a file</option>
                        {hist.map((file) => (
                            <option key={file.id} value={file.id}>{file.name}</option>
                        ))}
                    </select>
                ) : (
                    <p>No history available.</p>
                )}

{fileData && (
                    <div className="file-data">
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>
                                Data for {hist.find(file => file.id === parseInt(selectedFile))?.name}
                            </h3>
                            
                         
                          </div>
                          {fileData && fileData.data && fileData.data.length > 0 ? (
    <table border="1">
        <thead>
            <tr>
                <th>Operation</th> {/* Custom label for the first column */}
                <th>Details</th> {/* Custom label for the second column */}
            </tr>
        </thead>
        <tbody>
            {/* Assuming 'fileData.data' has three entries */}
            <tr>
                <td>Normalization</td>
                <td>{fileData.data[0] || 'Not Done Yet'}</td>
            </tr>
            <tr>
                <td>Slicing</td>
                <td>{fileData.data[1] || 'Not Done Yet'}</td>
            </tr>
            <tr>
                <td>Recising</td>
                <td>{fileData.data[2] || 'Not Done Yet'}</td>
            </tr>
        </tbody>
    </table>
) : (
    <p>No data available for the selected file.</p>
)}
    <button 
        onClick={goToModel} 
        style={{
            marginLeft: '10px', 
            marginTop: '20px', // Déplacer vers le bas
            padding: '15px 30px', // Agrandir le bouton
            fontSize: '16px', // Taille du texte plus grande
            backgroundColor: '#007bff', // Couleur initiale
            border: 'none', 
            color: 'white',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease' // Douce transition
        }}
        onMouseDown={(e) => e.target.style.backgroundColor = '#0056b3'} // Couleur en cliquant
    >
        Go to Model
    </button>
    <button 
        onClick={goToProcessing} 
        style={{
            marginLeft: '10px', 
            marginTop: '20px', // Déplacer vers le bas
            padding: '15px 30px', // Agrandir le bouton
            fontSize: '16px', // Taille du texte plus grande
            backgroundColor: '#007bff', // Couleur initiale
            border: 'none', 
            color: 'white',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease' // Douce transition
        }}
        onMouseDown={(e) => e.target.style.backgroundColor = '#0056b3'} // Couleur en cliquant
        onMouseUp={(e) => e.target.style.backgroundColor = '#007bff'}   // Retour à la couleur initiale
    >
        Go to Processing
    </button>

                    </div>
                )}
            </div>
        </>
    );
};

export default HistoriqueDL;

