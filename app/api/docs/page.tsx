export default function ApiDocsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">LenaCars API Dokümantasyonu</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Genel Bakış</h2>
          <p>
            Bu API, LenaCars frontend uygulaması için veri sağlar. Tüm istekler için temel URL:
            <code className="bg-gray-100 px-2 py-1 rounded ml-2">https://lena-cars-admin.vercel.app/api</code>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Ürünler</h2>

          <div className="space-y-4">
            <div className="border p-4 rounded-md">
              <h3 className="text-xl font-bold mb-2">Tüm Ürünleri Getir</h3>
              <p className="mb-2">
                <strong>GET</strong> /api/products
              </p>
              <p className="mb-2">Parametreler:</p>
              <ul className="list-disc list-inside mb-2">
                <li>page: Sayfa numarası (varsayılan: 1)</li>
                <li>per_page: Sayfa başına ürün sayısı (varsayılan: 10)</li>
                <li>search: Arama terimi (opsiyonel)</li>
              </ul>
              <p className="mb-2">Örnek:</p>
              <code className="block bg-gray-100 p-2 rounded">GET /api/products?page=1&per_page=10&search=araba</code>
            </div>

            <div className="border p-4 rounded-md">
              <h3 className="text-xl font-bold mb-2">Belirli Bir Ürünü Getir</h3>
              <p className="mb-2">
                <strong>GET</strong> /api/products/{"{id}"}
              </p>
              <p className="mb-2">Parametreler:</p>
              <ul className="list-disc list-inside mb-2">
                <li>id: Ürün ID'si</li>
              </ul>
              <p className="mb-2">Örnek:</p>
              <code className="block bg-gray-100 p-2 rounded">GET /api/products/123</code>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Kategoriler</h2>

          <div className="border p-4 rounded-md">
            <h3 className="text-xl font-bold mb-2">Tüm Kategorileri Getir</h3>
            <p className="mb-2">
              <strong>GET</strong> /api/categories
            </p>
            <p className="mb-2">Örnek:</p>
            <code className="block bg-gray-100 p-2 rounded">GET /api/categories</code>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Frontend Kullanım Örneği</h2>
          <p className="mb-2">React ile API'yi kullanma örneği:</p>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {`// Ürünleri getir
async function fetchProducts() {
  const response = await fetch('https://lena-cars-admin.vercel.app/api/products');
  const data = await response.json();
  return data;
}

// Belirli bir ürünü getir
async function fetchProduct(id) {
  const response = await fetch(\`https://lena-cars-admin.vercel.app/api/products/\${id}\`);
  const data = await response.json();
  return data;
}

// Kategorileri getir
async function fetchCategories() {
  const response = await fetch('https://lena-cars-admin.vercel.app/api/categories');
  const data = await response.json();
  return data;
}`}
          </pre>
        </section>
      </div>
    </div>
  )
}

