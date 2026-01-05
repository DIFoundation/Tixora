"use client"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { NetworkSwitcher } from './network-switcher'
import { useConnection } from 'wagmi'
import { useState, useEffect, useRef } from 'react'
import { ThemeToggle } from './theme-toggle'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CustomConnectButton } from './CustomConnectButton'

const navLinks = [
  { name: "Dashboard", path: "/dashboard", requiresAuth: true },
  { name: "Profile", path: "/profile", requiresAuth: true },
  { name: "Create Event", path: "/create-event", requiresAuth: true },
  { name: "Marketplace", path: "/marketplace", requiresAuth: false },
  { 
    name: "Docs", 
    path: "https://github.com/DIFoundation/Tixora/blob/main/README.md", 
    external: true,
    requiresAuth: false 
  },
  { name: "Resources", path: "/resources", requiresAuth: false, hideWhenConnected: true },
  { name: "How It Works", path: "/#how-it-works", requiresAuth: false, hideWhenConnected: true }
]

// Minimum touch target size for better mobile interaction
const TOUCH_TARGET_SIZE = 44;

// Animation variants for mobile menu
const mobileMenuVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut" as const
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.15,
      ease: "easeIn" as const
    }
  }
};

export default function Header() {
  const pathname = usePathname()
  const { isConnected } = useConnection()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // Close mobile menu when clicking outside or navigating
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    // Handle escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    // Prevent body scroll when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Render navigation links
  const renderNavLinks = (isMobile = false) => {
    const links = navLinks
      .filter(link => (!link.requiresAuth || isConnected) && !(isConnected && link.hideWhenConnected))
      .map((link) => (
        <li key={link.path} className="w-full">
          <Link
            href={link.path}
            target={link.external ? "_blank" : "_self"}
            rel={link.external ? "noopener noreferrer" : ""}
            className={`block w-full px-4 py-3 text-left text-sm font-medium transition-colors rounded-lg ${
              pathname === link.path
                ? "text-white bg-[#51a2ff]"
                : "text-[#a1a1a1] hover:bg-[#1c398e]"
            }`}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            {link.name}
          </Link>
        </li>
      ));

    return (
      <ul className={`space-y-2 ${isMobile ? 'w-full' : 'hidden md:flex md:items-center md:space-x-2 md:space-y-0'}`}>
        {links}
      </ul>
    );
  };

  // Render mobile menu button
  const renderMobileMenuButton = () => (
    <button
      ref={menuButtonRef}
      onClick={toggleMobileMenu}
      className="md:hidden p-2 rounded-md text-[#a1a1a1] hover:text-white hover:bg-[#51a2ff] focus:outline-none focus:ring-2 focus:ring-[#51a2ff] focus:ring-offset-2 focus:ring-offset-[#0f172b] transition-colors"
      aria-expanded={isMobileMenuOpen}
      aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      style={{
        minWidth: TOUCH_TARGET_SIZE,
        minHeight: TOUCH_TARGET_SIZE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {isMobileMenuOpen ? (
        <X className="h-6 w-6" aria-hidden="true" />
      ) : (
        <Menu className="h-6 w-6" aria-hidden="true" />
      )}
    </button>
  );

  // Render mobile menu overlay and content
  const renderMobileMenu = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Mobile menu panel */}
          <motion.div
            ref={mobileMenuRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
            className="fixed top-0 right-0 w-4/5 max-w-sm h-full bg-[#0f172b] backdrop-blur-lg shadow-2xl z-50 overflow-y-auto md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-[#1c398e]">
                <Link 
                  href="/" 
                  className="flex items-center space-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="relative h-10 w-10">
                    <Image
                      src="/tixora-logo.png"
                      alt="Tixora"
                      width={100}
                      height={100}
                      className="rounded-full h-10 w-auto"
                      priority
                    />
                  </div>
                  <span className="text-lg font-bold text-[#51a2ff]">
                    Tixora
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md text-[#a1a1a1] hover:text-white hover:bg-[#1c398e]/30 focus:outline-none"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <nav className="flex-1 p-4 space-y-4">
                {renderNavLinks(true)}
                
                <div className="pt-4 border-t border-[#1c398e]/50 space-y-4">
                  <div className="flex flex-col space-y-4">
                    <div className="w-full">
                      <CustomConnectButton />
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <ThemeToggle />
                      <NetworkSwitcher />
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header 
        className="bg-[#0f172b] border-b border-[#1c398e]/50 backdrop-blur-md sticky top-0 z-50"
        style={{ WebkitBackdropFilter: 'blur(12px)' }} // For Safari
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2"
              aria-label="Tixora Home"
            >
              <div className="relative h-10 w-10">
                <Image
                  src="/tixora-logo.png"
                  alt="Tixora"
                  width={100}
                  height={100}
                  className="rounded-full h-10 w-auto"
                  priority
                />
              </div>
              <span className="text-xl font-bold text-[#51a2ff]">
                Tixora
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center">
            {renderNavLinks()}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center justify-center space-x-2">
            <NetworkSwitcher />
            <CustomConnectButton />
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            {renderMobileMenuButton()}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {renderMobileMenu()}
    </>
  )
}
