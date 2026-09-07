import type { Hooks, PluginInput } from "@nexus-ai/plugin"

const SERVER = "https://opencode.ai/console"
const CLIENT_ID = "opencode-cli"

type DeviceResponse = {
  device_code: string
  user_code: string
  verification_uri_complete: string
  interval?: number
}

type TokenResponse =
  | { access_token: string; refresh_token: string; expires_in: number }
  | { error: string }

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  })
  const body = await response.text()
  let value: unknown
  try {
    value = body ? JSON.parse(body) : undefined
  } catch {
    value = undefined
  }
  if (!response.ok) {
    const message = typeof value === "object" && value && "message" in value ? String(value.message) : body
    throw new Error(`OpenCode request failed (${response.status}): ${message || response.statusText}`)
  }
  return value as T
}

export async function OpenCodeAuthPlugin(_input: PluginInput): Promise<Hooks> {
  return {
    auth: {
      provider: "opencode",
      methods: [
        {
          type: "oauth",
          label: "Login with OpenCode (free models)",
          async authorize() {
            const device = await requestJson<DeviceResponse>(`${SERVER}/auth/device/code`, {
              method: "POST",
              body: JSON.stringify({ client_id: CLIENT_ID }),
            })
            const interval = Math.max(device.interval ?? 5, 5) * 1000
            return {
              url: device.verification_uri_complete,
              method: "auto" as const,
              instructions: `Open the link and finish login. Code: ${device.user_code}`,
              async callback() {
                for (;;) {
                  await new Promise((resolve) => setTimeout(resolve, interval))
                  const token = await requestJson<TokenResponse>(`${SERVER}/auth/device/token`, {
                    method: "POST",
                    body: JSON.stringify({
                      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                      device_code: device.device_code,
                      client_id: CLIENT_ID,
                    }),
                  })
                  if ("access_token" in token) {
                    return {
                      type: "success" as const,
                      provider: "opencode",
                      access: token.access_token,
                      refresh: token.refresh_token,
                      expires: Date.now() + token.expires_in * 1000,
                    }
                  }
                  if (token.error === "authorization_pending") continue
                  if (token.error === "slow_down") {
                    await new Promise((resolve) => setTimeout(resolve, 5000))
                    continue
                  }
                  return { type: "failed" as const }
                }
              },
            }
          },
        },
        {
          type: "api",
          label: "API key (optional; multi-key rotation supported)",
        },
      ],
    },
  }
}

export const server = OpenCodeAuthPlugin
export default OpenCodeAuthPlugin
