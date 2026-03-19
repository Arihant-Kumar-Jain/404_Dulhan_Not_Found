'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
import React from 'react';

export default function ExportPdfButton({ targetRef, filename }: { targetRef: React.RefObject<HTMLDivElement | null>, filename: string }) {
  const handleExportPDF = async () => {
    if (!targetRef.current) return;
    
    const canvas = await html2canvas(targetRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  };

  return (
    <button className="btn-primary" onClick={handleExportPDF}>
      <Download size={16} /> Save PDF
    </button>
  );
}
