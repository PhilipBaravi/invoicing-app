import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8080/auth',
  realm: 'e-invoices',  
  clientId: 'invoicing-app-react-login',    
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
