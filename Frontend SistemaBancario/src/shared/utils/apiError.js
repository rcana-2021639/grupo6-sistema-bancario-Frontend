const extractValidationErrors = (errors) => {
  if (!Array.isArray(errors)) return [];

  return errors
    .map((item) => {
      if (typeof item === 'string') return item;
      return item?.message || item?.msg || item?.error || '';
    })
    .filter(Boolean);
};

export const getApiErrorMessage = (errorLike, fallbackMessage = 'Error en la solicitud') => {
  if (
    errorLike?.name === 'TypeError'
    || errorLike?.code === 'ERR_NETWORK'
    || /failed to fetch|network error/i.test(errorLike?.message || '')
  ) {
    return 'No se pudo conectar con el servidor. Verifica que el servicio este activo.';
  }

  const payload = errorLike?.response?.data || errorLike?.data || errorLike;
  const messages = [
    ...extractValidationErrors(payload?.errors),
    payload?.error,
    payload?.message,
    errorLike?.message,
  ].filter(Boolean);

  const message = messages[0] || fallbackMessage;
  const blockedFields = payload?.blockedFields;

  if (Array.isArray(blockedFields) && blockedFields.length > 0) {
    return `${message}: ${blockedFields.join(', ')}`;
  }

  return message;
};

export const normalizeApiError = (errorLike, fallbackMessage = 'Error en la solicitud') => {
  const error = new Error(getApiErrorMessage(errorLike, fallbackMessage));
  error.status = errorLike?.response?.status || errorLike?.status;
  error.data = errorLike?.response?.data || errorLike?.data;
  error.blockedFields = error.data?.blockedFields || [];
  return error;
};

export const parseFetchResponse = async (response, fallbackMessage = 'Error en la solicitud') => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw normalizeApiError({ status: response.status, data }, fallbackMessage);
  }

  return data;
};
