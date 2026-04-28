"use client";

import "dotenv/config";
import { useAuth } from "@/context/AuthContext"; // 👈 For state management

import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import { parse } from "date-fns";

import { Fieldset } from "primereact/fieldset";
import { Toast } from "primereact/toast";
import { TabView, TabPanel } from "primereact/tabview";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import { InputText } from "primereact/inputtext";
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { Dialog } from "primereact/dialog";
import axios from "axios";

interface Prefix {
  label: string;
  value: string;
}
interface Category {
  catgid: string;
  catego: string;
  breed: string;
  parent: string;
}
interface Optionz {
  subcat: string;
  catdtld: string;
  subname: string;
  itemname: string;
  describes: string;
}
interface OptionDetail {
  label: string;
  value: string;
}
interface CategoryGroup {
  label: string;
  code: string;
  items: OptionDetail /*{ label: string; value: string }*/[];
}
interface OptionGroup {
  label: string;
  code: string;
  items: OptionDetail /*{ label: string; value: string }*/[];
}
interface Employee {
  empkey: string;
  humane: string;
  designate: string;
}
interface Listahan {
  catdtld: string;
  quantiy: number;
  issued: string;
  detalye: string;
  specifyd: string;
  unitcost: number;
  totalamt: number;
  acquired: number;
  uselife: number;
  property: string;
}

