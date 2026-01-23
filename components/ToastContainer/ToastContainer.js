import React from "react";
import { Flip, ToastContainer as ToastComponent } from "react-toastify";

const ToastContainer = () => {
  return (
    <ToastComponent
      position="bottom-right"
      autoClose={2500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      closeButton={false}
      rtl={false}
      pauseOnHover={false}
      pauseOnFocusLoss={false}
      draggable={false}
      theme="dark"
      toastStyle={{
        borderRadius: "0px",
        color: "#fff",
        backgroundColor: "#2150f6",
        fontSize: "1rem",
        fontWeight: "bold",
      }}
      transition={Flip}
    />
  );
};

export default ToastContainer;
