import React, { useState } from "react";
import api from "../services/api";

export default function ItemForm({ onSuccess }) {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("description", description);
    if (name) formData.append("name", name);
    if (image) formData.append("image", image);

    try {
      await api.post("/report", formData, { headers: { "Content-Type": "multipart/form-data" }});
      setDescription(""); setImage(null); setName("");
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
    </form>
  );
}
