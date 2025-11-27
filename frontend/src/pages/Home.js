import React, { useEffect, useState } from "react";
import api from "../services/api";
import ItemList from "../pages/ItemList";
import ItemForm from "../components/ItemForm";

export default function Home() {
  const [items, setItems] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);

  const loadItems = async () => {
    try {
      const res = await api.get("/items");
      setItems(res.data);
      setLostItems(res.data.filter(item => item.status === "lost"));
      setFoundItems(res.data.filter(item => item.status === "found"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadItems(); }, []);

  return (
    <div className="space-y-10">
      {/* Report Lost Item */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Report Lost Item</h2>
        <ItemForm onSuccess={loadItems} />
      </div>

      {/* Lost Items Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Lost Items</h2>
        {lostItems.length === 0 ? (
          <p className="text-gray-500">No lost items reported.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lostItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                <p className="text-gray-700 text-sm mb-2">{item.description}</p>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt="Lost item"
                    className="w-full h-40 object-cover rounded mt-2"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Found Items Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Found Items</h2>
        {foundItems.length === 0 ? (
          <p className="text-gray-500">No items marked as found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foundItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                <p className="text-gray-700 text-sm mb-2">{item.description}</p>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt="Found item"
                    className="w-full h-40 object-cover rounded mt-2"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
