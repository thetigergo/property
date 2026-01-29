"use client";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Calendar } from "primereact/calendar";
import { Panel } from "primereact/panel";
import { parse } from "date-fns";
import { Button } from "primereact/button";

export default function ParIcsDeptRpt() {
  const { nigamit } = useAuth();

  const [frDate, setFrDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [maxDate, setMaxDate] = useState<Date>();

  return (
    <Panel
      header="Report on the Physical Count of Property, Plant, and Equipment"
      onLoad={() => setMaxDate(new Date())}
    >
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
                      nigamit?.officeId
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
                      nigamit?.officeId
                    }`,
                    "_blank",
                    "width=760,height=800,menubar=0,toolbar=0,scrollbars=no,location=0,resizable=no"
                  );
                }}
                style={{ width: "95px" }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Panel>
  );
}
