import React from "react"

interface Product {
  id: number
  name: string
  sku?: string
  status: string
  fuel?: string
}

export default function ProductsTable({ products }: { products: Product[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">ID</th>
            <th className="border px-4 py-2 text-left">Ürün Adı</th>
            <th className="border px-4 py-2 text-left">SKU</th>
            <th className="border px-4 py-2 text-left">Yayın Durumu</th>
            <th className="border px-4 py-2 text-left">Yakıt Türü</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="border px-4 py-2">{product.id}</td>
              <td className="border px-4 py-2">{product.name}</td>
              <td className="border px-4 py-2">{product.sku || "-"}</td>
              <td className="border px-4 py-2">
                {product.status === "1" ? "Yayında" : "Yayında Değil"}
              </td>
              <td className="border px-4 py-2">{product.fuel || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
