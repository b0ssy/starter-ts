import axios from "axios";

import { Configuration, AuthenticationApi, AdminApi } from "./api";
import { ENV } from "../../config";
import { isJsonMime } from "../../helpers/utils";

export interface AuthOptions {
  url: string;
  rootApiKey: string;
}

export class Auth {
  options: AuthOptions;

  constructor(options: AuthOptions) {
    this.options = options;
  }

  createAxiosInstance(options?: { useRootApiKey?: boolean }) {
    const axiosInstance = axios.create();
    if (options?.useRootApiKey) {
      axiosInstance.interceptors.request.use((config) => {
        config.headers.Authorization = `Bearer ${this.options.rootApiKey}`;
        return config;
      });
    }
    return axiosInstance;
  }

  createApiConfiguration() {
    const config: Configuration = {
      isJsonMime,
      basePath: this.options.url,
    };
    return config;
  }

  createAdminApi(options?: { useRootApiKey?: boolean }) {
    return new AdminApi(
      this.createApiConfiguration(),
      undefined,
      this.createAxiosInstance({ useRootApiKey: options?.useRootApiKey })
    );
  }

  createAuthApi(options?: { useRootApiKey?: boolean }) {
    return new AuthenticationApi(
      this.createApiConfiguration(),
      undefined,
      this.createAxiosInstance({ useRootApiKey: options?.useRootApiKey })
    );
  }
}

export default new Auth({
  url: ENV.AUTH_URL,
  rootApiKey: ENV.AUTH_ROOT_API_KEY,
});
