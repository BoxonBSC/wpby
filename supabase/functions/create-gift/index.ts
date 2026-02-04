import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function generateClaimCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { senderAddress, recipientTwitter, amount, txHash } = await req.json();

    // 验证输入
    if (!senderAddress || !recipientTwitter || !amount) {
      return new Response(
        JSON.stringify({ success: false, error: "缺少必要参数" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 清理Twitter用户名
    const cleanTwitter = recipientTwitter.replace(/^@/, '').trim().toLowerCase();
    if (!cleanTwitter || cleanTwitter.length > 15) {
      return new Response(
        JSON.stringify({ success: false, error: "无效的Twitter用户名" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const claimCode = generateClaimCode();
    const verificationCode = generateVerificationCode();

    const { data, error } = await supabase
      .from("social_gifts")
      .insert({
        sender_address: senderAddress.toLowerCase(),
        sender_tx_hash: txHash,
        recipient_twitter: cleanTwitter,
        amount: amount,
        claim_code: claimCode,
        verification_code: verificationCode,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "创建礼券失败" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: data.id,
          claimCode: claimCode,
          verificationCode: verificationCode,
          recipientTwitter: cleanTwitter,
          amount: amount,
          expiresAt: data.expires_at,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "服务器错误" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
