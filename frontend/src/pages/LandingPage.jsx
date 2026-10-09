import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Play,
  ArrowRight,
  ArrowUpRight,
  Database,
  BrainCircuit,
  Activity,
  Layers,
  Network,
  CheckCircle2,
  Cpu,
  Zap,
  Sliders,
  X,
  ChevronRight,
  SlidersHorizontal,
  TrendingUp,
  BarChart3,
  TableProperties,
  Terminal,
  FileSpreadsheet,
  Radar,
  Eye,
  Sparkles,
  GitBranch,
  ShieldCheck,
  Binary,
  Radio,
  Fingerprint,
  Compass,
  Boxes
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';

// ============================================================================
// 1. HIGH-PERFORMANCE 3D PROJECTED DATA UNIVERSE (ROTATING 3D POLYTOPE & CORE)
// ============================================================================
const Hero3DDataUniverse = ({ mouseOffset }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D Sphere Vertices (Mathematical Geodesic Tensor Polytope)
    const vertexCount = 56;
    const vertices = [];
    for (let i = 0; i < vertexCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / vertexCount);
      const theta = Math.sqrt(vertexCount * Math.PI) * phi;
      const radius = 175;
      vertices.push({
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        size: Math.random() * 2 + 1.2,
        color: i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#818cf8' : '#c084fc'
      });
    }

    // Micro Cosmic Background Particles
    const bgParticles = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.15
    }));

    // Traveling Energy Streams
    const streams = [
      { angle: 0.2, speed: 0.0035, progress: 0.1, color: '#38bdf8' },
      { angle: 1.1, speed: 0.004, progress: 0.45, color: '#818cf8' },
      { angle: 2.3, speed: 0.003, progress: 0.8, color: '#22d3ee' },
      { angle: 3.5, speed: 0.0045, progress: 0.25, color: '#c084fc' },
      { angle: 4.6, speed: 0.0032, progress: 0.65, color: '#38bdf8' },
      { angle: 5.4, speed: 0.0038, progress: 0.9, color: '#818cf8' }
    ];

    let rotX = 0;
    let rotY = 0;
    let t = 0;

    const render = () => {
      t += 0.012;
      rotX += 0.0025 + mouseOffset.y * 0.004;
      rotY += 0.004 + mouseOffset.x * 0.006;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Cybernetic Hex-Grid Radar Rings
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Background ambient particles
      bgParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${p.opacity})`;
        ctx.fill();
      });

      // 2. Continuous Radial Streams Ingestion into 3D Core
      streams.forEach((stream) => {
        stream.progress += stream.speed;
        if (stream.progress > 1) stream.progress = 0;

        const maxR = Math.min(width, height) * 0.44;
        const currentR = maxR * (1 - stream.progress);
        const theta = stream.angle + Math.sin(t + stream.angle) * 0.2;
        const px = centerX + Math.cos(theta) * currentR;
        const py = centerY + Math.sin(theta) * currentR;

        // Curved Laser Filament
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(theta) * maxR, centerY + Math.sin(theta) * maxR);
        ctx.quadraticCurveTo(
          centerX + Math.cos(theta + 0.3) * (maxR * 0.5),
          centerY + Math.sin(theta + 0.3) * (maxR * 0.5),
          centerX,
          centerY
        );
        ctx.strokeStyle = `${stream.color}20`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Traveling glowing quantum packet
        const alpha = Math.sin(stream.progress * Math.PI);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = stream.color;
        ctx.shadowColor = stream.color;
        ctx.shadowBlur = 10 * alpha;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. 3D Rotating Tensor Polytope (Wireframe Sphere Projected to 2D)
      const fov = 380;
      const projected = vertices.map((v) => {
        // Rotate around Y
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = v.x * cosY - v.z * sinY;
        const z1 = v.z * cosY + v.x * sinY;

        // Rotate around X
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = v.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + v.y * sinX;

        // 3D Perspective Projection
        const scale = fov / (fov + z2);
        return {
          px: centerX + x1 * scale,
          py: centerY + y2 * scale,
          pz: z2,
          scale,
          color: v.color,
          size: v.size * scale
        };
      });

      // Sort by depth (painter's algorithm)
      projected.sort((a, b) => b.pz - a.pz);

      // Connect proximate 3D vertices with glowing filaments
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 60) {
            const alpha = (1 - dist / 60) * 0.18 * ((p1.pz + 180) / 360);
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0.02, alpha)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw vertices
      projected.forEach((p) => {
        const alpha = Math.max(0.2, (p.pz + 180) / 360);
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.pz > 0 ? 8 : 2;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mouseOffset]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

// ============================================================================
// 2. CHAOS TO CLARITY MANIFOLD CANVAS (MORPHING 4D ENTROPY ENGINE)
// ============================================================================
const ChaosToClarityCanvas = ({ stage, entropyValue }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const POINT_COUNT = 380;
    const points = Array.from({ length: POINT_COUNT }, (_, i) => {
      const chartX = 0.12 + (i / POINT_COUNT) * 0.76;
      // Multi-modal polynomial with Gaussian dispersion
      const chartY = 0.5 - 0.26 * Math.sin(chartX * Math.PI * 1.6) + (Math.random() - 0.5) * 0.07;

      return {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2.2,
        vy: (Math.random() - 0.5) * 2.2,
        clusterX: (i % 3 === 0 ? 0.28 : i % 3 === 1 ? 0.5 : 0.72) + (Math.random() - 0.5) * 0.12,
        clusterY: (i % 3 === 0 ? 0.38 : i % 3 === 1 ? 0.62 : 0.36) + (Math.random() - 0.5) * 0.12,
        finalX: chartX,
        finalY: chartY,
        color: i % 4 === 0 ? '#22d3ee' : i % 4 === 1 ? '#818cf8' : i % 4 === 2 ? '#c084fc' : '#38bdf8'
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const clarityFactor = 1 - entropyValue / 100;

      // Draw Mathematical Coordinate Geometry
      if (clarityFactor > 0.3) {
        const axisAlpha = (clarityFactor - 0.3) / 0.7;
        ctx.strokeStyle = `rgba(148, 163, 184, ${axisAlpha * 0.3})`;
        ctx.lineWidth = 1;

        // X and Y Principal Axes
        ctx.beginPath();
        ctx.moveTo(width * 0.08, height * 0.86);
        ctx.lineTo(width * 0.92, height * 0.86);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(width * 0.08, height * 0.86);
        ctx.lineTo(width * 0.08, height * 0.14);
        ctx.stroke();

        // High-Precision Grid Ticks & Labels
        ctx.fillStyle = `rgba(148, 163, 184, ${axisAlpha * 0.6})`;
        ctx.font = '9px monospace';
        for (let k = 0.2; k <= 0.85; k += 0.15) {
          const tx = width * k;
          ctx.beginPath();
          ctx.moveTo(tx, height * 0.86);
          ctx.lineTo(tx, height * 0.86 - 6);
          ctx.stroke();
          ctx.fillText(`+${Math.round(k * 100)}σ`, tx - 10, height * 0.86 + 14);
        }
      }

      points.forEach((p, idx) => {
        let targetX, targetY;

        if (clarityFactor < 0.28) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 15 || p.x > width - 15) p.vx *= -1;
          if (p.y < 15 || p.y > height - 15) p.vy *= -1;
          targetX = p.x;
          targetY = p.y;
        } else if (clarityFactor < 0.68) {
          const sub = (clarityFactor - 0.28) / 0.4;
          targetX = width * p.clusterX;
          targetY = height * p.clusterY;
          p.x += (targetX - p.x) * (0.06 * sub);
          p.y += (targetY - p.y) * (0.06 * sub);
        } else {
          const sub = (clarityFactor - 0.68) / 0.32;
          targetX = width * p.finalX;
          targetY = height * p.finalY;
          p.x += (targetX - p.x) * (0.09 * sub);
          p.y += (targetY - p.y) * (0.09 * sub);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, clarityFactor > 0.7 ? 2.5 : 1.8, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = clarityFactor > 0.6 ? 8 : 1;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Triangulated Synapses between nearest points
        if (clarityFactor > 0.25 && clarityFactor < 0.96) {
          for (let j = idx + 1; j < Math.min(idx + 14, points.length); j++) {
            const p2 = points[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 60) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist / 60) * 0.28 * clarityFactor})`;
              ctx.lineWidth = 0.9;
              ctx.stroke();
            }
          }
        }
      });

      // Draw Fitted Non-Linear Regression Curve with Confidence Bands
      if (clarityFactor > 0.72) {
        const lineAlpha = (clarityFactor - 0.72) / 0.28;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(34, 211, 238, ${lineAlpha * 0.95})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(34, 211, 238, 0.95)';
        ctx.shadowBlur = 14;

        for (let px = width * 0.12; px <= width * 0.88; px += 6) {
          const normX = (px - width * 0.12) / (width * 0.76);
          const py = height * (0.5 - 0.26 * Math.sin((0.12 + normX * 0.76) * Math.PI * 1.6));
          if (px === width * 0.12) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Upper & Lower 95% Confidence Bounds
        ctx.beginPath();
        ctx.strokeStyle = `rgba(129, 140, 248, ${lineAlpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        for (let px = width * 0.12; px <= width * 0.88; px += 6) {
          const normX = (px - width * 0.12) / (width * 0.76);
          const py = height * (0.5 - 0.26 * Math.sin((0.12 + normX * 0.76) * Math.PI * 1.6)) - 24;
          if (px === width * 0.12) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.beginPath();
        for (let px = width * 0.12; px <= width * 0.88; px += 6) {
          const normX = (px - width * 0.12) / (width * 0.76);
          const py = height * (0.5 - 0.26 * Math.sin((0.12 + normX * 0.76) * Math.PI * 1.6)) + 24;
          if (px === width * 0.12) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [stage, entropyValue]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

// ============================================================================
// 3. DATA DNA BIOLOGICAL-QUANTUM HELIX CANVAS
// ============================================================================
const DataDnaHelixCanvas = ({ activeNode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    let t = 0;
    const render = () => {
      t += 0.022;
      ctx.clearRect(0, 0, width, height);

      const rungs = 24;
      const centerY = height / 2;
      const amplitude = Math.min(65, height * 0.32);

      for (let i = 0; i < rungs; i++) {
        const x = (width * 0.12) + (i / rungs) * (width * 0.76);
        const phase = t + (i * 0.28);
        const y1 = centerY + Math.sin(phase) * amplitude;
        const y2 = centerY - Math.sin(phase) * amplitude;
        const depth = Math.cos(phase);

        // Connecting hydrogen bond rung
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 + Math.abs(depth) * 0.25})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Strand 1 Nucleotide
        ctx.beginPath();
        ctx.arc(x, y1, 3.5 + depth * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = depth > 0 ? '#22d3ee' : '#0891b2';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = depth > 0 ? 8 : 2;
        ctx.fill();

        // Strand 2 Nucleotide
        ctx.beginPath();
        ctx.arc(x, y2, 3.5 - depth * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = depth < 0 ? '#c084fc' : '#7c3aed';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = depth < 0 ? 8 : 2;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeNode]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

// ============================================================================
// MAIN DATALENS AI LANDING EXPERIENCE
// ============================================================================
const LandingPage = () => {
  const navigate = useNavigate();
  const { loadSample, samplesList, loading } = useDataset();

  // Scroll states
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('hero');

  // Mouse tilt for Hero Universe
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Floating Objects Orbit Hover State
  const [hoveredNode, setHoveredNode] = useState(null);

  // Chaos to Clarity interactive state
  const [chaosStage, setChaosStage] = useState(0);
  const [entropyValue, setEntropyValue] = useState(100);

  // Data DNA interactive node state
  const [activeDnaNode, setActiveDnaNode] = useState('relationships');

  // 3D Intelligence Layers state
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);

  // Conversational Terminal (Ask Your Data) state
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);

  // Machine Learning Pipeline state
  const [activeModel, setActiveModel] = useState('xgb');

  // Watch The Experience Modal
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);

  // Scroll spy & floating navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);

      const sections = ['hero', 'chaos-to-clarity', 'data-dna', 'intelligence-layers', 'ask-data', 'ml-learn', 'launchpad'];
      const scrollPos = window.scrollY + 250;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveNav(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse parallax
  const handleMouseMove = useCallback((e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    setMouseOffset({ x, y });
  }, []);

  const handleSelectChaosStage = (newStage) => {
    setChaosStage(newStage);
    if (newStage === 0) setEntropyValue(100);
    else if (newStage === 1) setEntropyValue(66);
    else if (newStage === 2) setEntropyValue(33);
    else if (newStage === 3) setEntropyValue(0);
  };

  // 9 Floating Objects Orbit Definitions
  const orbitNodes = useMemo(
    () => [
      {
        id: 'CSV',
        label: 'CSV',
        code: 'INGEST.01',
        type: 'INPUT',
        angle: 200,
        icon: FileSpreadsheet,
        color: 'from-cyan-400 to-blue-500',
        detail: 'Continuous stream ingest with automatic delimiter, encoding, and missing-token inference.'
      },
      {
        id: 'EXCEL',
        label: 'EXCEL',
        code: 'INGEST.02',
        type: 'INPUT',
        angle: 155,
        icon: TableProperties,
        color: 'from-emerald-400 to-teal-500',
        detail: 'Multi-sheet workbook parser supporting formula resolution and header normalization.'
      },
      {
        id: 'ROWS',
        label: 'ROWS',
        code: 'TENSOR.DIM',
        type: 'STRUCTURE',
        angle: 245,
        icon: Binary,
        color: 'from-blue-400 to-indigo-500',
        detail: '1.2M+ observational vectors streamed with sub-millisecond tensor batch memory indexing.'
      },
      {
        id: 'COLUMNS',
        label: 'COLUMNS',
        code: 'FEATURE.SPACE',
        type: 'STRUCTURE',
        angle: 115,
        icon: Database,
        color: 'from-indigo-400 to-purple-500',
        detail: 'High-dimensional feature space with automatic type casting: continuous, categorical, and temporal.'
      },
      {
        id: 'PATTERNS',
        label: 'PATTERNS',
        code: 'COGNITION.01',
        type: 'COGNITION',
        angle: 70,
        icon: Sparkles,
        color: 'from-purple-400 to-pink-500',
        hasPreview: 'patterns',
        detail: 'Automated clustering, latent manifold projection, and non-linear relationship detection.'
      },
      {
        id: 'CORRELATION',
        label: 'CORRELATION',
        code: 'COVARIANCE',
        type: 'COGNITION',
        angle: 290,
        icon: GitBranch,
        color: 'from-pink-400 to-rose-500',
        detail: 'Multi-variate Pearson & Spearman rank coefficients calculated across all feature pairs.'
      },
      {
        id: 'INSIGHTS',
        label: 'INSIGHTS',
        code: 'SYNTHESIS',
        type: 'OUTPUT',
        angle: 25,
        icon: Eye,
        color: 'from-amber-400 to-orange-500',
        hasPreview: 'insights',
        detail: 'Empirical narrative synthesis isolating statistically significant variance drivers.'
      },
      {
        id: 'ML',
        label: 'ML',
        code: 'TOURNAMENT',
        type: 'OUTPUT',
        angle: 335,
        icon: BrainCircuit,
        color: 'from-cyan-400 to-indigo-500',
        hasPreview: 'ml',
        detail: 'Automated candidate model selection, 5-fold cross-validation, and loss optimization.'
      },
      {
        id: 'PREDICTION',
        label: 'PREDICTION',
        code: 'FORECAST.CONE',
        type: 'OUTPUT',
        angle: 350,
        icon: TrendingUp,
        color: 'from-teal-400 to-cyan-500',
        hasPreview: 'prediction',
        detail: 'Deterministic multi-horizon forecasts with Monte Carlo confidence intervals.'
      }
    ],
    []
  );

  // Fallback default sample datasets
  const defaultSamples = useMemo(
    () => [
      {
        id: 'customers_churn',
        name: 'Customer Churn & Retention',
        type: 'csv',
        category: 'Classification / Business',
        rows: '7,043 Vectors',
        cols: '21 Dimensions',
        target: 'Churn',
        desc: 'Telecom subscriber profiles, contract tenure, payment methods, and churn risk outcomes.'
      },
      {
        id: 'house_prices',
        name: 'Real Estate House Valuation',
        type: 'csv',
        category: 'Regression / Pricing Model',
        rows: '20,640 Vectors',
        cols: '9 Dimensions',
        target: 'Price',
        desc: 'Property spatial coordinates, room volumes, location type, age, and market valuation prices.'
      },
      {
        id: 'employee_performance',
        name: 'Employee Performance & Compensation',
        type: 'xlsx',
        category: 'HR Analytics / Ops',
        rows: '1,470 Vectors',
        cols: '35 Dimensions',
        target: 'Performance_Rating',
        desc: 'Workforce department metrics, experience years, satisfaction scores, and salary bands.'
      },
      {
        id: 'retail_sales_timeseries',
        name: 'Omnichannel Retail Sales & Demand',
        type: 'csv',
        category: 'Time-Series / Demand',
        rows: '180 Observations',
        cols: '8 Dimensions',
        target: 'Daily_Sales',
        desc: '180 days of daily store transactions, sales volume, foot traffic, and promotional discount markers.'
      }
    ],
    []
  );

  const displaySamples = useMemo(() => {
    if (samplesList && samplesList.length > 0) {
      return samplesList.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type || 'csv',
        category: s.category || 'Data Science',
        target: s.suggested_target || s.target || 'Target',
        desc: s.description || s.desc || 'Curated benchmark dataset for autonomous analysis.'
      }));
    }
    return defaultSamples;
  }, [samplesList, defaultSamples]);

  const handleLaunchSample = async (sampleId) => {
    try {
      await loadSample(sampleId);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to launch sample:', err);
      navigate('/dashboard');
    }
  };

  const queries = [
    {
      query: '> Which factors influence student performance?',
      context: 'Cohort: 1,000 students // Target: Final_Exam_Score',
      analysis: [
        { feature: 'Attendance Rate', coefficient: '+0.482', p: '< 0.001', pct: 88, status: 'DOMINANT DRIVER' },
        { feature: 'Weekly Study Hours', coefficient: '+0.391', p: '< 0.001', pct: 74, status: 'STRONG COVARIANCE' },
        { feature: 'Assignment Submissions', coefficient: '+0.274', p: '< 0.01', pct: 58, status: 'MODERATE' },
        { feature: 'Sleep Regularity Index', coefficient: '+0.118', p: '< 0.05', pct: 32, status: 'WEAK' }
      ],
      insight: 'Students with >85% attendance combined with >15 weekly study hours show a 94.6% probability of achieving Grade A/B.'
    },
    {
      query: '> What are the primary indicators of customer churn?',
      context: 'Subscribers: 7,043 accounts // Target: Churn_Probability',
      analysis: [
        { feature: 'Contract Type (Month-to-Month)', coefficient: '+0.612', p: '< 0.001', pct: 92, status: 'HIGH RISK' },
        { feature: 'Support Tickets (> 4)', coefficient: '+0.435', p: '< 0.001', pct: 78, status: 'CRITICAL ESCALATION' },
        { feature: 'Tenure (Months)', coefficient: '-0.384', p: '< 0.001', pct: 69, status: 'PROTECTIVE FACTOR' },
        { feature: 'Paperless Billing Opt-in', coefficient: '+0.082', p: '0.14', pct: 21, status: 'NEGLIGIBLE' }
      ],
      insight: 'Month-to-month contracts experiencing >3 unresolved support tickets incur a 78.4% churn probability within 45 days.'
    },
    {
      query: '> Detect non-linear price elasticity anomalies in metropolitan housing',
      context: 'Census: 20,640 tracts // Target: Median_House_Value',
      analysis: [
        { feature: 'Median Household Income', coefficient: '+0.687', p: '< 0.001', pct: 96, status: 'PRIMARY VALUATION' },
        { feature: 'Distance to Coastal Waterway', coefficient: '-0.514', p: '< 0.001', pct: 82, status: 'EXPONENTIAL DECAY' },
        { feature: 'Median Age of Structure', coefficient: '+0.142', p: '< 0.01', pct: 36, status: 'SECONDARY' },
        { feature: 'Average Rooms per Household', coefficient: '+0.198', p: '< 0.01', pct: 44, status: 'MODERATE' }
      ],
      insight: 'Sub-linear valuation penalty detected once coastal distance exceeds 15km; median income accounts for 68.7% of price dispersion.'
    }
  ];

  const mlModels = {
    xgb: {
      name: 'XGBoost Gradient Boosted Trees',
      type: 'Tree Ensemble',
      accuracy: '96.8%',
      f1: '0.942',
      r2: '0.918',
      rmse: '0.0412',
      latency: '1.4ms',
      loss: '0.038',
      nodes: 300
    },
    lgb: {
      name: 'LightGBM Leaf-Wise Regressor',
      type: 'Gradient Booster',
      accuracy: '96.4%',
      f1: '0.938',
      r2: '0.912',
      rmse: '0.0435',
      latency: '0.8ms',
      loss: '0.041',
      nodes: 256
    },
    rf: {
      name: 'Random Forest Ensemble Classifier',
      type: 'Bagging Ensemble',
      accuracy: '95.1%',
      f1: '0.924',
      r2: '0.895',
      rmse: '0.0489',
      latency: '2.1ms',
      loss: '0.052',
      nodes: 200
    },
    dnn: {
      name: 'Deep Tensor Neural Network',
      type: 'Deep Learning',
      accuracy: '97.2%',
      f1: '0.951',
      r2: '0.934',
      rmse: '0.0368',
      latency: '3.6ms',
      loss: '0.029',
      nodes: 512
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#02040a] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative"
    >
      {/* Subtle CRT Scanline & Grain Texture */}
      <div className="fixed inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,24,38,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20" />

      {/* Cybernetic Coordinate Stamps */}
      <div className="fixed top-24 left-6 z-30 pointer-events-none hidden xl:flex flex-col gap-1 text-[9px] font-mono text-slate-500">
        <span>LOC // 37.7749° N, 122.4194° W</span>
        <span>SYS // QUANTUM TENSOR ENGINE v2.6</span>
        <span>LAT // 1.2ms [ZERO LEAKAGE]</span>
      </div>

      {/* ===================================================================== */}
      {/* 4. MINIMAL FLOATING GLASS NAVIGATION BAR                               */}
      {/* ===================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex justify-center px-4 pt-4 pb-2 pointer-events-none">
        <div
          className={`w-full max-w-6xl mx-auto flex items-center justify-between transition-all duration-300 pointer-events-auto ${
            scrolled
              ? 'bg-[#030712]/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.8)] py-2 px-6 rounded-full'
              : 'bg-transparent py-4 px-2'
          }`}
        >
          {/* Left: Brand Identity */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-[#030712] rounded-[6px] flex items-center justify-center">
                <Radar className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '14s' }} />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  DATALENS <span className="text-cyan-400 font-light">AI</span>
                </span>
                <span className="text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.2 rounded border border-cyan-500/30 bg-cyan-950/60 text-cyan-400">
                  CORE
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">
                AUTONOMOUS DATA INTELLIGENCE
              </span>
            </div>
          </div>

          {/* Center: Minimal Section Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800/80 backdrop-blur-xl">
            <a
              href="#hero"
              className={`px-3 py-1 rounded-full transition-all ${
                activeNav === 'hero' ? 'text-cyan-300 bg-cyan-950/80 font-semibold shadow-sm' : 'hover:text-white'
              }`}
            >
              Universe
            </a>
            <a
              href="#chaos-to-clarity"
              className={`px-3 py-1 rounded-full transition-all ${
                activeNav === 'chaos-to-clarity' ? 'text-cyan-300 bg-cyan-950/80 font-semibold shadow-sm' : 'hover:text-white'
              }`}
            >
              Clarity
            </a>
            <a
              href="#data-dna"
              className={`px-3 py-1 rounded-full transition-all ${
                activeNav === 'data-dna' ? 'text-cyan-300 bg-cyan-950/80 font-semibold shadow-sm' : 'hover:text-white'
              }`}
            >
              Data DNA
            </a>
            <a
              href="#intelligence-layers"
              className={`px-3 py-1 rounded-full transition-all ${
                activeNav === 'intelligence-layers' ? 'text-cyan-300 bg-cyan-950/80 font-semibold shadow-sm' : 'hover:text-white'
              }`}
            >
              Monolith
            </a>
            <a
              href="#ask-data"
              className={`px-3 py-1 rounded-full transition-all ${
                activeNav === 'ask-data' ? 'text-cyan-300 bg-cyan-950/80 font-semibold shadow-sm' : 'hover:text-white'
              }`}
            >
              Terminal
            </a>
            <a
              href="#launchpad"
              className={`px-3 py-1 rounded-full transition-all ${
                activeNav === 'launchpad' ? 'text-cyan-300 bg-cyan-950/80 font-semibold shadow-sm' : 'hover:text-white'
              }`}
            >
              Launchpad
            </a>
          </nav>

          {/* Right: Master Launch Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/upload')}
              className="px-4 py-2 rounded-full text-xs font-bold tracking-wide text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 group cursor-pointer"
            >
              <span>Launch DataLens</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 1. HERO — DATA UNIVERSE (3D PROJECTED DATA CORE & LIVING NODES)        */}
      {/* ===================================================================== */}
      <section
        id="hero"
        className="relative min-h-screen w-full flex flex-col justify-between pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Real 3D Rotating Polytope & Stream Canvas */}
        <Hero3DDataUniverse mouseOffset={mouseOffset} />

        {/* Ambient Volumetric Atmosphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-600/18 via-indigo-600/18 to-purple-600/12 rounded-full blur-[150px] pointer-events-none -z-10" />

        {/* Top Typography Stack */}
        <div className="relative z-10 max-w-6xl mx-auto w-full pt-4 md:pt-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-950/40 backdrop-blur-md mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase font-semibold">
                  AUTONOMOUS DATA INTELLIGENCE ENGINE
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.06]">
                YOUR DATA<br />
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  HAS A STORY.
                </span>
              </h1>

              <p className="mt-2 text-base sm:text-lg font-medium text-slate-300">
                DataLens AI helps you discover it.
              </p>

              <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-md font-normal leading-relaxed">
                Explore patterns, relationships, anomalies and predictions hidden inside your data with mathematical rigor.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/upload')}
                  className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-xl shadow-cyan-500/30 flex items-center gap-2.5 cursor-pointer group scale-100 hover:scale-105 active:scale-95"
                >
                  <span>ENTER DATA LENS</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setIsExperienceModalOpen(true)}
                  className="px-5 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform fill-cyan-400/20" />
                  <span>WATCH THE EXPERIENCE</span>
                </button>
              </div>
            </div>

            {/* Futuristic Live Engine Telemetry Readout */}
            <div className="hidden lg:flex flex-col gap-2 p-3.5 rounded-2xl bg-[#040814]/80 border border-slate-800/80 backdrop-blur-xl max-w-xs font-mono text-[11px] text-slate-400 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  CORE HUD MATRIX
                </span>
                <span className="text-emerald-400 text-[10px]">COHERENT</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>EIGENVALUE FLUX</span>
                <span className="text-white font-semibold">λ₁ = 4.31 (DOMINANT)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>ENTROPY PURGE</span>
                <span className="text-cyan-300 font-semibold">99.8% FILTERED</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>INFERENCE LATENCY</span>
                <span className="text-indigo-300 font-semibold">&lt; 1.4ms (TENSOR)</span>
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                ZERO RECTANGULAR CARDS // 100% LIVING ENGINE
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CENTER OF SCREEN: 3D HOLOGRAPHIC DATA CORE & ORBITING OBJECTS       */}
        {/* =================================================================== */}
        <div className="relative z-20 my-auto py-8 flex items-center justify-center">
          <div
            className="relative w-[310px] sm:w-[440px] md:w-[560px] lg:w-[660px] h-[310px] sm:h-[440px] md:h-[560px] lg:h-[600px] flex items-center justify-center transition-transform duration-200 scale-95 sm:scale-100"
            style={{
              transform: `perspective(1000px) rotateX(${mouseOffset.y * -8}deg) rotateY(${mouseOffset.x * 8}deg)`
            }}
          >
            {/* Concentric Rotating Hologram Laser Arcs */}
            <div className="absolute w-[96%] h-[96%] rounded-full border border-cyan-500/20 animate-spin pointer-events-none" style={{ animationDuration: '60s' }} />
            <div className="absolute w-[82%] h-[82%] rounded-full border border-dashed border-indigo-500/25 animate-spin pointer-events-none" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
            <div className="absolute w-[66%] h-[66%] rounded-full border border-purple-500/20 pointer-events-none" />
            <div className="absolute w-[50%] h-[50%] rounded-full border border-cyan-400/30 animate-pulse pointer-events-none" />

            {/* Connecting Laser SVG Beams between Core and Nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {orbitNodes.map((node) => {
                const rad = (node.angle * Math.PI) / 180;
                const rx = 42;
                const ry = 38;
                const nx = 50 + Math.cos(rad) * rx;
                const ny = 50 + Math.sin(rad) * ry;

                const isHovered = hoveredNode?.id === node.id;

                return (
                  <g key={node.id}>
                    <line
                      x1="50%"
                      y1="50%"
                      x2={`${nx}%`}
                      y2={`${ny}%`}
                      stroke={isHovered ? '#38bdf8' : 'rgba(56, 189, 248, 0.22)'}
                      strokeWidth={isHovered ? 2.5 : 1}
                      strokeDasharray={isHovered ? 'none' : '4 4'}
                      className="transition-all duration-300"
                    />

                    <circle r={isHovered ? 3.5 : 2} fill="#38bdf8" opacity={isHovered ? 1 : 0.7}>
                      <animateMotion
                        path={`M 50,50 L ${nx},${ny}`}
                        dur={`${2.2 + (node.angle % 3)}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                );
              })}
            </svg>

            {/* =============================================================== */}
            {/* THE GLOWING 3D DATA CORE IN THE EXACT CENTER                    */}
            {/* =============================================================== */}
            <div
              onClick={() => navigate('/upload')}
              className="relative z-30 group cursor-pointer flex flex-col items-center justify-center"
            >
              {/* Radiant Volumetric Halo */}
              <div className="absolute w-44 sm:w-56 h-44 sm:h-56 rounded-full bg-gradient-to-tr from-cyan-500/30 via-blue-600/35 to-purple-600/30 blur-2xl group-hover:blur-3xl transition-all duration-500 animate-pulse pointer-events-none" />

              {/* Spherical High-Tech Core Container */}
              <div className="relative w-34 sm:w-42 h-34 sm:h-42 rounded-full bg-gradient-to-br from-[#0a1532] via-[#040a1c] to-[#01040a] border-2 border-cyan-400/80 shadow-[0_0_60px_rgba(56,189,248,0.45)] flex flex-col items-center justify-center p-3 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-cyan-400/15 to-transparent animate-spin"
                  style={{ animationDuration: '6s' }}
                />

                <div className="relative z-10 flex flex-col items-center justify-center text-center leading-none select-none">
                  <span className="text-[12px] sm:text-sm font-black tracking-[0.35em] text-cyan-300">
                    DATA
                  </span>
                  <span className="text-xl sm:text-3xl font-black tracking-[0.25em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] my-0.5">
                    LENS
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.45em] text-indigo-400">
                    AI
                  </span>
                </div>

                <div className="relative z-10 mt-1 flex items-center gap-1 text-[8px] font-mono text-cyan-400 bg-cyan-950/90 px-2 py-0.5 rounded-full border border-cyan-500/40">
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
                  <span>CORE ACTIVE</span>
                </div>

                <div className="absolute inset-2 rounded-full border border-cyan-400/25 pointer-events-none" />
              </div>

              <div className="mt-2.5 text-center">
                <span className="text-[9px] sm:text-[10px] font-mono font-medium tracking-widest text-slate-400 group-hover:text-cyan-300 transition-colors uppercase">
                  [ CLICK CORE TO INITIATE ]
                </span>
              </div>
            </div>

            {/* =============================================================== */}
            {/* 9 FLOATING HUD DATA OBJECTS                                     */}
            {/* =============================================================== */}
            {orbitNodes.map((node) => {
              const rad = (node.angle * Math.PI) / 180;
              const rx = 42;
              const ry = 38;
              const nx = 50 + Math.cos(rad) * rx;
              const ny = 50 + Math.sin(rad) * ry;

              const isHovered = hoveredNode?.id === node.id;
              const IconComponent = node.icon;

              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: `${nx}%`,
                    top: `${ny}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isHovered ? 40 : 25
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setHoveredNode(isHovered ? null : node)}
                  className="cursor-pointer group"
                >
                  {/* Holographic Crystal HUD Node */}
                  <div
                    className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl transition-all duration-300 backdrop-blur-2xl ${
                      isHovered
                        ? 'bg-cyan-950/95 border-2 border-cyan-400 shadow-[0_0_30px_rgba(56,189,248,0.6)] scale-110'
                        : 'bg-[#030718]/90 border border-slate-700/80 hover:border-cyan-500/60 shadow-xl'
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 transition-colors ${
                        isHovered ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'
                      }`}
                    />
                    <div className="flex flex-col text-left">
                      <span
                        className={`text-[10px] sm:text-xs font-mono font-black tracking-wider transition-colors ${
                          isHovered ? 'text-white' : 'text-slate-200 group-hover:text-white'
                        }`}
                      >
                        {node.label}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500 hidden sm:inline-block">
                        {node.code}
                      </span>
                    </div>

                    <span
                      className={`w-1.5 h-1.5 rounded-full ml-1 ${
                        node.type === 'INPUT'
                          ? 'bg-emerald-400'
                          : node.type === 'STRUCTURE'
                          ? 'bg-blue-400'
                          : node.type === 'COGNITION'
                          ? 'bg-purple-400'
                          : 'bg-cyan-400'
                      }`}
                    />
                  </div>

                  {/* Holographic Projection Ray HUD */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 sm:w-64 p-3.5 rounded-2xl bg-[#020614]/98 border border-cyan-500/50 shadow-2xl backdrop-blur-2xl text-left pointer-events-none z-50 font-mono text-[11px]"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                            {node.label}
                          </span>
                          <span className="text-[9px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                            {node.type}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-300 font-sans leading-relaxed mb-2">
                          {node.detail}
                        </p>

                        {node.hasPreview === 'patterns' && (
                          <div className="p-2 rounded-lg bg-black/70 border border-slate-800">
                            <div className="text-[9px] text-slate-400 flex justify-between mb-1">
                              <span>COVARIANCE SCATTER</span>
                              <span className="text-cyan-400 font-bold">r = +0.892</span>
                            </div>
                            <svg className="w-full h-12">
                              {[
                                [15, 38], [28, 32], [42, 28], [55, 20], [70, 18], [85, 12], [98, 8],
                                [20, 42], [35, 26], [60, 24], [78, 14], [90, 15]
                              ].map(([px, py], idx) => (
                                <circle key={idx} cx={`${px}%`} cy={py} r="2" fill="#c084fc" opacity="0.85" />
                              ))}
                              <line x1="10%" y1="42" x2="95%" y2="8" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
                            </svg>
                          </div>
                        )}

                        {node.hasPreview === 'insights' && (
                          <div className="p-2 rounded-lg bg-black/70 border border-slate-800">
                            <div className="text-[9px] text-amber-400 font-bold mb-1 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              DISCOVERED PATTERN
                            </div>
                            <div className="text-[10px] text-slate-300 font-sans">
                              Cohort Segment 3 exhibits a +48.2% variance inflection upon feature saturation.
                            </div>
                          </div>
                        )}

                        {node.hasPreview === 'ml' && (
                          <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-black/70 border border-slate-800 text-[10px]">
                            <div>
                              <span className="text-slate-500 block text-[8px]">ACCURACY</span>
                              <span className="text-cyan-400 font-bold">96.8%</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[8px]">F1 SCORE</span>
                              <span className="text-indigo-400 font-bold">0.942</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[8px]">R² COEFFICIENT</span>
                              <span className="text-purple-400 font-bold">0.918</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[8px]">CROSS-VAL LOSS</span>
                              <span className="text-emerald-400 font-bold">0.038</span>
                            </div>
                          </div>
                        )}

                        {node.hasPreview === 'prediction' && (
                          <div className="p-2 rounded-lg bg-black/70 border border-slate-800">
                            <div className="text-[9px] text-slate-400 flex justify-between mb-1">
                              <span>AUTOREGRESSIVE FORECAST</span>
                              <span className="text-emerald-400 font-bold">+18.4%</span>
                            </div>
                            <svg className="w-full h-10">
                              <path
                                d="M 5,28 Q 35,22 65,14 T 125,6"
                                fill="none"
                                stroke="#22d3ee"
                                strokeWidth="2"
                              />
                              <polygon
                                points="65,14 125,2 125,18"
                                fill="rgba(34, 211, 238, 0.15)"
                              />
                            </svg>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Universe Journey Indicator Rail */}
        <div className="relative z-10 max-w-4xl mx-auto w-full pt-4">
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-slate-500 border-t border-slate-800/80 pt-3">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              INTELLIGENCE JOURNEY:
            </span>
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
              <span className="text-cyan-300">01 DATA ENTERS</span>
              <span>→</span>
              <span className="text-blue-300">02 UNDERSTOOD</span>
              <span>→</span>
              <span className="text-indigo-300">03 PATTERNS</span>
              <span>→</span>
              <span className="text-purple-300">04 INTELLIGENCE</span>
              <span>→</span>
              <span className="text-emerald-300">05 CLARITY</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. SECTION — FROM CHAOS TO CLARITY (4D ENTROPY COLLAPSE ENGINE)       */}
      {/* ===================================================================== */}
      <section
        id="chaos-to-clarity"
        className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/60"
      >
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/40 bg-indigo-950/40 text-indigo-400 font-mono text-xs mb-3">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>TRANSFORMATION LIFECYCLE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            FROM CHAOS<br />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              TO CLARITY.
            </span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Raw datasets begin as thousands of disordered, noisy observations. As DataLens parses entropy, points self-organize, link into covariance graphs, and reveal deterministic predictive clarity.
          </p>

          <div className="mt-4 font-mono text-xs text-cyan-400 font-bold tracking-widest uppercase">
            RAW DATA becomes INTELLIGENCE.
          </div>
        </div>

        {/* Cinematic Canvas Frame */}
        <div className="relative rounded-3xl bg-[#030612] border border-cyan-500/40 shadow-[0_0_60px_rgba(56,189,248,0.18)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-800/80 bg-[#050b1c]/90 font-mono text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-white font-bold">ENTROPY DYNAMICS ENGINE</span>
              <span className="text-slate-600">|</span>
              <span>N = 380 ACTIVE VECTORS</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-cyan-300">
                ENTROPY: <strong className="text-white">{entropyValue}%</strong>
              </span>
              <span className="text-indigo-300">
                CLARITY: <strong className="text-white">{100 - entropyValue}%</strong>
              </span>
            </div>
          </div>

          <div className="relative w-full h-[400px] sm:h-[480px] bg-gradient-to-b from-[#020510] via-[#030715] to-[#01030a]">
            <ChaosToClarityCanvas stage={chaosStage} entropyValue={entropyValue} />

            <div className="absolute bottom-4 left-4 font-mono text-xs text-slate-400 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
              STATE:{' '}
              <strong className="text-cyan-300">
                {entropyValue > 70
                  ? '01 RAW CHAOTIC ENTROPY'
                  : entropyValue > 40
                  ? '02 DIMENSIONAL PARTITIONING'
                  : entropyValue > 15
                  ? '03 COVARIANCE TOPOLOGY MESH'
                  : '04 PREDICTIVE REGRESSION CLARITY'}
              </strong>
            </div>
          </div>

          <div className="p-5 border-t border-slate-800/80 bg-[#040816]/95 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
              {[
                { stage: 0, label: '01 CHAOS', desc: 'Raw Dispersal' },
                { stage: 1, label: '02 ORGANIZE', desc: 'Cluster Axes' },
                { stage: 2, label: '03 CONNECT', desc: 'Covariance' },
                { stage: 3, label: '04 CLARITY', desc: 'Fitted Curves' }
              ].map((btn) => (
                <button
                  key={btn.stage}
                  onClick={() => handleSelectChaosStage(btn.stage)}
                  className={`px-3 py-2 rounded-xl font-mono text-xs text-left transition-all cursor-pointer ${
                    chaosStage === btn.stage
                      ? 'bg-cyan-500/20 border border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold">{btn.label}</div>
                  <div className="text-[10px] text-slate-500">{btn.desc}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-72">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>SCRUB ENTROPY</span>
                  <span className="text-cyan-300 font-bold">{entropyValue}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={entropyValue}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEntropyValue(val);
                    if (val > 75) setChaosStage(0);
                    else if (val > 45) setChaosStage(1);
                    else if (val > 15) setChaosStage(2);
                    else setChaosStage(3);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. SECTION — DATA DNA (BIOLOGICAL-QUANTUM DATASET ANATOMY)            */}
      {/* ===================================================================== */}
      <section
        id="data-dna"
        className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/60"
      >
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 font-mono text-xs mb-3">
            <Binary className="w-3.5 h-3.5 text-cyan-400" />
            <span>ORGANIC DATASET ANATOMY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            DATA DNA
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Every dataset possesses an organic mathematical structure. Instead of isolated tables, DataLens constructs an interactive topological network representing its fundamental dimensions.
          </p>
        </div>

        {/* Live Animated DNA Double Helix Visualizer */}
        <div className="w-full h-28 rounded-2xl bg-[#030718] border border-cyan-500/30 mb-8 overflow-hidden relative">
          <DataDnaHelixCanvas activeNode={activeDnaNode} />
          <div className="absolute top-2 left-4 text-[10px] font-mono text-slate-400">
            HELICAL SEQUENCER // COVARIANCE STRAND ACTIVE
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 flex flex-col gap-3">
            {[
              {
                id: 'rows',
                title: 'ROWS // OBSERVATIONAL VECTOR SPACE',
                tag: 'POPULATION',
                badge: '10,000+ INSTANCES',
                desc: 'Continuous row sampling, outlier boundary filtering (IQR [12.4, 88.6]), and dispersion index calculation (1.14).'
              },
              {
                id: 'columns',
                title: 'COLUMNS // FEATURE DIMENSIONALITY',
                tag: 'TOPOLOGY',
                badge: '24 ATTRIBUTES',
                desc: 'Automated type inference across numeric, categorical, and ordinal channels with zero missingness leakage.'
              },
              {
                id: 'relationships',
                title: 'RELATIONSHIPS // COVARIANCE TENSOR',
                tag: 'GRAPH MATRIX',
                badge: '276 PAIRS COMPUTED',
                desc: 'High-speed correlation scanning identifying monotonic dependencies, multicollinearity, and non-linear interactions.'
              },
              {
                id: 'distributions',
                title: 'DISTRIBUTIONS // DENSITY MOMENTS',
                tag: 'PARAMETRICS',
                badge: 'SKEW: +0.12',
                desc: 'Kernel density estimation, kurtosis evaluation (2.94), and Gaussian normality hypothesis verification.'
              },
              {
                id: 'patterns',
                title: 'PATTERNS // LATENT TOPOLOGICAL EMBEDDINGS',
                tag: 'MANIFOLD',
                badge: '94.2% SEPARATION',
                desc: 'Automated PCA projections and silhouette-validated clustering uncovering hidden subpopulation clusters.'
              }
            ].map((node) => {
              const isActive = activeDnaNode === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setActiveDnaNode(node.id)}
                  className={`p-4 rounded-2xl transition-all duration-300 cursor-pointer flex items-start justify-between gap-4 border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#06122c] to-[#04091a] border-cyan-400 shadow-[0_0_30px_rgba(56,189,248,0.25)] scale-[1.01]'
                      : 'bg-[#030612]/70 border-slate-800/80 hover:border-slate-700 hover:bg-[#050b1d]'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px]">
                      <span className="text-cyan-400 font-bold uppercase">{node.tag}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{node.badge}</span>
                    </div>

                    <h3 className={`text-sm font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-200'}`}>
                      {node.title}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                      {node.desc}
                    </p>
                  </div>

                  <div className="pt-1">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs ${
                        isActive ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#030718] border border-cyan-500/40 shadow-2xl backdrop-blur-xl flex flex-col justify-between min-h-[460px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 font-mono text-xs">
                <span className="text-cyan-400 font-bold flex items-center gap-2">
                  <Radar className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '20s' }} />
                  DNA TELEMETRY INSPECTOR
                </span>
                <span className="text-emerald-400">READY</span>
              </div>

              {activeDnaNode === 'relationships' && (
                <div className="flex flex-col gap-3 font-mono text-xs">
                  <div className="text-slate-400 text-[11px]">COVARIANCE HEAT MAP // SAMPLE PAIRS</div>
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                    <div className="p-2 bg-slate-900/60 rounded text-slate-400 font-bold">FEAT</div>
                    <div className="p-2 bg-slate-900/60 rounded text-slate-400">F_01</div>
                    <div className="p-2 bg-slate-900/60 rounded text-slate-400">F_02</div>
                    <div className="p-2 bg-slate-900/60 rounded text-slate-400">TARGET</div>

                    <div className="p-2 bg-slate-900/60 rounded text-slate-400">F_01</div>
                    <div className="p-2 bg-cyan-900/60 text-cyan-200 rounded font-bold">1.00</div>
                    <div className="p-2 bg-indigo-900/40 text-indigo-200 rounded font-bold">0.42</div>
                    <div className="p-2 bg-cyan-500/30 text-cyan-300 rounded font-bold">+0.89</div>

                    <div className="p-2 bg-slate-900/60 rounded text-slate-400">F_02</div>
                    <div className="p-2 bg-indigo-900/40 text-indigo-200 rounded font-bold">0.42</div>
                    <div className="p-2 bg-cyan-900/60 text-cyan-200 rounded font-bold">1.00</div>
                    <div className="p-2 bg-purple-900/40 text-purple-200 rounded font-bold">0.31</div>

                    <div className="p-2 bg-slate-900/60 rounded text-slate-400">TARGET</div>
                    <div className="p-2 bg-cyan-500/30 text-cyan-300 rounded font-bold">+0.89</div>
                    <div className="p-2 bg-purple-900/40 text-purple-200 rounded font-bold">0.31</div>
                    <div className="p-2 bg-cyan-900/60 text-cyan-200 rounded font-bold">1.00</div>
                  </div>

                  <div className="mt-2 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200 font-sans">
                    Dominant linear manifold isolated between Feature 1 and Target (r = +0.892, p &lt; 0.0001).
                  </div>
                </div>
              )}

              {activeDnaNode === 'distributions' && (
                <div className="flex flex-col gap-3 font-mono text-xs">
                  <div className="text-slate-400 text-[11px]">KERNEL DENSITY ESTIMATE // GAUSSIAN FIT</div>
                  <div className="h-32 w-full flex items-end justify-between gap-1 p-2 bg-black/60 rounded-xl border border-slate-800">
                    {[10, 18, 32, 55, 78, 92, 98, 86, 64, 42, 22, 12, 6].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-cyan-600 to-indigo-400 rounded-t" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>μ: 54.2</span>
                    <span>σ: 12.8</span>
                    <span>SKEW: +0.12</span>
                    <span className="text-emerald-400 font-bold">NORMAL</span>
                  </div>
                </div>
              )}

              {activeDnaNode === 'rows' && (
                <div className="flex flex-col gap-2 font-mono text-xs">
                  <div className="text-slate-400 text-[11px]">SAMPLING FIDELITY & HYGIENE</div>
                  <div className="p-3 bg-black/60 rounded-xl border border-slate-800 flex justify-between">
                    <span>TOTAL VECTORS:</span>
                    <span className="text-white font-bold">10,000 OBSERVATIONS</span>
                  </div>
                  <div className="p-3 bg-black/60 rounded-xl border border-slate-800 flex justify-between">
                    <span>OUTLIER ISOLATION:</span>
                    <span className="text-cyan-400 font-bold">1.8% REMOVED</span>
                  </div>
                  <div className="p-3 bg-black/60 rounded-xl border border-slate-800 flex justify-between">
                    <span>MISSING VALUE IMPUTE:</span>
                    <span className="text-emerald-400 font-bold">KNN (k=5) APPLIED</span>
                  </div>
                </div>
              )}

              {activeDnaNode === 'columns' && (
                <div className="flex flex-col gap-2 font-mono text-xs">
                  <div className="text-slate-400 text-[11px]">MULTI-MODAL TYPE INFERENCE</div>
                  <div className="p-3 bg-black/60 rounded-xl border border-slate-800 flex justify-between">
                    <span>NUMERIC CONTINUOUS:</span>
                    <span className="text-cyan-300 font-bold">16 COLUMNS (66.7%)</span>
                  </div>
                  <div className="p-3 bg-black/60 rounded-xl border border-slate-800 flex justify-between">
                    <span>CATEGORICAL ENCODED:</span>
                    <span className="text-indigo-300 font-bold">6 COLUMNS (25.0%)</span>
                  </div>
                  <div className="p-3 bg-black/60 rounded-xl border border-slate-800 flex justify-between">
                    <span>TEMPORAL INDEX:</span>
                    <span className="text-purple-300 font-bold">2 COLUMNS (8.3%)</span>
                  </div>
                </div>
              )}

              {activeDnaNode === 'patterns' && (
                <div className="flex flex-col gap-2 font-mono text-xs">
                  <div className="text-slate-400 text-[11px]">PCA MANIFOLD PROJECTION</div>
                  <div className="h-32 w-full p-2 bg-black/60 rounded-xl border border-slate-800 relative flex items-center justify-center">
                    <div className="absolute w-24 h-24 rounded-full border border-dashed border-cyan-500/40 animate-spin" style={{ animationDuration: '30s' }} />
                    <div className="text-center">
                      <span className="text-cyan-300 font-bold text-sm block">CLUSTER SEPARATION</span>
                      <span className="text-slate-400 text-[10px]">SILHOUETTE: 0.84</span>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-indigo-950/40 text-[11px] text-indigo-200 font-sans">
                    3 distinct non-overlapping behavioral clusters isolated with high statistical power.
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => navigate('/upload')}
                className="w-full py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>INSPECT YOUR DATASET DNA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 8. SECTION — INTELLIGENCE LAYERS (ISOMETRIC 3D MONOLITH)              */}
      {/* ===================================================================== */}
      <section
        id="intelligence-layers"
        className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/60"
      >
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/40 bg-purple-950/40 text-purple-400 font-mono text-xs mb-3">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>ISOMETRIC 3D MONOLITH</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            INTELLIGENCE LAYERS
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-400">
            DataLens AI does not run fragmented scripts. It functions as one continuous four-layer intelligence stack passing features and loss gradients seamlessly through each tier.
          </p>
        </div>

        <div className="relative flex flex-col gap-4 max-w-4xl mx-auto">
          {/* Vertical Optical Pillars Piercing Through All Layers */}
          <div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-cyan-400 via-indigo-500 to-purple-500 -z-0 opacity-50 hidden sm:block" />

          {[
            {
              layer: 'LAYER 04',
              title: 'PREDICT',
              subtitle: 'Competitive AutoML & Time-Series Engine',
              color: 'border-cyan-400/80 bg-gradient-to-r from-[#04132e] to-[#020917]',
              icon: BrainCircuit,
              tech: '5-Fold Stratified Tournament // What-If Simulator // Autoregressive Horizon',
              metrics: 'Mean Accuracy: 96.8% | Loss: 0.038',
              features: ['LightGBM, XGBoost, Random Forest', 'Synthetic feature interaction search', 'SHAP attribution breakdown']
            },
            {
              layer: 'LAYER 03',
              title: 'DISCOVER',
              subtitle: 'Explainable AI & Causal Signals',
              color: 'border-indigo-400/60 bg-gradient-to-r from-[#060e29] to-[#020716]',
              icon: Sparkles,
              tech: 'Gini Impurity MDI // Silhouette Validation // Natural Language Synthesis',
              metrics: 'Top Predictor Power: 94.2% | Mutual Info: 0.78',
              features: ['Causal link hypothesis generator', 'Automated anomaly isolation', 'Plain-English narrative synthesis']
            },
            {
              layer: 'LAYER 02',
              title: 'EXPLORE',
              subtitle: 'Non-Parametric Statistical Profiling',
              color: 'border-purple-400/50 bg-gradient-to-r from-[#090b26] to-[#030514]',
              icon: Network,
              tech: 'Pearson & Spearman Matrices // Isolation Forest // Kernel Density Estimation',
              metrics: '276 Covariance Edges // Multicollinearity VIF Verified',
              features: ['Interactive high-dimensional EDA', 'Bivariate cross-feature scatter', 'Distribution skew & kurtosis audit']
            },
            {
              layer: 'LAYER 01',
              title: 'UNDERSTAND',
              subtitle: 'Autonomous Schema & Hygiene Ingestion',
              color: 'border-blue-400/40 bg-gradient-to-r from-[#04081c] to-[#01030d]',
              icon: Database,
              tech: 'Dynamic Type Cast // Delimiter Sniffing // 4-Dimensional Quality Audit',
              metrics: 'Completeness: 99.4% | Entropy: 4.82 bits',
              features: ['Automatic CSV / Excel workbook parsing', 'Duplicate & null token remediation', 'Comprehensive dataset health scoring']
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeLayerIndex === idx;

            return (
              <div
                key={item.layer}
                onClick={() => setActiveLayerIndex(idx)}
                className={`relative z-10 p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? `${item.color} shadow-2xl scale-[1.02]`
                    : 'bg-[#030614]/85 border-slate-800 hover:border-slate-700 hover:bg-[#040a1e]'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 font-mono text-xs mb-1">
                        <span className="font-bold text-cyan-400">{item.layer}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-white font-extrabold tracking-wider">{item.title}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-200">{item.subtitle}</h4>
                      <p className="text-xs text-slate-400 mt-1 font-mono">{item.tech}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-1.5 font-mono text-xs">
                    <span className="text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800/80">
                      {item.metrics}
                    </span>
                    <span className="text-[10px] text-slate-500">CLICK TO EXPAND TENSOR TELEMETRY</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-slate-300">
                    {item.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 p-2 rounded-lg bg-black/50 border border-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-[11px] font-sans">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 9. SECTION — ASK YOUR DATA (HOLOGRAPHIC AI QUERY TERMINAL)            */}
      {/* ===================================================================== */}
      <section
        id="ask-data"
        className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/60"
      >
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 font-mono text-xs mb-3">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>NATURAL LANGUAGE QUERY INTERFACE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            ASK YOUR DATA.
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Pose natural language questions directly to your dataset. DataLens translates intent into multivariate regressions, evaluates p-values, and renders empirical charts in real time.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-3xl bg-[#020512] border border-cyan-500/40 shadow-[0_0_60px_rgba(56,189,248,0.2)] overflow-hidden">
          {/* Audio Spectral Waveform Header */}
          <div className="p-4 bg-[#050b1c] border-b border-slate-800 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-2 text-slate-400 font-semibold">datalens_terminal // query_engine.py</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[4, 12, 8, 16, 6, 14, 10, 18, 5, 12].map((h, i) => (
                <div key={i} className="w-1 bg-cyan-400 rounded-full animate-pulse" style={{ height: `${h}px` }} />
              ))}
              <span className="text-cyan-400 text-[10px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 ml-2">
                SPECTRAL VOICE
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#030718] border-b border-slate-800/80 flex flex-wrap gap-2">
            {queries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setActiveQueryIndex(idx)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                  activeQueryIndex === idx
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                PROMPT {idx + 1}
              </button>
            ))}
          </div>

          <div className="p-6 font-mono text-xs flex flex-col gap-4 text-slate-300 bg-gradient-to-b from-[#020512] to-[#01030a]">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <span>{queries[activeQueryIndex].query}</span>
              <span className="w-2 h-4 bg-cyan-400 animate-pulse" />
            </div>

            <div className="text-[11px] text-slate-500">
              {queries[activeQueryIndex].context}
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-slate-800 flex flex-col gap-2.5">
              <div className="text-slate-400 font-bold text-[11px] flex items-center justify-between">
                <span>MULTIVARIATE COEFFICIENTS & COVARIANCE:</span>
                <span className="text-emerald-400">[ PATTERN DETECTED ]</span>
              </div>

              {queries[activeQueryIndex].analysis.map((row, rIdx) => (
                <div key={rIdx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">{row.feature}</span>
                    <span className="text-cyan-300 font-bold">
                      β = {row.coefficient} (p {row.p})
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 font-sans text-xs sm:text-sm text-cyan-100 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-mono text-xs uppercase mb-1">
                  EMPIRICAL SYNTHESIS:
                </strong>
                {queries[activeQueryIndex].insight}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 10. SECTION — LET THE DATA LEARN (SYNAPTIC NEURAL PIPELINE)           */}
      {/* ===================================================================== */}
      <section
        id="ml-learn"
        className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/60"
      >
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 font-mono text-xs mb-3">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>SYNAPTIC NEURAL PIPELINE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            LET THE DATA LEARN.
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-400">
            From automated feature extraction to hyperparameter grid search, DataLens pits state-of-the-art estimators against each other to deliver maximum empirical performance.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8 font-mono text-xs">
          {Object.entries(mlModels).map(([key, m]) => (
            <button
              key={key}
              onClick={() => setActiveModel(key)}
              className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                activeModel === key
                  ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {m.name.split(' ')[0]} ({m.type})
            </button>
          ))}
        </div>

        {/* Synaptic Flow Pipeline Bus */}
        <div className="p-8 rounded-3xl bg-[#030718] border border-cyan-500/30 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <div className="p-5 rounded-2xl bg-black/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">STAGE 01</span>
                <h4 className="text-base font-bold text-white mb-2">RAW DATA</h4>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Tensor ingestion, scaling, and zero-leakage test splitting.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 font-mono text-[10px] text-slate-400">
                100% PURIFIED
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-bold block mb-1">STAGE 02</span>
                <h4 className="text-base font-bold text-white mb-2">FEATURES</h4>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  PCA extraction, polynomial interactions, and target encoding.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 font-mono text-[10px] text-slate-400">
                24 CHANNELS
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-300 font-bold block mb-1">STAGE 03</span>
                <h4 className="text-base font-bold text-white mb-2">{mlModels[activeModel].name.split(' ')[0]}</h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Cross-validated hyperparameter loss optimization.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 font-mono text-[10px] text-cyan-300 font-bold">
                LOSS: {mlModels[activeModel].loss}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">STAGE 04</span>
                <h4 className="text-base font-bold text-white mb-2">PREDICTIONS</h4>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Deterministic scoring and probability confidence intervals.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 font-mono text-[10px] text-emerald-400 font-bold">
                {mlModels[activeModel].latency}
              </div>
            </div>
          </div>

          {/* Integrated Circular Neon HUD Gauges */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center">
              <span className="text-slate-400 text-xs block mb-1">ACCURACY</span>
              <span className="text-2xl font-black text-cyan-300">{mlModels[activeModel].accuracy}</span>
              <span className="text-[9px] text-slate-500 mt-1">CROSS-VALIDATED</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center">
              <span className="text-slate-400 text-xs block mb-1">F1 SCORE</span>
              <span className="text-2xl font-black text-indigo-300">{mlModels[activeModel].f1}</span>
              <span className="text-[9px] text-slate-500 mt-1">HARMONIC MEAN</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center">
              <span className="text-slate-400 text-xs block mb-1">R² SCORE</span>
              <span className="text-2xl font-black text-purple-300">{mlModels[activeModel].r2}</span>
              <span className="text-[9px] text-slate-500 mt-1">EXPLAINED VAR</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center">
              <span className="text-slate-400 text-xs block mb-1">RMSE ERROR</span>
              <span className="text-2xl font-black text-emerald-300">{mlModels[activeModel].rmse}</span>
              <span className="text-[9px] text-slate-500 mt-1">NORM RESIDUAL</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 11. FINAL SECTION — READY TO SEE WHAT YOUR DATA KNOWS?               */}
      {/* ===================================================================== */}
      <section
        id="launchpad"
        className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/60 text-center"
      >
        <div className="relative mx-auto mb-8 w-28 h-28 rounded-full bg-gradient-to-br from-[#0c1836] via-[#050c1e] to-[#02050c] border-2 border-cyan-400/80 shadow-[0_0_60px_rgba(56,189,248,0.45)] flex items-center justify-center">
          <BrainCircuit className="w-12 h-12 text-cyan-400 animate-pulse" />
          <div className="absolute -inset-2 rounded-full border border-dashed border-indigo-500/40 animate-spin" style={{ animationDuration: '30s' }} />
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          READY TO SEE<br />
          WHAT YOUR DATA<br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            KNOWS?
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-400 mt-4 max-w-lg mx-auto font-normal">
          Connect your custom CSV/Excel dataset or immediately launch with one of our curated postgraduate benchmarks.
        </p>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate('/upload')}
            className="px-8 py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-2xl shadow-cyan-500/35 cursor-pointer flex items-center gap-3 group scale-105 hover:scale-110 active:scale-95"
          >
            <span>ENTER DATA LENS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* 1-Click Postgraduate Sample Benchmarks */}
        <div className="mt-16 text-left">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono text-slate-400">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>OR EXPLORE INSTANT BENCHMARKS // ZERO CONFIGURATION</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displaySamples.map((sample) => (
              <div
                key={sample.id}
                className="bg-[#050b1c]/85 rounded-2xl border border-slate-800 hover:border-cyan-500/50 p-4 shadow-xl hover:shadow-cyan-500/20 transition-all flex flex-col justify-between group backdrop-blur-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {sample.type.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      {sample.category.split('/')[0].trim()}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-xs mb-1 group-hover:text-cyan-300 transition-colors">
                    {sample.name}
                  </h3>

                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3 line-clamp-2">
                    {sample.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Target: <strong className="text-slate-200">{sample.target}</strong>
                  </span>
                  <button
                    onClick={() => handleLaunchSample(sample.id)}
                    disabled={loading}
                    className="flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? '...' : 'Launch'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Dataset Upload Dropzone */}
        <div
          onClick={() => navigate('/upload')}
          className="mt-10 max-w-xl mx-auto rounded-2xl border border-dashed border-slate-800 hover:border-cyan-500/60 bg-[#040814]/80 hover:bg-[#060c1e] p-6 text-center transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-0.5">Analyze Your Own Dataset</h4>
          <p className="text-[11px] text-slate-400 font-mono">Drop CSV or Excel (.xlsx) file to initiate autonomous pipeline</p>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* WATCH THE EXPERIENCE MODAL                                            */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {isExperienceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#030718] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Radar className="w-5 h-5 text-cyan-400 animate-spin" />
                  <span className="font-bold text-white text-base">DATALENS AI // SYSTEM EXPERIENCE</span>
                </div>
                <button
                  onClick={() => setIsExperienceModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4 font-sans text-sm text-slate-300">
                <p>
                  Experience how DataLens AI transforms raw datasets into deep mathematical insights, explainable ML models, and interactive forecasts without manual scripting.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
                    <span className="text-cyan-400 font-bold block mb-1">01 INGESTION</span>
                    <span className="text-slate-400 text-[11px]">Instant schema inference and quality scoring.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
                    <span className="text-blue-400 font-bold block mb-1">02 EXPLORATION</span>
                    <span className="text-slate-400 text-[11px]">Covariance matrices & multivariate plots.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
                    <span className="text-indigo-400 font-bold block mb-1">03 INSIGHTS</span>
                    <span className="text-slate-400 text-[11px]">Autonomous hypothesis verification.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
                    <span className="text-purple-400 font-bold block mb-1">04 PREDICTION</span>
                    <span className="text-slate-400 text-[11px]">AutoML leaderboard with SHAP explainability.</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setIsExperienceModalOpen(false);
                      handleLaunchSample('customers_churn');
                    }}
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors cursor-pointer"
                  >
                    Launch Demo Dataset
                  </button>

                  <button
                    onClick={() => {
                      setIsExperienceModalOpen(false);
                      navigate('/upload');
                    }}
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Upload Custom Data
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* FOOTER — TELEMETRY & SYSTEM STATUS                                    */}
      {/* ===================================================================== */}
      <footer className="border-t border-slate-800/80 py-10 px-4 max-w-6xl mx-auto text-xs font-mono text-slate-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-bold font-sans">DATALENS AI</span>
            <span className="text-slate-700">|</span>
            <span>AUTONOMOUS DATA SCIENCE INTELLIGENCE ENGINE</span>
          </div>

          <div className="flex items-center gap-5 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API: 127.0.0.1:8000 ONLINE
            </span>
            <span>BUILD: 2026.09-DS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
