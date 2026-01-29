"use client";
/**
 * /app/sysadmin/category/page.tsx
 */
import React, { useEffect, useRef, useState } from "react";
import { Fieldset } from "primereact/fieldset";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Panel } from "primereact/panel";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

interface DataList {
  subcat: string;
  subname: string;
  catdtld: string;
  itemname: string;
  describe: string;
  pricetag: number;
}
interface Category {
  catgid: string;
  catego: string;
  breed: string;
  parent: string;
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
interface Optionz {
  subcat: string;
  subname: string;
  countz: number;
}

export default function CategoryPage() {
  const toast = useRef<Toast>(null);

  const [dataList, setDataList] = useState<DataList[]>([]);
  const [grpCategory, setGrpCategory] = useState<CategoryGroup[]>([]);
  const [subCategory, setSubCategory] = useState<Optionz[]>([]);

  const [pickedCats, setPickedCats] = useState<CategoryGroup | null>(null);
  const [pickedSub, setPickedSub] = useState<Optionz | null>(null);

  const [itemname, setItemname] = useState<string>("");
  const [itemdesc, setItemDesc] = useState<string>("");
  const [costvalue, setCostvalue] = useState<number>(0);
  const [product, setProduct] = useState<string>("");
  const [myplaceholder, setMyPlaceholder] = useState<string>("Select details");
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [disability, setDisability] = useState<boolean>(true);

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
      {}
    );
    const groupedArray: CategoryGroup[] = Object.values(grouped);
    return groupedArray;
  }

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await fetch("/property/api/departo/receipt/loadcats", {
          method: "GET",
        });
        if (!result.ok) throw new Error(`HTTP error! status: ${result.status}`);
        const data: Category[] = await result.json();
        setGrpCategory(groupCategory(data));
      } catch (error) {
        console.error("Failed to load units:", error);
      } finally {
      }
    };
    loadCategories();
  }, []);

  const loadSubCats = async (catuid: OptionDetail | null) => {
    if (!catuid) {
      setSubCategory([]);
      return;
    }

    try {
      const result = await fetch("/property/api/sysadmin/category/" + catuid, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      // if (!result.ok) throw new Error("No details available");

      const data: Optionz[] = await result.json();
      if (!data || data.length === 0) {
        setMyPlaceholder("No details available");
        setSubCategory([]);
      } else {
        setMyPlaceholder("Select details");
        setSubCategory(data);
        setDisability(true);
      }
    } catch (error) {
      console.error("Failed to load units:", error);
    } finally {
    }
  };
  const loadDatus = async (subuid: OptionDetail | null) => {
    try {
      setIsLoading(true);
      const result = await fetch(
        "/property/api/sysadmin/category?catuid=" +
          pickedCats +
          "&subcat=" +
          subuid,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      // if (!result.ok) throw new Error("No details available");

      const data: DataList[] = await result.json();
      if (!data || data.length === 0) {
        setMyPlaceholder("No details available");
        setDataList([]);
      } else {
        setMyPlaceholder("Select details");
        setDataList(data);
      }
    } catch (error) {
      console.error("Failed to load units:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubcat = async (producto: string) => {
    const butang = [...dataList];
    const index = butang.findIndex((item) => item.catdtld === producto);

    if (index === -1) return;
    try {
      setDataList([]);
      const result = await fetch(
        "/property/api/departo/receipt/datalist?parics=${icsareno}&thing=${butang[index]?.property}",
        {
          method: "DELETE",
        }
      );
      // const data = await result.json();
      if (!result.ok)
        toast.current?.show({
          severity: "error",
          summary: "Deleted",
          detail: "Failed to delete property!",
          life: 5000,
        });
    } catch (error) {
      console.error("Error removing data:", error);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Fieldset legend="Category Entry Form" style={{ width: "900px" }}>
        <Panel header="Entry for Sub-Category and its Detail" className="mb-3">
          <table cellSpacing={0} cellPadding={0} border={0}>
            <tbody>
              <tr>
                <td className="surface-border p-2">
                  <label htmlFor="unit" className="font-bold">
                    Category Name
                  </label>
                </td>
                <td valign="middle" className="surface-border p-2">
                  <label className="font-bold block"> : </label>
                </td>
                <td className="surface-border p-2">
                  <Dropdown
                    id="cats"
                    inputId="cats"
                    value={pickedCats}
                    onChange={(e: DropdownChangeEvent) => {
                      setPickedCats(e.value);
                      loadSubCats(e.value);
                    }}
                    options={grpCategory}
                    // --- GROUPING PROPS ---
                    optionValue="value"
                    optionLabel="label"
                    optionGroupLabel="label"
                    optionGroupChildren="items"
                    placeholder="Select a Category"
                    style={{ width: "455px" }}
                    scrollHeight="400px"
                    checkmark={true}
                    highlightOnSelect={true}
                    filter
                  />
                </td>
              </tr>
              <tr>
                <td className="surface-border p-2">
                  <label htmlFor="unit" className="font-bold">
                    Sub-Category
                  </label>
                </td>
                <td valign="middle" className="surface-border p-2">
                  <label className="font-bold block"> : </label>
                </td>
                <td className="surface-border p-2">
                  <Dropdown
                    id="subcat"
                    inputId="subcat"
                    value={pickedSub}
                    onChange={(e: DropdownChangeEvent) => {
                      const initEmp = subCategory.find(
                        (p) => p.subcat === e.value.subcat
                      );
                      console.log("Testing-A:", e.value);
                      console.log("Testing-B:", initEmp);
                      if (initEmp) {
                        setPickedSub(e.value);
                        loadDatus(e.value.subcat);
                        setDisability(false);
                      }
                    }}
                    options={subCategory}
                    placeholder={myplaceholder}
                    optionLabel="subname"
                    // optionValue="subcat"
                    scrollHeight="400px"
                  />
                  <Button type="submit" icon="pi pi-file" raised />
                </td>
              </tr>
              <tr>
                <td className="surface-border p-2">
                  <label htmlFor="unit" className="font-bold">
                    Item Name
                  </label>
                </td>
                <td valign="middle" className="surface-border p-2">
                  <label className="font-bold block"> : </label>
                </td>
                <td className="surface-border p-2">
                  <InputText
                    value={itemname}
                    onChange={(e) => setItemname(e.target.value)}
                    style={{ width: "455px" }}
                    disabled={disability}
                  />
                </td>
              </tr>
              <tr>
                <td valign="top" className="surface-border p-2">
                  <label htmlFor="unit" className="font-bold">
                    Description
                  </label>
                </td>
                <td valign="top" className="surface-border p-2">
                  <label className="font-bold block"> : </label>
                </td>
                <td className="surface-border p-2">
                  <InputTextarea
                    value={itemdesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    style={{ width: "455px" }}
                    cols={120}
                    rows={6}
                    disabled={disability}
                  />
                </td>
              </tr>
              <tr>
                <td className="surface-border p-2">
                  <label htmlFor="unit" className="font-bold">
                    Item Cost
                  </label>
                </td>
                <td valign="middle" className="surface-border p-2">
                  <label className="font-bold block"> : </label>
                </td>
                <td className="surface-border p-2">
                  <InputNumber
                    id="cost"
                    inputId="cost"
                    value={costvalue}
                    onValueChange={(e) => setCostvalue(e.value ?? 0.0)}
                    size={10}
                    maxLength={10}
                    min={0}
                    inputStyle={{ textAlign: "right" }}
                    readOnly={false}
                    minFractionDigits={2}
                    maxFractionDigits={2}
                    useGrouping={true}
                    disabled={disability}
                  />
                  <div style={{ float: "right" }}>
                    <Button
                      type="button"
                      label="Save/Post"
                      icon="pi pi-save"
                      onClick={() => {
                        // Add your save/post logic here
                      }}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </Panel>
        <DataTable
          value={dataList}
          tableStyle={{ minWidth: "50rem" }}
          paginator
          rows={9}
          editMode="row"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          showGridlines
          loading={isLoading}
          // title={errorMessage}
          emptyMessage="Empty data list."
          dataKey="catdtld"
        >
          <Column field="subname" header="Sub Category" />
          <Column
            field="itemname"
            header="Item Name"
            editor={(options) => (
              <InputText
                type="text"
                value={options.value}
                onChange={(e) => options.editorCallback?.(e.target.value)}
              />
            )}
          />
          <Column
            field="describe"
            header="Description"
            editor={(options) => (
              <InputText
                type="text"
                value={options.value}
                onChange={(e) => options.editorCallback?.(e.target.value)}
              />
            )}
          />
          <Column
            field="pricetag"
            header="Price"
            editor={(options) => (
              <InputNumber
                value={options.value}
                onValueChange={(e) => options.editorCallback?.(e.value)}
                mode="currency"
                currency="PHP"
                locale="en-US"
              />
            )}
            body={(lista: DataList) => {
              return new Intl.NumberFormat("en-US", {
                style: "decimal",
                currency: "PHP",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(lista.pricetag);
            }}
            align={"right"}
          />
          <Column
            header="(&#10004;&#10008;)"
            rowEditor={true}
            align={"center"}
            bodyClassName="text-center"
          />
          <Column
            header="(&#10008;)"
            align={"center"}
            body={(options) => {
              return (
                <Button
                  type="button"
                  severity="danger"
                  onClick={() => {
                    setVisible(true);
                    setProduct(options.rowData.subcatid);
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
        visible={visible}
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
              onClick={() => setVisible(false)}
            />
            <Button
              type="button"
              label="Yes"
              icon="pi pi-check"
              severity="danger"
              onClick={() => product && deleteSubcat(product)}
            />
          </React.Fragment>
        }
        onHide={() => setVisible(false)}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {product && (
            <span>
              Are you sure you want to delete <b>{product}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </>
  );
}
