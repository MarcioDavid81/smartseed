import Navbar from "./_components/Navbar";
import HeroSection from "./_components/Hero";
import AboutSection from "./_components/About";
import ServicesSection from "./_components/Services";
import ContactSection from "./_components/Contact";
import Footer from "./_components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen w-full scroll-smooth">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
