import url from"../url";

const getAuthHeaders = () => {
  const user = localStorage.getItem("edudocs");
  if (!user) return null;

  const token = JSON.parse(user).token;
  return {
"Content-Type":"application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const fetchWishlist = async () => {
  const headers = getAuthHeaders();
  if (!headers) return [];

  const res = await fetch(`${url}/wishlist/my`, { headers });
  const json = await res.json();

  console.log("WISHLIST RESPONSE", json);

  return json?.data?.items || [];
};

export const addToWishlist = async (payload: any) => {
  const headers = getAuthHeaders();
  if (!headers) throw new Error("NOT_LOGGED_IN");

  const res = await fetch(`${url}/wishlist/add`, {
    method:"POST",
    headers,
    body: JSON.stringify(payload),
  });

  return res.json();
};

export const removeFromWishlist = async (payload: any) => {
  const headers = getAuthHeaders();
  if (!headers) throw new Error("NOT_LOGGED_IN");

  const res = await fetch(`${url}/wishlist/remove`, {
    method:"DELETE",
    headers,
    body: JSON.stringify(payload),
  });

  return res.json();
};

export const clearWishlist = async () => {
  const headers = getAuthHeaders();
  if (!headers) throw new Error("NOT_LOGGED_IN");

  const res = await fetch(`${url}/wishlist/clear`, {
    method:"DELETE",
    headers,
  });

  return res.json();
};