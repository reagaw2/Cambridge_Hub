import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Flame } from "lucide-react";
import { recordAttempt, addToReviewBank, writeMistakeDna } from "../lib/topicStore";
import PulseFeedback from "@/components/PulseFeedback";
import { detectSubject } from "@/lib/pulsePromptBuilder";

const QUESTION_META = {
  "9702-22-W19-Q1a": { question_id: "9702-22-W19-Q1a", topic: "Physical Quantities & Units", question_text: "Distinguish between vector and scalar quantities.", mark_scheme: "B1: a scalar quantity has magnitude only. B1: a vector quantity has both magnitude and direction.", total_marks: 2 },
  "9702-41-W19-Q2a": { question_id: "9702-41-W19-Q2a", topic: "Thermal Physics", question_text: "State the assumption of kinetic theory that is related to the volume of the molecules of the gas.", mark_scheme: "M1: volume of molecules is negligible. A1: compared with the volume occupied by the gas.", total_marks: 2 },
  "9702-42-W19-Q2aii": { question_id: "9702-42-W19-Q2aii", topic: "Thermal Physics", question_text: "Describe how Brownian motion provides evidence for the nature of the movement of gas molecules.", mark_scheme: "M1: gas molecules collide with smoke particles / random motion of gas molecules. A1: causes haphazard motion of smoke particles.", total_marks: 2 },
  "9702-43-S21-Q2b": { question_id: "9702-43-S21-Q2b", topic: "Thermal Physics", question_text: "Use kinetic theory to explain why gas expansion causes a decrease in temperature.", mark_scheme: "B1: speed decreases on impact with moving piston. B1: mean square speed proportional to temperature. B1: KE decreases so temperature decreases.", total_marks: 3 },
  "9702-41-S24-Q3ai": { question_id: "9702-41-S24-Q3ai", topic: "Thermal Physics", question_text: "State what is meant by an ideal gas.", mark_scheme: "M1: pV proportional to T. A1: where T is thermodynamic temperature.", total_marks: 2 },
  "9702-41-S24-Q3aii": { question_id: "9702-41-S24-Q3aii", topic: "Thermal Physics", question_text: "Use one basic assumption of kinetic theory to explain the potential energy of molecules in an ideal gas.", mark_scheme: "B1: no intermolecular forces. B1: so potential energy is zero.", total_marks: 2 },
  "9702-43-W24-Q3ai": { question_id: "9702-43-W24-Q3ai", topic: "Thermal Physics", question_text: "State what is meant by the Avogadro constant.", mark_scheme: "B1: number of particles per unit amount of substance.", total_marks: 1 },
  "9702-43-W24-Q3aii": { question_id: "9702-43-W24-Q3aii", topic: "Thermal Physics", question_text: "State the relationship between the Avogadro constant NA, the molar gas constant R and the Boltzmann constant k.", mark_scheme: "B1: NA = R/k.", total_marks: 1 },
  "9702-42-W21-Q3ai": { question_id: "9702-42-W21-Q3ai", topic: "Thermal Physics", question_text: "State what is meant by an elastic collision.", mark_scheme: "B1: no loss of kinetic energy.", total_marks: 1 },
  "9702-42-W21-Q3aii": { question_id: "9702-42-W21-Q3aii", topic: "Thermal Physics", question_text: "State two other assumptions of the kinetic theory of gases.", mark_scheme: "B1: any valid assumption. B1: a second different valid assumption.", total_marks: 2 },
  "9702-43-S23-Q4a": { question_id: "9702-43-S23-Q4a", topic: "Thermal Physics", question_text: "State two of the basic assumptions of the kinetic theory of gases.", mark_scheme: "B1: any valid assumption. B1: a second different valid assumption.", total_marks: 2 },
  "9702-43-W23-Q3ai": { question_id: "9702-43-W23-Q3ai", topic: "Thermal Physics", question_text: "State the meaning of N, m and mean square speed in pV = Nm × (mean square speed) / 3.", mark_scheme: "B1: N is number of molecules. B1: m is mass of one molecule. B1: mean square speed of molecules.", total_marks: 3 },
  "9702-43-W23-Q3d": { question_id: "9702-43-W23-Q3d", topic: "Thermal Physics", question_text: "Use kinetic theory to suggest why gas at very high pressure is unlikely to behave as an ideal gas.", mark_scheme: "B1: molecules very close together. B1: forces / volume of molecules not negligible.", total_marks: 2 },
  "9702-42-W22-Q3a": { question_id: "9702-42-W22-Q3a", topic: "Thermal Physics", question_text: "State the meaning of each symbol in pV = NkT.", mark_scheme: "B1: p is pressure. B1: V is volume, k is Boltzmann constant. B1: N is number of molecules, T is thermodynamic temperature.", total_marks: 3 },
  "9702-42-M23-Q2bii": { question_id: "9702-42-M23-Q2bii", topic: "Thermal Physics", question_text: "Use the first law of thermodynamics to explain why temperature of helium increases when work is done on it.", mark_scheme: "M1: work done on gas. A1: internal energy increases so temperature increases.", total_marks: 2 },
  "9702-42-W23-Q8a": { question_id: "9702-42-W23-Q8a", topic: "Quantum Physics", question_text: "State what is meant by a photon.", mark_scheme: "M1: packet or quantum of energy. A1: of electromagnetic radiation.", total_marks: 2 },
  "9702-42-W23-Q8bi": { question_id: "9702-42-W23-Q8bi", topic: "Quantum Physics", question_text: "State the name of the phenomenon when EM radiation hits a metal surface and electrons are emitted.", mark_scheme: "B1: photoelectric effect.", total_marks: 1 },
  "9702-42-W23-Q8bii": { question_id: "9702-42-W23-Q8bii", topic: "Quantum Physics", question_text: "Explain how the observation that the photoelectric effect only occurs above a threshold frequency provides evidence for photons.", mark_scheme: "B1: electron needs minimum energy. B1: energy absorbed in packets related to frequency. B1: intensity relates to number of packets not energy per packet.", total_marks: 3 },
  "9702-42-S23-Q8a": { question_id: "9702-42-S23-Q8a", topic: "Quantum Physics", question_text: "Explain with reference to photons why there is a single frequency of EM radiation for each electron transition.", mark_scheme: "B1: transition emits one photon with energy equal to difference in energy levels. B1: frequency corresponds to energy of photon.", total_marks: 2 },
  "9702-42-M24-Q7ci": { question_id: "9702-42-M24-Q7ci", topic: "Quantum Physics", question_text: "Explain the term threshold wavelength.", mark_scheme: "B1: maximum wavelength that causes electron emission from metal surface.", total_marks: 1 },
  "9702-43-S23-Q7a": { question_id: "9702-43-S23-Q7a", topic: "Quantum Physics", question_text: "State what is meant by the de Broglie wavelength.", mark_scheme: "B1: wavelength associated with a moving particle.", total_marks: 1 },
  "9702-43-S23-Q7bii": { question_id: "9702-43-S23-Q7bii", topic: "Quantum Physics", question_text: "Explain what a diffraction pattern from electrons through a crystal shows about the nature of electrons.", mark_scheme: "B1: beam spreads out indicating diffraction. B1: electron beam behaving as a wave.", total_marks: 2 },
  "9702-43-S23-Q7cii": { question_id: "9702-43-S23-Q7cii", topic: "Quantum Physics", question_text: "Explain with reference to de Broglie wavelength the change in diffraction pattern when accelerating pd is increased.", mark_scheme: "B1: greater pd so greater momentum. B1: greater momentum so smaller de Broglie wavelength. B1: smaller wavelength causes smaller diffraction angle.", total_marks: 3 },
  "9702-41-S24-Q8bi": { question_id: "9702-41-S24-Q8bi", topic: "Quantum Physics", question_text: "State the name of the particles emitted from a metal plate when EM radiation is incident on it.", mark_scheme: "B1: electrons.", total_marks: 1 },
  "9702-41-W23-Q8c": { question_id: "9702-41-W23-Q8c", topic: "Quantum Physics", question_text: "Explain whether blue light exerts more, less or the same pressure on a mirror as red light of the same intensity.", mark_scheme: "B1: blue photons have greater momentum / fewer photons per unit time. B1: greater momentum but fewer photons so pressure is the same.", total_marks: 2 },
  "9702-42-M22-Q8a": { question_id: "9702-42-M22-Q8a", topic: "Quantum Physics", question_text: "State the formula for the de Broglie wavelength and the meaning of each symbol.", mark_scheme: "M1: λ = h/p or λ = h/mv. A1: h is Planck constant, p is momentum.", total_marks: 2 },
  "9702-42-M22-Q8bi": { question_id: "9702-42-M22-Q8bi", topic: "Quantum Physics", question_text: "State the name of the phenomenon shown by electrons directed at a thin crystal.", mark_scheme: "B1: electron diffraction.", total_marks: 1 },
  "9702-42-M22-Q8bii": { question_id: "9702-42-M22-Q8bii", topic: "Quantum Physics", question_text: "State what electron diffraction shows about the nature of electrons.", mark_scheme: "B1: moving electrons behave like waves.", total_marks: 1 },
  "9702-42-M22-Q8biii": { question_id: "9702-42-M22-Q8biii", topic: "Quantum Physics", question_text: "Suggest why a thin crystal causes electron diffraction.", mark_scheme: "B1: spacing between atoms approximately equal to wavelength of electrons.", total_marks: 1 },
  "9702-42-M23-Q7a": { question_id: "9702-42-M23-Q7a", topic: "Quantum Physics", question_text: "Explain why dark lines appear in the spectrum of white light transmitted through cool gas.", mark_scheme: "B1: photon absorbed and electron excited. B1: photon energy equals difference in energy levels. B1: photon energy is single wavelength. B1: electron de-excites emitting photon in any direction.", total_marks: 4 },
  "9702-42-W24-Q9a": { question_id: "9702-42-W24-Q9a", topic: "Quantum Physics", question_text: "Explain what a diffraction pattern from electrons through a crystal shows about the nature of electrons.", mark_scheme: "B1: diffraction is wave behaviour so electrons can behave like waves.", total_marks: 1 },
  "9702-42-W24-Q9c": { question_id: "9702-42-W24-Q9c", topic: "Quantum Physics", question_text: "Describe and explain the effect on the interference pattern when the accelerating pd is increased.", mark_scheme: "B1: greater momentum so smaller de Broglie wavelength. B1: fringes become closer together.", total_marks: 2 },
  "9702-43-W24-Q10a": { question_id: "9702-43-W24-Q10a", topic: "Astrophysics", question_text: "Explain how redshift leads to the idea that the Universe is expanding.", mark_scheme: "B1: redshift is increase in wavelength from Doppler effect. B1: radiation from galaxies is redshifted. B1: galaxies moving apart means Universe expanding.", total_marks: 3 },
  "9702-42-S24-Q8ai": { question_id: "9702-42-S24-Q8ai", topic: "Astrophysics", question_text: "A star is moving away from Earth. Explain how the emission spectrum lines differ from the original.", mark_scheme: "B1: movement causes redshift. B1: observed frequency is lower than emitted frequency.", total_marks: 2 },
  "9702-41-S24-Q8d": { question_id: "9702-41-S24-Q8d", topic: "Medical Imaging", question_text: "Explain why X-rays can be used to produce images of internal body structures that have good contrast.", mark_scheme: "B1: reference to bone and soft tissue. B1: different attenuation coefficients. B1: transmitted intensities very different so good contrast.", total_marks: 3 },
  "9702-41-S10-Q1a": { question_id: "9702-41-S10-Q1a", topic: "Circular Motion", question_text: "Define the radian.", mark_scheme: "B1: angle subtended at the centre of a circle. B1: by an arc equal in length to the radius.", total_marks: 2 },
  "9702-43-W10-Q1a-i": { question_id: "9702-43-W10-Q1a-i", topic: "Circular Motion", question_text: "State what is meant by angular velocity.", mark_scheme: "M1: rate of change of angle / angular displacement per unit time. A1: complete correct definition.", total_marks: 2 },
  "9702-43-W10-Q1a-ii": { question_id: "9702-43-W10-Q1a-ii", topic: "Circular Motion", question_text: "State the relation between angular velocity ω and period T.", mark_scheme: "B1: ω × T = 2π.", total_marks: 1 },
  "9702-41-W14-Q2a-ii": { question_id: "9702-41-W14-Q2a-ii", topic: "Circular Motion", question_text: "State the significance of the force F for the motion of the ball in the bowl.", mark_scheme: "B1: the force F provides the centripetal force.", total_marks: 1 },
  "9702-43-W21-Q1a": { question_id: "9702-43-W21-Q1a", topic: "Circular Motion", question_text: "With reference to velocity and acceleration, describe uniform circular motion.", mark_scheme: "B1: constant speed. B1: acceleration always perpendicular to velocity.", total_marks: 2 },
  "9702-42-W21-Q1a": { question_id: "9702-42-W21-Q1a", topic: "Circular Motion", question_text: "State what is meant by centripetal acceleration.", mark_scheme: "B1: acceleration directed towards the centre of the circle.", total_marks: 1 },
  "9702-42-W21-Q1b-i": { question_id: "9702-42-W21-Q1b-i", topic: "Circular Motion", question_text: "State what happens to the magnitude of the centripetal acceleration of the car as it moves around the loop from X to Y.", mark_scheme: "B1: the magnitude of centripetal acceleration decreases.", total_marks: 1 },
  "9702-42-W21-Q1b-ii": { question_id: "9702-42-W21-Q1b-ii", topic: "Circular Motion", question_text: "Explain why the centripetal acceleration of the car at point Y must be greater than 9.8 m s⁻².", mark_scheme: "B1: 9.8 m/s² caused by weight alone. B1: greater acceleration requires contact force from track.", total_marks: 2 },
  "9702-42-W21-Q1d": { question_id: "9702-42-W21-Q1d", topic: "Circular Motion", question_text: "Suggest whether the conclusion would be different for a car of mass 460 g moving with the same initial speed.", mark_scheme: "B1: acceleration independent of mass so makes no difference.", total_marks: 1 },
  "9702-43-S23-Q2a": { question_id: "9702-43-S23-Q2a", topic: "Circular Motion", question_text: "Explain why the length of the spring when the system is rotating is greater than when stationary.", mark_scheme: "B1: horizontal force causes centripetal acceleration. B1: components combine to give greater tension. B1: greater tension so greater extension.", total_marks: 3 },
  "9702-22-ON17-Q4a": { question_id: "9702-22-ON17-Q4a", topic: "Waves", question_text: "State the conditions required for the formation of a stationary wave.", mark_scheme: "B1: two waves travelling at the same speed in opposite directions overlap. B1: the waves are the same type and have the same frequency or wavelength.", total_marks: 2 },
  "9702-23-S17-Q3a": { question_id: "9702-23-S17-Q3a", topic: "Electric Fields", question_text: "Define electric field strength.", mark_scheme: "B1: force per unit positive charge.", total_marks: 1 },
  "9702-23-W18-Q6a": { question_id: "9702-23-W18-Q6a", topic: "Electric Fields", question_text: "Define the coulomb.", mark_scheme: "B1: the coulomb is an ampere second.", total_marks: 1 },
  "9702-21-W18-Q5a": { question_id: "9702-21-W18-Q5a", topic: "Electric Fields", question_text: "State what is meant by an electric field.", mark_scheme: "B1: a region of space where a force acts on a stationary charge.", total_marks: 1 },
  "9702-23-W21-Q4f-iii": { question_id: "9702-23-W21-Q4f-iii", topic: "Nuclear Physics", question_text: "State the name of another lepton that is produced at the same time as the β⁻ particle.", mark_scheme: "B1: electron antineutrino.", total_marks: 1 },
  "9702-22-ON19-Q2a": { question_id: "9702-22-ON19-Q2a", topic: "Kinematics", question_text: "Define acceleration.", mark_scheme: "B1: change in velocity divided by time taken.", total_marks: 1 },
  "q1": { question_id: "q1", topic: "Gravitational Fields", question_text: "Describe the gravitational field in the region close to the surface of a planet.", mark_scheme: "B1: radial field. B1: directed towards centre of planet.", total_marks: 2 },
  "q2": { question_id: "q2", topic: "Gravitational Fields", question_text: "Explain why the gravitational field strength g can be considered constant close to the surface of a planet.", mark_scheme: "B1: changes in height are much smaller than radius of planet. B1: so (radius + height)² ≈ radius².", total_marks: 2 },
  "q3": { question_id: "q3", topic: "Gravitational Fields", question_text: "State what is meant by gravitational field strength.", mark_scheme: "B1: force per unit mass.", total_marks: 1 },
  "w25_44_Q8a": { question_id: "w25_44_Q8a", topic: "Nuclear Physics", question_text: "State what is meant by a tracer.", mark_scheme: "B1: radioactive substance introduced into the body. B1: absorbed by tissues being studied.", total_marks: 2 },
  "w25_44_Q1a": { question_id: "w25_44_Q1a", topic: "Gravitational Fields", question_text: "State Newton's law of gravitation.", mark_scheme: "B1: proportional to product of masses. B1: inversely proportional to square of separation.", total_marks: 2 },
  "w25_44_Q2ai": { question_id: "w25_44_Q2ai", topic: "Thermal Physics", question_text: "State the meaning of each symbol in pV = NkT.", mark_scheme: "B1: p, V, k. B1: N. B1: T thermodynamic.", total_marks: 3 },
  "w25_44_Q3a": { question_id: "w25_44_Q3a", topic: "Thermal Physics", question_text: "Explain what is meant by the internal energy of an ideal gas.", mark_scheme: "B1: total KE of random motion. B1: PE is zero.", total_marks: 2 },
  "w25_44_Q5a": { question_id: "w25_44_Q5a", topic: "Electric Fields", question_text: "Explain why the electric potential near an isolated proton is positive.", mark_scheme: "B1: defined as zero at infinity. B1: proton repels positive charge. B1: work done moving positive charges together.", total_marks: 3 },
  "w25_44_Q7a": { question_id: "w25_44_Q7a", topic: "Electromagnetic Induction", question_text: "State Lenz's law.", mark_scheme: "M1: direction of induced e.m.f. A1: opposes the change that caused it.", total_marks: 2 },
  "w25_44_Q9a": { question_id: "w25_44_Q9a", topic: "Quantum Physics", question_text: "State what is meant by the photoelectric effect.", mark_scheme: "M1: emission of electrons from metal. A1: when EM radiation is incident.", total_marks: 2 },
  "w25_44_Q10a": { question_id: "w25_44_Q10a", topic: "Astrophysics", question_text: "State what is meant by redshift.", mark_scheme: "B1: recession causes emitted light to shift. B1: increase in wavelength.", total_marks: 2 },
  "9702-41-ALA26-Q1a": { question_id: "9702-41-ALA26-Q1a", topic: "Gravitational Fields", question_text: "State Newton's law of gravitation.", mark_scheme: "B1: proportional to product of masses and inversely proportional to square of separation. B1: point masses.", total_marks: 2 },
  "9702-41-ALA26-Q3a": { question_id: "9702-41-ALA26-Q3a", topic: "Thermal Physics", question_text: "State what is meant by specific latent heat.", mark_scheme: "B1: energy per unit mass to change state. B1: at constant temperature.", total_marks: 2 },
  "9702-41-ALA26-Q8ai": { question_id: "9702-41-ALA26-Q8ai", topic: "Astrophysics", question_text: "Explain how the emission spectrum lines differ when seen from Earth.", mark_scheme: "B1: movement causes redshift. B1: observed frequency lower.", total_marks: 2 },
  "9702-41-ALA26-Q9a": { question_id: "9702-41-ALA26-Q9a", topic: "Nuclear Physics", question_text: "Write the nuclear equation for alpha decay of polonium-211.", mark_scheme: "B1: Pb-207, proton 82. B1: alpha 4/2.", total_marks: 2 },
};

