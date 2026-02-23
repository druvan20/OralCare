import API from "./api";

export const predictCancer = async (formData) => {
  const res = await API.post("/api/predict", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
