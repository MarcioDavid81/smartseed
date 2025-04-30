"use client"

import { motion } from "framer-motion";

const MenuMobile = ({ onClose }: { onClose: () => void }) => {
    return (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white border-t border-gray-200 px-6 py-4 shadow-md overflow-hidden"
        >
          <ul className="flex flex-col gap-4 text-gray-700 font-medium">
            <li><a href="#home" onClick={onClose} className="hover:text-green-600">Home</a></li>
            <li><a href="#about" onClick={onClose} className="hover:text-green-600">Sobre</a></li>
            <li><a href="#services" onClick={onClose} className="hover:text-green-600">Serviços</a></li>
            <li><a href="#contact" onClick={onClose} className="hover:text-green-600">Contato</a></li>
          </ul>
        </motion.div>
      );
}
 
export default MenuMobile;