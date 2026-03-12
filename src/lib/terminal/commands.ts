import { resolvePath, getNode } from './filesystem';

export interface TerminalState {
	cwd: string;
}

export type CommandResult =
	| { type: 'output'; text: string; newState: TerminalState }
	| { type: 'clear'; newState: TerminalState };

const HELP_TEXT = `Available commands:
  help      show this help message
  whoami    who is this guy
  pwd       print working directory
  ls        list directory contents
  ls -la    list with details
  cd <dir>  change directory
  cat <f>   print file contents
  echo      repeat arguments
  date      current date and time
  neofetch  system info
  clear     clear the terminal
  sudo      nope
  vim       please no`;

const NEOFETCH = `
        ██████████        matt@portfolio
       ████████████       ──────────────
      ██  ████  ████      OS: portfolio v1.0.0
     ████  ██  ██████     Host: matthuesman.com
    ████████████████      Kernel: SvelteKit 2 + Svelte 5
    ████████████████      CPU: ARM Cortex-M4 (favorite)
    ██████  ██  ████      GPU: Xilinx Artix-7 FPGA
     ████  ████  ██       Memory: enough
      ██████████████      Shell: this one
       ████████████       Languages: C C++ Python TS SV
        ██████████        Theme: deep space`;

function formatDir(path: string): string {
	const node = getNode(path);
	if (!node || node.type !== 'dir') return '';
	return Object.entries(node.children)
		.map(([name, child]) => (child.type === 'dir' ? name + '/' : name))
		.join('  ');
}

function formatDirLong(path: string): string {
	const node = getNode(path);
	if (!node || node.type !== 'dir') return '';
	const entries = Object.entries(node.children).map(([name, child]) => {
		const isDir = child.type === 'dir';
		const perm = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
		const size = isDir ? '4096' : String((child as { type: 'file'; content: string }).content.length);
		const padded = size.padStart(6);
		return `${perm}  1  matt  matt  ${padded}  Jan 01 00:00  ${isDir ? name + '/' : name}`;
	});
	return `total ${entries.length}\n` + entries.join('\n');
}

export function dispatch(input: string, state: TerminalState): CommandResult {
	const trimmed = input.trim();
	const [cmd, ...args] = trimmed.split(/\s+/);

	switch (cmd) {
		case '':
			return output('', state);

		case 'help':
			return output(HELP_TEXT, state);

		case 'whoami':
			return output(
				`matt — Computer Engineering student @ University of Minnesota.\nBuilding things at the intersection of hardware and software.`,
				state
			);

		case 'pwd':
			return output(state.cwd, state);

		case 'ls': {
			const flag = args[0];
			const pathArg = flag?.startsWith('-') ? args[1] : args[0];
			const targetPath = pathArg ? resolvePath(state.cwd, pathArg) : state.cwd;
			const node = getNode(targetPath);
			if (!node) return output(`ls: ${pathArg}: No such file or directory`, state);
			if (node.type !== 'dir') return output(`ls: ${pathArg}: Not a directory`, state);
			const text = flag === '-la' || flag === '-l' ? formatDirLong(targetPath) : formatDir(targetPath);
			return output(text || '(empty)', state);
		}

		case 'cd': {
			if (!args[0] || args[0] === '~') {
				return output('', { cwd: '/home/matt' });
			}
			const targetPath = resolvePath(state.cwd, args[0]);
			const node = getNode(targetPath);
			if (!node) return output(`cd: ${args[0]}: No such file or directory`, state);
			if (node.type !== 'dir') return output(`cd: ${args[0]}: Not a directory`, state);
			return output('', { cwd: targetPath });
		}

		case 'cat': {
			if (!args[0]) return output('cat: missing file operand', state);
			const targetPath = resolvePath(state.cwd, args[0]);
			const node = getNode(targetPath);
			if (!node) return output(`cat: ${args[0]}: No such file or directory`, state);
			if (node.type === 'dir') return output(`cat: ${args[0]}: Is a directory`, state);
			return output(node.content, state);
		}

		case 'echo':
			return output(args.join(' '), state);

		case 'date':
			return output(new Date().toString(), state);

		case 'clear':
			return { type: 'clear', newState: state };

		case 'neofetch':
			return output(NEOFETCH, state);

		case 'sudo':
			return output('Nice try.', state);

		case 'vim':
		case 'vi':
		case 'nano':
			return output(`${cmd}: Type :q to exit.  (Just kidding — there's no way out.)`, state);

		case 'exit':
		case 'quit':
			return output('There is no escape.', state);

		case 'ls-la':
			return output(`Command not found: '${cmd}'. Did you mean 'ls -la'?`, state);

		default:
			return output(`command not found: ${cmd}\nType 'help' for available commands.`, state);
	}
}

function output(text: string, state: TerminalState): CommandResult {
	return { type: 'output', text, newState: state };
}
