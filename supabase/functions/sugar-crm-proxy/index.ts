// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Supabase Edge Function for SugarCRM API proxy
import { serve } from "jsr:@supabase/functions-js/serve";

// SugarCRM API URL
const SUGAR_API_URL = 'https://cobalt.sugarondemand.com/rest/v11';

// SugarCRM authentication credentials - in production, use environment variables
const USERNAME = "Caseyc";
const PASSWORD = "2557Cobalt!";
const CLIENT_ID = "sugar";
const CLIENT_SECRET = "";

// Types for authentication response
interface AuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
  refresh_expires_in: number;
  download_token: string;
}

// Get a token from SugarCRM
async function getToken(): Promise<string> {
  try {
    const response = await fetch(`${SUGAR_API_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: "password",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username: USERNAME,
        password: PASSWORD,
        platform: "custom_api"
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to authenticate: ${response.status} ${response.statusText}`);
    }

    const data: AuthResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting token:', error);
    throw new Error('Failed to authenticate with SugarCRM');
  }
}

// Create a lead in SugarCRM
async function createLead(leadData: any, token: string): Promise<any> {
  try {
    // Transform the leadData from camelCase to what SugarCRM expects
    const sugarCrmData = {
      account_name: `${leadData.firstName} ${leadData.lastName}`,
      phone_mobile: leadData.phone,
      email1: leadData.email,
      primary_address_street: leadData.address,
      primary_address_city: leadData.city,
      primary_address_state: leadData.state,
      primary_address_postalcode: leadData.zip,
      lead_source: leadData.leadSource,
      product_type_c: leadData.productType,
      created_by: "df4c95dd-8b91-4952-b9c3-d8bcc6267bc5", // Hardcoded from your example
      status: "New",
      date_entered: new Date().toISOString(),
      assigned_user_id: "df4c95dd-8b91-4952-b9c3-d8bcc6267bc5", // Hardcoded from your example
      first_name: leadData.firstName,
      last_name: leadData.lastName,
      full_name: `${leadData.firstName} ${leadData.lastName}`
    };

    const response = await fetch(`${SUGAR_API_URL}/Leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'OAuth-Token': token
      },
      body: JSON.stringify(sugarCrmData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create lead: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating lead in SugarCRM:', error);
    throw new Error('Failed to create lead in SugarCRM');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    // Get the lead data from the request
    const leadData = await req.json();

    // Get a valid token
    const token = await getToken();

    // Create the lead in SugarCRM
    const result = await createLead(leadData, token);

    // Return success response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Return error response
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/sugar-crm-proxy' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
