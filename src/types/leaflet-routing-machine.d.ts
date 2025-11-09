/* eslint-disable @typescript-eslint/no-explicit-any */
import * as L from "leaflet";

declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
    function plan(waypoints: any, options?: any): any;
  }
}
