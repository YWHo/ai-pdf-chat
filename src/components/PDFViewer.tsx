import React from "react";

type Props = {
  pdfUrl: string;
};

function PDFViewer({ pdfUrl }: Props) {
  return (
    <iframe
      src={`https://docs.google.com/gview?url=${pdfUrl}&embedded=true`}
      sandbox="allow-scripts allow-same-origin"
      className="w-full h-full"
    ></iframe>
  );
}

export default PDFViewer;
