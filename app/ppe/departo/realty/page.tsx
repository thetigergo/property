"use client";
/**
 * app\departo\emplist\page.tsx
 */
import { useAuth } from "@/context/AuthContext";
import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { Fieldset } from "primereact/fieldset";
import { classNames } from "primereact/utils";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Menu } from "primereact/menu";
import { Dialog } from "primereact/dialog";

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
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [error, setError] = useState<string>("");
  const [ranggo, setRanggo] = useState<string>("");
  const [suffix, setSuffix] = useState<string>("");
  const [mname, setMname] = useState<string>("");
  const [fname, setFname] = useState<string>("");
  const [lname, setLname] = useState<string>("");

  useEffect(() => {
    const rights = nigamit?.permiso;
    //const hasB = rights?.includes("B"); // SUPERUSER
    const has0 = rights?.includes("0"); // SPECIAL
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let result = await fetch(
          "/property/api/departo/emplist/%23" +
            nigamit?.officeId /** # → %23; @ → %40 */,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!result.ok) {
          const message = result.statusText || "Unknown error";
          setErrorMessage(message);
          toast.current?.show({
            severity: "error",
            summary: "Load Error",
            detail: message,
            life: 5000,
          });
          return;
        }
        const data: EmpData[] = await result.json();
        setEmpData(data);

        // Load Offices List
        if (has0) {
          result = await fetch(
            `/property/api/departo/emplist/%40${nigamit?.officeId}` /** # → %23; @ → %40 */,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            },
          );
        } else {
          result = await fetch(
            `/property/api/departo/emplist/%5A${nigamit?.officeId}` /** Z → %5A */,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            },
          );
        }
        const datos: Opesina[] = await result.json();
        const offclist: Opesina[] = datos.map((item: Opesina) => ({
          offcid: item.offcid,
          opesina: item.opesina,
        }));
        setOffices(offclist);
        // initFilters();
      } catch (error) {
        console.error("Error loading data:", error);
        const fallbackMessage = "Failed to load Unfinished Employees.";
        setErrorMessage(fallbackMessage);
        toast.current?.show({
          severity: "error",
          summary: "Load Error",
          detail: fallbackMessage,
          life: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (nigamit?.officeId && nigamit?.permiso) fetchData();
  }, [nigamit?.officeId, nigamit?.permiso]);

  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string,
  ) => {
    const val = (e.target && e.target.value) || "";
    const _product: Partial<EmpData> = { ...product };

    if (
      name === "lname" ||
      name === "fname" ||
      name === "mname" ||
      name === "suffix" ||
      name === "ranggo"
    )
      _product[name] = val;

    setProduct(_product as EmpData);
  };
  // const onFieldChange = (name: keyof EmpData, value: string[]) => {
  //   const _product: Partial<EmpData> = { ...product };
  //   if (name === "offcids") _product[name] = value;
  //   setProduct(_product as EmpData);
  // };
  const validate = (value: string[]) => {
    if (!value || value.length === 0) {
      return "At least one office must be selected.";
    }
    if (value.includes("")) {
      return "Empty selection is not allowed.";
    }
    return "";
  };
  useEffect(() => {
    if (error) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: error,
        life: 5000,
      });
    }
  }, [error]);
  return (
    <>
      <Toast ref={toast} />
      <Fieldset legend="Land/Building Entry" className="h-auto">
        <div className="field">
          <label htmlFor="name" className="font-bold">
            Name
          </label>
          <InputText
            id="name"
            value={product.name}
            onChange={(e) => onInputChange(e, "name")}
            required
            autoFocus
            className={classNames({
              "p-invalid": submitted && !product.name,
            })}
          />
          {submitted && !product.name && (
            <small className="p-error">Name is required.</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="description" className="font-bold">
            Location/Barangay
          </label>
          <InputTextarea
            id="description"
            value={product.description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onInputTextAreaChange(e, "description")
            }
            required
            rows={3}
            cols={20}
          />
        </div>

        <div className="field">
          <label className="mb-3 font-bold">Category</label>
          <div className="formgrid grid">
            <div className="field-radiobutton col-6">
              <RadioButton
                inputId="category1"
                name="category"
                value="Accessories"
                onChange={onCategoryChange}
                checked={product.category === "Accessories"}
              />
              <label htmlFor="category1">Accessories</label>
            </div>
            <div className="field-radiobutton col-6">
              <RadioButton
                inputId="category2"
                name="category"
                value="Clothing"
                onChange={onCategoryChange}
                checked={product.category === "Clothing"}
              />
              <label htmlFor="category2">Clothing</label>
            </div>
            <div className="field-radiobutton col-6">
              <RadioButton
                inputId="category3"
                name="category"
                value="Electronics"
                onChange={onCategoryChange}
                checked={product.category === "Electronics"}
              />
              <label htmlFor="category3">Electronics</label>
            </div>
            <div className="field-radiobutton col-6">
              <RadioButton
                inputId="category4"
                name="category"
                value="Fitness"
                onChange={onCategoryChange}
                checked={product.category === "Fitness"}
              />
              <label htmlFor="category4">Fitness</label>
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
              value={product.price}
              onValueChange={(e) => onInputNumberChange(e, "price")}
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
              value={product.quantity}
              onValueChange={(e) => onInputNumberChange(e, "quantity")}
            />
          </div>
        </div>
      </Fieldset>
      <Dialog
        visible={alterDialog}
        style={{ width: "27rem" }}
        // breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Employee Correction Dialog"
        modal
        footer={
          <React.Fragment>
            <div className="flex justify-between">
              <div style={{ textAlign: "left" }} className="bg-blue-200 p-4">
                <Button
                  type="submit"
                  label="Update"
                  icon="pi pi-sync"
                  severity="info"
                  form="empForm"
                />
              </div>
              <div style={{ textAlign: "right" }} className="bg-green-200 p-4">
                <Button
                  type="button"
                  label="Close"
                  icon="pi pi-times-circle"
                  severity="secondary"
                  onClick={() => setAlterDialog(false)}
                />
              </div>
            </div>
          </React.Fragment>
        }
        onHide={() => setAlterDialog(false)}
      >
        <form
          id="empForm"
          onSubmit={async (evt) => {
            evt.preventDefault(); // prevent page reload

            if (!pickedOffice || pickedOffice.length === 0) {
              setError("At least one office must be selected.");
              return;
            }
            const dataLoad: EmpData = {
              empkey: product?.empkey ?? "",
              lname: product?.lname ?? "",
              fname: product?.fname ?? "",
              mname: product?.mname ?? "",
              suffix: product?.suffix ?? "",
              ranggo: product?.ranggo ?? "",
              offcid: product?.offcid ?? "",
              offcids: pickedOffice?.map((evt) => evt.offcid) ?? [""],
            };
            try {
              let response = await fetch("/property/api/departo/emplist", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataLoad),
              });
              if (!response.ok)
                throw new Error(
                  response.statusText || "Failed to update employee",
                );
              else
                toast.current?.show({
                  severity: "success",
                  summary: "Success",
                  detail: "Employee successfully updated!",
                  life: 5000,
                });

              setAlterDialog(false);
              setEmpData([]); // Clear current data

              // Reload data
              response = await fetch(
                `/property/api/departo/emplist/%23${nigamit?.officeId}` /** # → %23; @ → %40 */,
                {
                  method: "GET",
                  headers: { "Content-Type": "application/json" },
                },
              );

              if (!response.ok) {
                const message = response.statusText || "Unknown error";
                setErrorMessage(message);
                toast.current?.show({
                  severity: "error",
                  summary: "Load Error",
                  detail: message,
                  life: 5000,
                });
                return;
              }
              const data: EmpData[] = await response.json();
              setEmpData(data);
            } catch (error) {
              console.error("Error updating data:", error);
            }
          }}
        >
          <div className="field">
            <label htmlFor="qnty" className="font-bold">
              Employee ID #
            </label>
            <br />
            <InputText
              id="empid"
              value={product?.empkey}
              readOnly
              style={{ width: "25%", textAlign: "center" }}
            />
          </div>
          <div className="field">
            <label htmlFor="lname" className="font-bold">
              Last Name
            </label>
            <InputText
              id="lname"
              value={product?.lname}
              placeholder="Specify Last Name"
              className="w-full"
              required
              aria-required="true"
              onChange={(evt) => onInputChange(evt, "lname")}
            />
          </div>
          <div className="field">
            <label htmlFor="fname" className="font-bold">
              First Name
            </label>
            <InputText
              id="fname"
              value={product?.fname}
              placeholder="Specify First Name"
              className="w-full"
              required
              aria-required="true"
              onChange={(evt) => onInputChange(evt, "fname")}
            />
          </div>
          <div className="field">
            <label htmlFor="mname" className="font-bold">
              Middle Name
            </label>
            <br />
            <InputText
              id="mname"
              value={product?.mname ?? ""}
              placeholder="Specify Middle Name"
              className="w-full"
              aria-required="true"
              onChange={(evt) => onInputChange(evt, "mname")}
            />
          </div>
          <div className="field">
            <label htmlFor="suffix" className="font-bold">
              Suffix
            </label>
            <br />
            <InputText
              id="suffix"
              value={product?.suffix}
              placeholder="(e.g. Sr. Jr.)"
              className="w-full"
              onChange={(evt) => onInputChange(evt, "suffix")}
            />
          </div>
          <div className="field">
            <label htmlFor="ranggo" className="font-bold">
              Designation
            </label>
            <br />
            <InputText
              id="ranggo"
              value={product?.ranggo}
              placeholder="Specify Middle Name"
              className="w-full"
              required
              aria-required="true"
              onChange={(evt) => onInputChange(evt, "suffix")}
            />
          </div>
          <div className="field">
            <label htmlFor="uselife" className="font-bold">
              Designated Office/s
            </label>
            <br />
            <MultiSelect
              value={pickedOffice}
              onChange={(evt: MultiSelectChangeEvent) => {
                setPickedOffice(evt.value);
                setError(validate(evt.value));
              }}
              options={offices}
              optionLabel="opesina"
              filter
              required={true}
              aria-required="true"
              filterDelay={400}
              placeholder="Select Offices"
              maxSelectedLabels={3}
              className="w-full md:w-20rem"
              scrollHeight="500px"
            />
          </div>
        </form>
      </Dialog>
      <Dialog
        visible={insertDialog}
        style={{ width: "27rem" }}
        // breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Employee Entry Dialog"
        modal
        footer={
          <React.Fragment>
            <div className="flex justify-between">
              <div style={{ textAlign: "left" }} className="bg-blue-200 p-4">
                <Button
                  type="submit"
                  label="Submit"
                  icon="pi pi-sync"
                  severity="info"
                  form="addForm"
                />
              </div>
              <div style={{ textAlign: "right" }} className="bg-green-200 p-4">
                <Button
                  type="button"
                  label="Close"
                  icon="pi pi-times-circle"
                  severity="secondary"
                  onClick={() => setInsertDialog(false)}
                />
              </div>
            </div>
          </React.Fragment>
        }
        onHide={() => setInsertDialog(false)}
      >
        <form
          id="addForm"
          onSubmit={async (evt) => {
            evt.preventDefault(); // prevent page reload

            if (!chooseOffice || chooseOffice.length === 0) {
              setError("At least one office must be selected.");
              return;
            }
            const result = await fetch(
              "/property/api/departo/emplist/Q1234567890",
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              },
            );
            const datos = await result.json();
            console.log("Next ID fetched:", datos);
            const nextId: string = datos[0]?.nextid ?? "";
            const dataLoad: EmpData = {
              empkey: nextId,
              lname: lname,
              fname: fname,
              mname: mname,
              suffix: suffix,
              ranggo: ranggo,
              offcid: chooseOffice?.[0]?.offcid ?? "",
              offcids: chooseOffice?.map((evt) => evt.offcid) ?? [""],
            };
            try {
              let response = await fetch("/property/api/departo/emplist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataLoad),
              });
              if (!response.ok)
                throw new Error(
                  response.statusText || "Failed to create employee",
                );
              else
                toast.current?.show({
                  severity: "success",
                  summary: "Success",
                  detail: "Employee successfully created!",
                  life: 5000,
                });

              setInsertDialog(false);
              setEmpData([]); // Clear current data

              // Reload data
              response = await fetch(
                `/property/api/departo/emplist/%23${nigamit?.officeId}` /** # → %23; @ → %40 */,
                {
                  method: "GET",
                  headers: { "Content-Type": "application/json" },
                },
              );

              if (!response.ok) {
                const message = response.statusText || "Unknown error";
                setErrorMessage(message);
                toast.current?.show({
                  severity: "error",
                  summary: "Load Error",
                  detail: message,
                  life: 5000,
                });
                return;
              }
              const data: EmpData[] = await response.json();
              setEmpData(data);
            } catch (error) {
              console.error("Error updating data:", error);
            }
          }}
        >
          <div className="field">
            <label htmlFor="lname" className="font-bold">
              Last Name
            </label>
            <InputText
              id="lname"
              value={lname}
              placeholder="Specify Last Name"
              className="w-full"
              required
              aria-required="true"
              onChange={(evt) => setLname(evt.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="fname" className="font-bold">
              First Name
            </label>
            <InputText
              id="fname"
              value={fname}
              placeholder="Specify First Name"
              className="w-full"
              required
              aria-required="true"
              onChange={(evt) => setFname(evt.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="mname" className="font-bold">
              Middle Name
            </label>
            <br />
            <InputText
              id="mname"
              value={mname}
              placeholder="Specify Middle Name"
              className="w-full"
              aria-required="true"
              onChange={(evt) => setMname(evt.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="suffix" className="font-bold">
              Suffix
            </label>
            <br />
            <InputText
              id="suffix"
              value={suffix}
              placeholder="(e.g. Sr. Jr.)"
              className="w-full"
              onChange={(evt) => setSuffix(evt.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="ranggo" className="font-bold">
              Designation
            </label>
            <br />
            <InputText
              id="ranggo"
              value={ranggo}
              placeholder="Specify Middle Name"
              className="w-full"
              required
              aria-required="true"
              onChange={(evt) => setRanggo(evt.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="uselife" className="font-bold">
              Designated Office/s
            </label>
            <br />
            <MultiSelect
              value={chooseOffice}
              onChange={(evt: MultiSelectChangeEvent) => {
                setChooseOffice(evt.value);
                setError(validate(evt.value));
              }}
              options={offices}
              optionLabel="opesina"
              filter
              required={true}
              aria-required="true"
              filterDelay={400}
              placeholder="Select Offices"
              maxSelectedLabels={3}
              className="w-full md:w-20rem"
              scrollHeight="500px"
            />
          </div>
        </form>
      </Dialog>
    </>
  );
}
