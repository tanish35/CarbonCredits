import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background py-4 mt-10">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left">
            <p>&copy; {currentYear} CarbonCredits. All rights reserved.</p>
          </div>
          <nav className="flex gap-4 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:underline" >Terms of Service</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

