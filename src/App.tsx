import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ReactKeycloakProvider, useKeycloak } from "@react-keycloak/web";
import keycloak from "./components/main-authentication/new-login-page/keycloak";
import AccountDetails from "./components/account-details/AccountDetails";
import BusinessForm from "./components/account-details/business-form/BusinessFormDetails";
import IntentFormDetails from "./components/account-details/IntentForm.tsx/IntentFormDetails";
import Dashboard from "./components/dashboard/layout/Dashboard";
import DashboardDefault from "./components/dashboard/dashboarddefault/DashboardDefault";
import Employee from "./components/dashboard/employee/EmployeeList";
import ProductsPage from "./components/dashboard/products/ProductsPage";
import Profile from "./components/dashboard/profile/Profile";
import NewLoginPage from "./components/main-authentication/new-login-page/NewLoginPage";
import NewRegisterPage from "./components/main-authentication/new-register-page/NewRegisterPage";
import { ThemeProvider } from "./components/dashboard/layout/ThemeProvider";
import CompanyRegistrationForm from "./components/main-authentication/new-register-page/CompanyRegistrationForm";
import LoginRegisterLayout from "./components/main-authentication/LoginRegisterLayout";
import ClientVendorList from "./components/dashboard/clients/ClientVendorList";
import NotFound from "./NotFound";
import Settings from "./components/dashboard/company-settings/Settings";
import Invoice from "./components/dashboard/invoice/Invoice";
import ProfileSubscription from "./components/dashboard/subscription/ProfileSubscription";
import ManagePaymentMethods from "./components/dashboard/subscription/ManagePaymentMethods";
import Categories from "./components/dashboard/products/Categories";

interface UserDetails {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!keycloak.authenticated) {
    return <NewLoginPage />;
  }

  return element;
};

const App: React.FC = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      onEvent={(event, error) => {
        console.log("Keycloak event:", event);
        if (event === "onAuthSuccess") {
          console.log("Authentication successful");
        }
        if (event === "onAuthError") {
          console.error("Authentication error", error);
        }
        if (event === "onInitError") {
          console.error("Initialization error", error);
        }
        if (event === "onAuthLogout") {
          console.log("User logged out");
        }
      }}
      initOptions={{
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
      }}
    >
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            <Route path="/new-login" element={<NewLoginPage />} />
            <Route
              path="/new-register"
              element={<NewRegisterPage setUserDetails={setUserDetails} />}
            />
            <Route path="/" element={<NewRegisterPage setUserDetails={setUserDetails} />} />
            <Route path="/account-details" element={<AccountDetails />} />
            <Route path="/business-details" element={<BusinessForm />} />
            <Route path="/intent-details" element={<IntentFormDetails />} />
            <Route path="*" element={<NotFound />} />
            <Route
              path="/company-registration"
              element={
                <LoginRegisterLayout
                  title="Register Your Company"
                  subtitle="Enter your company details to register"
                >
                  <CompanyRegistrationForm userDetails={userDetails} />
                </LoginRegisterLayout>
              }
            />
            <Route
              path="/dashboard/*"
              element={<ProtectedRoute element={<Dashboard />} />}
            >
              <Route index element={<DashboardDefault />} />
              <Route path="employee" element={<Employee />} />
              <Route path="clients" element={<ClientVendorList />} />
              <Route path="invoice" element={<Invoice />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile-subscription" element={<ProfileSubscription />} />
              <Route path="payment-methods" element={<ManagePaymentMethods />} />
              <Route path="categories" element={<Categories />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </ReactKeycloakProvider>
  );
};

export default App;