export default function EntryPage() {
  const toast = useRef<Toast>(null);
  // const [activeTab, setActiveTab] = useState(0);
  const { nigamit } = useAuth();
  const [synced, setSynced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [frostCat, setFrost] = useState(false);
  const [dontPrint, setDontPrint] = useState(true);
  const [petsa, setPetsa] = useState<{
    buhat: Nullable<Date>;
    dawat: Nullable<Date>;
  }>({
    buhat: new Date(),
    dawat: new Date(),
  });
  const [product, setProduct] = useState<Listahan>();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [eraseDialog, setEraseDialog] = useState<boolean>(false);
  const [disableDelete, setDisableDelete] = useState<boolean>(true);

  const [icsareno, setIcsAre] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [costing, setCosting] = useState<number>(0.0);
  const [amount, setAmount] = useState<number>(0.0);
  const [lifespan, setLifespan] = useState<number>(0);

  const [pickPrefix, setPrefix] = useState<Prefix | null>(null);
  const [grpCategory, setGrpCategory] = useState<CategoryGroup[]>([]);
  const [pickedCats, setPickedCats] = useState<OptionDetail | null>(null);
  const [pickedUnit, setPickedUnit] = useState<OptionDetail | null>(null);
  const [unitOptions, setUnitOptions] = useState<OptionGroup[]>([]);
  const [gotPerson, setPersona] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dataList, setDataList] = useState<Listahan[]>([]);

  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [myplaceholder, setMyPlaceholder] = useState<string>("Select details");
  const [specific, setSpecific] = useState<string>("");
  const [details, setDetail] = useState<string>("");
  const [personnel, setPersonnel] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");

  const prefixes: Prefix[] = [
    { label: "UNIT/S", value: "UNIT" },
    { label: "ITEM/S", value: "ITEM" },
    { label: "PCS.", value: "PCS" },
    { label: "REAM/S", value: "REAM" },
    { label: "SET/S", value: "SET" },
    { label: "METER/S", value: "METER" },
    { label: "INCH/ES", value: "INCH" },
    { label: "FEET/S", value: "FTS" },
    { label: "PART/S", value: "PART" },
  ];

  const updatePetsa = (newDate: Nullable<Date>) => {
    setPetsa((prev) => {
      const updated = { ...prev, dawat: newDate };

      // Only sync made once
      if (!synced) updated.buhat = newDate;

      return updated;
    });
  };

  function groupCategory(data: Category[]): CategoryGroup[] {
    // Group the data by parent
    const grouped = data.reduce(
      (acc: { [key: string]: CategoryGroup }, item) => {
        const parent = item.parent || "Top Level"; // Use 'Top Level' for items without a parent
        if (!acc[parent]) {
          acc[parent] = {
            label: parent.toUpperCase(),
            code: item.breed,
            items: [],
          };
        }
        acc[parent].items.push({
          label: item.catego, // Display category name
          value: item.catgid, // Use category ID as the value
        });
        return acc;
      },
      {},
    );
    const groupedArray: CategoryGroup[] = Object.values(grouped);
    return groupedArray;
  }
  function optionGroup(data: Optionz[]): OptionGroup[] {
    const grouped = data.reduce(
      (acc: { [key: string]: CategoryGroup }, item) => {
        const parent = item.subname || "Top Level"; // Use 'Top Level' for items without a parent
        if (!acc[parent]) {
          acc[parent] = {
            label: parent.toUpperCase(),
            code: item.subcat,
            items: [],
          };
        }

        acc[parent].items.push({
          label: item.itemname, // Display category name
          value: item.catdtld, // Use category ID as the value
        });
        return acc;
      },
      {},
    );
    const groupedArray: CategoryGroup[] = Object.values(grouped);
    return groupedArray;
  }

  const formatDate = (value: Date) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      /*
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      */
      timeZone: "Asia/Manila",
    }).formatToParts(value ?? new Date());

    const day = parts.find((p) => p.type === "day")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const year = parts.find((p) => p.type === "year")?.value;
    /*
    const hour = parts.find(p => p.type === "hour")?.value;
    const minute = parts.find(p => p.type === "minute")?.value;
    const dayPeriod = parts.find(p => p.type === "dayPeriod")?.value;    

    return `${day}-${month}-${year} ${hour}:${minute} ${dayPeriod}`;
    */

    return `${day}-${month}-${year}`; // e.g. "10-Nov-2025"
  };
  const dateShow = (rowData: Listahan) => {
    return formatDate(
      new Date(rowData.acquired ? rowData.acquired : Date.now()),
    );
  };

  useEffect(() => {
    const loadCategories = async () => {
      const result = await fetch("/property/api/departo/receipt/loadcats", {
        method: "GET",
      });
      if (!result.ok) throw new Error(`HTTP error! status: ${result.status}`);
      const data: Category[] = await result.json();
      setGrpCategory(groupCategory(data));
    };
    loadCategories();
  }, []);
  useEffect(() => {
    const loadUnits = async (category: OptionDetail | null) => {
      if (!category) {
        setUnitOptions([]);
        return;
      }

      try {
        const result = await fetch(
          `/property/api/departo/receipt/loadunit?catgid=${category.value}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );
        // if (!result.ok) throw new Error(`HTTP error! status: ${result.status}`);

        const data: Optionz[] = await result.json();
        if (!data || data.length === 0) {
          setMyPlaceholder("No details available");
          setUnitOptions([]);
        } else {
          setMyPlaceholder("Select details");
          setUnitOptions(optionGroup(data));
        }
      } catch (error) {
        console.error("Failed to load units:", error);
      }
    };

    loadUnits(pickedCats);
  }, [pickedCats]);
  useEffect(() => {
    async function fetchEmployee() {
      if (!nigamit?.officeId) {
        setEmployees([]);
        return;
      }

      try {
        const result = await fetch(
          `/property/api/departo/receipt/employee?offcid=${nigamit.officeId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );
        const data = await result.json();
        const emplist: Employee[] = data.map((item: Employee) => ({
          humane: item.humane,
          empkey: item.empkey,
          designate: item.designate,
        }));

        setEmployees(emplist);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchEmployee();
  }, [nigamit?.officeId]); // Re-run when nigamit?.officeId changes

  const onRowEditComplete = async (producto: Listahan) => {
    const butang = [...dataList];
    const index = butang.findIndex((item) => item.catdtld === producto.catdtld);

    if (index !== -1) butang[index] = producto;

    const dataLoad = {
      icsareno: icsareno,
      catdtld: butang[index]?.catdtld,
      issued: butang[index]?.issued,
      specifyd: butang[index]?.specifyd,
      unitcost: butang[index]?.unitcost,
      acquired: butang[index]?.acquired,
      uselife: butang[index]?.uselife,
      property: butang[index]?.property,
    };

    try {
      const response = await fetch("/property/api/departo/receipt/datalist", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataLoad),
      });
      // const data = await response.json();
      if (!response.ok)
        throw new Error(response.statusText || "Failed to update property");
      else
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Property successfully updated!",
          life: 5000,
        });

      setShowDialog(false);
      setDataList(butang);
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };
  const menuRef = useRef<Menu>(null);
  const getActions = () => [
    {
      label: "Inventory Custodian Slip",
      icon: "pi pi-file-pdf",
      command: () => {
        if (typeof window !== "undefined") {
          window.open(
            `/propinv/custodian.html?icsareno=${icsareno}&rptname=custodian`,
            "_blank",
            "width=760,height=600,menubar=0,toolbar=0,scrollbars=no,location=0,resizable=no",
          );
        }
      },
      // disabled: true,
    },
    {
      label: "Property Acknowledgement Receipt",
      icon: "pi pi-file-pdf",
      command: () => {
        if (typeof window !== "undefined")
          window.open(
            `/propinv/acknowledge.html?icsareno=${icsareno}&rptname=acknowledge`,
            "_blank",
            "width=760,height=600,menubar=0,toolbar=0,scrollbars=no,location=0,resizable=no",
          );
      },
    },
  ];

  const onInputTextAreaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    name: keyof Listahan,
  ) => {
    const val = e.target && e.target.value;
    const _product: Partial<Listahan> = { ...product };

    if (name === "specifyd") _product[name] = val;

    setProduct(_product as Listahan);
  };
  const onInputNumberChange = (
    e: InputNumberValueChangeEvent,
    name: keyof Listahan,
  ) => {
    const val = e.value ?? 0;
    const _product: Partial<Listahan> = { ...product };

    if (
      name === "unitcost" ||
      name === "uselife" ||
      name === "totalamt" ||
      name === "acquired"
    )
      _product[name] = val;

    setProduct(_product as Listahan);
  };
  const onDropdownChange = (e: DropdownChangeEvent, name: keyof Listahan) => {
    const val = e.target && e.target.value;
    const _product = { ...product };

    if (name === "issued" || name === "catdtld") _product[name] = val;

    setProduct(_product as Listahan);
  };
  const deleteProperty = async (producto: Listahan) => {
    const butang = [...dataList];
    const index = butang.findIndex((item) => item.catdtld === producto.catdtld);

    if (index !== -1) butang[index] = producto;
    try {
      setDataList([]);
      let result = await fetch(
        `/property/api/departo/receipt/datalist?parics=${icsareno}&thing=${butang[index]?.property}`,
        {
          method: "DELETE",
        },
      );
      // const data = await result.json();
      if (!result.ok) {
        toast.current?.show({
          severity: "error",
          summary: "Deleted",
          detail: "Failed to delete property!",
          life: 5000,
        });
        // throw new Error(data.message || "Failed to delete property");
      } else
        /*setDataList((prevDataList) => {
          return prevDataList.filter(
            (item) => item.property !== product?.property
          ); // Filter out the deleted product
        });*/
        result = await fetch(
          `/property/api/departo/receipt/datalist/${icsareno}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );
      if (!result.ok) setErrorMessage("Failed to fetch data list.");
      const data = await result.json();
      setDataList(data);
      setDisableDelete(data.length === 1);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Record successfully removed!",
        life: 5000,
      });
      setEraseDialog(false);
    } catch (error) {
      console.error("Error removing data:", error);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Fieldset
        legend="ICS/PAR Entry Form"
        className="h-auto w-full max-w-7xl max-h-[900px]"
      >
        <TabView
        /*activeIndex={activeTab}
          onTabChange={(e) => setActiveTab(e.index)}*/
        >
          <TabPanel header="Receipt Entry Form">
            <form
              onSubmit={async (e) => {
                e.preventDefault(); // prevent page reload
                setSynced(true);
                setLoading(true);
                setDataList([]);

                // variable declaration and initialization
                const tuiga =
                  petsa.buhat?.getFullYear() ?? new Date().getFullYear();
                const bulan = String(
                  (petsa.buhat?.getMonth() ?? new Date().getMonth()) + 1,
                ).padStart(2, "0");

                try {
                  let parics = 0;
                  let result;
                  let data;
                  if (icsareno === 0) {
                    /*result = await fetch(
                      `/property/api/departo/receipt?anios=${tuiga}&type=icsare&petsa=${bulan}`,
                      {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                      },
                    );*/
                    result = await axios.get("/property/api/departo/receipt", {
                      params: { anios: tuiga, type: "icsare", petsa: bulan },
                    });
                    data = await result.data();
                    parics = parseInt(tuiga + bulan + data.icsareno, 10);
                    setIcsAre(parics);
                  }

                  // Fetch the last sequence number for the given year and expcode
                  /*result = await fetch(
                    `/property/api/departo/receipt?anios=${tuiga}&expcode=${pickedCats?.value}`,
                    {
                      method: "GET",
                      headers: { "Content-Type": "application/json" },
                    },
                  );*/
                  result = await axios.get("/property/api/departo/receipt", {
                    params: { anios: tuiga, expcode: pickedCats?.value },
                  });
                  data = await result.data();
                  const orderno = data.icsareno;

                  // Fetch the Threshold for the given date
                  /*result = await fetch(
                    `/property/api/departo/receipt?anios=${tuiga}&petsa=${petsa.dawat?.getTime()}`,
                    {
                      method: "GET",
                      headers: { "Content-Type": "application/json" },
                    },
                  );*/
                  result = await axios.get("/property/api/departo/receipt", {
                    params: { anios: tuiga, petsa: petsa.dawat?.getTime() },
                  });
                  data = await result.data();
                  const threshold = data.icsareno;

                  // Check if the payload is ready (using the variables defined above)
                  const lastno = orderno + quantity;
                  const nextno = orderno + 1;
                  parics = parics === 0 ? icsareno : parics;
                  const dataLoad = {
                    icsareno: parics,
                    preparar: petsa.buhat?.getTime(),
                    opesina: nigamit?.officeId,
                    expcode: pickedCats?.value,
                    userid: nigamit?.userId,

                    catdetl: pickedUnit?.value,
                    kabook: quantity,
                    prefixed: pickPrefix?.value,
                    specific: specific,
                    costing: costing,
                    acquired: petsa.dawat?.getTime(),
                    lifespan: lifespan,
                    butang:
                      tuiga +
                      "-" +
                      pickedCats?.value?.substring(5) +
                      "-" +
                      String(nextno).padStart(4, "0") +
                      (quantity > 1 ? "." + lastno : "") +
                      "-" +
                      nigamit?.offcode,
                    acronym: nigamit?.offcode + tuiga.toString(),
                    lastseq: lastno,
                    thresh: threshold,

                    activo: 0, //activeTab,
                  };
                  console.log("Before posting:", dataLoad);
                  const reply = await fetch("/property/api/departo/receipt", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataLoad), // 🔑 Key: Convert the payload object into a JSON string for the body
                  });
                  if (reply.ok) {
                    toast.current?.show({
                      severity: "success",
                      summary: "Success",
                      detail: "Records successfully created!",
                      life: 5000,
                    });
                    setFrost(true);

                    const result = await fetch(
                      `/property/api/departo/receipt/datalist/${parics}`,
                      {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                      },
                    );
                    if (!result.ok)
                      setErrorMessage("Failed to fetch data list.");

                    const data = await result.json();
                    setDataList(data);
                    setDisableDelete(data.length === 1);
                  } else if (!reply.ok) {
                    toast.current?.show({
                      severity: "warn",
                      summary: "Warning",
                      detail: "Records creation failed!",
                      life: 5000,
                    });
                  }
                } catch (error) {
                  console.error(
                    "Transaction failed and was rolled back:",
                    error,
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              <table border={0} width="100%" cellSpacing={1} cellPadding={1}>
                <tbody>
                  <tr>
                    <td align="left">
                      <table
                        border={1}
                        width="100%"
                        cellSpacing={3}
                        cellPadding={3}
                        className="surface-border w-full"
                      >
                        <tbody>
                          <tr>
                            <td className="surface-border p-2">
                              <label className="font-bold block">
                                Prepared
                              </label>
                            </td>
                            <td className="surface-border p-2">
                              <label className="font-bold block">:</label>
                            </td>
                            <td className="surface-border p-2">
                              <Calendar
                                id="made"
                                value={petsa.buhat}
                                dateFormat="mm/dd/yy"
                                style={{ width: "10rem" }}
                                showIcon
                                onSelect={(e) => {
                                  const val = e.value;
                                  if (val) {
                                    const selectedDate =
                                      typeof val === "string"
                                        ? parse(val, "MM/dd/yy", new Date())
                                        : val instanceof Date
                                          ? val
                                          : null;
                                    if (selectedDate) updatePetsa(selectedDate);
                                  }
                                }}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="surface-border p-2">
                              <label className="font-bold block">
                                Department
                              </label>
                            </td>
                            <td className="surface-border p-2">
                              <label className="font-bold block">:</label>
                            </td>
                            <td className="surface-border p-2">
                              <InputText
                                id="dept"
                                keyfilter="num"
                                className="w-[450px]"
                                readOnly
                                value={nigamit?.pangalan}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td align="right">
                      <table
                        border={0}
                        width="100%"
                        cellSpacing={3}
                        cellPadding={3}
                      >
                        <tbody>
                          <tr>
                            <td className="surface-border p-2">
                              <label className="font-bold block">
                                ICS/ARE No.
                              </label>
                            </td>
                            <td className="surface-border p-2">
                              <label className="font-bold block">:</label>
                            </td>
                            <td className="surface-border p-2">
                              <InputNumber
                                id="icsare"
                                inputId="icsare"
                                value={icsareno}
                                size={10}
                                maxLength={10}
                                min={0}
                                inputStyle={{ textAlign: "center" }}
                                readOnly
                                minFractionDigits={0}
                                maxFractionDigits={0}
                                useGrouping={false}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="surface-border p-2">
                              <label className="font-bold block">
                                Category Name
                              </label>
                            </td>
                            <td className="surface-border p-2">
                              <label className="font-bold block">:</label>
                            </td>
                            <td className="surface-border p-2">
                              <Dropdown
                                id="cats"
                                inputId="cats"
                                value={pickedCats?.value || null}
                                placeholder="Select Category"
                                className="w-[200px]"
                                required
                                aria-required="true"
                                onChange={(e) => {
                                  const choice =
                                    grpCategory
                                      .flatMap((group) => group.items)
                                      .find((opt) => opt.value === e.value) ||
                                    null;

                                  const groups = grpCategory.flatMap(
                                    (group) => group.items,
                                  );
                                  const initOption = groups.find(
                                    (p) => p.value === e.value,
                                  );

                                  if (choice) {
                                    setTooltipContent(choice.label); // Set tooltip content to choice label
                                    if (initOption) setPickedCats(initOption);
                                    setPickedUnit(null); // Reset details when category changes
                                  } else {
                                    setTooltipContent(""); // Clear tooltip if no item is choice
                                    setPickedUnit(null); // Reset details when category changes
                                  }
                                }}
                                options={grpCategory}
                                // --- GROUPING PROPS ---
                                optionLabel="label"
                                optionGroupLabel="label"
                                optionGroupChildren="items"
                                // itemTemplate={(
                                //   item:
                                //     | CategoryGroup
                                //     | { label: string; value: string }
                                // ) => (
                                //   <div
                                //     style={{
                                //       paddingLeft:
                                //         "items" in item && item.items
                                //           ? "0em"
                                //           : "1.5em",
                                //     }}
                                //   >
                                //     {item.label}
                                //   </div>
                                // )}
                                scrollHeight="400px"
                                disabled={frostCat}
                                checkmark={true}
                                highlightOnSelect
                                filter
                              />
                              <Tooltip
                                position="top"
                                target="#cats"
                                content={tooltipContent}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <br />
              <table
                border={0}
                width="100%"
                cellSpacing={0}
                cellPadding={3}
                className="w-full border-collapse"
              >
                <thead>
                  <tr style={{ backgroundColor: "var(--surface-300)" }}>
                    <td
                      align="center"
                      style={{ border: `var(--surface-border) solid 1px` }}
                    >
                      <label className="font-bold block">Quantity</label>
                    </td>
                    <td
                      align="center"
                      style={{ border: `var(--surface-border) solid 1px` }}
                    >
                      <label className="font-bold block">
                        Unit of
                        <br />
                        Issue
                      </label>
                    </td>
                    <td
                      align="center"
                      style={{ border: `var(--surface-border) solid 1px` }}
                    >
                      <label className="font-bold block">
                        Item Description
                      </label>
                    </td>
                    <td
                      align="center"
                      style={{ border: `var(--surface-border) solid 1px` }}
                    >
                      <label className="font-bold block">Unit Cost</label>
                    </td>
                    <td
                      align="center"
                      style={{ border: `var(--surface-border) solid 1px` }}
                    >
                      <label className="font-bold block">Total Amount</label>
                    </td>
                    <td
                      align="center"
                      style={{ border: `var(--surface-border) solid 1px` }}
                    >
                      <label className="font-bold block">Acquired</label>
                    </td>
                    <td
                      align="center"
                      style={{ border: `var(--surface-border) solid 1px` }}
                    >
                      <label className="font-bold block">Useful Life</label>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td valign="top">
                      <InputNumber
                        id="qnty"
                        inputId="qnty"
                        value={quantity}
                        size={4}
                        maxLength={4}
                        min={0}
                        max={9999}
                        minFractionDigits={0}
                        maxFractionDigits={0}
                        useGrouping={false}
                        required
                        aria-required="true"
                        inputStyle={{ textAlign: "center" }}
                        onValueChange={(e: InputNumberValueChangeEvent) => {
                          setQuantity(e.value!);
                          setAmount(costing * e.value!);
                        }}
                      />
                    </td>
                    <td valign="top">
                      <Dropdown
                        id="unit"
                        inputId="unit"
                        value={pickPrefix?.value || null}
                        placeholder="Select an item"
                        className="w-[118px]"
                        required
                        aria-required="true"
                        options={prefixes}
                        optionLabel="label"
                        onChange={(e: DropdownChangeEvent) => {
                          const initPrefix = prefixes.find(
                            (p) => p.value === e.value,
                          );
                          if (initPrefix) setPrefix(initPrefix);
                        }}
                        tooltip={"Select an item."}
                        tooltipOptions={{ position: "top" }}
                        checkmark={true}
                        highlightOnSelect
                      />
                    </td>
                    <td width="100%">
                      <Dropdown
                        id="detl"
                        inputId="detl"
                        placeholder={myplaceholder}
                        className="w-full"
                        required
                        aria-required="true"
                        value={pickedUnit?.value || null}
                        options={unitOptions}
                        onChange={(e: DropdownChangeEvent) => {
                          const groups = unitOptions.flatMap(
                            (group) => group.items,
                          );
                          const initOption = groups.find(
                            (p) => p.value === e.value,
                          );
                          if (initOption) setPickedUnit(initOption);
                        }}
                        // --- GROUPING PROPS ---
                        optionLabel="label"
                        optionGroupLabel="label"
                        optionGroupChildren="items"
                        // itemTemplate={(
                        //   item: CategoryGroup | { label: string; value: string }
                        // ) => (
                        //   <div
                        //     style={{
                        //       paddingLeft:
                        //         "items" in item && item.items ? "0em" : "1.5em",
                        //     }}
                        //   >
                        //     {item.label}
                        //   </div>
                        // )}
                        scrollHeight="400px"
                        checkmark={true}
                        highlightOnSelect
                        filter
                      />
                    </td>
                    <td valign="top">
                      <InputNumber
                        id="cost"
                        inputId="cost"
                        value={costing}
                        size={13}
                        maxLength={13}
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        min={0.0}
                        max={99999999.99}
                        useGrouping={true}
                        dir="RTL"
                        required
                        aria-required="true"
                        onValueChange={(e: InputNumberValueChangeEvent) => {
                          setCosting(e.value!);
                          setAmount(quantity * e.value!);
                        }}
                      />
                    </td>
                    <td valign="top">
                      <InputNumber
                        id="amount"
                        value={amount}
                        size={14}
                        maxLength={14}
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        min={0.0}
                        max={999999999.99}
                        useGrouping={true}
                        dir="RTL"
                        aria-readonly="true"
                        readOnly
                      />
                    </td>
                    <td valign="top">
                      <Calendar
                        id="acqrd"
                        value={petsa.dawat}
                        onChange={(e) => updatePetsa(e.value)}
                        dateFormat="mm/dd/yy"
                        style={{ width: "10rem" }}
                        showIcon
                      />
                    </td>
                    <td valign="top">
                      <InputNumber
                        id="life"
                        inputId="life"
                        value={lifespan}
                        size={3}
                        maxLength={3}
                        min={0}
                        max={999}
                        minFractionDigits={0}
                        maxFractionDigits={0}
                        useGrouping={false}
                        required
                        aria-required="true"
                        inputStyle={{ textAlign: "center" }}
                        onValueChange={(e: InputNumberValueChangeEvent) => {
                          const val = e.value;
                          if (val) {
                            const defval = typeof val === "number" ? val : 0.0;
                            setLifespan(defval);
                          }
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td>
                      {" "}
                      <InputTextarea
                        id="spec"
                        value={specific}
                        cols={20}
                        rows={1}
                        placeholder="Indicate SPECIFICATION here."
                        aria-multiline="true"
                        required
                        aria-required="true"
                        className="w-full"
                        onChange={(e) => setSpecific(e.target.value)}
                      />
                    </td>
                    <td></td>
                    <td></td>
                    <td colSpan={2} align="right">
                      <Button
                        type="submit"
                        label="Append Now"
                        icon="pi pi-save"
                        rounded
                        loading={loading}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </TabPanel>
          <TabPanel header="Signatory &amp; other Details">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);

                // Handle submission for the second tab
                const dataLoad = {
                  icsareno: icsareno,
                  activo: 1, //activeTab,

                  empkey: gotPerson?.empkey,
                  designate: gotPerson?.designate,
                  details: details,
                  nagdawat: personnel,
                  ranggo: position,
                };

                try {
                  const reply = await fetch("/property/api/departo/receipt", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataLoad), // 🔑 Key: Convert the payload object into a JSON string for the body
                  });
                  if (reply.ok && toast.current) {
                    toast.current.show({
                      severity: "success",
                      summary: "Success",
                      detail: "Records successfully updated!",
                      life: 5000,
                    });
                    setDontPrint(false);
                  } else if (!reply.ok && toast.current) {
                    toast.current.show({
                      severity: "warn",
                      summary: "Warning",
                      detail: "Records update failed!",
                      life: 5000,
                    });
                  }
                } catch (error) {
                  console.error(
                    "Transaction failed and was rolled back:",
                    error,
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              <table border={0} width="100%" cellSpacing={1} cellPadding={3}>
                <tbody>
                  <tr>
                    <td valign="top" className="surface-border p-2">
                      <label
                        className="font-bold block"
                        style={{ textWrap: "nowrap" }}
                      >
                        Other Details
                      </label>
                    </td>
                    <td valign="top" className="surface-border p-2">
                      <label className="font-bold block"> : </label>
                    </td>
                    <td className="surface-border p-2">
                      <InputTextarea
                        id="dtl"
                        value={details}
                        cols={100}
                        autoResize={false}
                        rows={5}
                        onChange={(e) => {
                          setDetail(e.target.value);
                        }}
                        className="w-full"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <table border={0} width="100%" cellPadding={1} cellSpacing={3}>
                <thead>
                  <tr style={{ backgroundColor: "var(--surface-300)" }}>
                    <th
                      colSpan={2}
                      style={{ border: `var(--surface-border) solid 1px` }}
                    >
                      &nbsp;
                    </th>
                    <th
                      align="center"
                      style={{ border: `var(--surface-border) solid 1px` }}
                    >
                      <label className="font-bold block p-2">Received By</label>
                    </th>
                    <th style={{ border: `var(--surface-border) solid 1px` }}>
                      <label className="font-bold block">Issued By</label>
                    </th>
                    <th style={{ border: `var(--surface-border) solid 1px` }}>
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td align="left">
                      <label
                        className="font-bold block"
                        style={{ textWrap: "nowrap" }}
                      >
                        Printed Name
                      </label>
                    </td>
                    <td>
                      <label className="font-bold block"> : </label>
                    </td>
                    <td className="surface-border p-2">
                      <Dropdown
                        id="dawat"
                        inputId="dawat"
                        value={gotPerson?.empkey}
                        className="w-full"
                        options={employees}
                        optionLabel="humane"
                        optionValue="empkey"
                        onChange={(e: DropdownChangeEvent) => {
                          const initEmp = employees.find(
                            (p) => p.empkey === e.value,
                          );
                          if (initEmp) setPersona(initEmp);
                        }}
                        checkmark={true}
                        highlightOnSelect
                      />
                    </td>
                    <td className="surface-border p-2">
                      <InputText
                        id="cgso"
                        value={personnel}
                        size={25}
                        maxLength={60}
                        className="w-full"
                        onChange={(e) => {
                          setPersonnel(e.target.value);
                        }}
                      />
                    </td>
                    <td align="center" className="surface-border p-2">
                      <Button
                        type="submit"
                        label="Update Now"
                        icon="pi pi-sync"
                        rounded
                        loading={loading}
                        style={{ textWrap: "nowrap", width: "120px" }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td align="left">
                      <label className="font-bold block">Designation</label>
                    </td>
                    <td>
                      <label className="font-bold block"> : </label>
                    </td>
                    <td className="surface-border p-2 ">
                      <InputText
                        id="rank"
                        value={gotPerson?.designate ?? ""}
                        size={25}
                        className="w-full"
                        readOnly
                      />
                    </td>
                    <td className="surface-border p-2">
                      <InputText
                        id="ango"
                        value={position}
                        size={25}
                        className="w-full"
                        onChange={(e) => {
                          setPosition(e.target.value);
                        }}
                      />
                    </td>
                    <td align="center" className="surface-border p-2">
                      <Button
                        type="button"
                        label="Print M.R."
                        icon="pi pi-print"
                        onClick={(e) => menuRef.current?.toggle(e)}
                        rounded
                        disabled={dontPrint}
                        style={{ width: "120px" }}
                      />
                      <Menu model={getActions()} popup ref={menuRef} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </TabPanel>
        </TabView>
        <DataTable
          value={dataList}
          tableStyle={{ minWidth: "50rem" }}
          // paginator
          // paginatorPosition="bottom"
          scrollable
          scrollHeight="flex"
          rows={5}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          showGridlines
          loading={loading}
          title={errorMessage}
          // editMode="row"
          // onRowEditComplete={onRowEditComplete}
          className="p-border-round p-shadow-2 p-surface-0"
        >
          <Column
            field="quantiy"
            header="Quantity"
            headerStyle={{ width: "7%" }}
            align={"center"}
          />
          <Column
            field="issued"
            header="Unit of Issue"
            headerStyle={{ width: "8%" }}
            // editor={(options /*statusEditor(options)*/) => (
            //   <Dropdown
            //     value={options.value}
            //     options={prefixes}
            //     onChange={(e: DropdownChangeEvent) =>
            //       options.editorCallback!(e.value)
            //     }
            //     placeholder="Select a Status"
            //     tooltip="Select a Status"
            //     tooltipOptions={{ position: "top" }}
            //     style={{ width: "40px" }}
            //   />
            // )}
            align={"center"}
          />
          <Column
            field="specifyd"
            header="Item Description"
            headerStyle={{ width: "33%" }}
            body={(
              rowData, // Use body to customize the cell content
            ) => (
              <>
                {rowData.detalye} <br /> {rowData.specifyd}
              </>
            )}
            // editor={(options) => {
            //   return (
            //     <InputTextarea
            //       value={options.value}
            //       onChange={(e) => options.editorCallback!(e.target.value)}
            //       style={{ width: "325px" }}
            //     />
            //   );
            // }}
          />
          <Column
            field="unitcost"
            header="Unit Cost"
            headerStyle={{ width: "12%" }}
            body={(lista: Listahan) => {
              return new Intl.NumberFormat("en-US", {
                style: "decimal",
                currency: "PHP",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(lista.unitcost);
            }}
            align={"right"}
            // editor={(options) => {
            //   return (
            //     <InputNumber
            //       value={options.value}
            //       onValueChange={(e: InputNumberValueChangeEvent) =>
            //         options.editorCallback!(e.value)
            //       }
            //       mode="decimal"
            //       maxLength={10}
            //       size={9}
            //       dir="RTL"
            //     />
            //   );
            // }}
          />
          <Column
            field="totalamt"
            header="Total Amount"
            headerStyle={{ width: "13%" }}
            body={(lista: Listahan) => {
              return new Intl.NumberFormat("en-US", {
                style: "decimal",
                currency: "PHP",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(lista.totalamt);
            }}
            align={"right"}
          />
          <Column
            field="acquired"
            header="Acquired"
            headerStyle={{ width: "12%" }}
            dataType="date"
            body={dateShow}
            align={"center"}
            bodyStyle={{ width: "99px" }}
            style={{ width: "40px" }}
            // editor={(options) => {
            //   // 1. Get the current value from the table cell
            //   const cellValue = options.value;

            //   // 2. CONVERT THE VALUE TO A DATE OBJECT IF IT'S A NON-NULL STRING
            //   let dateValue = null;
            //   if (typeof cellValue === "string" && cellValue) {
            //     // NOTE: You might need a more robust parsing function
            //     // depending on your exact string format (e.g., moment.js)
            //     dateValue = new Date(cellValue);
            //   } else if (cellValue instanceof Date) {
            //     dateValue = cellValue;
            //   }

            //   // 3. Render the Calendar component with the correctly typed value
            //   return (
            //     <Calendar
            //       value={dateValue}
            //       onChange={(e) => options.editorCallback!(e.value)}
            //       dateFormat="mm/dd/yy"
            //     />
            //   );
            // }}
          />
          <Column
            field="uselife"
            header="Useful Life"
            align={"center"}
            headerStyle={{ width: "5%" }}
            // editor={(options) => {
            //   return (
            //     <InputNumber
            //       value={options.value}
            //       onValueChange={(e: InputNumberValueChangeEvent) =>
            //         options.editorCallback!(e.value)
            //       }
            //       mode="decimal"
            //       maxLength={2}
            //       size={1}
            //       dir="RTL"
            //     />
            //   );
            // }}
          />
          <Column
            header="Action"
            // rowEditor={true}
            headerStyle={{ width: "10%" /*, minWidth: "8rem"*/ }}
            align={"center"}
            body={(rowData: Listahan) => {
              return (
                <React.Fragment>
                  <Button
                    icon="pi pi-pencil"
                    rounded
                    raised
                    text
                    className="mr-2"
                    onClick={() => {
                      const dataLoad = {
                        catdtld: rowData.catdtld,
                        quantiy: rowData.quantiy,
                        issued: rowData.issued,
                        detalye: rowData.detalye,
                        specifyd: rowData.specifyd,
                        unitcost: rowData.unitcost,
                        totalamt: rowData.totalamt,
                        acquired:
                          typeof rowData.acquired === "number"
                            ? rowData.acquired
                            : new Date(rowData.acquired).getTime(),
                        uselife: rowData.uselife,
                        property: rowData.property,
                      };
                      setProduct(dataLoad as Listahan);
                      setShowDialog(true);
                    }}
                  />
                  <Button
                    icon="pi pi-trash"
                    rounded
                    raised
                    text
                    severity="danger"
                    onClick={() => {
                      setProduct(rowData);
                      setEraseDialog(true);
                    }}
                    disabled={disableDelete}
                  />
                </React.Fragment>
              );
            }}
          />
        </DataTable>
      </Fieldset>
      <Dialog
        visible={showDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Property Details"
        modal
        className="p-fluid"
        footer={
          <React.Fragment>
            <Button
              label="Cancel"
              icon="pi pi-times"
              outlined
              onClick={() => setShowDialog(false)}
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={() => product && onRowEditComplete(product)}
            />
          </React.Fragment>
        }
        onHide={() => setShowDialog(false)}
      >
        <div className="field">
          <label htmlFor="qnty" className="font-bold">
            Quantity
          </label>
          <br />
          <InputNumber
            id="qnty"
            value={product?.quantiy}
            readOnly
            mode="decimal"
            locale="en-US"
            style={{ width: "15%" }}
            dir="RTL"
          />
        </div>
        <div className="field">
          <label htmlFor="unit" className="font-bold">
            Unit of Issue
          </label>
          <Dropdown
            id="unit"
            inputId="unit"
            value={product?.issued || null}
            placeholder="Select an item"
            className="w-full"
            required
            aria-required="true"
            options={prefixes}
            optionLabel="label"
            onChange={(e) => onDropdownChange(e, "issued")}
            tooltip={"Select an item."}
            tooltipOptions={{ position: "top" }}
            checkmark={true}
            highlightOnSelect
          />
        </div>
        <div className="field">
          <label htmlFor="detl" className="font-bold">
            Item Description
          </label>
          <Dropdown
            id="detl"
            inputId="detl"
            placeholder={myplaceholder}
            className="w-full"
            required
            aria-required="true"
            value={product?.catdtld || null}
            options={unitOptions}
            onChange={(e) => onDropdownChange(e, "catdtld")}
            // --- GROUPING PROPS ---
            optionLabel="label"
            optionGroupLabel="label"
            optionGroupChildren="items"
            scrollHeight="400px"
            checkmark={true}
            highlightOnSelect
          />
          <InputTextarea
            id="spec"
            value={product?.specifyd}
            cols={20}
            rows={3}
            placeholder="Indicate SPECIFICATION here."
            aria-multiline="true"
            required
            aria-required="true"
            className="w-full"
            // onChange={(e) => setSpecific(e.target.value)}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onInputTextAreaChange(e, "specifyd")
            }
          />
        </div>
        <div className="field">
          <label htmlFor="unitcost" className="font-bold">
            Unit Cost
          </label>
          <br />
          <InputNumber
            id="unitcost"
            inputId="unitcost"
            value={product?.unitcost}
            size={13}
            maxLength={13}
            minFractionDigits={2}
            maxFractionDigits={2}
            min={0.0}
            max={99999999.99}
            useGrouping={true}
            dir="RTL"
            required
            aria-required="true"
            onValueChange={(e) => onInputNumberChange(e, "unitcost")}
            style={{ width: "35%" }}
          />
        </div>
        <div className="field">
          <label htmlFor="totalamt" className="font-bold">
            Total Amount
          </label>
          <br />
          <InputNumber
            id="totalamt"
            inputId="totalamt"
            value={(product?.unitcost ?? 0) * (product?.quantiy ?? 0)}
            size={13}
            maxLength={13}
            minFractionDigits={2}
            maxFractionDigits={2}
            min={0.0}
            max={99999999.99}
            useGrouping={true}
            dir="RTL"
            readOnly={true}
            aria-required="true"
            onValueChange={(e) => onInputNumberChange(e, "totalamt")}
            style={{ width: "35%" }}
          />
        </div>
        <div className="field">
          <label htmlFor="acquired" className="font-bold">
            Acquired
          </label>
          <br />
          <Calendar
            value={product?.acquired ? new Date(product.acquired) : null}
            onChange={(e) => {
              const dateValue = e.value instanceof Date ? e.value : null;
              onInputNumberChange(
                { value: dateValue?.getTime() } as InputNumberValueChangeEvent,
                "acquired",
              );
            }}
            dateFormat="mm/dd/yy"
            style={{ width: "10rem" }}
          />
        </div>
        <div className="field">
          <label htmlFor="uselife" className="font-bold">
            Useful Life
          </label>
          <br />
          <InputNumber
            id="uselife"
            inputId="uselife"
            value={product?.uselife}
            onValueChange={(e) => onInputNumberChange(e, "uselife")}
            mode="decimal"
            maxLength={2}
            size={1}
            dir="RTL"
            style={{ width: "15%" }}
          />
        </div>
      </Dialog>
      <Dialog
        visible={eraseDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={
          <React.Fragment>
            <Button
              type="button"
              label="No"
              icon="pi pi-times"
              outlined
              onClick={() => setEraseDialog(false)}
            />
            <Button
              type="button"
              label="Yes"
              icon="pi pi-check"
              severity="danger"
              onClick={() => product && deleteProperty(product)}
            />
          </React.Fragment>
        }
        onHide={() => setEraseDialog(false)}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {product && (
            <span>
              Are you sure you want to delete <b>{product.detalye}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </>
  );
}
