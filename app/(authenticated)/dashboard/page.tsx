import { Metadata } from "next";
import Saudacao from "../_components/Saudacao";
import Navbar from "../_components/Navbar";
import DashboardContent from "./_components/DashboardContent";
import SelectCycle from "../_components/SelectCycle";

export const metadata: Metadata = {
  title: "Dashboard",
  keywords: [
    "produção de sementes",
    "gestão de sementeiras",
    "controle de produção e estoque de sementes",
  ],
  description: "O seu sistema de gestão de produção de sementes",
  authors: [
    { name: "Marcio David", url: "https://md-webdeveloper.vercel.app" },
  ],
};

export default async function DashboardPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-found">
      <div className="min-h-screen w-full flex bg-background">
        <main className="flex-1 py-4 px-4 md:px-8 text-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-medium mb-4">Dashboard</h1>
            <div className="flex items-center space-x-10">
              <Navbar />
              <SelectCycle />
              <Saudacao />
            </div>
          </div>
          <DashboardContent />
        </main>
      </div>
    </div>
  );
}
