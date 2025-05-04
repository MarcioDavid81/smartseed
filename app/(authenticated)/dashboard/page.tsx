import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      companyId: string;
    };

    return (
      <div className="flex flex-col w-full min-h-screen bg-found">
        <div className="min-h-screen w-full flex bg-background">
          <main className="flex-1 py-4 px-4 md:px-8 text-gray-800">
            <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
            <p className="text-gray-600 mt-2">Usuário: {decoded.userId}</p>
            <p className="text-gray-600">Empresa: {decoded.companyId}</p>
          </main>
        </div>
      </div>
    );
  } catch (err) {
    redirect("/login");
  }
}
