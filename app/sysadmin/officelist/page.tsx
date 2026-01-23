"use client";
/**
 * /app/sysadmin/officelist/page.tsx
 */
import React, { useEffect, useState } from "react";
import { Fieldset } from "primereact/fieldset";
import {
  DataTable,
  DataTableFilterMeta,
  DataTableFilterMetaData,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Dialog } from "primereact/dialog";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

interface Office {
  offcid: string;
  opesina: string;
  located: string;
  headed: string;
}
interface Employee {
  empkey: string;
  humane: string;
  designate: string;
}

const defaultFilters: DataTableFilterMeta = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  // ngalan: {
  //   operator: FilterOperator.OR,
  //   constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  // },
  // categoria: {
  //   operator: FilterOperator.OR,
  //   constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  // },
  opesina: {
    operator: FilterOperator.OR,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  /*representative: { value: null, matchMode: FilterMatchMode.IN },
  date: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
  balance: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  status: {
    operator: FilterOperator.OR,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  activity: { value: null, matchMode: FilterMatchMode.BETWEEN },
  verified: { value: null, matchMode: FilterMatchMode.EQUALS },*/
};

export default function ParIcsAllList() {
  const [isLoading, setIsLoading] = useState(false);
  const [openDlg, setOpenDlg] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [offices, setOffices] = useState<Office[]>([]);
  const [chiefs, setChiefs] = useState<Employee[]>([]);

  const [chief, setChief] = useState<Employee | null>(null);
  const [napili, setNapili] = useState<Office | null>(null);

  const [filters, setFilters] = useState<DataTableFilterMeta>(defaultFilters);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  useEffect(() => {
    const loadOffices = async () => {
      setIsLoading(true);
      try {
        const result = await fetch("/property/api/sysadmin/officelist", {
          method: "GET",
        });
        if (!result.ok) throw new Error(`HTTP error! status: ${result.status}`);
        const data: Office[] = await result.json();
        setOffices(data);

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setErrMsg("Failed to load Offices List.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOffices();
  }, []);
  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          outlined
          onClick={() => initFilters()}
        />
        <IconField iconPosition="right">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search Category"
          />
        </IconField>
      </div>
    );
  };
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };

    (_filters["global"] as DataTableFilterMetaData).value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };
  const initFilters = () => {
    setFilters(defaultFilters);
    setGlobalFilterValue("");
  };

  return (
    <>
      <Fieldset legend="Offices List">
        <DataTable
          value={offices}
          tableStyle={{ minWidth: "56rem" }}
          paginator
          // paginatorPosition="both"
          rows={10}
          rowsPerPageOptions={[10, 20, 50, offices.length]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          showGridlines
          loading={isLoading}
          title={errMsg}
          filters={filters}
          globalFilterFields={["opesina"]}
          header={renderHeader}
          emptyMessage="No data found."
          onFilter={(e) => setFilters(e.filters)}
          dataKey="offcid"
        >
          <Column
            header="#"
            style={{ width: "5%", textAlign: "center" }}
            body={(_, options) => options.rowIndex + 1} // 👈 row counter
          />
          <Column
            field="located"
            header="Location"
            style={{ width: "12%", textAlign: "center" }}
          />
          <Column field="opesina" header="Offices" />
          <Column
            header="Action"
            style={{ width: "9%", textAlign: "center" }}
            body={(rowData: Office) => {
              return (
                <Button
                  type="button"
                  onClick={async () => {
                    // Load Chiefs/Heads of Office
                    const nigamit = rowData;
                    const result = await fetch(
                      `/property/api/departo/receipt/employee?offcid=${nigamit.offcid}`,
                      {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                      }
                    );
                    const datus = await result.json();
                    const emplist: Employee[] = datus.map((item: Employee) => ({
                      humane: item.humane,
                      empkey: item.empkey,
                      designate: item.designate,
                    }));
                    setChiefs(emplist);
                    setChief(
                      nigamit.headed
                        ? emplist.find((p) => p.empkey === nigamit.headed) ||
                            null
                        : null
                    );
                    setNapili(nigamit);
                    setOpenDlg(true);
                  }}
                  className="w-6 h-6 scale-75"
                  rounded
                />
              );
            }}
          />
        </DataTable>
      </Fieldset>
      <Dialog
        visible={openDlg}
        // style={{ width: "27rem" }}
        // breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Assign Dep't Head Dialog"
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
                  form="offcFrm"
                />
              </div>
              <div style={{ textAlign: "right" }} className="bg-green-200 p-4">
                <Button
                  type="button"
                  label="Close"
                  icon="pi pi-times-circle"
                  severity="secondary"
                  onClick={() => setOpenDlg(false)}
                />
              </div>
            </div>
          </React.Fragment>
        }
        onHide={() => setOpenDlg(false)}
      >
        <form
          id="offcFrm"
          onSubmit={async (evt) => {
            evt.preventDefault(); // prevent page reload
            if (!chief) return;
            try {
              const payload = {
                offcid: napili?.offcid, // 👈 include offcid here
                headed: chief.empkey,
              };
              const result = await fetch("/property/api/sysadmin/officelist", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              if (!result.ok)
                throw new Error(
                  result.statusText || "Failed to create employee"
                );
            } catch (error) {
              console.error("Error updating data:", error);
            } finally {
              setOpenDlg(false);
            }
          }}
        >
          <Dropdown
            id="dawat"
            inputId="dawat"
            value={chief}
            className="w-full"
            options={chiefs}
            optionLabel="humane"
            onChange={(e: DropdownChangeEvent) => {
              const initEmp = chiefs.find((p) => p.empkey === e.value.empkey);
              if (initEmp) setChief(initEmp);
            }}
            checkmark={true}
            highlightOnSelect={false}
          />
        </form>
      </Dialog>
    </>
  );
}
