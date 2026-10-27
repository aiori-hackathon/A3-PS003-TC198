import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Overview from '../pages/Overview/Overview';
import TrafficNetwork from '../pages/TrafficNetwork/TrafficNetwork';
import DecisionIntelligence from '../pages/DecisionIntelligence/DecisionIntelligence';
import Prediction from '../pages/Prediction/Prediction';
import Communication from '../pages/Communication/Communication';
import FederatedLearning from '../pages/FederatedLearning/FederatedLearning';
import Alerts from '../pages/Alerts/Alerts';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/overview" replace />} />
      <Route path="/overview" element={<Overview />} />
      <Route path="/network" element={<TrafficNetwork />} />
      <Route path="/traffic" element={<Navigate to="/network" replace />} />
      <Route path="/traffic-network" element={<Navigate to="/network" replace />} />
      <Route path="/decision" element={<DecisionIntelligence />} />
      <Route path="/decisions" element={<Navigate to="/decision" replace />} />
      <Route path="/prediction" element={<Navigate to="/predictions" replace />} />
      <Route path="/predictions" element={<Prediction />} />
      <Route path="/forecast" element={<Navigate to="/predictions" replace />} />
      <Route path="/forecasts" element={<Navigate to="/predictions" replace />} />
      <Route path="/communication" element={<Communication />} />
      <Route path="/federated" element={<FederatedLearning />} />
      <Route path="/federated-learning" element={<Navigate to="/federated" replace />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/alert" element={<Navigate to="/alerts" replace />} />
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}
