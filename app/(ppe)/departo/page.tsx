"use client";

import { useAuth } from "@/context/AuthContext"; // 👈 For state management
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
import { Dialog } from "primereact/dialog";
import { InputIcon } from "primereact/inputicon";
import axios from "axios";

interface Undone {
  icsareno: number;
  categoria: string;
  preparar: string;
  gikanni: boolean;
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

export default function DepartoPage() {
  const { nigamit } = useAuth();
  const [undone, setUndone] = useState<Undone[]>([]);
  const [selectedRow, setSelectedRow] = useState<Undone | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [product, setProduct] = useState<number>(0);
  const [eraseDialog, setEraseDialog] = useState<boolean>(false);

  const [filters, setFilters] = useState<DataTableFilterMeta>(defaultFilters);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  const toast = useRef<Toast>(null);
  const menuRef = useRef<Menu>(null);

  const router = useRouter();

  useEffect(() => {
    // 1. Create the controller instance
    const controller = new AbortController();
    const { signal } = controller; // 2. Get the signal from the controller

    const fetchData = async () => {
      setIsLoading(true);
      try {
        /*const result = await fetch("/property/api/departo/undone/" + nigamit?.officeId,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );*/
        const result = await axios.get(
          `/property/api/departo/undone/${nigamit?.officeId}`,
          { signal: signal }, // 2. Pass the signal here
        ); // Axios automatically parses JSON and throws for non-2xx status

        // Axios throws automatically for non-2xx, so result.status is likely 200 here
        if (Array.isArray(result.data)) {
          const data: Undone[] = result.data;
          setUndone(data);
          initFilters();
        } else {
          console.error("Received data is not an array:", result.data);
          setUndone([]); // Fallback to empty array to prevent crash
        }
      } catch (error) {
        // 3. Handle the Abort error differently so it doesn't show a "Load Error" toast
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
          return; // Exit without showing error messages to the user
        }
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
        // 4. Only set loading to false if the request wasn't aborted
        // (Optional: standard practice is to let it run, but helps prevent state updates on unmounted components)
        setIsLoading(false);
      }
    };

    if (nigamit?.officeId) fetchData();

    // 5. THE CLEANUP: This runs when the component unmounts or officeId changes
    return () => controller.abort();
  }, [nigamit?.officeId]);

  const dateShow = (rowData: Undone) => {
    return formatDate(new Date(rowData.preparar));
  };

  /*const formatDate = (value: Date) => {
    return value.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }); //e.g. "11/20/1975"
  };*/
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
      label: "Retrieve",
      icon: "pi pi-angle-double-up",
      command: () => router.push(`/departo/modify/${selectedRow?.icsareno}`),
    },
    {
      label: "Delete",
      icon: "pi pi-times",
      command: () => selectedRow && confirmErase(selectedRow.icsareno),
    },
  ];
  const confirmErase = (icsareno: number) => {
    setProduct(icsareno);
    setEraseDialog(true);
  };
  const handleDelete = async () => {
    // 1. Create the controller
    const controller = new AbortController();
    const { signal } = controller;
    try {
      const result = await fetch(`/property/api/departo/undone/${product}`, {
        method: "DELETE",
        signal: signal, // 2. Pass the signal here
      });

      // if (!res.ok) throw new Error("Delete failed");
      if (!result.ok) {
        setErrorMessage("Deletion failed!");
      } else {
        // Refresh local state
        setUndone((prev) => prev.filter((item) => item.icsareno !== product));

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
    }
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
      <Fieldset legend="List of Unfinished ICS/PAR" className="h-auto">
        <DataTable
          value={undone}
          tableStyle={{ minWidth: "50rem" }}
          paginator
          // paginatorPosition="both"
          rows={9}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          showGridlines
          loading={isLoading}
          title={errorMessage}
          filters={filters}
          globalFilterFields={["categoria"]}
          header={renderHeader}
          emptyMessage="No unfinish ICS/PAR found."
          onFilter={(e) => setFilters(e.filters)}
          dataKey="icsareno"
        >
          <Column field="icsareno" header="ICS/PAR No." />
          <Column field="categoria" header="Category Name" />
          <Column
            field="preparar"
            dataType="date"
            body={dateShow}
            header="Prepared"
          />
          <Column
            header="Action"
            body={(rowData: Undone) => {
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
              onClick={() => {
                if (product) handleDelete();
                setEraseDialog(false);
              }}
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
