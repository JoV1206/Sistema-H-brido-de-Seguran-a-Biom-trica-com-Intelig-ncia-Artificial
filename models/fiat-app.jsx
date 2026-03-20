import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Award, Users, Heart, Clock, Star, Trophy, BookOpen, Sparkles } from 'lucide-react';

export default function FiatApp() {
  const [currentStreak, setCurrentStreak] = useState(12);
  const [timeUntilRosary, setTimeUntilRosary] = useState({ hours: 3, minutes: 24, seconds: 18 });
  const [activeTab, setActiveTab] = useState('home');
  const [selectedMonth, setSelectedMonth] = useState('fevereiro');
  
  // Simulated calendar data
  const calendarDays = Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    participated: i < 12 || (i >= 14 && i < 20) || i === 22
  }));
  
  // Ranking data
  const ranking = [
    { name: 'Maria Silva', streak: 45, avatar: '👩🏻' },
    { name: 'José Santos', streak: 38, avatar: '👨🏽' },
    { name: 'Você', streak: 12, avatar: '✨', isYou: true },
    { name: 'Ana Costa', streak: 8, avatar: '👩🏾' },
    { name: 'Pedro Lima', streak: 5, avatar: '👨🏻' },
  ];
  
  // Prayer intentions
  const intentions = [
    { author: 'Maria Silva', text: 'Pela saúde da minha mãe', likes: 12 },
    { author: 'José Santos', text: 'Pelas vocações sacerdotais', likes: 8 },
    { author: 'Ana Costa', text: 'Pela paz no mundo', likes: 15 },
  ];
  
  // Mysteries of the day
  const mysteries = {
    type: 'Gloriosos',
    list: [
      'A Ressurreição de Jesus',
      'A Ascensão de Jesus',
      'A Vinda do Espírito Santo',
      'A Assunção de Maria',
      'A Coroação de Maria'
    ]
  };

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilRosary(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white font-serif">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-amber-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-6 px-6 border-b border-blue-800/30 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 via-amber-200 to-blue-200 bg-clip-text text-transparent tracking-wide">
                FIAT
              </h1>
              <p className="text-blue-300 text-sm mt-1 font-sans">Faça-se segundo a Tua palavra</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-300 font-sans mb-1">Seu Streak</div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-2 rounded-full border border-amber-500/30">
                <Flame className="text-amber-400 w-6 h-6 animate-pulse" />
                <span className="text-2xl font-bold text-amber-300">{currentStreak}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-md mx-auto px-6 py-6">
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Countdown Timer */}
            <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-md rounded-3xl p-6 border border-blue-700/30 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-300" />
                <h2 className="text-lg font-semibold text-blue-200 font-sans">Próximo Terço</h2>
              </div>
              <div className="flex justify-center gap-4 mb-6">
                {[
                  { value: timeUntilRosary.hours, label: 'Horas' },
                  { value: timeUntilRosary.minutes, label: 'Min' },
                  { value: timeUntilRosary.seconds, label: 'Seg' }
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="bg-blue-950/60 rounded-2xl px-5 py-4 border border-blue-700/40 min-w-[70px]">
                      <div className="text-4xl font-bold text-amber-300 tabular-nums">
                        {String(item.value).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="text-xs text-blue-300 mt-2 font-sans">{item.label}</div>
                  </div>
                ))}
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-blue-900/50 font-sans text-lg">
                🙏 Entrar no Terço
              </button>
              <p className="text-center text-xs text-blue-300 mt-3 font-sans">Todos os dias às 22:00 via Google Meet</p>
            </div>

            {/* Mysteries of the Day */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-md rounded-3xl p-6 border border-purple-700/30">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-300" />
                <h2 className="text-lg font-semibold text-purple-200 font-sans">Mistérios de Hoje</h2>
              </div>
              <div className="text-center mb-4">
                <span className="bg-purple-500/20 px-4 py-2 rounded-full text-purple-200 font-sans text-sm border border-purple-500/30">
                  {mysteries.type}
                </span>
              </div>
              <ul className="space-y-2">
                {mysteries.list.map((mystery, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-purple-100 text-sm">
                    <span className="text-amber-400 font-bold mt-0.5">{idx + 1}º</span>
                    <span>{mystery}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Trophy, label: 'Medalhas', value: '3', color: 'amber' },
                { icon: Heart, label: 'Terços', value: '47', color: 'rose' },
                { icon: Star, label: 'Ranking', value: '#3', color: 'blue' }
              ].map((stat, idx) => (
                <div key={idx} className={`bg-${stat.color}-900/20 backdrop-blur-md rounded-2xl p-4 border border-${stat.color}-700/30 text-center`}>
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 text-${stat.color}-400`} />
                  <div className={`text-2xl font-bold text-${stat.color}-300`}>{stat.value}</div>
                  <div className={`text-xs text-${stat.color}-300/70 mt-1 font-sans`}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Prayer Intentions */}
            <div className="bg-gradient-to-br from-rose-900/30 to-red-900/30 backdrop-blur-md rounded-3xl p-6 border border-rose-700/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-300" />
                  <h2 className="text-lg font-semibold text-rose-200 font-sans">Intenções</h2>
                </div>
                <button className="text-rose-300 hover:text-rose-200 text-sm font-sans">+ Adicionar</button>
              </div>
              <div className="space-y-3">
                {intentions.map((intention, idx) => (
                  <div key={idx} className="bg-rose-950/40 rounded-xl p-4 border border-rose-800/30">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-xs text-rose-300 font-sans">{intention.author}</div>
                      <div className="flex items-center gap-1 text-rose-300">
                        <Heart className="w-3 h-3 fill-rose-300" />
                        <span className="text-xs font-sans">{intention.likes}</span>
                      </div>
                    </div>
                    <p className="text-sm text-rose-100">{intention.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-md rounded-3xl p-6 border border-blue-700/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-blue-200 font-sans">Calendário</h2>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-blue-950/60 border border-blue-700/40 rounded-lg px-3 py-2 text-sm text-blue-200 font-sans"
                >
                  <option value="janeiro">Janeiro</option>
                  <option value="fevereiro">Fevereiro</option>
                  <option value="março">Março</option>
                </select>
              </div>
              
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                  <div key={idx} className="text-center text-xs text-blue-400 font-sans font-semibold">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((dayData, idx) => (
                  <div 
                    key={idx}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-sans transition-all ${
                      dayData.participated 
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-900/50' 
                        : 'bg-blue-950/40 border border-blue-800/30 text-blue-400'
                    }`}
                  >
                    {dayData.participated && <Flame className="w-3 h-3 mb-0.5" />}
                    <span className="font-semibold">{dayData.day}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-blue-800/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-300 font-sans">Dias participados este mês:</span>
                  <span className="text-amber-300 font-bold font-sans">12/28</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-md rounded-3xl p-6 border border-amber-700/30">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-6 h-6 text-amber-400" />
                <h2 className="text-xl font-semibold text-amber-200 font-sans">Ranking do Grupo</h2>
              </div>
              
              <div className="space-y-3">
                {ranking.map((person, idx) => (
                  <div 
                    key={idx}
                    className={`rounded-2xl p-4 transition-all ${
                      person.isYou 
                        ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border-2 border-blue-500/50 shadow-lg' 
                        : 'bg-amber-950/30 border border-amber-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold ${
                          idx === 0 ? 'text-yellow-400' : 
                          idx === 1 ? 'text-gray-300' : 
                          idx === 2 ? 'text-amber-600' : 
                          'text-amber-400/50'
                        } font-sans`}>
                          #{idx + 1}
                        </div>
                        <div className="text-3xl">{person.avatar}</div>
                        <div>
                          <div className={`font-semibold font-sans ${person.isYou ? 'text-blue-200' : 'text-amber-200'}`}>
                            {person.name}
                          </div>
                          <div className="text-xs text-amber-400/70 font-sans">
                            {person.streak} dias consecutivos
                          </div>
                        </div>
                      </div>
                      <Flame className={`w-6 h-6 ${person.streak > 30 ? 'text-orange-400 animate-pulse' : 'text-amber-400'}`} />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-amber-950/20 rounded-xl border border-amber-700/30">
                <p className="text-xs text-amber-300/80 text-center font-sans">
                  ✨ Continue rezando para subir no ranking!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rosary' && (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md rounded-3xl p-6 border border-purple-700/30">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-semibold text-purple-200 font-sans">Texto do Terço</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-purple-950/40 rounded-2xl p-5 border border-purple-800/30">
                  <h3 className="font-semibold text-purple-300 mb-3 font-sans">Sinal da Cruz</h3>
                  <p className="text-sm text-purple-100 leading-relaxed">
                    Pelo sinal da Santa Cruz, livrai-nos, Deus Nosso Senhor, dos nossos inimigos. 
                    Em nome do Pai, do Filho e do Espírito Santo. Amém.
                  </p>
                </div>
                
                <div className="bg-purple-950/40 rounded-2xl p-5 border border-purple-800/30">
                  <h3 className="font-semibold text-purple-300 mb-3 font-sans">Oferecimento</h3>
                  <p className="text-sm text-purple-100 leading-relaxed">
                    Divino Jesus, nós Vos oferecemos este terço que vamos rezar, 
                    meditando nos mistérios da Vossa Redenção...
                  </p>
                </div>
                
                <div className="bg-purple-950/40 rounded-2xl p-5 border border-purple-800/30">
                  <h3 className="font-semibold text-purple-300 mb-3 font-sans">Creio</h3>
                  <p className="text-sm text-purple-100 leading-relaxed">
                    Creio em Deus Pai todo-poderoso, criador do céu e da terra...
                  </p>
                </div>

                <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all font-sans">
                  Ver Orações Completas
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-blue-800/30 z-20">
        <div className="max-w-md mx-auto px-6 py-3">
          <div className="flex justify-around">
            {[
              { id: 'home', icon: Flame, label: 'Início' },
              { id: 'calendar', icon: Calendar, label: 'Calendário' },
              { id: 'ranking', icon: Trophy, label: 'Ranking' },
              { id: 'rosary', icon: BookOpen, label: 'Terço' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600/20 text-blue-300'
                    : 'text-blue-400/60 hover:text-blue-300'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-sans font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Crimson Pro', serif;
        }
        
        .font-sans {
          font-family: 'Inter', sans-serif;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}