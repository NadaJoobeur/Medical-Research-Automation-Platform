import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axios from 'axios';
import '../../assets/css/ProjectDetail.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faChevronLeft,faBars ,faUpload} from '@fortawesome/free-solid-svg-icons'; // Importer l'icône souhaitée

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id, name } = useParams();
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(() => {
    return localStorage.getItem(`importedFileName_${id}`) || 'No file selected';
  });

  useEffect(() => {
    // Check if a file has been imported for this project ID
    const importedFileName = localStorage.getItem(`importedFileName_${id}`);
    if (importedFileName) {
      setFileName(importedFileName);
    }
  }, [id]);

  const handleBackClick = () => {
    navigate('/profile');
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      const reader = new FileReader();

      reader.onload = (e) => {
        const fileContent = e.target.result;
        let data = [];
        let totalRows = 0;
        let totalColumns = 0;

        if (fileType === 'text/csv' || fileType === 'application/vnd.ms-excel') {
          Papa.parse(fileContent, {
            header: true,
            complete: (results) => {
              data = results.data.slice(0, 15);
              totalRows = results.data.length;
              totalColumns = results.meta.fields.length;
              saveDatabase(selectedFile, selectedFile.name);
            },
          });
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          const workbook = XLSX.read(fileContent, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { header: 1 });
          data = worksheet.slice(1, 16);
          totalRows = worksheet.length - 1;
          totalColumns = worksheet[0].length;
          saveDatabase(selectedFile, selectedFile.name);
        }
      };

      if (fileType === 'text/csv' || fileType === 'application/vnd.ms-excel') {
        reader.readAsText(selectedFile);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        reader.readAsBinaryString(selectedFile);
      }

      setFileName(selectedFile.name);
      localStorage.setItem(`importedFileName_${id}`, selectedFile.name);
    } else {
      alert('Please select a valid CSV or Excel file.');
    }
  };

  const saveDatabase = async (file, fileName) => {
    const formData = new FormData();
    formData.append('database', file);

    const token = localStorage.getItem('token'); // Récupérez le token depuis localStorage

    try {
        await axios.post(`http://localhost:5000/file/import/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}` // Ajoutez le token ici
            },
            withCredentials: true,
        });
        console.log('Base de données enregistrée avec succès');
        // Vous pouvez déclencher une action après l'importation réussie si nécessaire
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la base de données :', error);
    }
};

  const handleGoToMenuClick = () => {
    console.log("file :",id);
    navigate(`/importSucc/${id}`);
  };

  return (
    <div className="project-detail">
      <header className="header">
      <button className="back-button" onClick={handleBackClick}>
      <FontAwesomeIcon icon={faChevronLeft} /> Back
</button>
        <div className="app-name1">
          <img src="/lg.png" alt="App Icon" className="app-icon" />
          <span>MedicalVision</span>
        </div>
      </header>
      <div className="project-info">
        <img src="/image/ml.jpg" alt="Project" className="project-image" />
        <div className="project-details">
          <h1>Project Name: {decodeURIComponent(name)}</h1>
          <p>Selected File: {fileName}</p>
        </div>
      </div>
      {fileName !== 'No file selected' && (
          <button className="import-button" onClick={handleGoToMenuClick}>
          <FontAwesomeIcon icon={faBars} /> Go to Menu
        </button>
      )}
      {fileName === 'No file selected' && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv, .xls, .xlsx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button className="import-button" onClick={handleImportClick}>
      <FontAwesomeIcon icon={faUpload} /> Import Your Database
    </button>
        </>
      )}
    </div>
  );
};

export default ProjectDetail;
