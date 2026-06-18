"use client";

import { useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CardData {
  id: number;
  title: string;
  description: string;
  color: string;
  image: string;
}

const cards: CardData[] = [
  {
    id: 1,
    title: "Project Alpha",
    description: "Revolutionary AI-powered analytics platform",
    color: "#FF6B6B",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Project Beta",
    description: "Next-gen cloud infrastructure solution",
    color: "#4ECDC4",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Project Gamma",
    description: "Decentralized finance protocol",
    color: "#45B7D1",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    title: "Project Delta",
    description: "Quantum computing interface",
    color: "#96CEB4",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    title: "Project Epsilon",
    description: "Neural network visualization tool",
    color: "#FFEAA7",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    title: "Project Zeta",
    description: "Biometric security system",
    color: "#DDA0DD",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop",
  },
];

export function GravityCardStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const bodiesRef = useRef<Matter.Body[]>([]);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const initPhysics = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();

    const Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Runner = Matter.Runner;

    const engine = Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    });

    const render = Render.create({
      element: containerRef.current,
      engine: engine,
      canvas: canvasRef.current,
      options: {
        width,
        height,
        background: "transparent",
        wireframes: false,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
      },
    });

    engineRef.current = engine;
    renderRef.current = render;

    // Create boundaries
    const ground = Bodies.rectangle(width / 2, height + 50, width, 100, {
      isStatic: true,
      render: { visible: false },
      friction: 0.5,
      restitution: 0.3,
    });

    const leftWall = Bodies.rectangle(-50, height / 2, 100, height * 2, {
      isStatic: true,
      render: { visible: false },
    });

    const rightWall = Bodies.rectangle(width + 50, height / 2, 100, height * 2, {
      isStatic: true,
      render: { visible: false },
    });

    World.add(engine.world, [ground, leftWall, rightWall]);

    // Create card bodies
    const cardWidth = 280;
    const cardHeight = 200;

    cards.forEach((card, index) => {
      const x = width / 2 + (Math.random() - 0.5) * 200;
      const y = -300 - index * 250;

      const body = Bodies.rectangle(x, y, cardWidth, cardHeight, {
        restitution: 0.6,
        friction: 0.3,
        frictionAir: 0.01,
        chamfer: { radius: 12 },
        render: {
          fillStyle: card.color,
          strokeStyle: "rgba(255,255,255,0.1)",
          lineWidth: 2,
        },
        label: `card-${card.id}`,
      });

      bodiesRef.current.push(body);
      World.add(engine.world, body);
    });

    // Runner
    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    // Sync DOM elements with physics bodies
    let animationFrameId: number;
    const updateDOM = () => {
      if (!containerRef.current) return;

      bodiesRef.current.forEach((body, index) => {
        const cardEl = containerRef.current?.querySelector(
          `[data-card-id="${cards[index].id}"]`
        ) as HTMLElement;

        if (cardEl && body) {
          const x = body.position.x;
          const y = body.position.y;
          const angle = (body.angle * 180) / Math.PI;

          cardEl.style.transform = `translate(${x - cardWidth / 2}px, ${y - cardHeight / 2}px) rotate(${angle}deg)`;
          cardEl.style.opacity = "1";
        }
      });

      animationFrameId = requestAnimationFrame(updateDOM);
    };

    animationFrameId = requestAnimationFrame(updateDOM);

    // ScrollTrigger to drop cards
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top center",
      end: "bottom center",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        bodiesRef.current.forEach((body, index) => {
          if (progress > index * 0.15 && body.position.y < -100) {
            Matter.Body.setPosition(body, {
              x: body.position.x,
              y: body.position.y + 5,
            });
          }
        });
      },
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      Runner.stop(runner);
      Render.stop(render);
      World.clear(engine.world, false);
      Engine.clear(engine);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, []);

  useEffect(() => {
    const cleanup = initPhysics();
    return cleanup;
  }, [initPhysics]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[200vh] overflow-hidden"
    >
      <div className="sticky top-0 h-screen w-full">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* DOM Cards overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {cards.map((card) => (
            <div
              key={card.id}
              data-card-id={card.id}
              className="absolute w-[280px] h-[200px] rounded-xl overflow-hidden shadow-2xl opacity-0 transition-opacity duration-300"
              style={{
                willChange: "transform",
                background: `linear-gradient(135deg, ${card.color}20, ${card.color}40)`,
                border: `1px solid ${card.color}40`,
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="relative h-full w-full p-5 flex flex-col justify-between">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-white/70">{card.description}</p>
                </div>
                <div className="relative z-10 flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: card.color }}
                  />
                  <span className="text-xs text-white/50">View Project</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center z-20">
          <p className="text-white/40 text-sm uppercase tracking-widest animate-bounce">
            Scroll to drop cards
          </p>
        </div>
      </div>
    </div>
  );
}
