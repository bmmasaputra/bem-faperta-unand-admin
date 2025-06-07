import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import {
  Dashboard,
  Team,
  Invoices,
  Contacts,
  Form,
  Bar,
  Line,
  Pie,
  FAQ,
  Geography,
  Calendar,
  Stream,
  Testbed,
  Divisions,
  UKM
} from "./scenes";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTE */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/kabinet" element={<Team />} />
          <Route path="/pengurus" element={<Contacts />} />
          <Route path="/admins" element={<Invoices />} />
          <Route path="/form" element={<Form />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/bar" element={<Bar />} />
          <Route path="/pie" element={<Pie />} />
          <Route path="/stream" element={<Stream />} />
          <Route path="/line" element={<Line />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/geography" element={<Geography />} />
          <Route path="/testbed" element={<Testbed />} />
          <Route path="/divisions" element={<Divisions />} />
          <Route path="/ukm" element={<UKM />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
