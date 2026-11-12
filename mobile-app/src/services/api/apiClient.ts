import { Platform } from 'react-native';
import { secureStorage } from '../storage/secureStorage';

export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured && configured.trim().length > 0) {
    // On Android emulator, localhost refers to the emulator itself unless mapped
    if (Platform.OS === 'android' && configured.includes('://localhost:')) {
      return configured.replace('://localhost:', '://10.0.2.2:');
    }
    return configured.replace(/\/$/, '');
  }
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api/v1'
    : 'http://localhost:5000/api/v1';
}

export class ApiClientError extends Error {
  statusCode: number;
  errors?: any[];
  isNetworkError: boolean;
  isCancelled: boolean;

  constructor(
    message: string,
    statusCode = 500,
    errors?: any[],
    options?: { isNetworkError?: boolean; isCancelled?: boolean }
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isNetworkError = Boolean(options?.isNetworkError);
    this.isCancelled = Boolean(options?.isCancelled);
  }
}

export interface ApiEnvelope<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: any[];
}

type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

export function onSessionExpired(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

let refreshPromise: Promise<string | null> | null = null;

async function performTokenRefresh(): Promise<string | null> {
  const refreshToken = await secureStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${getApiBaseUrl()}/customer/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ refreshToken, deviceInfo: `${Platform.OS}-app` })
    });

    const json = await response.json().catch(() => null);
    if (!response.ok || !json?.success || !json?.data?.accessToken || !json?.data?.refreshToken) {
      await secureStorage.clearTokens();
      unauthorizedListeners.forEach((cb) => cb());
      return null;
    }

    await secureStorage.saveTokens(json.data.accessToken, json.data.refreshToken);
    return json.data.accessToken;
  } catch {
    return null;
  }
}

async function getValidRefreshedToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  params?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  skipAuth?: boolean;
  retryOn401?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const { method = 'GET', body, params, signal, skipAuth = false, retryOn401 = true } = options;

  let url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  if (params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        search.append(k, String(v));
      }
    });
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    Accept: 'application/json'
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (!skipAuth) {
    const token = await secureStorage.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new ApiClientError('Request cancelled', 0, undefined, { isCancelled: true });
    }
    throw new ApiClientError(
      'Unable to reach LegalDost servers. Please check your internet connection.',
      0,
      undefined,
      { isNetworkError: true }
    );
  }

  if (response.status === 401 && !skipAuth && retryOn401) {
    const newToken = await getValidRefreshedToken();
    if (newToken) {
      return request<T>(path, { ...options, retryOn401: false });
    }
    unauthorizedListeners.forEach((cb) => cb());
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiClientError(
      json?.message || `Request failed with status ${response.status}`,
      response.status,
      json?.errors
    );
  }

  return json as ApiEnvelope<T>;
}

export interface UploadTaskHandle {
  promise: Promise<ApiEnvelope<any>>;
  cancel: () => void;
}

export function uploadMultipartFile(params: {
  path: string;
  file: { uri: string; name: string; type: string };
  fields?: Record<string, string>;
  onProgress?: (progress0to1: number) => void;
}): UploadTaskHandle {
  const xhr = new XMLHttpRequest();

  const promise = new Promise<ApiEnvelope<any>>(async (resolve, reject) => {
    const token = await secureStorage.getAccessToken();
    const url = `${getApiBaseUrl()}${params.path.startsWith('/') ? params.path : `/${params.path}`}`;

    xhr.open('POST', url);
    xhr.setRequestHeader('Accept', 'application/json');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && params.onProgress) {
        params.onProgress(Math.min(1, event.loaded / event.total));
      }
    };

    xhr.onload = () => {
      let json: any = null;
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        json = null;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(json as ApiEnvelope<any>);
      } else {
        reject(
          new ApiClientError(
            json?.message || `Upload failed with status ${xhr.status}`,
            xhr.status,
            json?.errors
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(
        new ApiClientError('Network error while uploading file. Please retry.', 0, undefined, {
          isNetworkError: true
        })
      );
    };

    xhr.onabort = () => {
      reject(new ApiClientError('Upload cancelled', 0, undefined, { isCancelled: true }));
    };

    const formData = new FormData();
    formData.append('file', {
      uri: params.file.uri,
      name: params.file.name,
      type: params.file.type
    } as any);

    if (params.fields) {
      Object.entries(params.fields).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, val);
        }
      });
    }

    xhr.send(formData);
  });

  return {
    promise,
    cancel: () => xhr.abort()
  };
}

export const apiClient = {
  get: <T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined | null>,
    options?: Omit<RequestOptions, 'method' | 'params'>
  ) => request<T>(path, { ...options, method: 'GET', params }),

  post: <T>(path: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),

  patch: <T>(path: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  put: <T>(path: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),

  uploadFile: uploadMultipartFile
};
