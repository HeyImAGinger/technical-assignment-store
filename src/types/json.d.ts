type JSONPrimitive = string | number | boolean | null;

type JSONValue = JSONPrimitive | JSONArray | JSONObject;

interface JSONObject {
  [key: string]: JSONValue;
}

type JSONArray = JSONValue[];
