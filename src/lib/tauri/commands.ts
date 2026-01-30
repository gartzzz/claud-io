/**
 * Typed Tauri command wrappers for Claud.io
 */

import { invoke } from '@tauri-apps/api/core';
import type { ClaudeStateData } from '../store/types';
import type { TerminalSession } from '@/types/terminal';
import type { Project, ProjectFile, GitStatus } from '@/types/project';
import type { Agent, Task, TaskLog, AgentConfig, AgentType } from '@/types/agent';
import type { Carousel, CarouselSlide, CopyRequest, CopyResult } from '@/types/content';

// ============================================================================
// Claude State Commands
// ============================================================================

export async function getClaudeState(): Promise<ClaudeStateData> {
  return invoke('get_claude_state');
}

export async function checkStateFileExists(): Promise<boolean> {
  return invoke('check_state_file_exists');
}

export async function getStateFilePath(): Promise<string> {
  return invoke('get_state_file_path');
}

// ============================================================================
// Terminal Commands
// ============================================================================

interface SessionInfo {
  id: string;
  title: string;
  created_at: number;
  is_active: boolean;
}

export async function terminalCreateSession(
  cols: number = 80,
  rows: number = 24,
  command?: string
): Promise<TerminalSession> {
  const info = await invoke<SessionInfo>('terminal_create_session', {
    cols,
    rows,
    command,
  });
  return {
    id: info.id,
    title: info.title,
    createdAt: info.created_at,
    isActive: info.is_active,
    shell: command || '/bin/zsh',
    cwd: '/',
  };
}

export async function terminalWriteInput(
  sessionId: string,
  data: Uint8Array | string
): Promise<void> {
  const bytes = typeof data === 'string'
    ? Array.from(new TextEncoder().encode(data))
    : Array.from(data);
  return invoke('terminal_write_input', { sessionId, data: bytes });
}

export async function terminalResize(
  sessionId: string,
  cols: number,
  rows: number
): Promise<void> {
  return invoke('terminal_resize', { sessionId, cols, rows });
}

export async function terminalKillSession(sessionId: string): Promise<void> {
  return invoke('terminal_kill_session', { sessionId });
}

export async function terminalListSessions(): Promise<TerminalSession[]> {
  const sessions = await invoke<SessionInfo[]>('terminal_list_sessions');
  return sessions.map((info) => ({
    id: info.id,
    title: info.title,
    createdAt: info.created_at,
    isActive: info.is_active,
    shell: '/bin/zsh',
    cwd: '/',
  }));
}

export async function terminalSetActive(sessionId: string): Promise<void> {
  return invoke('terminal_set_active', { sessionId });
}

export async function terminalGetActive(): Promise<string | null> {
  return invoke('terminal_get_active');
}

// ============================================================================
// Project Commands
// ============================================================================

export async function projectList(): Promise<Project[]> {
  return invoke('project_list');
}

export async function projectAdd(
  path: string,
  projectType: string = 'code'
): Promise<Project> {
  return invoke('project_add', { path, projectType });
}

export async function projectRemove(projectId: string): Promise<void> {
  return invoke('project_remove', { projectId });
}

export async function projectGetFileTree(projectId: string): Promise<ProjectFile> {
  return invoke('project_get_file_tree', { projectId });
}

export async function projectReadFile(path: string): Promise<string> {
  return invoke('project_read_file', { path });
}

export async function projectWriteFile(path: string, content: string): Promise<void> {
  return invoke('project_write_file', { path, content });
}

export async function projectGitStatus(projectId: string): Promise<GitStatus | null> {
  return invoke('project_git_status', { projectId });
}

export async function projectGitCommit(
  projectId: string,
  message: string,
  files?: string[]
): Promise<void> {
  return invoke('project_git_commit', { projectId, message, files });
}

// ============================================================================
// Agent Commands
// ============================================================================

export async function agentList(): Promise<Agent[]> {
  return invoke('agent_list');
}

export async function agentCreate(
  config: Partial<AgentConfig> & { name: string; type: AgentType }
): Promise<Agent> {
  return invoke('agent_create', { config });
}

export async function agentUpdate(
  agentId: string,
  updates: Partial<Agent>
): Promise<void> {
  return invoke('agent_update', { agentId, updates });
}

export async function agentDelete(agentId: string): Promise<void> {
  return invoke('agent_delete', { agentId });
}

export async function agentStart(agentId: string): Promise<void> {
  return invoke('agent_start', { agentId });
}

export async function agentStop(agentId: string): Promise<void> {
  return invoke('agent_stop', { agentId });
}

export async function agentPause(agentId: string): Promise<void> {
  return invoke('agent_pause', { agentId });
}

export async function agentGetLogs(
  agentId: string,
  limit: number = 100
): Promise<TaskLog[]> {
  return invoke('agent_get_logs', { agentId, limit });
}

// ============================================================================
// Task Commands
// ============================================================================

export async function taskList(agentId?: string): Promise<Task[]> {
  return invoke('task_list', { agentId });
}

export async function taskCreate(task: Omit<Task, 'logs'>): Promise<Task> {
  return invoke('task_create', { task });
}

export async function taskCancel(taskId: string): Promise<void> {
  return invoke('task_cancel', { taskId });
}

export async function taskGet(taskId: string): Promise<Task> {
  return invoke('task_get', { taskId });
}

// ============================================================================
// Content Commands
// ============================================================================

export async function contentListCarousels(): Promise<Carousel[]> {
  return invoke('content_list_carousels');
}

export async function contentGenerateCopy(request: CopyRequest): Promise<CopyResult> {
  return invoke('content_generate_copy', { request });
}

export async function contentGenerateCarousel(
  carouselId: string,
  topic: string
): Promise<CarouselSlide[]> {
  return invoke('content_generate_carousel', { carouselId, topic });
}

export async function contentExportCarousel(
  carouselId: string,
  format: 'png' | 'pdf'
): Promise<string> {
  return invoke('content_export_carousel', { carouselId, format });
}

export async function contentListCopyResults(): Promise<CopyResult[]> {
  return invoke('content_list_copy_results');
}
