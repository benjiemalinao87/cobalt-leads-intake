// Use dynamic import for axios to work with the external configuration
import axios from 'axios';

// Different CORS proxy URL - this one works better with complex APIs
const CORS_PROXY = 'https://corsproxy.io/?';
const SUGAR_API_URL = 'https://cobalt.sugarondemand.com/rest/v11';
const SUPABASE_FUNCTION_URL = 'https://dhpbwlsorfwimmcgffhx.supabase.co/functions/v1/sugar-crm-proxy';

// SugarCRM authentication credentials
const USERNAME = "Caseyc";
const PASSWORD = "2557Cobalt!";
const CLIENT_ID = "sugar";
const CLIENT_SECRET = "";

// Token storage keys
const TOKEN_STORAGE_KEY = 'sugar_crm_token';
const TOKEN_EXPIRY_KEY = 'sugar_crm_token_expiry';

interface AuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

// Store token with expiry time
const storeToken = (authResponse: AuthResponse) => {
  const expiresAt = Date.now() + (authResponse.expires_in * 1000);
  
  localStorage.setItem(TOKEN_STORAGE_KEY, authResponse.access_token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
};

// Get stored token info
const getStoredToken = (): {token: string, expiresAt: number} | null => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!token || !expiryStr) return null;
  
  return {
    token,
    expiresAt: parseInt(expiryStr)
  };
};

// Check if token is expired
const isTokenExpired = (tokenInfo: {expiresAt: number}): boolean => {
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
  return Date.now() + bufferTime > tokenInfo.expiresAt;
};

// Get a valid token
const getValidToken = async (): Promise<string> => {
  const tokenInfo = getStoredToken();
  
  // If we have a valid token, use it
  if (tokenInfo && !isTokenExpired(tokenInfo)) {
    return tokenInfo.token;
  }
  
  // Otherwise, get a new token
  try {
    const response = await axios.post(
      `${CORS_PROXY}${SUGAR_API_URL}/oauth2/token`, 
      {
        grant_type: "password",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username: USERNAME,
        password: PASSWORD,
        platform: "custom_api"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      }
    );
    
    storeToken(response.data);
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting token:', error);
    throw new Error('Failed to authenticate with SugarCRM');
  }
};

// Try to create a lead using the Supabase Edge Function as fallback
const createLeadViaEdgeFunction = async (leadData: any): Promise<any> => {
  try {
    console.log('Attempting to create lead via Supabase Edge Function...');
    const response = await axios.post(
      SUPABASE_FUNCTION_URL,
      leadData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating lead via Supabase Edge Function:', error);
    throw new Error('Failed to create lead via Supabase Edge Function');
  }
};

// Create a lead in SugarCRM
export const createLead = async (leadData: any): Promise<any> => {
  try {
    // First try with CORS proxy
    try {
      const token = await getValidToken();
      
      const response = await axios.post(
        `${CORS_PROXY}${SUGAR_API_URL}/Leads`, 
        {
          account_name: `${leadData.firstName} ${leadData.lastName}`,
          phone_mobile: leadData.phone,
          email1: leadData.email,
          primary_address_street: leadData.address,
          primary_address_city: leadData.city,
          primary_address_state: leadData.state,
          primary_address_postalcode: leadData.zip,
          lead_source: leadData.leadSource,
          product_type_c: leadData.productType,
          created_by: "df4c95dd-8b91-4952-b9c3-d8bcc6267bc5",
          status: "New",
          date_entered: new Date().toISOString(),
          assigned_user_id: "df4c95dd-8b91-4952-b9c3-d8bcc6267bc5",
          first_name: leadData.firstName,
          last_name: leadData.lastName,
          full_name: `${leadData.firstName} ${leadData.lastName}`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'OAuth-Token': token,
            'Origin': window.location.origin
          }
        }
      );
      
      return response.data;
    } catch (corsError) {
      console.error('CORS proxy approach failed:', corsError);
      
      // Fallback to Edge Function
      return await createLeadViaEdgeFunction(leadData);
    }
  } catch (error) {
    console.error('Error creating lead in SugarCRM (all methods failed):', error);
    throw new Error('Failed to create lead in SugarCRM');
  }
}; 