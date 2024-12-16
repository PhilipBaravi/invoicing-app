import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ReactKeycloakProvider, useKeycloak } from "@react-keycloak/web";
import keycloak from "./utils/keycloak";
import AccountDetails from "./components/account-details/AccountDetails";
import BusinessForm from "./components/account-details/business-form/BusinessFormDetails";
import IntentFormDetails from "./components/account-details/IntentForm.tsx/IntentFormDetails";
import Dashboard from "./components/dashboard/layout/Dashboard";
import DashboardDefault from "./components/dashboard/dashboarddefault/DashboardDefault";
import Employee from "./components/dashboard/employee/EmployeeList";
import ProductsPage from "./components/dashboard/products/ProductsPage";
import NewLoginPage from "./components/main-authentication/new-login-page/NewLoginPage";
import NewRegisterPage from "./components/main-authentication/new-register-page/NewRegisterPage";
import { ThemeProvider } from "./components/dashboard/layout/ThemeProvider";
import CompanyRegistrationForm from "./components/main-authentication/new-register-page/CompanyRegistrationForm";
import LoginRegisterLayout from "./components/main-authentication/LoginRegisterLayout";
import ClientVendorList from "./components/dashboard/clients/ClientVendorList";
import NotFound from "./NotFound";
import Settings from "./components/dashboard/company-settings/Settings";
import ProfileSubscription from "./components/dashboard/subscription/ProfileSubscription";
import ManagePaymentMethods from "./components/dashboard/subscription/ManagePaymentMethods";
import Categories from "./components/dashboard/products/categories/Categories";
import UpdateCompanyDetails from "./components/dashboard/company-settings/UpdateCompanyDetails";
import InvoiceListPage from "./components/dashboard/invoice/invoice-list-page/InvoiceListPage";
import { Progress } from "@/components/ui/progress";
import Invoice from "./components/dashboard/invoice/Invoice";
import PrivacyPolicy from "./components/main-authentication/privacyPolicy";
import AuthRedirectRoute from "./components/main-authentication/AuthRedirectRoute";
import './i18n';
import { useTranslation } from "react-i18next";
import LandingPage from "./landing-page/LandingPage";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "./hooks/useAuth";
import type { UserFormValues } from "./components/main-authentication/new-register-page/RegisterForm";
import { CookieConsent } from "./CookiesConsent";
import { getCookie, eraseCookie, setCookie } from "./utils/cookiesUtils";

const ProtectedRoute = ({ 
  element: Element, 
  allowedRoles = ['Admin', 'Employee', 'Manager'] 
}: { 
  element: JSX.Element;
  allowedRoles?: string[];
}) => {
  const { keycloak, initialized } = useKeycloak();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      if (!initialized) return;

      if (!keycloak.authenticated) {
        const storedToken = getCookie('keycloak_token');
        const storedRefreshToken = getCookie('keycloak_refresh_token');
        const storedIdToken = getCookie('keycloak_id_token');

        if (storedToken && storedRefreshToken && storedIdToken) {
          console.log('Found stored tokens, attempting to restore session');
          keycloak.token = storedToken;
          keycloak.refreshToken = storedRefreshToken;
          keycloak.idToken = storedIdToken;
          keycloak.authenticated = true;

          try {
            const refreshed = await keycloak.updateToken(-1);
            console.log('Token refresh attempt result:', refreshed);
            if (!refreshed) {
              console.log('Token refresh failed, clearing stored tokens');
              eraseCookie('keycloak_token');
              eraseCookie('keycloak_refresh_token');
              eraseCookie('keycloak_id_token');
              keycloak.authenticated = false;
            } else {
              setCookie('keycloak_token', keycloak.token!, 7);
              setCookie('keycloak_refresh_token', keycloak.refreshToken!, 7);
              setCookie('keycloak_id_token', keycloak.idToken!, 7);
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
            eraseCookie('keycloak_token');
            eraseCookie('keycloak_refresh_token');
            eraseCookie('keycloak_id_token');
            keycloak.authenticated = false;
          }
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [initialized, keycloak]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Progress value={100} className="w-[60%]" />
      </div>
    );
  }

  if (!keycloak.authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role.description)) {
    return <Navigate to="/dashboard" replace />;
  }

  return Element;
};

const App: React.FC = () => {
  const [userDetails, setUserDetails] = useState<UserFormValues | null>(null);
  const { t } = useTranslation();

  const eventLogger = (event: any, error: any) => {
    console.log('Keycloak event:', event);
    if (error) {
      console.error('Keycloak error:', error);
    }
  };

  const tokenLogger = (tokens: any) => {
    console.log('Received new tokens');
    if (tokens.token) {
      setCookie('keycloak_token', tokens.token, 7);
    }
    if (tokens.refreshToken) {
      setCookie('keycloak_refresh_token', tokens.refreshToken, 7);
    }
    if (tokens.idToken) {
      setCookie('keycloak_id_token', tokens.idToken, 7);
    }
  };

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      onEvent={eventLogger}
      onTokens={tokenLogger}
      initOptions={{
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      }}
    >
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router basename="/">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/login" 
              element={<AuthRedirectRoute element={<NewLoginPage />} />} 
            />
            <Route
              path="/register"
              element={<NewRegisterPage setUserDetails={setUserDetails} />}
            />
            <Route path="/account-details" element={<AccountDetails />} />
            <Route path="/business-details" element={<BusinessForm />} />
            <Route path="/intent-details" element={<IntentFormDetails />} />
            <Route path="*" element={<NotFound />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route
              path="/company-registration"
              element={
                <LoginRegisterLayout
                  title={t('companySignUpForm.company.title')}
                  subtitle={t('companySignUpForm.company.subtitle')}
                >
                  <CompanyRegistrationForm userDetails={userDetails} />
                </LoginRegisterLayout>
              }
            />

            <Route path="/dashboard/*" element={<ProtectedRoute element={<Dashboard />} />}>
              <Route index element={<DashboardDefault />} />
              <Route 
                path="employee" 
                element={
                  <ProtectedRoute 
                    element={<Employee />} 
                    allowedRoles={['Admin']} 
                  />
                } 
              />
              <Route 
                path="settings" 
                element={
                  <ProtectedRoute 
                    element={<Settings />} 
                    allowedRoles={['Admin']} 
                  />
                }
              >
                <Route index element={<UpdateCompanyDetails />} />
                <Route path="profile-subscription" element={<ProfileSubscription />} />
                <Route path="payment-methods" element={<ManagePaymentMethods />} />
              </Route>
              
              <Route path="clients" element={<ClientVendorList />} />
              <Route path="invoices" element={<InvoiceListPage />} />
              <Route path="invoices/new-invoice" element={<Invoice />} />
              <Route path="invoices/edit/:id" element={<Invoice />} />
              <Route path="categories" element={<Categories />}>
                <Route path="products" element={<ProductsPage />} />
              </Route>
            </Route>
          </Routes>
          <Toaster />
          <CookieConsent />
        </Router>
      </ThemeProvider>
    </ReactKeycloakProvider>
  );
};

export default App;
