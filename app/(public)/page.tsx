import CTA from "./_components/CTA";
import FAQ from "./_components/FAQ";
import Footer from "./_components/Footer";
import HeroSection from "./_components/Hero";
import HowItWorks from "./_components/HowItWorks";
import Navbar from "./_components/Navbar";
import Pricing from "./_components/Pricing";

export default function Home() {
  return (
    <main className="min-h-screen w-full">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
