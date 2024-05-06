import { toast } from 'react-toastify';

export function showToast(message, type = 'info', duration = 1500) {
  toast(message, {
    type: type,
    autoClose: duration, // 设置消息显示的持续时间，单位是毫秒
  });
}