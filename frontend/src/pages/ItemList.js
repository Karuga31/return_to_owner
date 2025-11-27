import React from "react";
import api from "../services/api";

export default function ItemList({ items = [] }) {
  const role = localStorage.getItem("role");

  const markRecovered = async (id) => {
    try {
      await api.post(`/items/${id}/recover`);
      // refresh page simple approach:
      window.location.reload();
    } catch (err) {
      alert("Error marking recovered");
    }
  };

  const lostItems = items.filter(it => it.status === "lost");
  const foundItems = items.filter(it => it.status === "found");

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Lost Items</h2>
      {lostItems.length === 0 && <p className="text-gray-500">No lost items found.</p>}
      {lostItems.map(it => (
        <div key={it.id} className="bg-white p-4 rounded shadow mb-3">
          <div className="flex gap-4">
            {it.image && <img src={`http://localhost:5000/datasets/images/${it.image}`} alt="" className="w-32 h-24 object-cover rounded" />}
            <div>
              <h3 className="font-semibold">{it.name}</h3>
              <p className="text-sm">{it.description}</p>
              <p className="text-xs text-gray-400">Reported by: {it.reported_by}</p>
              {!it.recovered && (role === "guard" || role === "admin") && (
                <button onClick={() => markRecovered(it.id)} className="mt-2 bg-yellow-500 px-3 py-1 rounded">Mark recovered</button>
              )}
            </div>
          </div>
        </div>
      ))}

      <h2 className="text-xl font-semibold mb-4 mt-8">Found Items</h2>
      {foundItems.length === 0 && <p className="text-gray-500">No found items.</p>}
      {foundItems.map(it => (
        <div key={it.id} className="bg-white p-4 rounded shadow mb-3">
          <div className="flex gap-4">
            {it.image && <img src={`http://localhost:5000/datasets/images/${it.image}`} alt="" className="w-32 h-24 object-cover rounded" />}
            <div>
              <h3 className="font-semibold">{it.name}</h3>
              <p className="text-sm">{it.description}</p>
              <p className="text-xs text-gray-400">Reported by: {it.reported_by}</p>
              <span className="inline-block ml-2 text-green-600">Recovered</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
