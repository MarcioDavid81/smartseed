import Navbar from "./Navbar"
import Saudacao from "./Saudacao"
import SelectCycle from "./SelectCycle"

const NavItems = () => {
    return (
        <div className="flex items-center space-x-10">
              <Navbar />
              <SelectCycle />
              <Saudacao />
            </div>
    )
}

export default NavItems;