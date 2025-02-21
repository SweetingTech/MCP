import axios, { AxiosInstance } from 'axios';
import {
  ApiResponse,
  ServerListResponse,
  ServerStatus,
  McpServerConfig,
  AddServerRequest,
  UpdateServerRequest,
} from './types';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Server Management
  async getServers(): Promise<ApiResponse<ServerListResponse>> {
    const response = await this.client.get<ApiResponse<ServerListResponse>>('/servers');
    return response.data;
  }

  async getServer(name: string): Promise<ApiResponse<McpServerConfig>> {
    const response = await this.client.get<ApiResponse<McpServerConfig>>(`/servers/${name}`);
    return response.data;
  }

  async addServer(request: AddServerRequest): Promise<ApiResponse> {
    const response = await this.client.post<ApiResponse>('/servers', request);
    return response.data;
  }

  async updateServer(name: string, request: UpdateServerRequest): Promise<ApiResponse> {
    const response = await this.client.put<ApiResponse>(`/servers/${name}`, request);
    return response.data;
  }

  async deleteServer(name: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/servers/${name}`);
    return response.data;
  }

  // Server Status Management
  async getServerStatus(name: string): Promise<ApiResponse<ServerStatus>> {
    const response = await this.client.get<ApiResponse<ServerStatus>>(`/servers/${name}/status`);
    return response.data;
  }

  async enableServer(name: string): Promise<ApiResponse> {
    const response = await this.client.post<ApiResponse>(`/servers/${name}/enable`);
    return response.data;
  }

  async disableServer(name: string): Promise<ApiResponse> {
    const response = await this.client.post<ApiResponse>(`/servers/${name}/disable`);
    return response.data;
  }

  // Backup Management
  async listBackups(): Promise<ApiResponse<string[]>> {
    const response = await this.client.get<ApiResponse<string[]>>('/backups');
    return response.data;
  }

  async restoreBackup(name: string): Promise<ApiResponse> {
    const response = await this.client.post<ApiResponse>(`/backups/${name}/restore`);
    return response.data;
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
