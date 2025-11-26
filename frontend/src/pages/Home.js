import React, { useEffect, useState } from "react";
import api from "../services/api";
import ItemList from "../pages/ItemList";
import ItemForm from "../components/ItemForm";

export default function Home() {
  const [items, setItems] = useState([]);

  const loadItems = async () => {
    try {
      const res = await api.get("/items");
      setItems(res.data);
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

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Item name (optional)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none"
          />

          <textarea
            placeholder="Describe the item..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-28 resize-none focus:ring focus:ring-blue-200 outline-none"
          ></textarea>

          <div>
            <input type="file" className="block text-sm text-gray-700" />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Found Items Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Found Items</h2>

        {items.length === 0 ? (
          <p className="text-gray-500">No items found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
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
