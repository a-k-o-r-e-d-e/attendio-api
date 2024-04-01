import { VIRTUAL_COLUMN_KEY } from "./custom-decorators";

export class TypeOrmUtils {
  /** Needed to attach the virtual columns that we specified using our custom [VirtualColumn] 
     Type orm does not add the virtual columns to the entities return by queries
     but if we make a raw query, we can extract the raw results and add them to the entities
     */
  static attachVirtualColumns<T>({
    entities,
    raw,
  }: {
    entities: T[];
    raw: any[];
  }): T[] {
    const items = entities.map((entitiy, index) => {
      const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entitiy) ?? {};
      const item = raw[index];

      for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
        // @ts-ignore
        entitiy[propertyKey] = item[name];
      }

      return entitiy;
    });

    return [...items];
  }
}
