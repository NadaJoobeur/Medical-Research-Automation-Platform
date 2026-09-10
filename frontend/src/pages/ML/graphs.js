import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChartLine, faCog, faBrain, faDatabase, faFileAlt,faHistory,faRocket } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  LineController,
  BarController,
  PieController,
  RadarController,
  DoughnutController,
  PolarAreaController,
  BubbleController,
  ScatterController
} from 'chart.js';
import { Line, Bar, Pie, Radar, Doughnut, PolarArea, Bubble, Scatter } from 'react-chartjs-2';
import '../../assets/css/graphs.css';

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  LineController,
  BarController,
  PieController,
  RadarController,
  DoughnutController,
  PolarAreaController,
  BubbleController,
  ScatterController
);

const Graphs = () => {
  const navigate = useNavigate();
  const { id, targetFeature } = useParams();
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [xAttribute, setXAttribute] = useState('');
  const [yAttribute, setYAttribute] = useState('');

  const cleanData = (data) => {
    if (typeof data === 'string') {
      return data.replace(/NaN/g, 'null');
    }
    return data;
  };

  const sanitizeJson = (jsonString) => {
    return jsonString.replace(/NaN/g, 'null');
  };

  const importBD = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:5000/file/projects/${id}/imported-files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true,
      });

      const data = response.data;
      let cleanedData;

      if (typeof data === 'object') {
        cleanedData = cleanData(data.data);
      } else if (typeof data === 'string') {
        try {
          const sanitizedData = sanitizeJson(data);
          cleanedData = JSON.parse(sanitizedData).data;
        } catch (e) {
          console.error('Erreur lors du parsing des données JSON :', e);
          return;
        }
      } else {
        console.error('Format de réponse inattendu', data);
        return;
      }

      if (Array.isArray(cleanedData)) {
        setData(cleanedData);
      } else if (typeof cleanedData === 'string') {
        try {
          const parsedData = JSON.parse(cleanedData);
          setData(parsedData);
        } catch (e) {
          console.error('Erreur lors du parsing des données JSON :', e);
        }
      } else {
        console.error('Format de réponse inattendu', cleanedData);
      }
    } catch (error) {
      alert( error)

      console.error('Erreur lors de la récupération des fichiers importés :', error);
    }
  };

  useEffect(() => {
    importBD();
  }, [id]);

  const handleProfileClick = () => {
    navigate('/profile');
  };
  const handleHistorique = () => {navigate(`/historique/${id}/${targetFeature}`)};
  const handleGraphsClick = () => {
    navigate(`/graphs/${id}/${targetFeature}`);
  };

  const handleProcessingClick = () => {
    navigate(`/processing/${id}/${targetFeature}`);
  };

  const handleModelsClick = () => {
    navigate(`/models/${id}/${targetFeature}`);
  };

  const handleDBClick = () => {
    navigate(`/importSucc/${id}/`);
  };

  const handleDescription = () => {
    navigate(`/description/${id}/${targetFeature}`);
  };



  const attributes = data.length > 0 ? Object.keys(data[0]) : [];

  const prepareChartData = () => {
    const labels = data.map((item) => item[xAttribute]);
    const values = data.map((item) => item[yAttribute]);

    return {
      labels,
      datasets: [
        {
          label: yAttribute,
          data: values,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const defaultChartData = {
    labels: data.map((_, index) => `Item ${index + 1}`),
    datasets: [
      {
        label: 'Default Data',
        data: data.map(() => Math.floor(Math.random() * 100)),
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  };

  const singleAttributeChartData = {
    labels: data.map((item, index) => `Item ${index + 1}`),
    datasets: [
      {
        label: xAttribute,
        data: data.map(item => item[xAttribute]),
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xAttribute || 'X Axis',
        }
      },
      y: {
        title: {
          display: true,
          text: yAttribute || 'Y Axis',
        }
      }
    }
  };
  const downloadChartAsImage = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'chart.png';
      link.click();
    }
  };
  const prepareBubbleChartData = () => {
    return {
      datasets: [
        {
          label: 'Bubble Chart Data',
          data: data.map(item => ({
            x: item.xAttribute || Math.random() * 100, // Valeur X (ou générée aléatoirement)
            y: item.yAttribute || Math.random() * 100, // Valeur Y (ou générée aléatoirement)
            r: item.sizeAttribute || Math.random() * 20 + 5, // Taille de la bulle (ou générée aléatoirement)
            label: item.label || 'No label'
          })),
          backgroundColor: 'rgba(75,192,192,0.6)',
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
        }
      ]
    };
  };
  const prepareScatterChartData = () => {
    return {
      datasets: [
        {
          label: 'Scatter Chart Data',
          data: data.map(item => ({
            x: item.xAttribute || Math.random() * 100, // Valeur X (ou générée aléatoirement)
            y: item.yAttribute || Math.random() * 100, // Valeur Y (ou générée aléatoirement)
            label: item.label || 'No label'
          })),
          backgroundColor: 'rgba(75,192,192,0.6)',
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
        }
      ]
    };
  };
  const handleDepClick = () => navigate(`/deployment/${id}/${targetFeature}`);

  
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
        <div className="menu-item" onClick={handleDescription}>
          <FontAwesomeIcon icon={faFileAlt} className="menu-icon" /> Description
        </div>
        <div className="menu-item" onClick={handleGraphsClick}>
          <FontAwesomeIcon icon={faChartLine} className="menu-icon" /> Graphs
        </div>
        <div className="menu-item" onClick={handleProcessingClick}>
          <FontAwesomeIcon icon={faCog} className="menu-icon" /> Processing
        </div>
        <div className="menu-item" onClick={handleModelsClick}>
          <FontAwesomeIcon icon={faBrain} className="menu-icon" /> Models
        </div>
        <div className="menu-item" onClick={handleDepClick}>
          <FontAwesomeIcon icon={faRocket} className="menu-icon" /> Deployment
        </div>
      </div>
      <div className="content1">
        <h2>Chart Display</h2>
        <p className="header-subtitle">Transforming Data into Meaningful Insights</p>
        <div>
          <select id="chartType" value={chartType} onChange={(e) => setChartType(e.target.value)}>
            <option value="line">Select Chart Type</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="radar">Radar Chart</option>
            <option value="doughnut">Doughnut Chart</option>
            <option value="polarArea">Polar Area Chart</option>
            <option value="bubble">Bubble Chart</option>
            <option value="scatter">Scatter Chart</option>
          </select>
        </div>
        <div>
          <select id="xAttribute" value={xAttribute} onChange={(e) => setXAttribute(e.target.value)}>
            <option value="">Select X Attribute</option>
            {attributes.map((attr) => (
              <option key={attr} value={attr}>
                {attr}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select id="yAttribute" value={yAttribute} onChange={(e) => setYAttribute(e.target.value)}>
            <option value="">Select Y Attribute</option>
            {attributes.map((attr) => (
              <option key={attr} value={attr}>
                {attr}
              </option>
            ))}
          </select>
        </div>
        {xAttribute && (
          <div className="graph">
            <div className="chart-container">
              {xAttribute && yAttribute ? (
                <>
                  {chartType === 'line' && <Line data={prepareChartData()} options={chartOptions} />}
                  {chartType === 'bar' && <Bar data={prepareChartData()} options={chartOptions} />}
                  {chartType === 'pie' && <Pie data={prepareChartData()} options={chartOptions} />}
                  {chartType === 'radar' && <Radar data={prepareChartData()} options={chartOptions} />}
                  {chartType === 'doughnut' && <Doughnut data={prepareChartData()} options={chartOptions} />}
                  {chartType === 'polarArea' && <PolarArea data={prepareChartData()} options={chartOptions} />}
                  {chartType === 'bubble' && <Bubble data={prepareChartData()} options={chartOptions} />}
                  {chartType === 'scatter' && <Scatter data={prepareChartData()} options={chartOptions} />}
                </>
              ) : (
                <>
                  {xAttribute && (
                    <>
                      {chartType === 'line' && <Line data={singleAttributeChartData} options={chartOptions} />}
                      {chartType === 'bar' && <Bar data={singleAttributeChartData} options={chartOptions} />}
                      {chartType === 'pie' && <Pie data={singleAttributeChartData} options={chartOptions} />}
                      {chartType === 'radar' && <Radar data={singleAttributeChartData} options={chartOptions} />}
                      {chartType === 'doughnut' && <Doughnut data={singleAttributeChartData} options={chartOptions} />}
                      {chartType === 'polarArea' && <PolarArea data={singleAttributeChartData} options={chartOptions} />}
                      {chartType === 'bubble' && <Bubble data={prepareBubbleChartData()} options={chartOptions} />}
                      {chartType === 'scatter' && <Scatter data={prepareScatterChartData()} options={chartOptions} />}  
                    </>
                  )}
                </>
              )}
            
            </div>
            <button onClick={downloadChartAsImage}>Download Chart</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Graphs;
