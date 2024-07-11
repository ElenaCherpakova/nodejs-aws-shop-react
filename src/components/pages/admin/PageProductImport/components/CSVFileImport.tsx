import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";
import { useAlert } from "~/components/AlertContext";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File | "">();

  const setAlert = useAlert();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
      setAlert(null);
    }
  };

  const removeFile = () => {
    setFile(undefined);
    setAlert(null);
  };

  const uploadFile = async () => {
    // Get the presigned URL
    if (file) {
      const authorization = localStorage.getItem("authorization_token");
      if (!authorization) {
        return setAlert({
          type: "error",
          text: "Unauthorized: Please check your credentials.",
        });
      }
      try {
        const { data } = await axios.get(url, {
          headers: {
            Authorization: `Basic ${authorization}`,
          },
          params: {
            name: encodeURIComponent(file.name),
          },
        });

        const preSignedUrl = data.url;
        const result = await fetch(preSignedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": "text/csv",
          },
        });
        if (!result.ok) {
          throw new Error("File upload failed");
        }

        setFile("");
        setAlert({ type: "success", text: "File uploaded successfully" });
      } catch (error) {
        setAlert({ type: "error", text: "File upload failed" });
      }
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
