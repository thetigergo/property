"use client";
/**
 * Report on the Physical Count of Property, Plant, and Equipment
 * /app/sysadmin/verifyer/[ukid]/page.tsx
 */
import Image from "next/image";
import { useEffect, use, useRef, useState } from "react";
import { FileUpload } from "primereact/fileupload";
import { Fieldset } from "primereact/fieldset";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";

interface Verifyee {
  ngalan: string;
  categoria: string;
  opesina: string;
  preparar: number;
}
interface FileData {
  filepath: string;
  filetype: string;
  physical: string;
}

export default function VerifyerPage({
  params,
}: {
  params: Promise<{ ukid: string }>;
}) {
  const { ukid } = use(params);

  const uploadRef = useRef<FileUpload>(null);
  const toast = useRef<Toast>(null);

  const [employee, setEmployee] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [opesinas, setOpesinas] = useState<string>("");
  const [preparar, setPreparar] = useState<Date>(new Date());
  const [verifyid, setVerifyid] = useState<string>("");
  const [tryagain, setTryagain] = useState<string>("Check PAR/ICS");

  const [checkOn, setCheckOn] = useState<boolean>(false);
  const [notCheck, setNotCheck] = useState<boolean>(true);
  const [grayDocs, setGrayDocs] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(false);

  const [files, setFiles] = useState<FileData[]>([]);

  useEffect(() => {
    const loadDatus = async () => {
      const result = await fetch(
        "/property/api/sysadmin/verifyer/" + ukid + "/uid",
        {
          method: "GET",
        }
      );
      if (!result.ok) throw new Error(`HTTP error! status: ${result.status}`);
      const data: Verifyee = await result.json();
      setEmployee(data.ngalan);
      setCategory(data.categoria);
      setOpesinas(data.opesina);
      setPreparar(new Date(data.preparar));
    };

    loadDatus();
  }, [ukid]);

  const handleClick = async () => {
    // Call your metadata endpoint
    const result = await fetch(
      "/property/api/sysadmin/verifyer/" + ukid + "/uno"
    );
    if (!result.ok) {
      console.error("Failed to fetch list");
      return;
    }

    const data: FileData[] = await result.json();
    setFiles(data); // Store the list of files
    setVisible(true);
  };
  return (
    <>
      <Toast ref={toast} />
      <Fieldset legend="Upload Scanned M.R. to Validate!">
        <div className="flex justify-center" style={{ width: 575 }}>
          <h3 className="text-base font-normal">
            Upload one or more Image Scanned Received Files to Validate HIS/HER
            M. R. document(s).
          </h3>
        </div>
        <table border={0} width="100%" cellSpacing={0} cellPadding={0}>
          <tbody>
            <tr>
              <td className="surface-border p-2">
                <label className="font-bold block">Employee</label>
              </td>
              <td className="surface-border p-2">
                <label className="font-bold block">:</label>
              </td>
              <td className="surface-border p-2" style={{ width: "450px" }}>
                <InputText
                  value={employee}
                  readOnly={true}
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
            <tr>
              <td className="surface-border p-2">
                <label className="font-bold block">Category</label>
              </td>
              <td className="surface-border p-2">
                <label className="font-bold block">:</label>
              </td>
              <td className="surface-border p-2">
                <InputText
                  value={category}
                  readOnly={true}
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
            <tr>
              <td className="surface-border p-2">
                <label className="font-bold block">Office/Department</label>
              </td>
              <td className="surface-border p-2">
                <label className="font-bold block">:</label>
              </td>
              <td className="surface-border p-2">
                <InputText
                  value={opesinas}
                  readOnly={true}
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
            <tr>
              <td className="surface-border p-2">
                <label className="font-bold block">Date Prepared</label>
              </td>
              <td className="surface-border p-2">
                <label className="font-bold block">:</label>
              </td>
              <td className="surface-border p-2">
                <Calendar
                  value={preparar}
                  readOnlyInput={true}
                  style={{ width: "100%" }}
                  dateFormat="MM dd, yy"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <br />
        <hr />
        <br />
        <div className="card flex flex-wrap justify-content-center gap-2">
          <InputText
            value={verifyid}
            onChange={(e) => setVerifyid(e.target.value)}
            placeholder={`PAR No. ${ukid}`}
            tooltip={checkOn ? "" : "Type the correct PAR No. here to verify."}
            tooltipOptions={{ position: "top" }}
            readOnly={checkOn}
          />
          <Button
            label={tryagain}
            icon={"pi " + (checkOn ? "pi-check" : "pi-question")}
            onClick={() => {
              const confirm = verifyid === ukid;
              setTryagain(confirm ? "Verified!" : "Try Again");
              setNotCheck(ukid !== verifyid);
              setCheckOn(confirm);
            }}
            tooltip="Click to Validate the PAR No."
            tooltipOptions={{ position: "top" }}
            disabled={checkOn}
          />
          <Button
            type="button"
            icon="pi pi-image"
            label="Images"
            onClick={handleClick}
            disabled={grayDocs}
          />
        </div>
        <div className="card">
          <FileUpload
            disabled={notCheck}
            ref={uploadRef}
            name="afirm[]"
            // url={"/property/api/sysadmin/verifyer"}
            customUpload={true}
            uploadHandler={async (e) => {
              const formData = new FormData();
              e.files.forEach((file) => formData.append("afirm[]", file));

              // 👇 add your extra field
              formData.append("parics", ukid);

              try {
                const res = await fetch("/property/api/sysadmin/verifyer", {
                  method: "POST",
                  body: formData,
                });

                const result = await res.json();

                toast.current?.show({
                  severity: "success",
                  summary: "Upload Successful",
                  detail: result.message,
                });

                setTimeout(() => {
                  uploadRef.current?.clear();
                  setCheckOn(true);
                  setNotCheck(true);
                  setGrayDocs(false);
                }, 3000);
              } catch (err) {
                console.error("Upload error:", err);
                toast.current?.show({
                  severity: "error",
                  summary: "Upload Failed",
                  detail: "An error occurred during file upload." + err,
                });
              }
            }}
            multiple
            accept="image/*"
            maxFileSize={1048576}
            // onUpload={(e) => {
            //   toast.current?.show({
            //     severity: "success",
            //     summary: "Upload Successful",
            //     detail: e.xhr.response,
            //   });
            //   // Clear after 3 seconds
            //   setTimeout(() => {
            //     uploadRef.current?.clear();
            //   }, 3000);
            // }}
            emptyTemplate={
              <p className="m-0">Drag and drop files to here to upload.</p>
            }
          />
        </div>
      </Fieldset>
      <Dialog
        header="Uploaded Document/s"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => setVisible(false)}
        footer={() => (
          <Button
            label="Close"
            icon="pi pi-times"
            onClick={() => setVisible(false)}
          />
        )}
      >
        <div style={{ display: "flex", flexWrap: "wrap", marginTop: "1rem" }}>
          {files.map((file, idx) => (
            <Image
              key={idx}
              src={`data:${file.filetype};base64,${file.physical}`}
              alt={file.filepath}
              width={300}
              height={200}
            />
          ))}
        </div>
      </Dialog>
    </>
  );
}
