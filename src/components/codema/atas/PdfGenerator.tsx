import React from "react";

interface PdfGeneratorProps {
  ata: unknown;
  onPdfGenerated: () => void;
}

const PdfGenerator: React.FC<PdfGeneratorProps> = () => (
  <div className="p-4">
    <p>PdfGenerator component - em desenvolvimento</p>
  </div>
);

export default PdfGenerator;
