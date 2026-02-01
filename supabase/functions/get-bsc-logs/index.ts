import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Etherscan API V2 endpoint
const ETHERSCAN_V2_API = 'https://api.etherscan.io/v2/api';
const BSC_CHAIN_ID = 56;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ETHERSCAN_API_KEY = Deno.env.get('ETHERSCAN_API_KEY');
    if (!ETHERSCAN_API_KEY) {
      throw new Error('ETHERSCAN_API_KEY is not configured');
    }

    const url = new URL(req.url);
    const address = url.searchParams.get('address');
    const topic0 = url.searchParams.get('topic0');
    const fromBlock = url.searchParams.get('fromBlock');
    const toBlock = url.searchParams.get('toBlock');

    if (!address || !topic0 || !fromBlock || !toBlock) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: address, topic0, fromBlock, toBlock' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build Etherscan V2 API URL
    const apiUrl = `${ETHERSCAN_V2_API}?chainid=${BSC_CHAIN_ID}&module=logs&action=getLogs&address=${address}&topic0=${topic0}&fromBlock=${fromBlock}&toBlock=${toBlock}&page=1&offset=100&apikey=${ETHERSCAN_API_KEY}`;

    console.log('Fetching logs from Etherscan V2...');
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log('Etherscan response status:', data.status, 'message:', data.message);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error fetching BSC logs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
