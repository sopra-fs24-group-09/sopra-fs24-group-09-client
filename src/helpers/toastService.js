import { toast } from "react-toastify";
import { DEFAULT_TIMEOUT } from "../constants/constants"
import "styles/views/toast.scss"

export function showToast(message, type = "info", duration = DEFAULT_TIMEOUT) {
  toast(message, {
    type: type,
    autoClose: duration,
  });
}