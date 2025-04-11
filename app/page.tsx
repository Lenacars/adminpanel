import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, LineChart, Package, Settings, Users } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Sidebar } from "@/components/sidebar"
import DataFetcher from "@/components/data-fetcher"

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>
        <Navigation />
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Ayarlar
          </Button>
        </div>
      </header>
      <main className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-4 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₺45,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% geçen aydan</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Abonelikler</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-muted-foreground">+180.1% geçen aydan</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satışlar</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-muted-foreground">+19% geçen aydan</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif Kullanıcılar</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">+201 geçen aydan</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Genel Bakış</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                  <LineChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Grafik verisi burada görüntülenecek</span>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Son Aktiviteler</CardTitle>
                <CardDescription>Son 24 saatte 34 işlem gerçekleşti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex items-center">
                    <div className="mr-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Ahmet Yılmaz</p>
                      <p className="text-sm text-muted-foreground">ahmet@ornek.com</p>
                    </div>
                    <div className="ml-auto font-medium">+₺1,999.00</div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Ayşe Demir</p>
                      <p className="text-sm text-muted-foreground">ayse@ornek.com</p>
                    </div>
                    <div className="ml-auto font-medium">+₺39.00</div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Mehmet Kaya</p>
                      <p className="text-sm text-muted-foreground">mehmet@ornek.com</p>
                    </div>
                    <div className="ml-auto font-medium">+₺299.00</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4">
            <Tabs defaultValue="data">
              <TabsList>
                <TabsTrigger value="data">Veri Tablosu</TabsTrigger>
                <TabsTrigger value="upload">Veri Yükleme</TabsTrigger>
              </TabsList>
              <TabsContent value="data" className="p-4 border rounded-md mt-2">
                <DataFetcher />
              </TabsContent>
              <TabsContent value="upload" className="p-4 border rounded-md mt-2">
                <div className="flex flex-col items-center justify-center">
                  <p className="mb-4">
                    Veri yüklemek için{" "}
                    <Link href="/upload" className="text-primary underline">
                      Yükleme Sayfası
                    </Link>
                    'nı ziyaret edin.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
