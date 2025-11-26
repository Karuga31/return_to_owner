import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/authcontext";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
// GuardDashboard import removed
import ProtectedRoute from "./components/protectedroute";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container py-8 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 1. Standard User Route (default authenticated dashboard) */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />

            {/* 2. Admin User Route (specifically restricted to 'admin') */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}><AdminDashboard /></ProtectedRoute>
            } />

            {/* 3. Guard Dashboard Route removed */}
            {/* The following line has been removed:
            <Route path="/guard" element={
              <ProtectedRoute allowedRoles={["guard"]}><GuardDashboard /></ProtectedRoute>
            } />
            */}

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}