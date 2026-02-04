// 维护模式配置

// 是否启用维护模式
export const MAINTENANCE_MODE = true;

// 管理员钱包地址（这些地址可以绕过维护模式）
// 添加你的钱包地址（小写）
export const ADMIN_WALLETS: string[] = [
  // 在这里添加你的钱包地址，例如：
  // '0x1234567890abcdef1234567890abcdef12345678',
];

// 或者使用 URL 密钥绕过（访问 ?bypass=你的密钥）
export const BYPASS_KEY = 'acegaming2024';

// 检查是否应该显示维护页面
export function shouldShowMaintenance(
  connectedWallet: string | null | undefined,
  urlParams: URLSearchParams
): boolean {
  // 如果维护模式未启用，直接返回 false
  if (!MAINTENANCE_MODE) {
    return false;
  }

  // 检查 URL 参数绕过
  const bypassParam = urlParams.get('bypass');
  if (bypassParam === BYPASS_KEY) {
    return false;
  }

  // 检查管理员钱包
  if (connectedWallet) {
    const normalizedWallet = connectedWallet.toLowerCase();
    if (ADMIN_WALLETS.some(admin => admin.toLowerCase() === normalizedWallet)) {
      return false;
    }
  }

  // 显示维护页面
  return true;
}
