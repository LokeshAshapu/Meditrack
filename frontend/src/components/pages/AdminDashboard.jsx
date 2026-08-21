import React, { useState, useEffect } from 'react';
import { 
    User, Check, X, Shield, FileText, AlertCircle, LogOut, BarChart3, Users, 
    Stethoscope, Activity, CheckCircle, Ban, RefreshCw, MessageSquare, HeartPulse, 
    History, Target, Filter, TrendingUp, Layers, Building, Bug, AlertTriangle, 
    Play, Eye, Award, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/api';
import { MEDITRACK_VERSION } from '../../version';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'pilots' | 'funnel' | 'reports' | 'doctors' | 'issues' | 'orgs' | 'demo' | 'observability'
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Core Data States
    const [metrics, setMetrics] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [userFeedback, setUserFeedback] = useState([]);
    const [systemHealth, setSystemHealth] = useState(null);
    
    // V4 Pilot & KPI States
    const [pilots, setPilots] = useState([]);
    const [kpiTimeframe, setKpiTimeframe] = useState("30d");
    const [pilotKpis, setPilotKpis] = useState(null);
    const [activationFunnel, setActivationFunnel] = useState([]);
    const [retentionMetrics, setRetentionMetrics] = useState(null);
    const [patientAdherenceReports, setPatientAdherenceReports] = useState([]);
    const [doctorPerformance, setDoctorPerformance] = useState([]);
    
    // V4 Operations & Issues States
    const [issues, setIssues] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [demoData, setDemoData] = useState(null);

    // Form States
    const [newPilot, setNewPilot] = useState({ name: "", organization: "", targetUsers: 50, targetDoctors: 5 });
    const [newOrg, setNewOrg] = useState({ name: "", contactEmail: "" });
    const [suspendEmailInput, setSuspendEmailInput] = useState("");

    useEffect(() => {
        loadAdminData();
    }, [kpiTimeframe]);

    const loadAdminData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchDoctors(), fetchMetrics(), fetchAuditLogs(), fetchFeedback(), 
                fetchHealth(), fetchPilots(), fetchKpis(), fetchFunnel(), 
                fetchRetention(), fetchAdherenceReports(), fetchDoctorPerformance(),
                fetchIssues(), fetchIncidents(), fetchOrganizations(), fetchDemoData()
            ]);
        } catch (e) {
            console.error("Error loading admin data:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await authFetch('/get-unverified-doctors');
            const data = await res.json();
            if (res.ok) setDoctors(data.doctors || []);
        } catch (e) {}
    };

    const fetchMetrics = async () => {
        try {
            const res = await authFetch('/api/business-metrics');
            const data = await res.json();
            if (res.ok) setMetrics(data.metrics);
        } catch (e) {}
    };

    const fetchAuditLogs = async () => {
        try {
            const res = await authFetch('/get-audit-logs');
            const data = await res.json();
            if (res.ok) setAuditLogs(data.logs || []);
        } catch (e) {}
    };

    const fetchFeedback = async () => {
        try {
            const res = await authFetch('/api/feedback');
            const data = await res.json();
            if (res.ok) setUserFeedback(data.feedback || []);
        } catch (e) {}
    };

    const fetchHealth = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/health`);
            const data = await res.json();
            if (res.ok) setSystemHealth(data);
        } catch (e) {}
    };

    const fetchPilots = async () => {
        try {
            const res = await authFetch('/api/admin/pilots');
            const data = await res.json();
            if (res.ok) setPilots(data.pilots || []);
        } catch (e) {}
    };

    const fetchKpis = async () => {
        try {
            const res = await authFetch(`/api/admin/pilot-kpis?timeframe=${kpiTimeframe}`);
            const data = await res.json();
            if (res.ok) setPilotKpis(data.kpis);
        } catch (e) {}
    };

    const fetchFunnel = async () => {
        try {
            const res = await authFetch('/api/admin/user-activation-funnel');
            const data = await res.json();
            if (res.ok) setActivationFunnel(data.funnel || []);
        } catch (e) {}
    };

    const fetchRetention = async () => {
        try {
            const res = await authFetch('/api/admin/retention-metrics');
            const data = await res.json();
            if (res.ok) setRetentionMetrics(data.retention);
        } catch (e) {}
    };

    const fetchAdherenceReports = async () => {
        try {
            const res = await authFetch('/api/admin/patient-adherence-reports');
            const data = await res.json();
            if (res.ok) setPatientAdherenceReports(data.reports || []);
        } catch (e) {}
    };

    const fetchDoctorPerformance = async () => {
        try {
            const res = await authFetch('/api/admin/doctor-performance');
            const data = await res.json();
            if (res.ok) setDoctorPerformance(data.doctorPerformance || []);
        } catch (e) {}
    };

    const fetchIssues = async () => {
        try {
            const res = await authFetch('/api/admin/issues');
            const data = await res.json();
            if (res.ok) setIssues(data.issues || []);
        } catch (e) {}
    };

    const fetchIncidents = async () => {
        try {
            const res = await authFetch('/api/admin/incidents');
            const data = await res.json();
            if (res.ok) setIncidents(data.incidents || []);
        } catch (e) {}
    };

    const fetchOrganizations = async () => {
        try {
            const res = await authFetch('/api/admin/organizations');
            const data = await res.json();
            if (res.ok) setOrganizations(data.organizations || []);
        } catch (e) {}
    };

    const fetchDemoData = async () => {
        try {
            const res = await authFetch('/api/admin/demo-data');
            const data = await res.json();
            if (res.ok) setDemoData(data);
        } catch (e) {}
    };

    // Actions
    const handleCreatePilot = async (e) => {
        e.preventDefault();
        try {
            const res = await authFetch('/api/admin/pilots', {
                method: "POST",
                body: JSON.stringify(newPilot)
            });
            if (res.ok) {
                alert("Pilot program created successfully!");
                setNewPilot({ name: "", organization: "", targetUsers: 50, targetDoctors: 5 });
                fetchPilots();
            }
        } catch (e) { alert("Failed to create pilot."); }
    };

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        try {
            const res = await authFetch('/api/admin/organizations', {
                method: "POST",
                body: JSON.stringify(newOrg)
            });
            if (res.ok) {
                alert("Clinic organization added!");
                setNewOrg({ name: "", contactEmail: "" });
                fetchOrganizations();
            }
        } catch (e) { alert("Failed to create organization."); }
    };

    const handleUpdateIssueStatus = async (issueId, status) => {
        try {
            const res = await authFetch(`/api/admin/issues/${issueId}`, {
                method: "PATCH",
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchIssues();
        } catch (e) {}
    };

    const handleVerifyDoctor = async (doctorEmail) => {
        if (!confirm("Approve doctor registration?")) return;
        try {
            const res = await authFetch('/verify-doctor', {
                method: "POST",
                body: JSON.stringify({ email: doctorEmail })
            });
            if (res.ok) fetchDoctors();
        } catch (e) {}
    };

    const handleSuspendAccount = async (e) => {
        e.preventDefault();
        if (!suspendEmailInput) return;
        if (!confirm(`Suspend user ${suspendEmailInput}?`)) return;
        try {
            const res = await authFetch('/suspend-user', {
                method: "POST",
                body: JSON.stringify({ email: suspendEmailInput })
            });
            if (res.ok) {
                alert("Account suspended.");
                setSuspendEmailInput("");
                fetchAuditLogs();
            }
        } catch (e) {}
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-16">
            {/* Navigation Header */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <Shield className="text-purple-600" size={24} />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                        MediTrack Commercial & Pilot Control Center
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md">
                        {MEDITRACK_VERSION.version} ({MEDITRACK_VERSION.environment})
                    </span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                    <span className="hidden md:inline font-medium">Logout</span>
                </button>
            </nav>

            <main className="pt-24 px-6 max-w-7xl mx-auto">
                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto pb-2">
                    {[
                        { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
                        { id: 'pilots', label: 'Pilot KPIs', icon: Target },
                        { id: 'funnel', label: 'Activation & Retention', icon: TrendingUp },
                        { id: 'reports', label: 'Patient Adherence', icon: FileText },
                        { id: 'doctors', label: 'Doctor Operations', icon: Stethoscope },
                        { id: 'issues', label: 'Issues & Incidents', icon: Bug },
                        { id: 'orgs', label: 'Multi-Clinic Orgs', icon: Building },
                        { id: 'demo', label: 'Investor Demo Sandbox', icon: Sparkles },
                        { id: 'observability', label: 'Service Observability', icon: HeartPulse }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                                    active 
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Icon size={16} /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* TAB 1: EXECUTIVE OVERVIEW */}
                {activeTab === 'overview' && metrics && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <p className="text-xs font-semibold uppercase text-slate-400">Total Enrolled Patients</p>
                                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{metrics.totalUsers}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <p className="text-xs font-semibold uppercase text-slate-400">Verified Physicians</p>
                                <p className="text-3xl font-extrabold text-emerald-600 mt-1">{metrics.verifiedDoctors}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <p className="text-xs font-semibold uppercase text-slate-400">Total Consultations</p>
                                <p className="text-3xl font-extrabold text-blue-600 mt-1">{metrics.totalAppointments}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <p className="text-xs font-semibold uppercase text-slate-400">Global Adherence Rate</p>
                                <p className="text-3xl font-extrabold text-purple-600 mt-1">{metrics.adherenceRate}</p>
                            </div>
                        </div>

                        {/* Account Security Control */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                                <Ban className="text-red-500" /> Account Security & Suspension Control
                            </h3>
                            <form onSubmit={handleSuspendAccount} className="flex gap-3 max-w-md mt-4">
                                <input
                                    type="email"
                                    required
                                    placeholder="User email to suspend..."
                                    value={suspendEmailInput}
                                    onChange={(e) => setSuspendEmailInput(e.target.value)}
                                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm"
                                />
                                <button type="submit" className="bg-red-600 text-white font-semibold text-xs px-4 py-2 rounded-xl">Suspend</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* TAB 2: PILOT MANAGEMENT & KPIS */}
                {activeTab === 'pilots' && (
                    <div className="space-y-8">
                        {/* Timeframe Filter Bar */}
                        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white">Pilot Performance Metrics</h3>
                            <div className="flex gap-2">
                                {['7d', '30d', '90d', 'all'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setKpiTimeframe(t)}
                                        className={`px-3 py-1.5 rounded-xl font-bold text-xs ${kpiTimeframe === t ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                                    >
                                        {t.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* KPI Display */}
                        {pilotKpis ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <p className="text-xs uppercase text-slate-400 font-semibold">Enrolled Users</p>
                                    <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{pilotKpis.enrolledUsers}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <p className="text-xs uppercase text-slate-400 font-semibold">Completed Consultations</p>
                                    <p className="text-3xl font-extrabold text-blue-600 mt-1">{pilotKpis.completedConsultations}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <p className="text-xs uppercase text-slate-400 font-semibold">Period Adherence Rate</p>
                                    <p className="text-3xl font-extrabold text-purple-600 mt-1">{pilotKpis.adherenceRate}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <p className="text-xs uppercase text-slate-400 font-semibold">Avg Feedback Rating</p>
                                    <p className="text-3xl font-extrabold text-amber-500 mt-1">★ {pilotKpis.avgRating}</p>
                                </div>
                            </div>
                        ) : <div className="text-center py-6 text-slate-400">No data available</div>}

                        {/* Pilot Creation Form */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Create Pilot Program</h3>
                            <form onSubmit={handleCreatePilot} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input
                                    type="text"
                                    required
                                    placeholder="Pilot Name (e.g. Metro Clinic Trial)"
                                    value={newPilot.name}
                                    onChange={(e) => setNewPilot({ ...newPilot, name: e.target.value })}
                                    className="bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-sm"
                                />
                                <input
                                    type="text"
                                    required
                                    placeholder="Organization Name"
                                    value={newPilot.organization}
                                    onChange={(e) => setNewPilot({ ...newPilot, organization: e.target.value })}
                                    className="bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Target Users"
                                    value={newPilot.targetUsers}
                                    onChange={(e) => setNewPilot({ ...newPilot, targetUsers: Number(e.target.value) })}
                                    className="bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-sm"
                                />
                                <button type="submit" className="bg-purple-600 text-white font-bold text-xs py-2.5 rounded-xl">Launch Pilot</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* TAB 3: USER ACTIVATION FUNNEL & RETENTION */}
                {activeTab === 'funnel' && (
                    <div className="space-y-8">
                        {/* Activation Funnel */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Patient Journey Activation Funnel</h3>
                            <div className="space-y-4">
                                {activationFunnel.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <span className="w-48 font-semibold text-sm text-slate-700 dark:text-slate-200">{item.stage}</span>
                                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-6 rounded-full overflow-hidden relative">
                                            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full" style={{ width: item.conversion }}></div>
                                            <span className="absolute right-3 top-1 text-xs font-bold text-slate-600 dark:text-slate-300">{item.count} users ({item.conversion})</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Retention Metrics */}
                        {retentionMetrics && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs uppercase text-slate-400 font-semibold">Day-1 Retention</p>
                                    <p className="text-3xl font-extrabold text-emerald-600 mt-1">{retentionMetrics.day1Retention}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs uppercase text-slate-400 font-semibold">Day-7 Retention</p>
                                    <p className="text-3xl font-extrabold text-blue-600 mt-1">{retentionMetrics.day7Retention}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs uppercase text-slate-400 font-semibold">Day-30 Retention</p>
                                    <p className="text-3xl font-extrabold text-purple-600 mt-1">{retentionMetrics.day30Retention}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: PATIENT ADHERENCE REPORTS */}
                {activeTab === 'reports' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Patient Adherence Report Table</h3>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase font-semibold text-slate-400 border-b">
                                <tr>
                                    <th className="p-4">Patient Email</th>
                                    <th className="p-4">Medications</th>
                                    <th className="p-4">Scheduled</th>
                                    <th className="p-4">Taken</th>
                                    <th className="p-4">Missed</th>
                                    <th className="p-4">Adherence Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patientAdherenceReports.map((rep, idx) => (
                                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-700">
                                        <td className="p-4 font-semibold text-slate-800 dark:text-white">{rep.email}</td>
                                        <td className="p-4">{rep.medicationCount}</td>
                                        <td className="p-4">{rep.scheduledDoses}</td>
                                        <td className="p-4 text-emerald-600 font-bold">{rep.takenDoses}</td>
                                        <td className="p-4 text-red-500">{rep.missedDoses}</td>
                                        <td className="p-4"><span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-700 font-bold text-xs">{rep.adherenceRate}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 5: DOCTOR OPERATIONAL PERFORMANCE */}
                {activeTab === 'doctors' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Doctor Operational Metrics</h3>
                            <span className="text-xs text-slate-400 italic">Operational insights only (No clinical ranking)</span>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase font-semibold text-slate-400 border-b">
                                <tr>
                                    <th className="p-4">Doctor Name</th>
                                    <th className="p-4">Specialization</th>
                                    <th className="p-4">Appointments Received</th>
                                    <th className="p-4">Completed</th>
                                    <th className="p-4">Cancelled</th>
                                    <th className="p-4">Utilization</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctorPerformance.map((doc, idx) => (
                                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-700">
                                        <td className="p-4 font-bold text-slate-800 dark:text-white">{doc.name}</td>
                                        <td className="p-4 text-purple-600 font-medium">{doc.specialization}</td>
                                        <td className="p-4">{doc.appointmentsReceived}</td>
                                        <td className="p-4 text-emerald-600 font-bold">{doc.appointmentsCompleted}</td>
                                        <td className="p-4 text-slate-400">{doc.cancelledAppointments}</td>
                                        <td className="p-4"><span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 font-bold text-xs">{doc.availabilityUtilization}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 6: ISSUES & INCIDENTS */}
                {activeTab === 'issues' && (
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">User Bug & Problem Reports</h3>
                            <div className="space-y-4">
                                {issues.map(iss => (
                                    <div key={iss.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-md">{iss.severity}</span>
                                                <span className="text-xs text-slate-400">{iss.category} • v{iss.appVersion}</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">{iss.description}</p>
                                            <p className="text-xs text-slate-400 mt-1">From: {iss.email}</p>
                                        </div>
                                        <select
                                            value={iss.status}
                                            onChange={(e) => handleUpdateIssueStatus(iss.id, e.target.value)}
                                            className="bg-white dark:bg-slate-800 border text-xs p-2 rounded-xl"
                                        >
                                            <option value="open">Open</option>
                                            <option value="investigating">Investigating</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 7: MULTI-CLINIC ORGS */}
                {activeTab === 'orgs' && (
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Multi-Clinic Tenant Architecture</h3>
                            <form onSubmit={handleCreateOrg} className="flex gap-4 max-w-lg mb-6">
                                <input
                                    type="text"
                                    required
                                    placeholder="Organization Name"
                                    value={newOrg.name}
                                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                                    className="flex-1 bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-sm"
                                />
                                <button type="submit" className="bg-purple-600 text-white font-bold text-xs px-4 rounded-xl">Add Organization</button>
                            </form>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {organizations.map(org => (
                                    <div key={org.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <h4 className="font-bold text-slate-800 dark:text-white">{org.name}</h4>
                                        <p className="text-xs text-purple-600 font-semibold mt-1">Plan: {org.plan}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 8: INVESTOR DEMO SANDBOX */}
                {activeTab === 'demo' && demoData && (
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-purple-200 dark:border-purple-800 shadow-xl space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
                                    <Sparkles /> Investor Pitch Sandbox
                                </h2>
                                <p className="text-xs text-slate-400">{demoData.environmentLabel}</p>
                            </div>
                            <span className="bg-purple-100 text-purple-700 text-xs font-extrabold px-3 py-1 rounded-full uppercase">DEMO MODE ACTIVE</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Market Problem</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{demoData.demoMetrics.problem}</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">MediTrack Solution</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{demoData.demoMetrics.solution}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 9: SERVICE OBSERVABILITY */}
                {activeTab === 'observability' && systemHealth && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Real Service Status Monitor</h3>
                        {Object.entries(systemHealth.services).map(([svc, status]) => (
                            <div key={svc} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                <span className="font-semibold text-sm uppercase text-slate-600 dark:text-slate-300">{svc}</span>
                                <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${
                                    status === 'healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
