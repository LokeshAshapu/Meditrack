import React, { useState, useEffect } from "react";
import { Shield, HardDrive, Lock, Download, CheckCircle, Info, FileText, Activity } from "lucide-react";
import localforage from "localforage";
import { authFetch } from "../../utils/api";
import { MEDITRACK_VERSION } from "../../version";

function PrivacyCenter() {
    const [consents, setConsents] = useState([]);
    const [exportStatus, setExportStatus] = useState("");

    useEffect(() => {
        fetchConsents();
    }, []);

    const fetchConsents = async () => {
        try {
            const res = await authFetch('/api/user/consent');
            const data = await res.json();
            if (res.ok) setConsents(data.consents || []);
        } catch (e) { console.error("Error fetching consents", e); }
    };

    const handleToggleConsent = async (consentType, currentStatus) => {
        try {
            const res = await authFetch('/api/user/consent', {
                method: "POST",
                body: JSON.stringify({ consentType, granted: !currentStatus })
            });
            if (res.ok) fetchConsents();
        } catch (e) { alert("Failed to update consent preference."); }
    };

    const handleExportData = async () => {
        setExportStatus("Packaging your data...");
        try {
            const email = localStorage.getItem("userEmail") || "patient";
            const localRecords = await localforage.getItem(`medicalRecords_${email}`) || [];
            
            // Fetch trackers
            let trackers = [];
            try {
                const res = await authFetch('/get-tracker');
                const data = await res.json();
                if (res.ok) trackers = data.data || [];
            } catch (e) {}

            const exportPayload = {
                exportMetadata: {
                    user: email,
                    exportedAt: new Date().toISOString(),
                    appVersion: MEDITRACK_VERSION.version,
                    notice: "Designed to minimize centralized storage. Sensitive vault files are stored strictly on device."
                },
                localVaultRecordsCount: localRecords.length,
                medicationSchedules: trackers,
                localVaultRecords: localRecords.map(r => ({ title: r.title, category: r.category, uploadedAt: r.uploadedAt }))
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `meditrack-data-export-${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            setExportStatus("Export downloaded successfully!");
            setTimeout(() => setExportStatus(""), 3000);
        } catch (e) {
            setExportStatus("Failed to export data.");
        }
    };

    const consentTypes = [
        { id: "ai_assistant", label: "Medical AI Assistant Interaction", desc: "Allows educational health guidance proxy processing." },
        { id: "telemedicine", label: "WebRTC Consultation Session Logs", desc: "Allows booking non-predictable Jitsi room links with verified doctors." },
        { id: "notifications", label: "Multi-Channel Notification Escalation", desc: "Allows sending Push, SMS, and Voice alerts for missed medications." },
        { id: "pilot_participation", label: "Anonymized Pilot KPI Analytics", desc: "Allows including adherence totals in institutional research metrics." }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pb-16 pt-24 px-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="text-cyan-500" size={32} />
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">MediTrack Privacy Center & Data Control</h1>
                </div>
                <p className="text-slate-500 text-sm">
                    Transparent privacy controls, local-first data architecture details, and explicit consent management.
                </p>
            </div>

            {/* Architecture Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <HardDrive className="text-cyan-500 mb-3" size={28} />
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">Local-First Medical Vault</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Prescriptions, scans, and lab reports remain encrypted strictly inside your browser's IndexedDB storage. Raw medical files are zero-cloud leakage.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <Lock className="text-purple-500 mb-3" size={28} />
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">Client-Side E2EE Chat</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Patient-doctor messages are encrypted client-side using AES-256 before transmission to backend servers.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <Activity className="text-blue-500 mb-3" size={28} />
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">Minimal Cloud State</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Backend stores minimal necessary state: medication reminder schedules, adherence log counts, and appointment statuses.
                    </p>
                </div>
            </div>

            {/* Data Export Center */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Download className="text-cyan-500" size={20} /> Export Personal Application Data
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Download a copy of your medication schedules, log history, and vault index.</p>
                    </div>
                    <button
                        onClick={handleExportData}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                    >
                        <Download size={16} /> Download JSON Export
                    </button>
                </div>
                {exportStatus && <p className="text-xs text-cyan-600 font-semibold mt-3">{exportStatus}</p>}
            </div>

            {/* Consent Management */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Consent Preferences & Permission History</h3>
                <p className="text-xs text-slate-500 mb-6">Manage optional platform data features and research participation permissions.</p>

                <div className="space-y-4">
                    {consentTypes.map(c => {
                        const activeConsent = consents.find(item => item.consentType === c.id);
                        const isGranted = activeConsent ? activeConsent.granted : true;

                        return (
                            <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{c.label}</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">{c.desc}</p>
                                </div>
                                <button
                                    onClick={() => handleToggleConsent(c.id, isGranted)}
                                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                                        isGranted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-200 text-slate-600'
                                    }`}
                                >
                                    {isGranted ? "✓ Granted" : "Revoked"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default PrivacyCenter;
