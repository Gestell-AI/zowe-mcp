export interface ZoweOptionOverrides {
  account?: string
  base_profile?: string
  tso_profile?: string
  zosmf_profile?: string
}

export interface ZoweOptionScope {
  allowAccount?: boolean
  allowTsoProfile?: boolean
  allowZosmfProfile?: boolean
}

export function withZoweOptions(
  args: string[],
  overrides: ZoweOptionOverrides,
  scope: ZoweOptionScope
): string[] {
  const resolved = [...args]

  const baseProfile = normalize(
    overrides.base_profile ||
      process.env.ZOWE_MCP_BASE_PROFILE ||
      getLegacyBaseProfile()
  )
  const zosmfProfile = normalize(
    overrides.zosmf_profile || process.env.ZOWE_MCP_ZOSMF_PROFILE
  )
  const tsoProfile = normalize(
    overrides.tso_profile || process.env.ZOWE_MCP_TSO_PROFILE
  )
  const tsoAccount = normalize(
    overrides.account || process.env.ZOWE_MCP_TSO_ACCOUNT
  )

  appendIfMissing(resolved, '--base-profile', baseProfile)
  if (scope.allowZosmfProfile) appendIfMissing(resolved, '--zosmf-profile', zosmfProfile)
  if (scope.allowTsoProfile) appendIfMissing(resolved, '--tso-profile', tsoProfile)
  if (scope.allowAccount) appendIfMissing(resolved, '--account', tsoAccount)

  return resolved
}

function appendIfMissing(args: string[], flag: string, value?: string): void {
  if (!value || args.includes(flag)) return
  args.push(flag, value)
}

function normalize(value?: string): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function getLegacyBaseProfile(): string | undefined {
  const legacy = normalize(process.env.ZOWE_PROFILE)
  if (!legacy || legacy.toLowerCase() === 'default') {
    return undefined
  }
  return legacy
}
