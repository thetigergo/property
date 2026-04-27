"use client";

import { useAuth } from "@/context/AuthContext"; // 👈 Import the hook
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { TabView, TabPanel } from "primereact/tabview";
import { Message } from "primereact/message";
import { Panel } from "primereact/panel";
import { motion } from "framer-motion";
import { ListBox } from "primereact/listbox";

const Login = () => {
  type LoginFormData = {
    userid: string;
    passkey: string;
  };

  // const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    defaultValues: {
      userid: "",
      passkey: "",
    },
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { nigamit, login } = useAuth(); // 👈 Get the global login function

  const onSubmit = async (data: LoginFormData) => {
    // setFormData(data);
    setErrorMessage(""); // clear previous error
    setIsLoading(true);

    if (activeTab === 0) {
      console.log("Data Form:", data)
      const logret = await login(data.userid, data.passkey); // Call the global login function with username and password

      //try {
      /*const response = await fetch("/property/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userid: data.userid, passkey: data.passkey }),
        });
        console.log("Login failed:", formData);*/
      /*const resp = await axios.post("/property/api/users", {
          userid: data.userid,
          passkey: data.passkey,
        });
        if (resp.status !== 200) {
          const errData = await resp.data();
          setErrorMessage(errData.error + "! Login failed");
        } else {
          const result = await resp.data.json();*/

      // --- Simulate API Response after Successful Login ---
      /*const authenticatedUserData = {
        userId: data.userid,
        pangalan: result.pangalan,
        permiso: result.permiso,
        officeId: result.officeid,
        offcode: result.offcode,
      };
      login(authenticatedUserData);*/
      if (logret === true && nigamit) {
        const rights = nigamit.permiso;
        const hasA = rights.includes("A");
        const hasB = rights.includes("B");
        const hasC = rights.includes("C");
        const has0 = rights.includes("0");
        if (hasA || hasB) {
          router.push("/ppe/sysadmin"); // or any route you want
        } else if (hasC || has0) {
          router.push("/ppe/departo"); // or any route you want
        } else {
          console.log("Rights include ?");
          setErrorMessage("Rights include ?");
        }
        setInfoMessage("Login successful!");
      } else {
        setErrorMessage("Invalid credentials. Please try again.");
      }
      //}
      /*} catch (error) {
        console.error("Error during login:", error);
        // Show error message to user
        setErrorMessage("Unknown error");
      } finally {
      */
    }
    setIsLoading(false);

    reset();
    //} else {
    // Employee login logic
    //}
  };
  const videos = [
    {
      title: "Creating your ICS or PAR Entry",
      url: "https://www.youtube.com/watch?v=lcPlvKO_fgw",
    },
    {
      title: "Second Tutorial",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      disabled: true,
    },
  ];

  return (
    <>
      {/*<div className="flex align-items-center justify-content-center min-h-screen">*/}
      <div className=" h-screen">
        <div className="container mx-auto px-6 py-8">
          <h2 className="text-4xl font-bold text-center text-green-800 dark:text-black mb-8">
            Welcome to the PPE Inventory System!
          </h2>
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/2">
              <h3 className="text-2xl text-green-800 dark:text-black font-bold">
                Purpose of this System
              </h3>
              <div className="bg-white/50 p-6 rounded-lg shadow-md space-y-4 text-lg text-black">
                <p>
                  This system helps you track, manage, and safeguard your
                  organization&#39;s physical assets — from buildings and
                  machinery to tools and equipment.
                </p>
                <p>
                  Log in to update records, monitor asset status, and ensure
                  everything is accounted for.
                </p>
                <p>
                  Whether you&#39;re overseeing maintenance, verifying asset
                  locations, or preparing reports, this platform is designed to
                  support accuracy, accountability, and operational efficiency.
                </p>
                <p>
                  Every entry you make contributes to a clearer picture of our
                  resources — helping us plan better, reduce waste, and protect
                  what matters.
                </p>
                <p>
                  Let&#39;s keep our inventory clean, reliable, and ready for
                  every audit, inspection, or decision ahead.
                </p>
              </div>
            </div>

            <div className="w-full md:w-1/2 mt-8 md:mt-0">
              <motion.div
                initial={{ borderColor: "#ccc" }}
                animate={{ borderColor: "#3b82f6" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                // style={{ backgroundColor: "wheat" }}
                className="border-5 rounded-3xl p-4 w-[400px] max-w-md mx-auto mt-10"
              >
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                  <div className="absolute inset-0 bg-linear-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                  <div className="absolute right-2 top-5 z-10">
                    <ThemeSwitcher />
                  </div>
                  <Panel
                    header="Login Form"
                    footer={
                      errorMessage ? (
                        <Message severity="error" text={errorMessage} />
                      ) : infoMessage ? (
                        <Message severity="success" text={infoMessage} />
                      ) : (
                        ""
                      )
                    }
                    className="relative  bg-white shadow-lg sm:rounded-3xl "
                  >
                    <TabView
                      activeIndex={activeTab}
                      onTabChange={(e) => setActiveTab(e.index)}
                    >
                      <TabPanel header="Personnel" leftIcon="pi pi-user">
                        <div className="login-page">
                          <div className="p-fluid">
                            <form
                              onSubmit={handleSubmit(onSubmit)}
                              className="p-fluid"
                            >
                              {/* Name Field */}
                              <div className="field">
                                <Controller
                                  name="userid"
                                  control={control}
                                  rules={{ required: "Username is required." }}
                                  render={({
                                    field: { onChange, onBlur, value, ref },
                                  }) => (
                                    <>
                                      <InputText
                                        id="username"
                                        onChange={onChange} // send value to hook form
                                        onBlur={onBlur} // notify when input is touched
                                        value={value} // return updated value
                                        ref={ref} // set ref for focus management
                                        className={errors.userid && "p-invalid"}
                                        placeholder="Type USERNAME here"
                                      />
                                      {<p style={{ height: 15 }}></p>}
                                    </>
                                  )}
                                />
                              </div>

                              {/* Password Field */}
                              <div className="field">
                                <Controller
                                  name="passkey"
                                  control={control}
                                  rules={{ required: "Password is required." }}
                                  render={({
                                    field: { onChange, onBlur, value, ref },
                                  }) => (
                                    <>
                                      <Password
                                        id="password"
                                        onChange={onChange} // send value to hook form
                                        onBlur={onBlur} // notify when input is touched
                                        value={value} // return updated value
                                        ref={ref} // set ref for focus management
                                        className={
                                          errors.passkey && "p-invalid"
                                        }
                                        toggleMask
                                        placeholder="Type PASSWORD here"
                                      />
                                      {<p style={{ height: 15 }}></p>}
                                    </>
                                  )}
                                />
                              </div>

                              <Button
                                label="Sign In"
                                type="submit"
                                icon="pi pi-sign-in"
                                rounded
                                style={{ width: 100 }}
                                loading={isLoading}
                                disabled={infoMessage ? true : false}
                              />
                            </form>
                          </div>
                        </div>
                      </TabPanel>
                      <TabPanel header="Employee" leftIcon="pi pi-briefcase">
                        <div className="login-page">
                          <div className="p-fluid">
                            <form className="p-fluid">
                              {/* Name Field */}
                              <div className="field">
                                <Controller
                                  name="userid"
                                  control={control}
                                  rules={{
                                    required: "Employee ID is required.",
                                  }}
                                  render={({
                                    field: { onChange, onBlur, value, ref },
                                  }) => (
                                    <>
                                      <Password
                                        id="empid"
                                        onChange={onChange} // send value to hook form
                                        onBlur={onBlur} // notify when input is touched
                                        value={value} // return updated value
                                        ref={ref} // set ref for focus management
                                        className={errors.userid && "p-invalid"}
                                        placeholder="Type your Employee ID here"
                                        toggleMask
                                        feedback={false}
                                      />
                                      <p style={{ height: 68 }}></p>
                                    </>
                                  )}
                                />
                              </div>

                              <Button
                                label="Sign In"
                                type="submit"
                                icon="pi pi-sign-in"
                                rounded
                                style={{ width: 100 }}
                                loading={isLoading}
                                disabled={infoMessage ? true : false}
                              />
                            </form>
                          </div>
                        </div>
                      </TabPanel>
                      <TabPanel header="Tutorials" leftIcon="pi pi-video">
                        <ListBox
                          options={videos}
                          optionLabel="title"
                          className="w-full md:w-14rem"
                          onChange={(evt) => {
                            if (typeof window !== "undefined")
                              window.open(
                                evt.value.url,
                                "_blank",
                                "noopener,noreferrer",
                              );
                          }}
                        />
                      </TabPanel>
                    </TabView>
                  </Panel>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Login;
