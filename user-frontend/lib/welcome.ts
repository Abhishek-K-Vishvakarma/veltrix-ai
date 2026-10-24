// "Login ke baad welcome animation sirf ek baar dikhao."
// Login flag set karta hai, login ke baad ka pehla screen use consume karta hai.
// Refresh = kuch nahi. Logout + login = phir dikhega.
const KEY = "veltrix_welcome_pending";

export function markWelcomePending(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // storage blocked: animation optional hai
  }
}

export function consumeWelcomePending(): boolean {
  try {
    if (sessionStorage.getItem(KEY) !== "1") return false;
    sessionStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}