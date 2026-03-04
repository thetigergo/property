"use client";
/**
 * app\departo\emplist\page.tsx
 */
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import { Toast } from "primereact/toast";
import { Fieldset } from "primereact/fieldset";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Menu } from "primereact/menu";
import { InputNumber } from "primereact/inputnumber";
import { SelectButton, SelectButtonChangeEvent } from "primereact/selectbutton";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";

interface EmpData {
  empkey: string;
  lname: string;
  fname: string;
  mname: string;
  suffix: string;
  ranggo: string;
  offcid: string;
  offcids: string[];
}
interface Opesina {
  offcid: string;
  opesina: string;
}

export default function EmployeeListing() {
  const { nigamit } = useAuth();
  const options: string[] = ["Land", "Bldg."];
  const [prepare, setPrepare] = useState<Date | null>(null);
  const [puidno, setPuidNo] = useState<string>("");
  const [ngalan, setNgalan] = useState<string>("");
  const [located, setLocated] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [taxdec, setTaxDec] = useState<string>("");
  const [which, setWhich] = useState<string>(options[0]);
  const [areasqm, setAreas] = useState<number | null>(0.0);

  const [submitted, setSubmitted] = useState<boolean>(false);

  const [empData, setEmpData] = useState<EmpData[]>([]);
  const [selectedRow, setSelectedRow] = useState<EmpData>();

  const [offices, setOffices] = useState<Opesina[]>();
  const [pickedOffice, setPickedOffice] = useState<Opesina[]>();
  const [chooseOffice, setChooseOffice] = useState<Opesina[]>();

  const [product, setProduct] = useState<EmpData | null>();

  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
  const [alterDialog, setAlterDialog] = useState<boolean>(false);
  const [insertDialog, setInsertDialog] = useState<boolean>(false);

  const [error, setError] = useState<string>("");
  const [ranggo, setRanggo] = useState<string>("");
  const [suffix, setSuffix] = useState<string>("");
  const [mname, setMname] = useState<string>("");
  const [fname, setFname] = useState<string>("");
  const [lname, setLname] = useState<string>("");

  // useEffect(() => {
  //   const rights = nigamit?.permiso;
  //   //const hasB = rights?.includes("B"); // SUPERUSER
  //   const has0 = rights?.includes("0"); // SPECIAL
  //   const fetchData = async () => {
  //     setIsLoading(true);
  //     try {
  //       let result = await fetch(
  //         "/property/api/departo/emplist/%23" +
  //           nigamit?.officeId /** # → %23; @ → %40 */,
  //         {
  //           method: "GET",
  //           headers: { "Content-Type": "application/json" },
  //         },
  //       );

  //       if (!result.ok) {
  //         const message = result.statusText || "Unknown error";
  //         setErrorMessage(message);
  //         toast.current?.show({
  //           severity: "error",
  //           summary: "Load Error",
  //           detail: message,
  //           life: 5000,
  //         });
  //         return;
  //       }
  //       const data: EmpData[] = await result.json();
  //       setEmpData(data);

  //       // Load Offices List
  //       if (has0) {
  //         result = await fetch(
  //           `/property/api/departo/emplist/%40${nigamit?.officeId}` /** # → %23; @ → %40 */,
  //           {
  //             method: "GET",
  //             headers: { "Content-Type": "application/json" },
  //           },
  //         );
  //       } else {
  //         result = await fetch(
  //           `/property/api/departo/emplist/%5A${nigamit?.officeId}` /** Z → %5A */,
  //           {
  //             method: "GET",
  //             headers: { "Content-Type": "application/json" },
  //           },
  //         );
  //       }
  //       const datos: Opesina[] = await result.json();
  //       const offclist: Opesina[] = datos.map((item: Opesina) => ({
  //         offcid: item.offcid,
  //         opesina: item.opesina,
  //       }));
  //       setOffices(offclist);
  //       // initFilters();
  //     } catch (error) {
  //       console.error("Error loading data:", error);
  //       const fallbackMessage = "Failed to load Unfinished Employees.";
  //       setErrorMessage(fallbackMessage);
  //       toast.current?.show({
  //         severity: "error",
  //         summary: "Load Error",
  //         detail: fallbackMessage,
  //         life: 5000,
  //       });
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   if (nigamit?.officeId && nigamit?.permiso) fetchData();
  // }, [nigamit?.officeId, nigamit?.permiso]);

  // const onInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   name: string,
  // ) => {
  //   const val = (e.target && e.target.value) || "";
  //   const _product: Partial<EmpData> = { ...product };

  //   if (
  //     name === "lname" ||
  //     name === "fname" ||
  //     name === "mname" ||
  //     name === "suffix" ||
  //     name === "ranggo"
  //   )
  //     _product[name] = val;

  //   setProduct(_product as EmpData);
  // };
  // const onFieldChange = (name: keyof EmpData, value: string[]) => {
  //   const _product: Partial<EmpData> = { ...product };
  //   if (name === "offcids") _product[name] = value;
  //   setProduct(_product as EmpData);
  // };
  // const validate = (value: string[]) => {
  //   if (!value || value.length === 0) {
  //     return "At least one office must be selected.";
  //   }
  //   if (value.includes("")) {
  //     return "Empty selection is not allowed.";
  //   }
  //   return "";
  // };
  // useEffect(() => {
  //   if (error) {
  //     toast.current?.show({
  //       severity: "error",
  //       summary: "Validation Error",
  //       detail: error,
  //       life: 5000,
  //     });
  //   }
  // }, [error]);
  return (
    <>
      <Toast ref={toast} />
      <Fieldset
        legend="Land/Building Entry"
        style={{ width: "32rem" }}
        className="p-fluid"
      >
        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            setSubmitted(true);
          }}
        >
          <div className="field">
            <label htmlFor="pid" className="font-bold">
              Date Prepared
            </label>
            <br />
            <Calendar
              id="made"
              value={prepare}
              dateFormat="mm/dd/yy"
              style={{ width: "10rem" }}
              showIcon
              // onSelect={(e) => {
              //   const val = e.value;
              //   if (val) {
              //     const pickedDate =
              //       typeof val === "string"
              //         ? parse(val, "MM/dd/yy", new Date())
              //         : val instanceof Date
              //           ? val
              //           : null;
              //     if (selectedDate) updatePetsa(selectedDate);
              //   }
              // }}
              onChange={(e) => setPrepare(e.value ?? null)}
              required
              className={classNames({ "p-invalid": submitted && !prepare })}
            />
          </div>
          <div className="field">
            <label htmlFor="pid" className="font-bold">
              Property Identification
            </label>
            <br />
            <InputText
              id="pid"
              value={puidno}
              onChange={(e) => setPuidNo(e.target.value)}
              required
              autoFocus
              className={classNames({ "p-invalid": submitted && !puidno })}
              style={{ width: "150px" }}
              maxLength={14}
            />
            {submitted && !puidno && (
              <small className="p-error">
                Property Identification is required.
              </small>
            )}
          </div>
          <div className="field">
            <label htmlFor="name" className="font-bold">
              Owner&apos;s Name
            </label>
            <InputText
              id="name"
              value={ngalan}
              onChange={(e) => setNgalan(e.target.value)}
              required
              autoFocus
              className={classNames({ "p-invalid": submitted && !ngalan })}
            />
            {submitted && !ngalan && (
              <small className="p-error">Name is required.</small>
            )}
          </div>
          <div className="field">
            <label htmlFor="located" className="font-bold">
              Location/Barangay
            </label>
            <InputTextarea
              id="located"
              value={located}
              onChange={(e) => setLocated(e.target.value)}
              required
              rows={3}
              cols={20}
              className={classNames({ "p-invalid": submitted && !located })}
            />
            {submitted && !located && (
              <small className="p-error">Location is required.</small>
            )}
          </div>
          <div className="field">
            <label htmlFor="located" className="font-bold">
              Location/Barangay
            </label>
            <Dropdown
              // value={selectedCity}
              // onChange={(e: DropdownChangeEvent) => setSelectedCity(e.value)}
              // options={groupedCities}
              optionLabel="label"
              optionGroupLabel="label"
              optionGroupChildren="items"
              // optionGroupTemplate={groupedItemTemplate}
              className="w-full md:w-14rem"
              placeholder="Select a City"
            />

            {/* {submitted && !selectedCity && (
              <small className="p-error">Location is required.</small>
            )} */}
          </div>

          <div className="field">
            <label className="mb-3 font-bold">Property</label>
            <div className="formgrid grid">
              <div className="field col-6">
                <label htmlFor="title">Title No.</label>
                <InputText
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="field col-6">
                <label htmlFor="taxdec">Tax Dec. No.</label>
                <InputText
                  id="taxdec"
                  value={taxdec}
                  onChange={(e) => setTaxDec(e.target.value)}
                />
              </div>
              <div className="field-radiobutton col-6">
                <SelectButton
                  value={which}
                  onChange={(e: SelectButtonChangeEvent) => setWhich(e.value)}
                  options={options}
                />
              </div>
              <div className="field col-6">
                <label htmlFor="area">{which} Area (sqm)</label>
                <InputNumber
                  id="area"
                  value={areasqm}
                  onValueChange={(e) => setAreas(e.value ?? 0)}
                  minFractionDigits={2}
                  maxFractionDigits={5}
                  inputStyle={{ textAlign: "right" }}
                  required
                />
              </div>
            </div>
          </div>

          <div className="formgrid grid">
            <div className="field col">
              <label htmlFor="price" className="font-bold">
                Market Value
              </label>
              <InputNumber
                id="price"
                // value={product.price}
                // onValueChange={(e) => onInputNumberChange(e, "price")}
                mode="currency"
                currency="USD"
                locale="en-US"
              />
            </div>
            <div className="field col">
              <label htmlFor="quantity" className="font-bold">
                Assessed Value
              </label>
              <InputNumber
                id="quantity"
                // value={product.quantity}
                // onValueChange={(e) => onInputNumberChange(e, "quantity")}
              />
            </div>
          </div>
        </form>
      </Fieldset>
    </>
  );
}
