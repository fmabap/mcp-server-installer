import * as vscode from 'vscode';

interface StdioServerConfig {
    name: string;
    type: 'stdio';
    command: string;
    args?: string[];
    env?: Record<string, string | number | null>;
    cwd?: string;
}

interface HttpServerConfig {
    name: string;
    type: 'http';
    url: string;
    headers?: Record<string, string>;
}

type ServerConfig = StdioServerConfig | HttpServerConfig;

const isWindows = process.platform === 'win32';

/**
 * On Windows, spawn cannot directly execute .bat/.cmd files or
 * commands like npx/npm (which are .cmd shims). Wrap with cmd.exe /c.
 */
function resolveCommand(command: string, args: string[]): { command: string; args: string[] } {
    if (!isWindows) {
        return { command, args };
    }
    const lowerCmd = command.toLowerCase();
    const needsShell =
        lowerCmd.endsWith('.bat') ||
        lowerCmd.endsWith('.cmd') ||
        ['npx', 'npm', 'yarn', 'pnpm'].includes(lowerCmd);
    if (needsShell) {
        return { command: 'cmd.exe', args: ['/c', command, ...args] };
    }
    return { command, args };
}

function readServersFromSettings(): vscode.McpServerDefinition[] {
    const config = vscode.workspace.getConfiguration('mcpServerInstaller');
    const servers = config.get<ServerConfig[]>('servers', []);

    return servers
        .filter(s => s.name && s.type)
        .map(s => {
            if (s.type === 'stdio') {
                if (!s.command) {
                    return undefined;
                }
                const resolved = resolveCommand(s.command, s.args ?? []);
                const def = new vscode.McpStdioServerDefinition(
                    s.name,
                    resolved.command,
                    resolved.args,
                    s.env ?? {}
                );
                if (s.cwd) {
                    def.cwd = vscode.Uri.file(s.cwd);
                }
                return def;
            }

            if (s.type === 'http') {
                if (!s.url) {
                    return undefined;
                }
                return new vscode.McpHttpServerDefinition(
                    s.name,
                    vscode.Uri.parse(s.url),
                    s.headers ?? {}
                );
            }

            return undefined;
        })
        .filter((d): d is vscode.McpServerDefinition => d !== undefined);
}

export function activate(context: vscode.ExtensionContext) {
    const onDidChange = new vscode.EventEmitter<void>();

    const provider: vscode.McpServerDefinitionProvider = {
        onDidChangeMcpServerDefinitions: onDidChange.event,

        provideMcpServerDefinitions(_token: vscode.CancellationToken) {
            return readServersFromSettings();
        },

        resolveMcpServerDefinition(server: vscode.McpServerDefinition, _token: vscode.CancellationToken) {
            return server;
        }
    };

    context.subscriptions.push(
        vscode.lm.registerMcpServerDefinitionProvider('mcp-server-installer', provider)
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('mcpServerInstaller.servers')) {
                onDidChange.fire();
            }
        })
    );

    context.subscriptions.push(onDidChange);
}

export function deactivate() { }
