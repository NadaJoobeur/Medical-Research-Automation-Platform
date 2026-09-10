import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/login';
import Signup from './pages/Signup';
import ProfilePage from './pages/ProfilePage';

import ProjectDetail from './pages/ML/PrjDt';
import ImportSuccess from './pages/ML/ImportSuccess';
import Historique from './pages/ML/historique';
import Description from './pages/ML/description';
import Graphs from './pages/ML/graphs';
import Processing from './pages/ML/processing';
import Models from './pages/ML/models';
import Deployment from './pages/ML/deployment';
import Test from './pages/ML/test';
import Result from './pages/ML/resultat';
/******************************************** */
import ProjectDetailDL from './pages/DL/PrjDt';
import ImportSuccessDL from './pages/DL/importSucc'
import HistoriqueDL from './pages/DL/historique';
import GraphsDL from './pages/DL/graphs';/***Description***/ 
import ProcessingDL from './pages/DL/processing';
import ReadMe from './pages/DL/readMe';
import ModelsDL from './pages/DL/models';
import InceptionV1 from './pages/DL/InceptionV1';
import InceptionV2 from './pages/DL/InceptionV2';
import InceptionV3 from './pages/DL/InceptionV3';
import InceptionV4 from './pages/DL/InceptionV4';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
          <Route /*element={<PrivateRoute />}*/>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/project/:id/:name" element={<ProjectDetail />} />
            <Route path="/importSucc/:id" element={<ImportSuccess />} />
            <Route path="/historique/:id" element={<Historique />} />
            <Route path="/historique/:id/:targetFeature" element={<Historique />} />
            <Route path="/historique/:id" element={<Historique />} />
            <Route path="/description/:id/:targetFeature" element={<Description />} />
            <Route path="/description/:id" element={<Description />} />
            <Route path="/graphs/:id/:targetFeature" element={<Graphs />} />
            <Route path="/processing/:id/:targetFeature" element={<Processing />} />
            <Route path="/processing/:id" element={<Processing />} />
            <Route path="/processing/:id/:targetFeature/:fileData" element={<Processing />} />
            <Route path="/models/:id/:targetFeature" element={<Models />} />
            <Route path="/models/:id/:targetFeature/:fileData" element={<Models />} />
            <Route path="/models/:id" element={<Models />} />
            <Route path="/deployment/:id" element={<Deployment />} />
            <Route path="/deployment/:id/:targetFeature" element={<Deployment />} />
            <Route path="/test/:id/:model" element={<Test />} />
            <Route path="/resultat/:id" element={<Result />} />
             {/*************************************************** *
              *                   DL
            *******************************************************/}
            <Route path="/projectDL/:id/:name" element={<ProjectDetailDL />} />
            <Route path="/importSuccDL/:id" element={<ImportSuccessDL />} />
            <Route path="/historyDL/:id/:nbr" element={<HistoriqueDL />} />
            <Route path="/historyDL/:id" element={<HistoriqueDL />} />
            <Route path="/graphsDL/:id" element={<GraphsDL />} />
            <Route path="/graphsDL/:id/:nbr" element={<GraphsDL />} />
            <Route path="/processingDL/:id/:nbr" element={<ProcessingDL />} />
            <Route path="/processingDL/:id/:nbr" element={<ProcessingDL />} />
            <Route path="/processingDL/:id/:encodeUrl" element={<ProcessingDL />} />
            <Route path="/processingDL/:id/:dimensionRanges" element={<ProcessingDL />} />
            <Route path="/processingDL/:id/:nbr/:dimensionRanges" element={<ProcessingDL />} />
            <Route path="/processingDL/:id/:nbr/:encodedUrl" element={<ProcessingDL />} />
            <Route path="/processingDL/:id" element={<ProcessingDL />} />
            <Route path="/processingDL/:id/:nbr/null/:encodedUrl/:fileId" element={<ProcessingDL />} />
            <Route path="/processingDL/:id/:url" element={<ProcessingDL />} />
            <Route path="/readMe/:id" element={<ReadMe />} />
            <Route path="/modelsDL/:id" element={<ModelsDL />} />
            <Route path="/modelsDL/:id/:slicedImages" element={<ModelsDL />} />
            <Route path="/modelsDL/:id/:nbr" element={<ModelsDL />} />
            <Route path="/models-options/:id" element={<ModelsDL/>}/>
            <Route path="/inception-v1/:id" element={<InceptionV1 />} />
            <Route path="/inception-v2/:id" element={<InceptionV2 />} />
            <Route path="/inception-v3/:id" element={<InceptionV3 />} />
            <Route path="/inception-v4/:id" element={<InceptionV4 />} />






            {/*
          
            */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
