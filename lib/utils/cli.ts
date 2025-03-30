import { esbuildResolutionToURL } from 'https://jsr.io/@luca/esbuild-deno-loader/0.11.1/src/shared.ts';
import * as Color from 'jsr:@std/fmt/colors';

function errorCLI(message: string) {
  console.error(`${Color.red(Color.bold('error'))}: ${message}`);
}

export function throwCLI(message: string) {
  errorCLI(message);
  Deno.exit(1);
}

export function helpCLI(options: {
  name: string;
  description?: string;
  usage?: string;
  options?: {
    flag: string;
    usage?: string;
  }[];
}) {
  const helpMessage = `
${Color.green(options.name)}${options.description ? `: ${options.description}` : ''}

${options.usage ? Color.blue('Usage: ') + options.usage : ''}

${options.options
      ? Color.blue('Options:\n') +
      options.options.map((opt) => `  ${opt.flag}\t${opt.usage || ''}`)
      : ''
    }
`;

  console.log(helpMessage);
}

export async function $(...args: string[]) {
  const cmd = new Deno.Command(args[0], {
    args: args.slice(1),
    stderr: 'piped',
    stdout: 'piped',
  });

  const output = await cmd.output();

  if (!output.success) {
    const error = new TextDecoder().decode(output.stderr);
    errorCLI(`${args.join(' ')} failed with error: ${error.split('\n').map((l) => '  ' + l).join('\n')}`);
    return { error, ok: false };
  } else {
    const result = new TextDecoder().decode(output.stdout);
    return { result, ok: true };
  }
}



export async function downloadFile(url: string, outputPath: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  const data = await res.arrayBuffer();
  const unit8Array = new Uint8Array(data);
  await Deno.writeFile(outputPath, unit8Array);
};