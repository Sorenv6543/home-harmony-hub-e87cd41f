import { defineMcp } from "@lovable.dev/mcp-js";
import getAppInfo from "./tools/get-app-info";
import estimateCleaning from "./tools/estimate-cleaning";

export default defineMcp({
  name: "claro-mcp",
  title: "Claro MCP",
  version: "0.1.0",
  instructions:
    "Public tools for Claro, a short-term rental cleaning and booking app. Use `get_app_info` to learn what Claro does and `estimate_cleaning` to get an illustrative cleaning duration and price for a property size.",
  tools: [getAppInfo, estimateCleaning],
});
