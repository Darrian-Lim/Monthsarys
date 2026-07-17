// ==========================================
// 1. DOM Elements & Setup
// ==========================================
const leftStem = document.getElementById("stemLeft");
const rightStem = document.getElementById("stemRight");
const modal = document.getElementById("letterModal");
const revealBtn = document.getElementById("revealBtn");
const closeBtn = document.getElementById("closeBtn");
const envelopeGroup = document.getElementById("envelopeGroup");

const lenLeft = leftStem.getTotalLength();
const lenRight = rightStem.getTotalLength();

// Initial hidden states via GSAP
gsap.set("#stemLeft", { strokeDasharray: lenLeft, strokeDashoffset: lenLeft });
gsap.set("#stemRight", { strokeDasharray: lenRight, strokeDashoffset: lenRight });
gsap.set([".leaf", ".rose-group"], { scale: 0, opacity: 0, transformOrigin: "50% 50%" });

// ==========================================
// 2. Background Sparkles Generator
// ==========================================
const sparkleContainer = document.getElementById("sparkles");
const sparkleColors = ["#ff4d6d", "#ff758f", "#fff0f3", "#ffd166"];

for (let i = 0; i < 35; i++) {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", gsap.utils.random(60, 540));
  circle.setAttribute("cy", gsap.utils.random(80, 500));
  circle.setAttribute("r", gsap.utils.random(1.5, 3.5));
  circle.setAttribute("fill", gsap.utils.random(sparkleColors));
  circle.setAttribute("opacity", "0");
  sparkleContainer.appendChild(circle);
}

// ==========================================
// 3. Animation Configuration Maps
// ==========================================
const popInConfig = { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.5)" };
const roseConfig = { scale: 1, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.75)" };

// ==========================================
// 4. Master Timeline
// ==========================================
const mainTimeline = gsap.timeline();

// Stems grow together
mainTimeline
  .to(["#stemLeft", "#stemRight"], { strokeDashoffset: 0, duration: 3.2, ease: "power1.inOut" }, 0);

// Symmetrical growth sequencing (Pairs pop up simultaneously)
const growthSteps = [
  { targets: ["#leafL1", "#leafR1"], config: popInConfig, time: 0.5 },
  { targets: ["#roseL1", "#roseR1"], config: roseConfig,  time: 0.7 },
  { targets: ["#leafL2", "#leafR2"], config: popInConfig, time: 1.2 },
  { targets: ["#leafL3", "#leafR3"], config: popInConfig, time: 1.8 },
  { targets: ["#roseL2", "#roseR2"], config: roseConfig,  time: 2.0 },
  { targets: ["#leafL4", "#leafR4"], config: popInConfig, time: 2.6 }
];

growthSteps.forEach(step => {
  mainTimeline.to(step.targets, step.config, step.time);
});

// Top Intersection Flower & UI Elements
mainTimeline
  .to("#roseTop", roseConfig, 3.1)
  
  // Sparkle Layer entry
  .to("#sparkles circle", {
    opacity: () => gsap.utils.random(0.3, 0.8),
    y: -20,
    duration: 2,
    stagger: 0.03,
    ease: "power1.out"
  }, "-=1.0")

  // Center text intro
  .to("#mainTitle", { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" }, "-=0.6")
  .to("#revealBtn", { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.3");

// Ambient continuous particle movement starts when timeline finishes
mainTimeline.eventCallback("onComplete", () => {
  gsap.to("#sparkles circle", {
    y: "-=15",
    opacity: () => gsap.utils.random(0.2, 0.7),
    duration: () => gsap.utils.random(2.5, 4.5),
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    stagger: { amount: 1.5, from: "random" }
  });
});

// ==========================================
// 5. Gift Interaction & Envelope Management
// ==========================================
function openGiftSequence() {
  // Gracefully transition text out
  gsap.to(["#mainTitle", "#revealBtn"], {
    opacity: 0,
    y: -20,
    scale: 0.8,
    duration: 0.5,
    ease: "power2.in"
  });

  // Activate and bring in the custom envelope
  gsap.set("#envelopeGroup", { pointerEvents: "auto", scale: 0.5, opacity: 0 });
  gsap.to("#envelopeGroup", { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    duration: 0.8, 
    ease: "back.out(1.3)", 
    delay: 0.3 
  });
}

revealBtn.addEventListener("click", openGiftSequence);

// Clean envelope-to-letter swap execution on click
envelopeGroup.addEventListener("click", () => {
  const replacementTimeline = gsap.timeline();

  replacementTimeline
    .to("#envelopeGroup", {
      scale: 0.6,
      opacity: 0,
      duration: 0.4,
      ease: "back.in(1.2)",
      onComplete: () => {
        gsap.set("#envelopeGroup", { pointerEvents: "none" });
        openModal();
      }
    });
});

// ==========================================
// 6. Letter Card Overlay Interactivity
// ==========================================
function openModal() {
  modal.classList.add("active");
  
  gsap.fromTo("#letterCard",
    { opacity: 0, scale: 0.6 },
    { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.2)" }
  );
  
  gsap.fromTo("#letterContent p, #letterContent .salutation, #letterContent .closing",
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.15, delay: 0.2 }
  );
  
  gsap.fromTo("#closeBtn",
    { opacity: 0 },
    { opacity: 1, duration: 0.4, ease: "power1.out", delay: 0.8 }
  );
}

function closeModal() {
  gsap.to("#letterCard", {
    opacity: 0, 
    scale: 0.7,
    duration: 0.3, 
    ease: "power2.in",
    onComplete: () => {
      modal.classList.remove("active");
      
      // Reset layout back smoothly to the starting states
      gsap.to(["#mainTitle", "#revealBtn"], { opacity: 1, scale: 1, y: 0, duration: 0.5 });
      gsap.set("#envelopeGroup", { scale: 0.5, opacity: 0, y: 0, pointerEvents: "none" });
    }
  });
}

closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});