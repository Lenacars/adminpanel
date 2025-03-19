import { redirect } from "next/navigation"

export default function HomePage() {
  // Ana sayfayı admin sayfasına yönlendir
  redirect("/admin")
}

