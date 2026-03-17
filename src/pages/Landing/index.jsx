import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Hero from "./sections/Hero";
import StatsTicker from "./sections/StatsTicker";
import Problem from "./sections/Problem";
import Solution from "./sections/Solution";
import Features from "./sections/Features";
import AISection from "./sections/AISection";
import Testimonials from "./sections/Testimonials";
import Pricing from "./sections/Pricing";
import CTABanner from "./sections/CTABanner";

const LandingPage = () => (
  <div className="landing-page">
    <Navbar />
    <main>
      <Hero />
      <StatsTicker />
      <Problem />
      <Solution />
      <Features />
      <AISection />
      <Testimonials />
      <Pricing />
      <CTABanner />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
