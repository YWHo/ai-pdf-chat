import React from "react";

type Props = {
  pdfUrl: string;
};

function PDFViewer({ pdfUrl }: Props) {
  const fullPath = `https://docs.google.com/gview?url=${pdfUrl}&embedded=true`;
  // console.log("\n--- fullpath:\n", fullPath);
  return (
    <iframe
      src={fullPath}
      sandbox="allow-same-origin allow-presentation allow-scripts"
      className="w-full h-full"
    ></iframe>
  );
}

export default PDFViewer;
