"use client";
import { useAuth } from "@/context/AuthContext";
import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { Fieldset } from "primereact/fieldset";
import {
  DataTable,
  DataTableFilterMeta,
  DataTableFilterMetaData,
} from "primereact/datatable";
import { Column } from "primereact/column";
import {
  InputNumber,
  // InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { Menu } from "primereact/menu";
import { useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { InputIcon } from "primereact/inputicon";
import axios from "axios";

interface PARICSData {
  paricsno: number;
  employee: string;
  categoria: string;
  preparar: number;
  status: boolean;
}
const defaultFilters: DataTableFilterMeta = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  /*name: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },*/
  categoria: {
    operator: FilterOperator.AND,
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

export default function ParIcsListing() {
  const { nigamit } = useAuth();

  const [paricsData, setParicsData] = useState<PARICSData[]>([]);
  const [selectedRow, setSelectedRow] = useState<PARICSData | null>(null);

  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);

  const [anios, setAnios] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState<DataTableFilterMeta>(defaultFilters);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
  const [product, setProduct] = useState<number>(0);
  const [eraseDialog, setEraseDialog] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    // 1. Create the controller instance
    const controller = new AbortController();
    const { signal } = controller; // 2. Get the signal from the controller

    const fetchData = async () => {
      setIsLoading(true);
      try {
        /*const result = await fetch(
          "/property/api/departo/listing/" + nigamit?.officeId,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );*/
        const result = await axios.get("/property/api/departo/listing", {
          params: {
            anios: anios,
            offcid: nigamit?.officeId,
          },
          signal: signal, // 3. Pass the signal to the fetch/axios request
        });
        /*if (result.status !== 200) {
          const message = result.statusText || "Unknown error";
          setErrorMessage(message);
          toast.current?.show({
            severity: "error",
            summary: "Load Error",
            detail: message,
            life: 5000,
          });
          return;
        }*/
        const data: PARICSData[] = result.data;
        setParicsData(data);
        initFilters();
      } catch (error) {
        // 1. SILENTLY HANDLE ABORT: Do not show toasts for intentional cancellations
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
          return;
        }

        // 2. HANDLE REAL ERRORS
        console.error("Error loading data:", error);
        const fallbackMessage = "Failed to load Unfinished ICS/PAR list.";
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

    if (nigamit !== null) fetchData();

    // 3. THE CLEANUP: Essential for the AbortController to work
    return () => controller.abort();
  }, [nigamit, anios]);

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
  const getActions = () => [
    {
      label: "Print I.C.S.",
      icon: "pi pi-file-pdf",
      command: () => {
        if (typeof window !== "undefined")
          window.open(
            `/propinv/custodian.html?icsareno=${selectedRow?.paricsno}&rptname=custodian`,
            "_blank",
            "width=760,height=600,menubar=0,toolbar=0,scrollbars=no,location=0,resizable=no",
          );
      },
    },
    {
      label: "Print P.A.R.",
      icon: "pi pi-file-pdf",
      command: () => {
        if (typeof window !== "undefined")
          window.open(
            `/propinv/acknowledge.html?icsareno=${selectedRow?.paricsno}&rptname=acknowledge`,
            "_blank",
            "width=760,height=600,menubar=0,toolbar=0,scrollbars=no,location=0,resizable=no",
          );
      },
    },
    {
      label: "View Verified ICS/ARE",
      icon: "pi pi-verified",
      visible: selectedRow?.status,
    },
    {
      label: "Retrieve",
      icon: "pi pi-angle-double-up",
      command: () =>
        router.push("/ppe/departo/modify/" + selectedRow?.paricsno),
      disabled: selectedRow?.status,
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      command: () => selectedRow && confirmErase(selectedRow.paricsno),
      disabled: selectedRow?.status,
    },
  ];
  const confirmErase = (icsareno: number) => {
    setProduct(icsareno);
    setEraseDialog(true);
  };
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      /*const result = await fetch(`/property/api/departo/undone/${product}`, {
        method: "DELETE",
      });*/
      const result = await axios.delete(
        `/property/api/departo/undone/${product}`,
      );
      // if (!res.ok) throw new Error("Delete failed");
      if (result.status !== 200) {
        setErrorMessage("Deletion failed!");
      } else {
        // Refresh local state
        setParicsData((prev) =>
          prev.filter((item) => item.paricsno !== product),
        );

        toast.current?.show({
          severity: "success",
          summary: "Deleted",
          detail: `Record ${product} removed.`,
          life: 5000,
        });
      }
    } catch (error) {
      const err = error as Error;
      toast.current?.show({
        severity: "error",
        summary: "Delete Error",
        detail: err?.message || "Could not delete record.",
        life: 3000,
      });
    } finally {
      setProduct(0);
      setIsLoading(false);
      setEraseDialog(false);
    }
  };
  const dateShow = (rowData: PARICSData) => {
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
  return (
    <>
      <Toast ref={toast} />
      <Fieldset legend="Listing of all ICS &amp; PAR" className="h-auto">
        <div className="card flex flex-wrap gap-3 p-fluid">
          <label htmlFor="minmax-buttons" className="font-bold block mb-2">
            Select Year :
          </label>
          <div className="flex-auto">
            <InputNumber
              inputId="minmax-buttons"
              value={anios}
              // onValueChange={(e) => onYearChange(e)}
              onValueChange={(evt) => setAnios(evt.value ?? 0)}
              showButtons
              mode="decimal"
              min={1970}
              max={3000}
              size={4}
              maxLength={4}
              minFractionDigits={0}
              maxFractionDigits={0}
              useGrouping={false}
              style={{ height: "25px", width: "100px" }}
            />
          </div>
        </div>
        <DataTable
          value={paricsData}
          tableStyle={{ minWidth: "50rem" }}
          paginator
          rows={9}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          showGridlines
          loading={isLoading}
          title={errorMessage}
          filters={filters}
          globalFilterFields={["categoria", "employee"]}
          header={renderHeader}
          emptyMessage="No ICS/PAR on the List."
          onFilter={(e) => setFilters(e.filters)}
          dataKey="paricsno"
        >
          <Column field="employee" header="Employees"></Column>
          <Column
            field="paricsno"
            header="ICS/PAR No."
            align={"center"}
          ></Column>
          <Column field="categoria" header="Category Name"></Column>
          <Column
            field="preparar"
            header="Date Prepared"
            body={dateShow}
            align={"center"}
          ></Column>
          <Column
            field="status"
            header="Status"
            align={"center"}
            body={(rowData: PARICSData) =>
              rowData.status ? "Validated" : "Unvalidated"
            }
          ></Column>
          <Column
            header="Action"
            body={(rowData: PARICSData) => {
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
              onClick={() => product && handleDelete()}
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
              Are you sure you want to delete PAR/ICS #: <b>{product}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </>
  );
}
