import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  winner: 'X' | 'O' | null;
}

interface Particle {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  velocity: {
    x: number;
    y: number;
  }
}

const Confetti: React.FC<ConfettiProps> = ({ winner }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!winner) return;

    const particleCount = 50; // Augmenté le nombre de particules
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight - window.innerHeight, // Commencer au-dessus de l'écran
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        velocity: {
          x: (Math.random() - 0.5) * 3,
          y: Math.random() * 2 + 1, // Vitesse verticale légèrement réduite
        },
      });
    }

    setParticles(newParticles);

    const animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [winner]);

  const animate = () => {
    setParticles(prevParticles =>
      prevParticles.map(particle => ({
        ...particle,
        x: particle.x + particle.velocity.x,
        y: particle.y + particle.velocity.y,
        rotation: particle.rotation + 2,
      })).filter(particle => particle.y < window.innerHeight)
    );

    requestAnimationFrame(animate);
  };

  if (!winner) return null;

  return (
    <div className="fixed inset-0 pointer-events-none">
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute text-2xl font-bold text-yellow-400 font-fredoka" // Ajouté la classe font-fredoka
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale * 2})`, // Doublé l'échelle
          }}
        >
          {winner}
        </div>
      ))}
    </div>
  );
};

export default Confetti;
