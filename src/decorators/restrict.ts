export function Restrict(permission: Permission = "none") {
  return function (targer: any, propertyKey: string) {
    Reflect.defineMetadata(
      process.env.METADATA_FILE_PATH,
      permission,
      targer,
      propertyKey
    );
  };
}
