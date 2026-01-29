"use client";
/**
 * Sysadmin Page - Unproven ICS/PAR List
 * /app/sysadmin/page.tsx
 */

import { Fieldset } from "primereact/fieldset";
import {
  DataTable,
  DataTableFilterMeta,
  DataTableFilterMetaData,
} from "primereact/datatable";
import React, { useState, useEffect, useRef } from "react";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useRouter } from "next/navigation"; // for routing
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputIcon } from "primereact/inputicon";

interface Unproven {
  ngalan: string;
  categoria: string;
  opesina: string;
  offcid: string;
  preparar: number;
  paricsno: number;
}

const defaultFilters: DataTableFilterMeta = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  ngalan: {
    operator: FilterOperator.OR,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  categoria: {
    operator: FilterOperator.OR,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
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

export default function AdminPage() {
  const [unproven, setUnproven] = useState<Unproven[]>([]);
  const [selectedRow, setSelectedRow] = useState<Unproven | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [filters, setFilters] = useState<DataTableFilterMeta>(defaultFilters);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await fetch("/property/api/sysadmin/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

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

        const data: Unproven[] = await result.json();
        setUnproven(data);
        initFilters();
      } catch (error) {
        console.error("Error loading data:", error);
        const fallbackMessage = "Failed to load Unvalidated ICS/PAR list.";
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

    fetchData();
  }, []);

  const dateShow = (rowData: Unproven) => {
    return formatDate(new Date(rowData.preparar));
  };
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
    }).formatToParts(value);

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

  const getActions = () => [
    {
      label: "Print I.C.S.",
      icon: "pi pi-file-pdf",
      command: () => {
        window.open(
          `/propinv/custodian.html?icsareno=${selectedRow?.paricsno}&rptname=custodian`,
          "_blank",
          "width=760,height=600,menubar=0,toolbar=0,scrollbars=no,location=0,resizable=no"
        );
      },
    },
    {
      label: "Print P.A.R.",
      icon: "pi pi-file-pdf",
      command: () => {
        window.open(
          `/propinv/acknowledge.html?icsareno=${selectedRow?.paricsno}&rptname=acknowledge`,
          "_blank",
          "width=760,height=600,menubar=0,toolbar=0,scrollbars=no,location=0,resizable=no"
        );
      },
    },
    {
      separator: true,
      template: () => <hr className="border-neutral-300" />,
    },
    {
      label: "Validate M.R.",
      icon: "pi pi-check-square",
      command: () => router.push(`/sysadmin/verifyer/${selectedRow?.paricsno}`),
    },
    {
      label: "Retrieve",
      icon: "pi pi-angle-double-up",
      command: () => router.push(`/departo/modify/${selectedRow?.paricsno}`),
    },
  ];
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
      <Toast ref={toast} />
      <Fieldset legend="List of Unvalidated ICS/ARE" className="h-auto">
        <DataTable
          value={unproven}
          tableStyle={{ minWidth: "86rem" }}
          paginator
          // paginatorPosition="both"
          rows={10}
          rowsPerPageOptions={[10, 20, 50, unproven.length]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          showGridlines
          loading={isLoading}
          title={errorMessage}
          filters={filters}
          globalFilterFields={["ngalan", "categoria", "opesina"]}
          header={renderHeader}
          emptyMessage="No Unvalidated ICS/PAR found."
          onFilter={(e) => setFilters(e.filters)}
          dataKey="paricsno"
        >
          <Column field="ngalan" header="Employee" />
          <Column field="categoria" header="Unit/Item" />
          <Column field="opesina" header="Office/Department" />
          <Column
            field="preparar"
            dataType="date"
            body={dateShow}
            header="Date Prepared"
          />
          <Column
            header="Action"
            body={(rowData: Unproven) => {
              return (
                <Button
                  type="button"
                  onClick={(e) => {
                    // 1. Set the state to the current row data
                    setSelectedRow(rowData);
                    // 2. Toggle the single, shared menu
                    menuRef.current?.toggle(e);
                  }}
                  className="w-6 h-6 scale-75"
                  rounded
                />
              );
            }}
            align={"center"}
            bodyClassName="text-center"
          />
        </DataTable>
        <Menu model={getActions()} popup ref={menuRef} />
      </Fieldset>
    </>
  );
}
