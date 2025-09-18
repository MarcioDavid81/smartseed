import Navbar from "./Navbar";
import Saudacao from "./Saudacao";
import SelectCycle from "./SelectCycle";

const NavItems = () => {
  return (
    <div className="flex flex-col items-start space-y-4 md:flex-row md:items-center md:space-x-10 md:space-y-0">
      <Saudacao />
      <Navbar />
      <SelectCycle />
    </div>
  );
};

export default NavItems;
