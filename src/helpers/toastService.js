import { toast } from "react-toastify";
import { DEFAULT_TIMEOUT } from "../constants/constants"

export function showToast(message, type = "info", duration = DEFAULT_TIMEOUT) {
  toast(message, {
    type: type,
    autoClose: duration, // 设置消息显示的持续时间，单位是毫秒
  });
}