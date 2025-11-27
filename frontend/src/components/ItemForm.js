import React, { useState } from "react";
import api from "../services/api";

export default function ItemForm({ onSuccess, userRole }) {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const rolesToHideFrom = ['admin', 'super_admin'];
    formData.append("description", description);
    if (name) formData.append("name", name);
    if (image) formData.append("image", image);
    // Optionally add user_id if available
    // formData.append("user_id", ...);
    if (userRole && rolesToHideFrom.includes(userRole.toLowerCase())) {
      return null;
    }

    try {
      const res = await api.post("/report", formData);
      setDescription(""); setImage(null); setName("");
      setResult(res.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("Error submitting report");
    }
  };

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded shadow">
      <h3 className="font-semibold mb-3">Report Lost Item</h3>

      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Item name (optional)" className="w-full border p-2 mb-2" />
      <textarea required value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe the item..." className="w-full border p-2 mb-2" />

      <input type="file" onChange={e=>setImage(e.target.files[0])} className="mb-3" />
      <div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h4 className="font-semibold mb-2">AI Analysis</h4>
          <div>
            <strong>Image Labels:</strong> {Array.isArray(result.image_labels)
              ? (result.image_labels.length > 0 ? result.image_labels.join(", ") : "No labels detected.")
              : "No image analysis returned."}
          </div>
          <div>
            <strong>NLP Keywords:</strong> {Array.isArray(result.nlp_keywords)
              ? (result.nlp_keywords.length > 0 ? result.nlp_keywords.join(", ") : "No keywords detected.")
              : "No NLP analysis returned."}
          </div>
          {!Array.isArray(result.image_labels) && !Array.isArray(result.nlp_keywords) && (
            <div className="text-red-500 mt-2">AI analysis failed or was not returned by the server.</div>
          )}
        </div>
      )}
    </form>
  );
}
