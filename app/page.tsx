'use client';

import React, { useState } from 'react';

interface Task {
  id: number;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export default function DocketPremiumPortal() {
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>('client');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [trainingTab, setTrainingTab] = useState<'employee' | 'customer'>('employee');
  const [user, setUser] = useState<{ name: string; tier: string; role: 'client' | 'employee' } | null>(null);
  const [showEmployeeLogin, setShowEmployeeLogin] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: "Hi, I'm Docket's AI assistant. I can help you understand your tasks, navigate the portal, or suggest next steps. How can I help you today?" }
  ]);
  const [aiInput, setAiInput] = useState("");
  
  // Task management state
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Insurance claim follow-up", status: "in-progress" },
    { id: 2, title: "DMV renewal", status: "pending" },
    { id: 3, title: "Subscription audit", status: "completed" },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Automatically create starter tasks based on a typical intake
    const starterTasks: Task[] = [
      { id: Date.now() + 1, title: "Review submitted intake form and prioritize needs", status: "pending" },
      { id: Date.now() + 2, title: "Schedule discovery call with client", status: "pending" },
      { id: Date.now() + 3, title: "Audit current subscriptions and recurring bills", status: "pending" },
      { id: Date.now() + 4, title: "Identify upcoming renewals and deadlines (30/60/90 days)", status: "pending" },
      { id: Date.now() + 5, title: "Prepare personalized support plan for first 30 days", status: "pending" },
    ];

    setTasks(prev => [...starterTasks, ...prev]);

    // Optionally log the user in as a demo client so they can see the new tasks
    if (!user) {
      setUser({ name: "New Client", tier: "Professional", role: "client" });
    }

    alert("Thank you! Your intake has been received and your initial task list has been created. A concierge will review everything and contact you within 24 hours.");
    
    // Scroll to the portal so they can see the new tasks
    setTimeout(() => {
      document.getElementById('dashboards')?.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  };

  const selectPlan = (plan: string) => {
    alert(`Thank you for choosing ${plan}! In the full version this would connect to Stripe. Your subscription is being set up.`);
  };

  const login = () => {
    setUser({ name: "User", tier: "Professional", role: "client" });
    setShowLogin(false);
    setActiveTab('client');
    setTimeout(() => {
      document.getElementById('dashboards')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const employeeLogin = () => {
    setUser({ name: "Concierge Team", tier: "Internal", role: "employee" });
    setShowEmployeeLogin(false);
    setShowTraining(true);
    setTrainingTab('employee');
  };

  const signup = (name: string) => {
    setUser({ name, tier: "Professional", role: "client" });
    setShowSignup(false);
    setActiveTab('client');
    setTimeout(() => {
      document.getElementById('dashboards')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    alert(`Welcome aboard, ${name.split(' ')[0]}! Your personalized support plan is being prepared.`);
  };

  // Task functions
  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      status: "pending"
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };

  const updateTaskStatus = (id: number, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const sendAIMessage = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiInput("");

    // Show a temporary thinking message
    setAiMessages(prev => [...prev, { role: 'assistant', text: "Thinking..." }]);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...aiMessages.filter(m => m.role !== 'assistant' || m.text !== "Thinking...").map(m => ({
              role: m.role,
              content: m.text
            })),
            { role: 'user', content: userMsg }
          ]
        }),
      });

      const data = await response.json();
      const reply = data.reply || "I couldn't generate a response right now.";

      // Replace the "Thinking..." message with the real reply
      setAiMessages(prev => {
        const withoutThinking = prev.filter(m => m.text !== "Thinking...");
        return [...withoutThinking, { role: 'assistant', text: reply }];
      });
    } catch (error) {
      setAiMessages(prev => {
        const withoutThinking = prev.filter(m => m.text !== "Thinking...");
        return [...withoutThinking, { role: 'assistant', text: "Sorry, I ran into a connection issue. Please try again." }];
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0A2540] rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">⚓</span>
            </div>
            <div>
              <span className="text-3xl font-bold tracking-tighter text-[#0A2540]">Docket</span>
              <span className="text-[10px] text-teal-600 font-medium tracking-[2px] block -mt-1">SAFE HARBOR</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#hero" className="hover:text-teal-600 transition">Home</a>
            <a href="#intake" className="hover:text-teal-600 transition">Get Started</a>
            <a href="#pricing" className="hover:text-teal-600 transition">Pricing</a>
            <a href="#dashboards" className="hover:text-teal-600 transition">Portal</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (user?.role === 'employee') {
                  setShowTraining(true);
                  setTrainingTab('employee');
                } else {
                  setShowEmployeeLogin(true);
                }
              }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-800 hover:text-teal-700 hover:bg-teal-50 rounded-2xl transition"
            >
              <span>📚</span> {user?.role === 'employee' ? 'Employee Portal' : 'Training'}
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-950">Hi, {user.name.split(' ')[0]}</span>
                <button onClick={() => setUser(null)} className="text-sm px-4 py-2 text-red-600 hover:bg-red-50 rounded-2xl">Sign out</button>
              </div>
            ) : (
              <>
                <button onClick={() => setShowLogin(true)} className="px-5 py-2.5 text-sm font-semibold hover:bg-slate-100 rounded-2xl transition">Log in</button>
                <button onClick={() => setShowSignup(true)} className="px-6 py-2.5 bg-[#0A2540] hover:bg-teal-600 text-white text-sm font-semibold rounded-2xl transition">Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero with Boat Sunset */}
      <section id="hero" className="min-h-[92vh] flex items-center relative bg-cover bg-center" 
               style={{ backgroundImage: "linear-gradient(rgba(10, 37, 64, 0.85), rgba(10, 37, 64, 0.92)), url('/sunset-dock.jpg')" }}>
        <div className="max-w-5xl mx-auto px-6 text-center text-white relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-md px-5 py-2 rounded-3xl text-sm mb-6 border border-white/40 shadow-lg">
            <span>⚓</span> <span className="font-semibold tracking-wide">Premium life admin for busy professionals</span>
          </div>
          
          <h1 className="text-7xl md:text-8xl font-bold tracking-tighter leading-none mb-6 drop-shadow-lg">
            Dock your life<br />into calm.
          </h1>
          
          <p className="text-2xl md:text-3xl text-white max-w-2xl mx-auto mb-10 font-light tracking-tight drop-shadow-md">
            Premium AI + human concierge that handles the chaos so you can enjoy the journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => document.getElementById('intake')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-10 py-5 bg-white text-[#0A2540] text-lg font-semibold rounded-3xl hover:bg-slate-100 transition flex items-center justify-center gap-3">
              ⚓ Start Your Intake
            </button>
            <button onClick={() => document.getElementById('dashboards')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-10 py-5 border-2 border-white/70 hover:bg-white/10 text-lg font-semibold rounded-3xl transition">
              Explore the Portal
            </button>
          </div>
          <p className="mt-8 text-sm text-white/90 font-medium">Trusted by executives • Tesla network • Thunderbird alumni</p>
        </div>
      </section>

      {/* Intake Form */}
      <section id="intake" className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <span className="px-4 py-1.5 bg-teal-100 text-teal-700 text-sm font-semibold rounded-3xl">START HERE</span>
          <h2 className="text-5xl font-bold tracking-tight mt-3 text-slate-900">Tell us about your journey</h2>
          <p className="text-xl text-slate-800 mt-2">Share a few details and we’ll design a tailored support plan for you.</p>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-xl border">
          <form onSubmit={handleIntakeSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-900">Full Name</label>
                <input type="text" className="w-full border rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-700" placeholder="Your Name" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-900">Email</label>
                <input type="email" className="w-full border rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-700" placeholder="you@company.com" required />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-3 text-slate-900">What administrative tasks are currently anchoring most of your time?</label>
              <div className="grid grid-cols-2 gap-3">
                {['Insurance & renewals', 'Bills & subscriptions', 'Scheduling & coordination', 'Document & form chaos'].map((item, i) => (
                  <label key={i} className="flex items-center gap-3 p-4 border rounded-2xl cursor-pointer hover:bg-slate-50 text-slate-900">
                    <input type="checkbox" className="accent-teal-600" /> <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-900">Biggest pain point (optional)</label>
              <textarea className="w-full border rounded-3xl px-5 py-4 h-24 text-slate-900 placeholder:text-slate-700" placeholder="I spend weekends buried in paperwork and insurance follow-ups..."></textarea>
            </div>

            <button type="submit" className="w-full bg-[#0A2540] hover:bg-teal-600 transition text-white font-semibold py-5 rounded-3xl text-lg flex items-center justify-center gap-3">
              ⚓ Submit & Book Discovery Call
            </button>
          </form>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white py-16 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold tracking-tight text-slate-900">Choose your harbor</h2>
            <p className="text-xl text-slate-950 mt-2">Flexible. Transparent. Designed for real life.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="border rounded-3xl p-8 docket-card">
              <div className="text-teal-600 font-semibold">STARTER</div>
              <div className="mt-1"><span className="text-6xl font-bold">$220</span><span className="text-xl text-slate-900">/mo</span></div>
              <ul className="mt-8 space-y-3 text-sm">
                <li>✓ Up to 8 hours admin support</li>
                <li>✓ Core bill & subscription management</li>
                <li>✓ Monthly summary report</li>
              </ul>
              <button onClick={() => selectPlan('Starter')} className="mt-8 w-full border py-4 rounded-2xl font-semibold hover:bg-slate-50">Choose Starter</button>
            </div>

            <div className="border-2 border-teal-600 rounded-3xl p-8 relative docket-card">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-bold px-6 py-1 rounded-full">MOST POPULAR</div>
              <div className="text-teal-600 font-semibold">PROFESSIONAL</div>
              <div className="mt-1"><span className="text-6xl font-bold">$450</span><span className="text-xl text-slate-900">/mo</span></div>
              <ul className="mt-8 space-y-3 text-sm">
                <li>✓ Up to 15 hours admin support</li>
                <li>✓ Full insurance claims support</li>
                <li>✓ Dedicated concierge</li>
                <li>✓ Detailed monthly insights</li>
              </ul>
              <button onClick={() => selectPlan('Professional')} className="mt-8 w-full bg-teal-600 text-white py-4 rounded-2xl font-semibold">Choose Professional</button>
            </div>

            <div className="border rounded-3xl p-8 docket-card">
              <div className="text-teal-600 font-semibold">EXECUTIVE</div>
              <div className="mt-1"><span className="text-6xl font-bold">$780</span><span className="text-xl text-slate-900">/mo</span></div>
              <ul className="mt-8 space-y-3 text-sm">
                <li>✓ Up to 25 hours priority support</li>
                <li>✓ Quarterly strategy calls</li>
                <li>✓ Senior dedicated concierge</li>
              </ul>
              <button onClick={() => selectPlan('Executive')} className="mt-8 w-full border py-4 rounded-2xl font-semibold hover:bg-slate-50">Choose Executive</button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboards with Full Task Management */}
      <section id="dashboards" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold tracking-tight text-slate-900">The Docket Portal</h2>
          <p className="text-xl text-slate-950">Your calm command center. Simple. Powerful. Yours.</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white p-1 rounded-3xl shadow-sm border">
            <button 
              onClick={() => setActiveTab('client')}
              className={`px-8 py-3 rounded-3xl font-semibold transition ${activeTab === 'client' ? 'bg-teal-100 text-teal-700' : ''}`}>
              Client View
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`px-8 py-3 rounded-3xl font-semibold transition ${activeTab === 'admin' ? 'bg-teal-100 text-teal-700' : ''}`}>
              Concierge View
            </button>
          </div>
        </div>

        {/* Client Dashboard with Task Management */}
        {activeTab === 'client' && (
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-4xl">🚤</div>
                <div>
                  <div className="font-semibold text-2xl">Welcome back, {user?.name || 'User'}</div>
                  <div className="text-teal-600">Docked • {user?.tier || 'Professional'} Tier</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-900">This month</div>
                <div className="text-4xl font-bold text-teal-600">47 hrs</div>
                <div className="text-xs text-emerald-600">saved</div>
              </div>
            </div>

            {/* Task Management Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="font-semibold text-xl">Your Tasks</div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTaskTitle} 
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add new task..." 
                    className="border rounded-2xl px-4 py-2 text-sm w-64"
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  />
                  <button 
                    onClick={addTask}
                    className="px-6 py-2 bg-teal-600 text-white rounded-2xl text-sm font-semibold hover:bg-teal-700"
                  >
                    + Add Task
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-900">No tasks yet. Add one above!</div>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-2xl hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={task.status === 'completed'}
                          onChange={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                          className="accent-teal-600 w-5 h-5"
                        />
                        <span className={task.status === 'completed' ? 'line-through text-slate-600' : ''}>
                          {task.title}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                          task.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-950'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <select 
                          value={task.status} 
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                          className="text-xs border rounded-xl px-3 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Wins and Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-2xl p-6">
                <div className="font-semibold mb-4">This Month's Wins</div>
                <div className="space-y-2 text-sm">
                  • Saved $312 on duplicate subscriptions<br />
                  • Resolved insurance dispute in 9 days<br />
                  • 3 appointments scheduled proactively
                </div>
              </div>
              <div className="border rounded-2xl p-6">
                <div className="font-semibold mb-4">Quick Actions</div>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-sm">Request new task</button>
                  <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-sm">Message your concierge</button>
                  <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-sm">View full monthly report</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Dashboard */}
        {activeTab === 'admin' && (
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between mb-8">
              <div>
                <div className="font-semibold text-2xl">Concierge Command Center</div>
                <div className="text-teal-600">12 active clients • 47 tasks in flight</div>
              </div>
              <button className="px-6 py-3 bg-[#0A2540] text-white rounded-2xl text-sm font-semibold">+ New Client</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-900">
                    <th className="py-4 pr-6">Client</th>
                    <th className="py-4 pr-6">Tier</th>
                    <th className="py-4 pr-6">Active Tasks</th>
                    <th className="py-4 pr-6">Last Update</th>
                    <th className="py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-5 pr-6 font-medium">Alex Rivera</td>
                    <td className="py-5 pr-6"><span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">Professional</span></td>
                    <td className="py-5 pr-6">3</td>
                    <td className="py-5 pr-6 text-xs text-slate-900">Today 2:14pm</td>
                    <td className="py-5"><button className="text-teal-600 text-xs font-medium">Manage</button></td>
                  </tr>
                  <tr>
                    <td className="py-5 pr-6 font-medium">Jordan Patel</td>
                    <td className="py-5 pr-6"><span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">Executive</span></td>
                    <td className="py-5 pr-6">7</td>
                    <td className="py-5 pr-6 text-xs text-slate-900">Yesterday</td>
                    <td className="py-5"><button className="text-teal-600 text-xs font-medium">Manage</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]" onClick={() => setShowLogin(false)}>
          <div className="bg-white rounded-3xl p-10 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-3xl font-bold mb-6 text-center">Welcome back to calm</h3>
            <form onSubmit={(e) => { e.preventDefault(); login(); }}>
              <input type="email" placeholder="Email" className="w-full border rounded-2xl px-6 py-4 mb-4" defaultValue="demo@docket.com" />
              <input type="password" placeholder="Password" className="w-full border rounded-2xl px-6 py-4 mb-6" defaultValue="demo123" />
              <button type="submit" className="w-full bg-[#0A2540] text-white py-4 rounded-2xl font-semibold">Sign In</button>
            </form>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]" onClick={() => setShowSignup(false)}>
          <div className="bg-white rounded-3xl p-10 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-3xl font-bold mb-6 text-center">Ready to get started?</h3>
            <form onSubmit={(e) => { e.preventDefault(); signup((e.target as any)[0].value); }}>
              <input type="text" placeholder="Full Name" className="w-full border rounded-2xl px-6 py-4 mb-4" defaultValue="Alex Rivera" required />
              <input type="email" placeholder="Work Email" className="w-full border rounded-2xl px-6 py-4 mb-6" defaultValue="alex@tesla-demo.com" required />
              <button type="submit" className="w-full bg-[#0A2540] text-white py-4 rounded-2xl font-semibold">Create My Harbor Account</button>
            </form>
          </div>
        </div>
      )}


      {/* Training Portal Modal */}
      {showTraining && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={() => setShowTraining(false)}>
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-[#0A2540] text-white px-8 py-6 flex justify-between items-center">
              <div>
                <div className="text-sm text-teal-300 font-medium tracking-wide">DOCKET ACADEMY</div>
                <h3 className="text-2xl font-bold mt-1">
                  {user?.role === 'employee' ? 'Employee Training Portal' : 'Training & Navigation Guides'}
                </h3>
                {user?.role === 'employee' && (
                  <div className="text-xs text-teal-200 mt-1">Signed in as team member</div>
                )}
              </div>
              <button onClick={() => setShowTraining(false)} className="text-white/70 hover:text-white text-3xl leading-none">&times;</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setTrainingTab('employee')}
                className={`flex-1 py-4 text-sm font-semibold transition ${trainingTab === 'employee' ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50' : 'text-slate-700 hover:text-slate-950'}`}
              >
                👥 Employee Training
              </button>
              <button
                onClick={() => setTrainingTab('customer')}
                className={`flex-1 py-4 text-sm font-semibold transition ${trainingTab === 'customer' ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50' : 'text-slate-700 hover:text-slate-950'}`}
              >
                🧭 Customer How to Navigate
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[60vh]">
              {trainingTab === 'employee' ? (
                <div className="space-y-6">
                  <p className="text-slate-800 text-sm leading-relaxed">
                    Internal training modules for Docket concierges and operations team. Complete these to deliver a consistent, high-quality client experience.
                  </p>

                  {/* Module cards */}
                  <div className="grid gap-4">
                    <div className="border rounded-2xl p-5 hover:border-teal-300 transition">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-2xl shrink-0">1</div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">New Client Onboarding</div>
                          <p className="text-sm text-slate-800 mt-1">How to welcome a new client, run the discovery call, and set clear expectations in the first 7 days.</p>
                          <button className="mt-3 text-sm font-medium text-teal-700 hover:underline">Open Guide →</button>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-2xl p-5 hover:border-teal-300 transition">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-2xl shrink-0">2</div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">Task Ownership & Updates</div>
                          <p className="text-sm text-slate-800 mt-1">Best practices for taking ownership of tasks, providing proactive updates, and closing the loop with clients.</p>
                          <button className="mt-3 text-sm font-medium text-teal-700 hover:underline">Open Guide →</button>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-2xl p-5 hover:border-teal-300 transition">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-2xl shrink-0">3</div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">Handling Sensitive Information</div>
                          <p className="text-sm text-slate-800 mt-1">Secure handling of logins, documents, and personal data. What never to store and how to communicate carefully.</p>
                          <button className="mt-3 text-sm font-medium text-teal-700 hover:underline">Open Guide →</button>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-2xl p-5 hover:border-teal-300 transition">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-2xl shrink-0">4</div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">Escalation & Edge Cases</div>
                          <p className="text-sm text-slate-800 mt-1">When to escalate, how to handle difficult situations, and maintaining the Docket standard under pressure.</p>
                          <button className="mt-3 text-sm font-medium text-teal-700 hover:underline">Open Guide →</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-slate-800 text-sm leading-relaxed">
                    Simple guides to help clients get the most out of the Docket platform. Share these during onboarding or when a client asks “How do I…?”
                  </p>

                  <div className="grid gap-4">
                    <div className="border rounded-2xl p-5 hover:border-teal-300 transition">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shrink-0">🧭</div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">Getting Started in the Portal</div>
                          <p className="text-sm text-slate-800 mt-1">How to log in, view your tasks, message your concierge, and understand your dashboard at a glance.</p>
                          <button className="mt-3 text-sm font-medium text-teal-700 hover:underline">View Guide →</button>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-2xl p-5 hover:border-teal-300 transition">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shrink-0">✅</div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">Adding & Tracking Tasks</div>
                          <p className="text-sm text-slate-800 mt-1">How to submit new requests, update status, and see what’s in progress versus completed.</p>
                          <button className="mt-3 text-sm font-medium text-teal-700 hover:underline">View Guide →</button>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-2xl p-5 hover:border-teal-300 transition">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shrink-0">💬</div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">Messaging Your Concierge</div>
                          <p className="text-sm text-slate-800 mt-1">Best ways to communicate requests, share documents, and get timely responses.</p>
                          <button className="mt-3 text-sm font-medium text-teal-700 hover:underline">View Guide →</button>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-2xl p-5 hover:border-teal-300 transition">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shrink-0">📄</div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">Monthly Reports & Wins</div>
                          <p className="text-sm text-slate-800 mt-1">How to view your monthly summary, hours saved, and key accomplishments.</p>
                          <button className="mt-3 text-sm font-medium text-teal-700 hover:underline">View Guide →</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t px-8 py-4 bg-slate-50 text-center text-xs text-slate-700">
              Real video tutorials can be linked here once recorded. These guides keep the experience consistent and professional.
            </div>
          </div>
        </div>
      )}


      {/* Employee Login Modal */}
      {showEmployeeLogin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]" onClick={() => setShowEmployeeLogin(false)}>
          <div className="bg-white rounded-3xl p-10 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">⚓</div>
              <h3 className="text-2xl font-bold text-[#0A2540]">Employee Portal</h3>
              <p className="text-sm text-slate-700 mt-2">Sign in to access internal training and tools</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); employeeLogin(); }}>
              <input type="email" placeholder="Work email" className="w-full border rounded-2xl px-6 py-4 mb-4" defaultValue="team@docket.com" />
              <input type="password" placeholder="Password" className="w-full border rounded-2xl px-6 py-4 mb-6" defaultValue="docket2026" />
              <button type="submit" className="w-full bg-[#0A2540] hover:bg-teal-700 text-white py-4 rounded-2xl font-semibold transition">
                Sign in as Employee
              </button>
            </form>
            <p className="text-xs text-center text-slate-600 mt-6">
              For Docket team members only. Client accounts use the regular Log in button.
            </p>
          </div>
        </div>
      )}


      {/* Floating AI Assistant Button + Chat Panel */}
      <div className="fixed bottom-6 right-6 z-[90]">
        {showAIChat ? (
          <div className="bg-white rounded-3xl shadow-2xl border w-[360px] max-w-[calc(100vw-3rem)] overflow-hidden flex flex-col" style={{height: '480px'}}>
            <div className="bg-[#0A2540] px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl text-white">⛵</span>
                <div>
                  <div className="font-semibold text-sm text-white">Dockside Assistant</div>
                  <div className="text-[11px] text-teal-300">Your first mate on the journey</div>
                </div>
              </div>
              <button onClick={() => setShowAIChat(false)} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-white border text-slate-900'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t bg-white flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()}
                placeholder="Ask anything about Docket..."
                className="flex-1 border rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button onClick={sendAIMessage} className="bg-[#0A2540] hover:bg-teal-700 text-white px-4 rounded-2xl text-sm font-semibold transition">
                Send
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAIChat(true)}
            className="bg-[#0A2540] hover:bg-teal-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition hover:scale-105"
            title="Open Dockside Assistant"
          >
            ⛵
          </button>
        )}
      </div>

      <footer className="bg-[#0A2540] text-white/80 py-12 text-center text-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-center items-center gap-3 mb-4">
            <span className="text-2xl">⚓</span>
            <span className="text-white text-xl font-semibold">Docket</span>
          </div>
          <p>Your life, carefully managed. Premium concierge support for professionals who value their time.</p>
          <div className="mt-4 text-xs">© 2026 Docket by Corbin Craik • Helping professionals reclaim their time</div>
        </div>
      </footer>
    </div>
  );
}
