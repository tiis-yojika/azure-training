export function getValidId() {
  if (typeof window === "undefined") return null; // SSR対策
  const id = localStorage.getItem("id");
  const expire = localStorage.getItem("id_expire");
  if (!id || !expire || Date.now() > Number(expire)) {
    localStorage.removeItem("id");
    localStorage.removeItem("id_expire");
    return null;
  }
  
  return id;
}