/**
 * TutorDrawer — slide-in side drawer to switch between AI tutors.
 */
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { TUTORS } from "@/lib/tutorConfig";
import { AnimatePresence, motion } from "framer-motion";

export default function TutorDrawer({ open, onClose, activeId }) {
  const navigate = useNavigate();

  function switchTo(id) {
    onClose();
    if (id !== activeId) navigate(`/ai-tutors/${id}`);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-[280px] z-50 bg-[#0d0d1a] border-l border-white/8 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
              <div>
                <p className="font-bold text-white text-sm">My Tutors</p>
                <p className="text-[10px] text-white/40 mt-0.5">Switch tutor or start a new chat</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/8 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tutor list */}
            <div className="flex-1 overflow-y-auto py-3 space-y-1 px-3">
              {TUTORS.map((tutor) => {
                const { Icon } = tutor;
                const isActive = tutor.id === activeId;
                return (
                  <button
                    key={tutor.id}
                    onClick={() => switchTo(tutor.id)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-white/8 border border-white/10"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${tutor.iconBg}`}>
                      <Icon className={`w-4 h-4 ${tutor.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-white/70"}`}>
                        {tutor.name}
                      </p>
                      <p className={`text-[10px] truncate ${isActive ? tutor.iconColor : "text-white/30"}`}>
                        {tutor.subtitle}
                      </p>
                    </div>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-4 border-t border-white/6">
              <p className="text-[10px] text-white/25 leading-relaxed">
                Each tutor starts a fresh conversation when you switch.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}