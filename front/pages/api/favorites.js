export default async function handler(req, res) {
  const response = await fetch(
    "http://localhost:7071/api/favorites", // Azure FunctionsのローカルURL
    { method: "GET" }
  );
  const data = await response.json();
  res.status(200).json(data);
}