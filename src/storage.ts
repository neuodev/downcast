import fs from "node:fs";
import path from "node:path";

export class Storage {
  constructor(private readonly outDir: string) {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }
  }

  public load<T>(query: string): null | T {
    const fileName = this.asFileName(query);
    if (!fs.existsSync(fileName)) return null;
    return JSON.parse(fs.readFileSync(fileName).toString()) as T;
  }

  public save<T>(query: string, result: T): void {
    fs.writeFileSync(this.asFileName(query), JSON.stringify(result, null, 2));
  }

  private asFileName(query: string) {
    const fileName = query.replace(/'|\s/gi, "_").toLowerCase() + ".json";
    return path.join(this.outDir, fileName);
  }
}
