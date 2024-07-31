import "reflect-metadata";

interface IStore {
  defaultPolicy: Permission;
  allowedToRead(key: string): boolean;
  allowedToWrite(key: string): boolean;
  read(path: string): StoreResult;
  write(path: string, value: StoreValue): StoreValue;
  writeEntries(entries: JSONObject): void;
  entries(): JSONObject;
}

const ALLOWED_READ_POLICIES = ["rw", "r"];
const ALLOWED_WRITE_POLICIES = ["rw", "w"];

type StoreResult = Store | JSONPrimitive | undefined;
type StoreValue = JSONObject | JSONArray | StoreResult | (() => StoreResult);

export class Store implements IStore {
  [key: string]: any;
  defaultPolicy: Permission = "rw";

  private getPermission(key: string): Permission {
    return (
      Reflect.getMetadata(process.env.METADATA_FILE_PATH, this, key) ||
      this.defaultPolicy
    );
  }

  allowedToRead(key: string): boolean {
    return ALLOWED_READ_POLICIES.includes(this.getPermission(key));
  }

  allowedToWrite(key: string): boolean {
    return ALLOWED_WRITE_POLICIES.includes(this.getPermission(key));
  }

  read(path: string): StoreResult {
    const [key, ...rest] = path.split(":");

    const current = this;

    if (current instanceof Store && !this.allowedToRead(key)) {
      throw new Error(`Permission denied to read key: ${key}`);
    }

    if (rest.length > 0) {
      if (typeof current[key] === "function") {
        return current[key]().read(rest.join(":"));
      } else {
        return current[key].read(rest.join(":"));
      }
    }

    if (typeof current[key] === "function") {
      return current[key]();
    } else {
      return current[key];
    }
  }

  write(path: string, value: StoreValue): StoreValue {
    if (typeof value === "object") {
      const store = new Store();
      store.writeEntries(value as JSONObject);
      value = store;
    }

    const keys = path.split(":");
    let current = this;
    keys.forEach((key, index) => {
      if (typeof current[key] !== "object" || !current.allowedToRead(key)) {
        if (current instanceof Store && !current.allowedToWrite(key)) {
          throw new Error(`Permission denied to write key: ${key}`);
        }
      }
      if (index === keys.length - 1) {
        current[key] = value;
      } else {
        if (!current[key]) {
          current[key] = new Store();
        }
        current = current[key];
      }
    });
    return value;
  }

  writeEntries(entries: JSONObject): void {
    for (const [key, value] of Object.entries(entries)) {
      this.write(key, value);
    }
  }

  entries(): JSONObject {
    const entries: JSONObject = {};

    for (const [key, value] of Object.entries(this)) {
      if (!this.allowedToRead(key)) continue;

      entries[key] = value;
    }

    return entries;
  }
}
