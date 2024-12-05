
// components/Shared/MobileMenuButton.js
import { FaGavel } from "react-icons/fa6";

const MobileMenuButton = ({ isOpen, toggle }) => (
  <button
    onClick={toggle}
    className="text-gray-600 hover:text-blue-500 focus:outline-none"
    aria-label="Toggle Menu"
  >
    {isOpen ? (
      <FaGavel className="h-4 w-4" size={9} />
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    )}
  </button>
);

export default MobileMenuButton;
