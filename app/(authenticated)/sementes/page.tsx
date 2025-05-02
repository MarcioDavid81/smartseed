import Saudacao from "../_components/Saudacao";
import CreateCultivarButton from "./_components/CreateCultivarButton";
import GetCultivars from "./_components/GetCultivars";

export default async function SeedsPage() {

    return (
      <div className="flex flex-col w-full min-h-screen bg-found">
        <div className="min-h-screen w-full flex bg-green-50 rounded-lg">
          <main className="flex-1 py-4 px-4 md:px-8 text-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-2xl font-semibold mb-4">Sementes</h1>
              <Saudacao />
              <CreateCultivarButton />
            </div>

            <GetCultivars />
          </main>
        </div>
      </div>
    );
}
