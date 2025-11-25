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
    <div>
      <div className="mb-6">
        <ItemForm onSuccess={loadItems} />
      </div>

      <h2 className="text-xl font-bold mb-3">Found Items</h2>
      <ItemList items={items} />
    </div>
  );
}
