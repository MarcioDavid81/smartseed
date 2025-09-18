import Navbar from "./Navbar"
import Saudacao from "./Saudacao"
import SelectCycle from "./SelectCycle"

const NavItems = () => {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-10">
              <Saudacao />
              <Navbar />
              <SelectCycle />
            </div>
    )
}

export default NavItems;