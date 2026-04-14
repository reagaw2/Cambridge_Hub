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

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated, user } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
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

  // First-time onboarding — show once, before dashboard
  if (isAuthenticated && !user?.onboarding_completed) {
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
        <Route path="/" element={<Dashboard />} />
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