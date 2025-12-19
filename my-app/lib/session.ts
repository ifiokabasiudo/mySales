import { Preferences } from "@capacitor/preferences";

export async function saveSession(user: any) {
  await Preferences.set({
    key: "session",
    value: JSON.stringify(user),
  });
}

export async function getSession() {
  const { value } = await Preferences.get({ key: "session" });
  return value ? JSON.parse(value) : null;
}

export async function clearSession() {
  await Preferences.remove({ key: "session" });
}
