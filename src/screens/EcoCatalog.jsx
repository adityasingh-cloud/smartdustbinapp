import React from 'react';
import { useApp } from '../context/AppContext';

const CATALOG = [
  {
    category: "🔩 METAL WASTE (HIGH PROFIT)",
    color: "#3A5A8C",
    items: [
      { name: "Copper wire", coins: 25 }, { name: "Copper pipe", coins: 22 }, { name: "Brass taps", coins: 18 },
      { name: "Aluminum cans", coins: 10 }, { name: "Aluminum utensils", coins: 12 }, { name: "Steel rods", coins: 8 },
      { name: "Iron scrap", coins: 6 }, { name: "Old fan motor", coins: 15 }, { name: "AC coil", coins: 20 },
      { name: "Refrigerator compressor", coins: 18 }, { name: "Electric motor", coins: 17 }, { name: "Car battery (lead)", coins: 22 },
      { name: "Bike battery", coins: 18 }, { name: "Steel furniture", coins: 10 }, { name: "Window aluminum frame", coins: 12 },
      { name: "Old tools", coins: 9 }, { name: "Gas stove metal", coins: 11 }, { name: "Pressure cooker", coins: 10 },
      { name: "Iron gate scrap", coins: 12 }, { name: "Copper cable (thick)", coins: 28 }
    ]
  },
  {
    category: "💻 E-WASTE (VERY HIGH PROFIT 💰)",
    color: "#8C3A8C",
    items: [
      { name: "Old smartphone", coins: 20 }, { name: "Broken laptop", coins: 25 }, { name: "Desktop CPU", coins: 22 },
      { name: "Motherboard", coins: 30 }, { name: "RAM chip", coins: 18 }, { name: "Hard disk", coins: 15 },
      { name: "Keyboard", coins: 6 }, { name: "Mouse", coins: 5 }, { name: "Charger", coins: 7 },
      { name: "Earphones", coins: 5 }, { name: "LED TV", coins: 18 }, { name: "CRT TV", coins: 10 },
      { name: "Printer", coins: 12 }, { name: "Router", coins: 7 }, { name: "Power supply unit", coins: 10 },
      { name: "Circuit board", coins: 28 }, { name: "Mobile battery", coins: 10 }, { name: "Lithium battery", coins: 15 },
      { name: "UPS", coins: 20 }, { name: "Cables bundle", coins: 12 }
    ]
  },
  {
    category: "🧴 PLASTIC WASTE (MEDIUM VALUE)",
    color: "#E8C547",
    items: [
      { name: "PET water bottles", coins: 6 }, { name: "Soft drink bottles", coins: 6 }, { name: "Milk packets", coins: 5 },
      { name: "Shampoo bottles", coins: 5 }, { name: "Detergent containers", coins: 6 }, { name: "Plastic chairs", coins: 8 },
      { name: "Plastic buckets", coins: 7 }, { name: "Food containers", coins: 5 }, { name: "Plastic toys", coins: 4 },
      { name: "Carry bags", coins: 3 }, { name: "Packaging plastic", coins: 4 }, { name: "PVC pipes", coins: 8 },
      { name: "Plastic drums", coins: 10 }, { name: "Bottle caps (PP)", coins: 4 }, { name: "Thermocol", coins: 2 },
      { name: "Plastic wrappers", coins: 2 }, { name: "Old helmets", coins: 6 }, { name: "Broken crates", coins: 7 },
      { name: "Plastic tanks", coins: 12 }, { name: "LDPE sheets", coins: 5 }
    ]
  },
  {
    category: "📄 PAPER & DRY WASTE",
    color: "#888",
    items: [
      { name: "Newspaper", coins: 3 }, { name: "Books", coins: 4 }, { name: "Cardboard boxes", coins: 5 },
      { name: "Office paper", coins: 4 }, { name: "Magazines", coins: 3 }, { name: "Old notebooks", coins: 3 },
      { name: "Paper packaging", coins: 3 }, { name: "Paper cups", coins: 2 }, { name: "Tissue waste", coins: 1 },
      { name: "Cartons", coins: 4 }
    ]
  },
  {
    category: "🥫 GLASS & OTHER DRY",
    color: "#3A8C8C",
    items: [
      { name: "Glass bottles", coins: 4 }, { name: "Beer bottles", coins: 5 }, { name: "Broken glass", coins: 2 },
      { name: "Window glass", coins: 4 }, { name: "Mirror glass", coins: 3 }
    ]
  },
  {
    category: "🍃 WET WASTE (LOW VALUE)",
    color: "#4A7C4E",
    items: [
      { name: "Vegetable peels", coins: 2 }, { name: "Fruit waste", coins: 2 }, { name: "Leftover food", coins: 1 },
      { name: "Tea leaves", coins: 2 }, { name: "Coffee waste", coins: 2 }, { name: "Egg shells", coins: 2 },
      { name: "Garden leaves", coins: 3 }, { name: "Grass", coins: 2 }, { name: "Flower waste", coins: 2 },
      { name: "Compostable waste", coins: 3 }
    ]
  },
  {
    category: "🧵 TEXTILE & RUBBER",
    color: "#8C5A3A",
    items: [
      { name: "Old clothes", coins: 5 }, { name: "Jeans", coins: 6 }, { name: "Shoes", coins: 4 },
      { name: "Bags", coins: 5 }, { name: "Rubber tires", coins: 10 }, { name: "Tubes", coins: 6 },
      { name: "Mats", coins: 4 }, { name: "Curtains", coins: 5 }, { name: "Bedsheets", coins: 5 },
      { name: "Leather waste", coins: 6 }
    ]
  },
  {
    category: "🏠 BULKY / MIXED SCRAP",
    color: "#555",
    items: [
      { name: "Sofa", coins: 15 }, { name: "Mattress", coins: 10 }, { name: "Wooden furniture", coins: 12 },
      { name: "Broken doors", coins: 10 }, { name: "Mixed scrap bag", coins: 5 }
    ]
  }
];

export default function EcoCatalog({ onBack }) {
  const { t } = useApp();

  return (
    <div className="screen screen-fade" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="topbar" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(18,18,16,0.9)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} className="icon-btn">←</button>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: 2, color: 'var(--yellow)' }}>ECO SYSTEM</div>
        </div>
      </div>

      <div style={{ padding: '0 20px 40px' }}>
        {/* Simple Logic Header */}
        <div className="card" style={{ marginBottom: 20, background: 'rgba(232,197,71,0.1)', border: '1px solid var(--yellow)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--yellow)', marginBottom: 12 }}>ECO COIN SYSTEM (LOGIC)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', opacity: 0.8 }}>Very High Value: 20–50 coins</div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', opacity: 0.8 }}>High Value: 10–20 coins</div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', opacity: 0.8 }}>Medium: 5–10 coins</div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', opacity: 0.8 }}>Low: 1–5 coins</div>
          </div>
        </div>

        {/* Catalog Sections */}
        {CATALOG.map((cat, idx) => (
          <div key={idx} style={{ marginBottom: 24 }}>
            <div style={{ 
              fontFamily: 'var(--font-display)', fontSize: 16, color: cat.color, 
              marginBottom: 10, borderBottom: `1px solid ${cat.color}44`, paddingBottom: 4 
            }}>
              {cat.category}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cat.items.map((item, i) => (
                <div key={i} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ fontSize: 13, color: '#fff' }}>{item.name}</div>
                  <div style={{ 
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 'bold', 
                    color: 'var(--yellow)', background: 'rgba(232,197,71,0.1)', 
                    padding: '2px 8px', borderRadius: 12 
                  }}>
                    +{item.coins}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
