"use client";
import { uploadToS3 } from "@/lib/s3";
import { InboxIcon } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function FileUpload() {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > MAX_FILE_SIZE) {
        // todo: replace this alert with CSS Alert
        alert("please upload a smaller file");
        return;
      }
      try {
        const data = await uploadToS3(file);
        console.log("data", data);
      } catch (err) {
        console.log(err);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        <>
          <InboxIcon className="w-10 h-10 text-blue-500" />
          <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
        </>
      </div>
    </div>
  );
}

export default FileUpload;
