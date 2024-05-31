import _ from "lodash";
import { snakeToCamel } from ".";

export function isArray(o: unknown) {
  return Array.isArray(o);
}

export function isObject(o: unknown) {
  return o === Object(o) && !isArray(o) && typeof o !== "function";
}

export function snakeToCamelObject(o: any) {
  if (isObject(o)) {
    const n = {};

    Object.keys(o).forEach((k) => {
      n[snakeToCamel(k)] = snakeToCamelObject(o[k]);
    });

    return n;
  } else if (isArray(o)) {
    return o.map((i) => {
      return snakeToCamelObject(i);
    });
  }

  return o;
}
