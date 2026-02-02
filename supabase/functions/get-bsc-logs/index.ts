import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 使用多个公共 BSC RPC 节点（按可靠性排序）
const BSC_RPC_URLS = [
  'https://bsc.publicnode.com',       // PublicNode - 较宽松
  'https://bsc.drpc.org',             // dRPC 免费端点
  'https://1rpc.io/bnb',              // 1RPC 免费端点
  'https://bsc-rpc.publicnode.com',   // PublicNode 备用
];

// 每批最大区块数（公共 RPC 限制）
const MAX_BLOCKS_PER_BATCH = 5000;

async function fetchLogsFromRpc(rpcUrl: string, address: string, topic0: string, fromBlock: number, toBlock: number): Promise<any[] | null> {
  const fromBlockHex = '0x' + fromBlock.toString(16);
  const toBlockHex = '0x' + toBlock.toString(16);

  const rpcPayload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_getLogs',
    params: [{
      fromBlock: fromBlockHex,
      toBlock: toBlockHex,
      address: address,
      topics: [topic0]
    }]
  };

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcPayload)
    });

    const data = await response.json();
    
    if (data.error) {
      console.log(`RPC error from ${rpcUrl}:`, data.error.message);
      return null;
    }

    return data.result || [];
  } catch (e) {
    console.log(`RPC request failed to ${rpcUrl}:`, e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const address = url.searchParams.get('address');
    const topic0 = url.searchParams.get('topic0');
    const fromBlockStr = url.searchParams.get('fromBlock');
    const toBlockStr = url.searchParams.get('toBlock');

    if (!address || !topic0 || !fromBlockStr || !toBlockStr) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fromBlock = parseInt(fromBlockStr);
    const toBlock = parseInt(toBlockStr);
    const totalBlocks = toBlock - fromBlock;

    console.log(`Fetching logs from block ${fromBlock} to ${toBlock} (${totalBlocks} blocks)`);

    // 只查询最近 50000 个区块（约 2 天），以提高成功率
    const effectiveFromBlock = Math.max(fromBlock, toBlock - 50000);
    const allLogs: any[] = [];
    
    // 分批查询
    let currentFrom = effectiveFromBlock;
    let successfulRpcUrl: string | null = null;

    while (currentFrom < toBlock) {
      const currentTo = Math.min(currentFrom + MAX_BLOCKS_PER_BATCH, toBlock);
      console.log(`Batch: ${currentFrom} - ${currentTo}`);

      let batchLogs: any[] | null = null;

      // 如果之前有成功的 RPC，优先使用
      const rpcsToTry: string[] = successfulRpcUrl 
        ? [successfulRpcUrl, ...BSC_RPC_URLS.filter((u: string) => u !== successfulRpcUrl)]
        : [...BSC_RPC_URLS];

      for (const rpcUrl of rpcsToTry) {
        batchLogs = await fetchLogsFromRpc(rpcUrl, address, topic0, currentFrom, currentTo);
        if (batchLogs !== null) {
          successfulRpcUrl = rpcUrl;
          console.log(`Batch success from ${rpcUrl}: ${batchLogs.length} logs`);
          break;
        }
      }

      if (batchLogs && batchLogs.length > 0) {
        allLogs.push(...batchLogs);
      }

      currentFrom = currentTo + 1;
      
      // 如果已经获取了足够的日志（100条），提前退出
      if (allLogs.length >= 100) {
        console.log('Reached 100 logs limit, stopping');
        break;
      }
    }

    console.log(`Total logs fetched: ${allLogs.length}`);

    // 转换格式以兼容前端代码
    const formattedLogs = allLogs.slice(0, 100).map((log: any) => ({
      address: log.address,
      topics: log.topics,
      data: log.data,
      blockNumber: log.blockNumber,
      blockHash: log.blockHash,
      timeStamp: '0x' + Math.floor(Date.now() / 1000).toString(16),
      transactionHash: log.transactionHash,
      transactionIndex: log.transactionIndex,
      logIndex: log.logIndex
    }));

    return new Response(
      JSON.stringify({ status: '1', message: 'OK', result: formattedLogs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ status: '0', message: 'NOTOK', result: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
