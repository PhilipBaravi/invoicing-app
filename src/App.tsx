import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/main-authentication/login-page/LoginPage";
import RegisterPage from "./components/main-authentication/register-page/RegisterPage";
import EmailVerification from "./components/main-authentication/EmailVerification";
import AccountDetails from "./components/account-details/AccountDetails";
import BusinessForm from "./components/account-details/business-form/BusinessFormDetails";
import IntentFormDetails from "./components/account-details/IntentForm.tsx/IntentFormDetails";


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/" element={<RegisterPage />} /> {/* Default route */}
        <Route path="/account-details" element={<AccountDetails />} />
        <Route path="/business-details" element={<BusinessForm />} />
        <Route path="/intent-details" element={<IntentFormDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
