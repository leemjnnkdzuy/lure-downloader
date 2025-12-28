export const userService = {
  async checkUsername(username: string) {
    const response = await fetch("/api/user/check-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    return response.json();
  },

  async updateUsername(username: string) {
    const response = await fetch("/api/user/update-username", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    return { data: await response.json(), ok: response.ok };
  },

  async updateAvatar(image: string) {
    const response = await fetch("/api/user/update-avatar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
    });
    return { data: await response.json(), ok: response.ok };
  },

  // Change Email Flow
  async sendCurrentEmailPin() {
    const response = await fetch("/api/user/change-email/send-current", {
      method: "POST",
    });
    return { data: await response.json(), ok: response.ok };
  },

  async verifyCurrentEmailPin(code: string) {
    const response = await fetch("/api/user/change-email/verify-current", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    return { data: await response.json(), ok: response.ok };
  },

  async sendNewEmailPin(email: string, token: string) {
    const response = await fetch("/api/user/change-email/send-new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    });
    return { data: await response.json(), ok: response.ok };
  },

  async confirmChangeEmail(data: { email: string; code: string; token: string }) {
    const response = await fetch("/api/user/change-email/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return { data: await response.json(), ok: response.ok };
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await fetch("/api/user/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return { data: await response.json(), ok: response.ok };
  },
};
