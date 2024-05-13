export function containsSpecialChars(str) {
  const specialChars = /[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]+/g;

  return specialChars.test(str)
}

