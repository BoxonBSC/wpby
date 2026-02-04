import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { claimCode, recipientAddress, tweetId } = await req.json();

    if (!claimCode || !recipientAddress) {
      return new Response(
        JSON.stringify({ success: false, error: "缺少必要参数" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 查找礼券
    const { data: gift, error: fetchError } = await supabase
      .from("social_gifts")
      .select("*")
      .eq("claim_code", claimCode.toUpperCase())
      .single();

    if (fetchError || !gift) {
      return new Response(
        JSON.stringify({ success: false, error: "礼券不存在" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 检查状态
    if (gift.status === "claimed") {
      return new Response(
        JSON.stringify({ success: false, error: "礼券已被领取" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (gift.status === "expired" || new Date(gift.expires_at) < new Date()) {
      // 更新为过期状态
      await supabase
        .from("social_gifts")
        .update({ status: "expired" })
        .eq("id", gift.id);

      return new Response(
        JSON.stringify({ success: false, error: "礼券已过期，代币已销毁" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TODO: 验证推文是否包含验证码
    // 这里可以接入Twitter API验证推文内容
    // 当前简化版本：只要提供tweetId即认为已验证

    if (!tweetId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "请先发送验证推文",
          verificationCode: gift.verification_code,
          requiredTweet: `🎁 I'm claiming my @AceGamingBNB gift voucher!\n\nVerification: ${gift.verification_code}\n\n#AceGaming #BNBChain`
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 更新礼券状态为已领取
    const { error: updateError } = await supabase
      .from("social_gifts")
      .update({
        status: "claimed",
        recipient_address: recipientAddress.toLowerCase(),
        claimed_at: new Date().toISOString(),
        claim_tweet_id: tweetId,
      })
      .eq("id", gift.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "领取失败" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          amount: gift.amount,
          message: "礼券领取成功！凭证将在游戏中显示",
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
