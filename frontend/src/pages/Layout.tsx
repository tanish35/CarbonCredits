import { Footer } from "@/components/Footer";
import Header from "@/components/Header";
import { Outlet } from "react-router-dom";

export const Layout = ()  => {
  return (
    <div className="min-h-screen flex flex-col antialiased bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-1 md:px-8 lg:px-12 max-w-7xl">
            <Outlet />
      </main>
      <Footer />
    </div>
  );
}
