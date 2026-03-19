'use client';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import { useBudgetStore } from '@/stores/budgetStore';
import { useWizardStore } from '@/stores/wizardStore';
import React from 'react';

interface PdfProps {
  filename: string;
  className?: string;
  vendorData?: Record<string, any[]>;
}

export default function ExportPdfButton({ filename, className, vendorData }: PdfProps) {
  const { input } = useWizardStore();
  const { totalLow, totalMid, totalHigh, breakdown, confidence } = useBudgetStore();

  const handleExportPDF = () => {
    const doc = new jsPDF() as any; // Cast internally if types don't merge autoTable magically

    // Theme colors
    const maroon: [number, number, number] = [154, 33, 67];
    const gold: [number, number, number] = [212, 175, 55];
    const textDark: [number, number, number] = [45, 45, 45];
    const textMuted: [number, number, number] = [100, 100, 100];

    // ── PAGE 1: HEADER ──
    doc.setFillColor(...maroon);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("WeddingBudget.ai", 15, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...gold);
    doc.text("Professional Wedding Cost Estimate", 15, 28);

    // ── EVENT DETAILS ──
    doc.setTextColor(...textDark);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Event Overview", 15, 55);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textMuted);

    const cityStr = input.city ? input.city.charAt(0).toUpperCase() + input.city.slice(1) : 'Destination';
    const eventsStr = input.events && input.events.length > 0
      ? input.events.map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ')
      : 'N/A';

    doc.text(`Location: ${cityStr}`, 15, 65);
    doc.text(`Guests: ${input.guest_count || 0}`, 15, 72);
    doc.text(`Rooms: ${input.room_count || 0}`, 100, 72);
    doc.text(`Events: ${eventsStr}`, 15, 79);

    // ── BUDGET SUMMARY ──
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textDark);
    doc.text("Estimated Totals (INR)", 15, 95);

    autoTable(doc, {
      startY: 100,
      head: [['Conservative', 'Recommended', 'Premium', 'AI Confidence']],
      body: [
        [
          `Rs. ${(totalLow / 100000).toFixed(2)} Lakhs`,
          `Rs. ${(totalMid / 100000).toFixed(2)} Lakhs`,
          `Rs. ${(totalHigh / 100000).toFixed(2)} Lakhs`,
          `${Math.round(confidence * 100)}%`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { halign: 'center', fontSize: 11, cellPadding: 6 }
    });

    // ── BREAKDOWN TABLE ──
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textDark);
    const yAfterSummary = (doc as any).lastAutoTable.finalY + 15;
    doc.text("Category Breakdown", 15, yAfterSummary);

    const breakdownData = Object.values(breakdown || {}).map((cat: any) => [
      cat.name,
      `Rs. ${(cat.low / 100000).toFixed(1)}L - Rs. ${(cat.high / 100000).toFixed(1)}L`,
      cat.details || '-'
    ]);

    autoTable(doc, {
      startY: yAfterSummary + 5,
      head: [['Category', 'Est. Range', 'AI Assessment Notes']],
      body: breakdownData,
      theme: 'striped',
      headStyles: { fillColor: maroon, textColor: [255, 255, 255] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 40 },
        2: { cellWidth: 'auto' }
      },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    // ── PAGE 2: VENDORS ──
    if (vendorData && Object.keys(vendorData).length > 0) {
      doc.addPage();

      doc.setFillColor(...maroon);
      doc.rect(0, 0, 210, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Curated Vendor Recommendations", 15, 16);

      const vendorRows: any[] = [];
      Object.keys(vendorData).forEach(cat => {
        vendorData[cat].forEach((v: any) => {
          vendorRows.push([cat, v.name, `${v.distance_km || 0} km from center`]);
        });
      });

      autoTable(doc, {
        startY: 35,
        head: [['Service Category', 'Vendor Name', 'Distance']],
        body: vendorRows,
        theme: 'grid',
        headStyles: { fillColor: gold, textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 40 }
        }
      });
    }

    doc.save(filename);
  };

  return (
    <button className={className || "btn-primary"} onClick={handleExportPDF}>
      <Download size={16} /> Save Professional PDF
    </button>
  );
}
