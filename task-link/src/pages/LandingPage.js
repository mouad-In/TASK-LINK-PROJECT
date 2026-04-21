import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setMounted } from '../features/landing/landingSlice';
import {
  CosmicBackground,
  HeroSection,
  StatsGrid,
  CategorySection,
  HowItWorksSection,
  TalkWithUsSection,
  CallToActionSection,
  TestimonialsSection,
  ChatButton,
  FooterSection,
  //ThreeDBackground,
} from '../components/landing';
import ThreeDBackground from '../components/landing/ThreeDBackground';
const LandingPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMounted());
  }, [dispatch]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #1e1035 50%, #2d1b69 100%)',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      <ThreeDBackground />
      <CosmicBackground />

      <HeroSection />

      {/* Stats positioned below hero */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        marginTop: '-8rem',
        paddingBottom: '5rem',
        display: 'flex',
        justifyContent: 'center',
        padding: '0 1rem 5rem',
      }}>
        <StatsGrid />
      </div>

      <CategorySection />

      <HowItWorksSection />

      <TalkWithUsSection />

      <CallToActionSection />

      <TestimonialsSection />

      <ChatButton />

      <FooterSection />
    </div>
  );
};

export default LandingPage;