function detectSituationFromFeedback(feedback, isQ3, maxMarks) {
  const marksEarned = feedback.marks_earned ?? 0;
  const fullMarks = marksEarned >= maxMarks;
  if (!fullMarks) return null;
  const previousScore = parseInt(sessionStorage.getItem("previous_score") ?? "-1", 10);
  if (previousScore === 0) return "comeback";
  if (isQ3) {
    const predictionFeedback = (feedback.prediction_feedback ?? "").toLowerCase();
    const positiveWords = ["accurate", "correct", "right", "spot on", "exactly", "identified", "knew", "well done", "impressive", "strong"];
    if (positiveWords.some(w => predictionFeedback.includes(w))) return "prediction";
  }
  const consecutiveFull = parseInt(sessionStorage.getItem("consecutive_full_marks") ?? "0", 10);
  if (consecutiveFull >= 3) return "mastery";
  return null;
}

export default function Feedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    feedback, answer, isQ2, isQ3, student_prediction, isReview,
    topicKey, questionId, nextFullRoute, nextRetryRoute, backRoute, paperRef
  } = state || {};

  const resolvedTopicKey = topicKey ?? "gravitational_fields";
  const resolvedBack = backRoute ?? "/physics";
  const metaEntry = questionId ? QUESTION_META[questionId] : null;
  const maxMarks = metaEntry ? metaEntry.total_marks : (isQ3 ? 1 : 2);
  const marksEarned = feedback?.marks_earned ?? 0;
  const fullMarks = marksEarned >= maxMarks;
  const subject = detectSubject(resolvedTopicKey);
  const questionText = metaEntry?.question_text ?? "";

  const recorded = useRef(false);
  useEffect(() => {
    if (!feedback) { navigate("/"); return; }
    if (!recorded.current) {
      recorded.current = true;
      if (!isReview) {
        recordAttempt(resolvedTopicKey, marksEarned, { total_marks: maxMarks, question_id: questionId });

        if (!fullMarks) {
          // Pass the raw answer as the 6th argument so every DNA entry gets student_response
          writeMistakeDna(feedback, questionId, metaEntry?.topic ?? resolvedTopicKey, marksEarned, maxMarks, answer ?? "").catch(() => {});

          if (questionId && QUESTION_META[questionId]) {
            addToReviewBank({
              ...QUESTION_META[questionId],
              first_attempt_score: marksEarned,
              first_attempt_feedback: feedback.cambridge_insight ?? "",
              first_attempt_answer: answer ?? "",
            });
          }
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!feedback) return null;

  function handleNext() {
    if (isReview) { navigate("/review"); return; }
    sessionStorage.setItem("previous_score", String(marksEarned));
    if (fullMarks) {
      const fmc = parseInt(sessionStorage.getItem("full_marks_count") ?? "0", 10) + 1;
      const cfm = parseInt(sessionStorage.getItem("consecutive_full_marks") ?? "0", 10) + 1;
      sessionStorage.setItem("full_marks_count", String(fmc));
      sessionStorage.setItem("consecutive_full_marks", String(cfm));
      const situation = detectSituationFromFeedback(feedback, isQ3, maxMarks);
      const nextDest = nextFullRoute ?? (isQ3 ? "/physics" : fmc === 1 ? "/similar-question" : "/familiarity-check");
      const topicDisplayName = metaEntry?.topic ?? resolvedTopicKey.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      if (situation) {
        navigate("/reflection", { state: { situation, nextDest, feedbackState: state, topicName: topicDisplayName } });
      } else {
        navigate(nextDest);
      }
    } else {
      sessionStorage.setItem("consecutive_full_marks", "0");
      const retryDest = nextRetryRoute ?? (isQ3 ? resolvedBack : isQ2 ? "/similar-question" : "/physics");
      navigate(retryDest);
    }
  }

  const buttonLabel = isReview
    ? (fullMarks ? "Next review question →" : "Try again")
    : (fullMarks ? "Next question →" : "Try Again");

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button onClick={() => navigate(resolvedBack === "/" ? "/physics" : resolvedBack)}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-bold tracking-wide text-foreground">
            {subject === "cs" ? "CAIE Computer Science" : "CAIE Physics"}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
            {paperRef ?? "9702/44"}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 p-4 pb-8">
          <PulseFeedback
            feedback={feedback}
            subject={subject}
            marksTotal={maxMarks}
            questionId={questionId}
            questionText={questionText}
            studentAnswer={answer ?? ""}
          />

          {isQ3 && student_prediction && feedback.prediction_feedback && (
            <div className="bg-card border border-l-4 border-border border-l-green-500/60 rounded-xl p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your Prediction</p>
              <p className="text-sm text-foreground/50 italic leading-relaxed">"{student_prediction}"</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{feedback.prediction_feedback}</p>
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full bg-secondary text-secondary-foreground font-semibold text-sm py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {buttonLabel}
          </button>

          <div className="flex items-center justify-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400/70" />
            <span className="font-mono text-[11px] text-muted-foreground/50">Answer contributes to your streak</span>
          </div>
        </div>
      </div>
    </div>
  );
}