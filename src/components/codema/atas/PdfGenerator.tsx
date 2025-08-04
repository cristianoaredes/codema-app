import { useState } from "react";
// ...imports unchanged

interface PdfGeneratorProps {
  ata: any;
  onPdfGenerated: (url: string) => void;
}

export function PdfGenerator({ ata, onPdfGenerated }: PdfGeneratorProps) {
  // ...unchanged

  // Fix: cast to string for downloadPdf
  function downloadPdf(pdfUrl: string, numero: string) {
    // Em produção, fazer download real do storage
    const link = document.createElement('a');
    link.href = String(pdfUrl);
    link.download = `ata-${numero.replace('/', '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ...rest of file unchanged
}