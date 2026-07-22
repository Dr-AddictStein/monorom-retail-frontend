const UPLOAD_BACKEND_URL =
  import.meta.env.VITE_UPLOAD_BACKEND_URL || "https://api.monorom.store";

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${UPLOAD_BACKEND_URL}/api/file/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  const data = await response.json();
  return data.filePath;
}
