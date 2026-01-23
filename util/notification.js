import { useCallback } from "react";
import { toast } from "react-toastify";

export const notifySuccess = (message) => {
  toast.success(message, {
    icon: false,
    progressStyle: {
      background: `green`,
    },
  });
};

export const notifyError = (message) => {
  toast.error(message, {
    icon: false,
    progressStyle: {
      background: `red`,
    },
  });
};

export const notifyLoading = (message) => {
  const id = toast.loading(message);
  return id;
};

export const dismissNotify = (id) => {
  toast.dismiss(id);
};
