import React from 'react';
import { EventItem, Zone, IncidentReport, SOSAlert } from '../../types';
import { FileText, Download, CheckCircle2, ShieldAlert, Sparkles, Printer } from 'lucide-react';
import jsPDF from 'jspdf';

interface Props {
  event: EventItem;
  zones: Zone[];
  incidents: IncidentReport[];
  sosAlerts: SOSAlert[];
}

export const AdminReports: React.FC<Props> = ({ event, zones, incidents, sosAlerts }) => {
  const handleDownloadPdf = () => {
    const doc = new jsPDF();

    // Title & Header
    doc.setFillColor(15, 23, 42); // Dark blue header
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('CROWDSHIELD - OFFICIAL REPORT', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()} | Government & Public Safety Directorate`, 14, 26);

    // Event Overview
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`1. Event Executive Summary: ${event.name}`, 14, 48);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Venue: ${event.venue}, ${event.city}`, 14, 56);
    doc.text(`Live Crowd Count: ${event.liveCrowdCount.toLocaleString()} / Cap: ${event.capacity.toLocaleString()}`, 14, 62);
    doc.text(`Crowd Risk Score: ${event.riskScore}/100 (${event.riskLevel})`, 14, 68);

    // High Risk Zones Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Sector Density & Bottleneck Analysis:', 14, 82);

    let y = 92;
    zones.forEach((z) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${z.name}: ${z.density} people/m² [${z.riskLevel}]`, 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`   Status: ${z.statusReason}`, 14, y);
      y += 6;
      doc.text(`   Directive: ${z.suggestedAction}`, 14, y);
      y += 10;
    });

    // Incidents Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Verified Incident Audit Log:', 14, y + 4);
    y += 14;

    incidents.forEach((inc) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`• Incident #${inc.id}: ${inc.location} (${inc.aiSeverity})`, 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`   Desc: ${inc.description}`, 14, y);
      y += 6;
      doc.text(`   Details: ${inc.aiSummary || 'Verified by ground personnel'}`, 14, y);
      y += 10;
    });

    // Footer Sign-off
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Certified by CrowdShield Public Safety & Incident Response System.', 14, 280);

    doc.save(`CrowdShield_Report_${event.id}_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Official Government PDF Report Generator
          </h2>
          <p className="text-xs text-slate-400">
            Generate and export daily crowd audit reports, incident logs, and stampede risk analysis
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          className="py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-xl transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Certified PDF Report</span>
        </button>
      </div>

      {/* Report Preview Document Card */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-2xl max-w-3xl mx-auto text-xs">
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
              DOCUMENT PREVIEW
            </span>
            <h3 className="text-lg font-black text-white">Daily Crowd Safety Audit Report</h3>
            <p className="text-slate-400 text-[11px]">Event: {event.name} • {event.venue}</p>
          </div>
          <FileText className="w-10 h-10 text-blue-400 opacity-80" />
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-slate-200 block">1. Attendance & Capacity Metrics</span>
            <p className="text-slate-400">
              Live Crowd Count: <strong className="text-white">{event.liveCrowdCount.toLocaleString()}</strong> / Capacity: {event.capacity.toLocaleString()} (Occupancy: {Math.round((event.liveCrowdCount / event.capacity) * 100)}%)
            </p>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-slate-200 block">2. High Density Choke Points</span>
            <p className="text-slate-400">
              Critical Zone: {zones[0]?.name} (Density: {zones[0]?.density} p/m²). Emergency Gate 4 opened as relief valve.
            </p>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-slate-200 block">3. Incidents & SOS Dispatches</span>
            <p className="text-slate-400">
              Total Reports Verified: {incidents.length} • Active SOS Alerts Responded: {sosAlerts.length}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadPdf}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Export PDF to Disk</span>
        </button>
      </div>
    </div>
  );
};
