"use client";

import Image from "next/image";
import React, { useEffect, useContext, useRef, useState } from "react";
import { Fieldset } from "primereact/fieldset";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { Toast } from "primereact/toast";
import { SyntheticEvent } from "react"; // 👈 Import SyntheticEvent
import { PrimeReactContext } from "primereact/api";
import { PrimeIcons } from "primereact/api";
import { useAuth } from "@/context/AuthContext"; // 👈 For state management
import { Dialog } from "primereact/dialog";
import {
  DataTable,
  DataTableFilterMeta,
  DataTableFilterMetaData,
} from "primereact/datatable";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { IconField } from "primereact/iconfield";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { InputIcon } from "primereact/inputicon";

import "primeflex/primeflex.css"; // PrimeFlex

interface Category {
  catgid: string;
  catego: string;
}

const defaultFilters: DataTableFilterMeta = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  /*name: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },*/
  catego: {
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

export default function TopHeader() {
  const { nigamit, logout } = useAuth();

  const menuRef = useRef<Menu>(null);
  const toast = useRef<Toast>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState<DataTableFilterMeta>(defaultFilters);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  const light = "lara-light-blue"; //"lara-light-blue"
  const darkd = "lara-dark-purple"; //"lara-dark-purple"

  const [currentTheme, setCurrentTheme] = useState(light);
  const context = useContext(PrimeReactContext) as {
    changeTheme?: (
      currentTheme: string,
      newTheme: string,
      linkElementId: string,
      callback: () => void,
    ) => void;
  };
  /**
   * This function simulates the logic of your <ThemeSwitcher /> component.
   * It is called when the menu item is clicked.
   */
  const handleThemeSwitch = () => {
    const newTheme = currentTheme === light ? darkd : light;
    const linkElementId = "theme-link";
    const linkElement = document.getElementById(linkElementId);

    if (linkElement && context.changeTheme) {
      context.changeTheme(currentTheme, newTheme, linkElementId, () => {
        console.log(`Theme changed to ${newTheme}`);
        setCurrentTheme(newTheme); // update state
      });
    } else {
      console.warn("changeTheme is not available. Is PrimeReactProvider set?");
    }
  };
  const items: MenuItem[] = [
    {
      label: "Categories",
      icon: "pi pi-box",
      command: () => setShowDialog(true),
    },
    {
      separator: true, // 🔹 This adds the horizontal divider
    },
    {
      label: currentTheme.includes("dark") ? "Switch Light" : "Switch Dark",
      icon: currentTheme.includes("dark") ? PrimeIcons.SUN : PrimeIcons.MOON,
      command: handleThemeSwitch,
    },
    {
      separator: true, // 🔹 This adds the horizontal divider
    },
    {
      label: "Logout",
      icon: "pi pi-fw pi-sign-out",
      command: () => {
        // 1. **Clear Global State**
        setTimeout(() => logout(), 100);

        // Optional: Show success feedback
        toast.current?.show({
          severity: "success",
          summary: "Logged Out",
          detail: "You have been successfully logged out.",
          life: 3000,
        });
      },
    },
  ];
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      const result = await fetch("/property/api", {
        method: "GET",
      });
      if (!result.ok) throw new Error(`HTTP error! status: ${result.status}`);
      const data: Category[] = await result.json();
      setCategories(data);
      setLoading(false);
    };
    loadCategories();
  }, []);
  const initFilters = () => {
    setFilters(defaultFilters);
    setGlobalFilterValue("");
  };
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };

    (_filters["global"] as DataTableFilterMetaData).value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };
  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <div style={{ textAlign: "left" }}>
          <Button
            type="button"
            icon="pi pi-filter-slash"
            label="Clear"
            outlined
            onClick={() => initFilters()}
          />
        </div>
        <div style={{ textAlign: "right" }}>
          <IconField iconPosition="right">
            <InputIcon className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Search Category"
            />
          </IconField>
        </div>
      </div>
    );
  };
  return (
    <>
      <Fieldset className="h-37">
        <div>
          <div style={{ float: "left" }}>
            <Image
              src="/property/weblogo.png"
              width={355}
              height={80}
              alt="weblogo"
              priority
            />
          </div>
          <div style={{ float: "right" }}>
            <div className="card flex justify-content-center">
              <Toast ref={toast}></Toast>
              <Menu
                model={items}
                popup
                ref={menuRef}
                id="popup_menu_right"
                popupAlignment="right"
              />
              <Button
                label={nigamit?.pangalan}
                icon="pi pi-user"
                className="mr-2"
                onClick={(event) => {
                  menuRef.current?.toggle(event as unknown as SyntheticEvent); // <-- Fixed: Passing the entire event object
                }}
                aria-controls="popup_menu_right"
                aria-haspopup
              />
            </div>
          </div>
        </div>
      </Fieldset>
      <Dialog
        visible={showDialog}
        style={{ width: "55rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Categories and Details"
        modal
        className="p-fluid"
        footer={
          <Button
            label="Close"
            icon="pi pi-times"
            outlined
            onClick={() => setShowDialog(false)}
          />
        }
        onHide={() => setShowDialog(false)}
      >
        <DataTable
          value={categories}
          tableStyle={{ minWidth: "50rem" }}
          paginator
          rows={18}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          showGridlines
          title="Felix Rendon"
          loading={isLoading}
          emptyMessage="No data found."
          filters={filters}
          globalFilterFields={["catego"]}
          header={renderHeader}
          onFilter={(e) => setFilters(e.filters)}
          dataKey="catgid"
        >
          <Column
            field="catgid"
            header="ICS/PAR No."
            body={(rowData: Category): string => {
              const size: number = rowData.catgid?.length ?? 0;
              return `${rowData.catgid}${size === 18 ? " ==>" : ""}`;
            }}
            style={{ width: "180px" }}
          />
          <Column
            field="catego"
            header="Category Name"
            body={(rowData: Category) => {
              const size: number = rowData.catgid?.length ?? 0;
              const balik: string = ".".repeat(
                size === 7
                  ? 0
                  : size === 11
                    ? 5
                    : size === 14
                      ? 10
                      : size === 18
                        ? 15
                        : 0,
              );
              return `${balik}${rowData.catego}`;
            }}
          />
        </DataTable>
      </Dialog>
    </>
  );
}
