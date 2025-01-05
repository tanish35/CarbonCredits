import { NavLink } from "react-router-dom";

const baseClass = "text-sm font-medium my-2 px-4 py-2 rounded-md transition-colors duration-2000";
const activeClass = "text-primary-text border-b-2 border-primary";
const inactiveClass = "text-secondary-text hover:text-primary-test hover:border-b-2 hover:border-primary";

export const Navigation = ({mobile}:{mobile:boolean}) => {
  return (
    <div className={`flex ${mobile ? "flex-col gap-2" : "gap-2"}`}>
      <NavLink to="/" end className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}>
        Dashboard
      </NavLink>
      <NavLink to="/mint" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}>
        Mint NFT
      </NavLink>
      <NavLink to="/my-nft" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}>
        My NFT
      </NavLink>
    </div>
  );
}
