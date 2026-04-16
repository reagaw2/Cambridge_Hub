import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/AppLayout';
import Profile from './pages/Profile';
// Add page imports here
import Dashboard from './pages/Dashboard.jsx';
import SubjectSelection from './pages/SubjectSelection.jsx';
import Reflection from './pages/Reflection';
import SimilarQuestion from './pages/SimilarQuestion';
import FamiliarityCheck from './pages/FamiliarityCheck';
import QuestionAttempt from './pages/QuestionAttempt';
import Feedback from './pages/Feedback';
import ReviewSession from './pages/ReviewSession';
import NuclearQuestionAttempt from './pages/nuclear/QuestionAttempt';
import NuclearSimilarQuestion from './pages/nuclear/SimilarQuestion';
import NuclearFamiliarityCheck from './pages/nuclear/FamiliarityCheck';
import ReviewAffirmation from './pages/ReviewAffirmation';
import GravitationalQuestionAttempt from './pages/gravitational/QuestionAttempt';
import ThermalQuestionAttempt from './pages/thermal/QuestionAttempt';
import ThermalSimilarQuestion from './pages/thermal/SimilarQuestion';
import OscillationsQuestionAttempt from './pages/oscillations/QuestionAttempt';
import OscillationsSimilarQuestion from './pages/oscillations/SimilarQuestion';
import ElectricQuestionAttempt from './pages/electric/QuestionAttempt';
import CapacitanceQuestionAttempt from './pages/capacitance/QuestionAttempt';
import CapacitanceSimilarQuestion from './pages/capacitance/SimilarQuestion';
import EMInductionQuestionAttempt from './pages/eminduction/QuestionAttempt';
import QuantumQuestionAttempt from './pages/quantum/QuestionAttempt';
import AstroQuestionAttempt from './pages/astrophysics/QuestionAttempt';
import AstroSimilarQuestion from './pages/astrophysics/SimilarQuestion';
import AstroFamiliarityCheck from './pages/astrophysics/FamiliarityCheck';
import MCQSession from './pages/MCQSession';
import MCQFeedback from './pages/MCQFeedback';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import GravitationalQuestion1a from './pages/gravitational/Question1a';
import GravitationalQuestion1bi from './pages/gravitational/Question1bi';
import ThermalQuestion2a from './pages/thermal/Question2a';
import ThermalQuestion2bi from './pages/thermal/Question2bi';
import ThermalQuestion2bii from './pages/thermal/Question2bii';
import ThermalQuestion3a from './pages/thermal/Question3a';
import ThermalQuestion3bii from './pages/thermal/Question3bii';
import OscillationsQuestion4a from './pages/oscillations/Question4a';
import OscillationsQuestion4bii from './pages/oscillations/Question4bii';
import ElectricQuestion5a from './pages/electric/Question5a';
import ElectricQuestion5b from './pages/electric/Question5b';
import CapacitanceQuestion6a from './pages/capacitance/Question6a';
import AstroQuestion8ai from './pages/astrophysics/Question8ai';
import AstroQuestion11a from './pages/astrophysics/Question11a';
import NuclearQuestion9a from './pages/nuclear/Question9a';
import NuclearQuestion9cii from './pages/nuclear/Question9cii';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, isLoadingProgress, authError, navigateToLogin, isAuthenticated, user } = useAuth();

  // Show loading spinner while checking app public settings, auth, or fetching progress
  if (isLoadingPublicSettings || isLoadingAuth || isLoadingProgress) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
        {isLoadingProgress && (
          <p className="text-sm text-muted-foreground">Loading your progress...</p>
        )}
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Show welcome screen — let user choose to sign up or log in
      return (
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="*" element={<Welcome />} />
        </Routes>
      );
    }
  }

  // Not authenticated — show welcome screen
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="*" element={<Welcome />} />
      </Routes>
    );
  }

  // First-time onboarding — show once, before dashboard (scoped per user)
  const localOnboardingDone = localStorage.getItem(`cambridge_hub_onboarding_completed_${user?.id}`) === "true";
  if (isAuthenticated && !user?.onboarding_completed && !localOnboardingDone) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<SubjectSelection />} />
        <Route path="/physics" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/question" element={<QuestionAttempt />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/reflection" element={<Reflection />} />
        <Route path="/similar-question" element={<SimilarQuestion />} />
        <Route path="/familiarity-check" element={<FamiliarityCheck />} />
        <Route path="/review" element={<ReviewSession />} />
        <Route path="/nuclear/question" element={<NuclearQuestionAttempt />} />
        <Route path="/nuclear/similar-question" element={<NuclearSimilarQuestion />} />
        <Route path="/nuclear/familiarity-check" element={<NuclearFamiliarityCheck />} />
        <Route path="/review-affirmation" element={<ReviewAffirmation />} />
        <Route path="/gravitational/question" element={<GravitationalQuestionAttempt />} />
        <Route path="/thermal/question" element={<ThermalQuestionAttempt />} />
        <Route path="/thermal/similar-question" element={<ThermalSimilarQuestion />} />
        <Route path="/oscillations/question" element={<OscillationsQuestionAttempt />} />
        <Route path="/oscillations/similar-question" element={<OscillationsSimilarQuestion />} />
        <Route path="/electric/question" element={<ElectricQuestionAttempt />} />
        <Route path="/capacitance/question" element={<CapacitanceQuestionAttempt />} />
        <Route path="/capacitance/similar-question" element={<CapacitanceSimilarQuestion />} />
        <Route path="/eminduction/question" element={<EMInductionQuestionAttempt />} />
        <Route path="/quantum/question" element={<QuantumQuestionAttempt />} />
        <Route path="/astrophysics/question" element={<AstroQuestionAttempt />} />
        <Route path="/astrophysics/similar-question" element={<AstroSimilarQuestion />} />
        <Route path="/astrophysics/familiarity-check" element={<AstroFamiliarityCheck />} />
        <Route path="/mcq" element={<MCQSession />} />
        <Route path="/mcq-feedback" element={<MCQFeedback />} />
        <Route path="/gravitational/q1a" element={<GravitationalQuestion1a />} />
        <Route path="/gravitational/q1bi" element={<GravitationalQuestion1bi />} />
        <Route path="/thermal/q2a" element={<ThermalQuestion2a />} />
        <Route path="/thermal/q2bi" element={<ThermalQuestion2bi />} />
        <Route path="/thermal/q2bii" element={<ThermalQuestion2bii />} />
        <Route path="/thermal/q3a" element={<ThermalQuestion3a />} />
        <Route path="/thermal/q3bii" element={<ThermalQuestion3bii />} />
        <Route path="/oscillations/q4a" element={<OscillationsQuestion4a />} />
        <Route path="/oscillations/q4bii" element={<OscillationsQuestion4bii />} />
        <Route path="/electric/q5a" element={<ElectricQuestion5a />} />
        <Route path="/electric/q5b" element={<ElectricQuestion5b />} />
        <Route path="/capacitance/q6a" element={<CapacitanceQuestion6a />} />
        <Route path="/astrophysics/q8ai" element={<AstroQuestion8ai />} />
        <Route path="/astrophysics/q11a" element={<AstroQuestion11a />} />
        <Route path="/nuclear/q9a" element={<NuclearQuestion9a />} />
        <Route path="/nuclear/q9cii" element={<NuclearQuestion9cii />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App