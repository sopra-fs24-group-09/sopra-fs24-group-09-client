import axios from "axios";
import { getDomain } from "./getDomain";
import {HTTP_STATUS} from "../constants/constants"

export const api = axios.create({
  baseURL: getDomain(),
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
});

// Request interceptor
api.interceptors.request.use(function (config) {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Append token to headers if it exists
  }
  console.log("Sending request to:", config.url);
  console.log("Request headers:", config.headers);
  console.log("Request method:", config.method);
  if (config.data) {
    console.log("Request data:", config.data);
  }

  return config;
}, function (error) {
  return Promise.reject(error); // Handle request error
});

export const handleError = error => {
  const response = error.response;

  // catch 4xx and 5xx status codes
  if (response && !!`${response.status}`.match(/^[4|5]\d{2}$/)) {
    let info = `\nrequest to: ${response.request.responseURL}`;

    if (response.data.status) {
      info += `\nstatus code: ${response.data.status}`;
      info += `\nerror: ${response.data.error}`;
      info += `\nerror message: ${response.data.message}`;
    } else {
      info += `\nstatus code: ${response.status}`;
      info += `\nerror message:\n${response.data}`;
    }

    console.log("The request was made and answered but was unsuccessful.", error.response);
    
    return info;
  } else {
    if (error.message.match(/Network Error/)) {
      alert("The server cannot be reached.\nDid you start it?");
    }

    console.log("Something else happened.", error);
    
    return error.message;
  }
};
