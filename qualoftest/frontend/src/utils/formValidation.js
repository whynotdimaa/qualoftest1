const emailPattern = /^\S+@\S+\.\S+$/;

const formatFieldName = (fieldName) => {
  const normalizedFieldName = fieldName.replaceAll("_", " ");

  return `${normalizedFieldName.charAt(0).toUpperCase()}${normalizedFieldName.slice(1)}`;
};


const toMessage = (value) => {
  if (Array.isArray(value)) {
    return value.map(toMessage).filter(Boolean).join(" ");
  }

  if (value && typeof value === "object") {
    return Object.values(value).map(toMessage).filter(Boolean).join(" ");
  }

  return value ? String(value) : "";
};

export const validateRequired = (value, fieldName) =>
  value.trim() ? "" : `${fieldName} обов'язковий`;

export const validateEmail = (value) => {
  if (value.trim().length === 0) {
    return "Email обов'язковий";
  }

  if (!emailPattern.test(value)) {
    return "Невірний формат email";
  }

  return "";
};

export const validateMinLength = (value, fieldName, minLength) =>
  value.trim().length >= minLength
    ? ""
    : `${fieldName} має містити щонайменше ${minLength} символів`;

export const validateMatch = (value, otherValue, fieldName) =>
  value === otherValue ? "" : `${fieldName} не збігається`;

export const getApiErrorMessage = (data, fallbackMessage) => {
  if (!data) {
    return fallbackMessage;
  }

  if (typeof data === "string") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(toMessage).filter(Boolean).join(" ") || fallbackMessage;
  }

  if (typeof data === "object") {
    const messages = Object.entries(data).flatMap(([fieldName, value]) => {
      const message = toMessage(value);

      if (!message) {
        return [];
      }

      if (fieldName === "detail" || fieldName === "non_field_errors") {
        return [message];
      }

      return [`${formatFieldName(fieldName)}: ${message}`];
    });

    return messages.join(" ") || fallbackMessage;
  }

  return fallbackMessage;
};
