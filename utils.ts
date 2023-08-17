export function getEnvironmentVarible(name: string) {
  const value = Deno.env.get(name);

  if (!value) throw new Error(`Missing environment variable ${name}`);

  return value;
}

export function read(filename: string) {
  return Deno.readTextFile(filename);
}

export function write(filename: string, content: any) {
  Deno.writeTextFile(filename, JSON.stringify(content, null, 2));
}
