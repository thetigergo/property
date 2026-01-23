"use client";
/**
 * Report on the Physical Count of Property, Plant, and Equipment
 * /app/sysadmin/physical/page.tsx
 */
import { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import { Panel } from "primereact/panel";
import { parse } from "date-fns";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

interface Category {
  catgid: string;
  catego: string;
  breed: string;
  parent: string;
}
interface Office {
  offcid: string;
  opesina: string;
  located: string;
  headed: string;
}

export default function ParIcsAllRpt() {
  const [frDate, setFrDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [maxDate, setMaxDate] = useState<Date>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);

  const [pickedCategory, setPickedCategory] = useState<Category | null>(null);
  const [pickedOffice, setPickedOffice] = useState<Office | null>(null);

  useEffect(() => {
    const loadCategory = async () => {
      const result = await fetch("/property/api/departo/receipt/loadcats", {
        method: "GET",
      });
      if (!result.ok) throw new Error(`HTTP error! status: ${result.status}`);
      const data: Category[] = await result.json();
      setCategories(data);
    };
    const loadOffices = async () => {
      const result = await fetch("/property/api/sysadmin/officelist", {
        method: "GET",
      });
      if (!result.ok) throw new Error(`HTTP error! status: ${result.status}`);
      const data: Office[] = await result.json();
      setOffices(data);
    };
    loadCategory();
    loadOffices();
  }, []);

  return (
    <Panel
      header="Report on the Physical Count of Property, Plant, and Equipment"
      onLoad={() => setMaxDate(new Date())}
    >
      <TabView>
        <TabPanel header="By Category">
          <table border={0} width="100%" cellSpacing={3} cellPadding={3}>
            <tbody>
              <tr>
                <td className="surface-border p-2">
                  <label className="font-bold block">Date From</label>
                </td>
                <td className="surface-border p-2">
                  <label className="font-bold block">:</label>
                </td>
                <td className="surface-border p-2">
                  <Calendar
                    id="from"
                    value={frDate}
                    dateFormat="mm/dd/yy"
                    style={{ width: "10rem" }}
                    showIcon
                    onSelect={(e) => {
                      const val = e.value;
                      if (val) {
                        const pickedDate =
                          typeof val === "string"
                            ? parse(val, "MM/dd/yy", new Date())
                            : val instanceof Date
                            ? val
                            : null;
                        if (pickedDate) setFrDate(pickedDate);
                      }
                    }}
                    minDate={new Date(1900, 0, 1)}
                    maxDate={maxDate}
                  />
                </td>
                <td className="surface-border p-2">
                  <Button
                    label="Print I.C.S."
                    rounded
                    onClick={() => {
                      window.open(
                        `/propinv/physicalconsul.html?rptname=physicalconsul&dateFr=${frDate.getTime()}&dateTo=${toDate.getTime()}&acctid=${
                          pickedCategory?.catgid
                        }`,
                        "_blank",
                        "width=760,height=800,menubar=0,toolbar=0,scrollbars=no,location=0,resizable=no"
                      );
                    }}
                    style={{ width: "95px" }}
                  />
                </td>
              </tr>
              <tr>
                <td className="surface-border p-2">
                  <label className="font-bold block">Date To</label>
                </td>
                <td className="surface-border p-2">
                  <label className="font-bold block">:</label>
                </td>
                <td className="surface-border p-2">
                  <Calendar
                    id="todt"
                    value={toDate}
                    dateFormat="mm/dd/yy"
                    style={{ width: "10rem" }}
                    showIcon
                    onSelect={(e) => {
                      const val = e.value;
                      if (val) {
                        const pickedDate =
                          typeof val === "string"
                            ? parse(val, "MM/dd/yy", new Date())
                            : val instanceof Date
                            ? val
                            : null;
                        if (pickedDate) setToDate(pickedDate);
                      }
                    }}
                    minDate={new Date(1900, 0, 1)}
                    maxDate={maxDate}
                  />
                </td>
                <td className="surface-border p-2">
                  <Button
                    label="Print P.A.R."
                    rounded
                    onClick={() => {
                      window.open(
                        `/propinv/physicalconsol.html?rptname=physicalconsol&dateFr=${frDate.getTime()}&dateTo=${toDate.getTime()}&acctid=${
                          pickedCategory?.catgid
                        }`,
                        "_blank",
                        "width=760,height=800,menubar=0,toolbar=0,scrollbars=no,location=0,resizable=no"
                      );
                    }}
                    style={{ width: "95px" }}
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
                  <Dropdown
                    id="catego"
                    inputId="catego"
                    value={pickedCategory}
                    className="w-full"
                    options={categories}
                    optionLabel="catego"
                    optionValue="catgid"
                    onChange={(e: DropdownChangeEvent) =>
                      setPickedCategory(e.value)
                    }
                    checkmark={true}
                    highlightOnSelect={false}
                    tooltip={pickedCategory?.catego ?? "Select a category."}
                  />
                </td>
                <td className="surface-border p-2"></td>
              </tr>
            </tbody>
          </table>
        </TabPanel>
        <TabPanel header="By Office">
          <table border={0} width="100%" cellSpacing={3} cellPadding={3}>
            <tbody>
              <tr>
                <td className="surface-border p-2">
                  <label className="font-bold block">Date From</label>
                </td>
                <td className="surface-border p-2">
                  <label className="font-bold block">:</label>
                </td>
                <td className="surface-border p-2">
                  <Calendar
                    id="from"
                    value={frDate}
                    dateFormat="mm/dd/yy"
                    style={{ width: "10rem" }}
                    showIcon
                    onSelect={(e) => {
                      const val = e.value;
                      if (val) {
                        const pickedDate =
                          typeof val === "string"
                            ? parse(val, "MM/dd/yy", new Date())
                            : val instanceof Date
                            ? val
                            : null;
                        if (pickedDate) setFrDate(pickedDate);
                      }
                    }}
                    minDate={new Date(1900, 0, 1)}
                    maxDate={maxDate}
                  />
                </td>
                <td className="surface-border p-2">
                  <Button
                    label="Print I.C.S."
                    rounded
                    onClick={() => {
                      window.open(
                        `/propinv/physicalofficeics.html?rptname=physicalofficeics&dateFr=${frDate.getTime()}&dateTo=${toDate.getTime()}&acctid=${
                          pickedOffice?.offcid
                        }`,
                        "_blank",
                        "width=760,height=800,menubar=0,toolbar=0,scrollbars=no,location=0,resizable=no"
                      );
                    }}
                    style={{ width: "95px" }}
                  />
                </td>
              </tr>
              <tr>
                <td className="surface-border p-2">
                  <label className="font-bold block">Date To</label>
                </td>
                <td className="surface-border p-2">
                  <label className="font-bold block">:</label>
                </td>
                <td className="surface-border p-2">
                  <Calendar
                    id="todt"
                    value={toDate}
                    dateFormat="mm/dd/yy"
                    style={{ width: "10rem" }}
                    showIcon
                    onSelect={(e) => {
                      const val = e.value;
                      if (val) {
                        const pickedDate =
                          typeof val === "string"
                            ? parse(val, "MM/dd/yy", new Date())
                            : val instanceof Date
                            ? val
                            : null;
                        if (pickedDate) setToDate(pickedDate);
                      }
                    }}
                    minDate={new Date(1900, 0, 1)}
                    maxDate={maxDate}
                  />
                </td>
                <td className="surface-border p-2">
                  <Button
                    label="Print P.A.R."
                    rounded
                    onClick={() => {
                      window.open(
                        `/propinv/physicalofficeare.html?rptname=physicalofficeare&dateFr=${frDate.getTime()}&dateTo=${toDate.getTime()}&acctid=${
                          pickedOffice?.offcid
                        }`,
                        "_blank",
                        "width=760,height=800,menubar=0,toolbar=0,scrollbars=no,location=0,resizable=no"
                      );
                    }}
                    style={{ width: "95px" }}
                  />
                </td>
              </tr>
              <tr>
                <td className="surface-border p-2">
                  <label className="font-bold block">Office</label>
                </td>
                <td className="surface-border p-2">
                  <label className="font-bold block">:</label>
                </td>
                <td className="surface-border p-2">
                  <Dropdown
                    id="offcid"
                    inputId="offcid"
                    value={pickedOffice}
                    className="w-full"
                    options={offices}
                    optionLabel="opesina"
                    optionValue="offcid"
                    onChange={(e: DropdownChangeEvent) =>
                      setPickedOffice(e.value)
                    }
                    checkmark={true}
                    highlightOnSelect={false}
                    tooltip={pickedOffice?.opesina ?? "Select a Office."}
                  />
                </td>
                <td className="surface-border p-2"></td>
              </tr>
            </tbody>
          </table>
        </TabPanel>
      </TabView>
    </Panel>
  );
}
