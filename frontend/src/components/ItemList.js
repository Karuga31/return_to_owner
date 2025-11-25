import React from "react";

function ItemList({ items }) {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Found Items</h2>

      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 shadow rounded">
            <p className="font-semibold">{item.description}</p>

            {item.image_url && (
              <img
                src={`http://localhost:5000/${item.image_url}`}
                alt="item"
                className="mt-2 w-40 rounded"
              />
            )}

            <p className="text-sm text-gray-600 mt-2">
              Found on: {new Date(item.date_found).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ItemList;
