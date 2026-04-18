/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Send, Image as ImageIcon, CheckCircle, ArrowRight, Star, Loader2, Sparkles, Lock, X } from 'lucide-react';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Registration, RegistrationFormData } from './types.ts';

// --- Components ---

/**
 * Animated Particle Background using Canvas
 */
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#D4AF37'; // Gold color

      particles.forEach((p) => {
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    window.addEventListener('resize', resize);
    resize();
    drawParticles();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'radial-gradient(circle at center, #0a0a0a 0%, #000 100%)' }}
    />
  );
};

export default function App() {
  const [view, setView] = useState<'form' | 'list' | 'admin'>('form');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Admin Context
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [isAdminVerifying, setIsAdminVerifying] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<RegistrationFormData>({
    username: '',
    description: '',
    reason: '',
    image: null,
  });

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/registrations');
      const data = await res.json();
      setRegistrations(data);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.description || !formData.reason) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ username: '', description: '', reason: '', image: null });
        fetchRegistrations();
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      console.error('Error submitting registration:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminVerifying(true);
    setAdminError('');
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAdminAuthenticated(true);
        setRegistrations(data.registrations);
      } else {
        setAdminError(data.error);
      }
    } catch (err) {
      setAdminError('Error de conexión');
    } finally {
      setIsAdminVerifying(false);
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-gold selection:text-black">
      <ParticleBackground />

      {/* Header */}
      <header className="relative z-10 pt-16 pb-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <p className="pre-title mb-2">The Digital Excellence</p>
          <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter gold-gradient-text uppercase">
            Roblox Awards 2026
          </h1>
          <p className="tagline mt-3">
            Celebrando el talento y la innovación en el metaverso.
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="mt-10 flex justify-center gap-4">
          <button
            onClick={() => setView('form')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
              view === 'form' 
                ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Send size={18} />
            Inscripción
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
              view === 'list' 
                ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Users size={18} />
            Nominados ({registrations.length})
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          {view === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="form-card rounded-xl p-8 md:p-12 overflow-hidden relative"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={120} className="text-gold" />
              </div>

              {submitted ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="text-green-500 w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-display font-bold text-gold mb-2">¡Inscripción Enviada!</h3>
                  <p className="text-gray-400 mb-8 max-w-sm">
                    Tu participación ha sido registrada correctamente. El jurado revisará tu perfil pronto.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-gold hover:underline font-medium flex items-center gap-2"
                  >
                    Enviar otra inscripción <ArrowRight size={16} />
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* User Info */}
                    <div className="space-y-6">
                      <div>
                        <label className="input-label mb-2 block">
                          TU NOMBRE
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="Ej: BloxMaster_99"
                          className="w-full input-field rounded px-5 py-3 focus:outline-none placeholder:text-zinc-600"
                        />
                      </div>

                      <div>
                        <label className="input-label mb-2 block">
                          ¿A qué te dedicas?
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Desarrollador, diseñador, streamer..."
                          className="w-full input-field rounded px-5 py-3 focus:outline-none placeholder:text-zinc-600"
                        />
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="input-label mb-2 block">
                        Imagen de Perfil
                      </label>
                      <div className="relative group overflow-hidden bg-white/5 border border-dashed border-gold/40 rounded aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-gold transition-colors">
                        {formData.image ? (
                          <>
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <p className="text-white text-sm font-medium">Cambiar imagen</p>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-6">
                            <ImageIcon className="mx-auto w-12 h-12 text-zinc-600 mb-2 group-hover:text-gold transition-colors" />
                            <p className="text-zinc-500 text-sm">Click para subir foto</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Why Participate */}
                  <div>
                    <label className="input-label mb-2 block">
                      ¿Por qué quieres participar?
                    </label>
                    <textarea
                      required
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      rows={4}
                      placeholder="Cuéntanos tu motivación para unirte a los premios..."
                      className="w-full input-field rounded px-5 py-3 focus:outline-none placeholder:text-zinc-600 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="w-full btn-submit py-4 rounded shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        Enviar Inscripción
                        <Send size={20} />
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>
          ) : view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-gold w-10 h-10" />
                </div>
              ) : registrations.length === 0 ? (
                <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-20 text-center">
                  <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-zinc-400">No hay nominados aún</h3>
                  <button 
                    onClick={() => setView('form')}
                    className="mt-6 text-gold hover:underline"
                  >
                    Sé el primero en inscribirte
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {registrations.map((reg, idx) => (
                    <motion.div
                      key={reg.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 text-center group hover:border-gold/30 transition-all"
                    >
                      <Trophy size={16} className="text-gold/20 group-hover:text-gold transition-colors mx-auto mb-2" />
                      <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider group-hover:text-white transition-colors">
                        {reg.username}
                      </h4>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {!isAdminAuthenticated ? (
                <div className="form-card rounded-xl p-8 max-w-md mx-auto text-center">
                  <Lock className="mx-auto text-gold mb-4" size={40} />
                  <h2 className="text-2xl font-bold mb-6">Acceso Administrador</h2>
                  <form onSubmit={handleAdminVerify} className="space-y-4">
                    <input
                      type="password"
                      placeholder="Contraseña"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full input-field rounded px-4 py-3 focus:outline-none"
                      required
                    />
                    {adminError && <p className="text-red-500 text-sm">{adminError}</p>}
                    <button
                      type="submit"
                      disabled={isAdminVerifying}
                      className="w-full btn-submit py-3 rounded flex items-center justify-center gap-2"
                    >
                      {isAdminVerifying ? <Loader2 className="animate-spin" /> : 'Entrar'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="form-card rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold text-gold">Panel de Administración</h2>
                    <button 
                      onClick={() => setIsAdminAuthenticated(false)}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-[10px] uppercase tracking-widest text-gold bg-black/40">
                        <tr>
                          <th className="px-6 py-4">Usuario</th>
                          <th className="px-6 py-4">Actividad</th>
                          <th className="px-6 py-4">Razón</th>
                          <th className="px-6 py-4">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {registrations.map((reg) => (
                          <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-3">
                                <div className="w-32 h-32 rounded bg-zinc-800 overflow-hidden border border-gold/20 shadow-lg group relative">
                                  {reg.image ? (
                                    <a href={reg.image} target="_blank" rel="noopener noreferrer">
                                      <img src={reg.image} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-[10px] text-white bg-black/60 px-2 py-1 rounded">Ver grande</span>
                                      </div>
                                    </a>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700">Sin foto</div>
                                  )}
                                </div>
                                <span className="font-bold text-white tracking-wide">{reg.username}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-zinc-400 text-sm align-top pt-8">{reg.description}</td>
                            <td className="px-6 py-4 text-zinc-400 text-sm align-top pt-8 max-w-sm whitespace-pre-wrap">{reg.reason}</td>
                            <td className="px-6 py-4 text-zinc-500 text-xs align-top pt-8">
                              {new Date(reg.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center text-zinc-600 text-[10px] tracking-[2px] uppercase">
        <p>Oficial Roblox Awards &copy; 2026 &bull; Gala de Premiación Anual</p>
        <button 
          onClick={() => setView('admin')}
          className="mt-6 opacity-30 hover:opacity-100 transition-opacity flex items-center gap-2 mx-auto cursor-pointer"
        >
          <Lock size={12} /> Admin
        </button>
      </footer>
    </div>
  );
}
